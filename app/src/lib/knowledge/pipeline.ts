/**
 * Knowledge ingestion pipeline.
 *
 * Chunks source content, stores metadata in D1 knowledge_chunks,
 * and optionally generates embeddings for Vectorize.
 */

import type { D1Database } from '@/lib/db/client';
import { generateId } from '@/lib/db/client';
import { chunkText } from './chunker';

interface IngestParams {
  congressId: string;
  sourceType: 'transcript' | 'article' | 'abstract' | 'poster' | 'slide' | 'podcast';
  sourceId: string;
  sourceTitle: string;
  speakerName?: string;
  sessionTitle?: string;
  text: string;
  db: D1Database;
}

interface IngestResult {
  chunksCreated: number;
}

/** Cloudflare env with optional AI and Vectorize bindings. */
interface CfEnv {
  AI?: {
    run(
      model: string,
      inputs: { text: string | string[] },
    ): Promise<{ data: number[][] }>;
  };
  VECTORIZE?: {
    upsert(
      vectors: Array<{ id: string; values: number[]; metadata?: Record<string, string> }>,
    ): Promise<{ count: number }>;
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

const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBEDDING_BATCH_SIZE = 100;

/**
 * Ingest content into the knowledge pipeline.
 *
 * Idempotent: deletes existing chunks for sourceId before re-ingesting.
 */
export async function ingestContent(params: IngestParams): Promise<IngestResult> {
  const { congressId, sourceType, sourceId, sourceTitle, speakerName, sessionTitle, text, db } = params;

  if (!text.trim()) {
    return { chunksCreated: 0 };
  }

  // 1. Delete existing chunks for this source (idempotent re-ingestion)
  await db
    .prepare('DELETE FROM knowledge_chunks WHERE source_id = ? AND congress_id = ?')
    .bind(sourceId, congressId)
    .run();

  // 2. Chunk the text
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return { chunksCreated: 0 };
  }

  // 3. Store each chunk in D1
  const chunkIds: string[] = [];
  const metadata = JSON.stringify({
    source_type: sourceType,
    speaker_name: speakerName ?? null,
    session_title: sessionTitle ?? null,
  });

  // Use batch inserts for efficiency
  const statements = chunks.map((chunkText, index) => {
    const id = generateId();
    chunkIds.push(id);
    return db
      .prepare(
        `INSERT INTO knowledge_chunks (id, congress_id, source_type, source_id, source_title, speaker_name, session_title, chunk_text, chunk_index, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(
        id,
        congressId,
        sourceType,
        sourceId,
        sourceTitle,
        speakerName ?? null,
        sessionTitle ?? null,
        chunkText,
        index,
        metadata,
      );
  });

  // D1 batch limit is 100 statements
  for (let i = 0; i < statements.length; i += 100) {
    const batch = statements.slice(i, i + 100);
    await db.batch(batch);
  }

  // 4. Try to generate embeddings and insert into Vectorize
  const env = getCfEnv();
  if (env.AI && env.VECTORIZE) {
    try {
      for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
        const batchIds = chunkIds.slice(i, i + EMBEDDING_BATCH_SIZE);

        const embResult = await env.AI.run(EMBEDDING_MODEL, { text: batchChunks });

        const vectors = embResult.data.map((values, idx) => ({
          id: batchIds[idx],
          values,
          metadata: {
            congress_id: congressId,
            source_type: sourceType,
            source_id: sourceId,
            source_title: sourceTitle,
          },
        }));

        await env.VECTORIZE.upsert(vectors);
      }
    } catch (err) {
      // Graceful fallback: embeddings are optional
      console.error('[knowledge/pipeline] Embedding generation failed (non-fatal):', err);
    }
  }

  return { chunksCreated: chunks.length };
}
