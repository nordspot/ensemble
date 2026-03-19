import { getTranslations } from 'next-intl/server';
import { IndoorMapPage } from './indoor-map-page';

export default async function KartePage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { locale, congressId } = await params;
  const t = await getTranslations('beacon.map');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 py-3 border-b border-ensemble-200 dark:border-ensemble-700">
        <h1 className="text-xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>
      <IndoorMapPage congressId={congressId} locale={locale} />
    </div>
  );
}
