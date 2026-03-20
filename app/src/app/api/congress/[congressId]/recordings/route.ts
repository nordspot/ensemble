import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, paginated, ERRORS } from '@/lib/api/response';
import { getAll, generateId } from '@/lib/db/client';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ──────────────────────────────────────────────────────────────

const createRecordingSchema = z.object({
  session_id: z.string().min(1),
  video_url: z.string().url().optional(),
  audio_url: z.string().url().optional(),
  slides_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
  status: z.enum(['processing', 'ready', 'failed', 'archived']).optional(),
});

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Row types ────────────────────────────────────────────────────────────

interface RecordingRow {
  id: string;
  session_id: string;
  congress_id: string;
  video_url: string | null;
  audio_url: string | null;
  slides_url: string | null;
  duration_seconds: number | null;
  status: string;
  created_at: string;
  session_title: string | null;
  speaker_names: string | null;
}

// ── GET /api/congress/[congressId]/recordings ────────────────────────────

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10);
  const sessionId = url.searchParams.get('sessionId');
  const status = url.searchParams.get('status') ?? 'ready';

  try {
    let query = `
      SELECT r.*,
             s.title as session_title,
             GROUP_CONCAT(p.full_name, ', ') as speaker_names
      FROM recordings r
      LEFT JOIN sessions s ON s.id = r.session_id
      LEFT JOIN session_speakers ss ON ss.session_id = r.session_id
      LEFT JOIN profiles p ON p.id = ss.user_id
      WHERE r.congress_id = ?
        AND r.status = ?
    `;
    const binds: unknown[] = [congressId, status];

    if (sessionId) {
      query += ' AND r.session_id = ?';
      binds.push(sessionId);
    }

    query += ' GROUP BY r.id ORDER BY r.created_at DESC';

    // Count
    const countResult = await db
      .prepare(
        `SELECT COUNT(*) as total FROM recordings WHERE congress_id = ? AND status = ?${sessionId ? ' AND session_id = ?' : ''}`,
      )
      .bind(...(sessionId ? [congressId, status, sessionId] : [congressId, status]))
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Paginate
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;
    binds.push(pageSize, offset);

    const recordings = await getAll<RecordingRow>(
      db.prepare(query).bind(...binds),
    );

    return paginated(
      recordings.map((r) => ({
        id: r.id,
        sessionId: r.session_id,
        title: r.session_title ?? 'Untitled',
        speaker: r.speaker_names ?? '',
        videoUrl: r.video_url,
        audioUrl: r.audio_url,
        slidesUrl: r.slides_url,
        duration: r.duration_seconds,
        status: r.status,
        createdAt: r.created_at,
      })),
      total,
      page,
      pageSize,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── POST /api/congress/[congressId]/recordings ───────────────────────────

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

  if (!auth) return ERRORS.UNAUTHORIZED();
  if (!isOrganizer(auth.role)) return ERRORS.FORBIDDEN('Organizer role required');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createRecordingSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(
      parsed.error.issues.map((i) => i.message).join(', '),
    );
  }

  const input = parsed.data;

  try {
    // Verify session belongs to congress
    const session = await db
      .prepare('SELECT id FROM sessions WHERE id = ? AND congress_id = ?')
      .bind(input.session_id, congressId)
      .first<{ id: string }>();

    if (!session) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    const id = generateId();
    await db
      .prepare(
        `INSERT INTO recordings (id, session_id, congress_id, video_url, audio_url, slides_url, duration_seconds, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(
        id,
        input.session_id,
        congressId,
        input.video_url ?? null,
        input.audio_url ?? null,
        input.slides_url ?? null,
        input.duration_seconds ?? null,
        input.status ?? 'processing',
      )
      .run();

    return success({ id }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
