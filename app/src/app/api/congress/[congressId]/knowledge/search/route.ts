import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

const searchSchema = z.object({
  query: z.string().min(1).max(1000),
  limit: z.number().min(1).max(50).optional().default(10),
});

interface ChunkRow {
  id: string;
  chunk_text: string;
  source_title: string;
  speaker_name: string | null;
  session_title: string | null;
  source_type: string;
  chunk_index: number;
}

/** Cloudflare env with optional AI and Vectorize bindings. */
interface CfEnv {
  AI?: {
    run(
      model: string,
      inputs: { text: string },
    ): Promise<{ data: number[][] }>;
  };
  VECTORIZE?: {
    query(
      vector: number[],
      options: { topK: number; filter?: Record<string, string> },
    ): Promise<{
      matches: Array<{ id: string; score: number; metadata?: Record<string, string> }>;
    }>;
  };
}

function getCfEnv(): CfEnv {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env) return ctx.env as CfEnv;
  } catch {
    // Not in Cloudflare context
  }
  return globalThis as unknown as CfEnv;
}

/**
 * POST /api/congress/[congressId]/knowledge/search
 * Search the knowledge base. Authenticated users only.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { query, limit } = parsed.data;
  const env = getCfEnv();

  // Strategy 1: Vectorize semantic search (if available)
  if (env.AI && env.VECTORIZE) {
    try {
      const embResult = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: query });
      const queryEmbedding = embResult.data[0];

      const vecResult = await env.VECTORIZE.query(queryEmbedding, {
        topK: limit,
        filter: { congress_id: congressId },
      });

      if (vecResult.matches.length > 0) {
        const chunkIds = vecResult.matches.map((m) => m.id);
        const placeholders = chunkIds.map(() => '?').join(',');

        const result = await db
          .prepare(
            `SELECT id, chunk_text, source_title, speaker_name, session_title, source_type, chunk_index
             FROM knowledge_chunks
             WHERE id IN (${placeholders})`,
          )
          .bind(...chunkIds)
          .all<ChunkRow>();

        // Maintain Vectorize ranking order
        const chunkMap = new Map(result.results.map((c) => [c.id, c]));
        const ranked = vecResult.matches
          .map((m) => {
            const chunk = chunkMap.get(m.id);
            return chunk ? { ...chunk, score: m.score } : null;
          })
          .filter(Boolean);

        return success({ results: ranked, method: 'vectorize' });
      }
    } catch (err) {
      console.error('[knowledge/search] Vectorize search failed, falling back to SQL:', err);
    }
  }

  // Strategy 2: Fallback SQL LIKE search
  const searchTerm = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;

  const result = await db
    .prepare(
      `SELECT id, chunk_text, source_title, speaker_name, session_title, source_type, chunk_index
       FROM knowledge_chunks
       WHERE congress_id = ? AND chunk_text LIKE ? ESCAPE '\\'
       LIMIT ?`,
    )
    .bind(congressId, searchTerm, limit)
    .all<ChunkRow>();

  return success({ results: result.results, method: 'sql_like' });
}
