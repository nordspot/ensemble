import type { D1Database } from './client';
import { getAll, getFirst, run, generateId, toBool } from './client';

export interface SpeakerWithProfile {
  user_id: string;
  full_name: string;
  title: string | null;
  organization_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialty: string | null;
  linkedin_url: string | null;
  website: string | null;
  session_id: string;
  session_title: string;
  speaker_role: string;
}

export interface SpeakerSession {
  session_id: string;
  session_title: string;
  session_type: string;
  start_time: string;
  end_time: string;
  room_name: string | null;
  speaker_role: string;
}

export interface SpeakerDisclosureRow {
  id: string;
  congress_id: string;
  user_id: string;
  has_conflicts: number;
  disclosure_text: string | null;
  companies: string | null;
  submitted_at: string;
}

export interface SpeakerDisclosureResult {
  id: string;
  congress_id: string;
  user_id: string;
  has_conflicts: boolean;
  disclosure_text: string | null;
  companies: string[];
  submitted_at: string;
}

export async function listSpeakers(
  db: D1Database,
  congressId: string
): Promise<SpeakerWithProfile[]> {
  return getAll<SpeakerWithProfile>(
    db.prepare(`
      SELECT DISTINCT
        p.id as user_id,
        COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as full_name,
        p.title,
        p.affiliation as organization_name,
        p.avatar_url,
        p.bio,
        CASE WHEN p.specialties IS NOT NULL THEN p.specialties ELSE NULL END as specialty,
        p.linkedin_url,
        p.website,
        s.id as session_id,
        s.title as session_title,
        ss.role as speaker_role
      FROM session_speakers ss
      JOIN profiles p ON p.id = ss.user_id
      JOIN sessions s ON s.id = ss.session_id
      WHERE s.congress_id = ?
      ORDER BY full_name ASC
    `).bind(congressId)
  );
}

export async function getSpeakerProfile(
  db: D1Database,
  congressId: string,
  userId: string
): Promise<SpeakerWithProfile | null> {
  return getFirst<SpeakerWithProfile>(
    db.prepare(`
      SELECT
        p.id as user_id,
        COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as full_name,
        p.title,
        p.affiliation as organization_name,
        p.avatar_url,
        p.bio,
        CASE WHEN p.specialties IS NOT NULL THEN p.specialties ELSE NULL END as specialty,
        p.linkedin_url,
        p.website,
        s.id as session_id,
        s.title as session_title,
        ss.role as speaker_role
      FROM session_speakers ss
      JOIN profiles p ON p.id = ss.user_id
      JOIN sessions s ON s.id = ss.session_id
      WHERE s.congress_id = ? AND p.id = ?
      LIMIT 1
    `).bind(congressId, userId)
  );
}

export async function getSpeakerSessions(
  db: D1Database,
  congressId: string,
  userId: string
): Promise<SpeakerSession[]> {
  return getAll<SpeakerSession>(
    db.prepare(`
      SELECT
        s.id as session_id,
        s.title as session_title,
        s.session_type,
        s.start_time,
        s.end_time,
        r.name as room_name,
        ss.role as speaker_role
      FROM session_speakers ss
      JOIN sessions s ON s.id = ss.session_id
      LEFT JOIN rooms r ON r.id = s.room_id
      WHERE s.congress_id = ? AND ss.user_id = ?
      ORDER BY s.start_time ASC
    `).bind(congressId, userId)
  );
}

export async function getSpeakerDisclosure(
  db: D1Database,
  congressId: string,
  userId: string
): Promise<SpeakerDisclosureResult | null> {
  const row = await getFirst<SpeakerDisclosureRow>(
    db.prepare(`
      SELECT id, congress_id, user_id, has_conflicts, disclosure_text, companies, submitted_at
      FROM speaker_disclosures
      WHERE congress_id = ? AND user_id = ?
      LIMIT 1
    `).bind(congressId, userId)
  );
  if (!row) return null;
  return {
    ...row,
    has_conflicts: toBool(row.has_conflicts),
    companies: row.companies ? JSON.parse(row.companies) as string[] : [],
  };
}

export async function upsertSpeakerDisclosure(
  db: D1Database,
  congressId: string,
  userId: string,
  hasConflicts: boolean,
  disclosureText: string | null,
  companies: string[]
): Promise<string> {
  const existing = await getSpeakerDisclosure(db, congressId, userId);
  if (existing) {
    await run(
      db.prepare(`
        UPDATE speaker_disclosures
        SET has_conflicts = ?, disclosure_text = ?, companies = ?, submitted_at = datetime('now')
        WHERE congress_id = ? AND user_id = ?
      `).bind(
        hasConflicts ? 1 : 0,
        disclosureText,
        JSON.stringify(companies),
        congressId,
        userId
      )
    );
    return existing.id;
  }
  const id = generateId();
  await run(
    db.prepare(`
      INSERT INTO speaker_disclosures (id, congress_id, user_id, has_conflicts, disclosure_text, companies)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, congressId, userId, hasConflicts ? 1 : 0, disclosureText, JSON.stringify(companies))
  );
  return id;
}
