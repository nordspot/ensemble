import { auth } from './config';
import { ERRORS } from '@/lib/api/response';
import type { D1Database } from '@/lib/db/client';

export interface ServerAuth {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
}

export async function getServerAuth(): Promise<ServerAuth | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    role: (session.user as unknown as Record<string, unknown>).role as string ?? 'attendee',
    organizationId:
      ((session.user as unknown as Record<string, unknown>).organizationId as string | null) ?? null,
  };
}

export async function requireServerAuth(): Promise<ServerAuth> {
  const serverAuth = await getServerAuth();
  if (!serverAuth) throw ERRORS.UNAUTHORIZED();
  return serverAuth;
}

export async function requireServerRole(minimumRole: string): Promise<ServerAuth> {
  const serverAuth = await requireServerAuth();
  const hierarchy: Record<string, number> = {
    attendee: 20,
    speaker: 40,
    organizer: 60,
    admin: 80,
    superadmin: 100,
  };
  if ((hierarchy[serverAuth.role] ?? 0) < (hierarchy[minimumRole] ?? 0)) {
    throw ERRORS.FORBIDDEN();
  }
  return serverAuth;
}

export function getDb(): D1Database | null {
  const env = globalThis as Record<string, unknown>;
  return (env.ENSEMBLE_DB as D1Database) ?? null;
}
