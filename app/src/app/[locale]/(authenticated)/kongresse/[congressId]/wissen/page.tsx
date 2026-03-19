import { getTranslations } from 'next-intl/server';
import { KnowledgeChat } from '@/components/ai/knowledge-chat';

export default async function WissenPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { congressId } = await params;
  const t = await getTranslations('knowledge');

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col p-4 md:p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-ensemble-100 bg-white dark:border-ensemble-800 dark:bg-ensemble-900">
        <KnowledgeChat congressId={congressId} />
      </div>
    </div>
  );
}
