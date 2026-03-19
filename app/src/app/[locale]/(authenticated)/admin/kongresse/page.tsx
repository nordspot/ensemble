import { getTranslations } from 'next-intl/server';
import { CongressListAdmin } from '@/components/admin/congress-list';

export default async function AdminCongressListPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('congresses.title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('congresses.subtitle')}
        </p>
      </div>
      <CongressListAdmin />
    </div>
  );
}
