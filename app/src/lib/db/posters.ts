import type { D1Database } from './client';
import { getFirst, getAll, run, generateId } from './client';

// ── Row types ───────────────────────────────────────────────────────────

interface PosterRow {
  id: string;
  congress_id: string;
  user_id: string;
  title: string;
  authors: string;
  poster_number: string | null;
  category: string | null;
  abstract: string | null;
  file_key: string;
  thumbnail_key: string | null;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface Poster {
  id: string;
  congress_id: string;
  user_id: string;
  title: string;
  authors: string;
  poster_number: string | null;
  category: string | null;
  abstract: string | null;
  file_key: string;
  thumbnail_key: string | null;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

function rowToPoster(row: PosterRow): Poster {
  return { ...row };
}

// ── Queries ─────────────────────────────────────────────────────────────

export interface ListPostersOptions {
  category?: string;
  page?: number;
  pageSize?: number;
}

export async function listPosters(
  db: D1Database,
  congressId: string,
  options: ListPostersOptions = {},
): Promise<{ posters: Poster[]; total: number }> {
  const { category, page = 1, pageSize = 20 } = options;
  const offset = (page - 1) * pageSize;

  let where = 'WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (category) {
    where += ' AND category = ?';
    bindings.push(category);
  }

  const countRow = await getFirst<{ cnt: number }>(
    db.prepare(`SELECT COUNT(*) as cnt FROM posters ${where}`).bind(...bindings),
  );
  const total = countRow?.cnt ?? 0;

  const rows = await getAll<PosterRow>(
    db
      .prepare(
        `SELECT * FROM posters ${where} ORDER BY poster_number ASC, created_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(...bindings, pageSize, offset),
  );

  return { posters: rows.map(rowToPoster), total };
}

export async function getPoster(
  db: D1Database,
  id: string,
): Promise<Poster | null> {
  const row = await getFirst<PosterRow>(
    db.prepare('SELECT * FROM posters WHERE id = ?').bind(id),
  );
  return row ? rowToPoster(row) : null;
}

export interface CreatePosterInput {
  congress_id: string;
  user_id: string;
  title: string;
  authors: string;
  poster_number?: string;
  category?: string;
  abstract?: string;
  file_key: string;
  thumbnail_key?: string;
}

export async function createPoster(
  db: D1Database,
  input: CreatePosterInput,
): Promise<string> {
  const id = generateId();
  await run(
    db
      .prepare(
        `INSERT INTO posters (id, congress_id, user_id, title, authors, poster_number, category, abstract, file_key, thumbnail_key, vote_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
      )
      .bind(
        id,
        input.congress_id,
        input.user_id,
        input.title,
        input.authors,
        input.poster_number ?? null,
        input.category ?? null,
        input.abstract ?? null,
        input.file_key,
        input.thumbnail_key ?? null,
      ),
  );
  return id;
}

export async function voteForPoster(
  db: D1Database,
  posterId: string,
  userId: string,
): Promise<void> {
  // Check if already voted
  const existing = await getFirst<{ poster_id: string }>(
    db
      .prepare('SELECT poster_id FROM poster_votes WHERE poster_id = ? AND user_id = ?')
      .bind(posterId, userId),
  );
  if (existing) return;

  // Insert vote record and increment counter
  await run(
    db
      .prepare('INSERT INTO poster_votes (poster_id, user_id, created_at) VALUES (?, ?, datetime(\'now\'))')
      .bind(posterId, userId),
  );
  await run(
    db
      .prepare('UPDATE posters SET vote_count = vote_count + 1 WHERE id = ?')
      .bind(posterId),
  );
}
