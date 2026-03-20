import { success, ERRORS } from '@/lib/api/response';
import { getDb } from '@/lib/api/server-helpers';
import { getServerAuth } from '@/lib/auth/get-server-auth';
import { getAll } from '@/lib/db/client';

/**
 * GET /api/profile/export
 *
 * GDPR Article 20: Right to data portability.
 * Downloads all personal data as a JSON file.
 */
export async function GET(): Promise<Response> {
  const auth = await getServerAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) {
    // Dev fallback
    const exportData = {
      profile: { id: auth.userId, email: auth.email, name: auth.name },
      exportedAt: new Date().toISOString(),
      note: 'Database not available in dev mode',
    };
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ensemble-export-${auth.userId.slice(0, 8)}.json"`,
      },
    });
  }

  try {
    // Gather all personal data
    const profile = await db
      .prepare(
        `SELECT id, email, full_name, title, organization_name, department,
                specialty, country, city, phone, bio, linkedin_url, orcid,
                website, preferred_language, dietary_requirements,
                accessibility_needs, avatar_url, role, created_at, updated_at
         FROM profiles WHERE id = ?`,
      )
      .bind(auth.userId)
      .first();

    const registrations = await getAll(
      db
        .prepare(
          `SELECT r.id, r.congress_id, c.name as congress_name, r.ticket_type,
                  r.status, r.payment_status, r.created_at
           FROM registrations r
           LEFT JOIN congresses c ON c.id = r.congress_id
           WHERE r.user_id = ?`,
        )
        .bind(auth.userId),
    );

    const checkins = await getAll(
      db
        .prepare(
          `SELECT ci.id, ci.congress_id, ci.session_id, s.title as session_title,
                  ci.method, ci.checked_in_at, ci.checked_out_at
           FROM checkins ci
           LEFT JOIN sessions s ON s.id = ci.session_id
           WHERE ci.user_id = ?`,
        )
        .bind(auth.userId),
    );

    const bookings = await getAll(
      db
        .prepare(
          `SELECT sb.id, sb.session_id, s.title as session_title, sb.status, sb.created_at
           FROM session_bookings sb
           LEFT JOIN sessions s ON s.id = sb.session_id
           WHERE sb.user_id = ?`,
        )
        .bind(auth.userId),
    );

    const contacts = await getAll(
      db
        .prepare(
          `SELECT c.id, c.congress_id, c.contact_user_id,
                  p.full_name as contact_name, c.notes, c.created_at
           FROM contacts c
           LEFT JOIN profiles p ON p.id = c.contact_user_id
           WHERE c.user_id = ?`,
        )
        .bind(auth.userId),
    );

    const questions = await getAll(
      db
        .prepare(
          `SELECT id, session_id, body, is_anonymous, is_answered, created_at
           FROM qa_questions WHERE user_id = ?`,
        )
        .bind(auth.userId),
    );

    const notifications = await getAll(
      db
        .prepare(
          `SELECT id, congress_id, title, body, notification_type, is_read, sent_at
           FROM notifications WHERE user_id = ?
           ORDER BY sent_at DESC LIMIT 500`,
        )
        .bind(auth.userId),
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile,
      registrations,
      checkins,
      sessionBookings: bookings,
      contacts,
      qaQuestions: questions,
      notifications,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ensemble-export-${auth.userId.slice(0, 8)}.json"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
