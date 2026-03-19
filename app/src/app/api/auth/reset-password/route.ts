import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { success, ERRORS } from '@/lib/api/response';
import { passwordSchema } from '@/lib/utils/validation';
import type { D1Database } from '@/lib/db/client';

const resetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return ERRORS.VALIDATION_ERROR(firstError?.message ?? 'Ungültige Eingabe');
    }

    const { token, password } = parsed.data;

    const env = globalThis as Record<string, unknown>;
    const db = env.ENSEMBLE_DB as D1Database | undefined;

    if (!db) {
      // Dev fallback: accept any token
      return success({ ok: true });
    }

    // Find valid token
    const resetToken = await db
      .prepare(
        'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?'
      )
      .bind(token)
      .first<{ id: string; user_id: string; expires_at: string; used: number }>();

    if (!resetToken) {
      return ERRORS.VALIDATION_ERROR('Ungültiger oder abgelaufener Link.');
    }

    if (resetToken.used === 1) {
      return ERRORS.VALIDATION_ERROR('Dieser Link wurde bereits verwendet.');
    }

    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);
    if (now > expiresAt) {
      return ERRORS.VALIDATION_ERROR('Dieser Link ist abgelaufen. Bitte fordern Sie einen neuen an.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and mark token as used in a batch
    await db.batch([
      db
        .prepare('UPDATE profiles SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .bind(passwordHash, resetToken.user_id),
      db
        .prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?')
        .bind(resetToken.id),
    ]);

    return success({ ok: true });
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}
