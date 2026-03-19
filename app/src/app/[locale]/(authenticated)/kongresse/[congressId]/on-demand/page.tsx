import { getTranslations } from 'next-intl/server';
import { RecordingCard } from '@/components/congress/recording-card';

interface OnDemandPageProps {
  params: Promise<{ congressId: string; locale: string }>;
}

interface Recording {
  id: string;
  sessionId: string;
  title: string;
  speaker: string;
  thumbnailUrl: string | null;
  duration: number;
  recordedAt: string;
}

export default async function OnDemandPage({ params }: OnDemandPageProps) {
  const { congressId, locale } = await params;
  const t = await getTranslations('onDemand');

  // Stub: recordings would be fetched from D1 via session recording_url
  const recordings: Recording[] = [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>

      {recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-ensemble-500 dark:text-ensemble-400">
          <p className="text-lg">{t('empty')}</p>
          <p className="mt-1 text-sm">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recordings.map((rec) => (
            <RecordingCard
              key={rec.id}
              id={rec.id}
              title={rec.title}
              speaker={rec.speaker}
              thumbnailUrl={rec.thumbnailUrl}
              duration={rec.duration}
              recordedAt={rec.recordedAt}
              congressId={congressId}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
