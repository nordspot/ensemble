import { ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { generateBadgeHtml } from '@/lib/pdf/renderer';

interface RouteContext {
  params: Promise<{ congressId: string; registrationId: string }>;
}

interface RegistrationRow {
  id: string;
  ticket_type: string;
  full_name: string;
  organization_name: string | null;
  congress_name: string;
}

const TICKET_COLORS: Record<string, string> = {
  vip: '#8B5CF6',
  speaker: '#F59E0B',
  exhibitor: '#10B981',
  standard: '#3B82F6',
  early_bird: '#3B82F6',
  student: '#6366F1',
  day_pass: '#64748B',
  virtual: '#0EA5E9',
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const { congressId, registrationId } = await context.params;

  try {
    const row = await db
      .prepare(
        `SELECT r.id, r.ticket_type,
                p.full_name, p.organization_name,
                c.name as congress_name
         FROM registrations r
         JOIN profiles p ON p.id = r.user_id
         JOIN congresses c ON c.id = r.congress_id
         WHERE r.id = ? AND r.congress_id = ?`,
      )
      .bind(registrationId, congressId)
      .first<RegistrationRow>();

    if (!row) {
      return ERRORS.NOT_FOUND('Registrierung nicht gefunden');
    }

    // Generate QR data URL (simple text-based -- real impl would use a QR library)
    const qrData = `https://ensemble.events/checkin/${registrationId}`;
    // Placeholder SVG QR code (in production, use a QR generation lib or worker)
    const qrSvg = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><text x="50" y="55" text-anchor="middle" font-size="8" font-family="monospace">${registrationId.slice(0, 8)}</text></svg>`,
    )}`;

    const html = generateBadgeHtml({
      name: row.full_name ?? 'Teilnehmer',
      org: row.organization_name ?? '',
      ticketType: row.ticket_type,
      qrDataUrl: qrSvg,
      congressName: row.congress_name,
      roleColor: TICKET_COLORS[row.ticket_type] ?? TICKET_COLORS.standard,
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
