import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, toBool, parseJson } from './client';
import type { Congress } from '@/types';

// Row type matching D1 (booleans as 0/1, JSON as TEXT)
interface CongressRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  discipline: string;
  start_date: string;
  end_date: string;
  timezone: string;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_country: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  indoor_map_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  max_attendees: number | null;
  registration_open: number;
  registration_deadline: string | null;
  abstract_submission_open: number;
  abstract_deadline: string | null;
  early_bird_deadline: string | null;
  early_bird_price_cents: number | null;
  regular_price_cents: number | null;
  currency: string;
  status: string;
  settings: string;
  created_at: string;
  updated_at: string;
}

function rowToCongress(row: CongressRow): Congress {
  return {
    ...row,
    registration_open: toBool(row.registration_open),
    abstract_submission_open: toBool(row.abstract_submission_open),
    settings: parseJson<Record<string, unknown>>(row.settings, {}),
  } as Congress;
}

export async function getCongress(db: D1Database, id: string): Promise<Congress | null> {
  const row = await getFirst<CongressRow>(
    db.prepare('SELECT * FROM congresses WHERE id = ?').bind(id)
  );
  return row ? rowToCongress(row) : null;
}

export async function getCongressBySlug(db: D1Database, orgId: string, slug: string): Promise<Congress | null> {
  const row = await getFirst<CongressRow>(
    db.prepare('SELECT * FROM congresses WHERE organization_id = ? AND slug = ?').bind(orgId, slug)
  );
  return row ? rowToCongress(row) : null;
}

export async function listCongresses(db: D1Database, orgId: string): Promise<Congress[]> {
  const rows = await getAll<CongressRow>(
    db.prepare('SELECT * FROM congresses WHERE organization_id = ? ORDER BY start_date DESC').bind(orgId)
  );
  return rows.map(rowToCongress);
}

export async function listPublishedCongresses(db: D1Database): Promise<Congress[]> {
  const rows = await getAll<CongressRow>(
    db.prepare("SELECT * FROM congresses WHERE status IN ('published', 'live') ORDER BY start_date DESC")
  );
  return rows.map(rowToCongress);
}

// CreateCongressInput — subset of fields needed to create
export interface CreateCongressInput {
  organization_id: string;
  name: string;
  slug: string;
  discipline: string;
  start_date: string;
  end_date: string;
  subtitle?: string;
  description?: string;
  venue_name?: string;
  venue_city?: string;
  venue_country?: string;
}

export async function createCongress(db: D1Database, input: CreateCongressInput): Promise<string> {
  const id = generateId();
  await run(
    db.prepare(
      `INSERT INTO congresses (id, organization_id, name, slug, discipline, start_date, end_date, subtitle, description, venue_name, venue_city, venue_country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.organization_id,
      input.name,
      input.slug,
      input.discipline,
      input.start_date,
      input.end_date,
      input.subtitle ?? null,
      input.description ?? null,
      input.venue_name ?? null,
      input.venue_city ?? null,
      input.venue_country ?? null
    )
  );
  return id;
}

export interface UpdateCongressInput {
  name?: string;
  subtitle?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  max_attendees?: number;
  registration_open?: boolean;
  registration_deadline?: string;
  abstract_submission_open?: boolean;
  abstract_deadline?: string;
  early_bird_deadline?: string;
  early_bird_price_cents?: number;
  regular_price_cents?: number;
  status?: string;
  settings?: Record<string, unknown>;
}

export async function updateCongress(db: D1Database, id: string, input: UpdateCongressInput): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  // Build dynamic SET clause
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === 'registration_open' || key === 'abstract_submission_open') {
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
    db.prepare(`UPDATE congresses SET ${sets.join(', ')} WHERE id = ?`).bind(...values)
  );
}

export async function deleteCongress(db: D1Database, id: string): Promise<void> {
  await run(db.prepare('DELETE FROM congresses WHERE id = ?').bind(id));
}
