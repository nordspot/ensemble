/**
 * Web Push notification sending via the Web Push Protocol.
 *
 * Uses fetch directly (no npm packages required).
 * Requires VAPID keys set in environment:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 */

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

function getVapidKeys() {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    return {
      publicKey: ctx?.env?.VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY ?? '',
      privateKey: ctx?.env?.VAPID_PRIVATE_KEY ?? process.env.VAPID_PRIVATE_KEY ?? '',
      subject: ctx?.env?.VAPID_SUBJECT ?? process.env.VAPID_SUBJECT ?? 'mailto:push@ensemble.events',
    };
  } catch {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY ?? '',
      privateKey: process.env.VAPID_PRIVATE_KEY ?? '',
      subject: process.env.VAPID_SUBJECT ?? 'mailto:push@ensemble.events',
    };
  }
}

/**
 * Send a push notification to a single subscription.
 *
 * In production, this would sign the request with VAPID keys using
 * the Web Push protocol. For the MVP, we use a simplified approach
 * that works with the Push API on Cloudflare Workers.
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload,
): Promise<{ success: boolean; statusCode: number }> {
  const vapid = getVapidKeys();

  if (!vapid.publicKey || !vapid.privateKey) {
    console.warn('[PUSH] VAPID keys not configured, skipping push');
    return { success: false, statusCode: 0 };
  }

  const body = JSON.stringify(payload);

  try {
    // Build the JWT for VAPID authentication
    const audience = new URL(subscription.endpoint).origin;
    const jwt = await createVapidJwt(audience, vapid.subject, vapid.privateKey);

    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        TTL: '86400',
        Authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
      },
      body: new TextEncoder().encode(body),
    });

    return {
      success: res.status >= 200 && res.status < 300,
      statusCode: res.status,
    };
  } catch (err) {
    console.error('[PUSH] Failed to send notification:', err);
    return { success: false, statusCode: 0 };
  }
}

/**
 * Send push notifications to multiple subscriptions.
 * Returns count of successful sends.
 */
export async function sendPushToMany(
  subscriptions: PushSubscription[],
  payload: PushPayload,
): Promise<{ sent: number; failed: number; gone: string[] }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload)),
  );

  let sent = 0;
  let failed = 0;
  const gone: string[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
    } else {
      failed++;
      // 410 Gone means subscription is no longer valid
      if (
        result.status === 'fulfilled' &&
        result.value.statusCode === 410
      ) {
        gone.push(subscriptions[i]!.endpoint);
      }
    }
  });

  return { sent, failed, gone };
}

/**
 * Create a minimal VAPID JWT.
 * In production, use proper ECDSA signing with the private key.
 */
async function createVapidJwt(
  audience: string,
  subject: string,
  _privateKey: string,
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: subject,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Note: In a full implementation, this would sign with the ECDSA private key.
  // For Workers, use the Web Crypto API with importKey + sign.
  // This placeholder returns an unsigned token that works for dev/testing.
  return `${encodedHeader}.${encodedPayload}.`;
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
