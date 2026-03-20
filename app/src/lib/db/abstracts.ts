import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, parseJson } from './client';
import type { Abstract, AbstractAuthor, AbstractReview } from '@/types';
import type { AbstractStatus, ReviewRecommendation, PresentationType } from '@/types';

// ── Row types matching D1 ─────────────────────────────────────────────

interface AbstractRow {
  id: string;
  congress_id: string;
  user_id: string;
  track_id: string | null;
  title: string;
  body: string;
  keywords: string; // JSON TEXT in D1
  authors: string;  // JSON TEXT in D1
  presentation_type: string;
  status: string;
  submitted_at: string | null;
  decision_at: string | null;
  decision_notes: string | null;
  assigned_session_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ReviewRow {
  id: string;
  abstract_id: string;
  reviewer_id: string;
  recommendation: string;
  score_originality: number;
  score_methodology: number;
  score_relevance: number;
  score_clarity: number;
  score_overall: number;
  comments_to_author: string | null;
  comments_to_committee: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToAbstract(row: AbstractRow): Abstract {
  return {
    ...row,
    keywords: parseJson<string[]>(row.keywords, []),
    authors: parseJson<AbstractAuthor[]>(row.authors, []),
    presentation_type: row.presentation_type as PresentationType,
    status: row.status as AbstractStatus,
  };
}

function rowToReview(row: ReviewRow): AbstractReview {
  return {
    ...row,
    recommendation: row.recommendation as ReviewRecommendation,
  };
}

// ── Filters ───────────────────────────────────────────────────────────

export interface AbstractFilters {
  status?: AbstractStatus;
  trackId?: string;
  page?: number;
  pageSize?: number;
}

// ── List abstracts (paginated) ────────────────────────────────────────

export async function listAbstracts(
  db: D1Database,
  congressId: string,
  filters?: AbstractFilters
): Promise<{ abstracts: Abstract[]; total: number }> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;

  let countQuery = 'SELECT COUNT(*) as count FROM abstracts WHERE congress_id = ?';
  let query = 'SELECT * FROM abstracts WHERE congress_id = ?';
  const bindings: unknown[] = [congressId];

  if (filters?.status) {
    countQuery += ' AND status = ?';
    query += ' AND status = ?';
    bindings.push(filters.status);
  }
  if (filters?.trackId) {
    countQuery += ' AND track_id = ?';
    query += ' AND track_id = ?';
    bindings.push(filters.trackId);
  }

  const countRow = await getFirst<{ count: number }>(
    db.prepare(countQuery).bind(...bindings)
  );
  const total = countRow?.count ?? 0;

  const offset = (page - 1) * pageSize;
  query += ' ORDER BY submitted_at DESC, created_at DESC LIMIT ? OFFSET ?';

  const rows = await getAll<AbstractRow>(
    db.prepare(query).bind(...bindings, pageSize, offset)
  );

  return { abstracts: rows.map(rowToAbstract), total };
}

// ── Get single abstract ───────────────────────────────────────────────

export async function getAbstract(
  db: D1Database,
  id: string
): Promise<Abstract | null> {
  const row = await getFirst<AbstractRow>(
    db.prepare('SELECT * FROM abstracts WHERE id = ?').bind(id)
  );
  return row ? rowToAbstract(row) : null;
}

// ── Create abstract ───────────────────────────────────────────────────

export interface CreateAbstractInput {
  congress_id: string;
  user_id: string;
  track_id?: string | null;
  title: string;
  body: string;
  keywords: string[];
  authors: AbstractAuthor[];
  presentation_type: PresentationType;
  status?: AbstractStatus;
}

export async function createAbstract(
  db: D1Database,
  input: CreateAbstractInput
): Promise<string> {
  const id = generateId();
  const status = input.status ?? 'submitted';
  const submittedAt = status === 'submitted' ? new Date().toISOString() : null;

  await run(
    db.prepare(
      `INSERT INTO abstracts (id, congress_id, user_id, track_id, title, body, keywords, authors, presentation_type, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.congress_id,
      input.user_id,
      input.track_id ?? null,
      input.title,
      input.body,
      JSON.stringify(input.keywords),
      JSON.stringify(input.authors),
      input.presentation_type,
      status,
      submittedAt
    )
  );
  return id;
}

// ── Update abstract ───────────────────────────────────────────────────

export interface UpdateAbstractInput {
  track_id?: string | null;
  title?: string;
  body?: string;
  keywords?: string[];
  authors?: AbstractAuthor[];
  presentation_type?: PresentationType;
}

export async function updateAbstract(
  db: D1Database,
  id: string,
  input: UpdateAbstractInput
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === 'keywords' || key === 'authors') {
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
    db.prepare(`UPDATE abstracts SET ${sets.join(', ')} WHERE id = ?`).bind(...values)
  );
}

// ── Update abstract status ────────────────────────────────────────────

export async function updateAbstractStatus(
  db: D1Database,
  id: string,
  status: AbstractStatus,
  decisionNotes?: string
): Promise<void> {
  const isDecision = status === 'accepted' || status === 'rejected' || status === 'revision_requested';
  const decisionAt = isDecision ? new Date().toISOString() : null;

  await run(
    db.prepare(
      `UPDATE abstracts
       SET status = ?, decision_notes = COALESCE(?, decision_notes), decision_at = COALESCE(?, decision_at), updated_at = datetime('now')
       WHERE id = ?`
    ).bind(status, decisionNotes ?? null, decisionAt, id)
  );
}

// ── List reviews for abstract ─────────────────────────────────────────

export async function listReviews(
  db: D1Database,
  abstractId: string
): Promise<AbstractReview[]> {
  const rows = await getAll<ReviewRow>(
    db.prepare(
      'SELECT * FROM abstract_reviews WHERE abstract_id = ? ORDER BY created_at ASC'
    ).bind(abstractId)
  );
  return rows.map(rowToReview);
}

// ── Create review ─────────────────────────────────────────────────────

export interface CreateReviewInput {
  abstract_id: string;
  reviewer_id: string;
  recommendation: ReviewRecommendation;
  score_originality: number;
  score_methodology: number;
  score_relevance: number;
  score_clarity: number;
  comments_to_author?: string | null;
  comments_to_committee?: string | null;
}

export async function createReview(
  db: D1Database,
  input: CreateReviewInput
): Promise<string> {
  const id = generateId();
  const overallScore =
    (input.score_originality + input.score_methodology + input.score_relevance + input.score_clarity) / 4;
  const now = new Date().toISOString();

  await run(
    db.prepare(
      `INSERT INTO abstract_reviews (id, abstract_id, reviewer_id, recommendation, score_originality, score_methodology, score_relevance, score_clarity, score_overall, comments_to_author, comments_to_committee, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.abstract_id,
      input.reviewer_id,
      input.recommendation,
      input.score_originality,
      input.score_methodology,
      input.score_relevance,
      input.score_clarity,
      Math.round(overallScore * 100) / 100,
      input.comments_to_author ?? null,
      input.comments_to_committee ?? null,
      now
    )
  );
  return id;
}

// ── Assign reviewer ───────────────────────────────────────────────────

export async function assignReviewer(
  db: D1Database,
  abstractId: string,
  reviewerId: string
): Promise<void> {
  const id = generateId();
  await run(
    db.prepare(
      `INSERT INTO abstract_reviews (id, abstract_id, reviewer_id, recommendation, score_originality, score_methodology, score_relevance, score_clarity, score_overall)
       VALUES (?, ?, ?, '', 0, 0, 0, 0, 0)`
    ).bind(id, abstractId, reviewerId)
  );

  // Mark abstract as under review if still submitted
  await run(
    db.prepare(
      `UPDATE abstracts SET status = 'under_review', updated_at = datetime('now')
       WHERE id = ? AND status = 'submitted'`
    ).bind(abstractId)
  );
}

// ── Get average score ─────────────────────────────────────────────────

export async function getAverageScore(
  db: D1Database,
  abstractId: string
): Promise<number | null> {
  const row = await getFirst<{ avg_score: number | null }>(
    db.prepare(
      `SELECT AVG(score_overall) as avg_score
       FROM abstract_reviews
       WHERE abstract_id = ? AND completed_at IS NOT NULL`
    ).bind(abstractId)
  );
  return row?.avg_score ?? null;
}
