import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, toBool, parseJson } from './client';
import type { Exhibitor, ExhibitorLead } from '@/types';

// Row type matching D1 (booleans as 0/1, JSON arrays as TEXT)
interface ExhibitorRow {
  id: string;
  congress_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  booth_number: string | null;
  booth_size: string;
  booth_map_x: number | null;
  booth_map_y: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  products: string;
  documents: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function rowToExhibitor(row: ExhibitorRow): Exhibitor {
  return {
    ...row,
    products: parseJson<string[]>(row.products, []),
    documents: parseJson<Exhibitor['documents']>(row.documents, []),
    is_active: toBool(row.is_active),
  } as Exhibitor;
}

interface ExhibitorLeadRow {
  id: string;
  exhibitor_id: string;
  user_id: string;
  scanned_by: string;
  notes: string | null;
  rating: number | null;
  scanned_at: string;
}

function rowToLead(row: ExhibitorLeadRow): ExhibitorLead {
  return row as ExhibitorLead;
}

export async function listExhibitors(
  db: D1Database,
  congressId: string
): Promise<Exhibitor[]> {
  const rows = await getAll<ExhibitorRow>(
    db.prepare(
      'SELECT * FROM exhibitors WHERE congress_id = ? AND is_active = 1 ORDER BY name ASC'
    ).bind(congressId)
  );
  return rows.map(rowToExhibitor);
}

export async function getExhibitor(
  db: D1Database,
  id: string
): Promise<Exhibitor | null> {
  const row = await getFirst<ExhibitorRow>(
    db.prepare('SELECT * FROM exhibitors WHERE id = ?').bind(id)
  );
  return row ? rowToExhibitor(row) : null;
}

export interface CreateExhibitorInput {
  congress_id: string;
  organization_id?: string | null;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
  booth_number?: string | null;
  booth_size: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  products?: string[];
}

export async function createExhibitor(
  db: D1Database,
  input: CreateExhibitorInput
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  await run(
    db.prepare(
      `INSERT INTO exhibitors (id, congress_id, organization_id, name, description, logo_url, website, booth_number, booth_size, contact_email, contact_phone, products, documents, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 1, ?, ?)`
    ).bind(
      id,
      input.congress_id,
      input.organization_id ?? null,
      input.name,
      input.description ?? null,
      input.logo_url ?? null,
      input.website ?? null,
      input.booth_number ?? null,
      input.booth_size,
      input.contact_email ?? null,
      input.contact_phone ?? null,
      JSON.stringify(input.products ?? []),
      now,
      now
    )
  );
  return id;
}

export async function listLeads(
  db: D1Database,
  exhibitorId: string
): Promise<ExhibitorLead[]> {
  const rows = await getAll<ExhibitorLeadRow>(
    db.prepare(
      'SELECT * FROM exhibitor_leads WHERE exhibitor_id = ? ORDER BY scanned_at DESC'
    ).bind(exhibitorId)
  );
  return rows.map(rowToLead);
}

export interface CreateLeadInput {
  exhibitor_id: string;
  user_id: string;
  scanned_by: string;
  notes?: string | null;
  rating?: number | null;
}

export async function createLead(
  db: D1Database,
  input: CreateLeadInput
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  await run(
    db.prepare(
      `INSERT INTO exhibitor_leads (id, exhibitor_id, user_id, scanned_by, notes, rating, scanned_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.exhibitor_id,
      input.user_id,
      input.scanned_by,
      input.notes ?? null,
      input.rating ?? null,
      now
    )
  );
  return id;
}
