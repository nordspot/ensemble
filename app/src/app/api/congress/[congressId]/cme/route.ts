import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import {
  listCreditTypes,
  getUserCredits,
  getEvaluation,
  submitEvaluation,
  getCertificate,
} from '@/lib/db/cme';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

const evaluationSchema = z.object({
  action: z.literal('evaluate'),
  session_id: z.string().min(1),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(2000).optional().nullable(),
  categories: z.record(z.number().min(1).max(5)).optional(),
});

/**
 * GET /api/congress/[congressId]/cme
 * Get user's CME credits and evaluations
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

  const [creditTypes, userCredits, certificate] = await Promise.all([
    listCreditTypes(db, congressId),
    getUserCredits(db, congressId, auth.userId),
    getCertificate(db, congressId, auth.userId),
  ]);

  return success({
    creditTypes,
    userCredits,
    certificate,
  });
}

/**
 * POST /api/congress/[congressId]/cme
 * Submit evaluation, award credit
 */
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

  const parsed = evaluationSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  // Check if already evaluated
  const existing = await getEvaluation(db, input.session_id, auth.userId);
  if (existing) {
    return ERRORS.CONFLICT('Session already evaluated');
  }

  const id = await submitEvaluation(db, {
    session_id: input.session_id,
    user_id: auth.userId,
    rating: input.rating,
    feedback: input.feedback,
  });

  return success({ id }, 201);
}
