import type { D1Database } from './client';
import { getFirst, getAll, run, generateId } from './client';
import type { Registration } from '@/types';
import type { RegistrationStatus } from '@/types';

// Row type matching D1
interface RegistrationRow {
  id: string;
  congress_id: string;
  user_id: string;
  ticket_type: string;
  status: string;
  payment_status: string;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  qr_code: string | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  notes: string | null;
  registered_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToRegistration(row: RegistrationRow): Registration {
  return row as Registration;
}

export async function getRegistration(
  db: D1Database,
  congressId: string,
  userId: string
): Promise<Registration | null> {
  const row = await getFirst<RegistrationRow>(
    db.prepare(
      'SELECT * FROM registrations WHERE congress_id = ? AND user_id = ?'
    ).bind(congressId, userId)
  );
  return row ? rowToRegistration(row) : null;
}

export async function listRegistrations(
  db: D1Database,
  congressId: string,
  page: number,
  pageSize: number
): Promise<{ registrations: Registration[]; total: number }> {
  const countRow = await getFirst<{ count: number }>(
    db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE congress_id = ?'
    ).bind(congressId)
  );
  const total = countRow?.count ?? 0;

  const offset = (page - 1) * pageSize;
  const rows = await getAll<RegistrationRow>(
    db.prepare(
      `SELECT * FROM registrations
       WHERE congress_id = ?
       ORDER BY registered_at DESC
       LIMIT ? OFFSET ?`
    ).bind(congressId, pageSize, offset)
  );

  return {
    registrations: rows.map(rowToRegistration),
    total,
  };
}

export interface CreateRegistrationInput {
  congress_id: string;
  user_id: string;
  ticket_type: string;
  amount_cents: number;
  currency: string;
  dietary_requirements?: string;
  accessibility_needs?: string;
  notes?: string;
}

export async function createRegistration(
  db: D1Database,
  input: CreateRegistrationInput
): Promise<string> {
  const id = generateId();
  const qrCode = generateId(); // unique QR identifier

  await run(
    db.prepare(
      `INSERT INTO registrations (id, congress_id, user_id, ticket_type, amount_cents, currency, qr_code, dietary_requirements, accessibility_needs, notes, registered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      input.congress_id,
      input.user_id,
      input.ticket_type,
      input.amount_cents,
      input.currency,
      qrCode,
      input.dietary_requirements ?? null,
      input.accessibility_needs ?? null,
      input.notes ?? null
    )
  );
  return id;
}

export async function updateRegistrationStatus(
  db: D1Database,
  id: string,
  status: RegistrationStatus
): Promise<void> {
  const extraColumn = status === 'confirmed'
    ? ", confirmed_at = datetime('now')"
    : status === 'cancelled'
      ? ", cancelled_at = datetime('now')"
      : '';

  await run(
    db.prepare(
      `UPDATE registrations SET status = ?, updated_at = datetime('now')${extraColumn} WHERE id = ?`
    ).bind(status, id)
  );
}

export async function countRegistrations(
  db: D1Database,
  congressId: string
): Promise<number> {
  const row = await getFirst<{ count: number }>(
    db.prepare(
      "SELECT COUNT(*) as count FROM registrations WHERE congress_id = ? AND status != 'cancelled'"
    ).bind(congressId)
  );
  return row?.count ?? 0;
}
