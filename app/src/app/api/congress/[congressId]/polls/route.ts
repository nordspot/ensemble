import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import type { PollType } from '@/types';
import { getAll } from '@/lib/db/client';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ──────────────────────────────────────────────────────────────

const createPollSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(['multiple_choice', 'scale', 'open_text', 'word_cloud'] as const),
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1)).min(2).max(10).optional(),
  closes_at: z.string().optional(),
});

const patchPollSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('vote'),
    pollId: z.string().min(1),
    answer: z.string().min(1),
  }),
  z.object({
    action: z.literal('toggle_active'),
    pollId: z.string().min(1),
  }),
  z.object({
    action: z.literal('toggle_results'),
    pollId: z.string().min(1),
  }),
]);

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Row types ────────────────────────────────────────────────────────────

interface PollRow {
  id: string;
  session_id: string;
  created_by: string;
  type: PollType;
  question: string;
  options: string; // JSON string
  is_active: number;
  show_results: number;
  closes_at: string | null;
  created_at: string;
}

interface ResponseRow {
  answer: string;
}

interface VoteCheck {
  id: string;
}

// ── GET /api/congress/[congressId]/polls ─────────────────────────────────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const pollId = url.searchParams.get('pollId');
  const type = url.searchParams.get('type');
  const auth = await getRequestAuth();

  if (!sessionId) {
    return ERRORS.VALIDATION_ERROR('sessionId query parameter required');
  }

  try {
    // Verify session belongs to congress
    const session = await db
      .prepare('SELECT id FROM sessions WHERE id = ? AND congress_id = ?')
      .bind(sessionId, congressId)
      .first<{ id: string }>();

    if (!session) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    // Word cloud results for a specific poll
    if (pollId && type === 'word_cloud') {
      const responses = await getAll<ResponseRow>(
        db.prepare('SELECT answer FROM poll_responses WHERE poll_id = ?').bind(pollId)
      );

      const wordCounts: Record<string, number> = {};
      for (const r of responses) {
        const words = r.answer
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2);
        for (const word of words) {
          wordCounts[word] = (wordCounts[word] ?? 0) + 1;
        }
      }

      const wordEntries = Object.entries(wordCounts)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      return success({ words: wordEntries });
    }

    // Get active poll for session
    const poll = await db
      .prepare(
        `SELECT * FROM polls
         WHERE session_id = ? AND is_active = 1
         ORDER BY created_at DESC
         LIMIT 1`
      )
      .bind(sessionId)
      .first<PollRow>();

    if (!poll) {
      return success({ poll: null });
    }

    // Get response counts
    const responses = await getAll<ResponseRow>(
      db.prepare('SELECT answer FROM poll_responses WHERE poll_id = ?').bind(poll.id)
    );

    const totalVotes = responses.length;
    const options: string[] = JSON.parse(poll.options || '[]');

    // Count per option
    const countMap: Record<string, number> = {};
    for (const opt of options) {
      countMap[opt] = 0;
    }
    for (const r of responses) {
      if (countMap[r.answer] !== undefined) {
        countMap[r.answer]++;
      }
    }

    // Check if current user voted
    let myVote: string | null = null;
    if (auth) {
      const existing = await db
        .prepare('SELECT answer FROM poll_responses WHERE poll_id = ? AND user_id = ?')
        .bind(poll.id, auth.userId)
        .first<{ answer: string }>();
      if (existing) {
        myVote = existing.answer;
      }
    }

    // Determine status
    const now = new Date();
    const isClosed = poll.closes_at ? new Date(poll.closes_at) < now : false;
    const status = isClosed ? 'closed' : poll.is_active ? 'active' : 'waiting';

    return success({
      poll: {
        id: poll.id,
        question: poll.question,
        type: poll.type,
        status,
        totalVotes,
        myVote,
        options: options.map((label) => ({
          label,
          count: countMap[label] ?? 0,
          percentage: totalVotes > 0
            ? ((countMap[label] ?? 0) / totalVotes) * 100
            : 0,
        })),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── POST /api/congress/[congressId]/polls ────────────────────────────────

export async function POST(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createPollSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    // Verify session belongs to congress
    const session = await db
      .prepare('SELECT id FROM sessions WHERE id = ? AND congress_id = ?')
      .bind(input.sessionId, congressId)
      .first<{ id: string }>();

    if (!session) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO polls (id, session_id, created_by, type, question, options, is_active, show_results, closes_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, datetime('now'))`
      )
      .bind(
        id,
        input.sessionId,
        auth.userId,
        input.type,
        input.question,
        JSON.stringify(input.options ?? []),
        input.closes_at ?? null
      )
      .run();

    return success({ id }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── PATCH /api/congress/[congressId]/polls ───────────────────────────────

export async function PATCH(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = patchPollSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    if (input.action === 'vote') {
      // Check already voted
      const existing = await db
        .prepare(
          'SELECT id FROM poll_responses WHERE poll_id = ? AND user_id = ?'
        )
        .bind(input.pollId, auth.userId)
        .first<VoteCheck>();

      if (existing) {
        return ERRORS.CONFLICT('Already voted on this poll');
      }

      // Verify poll is active
      const poll = await db
        .prepare('SELECT is_active, closes_at FROM polls WHERE id = ?')
        .bind(input.pollId)
        .first<{ is_active: number; closes_at: string | null }>();

      if (!poll || !poll.is_active) {
        return ERRORS.VALIDATION_ERROR('Poll is not active');
      }

      if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
        return ERRORS.VALIDATION_ERROR('Poll has closed');
      }

      const id = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO poll_responses (id, poll_id, user_id, answer, created_at)
           VALUES (?, ?, ?, ?, datetime('now'))`
        )
        .bind(id, input.pollId, auth.userId, input.answer)
        .run();

      return success({ ok: true });
    }

    // Organizer-only actions
    if (!isOrganizer(auth.role)) {
      return ERRORS.FORBIDDEN('Organizer role required');
    }

    if (input.action === 'toggle_active') {
      await db
        .prepare(
          'UPDATE polls SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?'
        )
        .bind(input.pollId)
        .run();

      return success({ ok: true });
    }

    if (input.action === 'toggle_results') {
      await db
        .prepare(
          'UPDATE polls SET show_results = CASE WHEN show_results = 1 THEN 0 ELSE 1 END WHERE id = ?'
        )
        .bind(input.pollId)
        .run();

      return success({ ok: true });
    }

    return ERRORS.VALIDATION_ERROR('Unknown action');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
