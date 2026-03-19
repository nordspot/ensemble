import { getTranslations } from 'next-intl/server';
import { MyScheduleView } from './my-schedule-view';

export default async function MeinPlanPage({
  params,
}: {
  params: Promise<{ congressId: string; locale: string }>;
}) {
  const { congressId, locale } = await params;
  const t = await getTranslations('schedule');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
        {t('mySchedule')}
      </h1>
      <MyScheduleView congressId={congressId} locale={locale} />
    </div>
  );
}
