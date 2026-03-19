import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/api/server-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { logAudit } from '@/lib/security/audit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for') ??
      'unknown';
    const rateCheck = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Zu viele Anmeldeversuche. Bitte warten Sie einige Minuten.' } },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const { email, password } = schema.parse(body);

    // Access D1 via OpenNext's getCloudflareContext
    const db = getDb();

    if (!db) {
      // Development fallback: check for a demo admin account
      if (email === 'admin@ensemble.app' && password === 'Admin123!') {
        return NextResponse.json({
          id: 'demo-admin-id',
          email: 'admin@ensemble.app',
          name: 'Demo Admin',
          role: 'superadmin',
          organizationId: 'demo-org-id',
        });
      }
      return NextResponse.json(null);
    }

    // Look up user in profiles table
    const user = await db
      .prepare(
        'SELECT id, email, full_name, role, organization_id, password_hash FROM profiles WHERE email = ?'
      )
      .bind(email)
      .first<{
        id: string;
        email: string;
        full_name: string;
        role: string;
        organization_id: string | null;
        password_hash: string;
      }>();

    if (!user || !user.password_hash) {
      return NextResponse.json(null);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await logAudit(db ?? null, {
        userId: user.id,
        action: 'login_failed',
        entityType: 'auth',
        ipAddress: ip,
        details: { email },
      });
      return NextResponse.json(null);
    }

    await logAudit(db ?? null, {
      userId: user.id,
      action: 'login_success',
      entityType: 'auth',
      ipAddress: ip,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      organizationId: user.organization_id,
    });
  } catch {
    return NextResponse.json(null);
  }
}
