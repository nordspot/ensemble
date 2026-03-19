import { getTranslations } from 'next-intl/server';
import { SpeakerDirectory } from '@/components/congress/speaker-directory';
import type { SpeakerCardData } from '@/components/congress/speaker-card';

interface SpeakerWithProfile {
  user_id: string;
  full_name: string;
  title: string | null;
  organization_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  session_id: string;
  session_title: string;
  speaker_role: string;
}

/**
 * Aggregate flat speaker-session rows into deduplicated SpeakerCardData
 * with session counts.
 */
function aggregateSpeakers(rows: SpeakerWithProfile[]): SpeakerCardData[] {
  const map = new Map<string, SpeakerCardData & { sessionIds: Set<string> }>();
  for (const row of rows) {
    const existing = map.get(row.user_id);
    if (existing) {
      existing.sessionIds.add(row.session_id);
      existing.session_count = existing.sessionIds.size;
    } else {
      map.set(row.user_id, {
        user_id: row.user_id,
        full_name: row.full_name,
        title: row.title,
        organization_name: row.organization_name,
        avatar_url: row.avatar_url,
        specialty: row.specialty,
        session_count: 1,
        sessionIds: new Set([row.session_id]),
      });
    }
  }
  return Array.from(map.values()).map(({ sessionIds: _sessionIds, ...rest }) => rest);
}

export default async function SpeakerDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { congressId } = await params;
  const t = await getTranslations('speaker');

  // In production, fetch from D1 via listSpeakers(db, congressId)
  // For now, pass empty array until DB binding is wired
  const speakerRows: SpeakerWithProfile[] = [];
  const speakers = aggregateSpeakers(speakerRows);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('directory')}
        </h1>
      </div>

      <SpeakerDirectory
        speakers={speakers}
        congressId={congressId}
      />
    </div>
  );
}
