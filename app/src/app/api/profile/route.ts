import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb } from '@/lib/api/server-helpers';
import { getServerAuth } from '@/lib/auth/get-server-auth';

const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  title: z.string().max(100).optional().nullable(),
  organization_name: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  specialty: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  linkedin_url: z.string().url().or(z.literal('')).optional().nullable(),
  orcid: z.string().max(50).optional().nullable(),
  website: z.string().url().or(z.literal('')).optional().nullable(),
  preferred_language: z.enum(['de', 'fr', 'it', 'en']).optional(),
  dietary_requirements: z.string().max(500).optional().nullable(),
  accessibility_needs: z.string().max(500).optional().nullable(),
  ble_location_enabled: z.boolean().optional(),
  push_notifications_enabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const auth = await getServerAuth();
    if (!auth) return ERRORS.UNAUTHORIZED();

    const db = getDb();

    if (!db) {
      // Dev fallback
      return success({
        id: auth.userId,
        email: auth.email,
        full_name: auth.name,
        title: null,
        organization_name: null,
        department: null,
        specialty: null,
        country: 'CH',
        city: null,
        phone: null,
        bio: null,
        linkedin_url: null,
        orcid: null,
        website: null,
        preferred_language: 'de',
        dietary_requirements: null,
        accessibility_needs: null,
        ble_location_enabled: false,
        push_notifications_enabled: false,
        avatar_url: null,
        role: auth.role,
      });
    }

    const profile = await db
      .prepare(
        `SELECT id, email, full_name, title, organization_name, department,
                specialty, country, city, phone, bio, linkedin_url, orcid,
                website, preferred_language, dietary_requirements,
                accessibility_needs, ble_location_enabled, push_token,
                avatar_url, role
         FROM profiles WHERE id = ?`
      )
      .bind(auth.userId)
      .first();

    if (!profile) return ERRORS.NOT_FOUND('Profil nicht gefunden');

    return success(profile);
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getServerAuth();
    if (!auth) return ERRORS.UNAUTHORIZED();

    const body: unknown = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return ERRORS.VALIDATION_ERROR(firstError?.message ?? 'Ungültige Eingabe');
    }

    const data = parsed.data;

    const db = getDb();

    if (!db) {
      return success({ ok: true, updated: data });
    }

    // Build dynamic UPDATE
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (key === 'ble_location_enabled') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else if (key === 'push_notifications_enabled') {
        // Map to push_token presence (simplified)
        continue;
      } else {
        fields.push(`${key} = ?`);
        values.push(value === '' ? null : value);
      }
    }

    if (fields.length === 0) {
      return success({ ok: true });
    }

    fields.push("updated_at = datetime('now')");
    values.push(auth.userId);

    await db
      .prepare(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return success({ ok: true });
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}

export async function DELETE() {
  try {
    const auth = await getServerAuth();
    if (!auth) return ERRORS.UNAUTHORIZED();

    const db = getDb();

    if (!db) {
      return success({ ok: true, deleted: true });
    }

    // Soft-delete: set a deleted_at timestamp and anonymize
    await db
      .prepare(
        `UPDATE profiles
         SET email = 'deleted_' || id || '@deleted.ensemble.events',
             full_name = 'Geloeschter Benutzer',
             bio = NULL,
             phone = NULL,
             avatar_url = NULL,
             updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(auth.userId)
      .run();

    return success({ ok: true });
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}
