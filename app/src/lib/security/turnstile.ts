/**
 * Cloudflare Turnstile CAPTCHA server-side verification.
 */

function getTurnstileSecret(): string {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    return ctx?.env?.TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY ?? '';
  } catch {
    return process.env.TURNSTILE_SECRET_KEY ?? '';
  }
}

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile token with Cloudflare's siteverify endpoint.
 *
 * Returns true if verification succeeds or if no secret is configured
 * (dev mode bypass).
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = getTurnstileSecret();

  // Dev mode: skip verification if no secret configured
  if (!secret) return true;

  // Empty token always fails
  if (!token) return false;

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, response: token }),
      },
    );

    const data = (await res.json()) as TurnstileResponse;
    return data.success;
  } catch (err) {
    console.error('[TURNSTILE] Verification error:', err);
    // Fail open in case of network errors to Cloudflare
    // (the rate limiter provides secondary protection)
    return true;
  }
}
