import { getTranslations } from 'next-intl/server';
import { CreateCongressForm } from '@/components/admin/create-congress-form';

export default async function CreateCongressPage() {
  const t = await getTranslations('admin');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('createCongress.title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('createCongress.subtitle')}
        </p>
      </div>
      <CreateCongressForm />
    </div>
  );
}
