import type { UserRole, CongressRole } from '@/types';

// Role hierarchy: superadmin > admin > organizer > speaker > attendee
const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  admin: 80,
  organizer: 60,
  speaker: 40,
  attendee: 20,
};

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isOrganizer(userRole: UserRole): boolean {
  return hasMinimumRole(userRole, 'organizer');
}

export function isAdmin(userRole: UserRole): boolean {
  return hasMinimumRole(userRole, 'admin');
}

export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'superadmin';
}

export interface CongressPermission {
  congressId: string;
  role: CongressRole;
}

export function hasCongressRole(
  permissions: CongressPermission[],
  congressId: string,
  requiredRole: CongressRole
): boolean {
  return permissions.some(p => p.congressId === congressId && p.role === requiredRole);
}

export function hasAnyCongressRole(
  permissions: CongressPermission[],
  congressId: string,
  roles: CongressRole[]
): boolean {
  return permissions.some(p => p.congressId === congressId && roles.includes(p.role));
}
