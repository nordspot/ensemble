import { getTranslations } from 'next-intl/server';
import { QAPanel } from '@/components/live/qa-panel';

export default async function QAPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string; sessionId: string }>;
}) {
  const { congressId, sessionId } = await params;
  const t = await getTranslations('live.qa');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8">
      <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50 mb-4">
        {t('pageTitle')}
      </h1>
      <div className="flex-1 min-h-0">
        <QAPanel congressId={congressId} sessionId={sessionId} />
      </div>
    </div>
  );
}
