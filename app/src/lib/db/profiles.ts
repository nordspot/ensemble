import type { D1Database } from './client';
import { getFirst, getAll, run, generateId, parseJson } from './client';
import type { Profile } from '@/types';

// Row type matching D1 (JSON arrays as TEXT)
interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  title: string | null;
  affiliation: string | null;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  language: string;
  timezone: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  orcid_id: string | null;
  website: string | null;
  specialties: string;
  interests: string;
  role: string;
  privacy_level: string;
  push_token: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    ...row,
    specialties: parseJson<string[]>(row.specialties, []),
    interests: parseJson<string[]>(row.interests, []),
  } as Profile;
}

export async function getProfile(db: D1Database, id: string): Promise<Profile | null> {
  const row = await getFirst<ProfileRow>(
    db.prepare('SELECT * FROM profiles WHERE id = ?').bind(id)
  );
  return row ? rowToProfile(row) : null;
}

export async function getProfileByEmail(db: D1Database, email: string): Promise<Profile | null> {
  const row = await getFirst<ProfileRow>(
    db.prepare('SELECT * FROM profiles WHERE email = ?').bind(email)
  );
  return row ? rowToProfile(row) : null;
}

export interface CreateProfileInput {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  title?: string;
  affiliation?: string;
  country?: string;
  city?: string;
  language?: string;
  role?: string;
}

export async function createProfile(db: D1Database, input: CreateProfileInput): Promise<string> {
  const id = generateId();
  await run(
    db.prepare(
      `INSERT INTO profiles (id, email, first_name, last_name, display_name, title, affiliation, country, city, language, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      input.email,
      input.first_name,
      input.last_name,
      input.display_name ?? null,
      input.title ?? null,
      input.affiliation ?? null,
      input.country ?? null,
      input.city ?? null,
      input.language ?? 'de',
      input.role ?? 'attendee'
    )
  );
  return id;
}

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  title?: string;
  affiliation?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  country?: string;
  city?: string;
  language?: string;
  timezone?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  orcid_id?: string;
  website?: string;
  specialties?: string[];
  interests?: string[];
  privacy_level?: string;
  push_token?: string;
}

export async function updateProfile(db: D1Database, id: string, input: UpdateProfileInput): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === 'specialties' || key === 'interests') {
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
    db.prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE id = ?`).bind(...values)
  );
}

interface ProfileWithCongressRow extends ProfileRow {
  total_count: number;
}

export async function listProfilesByCongress(
  db: D1Database,
  congressId: string,
  page: number,
  pageSize: number
): Promise<{ profiles: Profile[]; total: number }> {
  // Count total
  const countRow = await getFirst<{ count: number }>(
    db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE congress_id = ?'
    ).bind(congressId)
  );
  const total = countRow?.count ?? 0;

  // Fetch paginated profiles via registration join
  const offset = (page - 1) * pageSize;
  const rows = await getAll<ProfileRow>(
    db.prepare(
      `SELECT p.* FROM profiles p
       INNER JOIN registrations r ON r.user_id = p.id
       WHERE r.congress_id = ?
       ORDER BY p.last_name ASC, p.first_name ASC
       LIMIT ? OFFSET ?`
    ).bind(congressId, pageSize, offset)
  );

  return {
    profiles: rows.map(rowToProfile),
    total,
  };
}
