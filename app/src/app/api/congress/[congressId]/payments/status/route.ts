import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getFirst } from '@/lib/db/client';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// GET /api/congress/[congressId]/payments/status?registrationId=xxx
export async function GET(
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
  const registrationId = request.nextUrl.searchParams.get('registrationId');

  if (!registrationId) {
    return ERRORS.VALIDATION_ERROR('registrationId query parameter required');
  }

  try {
    const registration = await getFirst<{
      id: string;
      user_id: string;
      payment_status: string;
      status: string;
      amount_cents: number;
      currency: string;
    }>(
      db.prepare(
        'SELECT id, user_id, payment_status, status, amount_cents, currency FROM registrations WHERE id = ? AND congress_id = ?'
      ).bind(registrationId, congressId)
    );

    if (!registration) {
      return ERRORS.NOT_FOUND('Registration not found');
    }

    if (registration.user_id !== auth.userId) {
      return ERRORS.FORBIDDEN('Registration does not belong to current user');
    }

    return success({
      registrationId: registration.id,
      paymentStatus: registration.payment_status,
      registrationStatus: registration.status,
      amountCents: registration.amount_cents,
      currency: registration.currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
