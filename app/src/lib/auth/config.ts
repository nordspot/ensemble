import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Ensure type augmentations are loaded
import './types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Try multiple ways to get the D1 database binding
function getD1(): unknown | null {
  // Method 1: OpenNext getCloudflareContext
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.ENSEMBLE_DB) return ctx.env.ENSEMBLE_DB;
  } catch {
    // Not available
  }
  // Method 2: globalThis (Cloudflare Workers direct)
  const g = globalThis as Record<string, unknown>;
  if (g.ENSEMBLE_DB) return g.ENSEMBLE_DB;
  // Method 3: process.env binding (some runtimes)
  if (typeof process !== 'undefined') {
    const p = process as unknown as Record<string, unknown>;
    if (p.env && (p.env as Record<string, unknown>).ENSEMBLE_DB) {
      return (p.env as Record<string, unknown>).ENSEMBLE_DB;
    }
  }
  return null;
}

interface D1Row {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string | null;
  password_hash: string | null;
}

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
        const db = getD1() as {
          prepare(sql: string): {
            bind(...args: unknown[]): {
              first<T>(): Promise<T | null>;
            };
          };
        } | null;

        if (db) {
          try {
            const user = await db
              .prepare(
                'SELECT id, email, full_name, role, organization_id, password_hash FROM profiles WHERE email = ?'
              )
              .bind(email)
              .first<D1Row>();

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
          } catch (err) {
            console.error('D1 auth query failed:', err);
            // Fall through to dev fallback
          }
        }

        // Dev/fallback: accept demo accounts when DB is unavailable
        const demoAccounts: Record<string, { name: string; role: string }> = {
          'admin@ensemble.events': { name: 'Dr. Daniel Kunz', role: 'superadmin' },
          'organizer@ensemble.events': { name: 'Prof. Dr. Sarah Weber', role: 'organizer' },
          'speaker1@ensemble.events': { name: 'Prof. Dr. Thomas Müller', role: 'speaker' },
          'speaker2@ensemble.events': { name: 'Dr. Anna Fischer', role: 'speaker' },
          'attendee1@ensemble.events': { name: 'Lisa Schneider', role: 'attendee' },
          'exhibitor@ensemble.events': { name: 'Stefan Meier', role: 'attendee' },
        };

        const demo = demoAccounts[email];
        if (demo && (password === 'Admin123!' || password === 'Demo123!')) {
          return {
            id: `demo-${email.split('@')[0]}`,
            email,
            name: demo.name,
            role: demo.role,
            organizationId: 'demo-org-id',
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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
  trustHost: true,
});
