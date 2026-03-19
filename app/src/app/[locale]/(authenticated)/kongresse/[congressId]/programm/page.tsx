import { getTranslations } from 'next-intl/server';
import { ScheduleView } from '@/components/congress/schedule-view';

export default async function ProgrammPage({
  params,
}: {
  params: Promise<{ congressId: string }>;
}) {
  const { congressId } = await params;
  const t = await getTranslations('schedule');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
        {t('title')}
      </h1>
      <ScheduleView congressId={congressId} />
    </div>
  );
}
