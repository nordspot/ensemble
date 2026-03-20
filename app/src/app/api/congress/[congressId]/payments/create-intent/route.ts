import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getCongress } from '@/lib/db/congresses';
import { getFirst, run } from '@/lib/db/client';
import { createPaymentIntent } from '@/lib/payments/stripe';

const TICKET_PRICES: Record<string, number> = {
  early_bird: 29000,
  standard: 39000,
  vip: 79000,
  virtual: 14900,
};

const createIntentSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID required'),
});

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// POST /api/congress/[congressId]/payments/create-intent
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();
  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  const { congressId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createIntentSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(i => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const { registrationId } = parsed.data;

  try {
    // Verify registration exists and belongs to current user
    const registration = await getFirst<{
      id: string;
      user_id: string;
      ticket_type: string;
      amount_cents: number;
      currency: string;
      payment_status: string;
      stripe_payment_intent_id: string | null;
    }>(
      db.prepare(
        'SELECT id, user_id, ticket_type, amount_cents, currency, payment_status, stripe_payment_intent_id FROM registrations WHERE id = ? AND congress_id = ?'
      ).bind(registrationId, congressId)
    );

    if (!registration) {
      return ERRORS.NOT_FOUND('Registration not found');
    }

    if (registration.user_id !== auth.userId) {
      return ERRORS.FORBIDDEN('Registration does not belong to current user');
    }

    if (registration.payment_status === 'paid') {
      return ERRORS.CONFLICT('Payment already completed');
    }

    // Get congress for description
    const congress = await getCongress(db, congressId);
    if (!congress) {
      return ERRORS.NOT_FOUND('Congress not found');
    }

    // Determine amount (use stored amount or derive from ticket type)
    const amountCents = registration.amount_cents || TICKET_PRICES[registration.ticket_type] || TICKET_PRICES.standard;
    const currency = registration.currency || congress.currency || 'CHF';

    // Get user email for receipt
    const profile = await getFirst<{ email: string }>(
      db.prepare('SELECT email FROM profiles WHERE id = ?').bind(auth.userId)
    );

    const result = await createPaymentIntent({
      amountCents,
      currency,
      registrationId,
      congressId,
      customerEmail: profile?.email ?? '',
      description: `${congress.name} - ${registration.ticket_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Ticket`,
    });

    if (!result) {
      return ERRORS.INTERNAL_ERROR('Failed to create payment intent');
    }

    // Store payment intent ID on the registration
    await run(
      db.prepare(
        "UPDATE registrations SET stripe_payment_intent_id = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(result.paymentIntentId, registrationId)
    );

    return success({
      clientSecret: result.clientSecret,
      amount: amountCents,
      currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
