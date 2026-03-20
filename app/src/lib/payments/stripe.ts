// Stripe payment integration using REST API directly (no npm package)
// This avoids Node.js runtime issues on Cloudflare Workers

// Get Stripe secret key from Cloudflare context
function getStripeKey(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.STRIPE_SECRET_KEY) return ctx.env.STRIPE_SECRET_KEY as string;
  } catch {
    // Not in Cloudflare context
  }
  return (globalThis as Record<string, unknown>).STRIPE_SECRET_KEY as string ?? null;
}

export async function createPaymentIntent(params: {
  amountCents: number;
  currency: string;
  registrationId: string;
  congressId: string;
  customerEmail: string;
  description: string;
}): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const key = getStripeKey();
  if (!key) {
    console.log('[STRIPE DEV] Would create PaymentIntent:', params);
    return { clientSecret: 'dev_secret_' + Date.now(), paymentIntentId: 'dev_pi_' + Date.now() };
  }

  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: String(params.amountCents),
      currency: params.currency.toLowerCase(),
      'metadata[registration_id]': params.registrationId,
      'metadata[congress_id]': params.congressId,
      receipt_email: params.customerEmail,
      description: params.description,
    }),
  });

  if (!res.ok) {
    console.error('[STRIPE ERROR]', await res.text());
    return null;
  }

  const data = await res.json() as { client_secret: string; id: string };
  return { clientSecret: data.client_secret, paymentIntentId: data.id };
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Stripe webhook signature verification using Web Crypto API
  // Signature format: t=timestamp,v1=signature
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const sig = parts.find(p => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !sig) return false;

  // Check timestamp is within 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expected = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedHex === sig;
}
