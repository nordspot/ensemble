import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getDb } from '@/lib/api/server-helpers';
import { parseJson } from '@/lib/db/client';

interface RouteContext {
  params: Promise<{ congressId: string; sessionId: string }>;
}

interface TranscriptRow {
  id: string;
  session_id: string;
  language: string;
  segments: string | null;
  full_text: string | null;
  summary: string | null;
  keywords: string;
  created_at: string;
}

interface TranscriptSegment {
  id: string;
  timestamp: number;
  text: string;
  speaker: string | null;
}

// ── GET /api/congress/[congressId]/sessions/[sessionId]/transcript ────

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId, sessionId } = await context.params;

  try {
    // Verify session belongs to congress
    const session = await db
      .prepare('SELECT id, status FROM sessions WHERE id = ? AND congress_id = ?')
      .bind(sessionId, congressId)
      .first<{ id: string; status: string }>();

    if (!session) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    // Get transcript
    const transcript = await db
      .prepare(
        `SELECT id, session_id, language, segments, full_text, summary, keywords, created_at
         FROM transcripts
         WHERE session_id = ? AND congress_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .bind(sessionId, congressId)
      .first<TranscriptRow>();

    if (!transcript) {
      return success({ segments: [], isLive: session.status === 'live' });
    }

    const segments = parseJson<TranscriptSegment[]>(transcript.segments, []);

    // Check for SSE stream request (live sessions)
    const url = new URL(request.url);
    const stream = url.searchParams.get('stream');

    if (stream === '1' && session.status === 'live') {
      // Return SSE stream for live transcript updates
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        start(controller) {
          // Send initial segments
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'init', segments })}\n\n`,
            ),
          );

          // Keep-alive every 30s (the DO or transcription service pushes new segments)
          const keepAlive = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(': keepalive\n\n'));
            } catch {
              clearInterval(keepAlive);
            }
          }, 30000);

          // Clean up after 5 minutes max (client should reconnect)
          setTimeout(() => {
            clearInterval(keepAlive);
            try {
              controller.close();
            } catch {
              // already closed
            }
          }, 300000);
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    return success({
      segments,
      summary: transcript.summary,
      keywords: parseJson<string[]>(transcript.keywords, []),
      isLive: session.status === 'live',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
