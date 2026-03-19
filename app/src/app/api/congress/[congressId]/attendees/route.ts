import { NextRequest } from 'next/server';
import { paginated, ERRORS } from '@/lib/api/response';
import { getCongress } from '@/lib/db/congresses';
import { isOrganizer } from '@/lib/auth/permissions';
import { getAll, getFirst } from '@/lib/db/client';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface AttendeeRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  ticket_type: string;
  status: string;
  payment_status: string;
  checked_in: number;
  registered_at: string;
}

interface CountRow {
  count: number;
}

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// GET /api/congress/[congressId]/attendees
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

  // Verify congress exists and user has access
  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  if (auth.organizationId !== congress.organization_id && auth.role !== 'admin' && auth.role !== 'superadmin') {
    return ERRORS.FORBIDDEN();
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? '20')));
  const search = url.searchParams.get('search')?.trim() ?? '';
  const ticketType = url.searchParams.get('ticket_type') ?? '';
  const status = url.searchParams.get('status') ?? '';

  try {
    let whereClause = 'WHERE r.congress_id = ?';
    const bindings: unknown[] = [congressId];

    if (search) {
      whereClause += " AND (p.first_name || ' ' || p.last_name LIKE ? OR p.email LIKE ?)";
      const searchPattern = `%${search}%`;
      bindings.push(searchPattern, searchPattern);
    }

    if (ticketType) {
      whereClause += ' AND r.ticket_type = ?';
      bindings.push(ticketType);
    }

    if (status) {
      whereClause += ' AND r.status = ?';
      bindings.push(status);
    }

    // Count
    const countRow = await getFirst<CountRow>(
      db.prepare(
        `SELECT COUNT(*) as count
         FROM registrations r
         JOIN profiles p ON p.id = r.user_id
         ${whereClause}`
      ).bind(...bindings)
    );
    const total = countRow?.count ?? 0;

    // Fetch attendees with profile data
    const offset = (page - 1) * pageSize;
    const rows = await getAll<AttendeeRow>(
      db.prepare(
        `SELECT
           r.id,
           r.user_id,
           COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as full_name,
           p.email,
           r.ticket_type,
           r.status,
           r.payment_status,
           CASE WHEN EXISTS (
             SELECT 1 FROM checkins c WHERE c.registration_id = r.id
           ) THEN 1 ELSE 0 END as checked_in,
           r.registered_at
         FROM registrations r
         JOIN profiles p ON p.id = r.user_id
         ${whereClause}
         ORDER BY r.registered_at DESC
         LIMIT ? OFFSET ?`
      ).bind(...bindings, pageSize, offset)
    );

    const attendees = rows.map((row) => ({
      ...row,
      checked_in: !!row.checked_in,
    }));

    return paginated(attendees, total, page, pageSize);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
