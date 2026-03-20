import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { isOrganizer } from '@/lib/auth/permissions';
import { getAll } from '@/lib/db/client';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { sendPushToMany } from '@/lib/push/web-push';

const sendSchema = z.object({
  congressId: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().optional(),
  tag: z.string().optional(),
  // Optional: target specific users instead of all congress attendees
  userIds: z.array(z.string()).optional(),
});

interface SubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
}

// POST /api/push/send -- send push notification (admin/organizer only)
export async function POST(request: NextRequest): Promise<Response> {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();
  if (!isOrganizer(auth.role)) return ERRORS.FORBIDDEN('Organizer role required');

  // Rate limit push sends
  const rateCheck = checkRateLimit(`push:${auth.userId}`, RATE_LIMITS.push);
  if (!rateCheck.allowed) {
    return ERRORS.RATE_LIMITED('Zu viele Push-Benachrichtigungen. Bitte warten.');
  }

  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const input = parsed.data;

  try {
    let subscriptions: SubscriptionRow[];

    if (input.userIds && input.userIds.length > 0) {
      // Send to specific users
      const placeholders = input.userIds.map(() => '?').join(',');
      subscriptions = await getAll<SubscriptionRow>(
        db
          .prepare(
            `SELECT ps.endpoint, ps.p256dh, ps.auth, ps.user_id
             FROM push_subscriptions ps
             WHERE ps.user_id IN (${placeholders})`,
          )
          .bind(...input.userIds),
      );
    } else {
      // Send to all attendees of the congress
      subscriptions = await getAll<SubscriptionRow>(
        db
          .prepare(
            `SELECT ps.endpoint, ps.p256dh, ps.auth, ps.user_id
             FROM push_subscriptions ps
             JOIN registrations r ON r.user_id = ps.user_id
             WHERE r.congress_id = ? AND r.status = 'confirmed'`,
          )
          .bind(input.congressId),
      );
    }

    if (subscriptions.length === 0) {
      return success({ sent: 0, failed: 0, total: 0 });
    }

    const result = await sendPushToMany(
      subscriptions.map((s) => ({
        endpoint: s.endpoint,
        p256dh: s.p256dh,
        auth: s.auth,
      })),
      {
        title: input.title,
        body: input.body,
        url: input.url,
        tag: input.tag,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
      },
    );

    // Clean up expired subscriptions (410 Gone)
    if (result.gone.length > 0) {
      for (const endpoint of result.gone) {
        await db
          .prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
          .bind(endpoint)
          .run();
      }
    }

    return success({
      sent: result.sent,
      failed: result.failed,
      total: subscriptions.length,
      cleaned: result.gone.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
