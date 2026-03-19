import { auth } from './config';
import { ERRORS } from '@/lib/api/response';
import type { UserRole } from '@/types';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw ERRORS.UNAUTHORIZED();
  }
  return session;
}

export async function requireRole(minimumRole: UserRole) {
  const session = await requireAuth();
  const roleHierarchy: Record<string, number> = {
    attendee: 20,
    speaker: 40,
    organizer: 60,
    admin: 80,
    superadmin: 100,
  };
  const userLevel = roleHierarchy[session.user.role] ?? 0;
  const requiredLevel = roleHierarchy[minimumRole] ?? 0;
  if (userLevel < requiredLevel) {
    throw ERRORS.FORBIDDEN();
  }
  return session;
}
