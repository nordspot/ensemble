import { getTranslations } from 'next-intl/server';
import { ArticleCard } from '@/components/articles/article-card';
import type { Article } from '@/lib/db/articles';

interface ArtikelPageProps {
  params: Promise<{ congressId: string; locale: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function ArtikelPage({
  params,
  searchParams,
}: ArtikelPageProps) {
  const { congressId, locale } = await params;
  const query = await searchParams;
  const t = await getTranslations('articles');

  // Stub: articles would be fetched server-side via D1 binding
  const articles: Article[] = [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('subtitle')}
          </p>
        </div>
        <a
          href={`artikel/einreichen`}
          className="inline-flex items-center gap-2 rounded-lg bg-ensemble-600 px-4 py-2 text-sm font-medium text-white hover:bg-ensemble-700 dark:bg-ensemble-500 dark:hover:bg-ensemble-400"
        >
          {t('submit')}
        </a>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          defaultValue={query.q ?? ''}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-ensemble-300 bg-white px-4 py-2 text-sm text-ensemble-900 placeholder:text-ensemble-400 focus:border-ensemble-500 focus:outline-none focus:ring-1 focus:ring-ensemble-500 dark:border-ensemble-600 dark:bg-ensemble-800 dark:text-ensemble-50 dark:placeholder:text-ensemble-500"
        />
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-ensemble-500 dark:text-ensemble-400">
          <p className="text-lg">{t('empty')}</p>
          <p className="mt-1 text-sm">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              congressId={congressId}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
