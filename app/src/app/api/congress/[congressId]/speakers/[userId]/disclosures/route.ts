import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getSpeakerDisclosure, upsertSpeakerDisclosure } from '@/lib/db/speakers';
import { isOrganizer } from '@/lib/auth/permissions';

interface RouteContext {
  params: Promise<{ congressId: string; userId: string }>;
}

/**
 * GET /api/congress/[congressId]/speakers/[userId]/disclosures
 * Returns the speaker's disclosure for this congress.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, userId } = await context.params;

  // Only the speaker themselves or organizers can view disclosures
  if (auth.userId !== userId && !isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN();
  }

  const disclosure = await getSpeakerDisclosure(db, congressId, userId);

  return success(disclosure);
}

const disclosureSchema = z.object({
  has_conflicts: z.boolean(),
  disclosures: z
    .array(
      z.object({
        company: z.string().min(1),
        relationship_type: z.string().min(1),
        details: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),
});

/**
 * POST /api/congress/[congressId]/speakers/[userId]/disclosures
 * Upsert the speaker's conflict-of-interest disclosure.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId, userId } = await context.params;

  // Only the speaker themselves can submit their disclosure
  if (auth.userId !== userId) {
    return ERRORS.FORBIDDEN('Nur der Referent selbst kann seine Offenlegung einreichen');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = disclosureSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { has_conflicts, disclosures } = parsed.data;

  // Build disclosure text and company list from structured data
  const disclosureText = disclosures.length > 0
    ? disclosures
        .map((d) => `${d.company} (${d.relationship_type}): ${d.details}`)
        .join('\n')
    : null;

  const companies = disclosures.map((d) => d.company);

  const id = await upsertSpeakerDisclosure(
    db,
    congressId,
    userId,
    has_conflicts,
    disclosureText,
    companies,
  );

  // Re-fetch to return the full record
  const disclosure = await getSpeakerDisclosure(db, congressId, userId);

  return success({ id, ...disclosure });
}
