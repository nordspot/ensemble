import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { generateId } from '@/lib/db/client';

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

// POST /api/push/subscribe -- store push subscription
export async function POST(request: NextRequest): Promise<Response> {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { endpoint, keys } = parsed.data;

  try {
    // Upsert: delete existing subscription for this endpoint, then insert
    await db
      .prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
      .bind(endpoint)
      .run();

    const id = generateId();
    await db
      .prepare(
        `INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(id, auth.userId, endpoint, keys.p256dh, keys.auth)
      .run();

    return success({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// DELETE /api/push/subscribe -- remove push subscription
export async function DELETE(request: NextRequest): Promise<Response> {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint');

  if (!endpoint) {
    return ERRORS.VALIDATION_ERROR('endpoint query parameter required');
  }

  try {
    await db
      .prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?')
      .bind(endpoint, auth.userId)
      .run();

    return success({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
