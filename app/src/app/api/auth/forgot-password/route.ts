import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { generateId } from '@/lib/db/client';
import type { D1Database } from '@/lib/db/client';

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      // Always return ok to not reveal whether email exists
      return success({ ok: true });
    }

    const { email } = parsed.data;

    const env = globalThis as Record<string, unknown>;
    const db = env.ENSEMBLE_DB as D1Database | undefined;

    if (!db) {
      // Dev fallback: generate token and return it for testing
      const token = generateId();
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
      return success({ ok: true, dev_token: token });
    }

    // Look up user by email
    const user = await db
      .prepare('SELECT id FROM profiles WHERE email = ?')
      .bind(email)
      .first<{ id: string }>();

    if (!user) {
      // Don't reveal that the email doesn't exist
      return success({ ok: true });
    }

    // Invalidate any existing unused tokens for this user
    await db
      .prepare(
        'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0'
      )
      .bind(user.id)
      .run();

    // Generate new token
    const token = generateId();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await db
      .prepare(
        'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
      )
      .bind(generateId(), user.id, token, expiresAt)
      .run();

    // In production: send email via Resend / CF Email Workers
    // For now, log the token
    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);

    return success({ ok: true });
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}
