import { getTranslations } from 'next-intl/server';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

interface AnalyticsPageProps {
  params: Promise<{ locale: string; congressId: string }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { locale, congressId } = await params;
  const t = await getTranslations('analytics');

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>

      <AnalyticsDashboard congressId={congressId} locale={locale} />
    </div>
  );
}
