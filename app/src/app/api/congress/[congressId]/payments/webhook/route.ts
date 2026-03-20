import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/api/server-helpers';
import { verifyWebhookSignature } from '@/lib/payments/stripe';
import { run, getFirst, generateId } from '@/lib/db/client';
import { sendEmail } from '@/lib/email/client';
import { registrationConfirmationEmail } from '@/lib/email/templates/registration-confirmation';
import { getCongress } from '@/lib/db/congresses';

// Points awarded for successful payment
const PAYMENT_POINTS = 50;

function getWebhookSecret(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.STRIPE_WEBHOOK_SECRET) return ctx.env.STRIPE_WEBHOOK_SECRET as string;
  } catch {
    // Not in Cloudflare context
  }
  return (globalThis as Record<string, unknown>).STRIPE_WEBHOOK_SECRET as string ?? null;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      metadata: {
        registration_id?: string;
        congress_id?: string;
      };
      receipt_email?: string;
    };
  };
}

// POST /api/congress/[congressId]/payments/webhook
// No auth required -- Stripe sends this directly
export async function POST(request: NextRequest): Promise<Response> {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  const webhookSecret = getWebhookSecret();
  const body = await request.text();

  // Verify signature if webhook secret is configured
  if (webhookSecret) {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const valid = await verifyWebhookSignature(body, signature, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(body) as StripeEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const paymentIntent = event.data.object;
  const registrationId = paymentIntent.metadata?.registration_id;
  const congressId = paymentIntent.metadata?.congress_id;

  if (!registrationId) {
    // Not our payment intent, acknowledge anyway
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        // Update registration status to confirmed and payment_status to paid
        await run(
          db.prepare(
            `UPDATE registrations
             SET status = 'confirmed',
                 payment_status = 'paid',
                 confirmed_at = datetime('now'),
                 updated_at = datetime('now')
             WHERE id = ?`
          ).bind(registrationId)
        );

        // Get registration details for email and points
        const registration = await getFirst<{
          id: string;
          user_id: string;
          congress_id: string;
          ticket_type: string;
        }>(
          db.prepare('SELECT id, user_id, congress_id, ticket_type FROM registrations WHERE id = ?').bind(registrationId)
        );

        if (registration && congressId) {
          // Award gamification points for completed payment
          const pointsId = generateId();
          await run(
            db.prepare(
              `INSERT INTO points_ledger (id, congress_id, user_id, points, reason, description, created_at)
               VALUES (?, ?, ?, ?, 'registration', 'Kongressanmeldung abgeschlossen', datetime('now'))`
            ).bind(pointsId, congressId, registration.user_id, PAYMENT_POINTS)
          );

          // Send confirmation email
          const profile = await getFirst<{ email: string; first_name: string; last_name: string }>(
            db.prepare('SELECT email, first_name, last_name FROM profiles WHERE id = ?').bind(registration.user_id)
          );

          const congress = await getCongress(db, congressId);

          if (profile && congress) {
            const venueParts = [congress.venue_name, congress.venue_city, congress.venue_country].filter(Boolean);
            const venue = venueParts.length > 0 ? venueParts.join(', ') : 'Wird bekannt gegeben';
            const dates = congress.start_date === congress.end_date
              ? congress.start_date
              : `${congress.start_date} - ${congress.end_date}`;

            sendEmail({
              to: profile.email,
              subject: `Zahlung bestatigt: ${congress.name}`,
              html: registrationConfirmationEmail({
                name: `${profile.first_name} ${profile.last_name}`,
                congressName: congress.name,
                ticketType: registration.ticket_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
                dates,
                venue,
                registrationId: registration.id,
              }),
            }).catch(err => console.error('[EMAIL ERROR] Payment confirmation failed:', err));
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        // Update payment_status to unpaid
        await run(
          db.prepare(
            `UPDATE registrations
             SET payment_status = 'unpaid',
                 updated_at = datetime('now')
             WHERE id = ?`
          ).bind(registrationId)
        );
        break;
      }

      default:
        // Unhandled event type, acknowledge
        break;
    }
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
