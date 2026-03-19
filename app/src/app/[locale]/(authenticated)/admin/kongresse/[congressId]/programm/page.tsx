import { getTranslations } from 'next-intl/server';
import { SessionBuilder } from '@/components/admin/session-builder';

interface PageProps {
  params: Promise<{ congressId: string; locale: string }>;
}

export default async function AdminSessionBuilderPage({ params }: PageProps) {
  const { congressId } = await params;
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('sessionBuilder.title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('sessionBuilder.subtitle')}
        </p>
      </div>
      <SessionBuilder congressId={congressId} />
    </div>
  );
}
