import type { D1Database } from './client';
import { getFirst, getAll, run, generateId } from './client';
import type { Track } from '@/types';

// Row type matching D1
interface TrackRow {
  id: string;
  congress_id: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
}

function rowToTrack(row: TrackRow): Track {
  return row as Track;
}

export async function getTrack(db: D1Database, id: string): Promise<Track | null> {
  const row = await getFirst<TrackRow>(
    db.prepare('SELECT * FROM tracks WHERE id = ?').bind(id)
  );
  return row ? rowToTrack(row) : null;
}

export async function listTracks(db: D1Database, congressId: string): Promise<Track[]> {
  const rows = await getAll<TrackRow>(
    db.prepare(
      'SELECT * FROM tracks WHERE congress_id = ? ORDER BY sort_order ASC'
    ).bind(congressId)
  );
  return rows.map(rowToTrack);
}

export interface CreateTrackInput {
  congress_id: string;
  name: string;
  description?: string;
  color?: string;
  sort_order?: number;
}

export async function createTrack(db: D1Database, input: CreateTrackInput): Promise<string> {
  const id = generateId();
  await run(
    db.prepare(
      `INSERT INTO tracks (id, congress_id, name, description, color, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.congress_id,
      input.name,
      input.description ?? null,
      input.color ?? null,
      input.sort_order ?? 0
    )
  );
  return id;
}

export interface UpdateTrackInput {
  name?: string;
  description?: string;
  color?: string;
  sort_order?: number;
}

export async function updateTrack(db: D1Database, id: string, input: UpdateTrackInput): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    sets.push(`${key} = ?`);
    values.push(value);
  }

  if (sets.length === 0) return;
  values.push(id);

  await run(
    db.prepare(`UPDATE tracks SET ${sets.join(', ')} WHERE id = ?`).bind(...values)
  );
}

export async function deleteTrack(db: D1Database, id: string): Promise<void> {
  await run(db.prepare('DELETE FROM tracks WHERE id = ?').bind(id));
}
