import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, toBool } from './client';
import type { CmeCreditType, CmeCredit, SessionEvaluation, CmeCertificate } from '@/types';

// Row types matching D1
interface CreditTypeRow {
  id: string;
  congress_id: string;
  name: string;
  authority: string;
  country: string | null;
  max_credits: number;
  created_at: string;
}

interface CreditRow {
  id: string;
  credit_type_id: string;
  session_id: string;
  credits: number;
  created_at: string;
}

interface EvaluationRow {
  id: string;
  session_id: string;
  user_id: string;
  rating: number;
  feedback: string | null;
  is_anonymous: number;
  completed_at: string;
}

interface CertificateRow {
  id: string;
  congress_id: string;
  user_id: string;
  credit_type_id: string;
  total_credits: number;
  certificate_url: string | null;
  issued_at: string;
}

function rowToCreditType(row: CreditTypeRow): CmeCreditType {
  return row as CmeCreditType;
}

function rowToCredit(row: CreditRow): CmeCredit {
  return row as CmeCredit;
}

function rowToEvaluation(row: EvaluationRow): SessionEvaluation {
  return {
    ...row,
    is_anonymous: toBool(row.is_anonymous),
  } as SessionEvaluation;
}

function rowToCertificate(row: CertificateRow): CmeCertificate {
  return row as CmeCertificate;
}

export async function listCreditTypes(
  db: D1Database,
  congressId: string
): Promise<CmeCreditType[]> {
  const rows = await getAll<CreditTypeRow>(
    db.prepare(
      'SELECT * FROM cme_credit_types WHERE congress_id = ? ORDER BY name ASC'
    ).bind(congressId)
  );
  return rows.map(rowToCreditType);
}

export async function getUserCredits(
  db: D1Database,
  congressId: string,
  userId: string
): Promise<CmeCredit[]> {
  const rows = await getAll<CreditRow>(
    db.prepare(
      `SELECT c.* FROM cme_credits c
       JOIN session_evaluations e ON e.session_id = c.session_id AND e.user_id = ?
       JOIN sessions s ON s.id = c.session_id AND s.congress_id = ?
       ORDER BY c.created_at DESC`
    ).bind(userId, congressId)
  );
  return rows.map(rowToCredit);
}

export async function awardCredit(
  db: D1Database,
  input: { credit_type_id: string; session_id: string; credits: number }
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  await run(
    db.prepare(
      'INSERT INTO cme_credits (id, credit_type_id, session_id, credits, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, input.credit_type_id, input.session_id, input.credits, now)
  );
  return id;
}

export async function getEvaluation(
  db: D1Database,
  sessionId: string,
  userId: string
): Promise<SessionEvaluation | null> {
  const row = await getFirst<EvaluationRow>(
    db.prepare(
      'SELECT * FROM session_evaluations WHERE session_id = ? AND user_id = ?'
    ).bind(sessionId, userId)
  );
  return row ? rowToEvaluation(row) : null;
}

export async function submitEvaluation(
  db: D1Database,
  input: {
    session_id: string;
    user_id: string;
    rating: number;
    feedback?: string | null;
    is_anonymous?: boolean;
  }
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  await run(
    db.prepare(
      `INSERT INTO session_evaluations (id, session_id, user_id, rating, feedback, is_anonymous, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.session_id,
      input.user_id,
      input.rating,
      input.feedback ?? null,
      input.is_anonymous ? 1 : 0,
      now
    )
  );
  return id;
}

export async function getCertificate(
  db: D1Database,
  congressId: string,
  userId: string
): Promise<CmeCertificate | null> {
  const row = await getFirst<CertificateRow>(
    db.prepare(
      'SELECT * FROM cme_certificates WHERE congress_id = ? AND user_id = ?'
    ).bind(congressId, userId)
  );
  return row ? rowToCertificate(row) : null;
}
