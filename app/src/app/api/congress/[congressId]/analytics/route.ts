import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

/**
 * GET /api/congress/[congressId]/analytics
 * Aggregated stats (requires organizer role)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
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

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  // Run aggregation queries in parallel
  const [
    registrationCount,
    checkinCount,
    revenueResult,
    registrationsByDay,
    topSessions,
    topSpeakers,
  ] = await Promise.all([
    db
      .prepare('SELECT COUNT(*) as count FROM registrations WHERE congress_id = ?')
      .bind(congressId)
      .first<{ count: number }>(),
    db
      .prepare(
        `SELECT COUNT(*) as count FROM registrations
         WHERE congress_id = ? AND confirmed_at IS NOT NULL`
      )
      .bind(congressId)
      .first<{ count: number }>(),
    db
      .prepare(
        `SELECT COALESCE(SUM(amount_cents), 0) as total
         FROM registrations WHERE congress_id = ? AND payment_status = 'paid'`
      )
      .bind(congressId)
      .first<{ total: number }>(),
    db
      .prepare(
        `SELECT DATE(registered_at) as date, COUNT(*) as count
         FROM registrations WHERE congress_id = ?
         GROUP BY DATE(registered_at) ORDER BY date ASC`
      )
      .bind(congressId)
      .all<{ date: string; count: number }>(),
    db
      .prepare(
        `SELECT s.id, s.title, COUNT(sb.id) as attendance
         FROM sessions s
         LEFT JOIN session_bookings sb ON sb.session_id = s.id
         WHERE s.congress_id = ?
         GROUP BY s.id ORDER BY attendance DESC LIMIT 10`
      )
      .bind(congressId)
      .all<{ id: string; title: string; attendance: number }>(),
    db
      .prepare(
        `SELECT p.full_name as name,
                COUNT(DISTINCT ss.session_id) as sessions,
                COALESCE(AVG(se.rating), 0) as rating
         FROM session_speakers ss
         JOIN profiles p ON p.id = ss.user_id
         JOIN sessions s ON s.id = ss.session_id AND s.congress_id = ?
         LEFT JOIN session_evaluations se ON se.session_id = ss.session_id
         GROUP BY ss.user_id ORDER BY rating DESC LIMIT 10`
      )
      .bind(congressId)
      .all<{ name: string; sessions: number; rating: number }>(),
  ]);

  const totalRegs = registrationCount?.count ?? 0;
  const totalCheckins = checkinCount?.count ?? 0;
  const engagement = totalRegs > 0 ? Math.round((totalCheckins / totalRegs) * 100) : 0;

  return success({
    totalRegistrations: totalRegs,
    totalCheckins,
    revenue: revenueResult?.total ?? 0,
    engagementScore: engagement,
    registrationsByDay: registrationsByDay?.results ?? [],
    topSessions: topSessions?.results ?? [],
    referralFunnel: { invites: 0, clicks: 0, conversions: 0 },
    topSpeakers: topSpeakers?.results ?? [],
  });
}
