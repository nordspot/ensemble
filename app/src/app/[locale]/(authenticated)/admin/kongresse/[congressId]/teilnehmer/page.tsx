import { getTranslations } from 'next-intl/server';
import { AttendeeTable } from '@/components/admin/attendee-table';

export default async function AdminAttendeesPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { locale, congressId } = await params;
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('attendees.title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('attendees.subtitle')}
        </p>
      </div>
      <AttendeeTable congressId={congressId} locale={locale} />
    </div>
  );
}
