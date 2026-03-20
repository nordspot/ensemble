interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Try to get Resend API key from Cloudflare context
function getResendKey(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.RESEND_API_KEY) return ctx.env.RESEND_API_KEY as string;
  } catch {
    // Not in Cloudflare context
  }
  const env = globalThis as Record<string, unknown>;
  return (env.RESEND_API_KEY as string) ?? null;
}

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const apiKey = getResendKey();
  const from = payload.from ?? 'Ensemble <noreply@ensemble.events>';

  if (!apiKey) {
    // Dev fallback
    console.log('[EMAIL DEV]', payload.subject, 'to:', payload.to);
    console.log('[EMAIL DEV] Content preview:', payload.html.substring(0, 200));
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[EMAIL ERROR]', res.status, err);
      return { success: false, error: err };
    }

    const data = (await res.json()) as { id: string };
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    return { success: false, error: String(err) };
  }
}
