import { NextRequest, NextResponse } from 'next/server';
import { ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { isOrganizer } from '@/lib/auth/permissions';
import { getCongress } from '@/lib/db/congresses';
import { getAll } from '@/lib/db/client';
import { generateCsv } from '@/lib/export/csv';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

interface AttendeeExportRow {
  first_name: string;
  last_name: string;
  email: string;
  affiliation: string | null;
  ticket_type: string;
  status: string;
  payment_status: string;
  registered_at: string;
}

// ── GET /api/congress/[congressId]/export/attendees ──────────────────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  const { congressId } = await context.params;

  // Verify congress exists
  const congress = await getCongress(db, congressId);
  if (!congress) return ERRORS.NOT_FOUND('Congress not found');

  try {
    const rows = await getAll<AttendeeExportRow>(
      db.prepare(
        `SELECT p.first_name, p.last_name, p.email, p.affiliation,
                r.ticket_type, r.status, r.payment_status, r.registered_at
         FROM registrations r
         JOIN profiles p ON p.id = r.user_id
         WHERE r.congress_id = ?
         ORDER BY r.registered_at ASC`
      ).bind(congressId)
    );

    const headers = [
      'Name',
      'Email',
      'Organization',
      'Ticket Type',
      'Status',
      'Payment Status',
      'Registered At',
    ];

    const csvRows = rows.map((r) => [
      `${r.first_name} ${r.last_name}`.trim(),
      r.email,
      r.affiliation ?? '',
      r.ticket_type,
      r.status,
      r.payment_status,
      r.registered_at,
    ]);

    const csv = generateCsv(headers, csvRows);
    const slug = congress.slug || congressId;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="attendees-${slug}.csv"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
