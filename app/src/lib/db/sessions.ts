import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, toBool, parseJson } from './client';
import type { Session, SessionSpeaker } from '@/types';
import type { SpeakerRole } from '@/types';

// Row type matching D1 (booleans as 0/1, JSON as TEXT)
interface SessionRow {
  id: string;
  congress_id: string;
  track_id: string | null;
  room_id: string | null;
  title: string;
  description: string | null;
  session_type: string;
  status: string;
  start_time: string;
  end_time: string;
  max_attendees: number | null;
  is_bookable: number;
  requires_registration: number;
  livestream_url: string | null;
  recording_url: string | null;
  slides_url: string | null;
  language: string | null;
  cme_credits: number | null;
  sort_order: number;
  settings: string;
  created_at: string;
  updated_at: string;
}

function rowToSession(row: SessionRow): Session {
  return {
    ...row,
    is_bookable: toBool(row.is_bookable),
    requires_registration: toBool(row.requires_registration),
    settings: parseJson<Record<string, unknown>>(row.settings, {}),
  } as Session;
}

interface SessionSpeakerRow {
  session_id: string;
  user_id: string;
  role: string;
  sort_order: number;
}

function rowToSessionSpeaker(row: SessionSpeakerRow): SessionSpeaker {
  return row as SessionSpeaker;
}

export async function getSession(db: D1Database, id: string): Promise<Session | null> {
  const row = await getFirst<SessionRow>(
    db.prepare('SELECT * FROM sessions WHERE id = ?').bind(id)
  );
  return row ? rowToSession(row) : null;
}

export interface SessionFilters {
  track_id?: string;
  room_id?: string;
  session_type?: string;
  status?: string;
}

export async function listSessions(
  db: D1Database,
  congressId: string,
  filters?: SessionFilters
): Promise<Session[]> {
  let query = 'SELECT * FROM sessions WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (filters?.track_id) {
    query += ' AND track_id = ?';
    bindings.push(filters.track_id);
  }
  if (filters?.room_id) {
    query += ' AND room_id = ?';
    bindings.push(filters.room_id);
  }
  if (filters?.session_type) {
    query += ' AND session_type = ?';
    bindings.push(filters.session_type);
  }
  if (filters?.status) {
    query += ' AND status = ?';
    bindings.push(filters.status);
  }

  query += ' ORDER BY start_time ASC, sort_order ASC';

  const rows = await getAll<SessionRow>(
    db.prepare(query).bind(...bindings)
  );
  return rows.map(rowToSession);
}

export async function listSessionsByDate(
  db: D1Database,
  congressId: string,
  date: string
): Promise<Session[]> {
  const rows = await getAll<SessionRow>(
    db.prepare(
      `SELECT * FROM sessions
       WHERE congress_id = ? AND DATE(start_time) = ?
       ORDER BY start_time ASC, sort_order ASC`
    ).bind(congressId, date)
  );
  return rows.map(rowToSession);
}

export interface CreateSessionInput {
  congress_id: string;
  title: string;
  session_type: string;
  start_time: string;
  end_time: string;
  track_id?: string;
  room_id?: string;
  description?: string;
  max_attendees?: number;
  is_bookable?: boolean;
  requires_registration?: boolean;
  language?: string;
  cme_credits?: number;
  sort_order?: number;
}

export async function createSession(db: D1Database, input: CreateSessionInput): Promise<string> {
  const id = generateId();
  await run(
    db.prepare(
      `INSERT INTO sessions (id, congress_id, title, session_type, start_time, end_time, track_id, room_id, description, max_attendees, is_bookable, requires_registration, language, cme_credits, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.congress_id,
      input.title,
      input.session_type,
      input.start_time,
      input.end_time,
      input.track_id ?? null,
      input.room_id ?? null,
      input.description ?? null,
      input.max_attendees ?? null,
      input.is_bookable ? 1 : 0,
      input.requires_registration ? 1 : 0,
      input.language ?? null,
      input.cme_credits ?? null,
      input.sort_order ?? 0
    )
  );
  return id;
}

export interface UpdateSessionInput {
  title?: string;
  description?: string;
  session_type?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  track_id?: string;
  room_id?: string;
  max_attendees?: number;
  is_bookable?: boolean;
  requires_registration?: boolean;
  livestream_url?: string;
  recording_url?: string;
  slides_url?: string;
  language?: string;
  cme_credits?: number;
  sort_order?: number;
  settings?: Record<string, unknown>;
}

export async function updateSession(db: D1Database, id: string, input: UpdateSessionInput): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === 'is_bookable' || key === 'requires_registration') {
      sets.push(`${key} = ?`);
      values.push(value ? 1 : 0);
    } else if (key === 'settings') {
      sets.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  values.push(id);

  await run(
    db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`).bind(...values)
  );
}

export async function deleteSession(db: D1Database, id: string): Promise<void> {
  await run(db.prepare('DELETE FROM sessions WHERE id = ?').bind(id));
}

export async function getSessionSpeakers(db: D1Database, sessionId: string): Promise<SessionSpeaker[]> {
  const rows = await getAll<SessionSpeakerRow>(
    db.prepare(
      'SELECT * FROM session_speakers WHERE session_id = ? ORDER BY sort_order ASC'
    ).bind(sessionId)
  );
  return rows.map(rowToSessionSpeaker);
}

export async function addSessionSpeaker(
  db: D1Database,
  sessionId: string,
  userId: string,
  role: SpeakerRole
): Promise<void> {
  // Get next sort_order
  const maxRow = await getFirst<{ max_order: number | null }>(
    db.prepare(
      'SELECT MAX(sort_order) as max_order FROM session_speakers WHERE session_id = ?'
    ).bind(sessionId)
  );
  const nextOrder = (maxRow?.max_order ?? -1) + 1;

  await run(
    db.prepare(
      'INSERT INTO session_speakers (session_id, user_id, role, sort_order) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, userId, role, nextOrder)
  );
}

export async function removeSessionSpeaker(
  db: D1Database,
  sessionId: string,
  userId: string
): Promise<void> {
  await run(
    db.prepare(
      'DELETE FROM session_speakers WHERE session_id = ? AND user_id = ?'
    ).bind(sessionId, userId)
  );
}
