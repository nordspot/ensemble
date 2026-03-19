'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
}

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.name ?? '',
          role: (session.user as unknown as Record<string, unknown>).role as string ?? 'attendee',
          organizationId:
            ((session.user as unknown as Record<string, unknown>).organizationId as string | null) ?? null,
        }
      : null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signIn,
    signOut,
  };
}
