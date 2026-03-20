import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getAbstract, updateAbstract, updateAbstractStatus, listReviews, getAverageScore } from '@/lib/db/abstracts';
import { isOrganizer } from '@/lib/auth/permissions';

interface RouteContext {
  params: Promise<{ congressId: string; abstractId: string }>;
}

// ── Schemas ──────────────────────────────────────────────────────────

const authorSchema = z.object({
  name: z.string().min(1),
  affiliation: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  is_presenter: z.boolean().default(false),
  sort_order: z.number().int().nonnegative().default(0),
});

const updateAbstractSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  abstract_text: z.string().min(1).max(3000).optional(),
  presentation_type: z.enum(['oral', 'poster', 'either'] as const).optional(),
  keywords: z.array(z.string().min(1)).min(3).max(6).optional(),
  authors: z.array(authorSchema).min(1).optional(),
  track_id: z.string().nullable().optional(),
  // Organizer-only status update
  status: z.enum(['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'revision_requested'] as const).optional(),
});

// ── GET /api/congress/[congressId]/abstracts/[abstractId] ───────────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, abstractId } = await context.params;

  try {
    const abstract = await getAbstract(db, abstractId);
    if (!abstract || abstract.congress_id !== congressId) {
      return ERRORS.NOT_FOUND('Abstract not found');
    }

    // Non-organizers can only see their own abstracts
    if (!isOrganizer(auth.role) && abstract.user_id !== auth.userId) {
      return ERRORS.FORBIDDEN();
    }

    // Include reviews and average score for organizers
    if (isOrganizer(auth.role)) {
      const [reviews, avgScore] = await Promise.all([
        listReviews(db, abstractId),
        getAverageScore(db, abstractId),
      ]);
      return success({ abstract, reviews, averageScore: avgScore });
    }

    return success({ abstract });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── PATCH /api/congress/[congressId]/abstracts/[abstractId] ─────────

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, abstractId } = await context.params;

  const abstract = await getAbstract(db, abstractId);
  if (!abstract || abstract.congress_id !== congressId) {
    return ERRORS.NOT_FOUND('Abstract not found');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = updateAbstractSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    // Status update: organizer only
    if (input.status) {
      if (!isOrganizer(auth.role)) {
        return ERRORS.FORBIDDEN('Only organizers can update abstract status');
      }
      await updateAbstractStatus(db, abstractId, input.status);
    }

    // Content update: only by author, and only if draft or revision_requested
    const contentFields = {
      title: input.title,
      body: input.abstract_text,
      presentation_type: input.presentation_type,
      keywords: input.keywords,
      authors: input.authors?.map((a, i) => ({
        name: a.name,
        affiliation: a.affiliation ?? null,
        email: a.email ?? null,
        is_presenter: a.is_presenter,
        sort_order: a.sort_order ?? i,
      })),
      track_id: input.track_id,
    };

    const hasContentUpdate = Object.values(contentFields).some((v) => v !== undefined);

    if (hasContentUpdate) {
      // Only author can update content
      if (abstract.user_id !== auth.userId && !isOrganizer(auth.role)) {
        return ERRORS.FORBIDDEN('Only the author can update abstract content');
      }
      // Can only edit draft or revision_requested abstracts
      if (abstract.status !== 'draft' && abstract.status !== 'revision_requested') {
        return ERRORS.VALIDATION_ERROR('Abstract can only be edited in draft or revision_requested status');
      }

      // Map abstract_text -> body for DB layer
      const dbInput: Record<string, unknown> = {};
      if (input.title !== undefined) dbInput.title = input.title;
      if (input.abstract_text !== undefined) dbInput.body = input.abstract_text;
      if (input.presentation_type !== undefined) dbInput.presentation_type = input.presentation_type;
      if (input.keywords !== undefined) dbInput.keywords = input.keywords;
      if (input.track_id !== undefined) dbInput.track_id = input.track_id;
      if (contentFields.authors !== undefined) dbInput.authors = contentFields.authors;

      await updateAbstract(db, abstractId, dbInput as Parameters<typeof updateAbstract>[2]);
    }

    const updated = await getAbstract(db, abstractId);
    return success({ abstract: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── DELETE /api/congress/[congressId]/abstracts/[abstractId] ─────────

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, abstractId } = await context.params;

  try {
    const abstract = await getAbstract(db, abstractId);
    if (!abstract || abstract.congress_id !== congressId) {
      return ERRORS.NOT_FOUND('Abstract not found');
    }

    // Only author or organizer can withdraw
    if (abstract.user_id !== auth.userId && !isOrganizer(auth.role)) {
      return ERRORS.FORBIDDEN();
    }

    // Can only withdraw if draft or submitted
    if (abstract.status !== 'draft' && abstract.status !== 'submitted') {
      return ERRORS.VALIDATION_ERROR('Abstract can only be withdrawn if in draft or submitted status');
    }

    // Soft delete: mark as rejected with withdrawal note
    await updateAbstractStatus(db, abstractId, 'rejected', 'Withdrawn by author');

    return success({ withdrawn: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
