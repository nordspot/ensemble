import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Ensure type augmentations are loaded
import './types';

// NOTE: In production, this uses D1Adapter. For now, JWT-only strategy.
// D1 adapter integration will be added when deploying to Cloudflare.

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Access D1 binding (available on globalThis in CF Workers via OpenNext)
        const env = globalThis as Record<string, unknown>;
        const db = env.ENSEMBLE_DB as
          | import('@/lib/db/client').D1Database
          | undefined;

        if (!db) {
          // Dev fallback: demo admin account
          if (email === 'admin@ensemble.app' && password === 'Admin123!') {
            return {
              id: 'demo-admin-id',
              email,
              name: 'Demo Admin',
              role: 'superadmin',
              organizationId: 'demo-org-id',
            };
          }
          return null;
        }

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

        if (!user?.password_hash) return null;

        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          organizationId: user.organization_id,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/anmelden',
    newUser: '/registrieren',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? '';
        token.role = user.role ?? 'attendee';
        token.organizationId = user.organizationId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
});
