import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { isOrganizer } from '@/lib/auth/permissions';
import { ingestContent } from '@/lib/knowledge/pipeline';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

const ingestSchema = z.object({
  sourceType: z.enum(['transcript', 'article', 'abstract', 'poster', 'slide', 'podcast']),
  sourceId: z.string().min(1),
});

/** Source content lookup queries by type. */
const SOURCE_QUERIES: Record<string, { query: string; textCol: string; titleCol: string; speakerCol?: string; sessionCol?: string }> = {
  transcript: {
    query: `SELECT t.id, t.full_text, s.title as session_title,
              COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as speaker_name
            FROM transcripts t
            LEFT JOIN sessions s ON t.session_id = s.id
            LEFT JOIN session_speakers ss ON ss.session_id = s.id
            LEFT JOIN profiles p ON p.id = ss.user_id
            WHERE t.id = ? AND (s.congress_id = ? OR t.congress_id = ?)`,
    textCol: 'full_text',
    titleCol: 'session_title',
    speakerCol: 'speaker_name',
    sessionCol: 'session_title',
  },
  article: {
    query: `SELECT id, content_text, title FROM articles WHERE id = ? AND congress_id = ?`,
    textCol: 'content_text',
    titleCol: 'title',
  },
  abstract: {
    query: `SELECT a.id, a.abstract_text, a.title,
              COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as author_name
            FROM abstracts a
            LEFT JOIN profiles p ON p.id = a.submitter_id
            WHERE a.id = ? AND a.congress_id = ?`,
    textCol: 'abstract_text',
    titleCol: 'title',
    speakerCol: 'author_name',
  },
  poster: {
    query: `SELECT id, content_text, title FROM posters WHERE id = ? AND congress_id = ?`,
    textCol: 'content_text',
    titleCol: 'title',
  },
  slide: {
    query: `SELECT id, extracted_text as content_text, title FROM slides WHERE id = ? AND congress_id = ?`,
    textCol: 'content_text',
    titleCol: 'title',
  },
  podcast: {
    query: `SELECT id, transcript_text, title FROM podcasts WHERE id = ? AND congress_id = ?`,
    textCol: 'transcript_text',
    titleCol: 'title',
  },
};

/**
 * POST /api/congress/[congressId]/knowledge/ingest
 * Ingest a source document into the knowledge pipeline. Organizer only.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();
  if (!isOrganizer(auth.role)) return ERRORS.FORBIDDEN();

  const { congressId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { sourceType, sourceId } = parsed.data;

  const sourceConfig = SOURCE_QUERIES[sourceType];
  if (!sourceConfig) {
    return ERRORS.VALIDATION_ERROR(`Unsupported source type: ${sourceType}`);
  }

  // Look up the source content from D1
  const bindArgs = sourceType === 'transcript'
    ? [sourceId, congressId, congressId]
    : [sourceId, congressId];

  const sourceRow = await db
    .prepare(sourceConfig.query)
    .bind(...bindArgs)
    .first<Record<string, string | null>>();

  if (!sourceRow) {
    return ERRORS.NOT_FOUND(`Source ${sourceType} with id ${sourceId} not found`);
  }

  const text = sourceRow[sourceConfig.textCol];
  if (!text) {
    return ERRORS.VALIDATION_ERROR('Source has no text content to ingest');
  }

  const result = await ingestContent({
    congressId,
    sourceType,
    sourceId,
    sourceTitle: sourceRow[sourceConfig.titleCol] ?? `${sourceType} ${sourceId}`,
    speakerName: sourceConfig.speakerCol ? (sourceRow[sourceConfig.speakerCol] ?? undefined) : undefined,
    sessionTitle: sourceConfig.sessionCol ? (sourceRow[sourceConfig.sessionCol] ?? undefined) : undefined,
    text,
    db,
  });

  return success({ chunksCreated: result.chunksCreated });
}
