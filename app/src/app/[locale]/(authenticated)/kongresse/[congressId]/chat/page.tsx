import { getTranslations } from 'next-intl/server';
import { ChatPanel } from '@/components/chat/chat-panel';

interface ChatPageProps {
  params: Promise<{ congressId: string; locale: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { congressId } = await params;
  const t = await getTranslations('chat');

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('channels')}
        </h1>
      </div>
      <div className="min-h-0 flex-1">
        <ChatPanel congressId={congressId} />
      </div>
    </div>
  );
}
