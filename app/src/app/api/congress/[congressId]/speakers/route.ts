import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getCongress } from '@/lib/db/congresses';
import { listSpeakers } from '@/lib/db/speakers';
import { isAdmin } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

/**
 * GET /api/congress/[congressId]/speakers
 * List all speakers for a congress.
 * Public for published/live congresses, auth required for draft.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;

  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  // Draft/archived congresses require authentication
  if (congress.status === 'draft' || congress.status === 'archived') {
    const auth = await getRequestAuth();
    if (!auth) {
      return ERRORS.UNAUTHORIZED();
    }
    if (auth.organizationId !== congress.organization_id && !isAdmin(auth.role)) {
      return ERRORS.FORBIDDEN();
    }
  }

  const speakers = await listSpeakers(db, congressId);

  // Aggregate by unique user to include session list per speaker
  const speakerMap = new Map<string, {
    user_id: string;
    full_name: string;
    title: string | null;
    organization_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialty: string | null;
    linkedin_url: string | null;
    website: string | null;
    sessions: { session_id: string; session_title: string; speaker_role: string }[];
  }>();

  for (const row of speakers) {
    const existing = speakerMap.get(row.user_id);
    if (existing) {
      existing.sessions.push({
        session_id: row.session_id,
        session_title: row.session_title,
        speaker_role: row.speaker_role,
      });
    } else {
      speakerMap.set(row.user_id, {
        user_id: row.user_id,
        full_name: row.full_name,
        title: row.title,
        organization_name: row.organization_name,
        avatar_url: row.avatar_url,
        bio: row.bio,
        specialty: row.specialty,
        linkedin_url: row.linkedin_url,
        website: row.website,
        sessions: [{
          session_id: row.session_id,
          session_title: row.session_title,
          speaker_role: row.speaker_role,
        }],
      });
    }
  }

  return success(Array.from(speakerMap.values()));
}
