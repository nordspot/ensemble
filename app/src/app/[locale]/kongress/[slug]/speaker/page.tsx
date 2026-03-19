import { getTranslations } from 'next-intl/server';
import { SpeakerDirectory } from '@/components/congress/speaker-directory';
import type { SpeakerCardData } from '@/components/congress/speaker-card';

interface SpeakerRow {
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

function aggregateSpeakers(rows: SpeakerRow[]): SpeakerCardData[] {
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

/**
 * Public speaker directory for a congress landing page.
 * Accessible without authentication.
 */
export default async function PublicSpeakerDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations('speaker');

  // In production: resolve congress by slug, then fetch speakers via API or D1
  // const congress = await getCongressBySlug(db, orgId, slug);
  // const speakerRows = await listSpeakers(db, congress.id);
  const speakerRows: SpeakerRow[] = [];
  const speakers = aggregateSpeakers(speakerRows);

  // Use slug as congressId proxy for links; in production use resolved congress.id
  const congressId = slug;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('directory')}
        </h1>
      </div>

      <SpeakerDirectory
        speakers={speakers}
        congressId={congressId}
        publicMode
      />
    </div>
  );
}
