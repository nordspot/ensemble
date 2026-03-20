import type { D1Database } from './client';
import { getFirst, getAll, run, generateId } from './client';
import type { CheckinMethod } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────

export interface Checkin {
  id: string;
  congress_id: string;
  session_id: string | null;
  user_id: string;
  method: CheckinMethod;
  beacon_id: string | null;
  checked_in_at: string;
}

interface CheckinRow {
  id: string;
  congress_id: string;
  session_id: string | null;
  user_id: string;
  method: string;
  beacon_id: string | null;
  checked_in_at: string;
}

function rowToCheckin(row: CheckinRow): Checkin {
  return row as Checkin;
}

// ── Create check-in ──────────────────────────────────────────────────

export interface CreateCheckinInput {
  congress_id: string;
  session_id?: string | null;
  user_id: string;
  method: CheckinMethod;
  beacon_id?: string | null;
}

export async function createCheckin(
  db: D1Database,
  input: CreateCheckinInput
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();

  await run(
    db.prepare(
      `INSERT INTO checkins (id, congress_id, session_id, user_id, method, beacon_id, checked_in_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.congress_id,
      input.session_id ?? null,
      input.user_id,
      input.method,
      input.beacon_id ?? null,
      now
    )
  );
  return id;
}

// ── Get check-in (dedup check) ───────────────────────────────────────

export async function getCheckin(
  db: D1Database,
  congressId: string,
  sessionId: string | null,
  userId: string
): Promise<Checkin | null> {
  const query = sessionId
    ? 'SELECT * FROM checkins WHERE congress_id = ? AND session_id = ? AND user_id = ?'
    : 'SELECT * FROM checkins WHERE congress_id = ? AND session_id IS NULL AND user_id = ?';

  const bindings = sessionId
    ? [congressId, sessionId, userId]
    : [congressId, userId];

  const row = await getFirst<CheckinRow>(
    db.prepare(query).bind(...bindings)
  );
  return row ? rowToCheckin(row) : null;
}

// ── List check-ins ───────────────────────────────────────────────────

export async function listCheckins(
  db: D1Database,
  congressId: string,
  sessionId?: string
): Promise<Checkin[]> {
  let query = 'SELECT * FROM checkins WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (sessionId) {
    query += ' AND session_id = ?';
    bindings.push(sessionId);
  }

  query += ' ORDER BY checked_in_at DESC';

  const rows = await getAll<CheckinRow>(
    db.prepare(query).bind(...bindings)
  );
  return rows.map(rowToCheckin);
}

// ── Count check-ins ──────────────────────────────────────────────────

export async function countCheckins(
  db: D1Database,
  congressId: string,
  sessionId?: string
): Promise<number> {
  let query = 'SELECT COUNT(*) as count FROM checkins WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (sessionId) {
    query += ' AND session_id = ?';
    bindings.push(sessionId);
  }

  const row = await getFirst<{ count: number }>(
    db.prepare(query).bind(...bindings)
  );
  return row?.count ?? 0;
}
