import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getAbstract, listReviews, createReview, getAverageScore } from '@/lib/db/abstracts';
import { isOrganizer } from '@/lib/auth/permissions';

interface RouteContext {
  params: Promise<{ congressId: string; abstractId: string }>;
}

// ── Schemas ──────────────────────────────────────────────────────────

const scoreField = z.number().int().min(1, 'Score must be 1-5').max(5, 'Score must be 1-5');

const createReviewSchema = z.object({
  scores: z.object({
    originality: scoreField,
    methodology: scoreField,
    clarity: scoreField,
    significance: scoreField,
  }),
  recommendation: z.enum(['accept', 'minor_revision', 'major_revision', 'reject'] as const),
  comments_for_authors: z.string().max(5000).optional(),
  comments_for_committee: z.string().max(5000).optional(),
});

// ── GET /api/congress/[congressId]/abstracts/[abstractId]/reviews ────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  // Only organizers can view all reviews
  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Only organizers can view reviews');
  }

  const { congressId, abstractId } = await context.params;

  try {
    const abstract = await getAbstract(db, abstractId);
    if (!abstract || abstract.congress_id !== congressId) {
      return ERRORS.NOT_FOUND('Abstract not found');
    }

    const [reviews, avgScore] = await Promise.all([
      listReviews(db, abstractId),
      getAverageScore(db, abstractId),
    ]);

    return success({ reviews, averageScore: avgScore });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── POST /api/congress/[congressId]/abstracts/[abstractId]/reviews ───

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, abstractId } = await context.params;

  // Verify the abstract exists and belongs to this congress
  const abstract = await getAbstract(db, abstractId);
  if (!abstract || abstract.congress_id !== congressId) {
    return ERRORS.NOT_FOUND('Abstract not found');
  }

  // Reviewer must be at least a speaker (reviewer congress role checked separately)
  // or an organizer. Authors cannot review their own abstract.
  if (abstract.user_id === auth.userId) {
    return ERRORS.FORBIDDEN('Cannot review your own abstract');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    const id = await createReview(db, {
      abstract_id: abstractId,
      reviewer_id: auth.userId,
      recommendation: input.recommendation,
      score_originality: input.scores.originality,
      score_methodology: input.scores.methodology,
      score_relevance: input.scores.significance,
      score_clarity: input.scores.clarity,
      comments_to_author: input.comments_for_authors ?? null,
      comments_to_committee: input.comments_for_committee ?? null,
    });

    const reviews = await listReviews(db, abstractId);
    const avgScore = await getAverageScore(db, abstractId);

    return success({ reviewId: id, reviews, averageScore: avgScore }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) {
      return ERRORS.CONFLICT('You have already reviewed this abstract');
    }
    return ERRORS.INTERNAL_ERROR(message);
  }
}
