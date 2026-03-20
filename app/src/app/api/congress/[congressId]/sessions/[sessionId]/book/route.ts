import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getSession } from '@/lib/db/sessions';
import { getRegistration } from '@/lib/db/registrations';
import { getFirst, getAll, run, generateId } from '@/lib/db/client';
import type { SessionBooking } from '@/types';

interface RouteContext {
  params: Promise<{ congressId: string; sessionId: string }>;
}

// ── Row type ─────────────────────────────────────────────────────────

interface BookingRow {
  session_id: string;
  user_id: string;
  status: string;
  booked_at: string;
}

// ── POST /api/congress/[congressId]/sessions/[sessionId]/book ────────

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, sessionId } = await context.params;

  try {
    // Validate session exists and belongs to congress
    const session = await getSession(db, sessionId);
    if (!session || session.congress_id !== congressId) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    if (!session.is_bookable) {
      return ERRORS.VALIDATION_ERROR('This session does not accept bookings');
    }

    // User must be registered for the congress
    const registration = await getRegistration(db, congressId, auth.userId);
    if (!registration || registration.status === 'cancelled') {
      return ERRORS.FORBIDDEN('You must be registered for this congress');
    }

    // Check for existing booking
    const existing = await getFirst<BookingRow>(
      db.prepare(
        "SELECT * FROM session_bookings WHERE session_id = ? AND user_id = ? AND status != 'cancelled'"
      ).bind(sessionId, auth.userId)
    );
    if (existing) {
      return ERRORS.CONFLICT('You already have a booking for this session');
    }

    // Check capacity
    let bookingStatus: 'confirmed' | 'waitlist' = 'confirmed';
    if (session.max_attendees) {
      const countRow = await getFirst<{ count: number }>(
        db.prepare(
          "SELECT COUNT(*) as count FROM session_bookings WHERE session_id = ? AND status = 'confirmed'"
        ).bind(sessionId)
      );
      const confirmedCount = countRow?.count ?? 0;

      if (confirmedCount >= session.max_attendees) {
        bookingStatus = 'waitlist';
      }
    }

    await run(
      db.prepare(
        `INSERT INTO session_bookings (session_id, user_id, status, booked_at)
         VALUES (?, ?, ?, datetime('now'))`
      ).bind(sessionId, auth.userId, bookingStatus)
    );

    // Fetch created booking
    const booking = await getFirst<BookingRow>(
      db.prepare(
        'SELECT * FROM session_bookings WHERE session_id = ? AND user_id = ?'
      ).bind(sessionId, auth.userId)
    );

    return success(
      {
        booking,
        message: bookingStatus === 'waitlist'
          ? 'Session is full. You have been added to the waitlist.'
          : 'Booking confirmed.',
      },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) {
      return ERRORS.CONFLICT('You already have a booking for this session');
    }
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── DELETE /api/congress/[congressId]/sessions/[sessionId]/book ──────

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, sessionId } = await context.params;

  try {
    // Validate session
    const session = await getSession(db, sessionId);
    if (!session || session.congress_id !== congressId) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    // Find existing booking
    const existing = await getFirst<BookingRow>(
      db.prepare(
        "SELECT * FROM session_bookings WHERE session_id = ? AND user_id = ? AND status != 'cancelled'"
      ).bind(sessionId, auth.userId)
    );
    if (!existing) {
      return ERRORS.NOT_FOUND('No active booking found');
    }

    const wasCancelled = existing.status;

    // Cancel the booking
    await run(
      db.prepare(
        "UPDATE session_bookings SET status = 'cancelled' WHERE session_id = ? AND user_id = ?"
      ).bind(sessionId, auth.userId)
    );

    // If cancelling a confirmed booking, auto-promote first waitlisted
    if (wasCancelled === 'confirmed') {
      const nextWaitlisted = await getFirst<BookingRow>(
        db.prepare(
          "SELECT * FROM session_bookings WHERE session_id = ? AND status = 'waitlist' ORDER BY booked_at ASC LIMIT 1"
        ).bind(sessionId)
      );

      if (nextWaitlisted) {
        await run(
          db.prepare(
            "UPDATE session_bookings SET status = 'confirmed' WHERE session_id = ? AND user_id = ?"
          ).bind(sessionId, nextWaitlisted.user_id)
        );
      }
    }

    return success({ cancelled: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
