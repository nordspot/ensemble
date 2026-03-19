import type { D1Database } from '@/lib/db/client';
import type { UserRole } from '@/types';

export function getDb(): D1Database | null {
  // Try OpenNext's getCloudflareContext first (production on CF Workers)
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.ENSEMBLE_DB) {
      return ctx.env.ENSEMBLE_DB as D1Database;
    }
  } catch {
    // Not running on Cloudflare Workers
  }
  // Fallback: globalThis (for local dev or direct Worker context)
  const env = (globalThis as Record<string, unknown>);
  return (env.ENSEMBLE_DB as D1Database) ?? null;
}

export interface RequestAuth {
  userId: string;
  role: UserRole;
  organizationId: string | null;
}

// Extract auth from Auth.js session via cookie
// In API routes, we can use auth() from next-auth
export async function getRequestAuth(): Promise<RequestAuth | null> {
  try {
    const { auth } = await import('@/lib/auth/config');
    const session = await auth();
    if (!session?.user) return null;
    return {
      userId: session.user.id,
      role: ((session.user as unknown as Record<string, unknown>).role as UserRole) ?? 'attendee',
      organizationId: (session.user as unknown as Record<string, unknown>).organizationId as string | null ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<RequestAuth> {
  const authData = await getRequestAuth();
  if (!authData) {
    throw new Response(JSON.stringify({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  return authData;
}
