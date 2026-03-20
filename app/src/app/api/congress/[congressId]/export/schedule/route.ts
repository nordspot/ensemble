import { NextRequest, NextResponse } from 'next/server';
import { ERRORS } from '@/lib/api/response';
import { getDb } from '@/lib/api/server-helpers';
import { getCongress } from '@/lib/db/congresses';
import { listSessions } from '@/lib/db/sessions';
import { getAll } from '@/lib/db/client';
import { generateIcal } from '@/lib/export/ical';
import type { IcalEvent } from '@/lib/export/ical';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

interface SpeakerNameRow {
  session_id: string;
  title: string | null;
  first_name: string;
  last_name: string;
}

interface RoomRow {
  id: string;
  name: string;
}

// ── GET /api/congress/[congressId]/export/schedule ───────────────────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const { congressId } = await context.params;

  // Verify congress exists and is published (public endpoint)
  const congress = await getCongress(db, congressId);
  if (!congress) return ERRORS.NOT_FOUND('Congress not found');

  if (congress.status === 'draft') {
    return ERRORS.FORBIDDEN('Congress schedule is not yet published');
  }

  try {
    // Fetch all sessions
    const sessions = await listSessions(db, congressId);

    // Fetch speaker names for all sessions
    const speakerRows = await getAll<SpeakerNameRow>(
      db.prepare(
        `SELECT ss.session_id, p.title, p.first_name, p.last_name
         FROM session_speakers ss
         JOIN profiles p ON p.id = ss.user_id
         WHERE ss.session_id IN (
           SELECT id FROM sessions WHERE congress_id = ?
         )
         ORDER BY ss.sort_order ASC`
      ).bind(congressId)
    );

    const speakerMap: Record<string, string[]> = {};
    for (const row of speakerRows) {
      const name = [row.title, row.first_name, row.last_name]
        .filter(Boolean)
        .join(' ');
      if (!speakerMap[row.session_id]) speakerMap[row.session_id] = [];
      speakerMap[row.session_id].push(name);
    }

    // Fetch rooms
    const roomRows = await getAll<RoomRow>(
      db.prepare('SELECT id, name FROM rooms WHERE congress_id = ?').bind(congressId)
    );
    const roomMap: Record<string, string> = {};
    for (const r of roomRows) {
      roomMap[r.id] = r.name;
    }

    // Build iCal events
    const events: IcalEvent[] = sessions.map((s) => {
      const speakers = speakerMap[s.id] ?? [];
      const descriptionParts: string[] = [];

      if (s.description) descriptionParts.push(s.description);
      if (speakers.length > 0) {
        descriptionParts.push(`Speakers: ${speakers.join(', ')}`);
      }

      const location = s.room_id ? roomMap[s.room_id] : undefined;
      const venueParts = [location, congress.venue_name].filter(Boolean);

      return {
        uid: `${s.id}@ensemble.events`,
        title: s.title,
        description: descriptionParts.length > 0 ? descriptionParts.join('\n\n') : undefined,
        start: s.start_time,
        end: s.end_time,
        location: venueParts.length > 0 ? venueParts.join(', ') : undefined,
        timezone: congress.timezone ?? 'Europe/Zurich',
      };
    });

    const ical = generateIcal(events);
    const slug = congress.slug || congressId;

    return new NextResponse(ical, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="schedule-${slug}.ics"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
