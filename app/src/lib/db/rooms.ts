import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, parseJson } from './client';
import type { Room } from '@/types';

// Row type matching D1 (equipment stored as JSON TEXT)
interface RoomRow {
  id: string;
  congress_id: string;
  name: string;
  floor: string | null;
  capacity: number | null;
  equipment: string;
  map_x: number | null;
  map_y: number | null;
  sort_order: number;
  created_at: string;
}

function rowToRoom(row: RoomRow): Room {
  return {
    ...row,
    equipment: parseJson<string[]>(row.equipment, []),
  } as Room;
}

export async function getRoom(db: D1Database, id: string): Promise<Room | null> {
  const row = await getFirst<RoomRow>(
    db.prepare('SELECT * FROM rooms WHERE id = ?').bind(id)
  );
  return row ? rowToRoom(row) : null;
}

export async function listRooms(db: D1Database, congressId: string): Promise<Room[]> {
  const rows = await getAll<RoomRow>(
    db.prepare(
      'SELECT * FROM rooms WHERE congress_id = ? ORDER BY sort_order ASC'
    ).bind(congressId)
  );
  return rows.map(rowToRoom);
}

export interface CreateRoomInput {
  congress_id: string;
  name: string;
  floor?: string;
  capacity?: number;
  equipment?: string[];
  map_x?: number;
  map_y?: number;
  sort_order?: number;
}

export async function createRoom(db: D1Database, input: CreateRoomInput): Promise<string> {
  const id = generateId();
  await run(
    db.prepare(
      `INSERT INTO rooms (id, congress_id, name, floor, capacity, equipment, map_x, map_y, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.congress_id,
      input.name,
      input.floor ?? null,
      input.capacity ?? null,
      JSON.stringify(input.equipment ?? []),
      input.map_x ?? null,
      input.map_y ?? null,
      input.sort_order ?? 0
    )
  );
  return id;
}

export interface UpdateRoomInput {
  name?: string;
  floor?: string;
  capacity?: number;
  equipment?: string[];
  map_x?: number;
  map_y?: number;
  sort_order?: number;
}

export async function updateRoom(db: D1Database, id: string, input: UpdateRoomInput): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === 'equipment') {
      sets.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (sets.length === 0) return;
  values.push(id);

  await run(
    db.prepare(`UPDATE rooms SET ${sets.join(', ')} WHERE id = ?`).bind(...values)
  );
}

export async function deleteRoom(db: D1Database, id: string): Promise<void> {
  await run(db.prepare('DELETE FROM rooms WHERE id = ?').bind(id));
}
