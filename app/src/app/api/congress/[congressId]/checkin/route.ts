import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { createCheckin, getCheckin } from '@/lib/db/checkins';
import { getRegistration } from '@/lib/db/registrations';
import { getSession } from '@/lib/db/sessions';
import { generateId } from '@/lib/db/client';
import { run } from '@/lib/db/client';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Schema ───────────────────────────────────────────────────────────

const checkinSchema = z.object({
  sessionId: z.string().optional(),
  method: z.enum(['beacon_auto', 'nfc_badge', 'qr_scan', 'manual'] as const),
  beaconId: z.string().optional(),
});

// ── POST /api/congress/[congressId]/checkin ──────────────────────────

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const { sessionId, method, beaconId } = parsed.data;

  try {
    // Validate: user is registered for congress
    const registration = await getRegistration(db, congressId, auth.userId);
    if (!registration || registration.status === 'cancelled') {
      return ERRORS.FORBIDDEN('You must be registered for this congress to check in');
    }

    // If session-specific check-in, validate session
    if (sessionId) {
      const session = await getSession(db, sessionId);
      if (!session || session.congress_id !== congressId) {
        return ERRORS.NOT_FOUND('Session not found');
      }

      // Validate time window: allow check-in 15 min before start through end
      const now = new Date();
      const sessionStart = new Date(session.start_time);
      const sessionEnd = new Date(session.end_time);
      const earlyWindow = new Date(sessionStart.getTime() - 15 * 60 * 1000);

      if (now < earlyWindow) {
        return ERRORS.VALIDATION_ERROR('Session check-in is not yet open (opens 15 min before start)');
      }
      if (now > sessionEnd) {
        return ERRORS.VALIDATION_ERROR('Session has already ended');
      }
    }

    // Prevent duplicate check-in
    const existing = await getCheckin(db, congressId, sessionId ?? null, auth.userId);
    if (existing) {
      return ERRORS.CONFLICT('Already checked in');
    }

    // Create check-in
    const checkinId = await createCheckin(db, {
      congress_id: congressId,
      session_id: sessionId ?? null,
      user_id: auth.userId,
      method,
      beacon_id: beaconId ?? null,
    });

    // Award gamification points (20 for check-in)
    const pointsId = generateId();
    const description = sessionId ? 'Session check-in' : 'Congress check-in';
    await run(
      db.prepare(
        `INSERT INTO points_ledger (id, congress_id, user_id, points, reason, reference_id, description, created_at)
         VALUES (?, ?, ?, 20, 'checkin', ?, ?, datetime('now'))`
      ).bind(pointsId, congressId, auth.userId, checkinId, description)
    );

    // Return the check-in record
    const checkin = await getCheckin(db, congressId, sessionId ?? null, auth.userId);
    return success({ checkin, pointsAwarded: 20 }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) {
      return ERRORS.CONFLICT('Already checked in');
    }
    return ERRORS.INTERNAL_ERROR(message);
  }
}
