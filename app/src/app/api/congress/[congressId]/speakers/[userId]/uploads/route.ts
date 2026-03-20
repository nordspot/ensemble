import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getSpeakerDisclosure } from '@/lib/db/speakers';
import { isOrganizer } from '@/lib/auth/permissions';
import { generateId } from '@/lib/db/client';

interface RouteContext {
  params: Promise<{ congressId: string; userId: string }>;
}

interface UploadRow {
  id: string;
  congress_id: string;
  user_id: string;
  r2_key: string;
  filename: string;
  content_type: string;
  file_type: string;
  file_size: number | null;
  session_id: string | null;
  created_at: string;
}

/**
 * GET /api/congress/[congressId]/speakers/[userId]/uploads
 * List uploaded files (presentations, slides) for this speaker.
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

  // Only the speaker themselves or organizers can view uploads
  if (auth.userId !== userId && !isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN();
  }

  const result = await db
    .prepare(
      `SELECT id, congress_id, user_id, r2_key, filename, content_type, file_type, file_size, session_id, created_at
       FROM speaker_uploads
       WHERE congress_id = ? AND user_id = ?
       ORDER BY created_at DESC`,
    )
    .bind(congressId, userId)
    .all<UploadRow>();

  return success(result.results);
}

const uploadSchema = z.object({
  r2_key: z.string().min(1),
  filename: z.string().min(1).max(255),
  content_type: z.string().min(1),
  file_type: z.enum(['presentation', 'slides', 'handout', 'other']).optional().default('presentation'),
  file_size: z.number().optional(),
  session_id: z.string().optional(),
});

/**
 * POST /api/congress/[congressId]/speakers/[userId]/uploads
 * Record a file upload for a speaker.
 * Requires that the speaker's disclosure has been submitted first.
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

  // Only the speaker themselves can upload their files
  if (auth.userId !== userId) {
    return ERRORS.FORBIDDEN('Nur der Referent selbst kann Dateien hochladen');
  }

  // Validate: disclosure must be submitted before presentation upload
  const disclosure = await getSpeakerDisclosure(db, congressId, userId);
  if (!disclosure) {
    return ERRORS.VALIDATION_ERROR(
      'Bitte reichen Sie zuerst Ihre Offenlegung ein, bevor Sie Praesentationen hochladen',
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { r2_key, filename, content_type, file_type, file_size, session_id } = parsed.data;

  const id = generateId();

  await db
    .prepare(
      `INSERT INTO speaker_uploads (id, congress_id, user_id, r2_key, filename, content_type, file_type, file_size, session_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(id, congressId, userId, r2_key, filename, content_type, file_type, file_size ?? null, session_id ?? null)
    .run();

  return success(
    {
      id,
      congress_id: congressId,
      user_id: userId,
      r2_key,
      filename,
      content_type,
      file_type,
      file_size: file_size ?? null,
      session_id: session_id ?? null,
    },
    201,
  );
}
