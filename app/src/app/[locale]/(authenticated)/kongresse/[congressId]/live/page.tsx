import { getTranslations } from 'next-intl/server';
import { LiveDashboard } from '@/components/live/live-dashboard';

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { locale, congressId } = await params;
  const t = await getTranslations('live.dashboard');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400 mt-1">
          {t('subtitle')}
        </p>
      </div>
      <LiveDashboard congressId={congressId} locale={locale} />
    </div>
  );
}
