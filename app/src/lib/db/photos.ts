import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, toBool } from './client';

// ── Row types ───────────────────────────────────────────────────────────

interface PhotoRow {
  id: string;
  congress_id: string;
  user_id: string;
  user_name: string;
  r2_key: string;
  thumbnail_key: string | null;
  caption: string | null;
  location: string | null;
  is_public: number;
  is_featured: number;
  like_count: number;
  created_at: string;
}

export interface Photo {
  id: string;
  congress_id: string;
  user_id: string;
  user_name: string;
  r2_key: string;
  thumbnail_key: string | null;
  caption: string | null;
  location: string | null;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  created_at: string;
}

function rowToPhoto(row: PhotoRow): Photo {
  return {
    ...row,
    is_public: toBool(row.is_public),
    is_featured: toBool(row.is_featured),
  };
}

// ── Queries ─────────────────────────────────────────────────────────────

export interface ListPhotosOptions {
  isPublic?: boolean;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export async function listPhotos(
  db: D1Database,
  congressId: string,
  options: ListPhotosOptions = {},
): Promise<{ photos: Photo[]; total: number }> {
  const { isPublic, userId, page = 1, pageSize = 24 } = options;
  const offset = (page - 1) * pageSize;

  let where = 'WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (isPublic !== undefined) {
    where += ' AND is_public = ?';
    bindings.push(isPublic ? 1 : 0);
  }

  if (userId) {
    where += ' AND user_id = ?';
    bindings.push(userId);
  }

  const countRow = await getFirst<{ cnt: number }>(
    db.prepare(`SELECT COUNT(*) as cnt FROM photos ${where}`).bind(...bindings),
  );
  const total = countRow?.cnt ?? 0;

  const rows = await getAll<PhotoRow>(
    db
      .prepare(
        `SELECT * FROM photos ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(...bindings, pageSize, offset),
  );

  return { photos: rows.map(rowToPhoto), total };
}

export async function getPhotosForGallery(
  db: D1Database,
  congressId: string,
  page = 1,
  pageSize = 24,
): Promise<{ photos: Photo[]; total: number }> {
  return listPhotos(db, congressId, { isPublic: true, page, pageSize });
}

export interface CreatePhotoInput {
  congress_id: string;
  user_id: string;
  user_name: string;
  r2_key: string;
  thumbnail_key?: string;
  caption?: string;
  location?: string;
  is_public?: boolean;
}

export async function createPhoto(
  db: D1Database,
  input: CreatePhotoInput,
): Promise<string> {
  const id = generateId();
  await run(
    db
      .prepare(
        `INSERT INTO photos (id, congress_id, user_id, user_name, r2_key, thumbnail_key, caption, location, is_public, is_featured, like_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'))`,
      )
      .bind(
        id,
        input.congress_id,
        input.user_id,
        input.user_name,
        input.r2_key,
        input.thumbnail_key ?? null,
        input.caption ?? null,
        input.location ?? null,
        input.is_public ? 1 : 0,
      ),
  );
  return id;
}

export async function deletePhoto(
  db: D1Database,
  id: string,
  userId: string,
): Promise<void> {
  await run(
    db
      .prepare('DELETE FROM photos WHERE id = ? AND user_id = ?')
      .bind(id, userId),
  );
}

export async function togglePublic(
  db: D1Database,
  id: string,
  userId: string,
): Promise<void> {
  await run(
    db
      .prepare(
        `UPDATE photos SET is_public = CASE WHEN is_public = 1 THEN 0 ELSE 1 END, updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
      )
      .bind(id, userId),
  );
}
