import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ERRORS } from '@/lib/api/response';
import { buildSummaryPrompt, buildKeywordsPrompt } from '@/lib/ai/summary-prompt';
import { getRequestAuth } from '@/lib/api/server-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';

// ── Schema ──────────────────────────────────────────────────

const bodySchema = z.object({
  text: z.string().min(1).max(50_000),
  type: z.enum(['session', 'article']),
});

// ── Env bindings ────────────────────────────────────────────

interface Env {
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

  const { text } = parsed.data;
  const env = getEnv();

  try {
    const gatewayUrl =
      env.AI_GATEWAY_URL ?? 'https://gateway.ai.cloudflare.com/v1';
    const gatewayToken = env.AI_GATEWAY_TOKEN ?? '';

    // Run summary and keywords prompts in parallel
    const [summaryResponse, keywordsResponse] = await Promise.all([
      fetch(`${gatewayUrl}/ensemble/anthropic/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': gatewayToken,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: buildSummaryPrompt(text) },
          ],
        }),
      }),
      fetch(`${gatewayUrl}/ensemble/anthropic/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': gatewayToken,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          messages: [
            { role: 'user', content: buildKeywordsPrompt(text) },
          ],
        }),
      }),
    ]);

    if (!summaryResponse.ok || !keywordsResponse.ok) {
      return ERRORS.INTERNAL_ERROR('AI service unavailable');
    }

    const summaryResult = (await summaryResponse.json()) as {
      content: Array<{ type: string; text?: string }>;
    };
    const keywordsResult = (await keywordsResponse.json()) as {
      content: Array<{ type: string; text?: string }>;
    };

    const summaryText =
      summaryResult.content?.find((b) => b.type === 'text')?.text ?? '';
    const keywordsText =
      keywordsResult.content?.find((b) => b.type === 'text')?.text ?? '';

    // Parse structured output
    let summary = '';
    let keyPoints: string[] = [];
    let keywords: string[] = [];

    try {
      const summaryParsed = JSON.parse(summaryText) as {
        summary: string;
        keyPoints: string[];
      };
      summary = summaryParsed.summary;
      keyPoints = summaryParsed.keyPoints;
    } catch {
      // Fallback: use raw text as summary
      summary = summaryText;
    }

    try {
      keywords = JSON.parse(keywordsText) as string[];
    } catch {
      keywords = [];
    }

    return NextResponse.json({
      ok: true,
      data: { summary, keyPoints, keywords },
    });
  } catch (err) {
    console.error('[api/ai/summarize] Error:', err);
    return ERRORS.INTERNAL_ERROR();
  }
}
