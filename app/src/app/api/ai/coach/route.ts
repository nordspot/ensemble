import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ERRORS } from '@/lib/api/response';
import { buildRagSystemPrompt } from '@/lib/ai/rag-system-prompt';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import type { D1Database } from '@/lib/db/client';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';

// ── Schema ──────────────────────────────────────────────────

const bodySchema = z.object({
  question: z.string().min(1).max(2000),
  congressId: z.string().min(1),
});

// ── Row types ───────────────────────────────────────────────

interface CongressRow {
  id: string;
  name: string;
  start_date: string;
}

interface ChunkMetaRow {
  id: string;
  content: string;
  source_title: string;
  speaker_name: string;
  session_title: string;
  congress_name: string;
}

// ── Env bindings ────────────────────────────────────────────

interface Env {
  ENSEMBLE_DB?: D1Database;
  AI?: {
    run(
      model: string,
      inputs: Record<string, unknown>,
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
  AI_GATEWAY_URL?: string;
  AI_GATEWAY_TOKEN?: string;
}

function getEnv(): Env {
  return globalThis as unknown as Env;
}

// ── POST handler ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  // Rate limit AI requests: 20 per hour per user
  const rateCheck = checkRateLimit(`ai:${auth.userId}`, RATE_LIMITS.ai);
  if (!rateCheck.allowed) {
    return ERRORS.RATE_LIMITED(
      'KI-Anfragenlimit erreicht. Bitte versuchen Sie es später erneut.',
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(
      parsed.error.issues[0]?.message ?? 'Invalid body',
    );
  }

  const { question, congressId } = parsed.data;
  const env = getEnv();
  const db = getDb();

  try {
    // 1. Look up congress metadata
    let congressName = 'Congress';
    let congressYear = new Date().getFullYear();

    if (db) {
      const congress = await db
        .prepare('SELECT id, name, start_date FROM congresses WHERE id = ?')
        .bind(congressId)
        .first<CongressRow>();

      if (!congress) return ERRORS.NOT_FOUND('Congress not found');
      congressName = congress.name;
      congressYear = new Date(congress.start_date).getFullYear();
    }

    // 2. Generate embedding for the question
    let questionEmbedding: number[] = [];
    if (env.AI) {
      const embResult = await env.AI.run(
        '@cf/baai/bge-base-en-v1.5',
        { text: question },
      );
      questionEmbedding = embResult.data[0];
    }

    // 3. Search Vectorize for top 10 matching chunks
    let chunkIds: string[] = [];
    if (env.VECTORIZE && questionEmbedding.length > 0) {
      const vecResult = await env.VECTORIZE.query(questionEmbedding, {
        topK: 10,
        filter: { congress_id: congressId },
      });
      chunkIds = vecResult.matches.map((m) => m.id);
    }

    // 4. Look up chunk metadata in D1
    let chunks: ChunkMetaRow[] = [];
    if (db && chunkIds.length > 0) {
      const placeholders = chunkIds.map(() => '?').join(',');
      const result = await db
        .prepare(
          `SELECT kc.id, kc.content, ks.title as source_title,
                  ks.speaker_name, ks.session_title, c.name as congress_name
           FROM knowledge_chunks kc
           JOIN knowledge_sources ks ON kc.source_id = ks.id
           JOIN congresses c ON ks.congress_id = c.id
           WHERE kc.id IN (${placeholders})`,
        )
        .bind(...chunkIds)
        .all<ChunkMetaRow>();
      chunks = result.results;
    }

    // 5. Build context string from chunks
    const contextBlocks = chunks.map(
      (c, i) =>
        `[${i + 1}] Title: ${c.source_title}\nSpeaker: ${c.speaker_name}\n\n${c.content}`,
    );
    const contextString = contextBlocks.join('\n\n---\n\n');

    // 6. Build RAG prompt
    const systemPrompt = buildRagSystemPrompt(congressName, congressYear);
    const userPrompt = contextString
      ? `Context:\n${contextString}\n\nQuestion: ${question}`
      : `No context available.\n\nQuestion: ${question}`;

    // 7. Call Claude via AI Gateway (streaming)
    const gatewayUrl =
      env.AI_GATEWAY_URL ?? 'https://gateway.ai.cloudflare.com/v1';
    const gatewayToken = env.AI_GATEWAY_TOKEN ?? '';

    const aiResponse = await fetch(
      `${gatewayUrl}/ensemble/anthropic/v1/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': gatewayToken,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      },
    );

    if (!aiResponse.ok || !aiResponse.body) {
      console.error(
        '[api/ai/coach] AI Gateway error:',
        aiResponse.status,
        await aiResponse.text().catch(() => ''),
      );
      return ERRORS.INTERNAL_ERROR('AI service unavailable');
    }

    // 8. Log to audit table
    if (db) {
      await db
        .prepare(
          `INSERT INTO ai_audit_log (id, user_id, congress_id, action, input, created_at)
           VALUES (lower(hex(randomblob(16))), ?, ?, 'rag_query', ?, datetime('now'))`,
        )
        .bind(auth.userId, congressId, question)
        .run()
        .catch((err: unknown) => console.error('[ai_audit_log] write failed:', err));
    }

    // 9. Stream response as SSE
    const sources = chunks.map((c) => ({
      title: c.source_title,
      speaker: c.speaker_name,
      congress: c.congress_name,
      sessionTitle: c.session_title,
      excerpt: c.content.slice(0, 300),
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send sources first
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'sources', sources })}\n\n`,
          ),
        );

        // Stream AI response
        const reader = aiResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const event = JSON.parse(data) as {
                    type?: string;
                    delta?: { type?: string; text?: string };
                  };

                  if (
                    event.type === 'content_block_delta' &&
                    event.delta?.type === 'text_delta' &&
                    event.delta.text
                  ) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`,
                      ),
                    );
                  }
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }
        } catch (err) {
          console.error('[api/ai/coach] Stream error:', err);
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[api/ai/coach] Error:', err);
    return ERRORS.INTERNAL_ERROR();
  }
}
