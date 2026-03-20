import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getDb } from '@/lib/api/server-helpers';
import { getServerAuth } from '@/lib/auth/get-server-auth';
import { generateId } from '@/lib/db/client';

/**
 * POST /api/profile/delete-request
 *
 * GDPR Article 17: Right to erasure.
 * Initiates account deletion with a 30-day grace period.
 * During the grace period, the user can cancel the deletion by logging in.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const auth = await getServerAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) {
    return success({
      message: 'Loeschungsantrag erhalten. Konto wird in 30 Tagen geloescht.',
      scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  let body: { reason?: string } = {};
  try {
    body = (await request.json()) as { reason?: string };
  } catch {
    // Optional body
  }

  try {
    const scheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Store deletion request
    await db
      .prepare(
        `INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, created_at)
         VALUES (?, ?, 'account_deletion_request', 'profile', ?, ?, datetime('now'))`,
      )
      .bind(
        generateId(),
        auth.userId,
        auth.userId,
        JSON.stringify({
          reason: body.reason ?? '',
          scheduledDeletion: scheduledAt,
          email: auth.email,
        }),
      )
      .run();

    // Mark profile for deletion (add deletion_scheduled_at to the settings/metadata)
    // We use the existing updated_at + a convention: bio starting with [DELETION_SCHEDULED:]
    await db
      .prepare(
        `UPDATE profiles
         SET bio = '[DELETION_SCHEDULED:' || ? || '] ' || COALESCE(bio, ''),
             updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(scheduledAt, auth.userId)
      .run();

    return success({
      message: 'Loeschungsantrag erhalten. Ihr Konto wird in 30 Tagen geloescht. Melden Sie sich innerhalb dieses Zeitraums an, um die Loeschung abzubrechen.',
      scheduledDeletion: scheduledAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

/**
 * DELETE /api/profile/delete-request
 *
 * Cancel a pending deletion request.
 */
export async function DELETE(): Promise<Response> {
  const auth = await getServerAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) return success({ cancelled: true });

  try {
    // Remove deletion marker from bio
    await db
      .prepare(
        `UPDATE profiles
         SET bio = REPLACE(
           SUBSTR(bio, 1, CASE
             WHEN INSTR(bio, '] ') > 0 AND bio LIKE '[DELETION_SCHEDULED:%'
             THEN INSTR(bio, '] ') + 1
             ELSE 0
           END),
           SUBSTR(bio, 1, CASE
             WHEN INSTR(bio, '] ') > 0 AND bio LIKE '[DELETION_SCHEDULED:%'
             THEN INSTR(bio, '] ') + 1
             ELSE 0
           END),
           ''
         ),
         updated_at = datetime('now')
         WHERE id = ? AND bio LIKE '[DELETION_SCHEDULED:%'`,
      )
      .bind(auth.userId)
      .run();

    // Log cancellation
    await db
      .prepare(
        `INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, created_at)
         VALUES (?, ?, 'account_deletion_cancelled', 'profile', ?, '{}', datetime('now'))`,
      )
      .bind(generateId(), auth.userId, auth.userId)
      .run();

    return success({ cancelled: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
