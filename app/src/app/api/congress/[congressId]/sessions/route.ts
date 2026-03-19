import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import {
  listSessions,
  listSessionsByDate,
  getSession,
  createSession,
} from '@/lib/db/sessions';
import { getCongress } from '@/lib/db/congresses';
import { isOrganizer } from '@/lib/auth/permissions';
import { getAll } from '@/lib/db/client';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import type { D1Database } from '@/lib/db/client';
import type { Track, Room, Profile } from '@/types';

// ── Schemas ─────────────────────────────────────────────────────────────

const createSessionSchema = z.object({
  track_id: z.string().optional(),
  room_id: z.string().optional(),
  title: z.string().min(1, 'Title required').max(300),
  description: z.string().max(5000).optional(),
  session_type: z.enum([
    'keynote', 'panel', 'workshop', 'poster', 'oral',
    'symposium', 'live_surgery', 'social', 'break', 'other',
  ] as const),
  start_time: z.string().min(1, 'Start time required'),
  end_time: z.string().min(1, 'End time required'),
  max_attendees: z.number().int().positive().optional(),
  is_bookable: z.boolean().optional(),
  requires_registration: z.boolean().optional(),
  language: z.string().max(5).optional(),
  cme_credits: z.number().int().nonnegative().optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Row types for D1 queries ────────────────────────────────────────────

interface SpeakerNameRow {
  session_id: string;
  title: string | null;
  first_name: string;
  last_name: string;
}

// ── GET /api/congress/[congressId]/sessions ─────────────────────────────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;
  const url = new URL(request.url);

  // Single session detail mode
  const sessionId = url.searchParams.get('sessionId');
  if (sessionId) {
    return getSessionDetail(db, congressId, sessionId);
  }

  // List mode with optional filters
  const dateFilter = url.searchParams.get('date');
  const trackFilter = url.searchParams.get('track_id');
  const typeFilter = url.searchParams.get('type');

  try {
    // Fetch sessions using existing helpers
    let sessions;
    if (dateFilter) {
      sessions = await listSessionsByDate(db, congressId, dateFilter);
    } else {
      sessions = await listSessions(db, congressId, {
        track_id: trackFilter ?? undefined,
        session_type: typeFilter ?? undefined,
      });
    }

    // Fetch tracks for this congress
    const tracks = await getAll<Track>(
      db.prepare('SELECT * FROM tracks WHERE congress_id = ? ORDER BY sort_order ASC').bind(congressId)
    );

    // Fetch rooms for this congress
    const rooms = await getAll<Room>(
      db.prepare('SELECT * FROM rooms WHERE congress_id = ? ORDER BY sort_order ASC').bind(congressId)
    );

    // Fetch speaker names mapped to session IDs
    const speakerRows = await getAll<SpeakerNameRow>(
      db.prepare(
        `SELECT ss.session_id, p.title, p.first_name, p.last_name
         FROM session_speakers ss
         JOIN profiles p ON p.id = ss.user_id
         WHERE ss.session_id IN (
           SELECT id FROM sessions WHERE congress_id = ?
         )
         ORDER BY ss.sort_order ASC`
      ).bind(congressId)
    );

    const speakerMap: Record<string, string[]> = {};
    for (const row of speakerRows) {
      const name = [row.title, row.first_name, row.last_name]
        .filter(Boolean)
        .join(' ');
      if (!speakerMap[row.session_id]) speakerMap[row.session_id] = [];
      speakerMap[row.session_id].push(name);
    }

    return success({
      sessions,
      tracks,
      rooms,
      speakerMap,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── Single session detail ───────────────────────────────────────────────

async function getSessionDetail(
  db: D1Database,
  congressId: string,
  sessionId: string
): Promise<Response> {
  try {
    const session = await getSession(db, sessionId);

    if (!session || session.congress_id !== congressId) {
      return ERRORS.NOT_FOUND('Session not found');
    }

    // Track
    const track = session.track_id
      ? await db.prepare('SELECT * FROM tracks WHERE id = ?').bind(session.track_id).first<Track>()
      : null;

    // Room
    const room = session.room_id
      ? await db.prepare('SELECT * FROM rooms WHERE id = ?').bind(session.room_id).first<Room>()
      : null;

    // Speakers (full profiles)
    const speakers = await getAll<Profile>(
      db.prepare(
        `SELECT p.*
         FROM session_speakers ss
         JOIN profiles p ON p.id = ss.user_id
         WHERE ss.session_id = ?
         ORDER BY ss.sort_order ASC`
      ).bind(sessionId)
    );

    // Related sessions (same track or same day)
    const relatedSessions = await listSessions(db, congressId, {
      track_id: session.track_id ?? undefined,
    });
    const related = relatedSessions
      .filter((s) => s.id !== sessionId)
      .slice(0, 5);

    return success({
      session,
      track,
      room,
      speakers,
      relatedSessions: related,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── POST /api/congress/[congressId]/sessions ────────────────────────────

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();
  const { congressId } = await context.params;

  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  // Verify congress exists and user has access
  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  // Tenant isolation
  if (auth.organizationId !== congress.organization_id && auth.role !== 'admin' && auth.role !== 'superadmin') {
    return ERRORS.FORBIDDEN();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  // Validate time range
  if (input.end_time <= input.start_time) {
    return ERRORS.VALIDATION_ERROR('End time must be after start time');
  }

  try {
    const id = await createSession(db, {
      congress_id: congressId,
      title: input.title,
      session_type: input.session_type,
      start_time: input.start_time,
      end_time: input.end_time,
      track_id: input.track_id,
      room_id: input.room_id,
      description: input.description,
      max_attendees: input.max_attendees,
      is_bookable: input.is_bookable,
      requires_registration: input.requires_registration,
      language: input.language,
      cme_credits: input.cme_credits,
      sort_order: input.sort_order,
    });

    return success({ id }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
