/**
 * Text chunking utilities for RAG (Retrieval-Augmented Generation).
 *
 * Splits long texts into overlapping chunks suitable for embedding,
 * respecting paragraph and sentence boundaries.
 */

/** Approximate token count (rough heuristic: 1 token ~ 4 chars). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split text into chunks of approximately `maxTokens` size with `overlap`
 * token overlap between consecutive chunks.
 *
 * Strategy:
 * 1. Split on paragraph boundaries (double newline).
 * 2. Accumulate paragraphs until the chunk exceeds `maxTokens`.
 * 3. If a single paragraph exceeds `maxTokens`, split on sentence boundaries.
 * 4. Overlap is achieved by carrying trailing sentences into the next chunk.
 */
export function chunkText(
  text: string,
  maxTokens = 512,
  overlap = 50,
): string[] {
  if (!text.trim()) return [];

  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const pTokens = estimateTokens(paragraph);

    // If a single paragraph is too large, split by sentences
    if (pTokens > maxTokens) {
      // Flush current chunk first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n').trim());
        currentChunk = buildOverlap(currentChunk, overlap);
        currentTokens = estimateTokens(currentChunk.join('\n\n'));
      }

      const sentences = splitSentences(paragraph);
      let sentenceChunk: string[] = [];
      let sentenceTokens = 0;

      for (const sentence of sentences) {
        const sTokens = estimateTokens(sentence);

        if (sentenceTokens + sTokens > maxTokens && sentenceChunk.length > 0) {
          chunks.push(sentenceChunk.join(' ').trim());
          sentenceChunk = buildSentenceOverlap(sentenceChunk, overlap);
          sentenceTokens = estimateTokens(sentenceChunk.join(' '));
        }

        sentenceChunk.push(sentence);
        sentenceTokens += sTokens;
      }

      if (sentenceChunk.length > 0) {
        currentChunk = [sentenceChunk.join(' ').trim()];
        currentTokens = estimateTokens(currentChunk[0]);
      }

      continue;
    }

    if (currentTokens + pTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n\n').trim());
      currentChunk = buildOverlap(currentChunk, overlap);
      currentTokens = estimateTokens(currentChunk.join('\n\n'));
    }

    currentChunk.push(paragraph);
    currentTokens += pTokens;
  }

  if (currentChunk.length > 0) {
    const final = currentChunk.join('\n\n').trim();
    if (final) chunks.push(final);
  }

  return chunks;
}

/** Split a paragraph into sentences. */
function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by a space or end-of-string
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Build paragraph overlap: take trailing paragraphs up to `overlapTokens`. */
function buildOverlap(paragraphs: string[], overlapTokens: number): string[] {
  const result: string[] = [];
  let tokens = 0;

  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const pTokens = estimateTokens(paragraphs[i]);
    if (tokens + pTokens > overlapTokens && result.length > 0) break;
    result.unshift(paragraphs[i]);
    tokens += pTokens;
  }

  return result;
}

/** Build sentence overlap: take trailing sentences up to `overlapTokens`. */
function buildSentenceOverlap(
  sentences: string[],
  overlapTokens: number,
): string[] {
  const result: string[] = [];
  let tokens = 0;

  for (let i = sentences.length - 1; i >= 0; i--) {
    const sTokens = estimateTokens(sentences[i]);
    if (tokens + sTokens > overlapTokens && result.length > 0) break;
    result.unshift(sentences[i]);
    tokens += sTokens;
  }

  return result;
}
