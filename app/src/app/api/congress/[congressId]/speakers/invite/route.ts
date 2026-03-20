import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { isOrganizer } from '@/lib/auth/permissions';
import { getProfileByEmail, createProfile } from '@/lib/db/profiles';
import { getCongress } from '@/lib/db/congresses';
import { sendEmail } from '@/lib/email/client';
import { speakerInvitationEmail } from '@/lib/email/templates/speaker-invitation';
import { generateId } from '@/lib/db/client';
import type { SpeakerRole } from '@/types';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  sessionId: z.string().min(1),
  role: z.enum(['speaker', 'moderator', 'panelist', 'chair']).optional().default('speaker'),
});

/**
 * POST /api/congress/[congressId]/speakers/invite
 * Invite a speaker to a congress session. Organizer only.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();
  if (!isOrganizer(auth.role)) return ERRORS.FORBIDDEN('Nur Organisatoren duerfen Referenten einladen');

  const { congressId } = await context.params;

  const congress = await getCongress(db, congressId);
  if (!congress) return ERRORS.NOT_FOUND('Congress not found');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { email, name, sessionId, role } = parsed.data;

  // Validate session exists and belongs to this congress
  const session = await db
    .prepare('SELECT id, title, start_time FROM sessions WHERE id = ? AND congress_id = ?')
    .bind(sessionId, congressId)
    .first<{ id: string; title: string; start_time: string }>();

  if (!session) {
    return ERRORS.NOT_FOUND('Session not found in this congress');
  }

  // Create or find profile by email
  let profile = await getProfileByEmail(db, email);
  let userId: string;

  if (profile) {
    userId = profile.id;
  } else {
    // Split name into first/last for new profile
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] ?? name;
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

    userId = await createProfile(db, {
      email,
      first_name: firstName,
      last_name: lastName,
      display_name: name,
      role: 'speaker',
    });

    profile = await getProfileByEmail(db, email);
  }

  // Create congress_roles entry if not already exists
  const existingRole = await db
    .prepare('SELECT id FROM congress_roles WHERE congress_id = ? AND user_id = ?')
    .bind(congressId, userId)
    .first<{ id: string }>();

  if (!existingRole) {
    await db
      .prepare(
        `INSERT INTO congress_roles (id, congress_id, user_id, role, created_at)
         VALUES (?, ?, ?, 'speaker', datetime('now'))`,
      )
      .bind(generateId(), congressId, userId)
      .run();
  }

  // Create session_speakers entry (check for duplicate)
  const existingSpeaker = await db
    .prepare('SELECT id FROM session_speakers WHERE session_id = ? AND user_id = ?')
    .bind(sessionId, userId)
    .first<{ id: string }>();

  if (existingSpeaker) {
    return ERRORS.CONFLICT('Dieser Referent ist bereits dieser Session zugewiesen');
  }

  await db
    .prepare(
      `INSERT INTO session_speakers (id, session_id, user_id, role, sort_order, created_at)
       VALUES (?, ?, ?, ?, 0, datetime('now'))`,
    )
    .bind(generateId(), sessionId, userId, role)
    .run();

  // Send speaker invitation email
  const acceptUrl = `${request.nextUrl.origin}/congress/${congressId}/speaker-portal`;
  const sessionDate = session.start_time
    ? new Date(session.start_time).toLocaleDateString('de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'TBD';

  // Deadline: 14 days from now
  const deadline = new Date(Date.now() + 14 * 86400000).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const html = speakerInvitationEmail({
    name,
    congressName: congress.name,
    sessionTitle: session.title,
    sessionDate,
    acceptUrl,
    deadline,
  });

  await sendEmail({
    to: email,
    subject: `Einladung als Referent/in – ${congress.name}`,
    html,
  });

  return success(
    {
      userId,
      email,
      name,
      sessionId,
      sessionTitle: session.title,
      role: role as SpeakerRole,
      acceptUrl,
    },
    201,
  );
}
