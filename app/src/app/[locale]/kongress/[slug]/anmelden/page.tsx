import { getTranslations } from 'next-intl/server';
import { RegistrationWizard } from '@/components/congress/registration-wizard';

export default async function KongressAnmeldenPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('registration');

  return (
    <main className="min-h-screen bg-ensemble-50 dark:bg-ensemble-950 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('title')}
          </h1>
          <p className="mt-2 text-ensemble-500 dark:text-ensemble-400">
            {t('subtitle')}
          </p>
        </div>
        <RegistrationWizard slug={slug} locale={locale} />
      </div>
    </main>
  );
}
