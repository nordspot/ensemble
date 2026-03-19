/**
 * Embedding helper that calls Cloudflare Workers AI (BGE base model)
 * to generate vector embeddings for text chunks.
 */

/** Cloudflare AI binding interface (subset). */
interface AiBinding {
  run(
    model: string,
    inputs: { text: string | string[] },
  ): Promise<{ data: number[][] }>;
}

/** Cloudflare Worker environment with AI binding. */
interface Env {
  AI: AiBinding;
}

/** The BGE base embedding model available on Workers AI. */
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';

/**
 * Generate an embedding vector for a single text string.
 *
 * @returns A float array (768 dimensions for BGE base).
 */
export async function generateEmbedding(
  text: string,
  env: Env,
): Promise<number[]> {
  const result = await env.AI.run(EMBEDDING_MODEL, { text });
  return result.data[0];
}

/**
 * Generate embedding vectors for multiple texts in a single batch call.
 *
 * Workers AI supports batched input; this avoids per-text round trips.
 *
 * @returns An array of float arrays, one per input text.
 */
export async function generateEmbeddings(
  texts: string[],
  env: Env,
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Workers AI batch limit is ~100 texts; chunk if needed
  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const result = await env.AI.run(EMBEDDING_MODEL, {
      text: batch,
    });
    allEmbeddings.push(...result.data);
  }

  return allEmbeddings;
}
