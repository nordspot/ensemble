import { getTranslations } from 'next-intl/server';
import { ArticleEditor } from '@/components/articles/article-editor';

interface EinreichenPageProps {
  params: Promise<{ congressId: string }>;
}

export default async function EinreichenPage({ params }: EinreichenPageProps) {
  const { congressId } = await params;
  const t = await getTranslations('articles');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('submitTitle')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('submitSubtitle')}
        </p>
      </div>

      <ArticleEditor congressId={congressId} />
    </div>
  );
}
