import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, toBool } from './client';

// ── Row types ───────────────────────────────────────────────────────────

interface ArticleRow {
  id: string;
  congress_id: string;
  user_id: string;
  title: string;
  summary: string | null;
  keywords: string | null;
  file_key: string;
  file_type: string;
  file_size: number;
  is_published: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  congress_id: string;
  user_id: string;
  title: string;
  summary: string | null;
  keywords: string[];
  file_key: string;
  file_type: string;
  file_size: number;
  is_published: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

function rowToArticle(row: ArticleRow): Article {
  let keywords: string[] = [];
  if (row.keywords) {
    try {
      keywords = JSON.parse(row.keywords) as string[];
    } catch {
      keywords = [];
    }
  }
  return {
    ...row,
    keywords,
    is_published: toBool(row.is_published),
  };
}

// ── Queries ─────────────────────────────────────────────────────────────

export interface ListArticlesOptions {
  published?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listArticles(
  db: D1Database,
  congressId: string,
  options: ListArticlesOptions = {},
): Promise<{ articles: Article[]; total: number }> {
  const { published, page = 1, pageSize = 20 } = options;
  const offset = (page - 1) * pageSize;

  let where = 'WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (published !== undefined) {
    where += ' AND is_published = ?';
    bindings.push(published ? 1 : 0);
  }

  const countRow = await getFirst<{ cnt: number }>(
    db.prepare(`SELECT COUNT(*) as cnt FROM articles ${where}`).bind(...bindings),
  );
  const total = countRow?.cnt ?? 0;

  const rows = await getAll<ArticleRow>(
    db
      .prepare(
        `SELECT * FROM articles ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(...bindings, pageSize, offset),
  );

  return { articles: rows.map(rowToArticle), total };
}

export async function getArticle(
  db: D1Database,
  id: string,
): Promise<Article | null> {
  const row = await getFirst<ArticleRow>(
    db.prepare('SELECT * FROM articles WHERE id = ?').bind(id),
  );
  return row ? rowToArticle(row) : null;
}

export interface CreateArticleInput {
  congress_id: string;
  user_id: string;
  title: string;
  summary?: string;
  keywords?: string[];
  file_key: string;
  file_type: string;
  file_size: number;
}

export async function createArticle(
  db: D1Database,
  input: CreateArticleInput,
): Promise<string> {
  const id = generateId();
  await run(
    db
      .prepare(
        `INSERT INTO articles (id, congress_id, user_id, title, summary, keywords, file_key, file_type, file_size, is_published, view_count, download_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, datetime('now'), datetime('now'))`,
      )
      .bind(
        id,
        input.congress_id,
        input.user_id,
        input.title,
        input.summary ?? null,
        input.keywords ? JSON.stringify(input.keywords) : null,
        input.file_key,
        input.file_type,
        input.file_size,
      ),
  );
  return id;
}

export interface UpdateArticleInput {
  title?: string;
  summary?: string;
  keywords?: string[];
  is_published?: boolean;
}

export async function updateArticle(
  db: D1Database,
  id: string,
  input: UpdateArticleInput,
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    sets.push('title = ?');
    values.push(input.title);
  }
  if (input.summary !== undefined) {
    sets.push('summary = ?');
    values.push(input.summary);
  }
  if (input.keywords !== undefined) {
    sets.push('keywords = ?');
    values.push(JSON.stringify(input.keywords));
  }
  if (input.is_published !== undefined) {
    sets.push('is_published = ?');
    values.push(input.is_published ? 1 : 0);
  }

  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  values.push(id);

  await run(
    db
      .prepare(`UPDATE articles SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...values),
  );
}

export async function incrementViewCount(
  db: D1Database,
  id: string,
): Promise<void> {
  await run(
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').bind(id),
  );
}
