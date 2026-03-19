import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getAll } from '@/lib/db/client';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ──────────────────────────────────────────────────────────────

const submitQuestionSchema = z.object({
  sessionId: z.string().min(1),
  body: z.string().min(1).max(500),
  is_anonymous: z.boolean().optional().default(false),
});

const patchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('upvote'),
    questionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('mark_answered'),
    questionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('hide'),
    questionId: z.string().min(1),
  }),
]);

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Row types ────────────────────────────────────────────────────────────

interface QuestionRow {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  is_anonymous: number;
  is_answered: number;
  is_approved: number;
  upvote_count: number;
  answered_at: string | null;
  created_at: string;
  author_name: string | null;
}

// ── GET /api/congress/[congressId]/qa ────────────────────────────────────

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

    const questions = await getAll<QuestionRow>(
      db.prepare(
        `SELECT q.*,
                CASE WHEN q.is_anonymous = 1 THEN NULL
                     ELSE (p.first_name || ' ' || p.last_name)
                END as author_name
         FROM qa_questions q
         LEFT JOIN profiles p ON p.id = q.user_id
         WHERE q.session_id = ?
         AND q.is_approved = 1
         ORDER BY q.upvote_count DESC, q.created_at ASC`
      ).bind(sessionId)
    );

    return success({
      questions: questions.map((q) => ({
        ...q,
        is_anonymous: Boolean(q.is_anonymous),
        is_answered: Boolean(q.is_answered),
        is_approved: Boolean(q.is_approved),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── POST /api/congress/[congressId]/qa ───────────────────────────────────

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = submitQuestionSchema.safeParse(body);
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
        `INSERT INTO qa_questions (id, session_id, user_id, body, is_anonymous, is_answered, is_approved, upvote_count, created_at)
         VALUES (?, ?, ?, ?, ?, 0, 1, 0, datetime('now'))`
      )
      .bind(id, input.sessionId, auth.userId, input.body, input.is_anonymous ? 1 : 0)
      .run();

    return success({ id }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── PATCH /api/congress/[congressId]/qa ──────────────────────────────────

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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    if (input.action === 'upvote') {
      // Check if already voted
      const existing = await db
        .prepare(
          'SELECT 1 FROM qa_upvotes WHERE question_id = ? AND user_id = ?'
        )
        .bind(input.questionId, auth.userId)
        .first();

      if (existing) {
        return ERRORS.CONFLICT('Already voted');
      }

      await db.batch([
        db
          .prepare(
            `INSERT INTO qa_upvotes (question_id, user_id, created_at)
             VALUES (?, ?, datetime('now'))`
          )
          .bind(input.questionId, auth.userId),
        db
          .prepare(
            'UPDATE qa_questions SET upvote_count = upvote_count + 1 WHERE id = ?'
          )
          .bind(input.questionId),
      ]);

      return success({ ok: true });
    }

    // Moderator-only actions
    if (!isOrganizer(auth.role)) {
      return ERRORS.FORBIDDEN('Organizer role required');
    }

    if (input.action === 'mark_answered') {
      await db
        .prepare(
          "UPDATE qa_questions SET is_answered = 1, answered_at = datetime('now') WHERE id = ?"
        )
        .bind(input.questionId)
        .run();

      return success({ ok: true });
    }

    if (input.action === 'hide') {
      await db
        .prepare('UPDATE qa_questions SET is_approved = 0 WHERE id = ?')
        .bind(input.questionId)
        .run();

      return success({ ok: true });
    }

    return ERRORS.VALIDATION_ERROR('Unknown action');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
