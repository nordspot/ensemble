import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Validation ────────────────────────────────────────────────

const createContactSchema = z.object({
  contactUserId: z.string().min(1),
});

// ── GET /api/congress/[congressId]/contacts ────────────────────

/**
 * List the authenticated user's contacts for this congress.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();
  const { congressId } = await context.params;

  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  const { results } = await db
    .prepare(
      `SELECT
        c.id,
        c.contact_user_id,
        c.created_at,
        p.full_name,
        p.avatar_url,
        p.organization,
        p.job_title
      FROM congress_contacts c
      LEFT JOIN profiles p ON p.user_id = c.contact_user_id
      WHERE c.congress_id = ? AND c.user_id = ?
      ORDER BY c.created_at DESC`,
    )
    .bind(congressId, auth.userId)
    .all();

  return success(results ?? []);
}

// ── POST /api/congress/[congressId]/contacts ──────────────────

/**
 * Create a contact (from NFC tap or QR scan).
 * Bidirectional: creates the relationship for both users.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();
  const { congressId } = await context.params;

  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createContactSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const { contactUserId } = parsed.data;

  // Cannot add yourself
  if (contactUserId === auth.userId) {
    return ERRORS.VALIDATION_ERROR('Cannot add yourself as a contact.');
  }

  // Check if already exists (either direction)
  const existing = await db
    .prepare(
      `SELECT id FROM congress_contacts
      WHERE congress_id = ? AND user_id = ? AND contact_user_id = ?`,
    )
    .bind(congressId, auth.userId, contactUserId)
    .first();

  if (existing) {
    return ERRORS.CONFLICT('Contact already exists.');
  }

  // Create bidirectional contacts
  const now = new Date().toISOString();
  const idA = crypto.randomUUID();
  const idB = crypto.randomUUID();

  await db.batch([
    db
      .prepare(
        `INSERT INTO congress_contacts (id, congress_id, user_id, contact_user_id, created_at)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(idA, congressId, auth.userId, contactUserId, now),
    db
      .prepare(
        `INSERT INTO congress_contacts (id, congress_id, user_id, contact_user_id, created_at)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(idB, congressId, contactUserId, auth.userId, now),
  ]);

  return success({ id: idA, contactUserId, createdAt: now }, 201);
}
