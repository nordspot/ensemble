import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getCongress } from '@/lib/db/congresses';
import { createRegistration, countRegistrations } from '@/lib/db/registrations';
import { generateId, getFirst, run } from '@/lib/db/client';
import { getDb } from '@/lib/api/server-helpers';

const TICKET_PRICES: Record<string, number> = {
  early_bird: 29000,
  standard: 39000,
  vip: 79000,
  virtual: 14900,
};

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  dietary_requirements: z.string().optional(),
  accessibility_needs: z.string().optional(),
  ticket_type: z.enum(['early_bird', 'standard', 'vip', 'virtual']),
  selected_sessions: z.array(z.string()).default([]),
});

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// POST /api/congress/[congressId]/register
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;

  // Verify congress exists and registration is open
  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  if (!congress.registration_open) {
    return ERRORS.VALIDATION_ERROR('Registration is not open');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    // Check capacity
    if (congress.max_attendees) {
      const current = await countRegistrations(db, congressId);
      if (current >= congress.max_attendees) {
        return ERRORS.CONFLICT('Congress is at full capacity');
      }
    }

    // Check for existing profile or create temporary user_id
    const existingProfile = await getFirst<{ id: string }>(
      db.prepare('SELECT id FROM profiles WHERE email = ?').bind(input.email)
    );

    let userId: string;
    if (existingProfile) {
      userId = existingProfile.id;

      // Check for duplicate registration
      const existingReg = await getFirst<{ id: string }>(
        db.prepare(
          "SELECT id FROM registrations WHERE congress_id = ? AND user_id = ? AND status != 'cancelled'"
        ).bind(congressId, userId)
      );
      if (existingReg) {
        return ERRORS.CONFLICT('Already registered for this congress');
      }
    } else {
      // Create a minimal profile for the registrant
      userId = generateId();
      await run(
        db.prepare(
          `INSERT INTO profiles (id, email, first_name, last_name, title, affiliation, role)
           VALUES (?, ?, ?, ?, ?, ?, 'attendee')`
        ).bind(
          userId,
          input.email,
          input.first_name,
          input.last_name,
          input.title ?? null,
          input.organization ?? null
        )
      );
    }

    // Determine price
    const amountCents = TICKET_PRICES[input.ticket_type] ?? TICKET_PRICES.standard;

    // Create registration
    const registrationId = await createRegistration(db, {
      congress_id: congressId,
      user_id: userId,
      ticket_type: input.ticket_type,
      amount_cents: amountCents,
      currency: congress.currency || 'CHF',
      dietary_requirements: input.dietary_requirements,
      accessibility_needs: input.accessibility_needs,
    });

    // Create session bookings for pre-selected sessions
    for (const sessionId of input.selected_sessions) {
      const bookingId = generateId();
      await run(
        db.prepare(
          `INSERT INTO session_bookings (id, session_id, user_id, status, booked_at)
           VALUES (?, ?, ?, 'confirmed', datetime('now'))`
        ).bind(bookingId, sessionId, userId)
      );
    }

    // Generate referral code
    const referralCode = generateId().substring(0, 8).toUpperCase();

    return success(
      {
        registration_id: registrationId,
        referral_code: referralCode,
        amount_cents: amountCents,
        currency: congress.currency || 'CHF',
      },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
