import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { generateId } from '@/lib/db/client';
import type { D1Database } from '@/lib/db/client';

const contactSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben').max(100),
  email: z.string().email('Ungueltige E-Mail-Adresse'),
  subject: z.string().min(2, 'Betreff muss mindestens 2 Zeichen haben').max(200),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen haben').max(5000),
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 60 * 1000; // per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for') ||
               'unknown';
    if (isRateLimited(ip)) {
      return ERRORS.RATE_LIMITED('Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.');
    }

    const body: unknown = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return ERRORS.VALIDATION_ERROR(firstError?.message ?? 'Ungueltige Eingabe');
    }

    const { name, email, subject, message } = parsed.data;

    const env = globalThis as Record<string, unknown>;
    const db = env.ENSEMBLE_DB as D1Database | undefined;

    if (!db) {
      console.log('[DEV] Contact form submission:', { name, email, subject, message });
      return success({ ok: true });
    }

    // Store in D1 (create table if not exists is idempotent via migration)
    await db
      .prepare(
        `INSERT INTO contact_messages (id, name, email, subject, message, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(generateId(), name, email, subject, message, ip)
      .run();

    return success({ ok: true });
  } catch {
    return ERRORS.INTERNAL_ERROR();
  }
}
