import { ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { generateCertificateHtml } from '@/lib/pdf/renderer';

interface RouteContext {
  params: Promise<{ congressId: string; userId: string }>;
}

interface CertificateData {
  full_name: string;
  congress_name: string;
  total_credits: number;
  cme_type: string | null;
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const { congressId, userId } = await context.params;

  // Only allow user to see their own certificate, or organizers
  if (auth.userId !== userId && auth.role !== 'organizer' && auth.role !== 'admin' && auth.role !== 'superadmin') {
    return ERRORS.FORBIDDEN('Nur eigene Zertifikate einsehbar');
  }

  try {
    // Get user, congress, and total CME credits earned
    const data = await db
      .prepare(
        `SELECT
           p.full_name,
           c.name as congress_name,
           COALESCE(SUM(s.cme_credits), 0) as total_credits,
           MAX(s.cme_type) as cme_type
         FROM profiles p
         CROSS JOIN congresses c
         LEFT JOIN checkins ci ON ci.user_id = p.id AND ci.congress_id = c.id AND ci.session_id IS NOT NULL
         LEFT JOIN sessions s ON s.id = ci.session_id AND s.cme_credits > 0
         WHERE p.id = ? AND c.id = ?
         GROUP BY p.id, c.id`,
      )
      .bind(userId, congressId)
      .first<CertificateData>();

    if (!data) {
      return ERRORS.NOT_FOUND('Keine Daten gefunden');
    }

    if (data.total_credits <= 0) {
      return ERRORS.VALIDATION_ERROR('Keine Fortbildungspunkte erworben');
    }

    // Generate verification code from userId + congressId
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(`${userId}:${congressId}:${data.total_credits}`),
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verificationCode = hashArray
      .slice(0, 6)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const html = generateCertificateHtml({
      name: data.full_name ?? 'Teilnehmer',
      congressName: data.congress_name,
      credits: data.total_credits,
      creditType: data.cme_type ?? 'CME',
      verificationCode,
      date: new Date().toLocaleDateString('de-CH'),
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
