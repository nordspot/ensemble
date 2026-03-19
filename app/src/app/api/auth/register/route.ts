import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { success, ERRORS } from '@/lib/api/response';
import { emailSchema, passwordSchema } from '@/lib/utils/validation';
import { generateId } from '@/lib/db/client';
import type { D1Database } from '@/lib/db/client';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben').max(100),
  email: emailSchema,
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for') ??
      'unknown';
    const rateCheck = checkRateLimit(`register:${ip}`, RATE_LIMITS.registration);
    if (!rateCheck.allowed) {
      return ERRORS.RATE_LIMITED('Zu viele Registrierungsversuche. Bitte warten Sie eine Minute.');
    }

    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return ERRORS.VALIDATION_ERROR(firstError?.message ?? 'Ungueltige Eingabe');
    }

    const { full_name, email, password } = parsed.data;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Access D1 binding
    const env = globalThis as Record<string, unknown>;
    const db = env.ENSEMBLE_DB as D1Database | undefined;

    if (!db) {
      // Dev fallback: return success with generated ID
      const id = generateId();
      return success({ id, email, full_name }, 201);
    }

    // Check for existing email
    const existing = await db
      .prepare('SELECT id FROM profiles WHERE email = ?')
      .bind(email)
      .first<{ id: string }>();

    if (existing) {
      return ERRORS.CONFLICT('Diese E-Mail-Adresse wird bereits verwendet.');
    }

    // Insert new user
    const id = generateId();
    await db
      .prepare(
        'INSERT INTO profiles (id, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, email, full_name, passwordHash, 'attendee')
      .run();

    return success({ id, email, full_name }, 201);
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}
