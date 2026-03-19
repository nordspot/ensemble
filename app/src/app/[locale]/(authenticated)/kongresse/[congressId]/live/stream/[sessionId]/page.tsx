import { getTranslations } from 'next-intl/server';
import { StreamPlayer } from '@/components/live/stream-player';
import { QAPanel } from '@/components/live/qa-panel';
import { AudienceFeedback } from '@/components/live/audience-feedback';
import { PollWidget } from '@/components/live/poll-widget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function StreamPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string; sessionId: string }>;
}) {
  const { congressId, sessionId } = await params;
  const t = await getTranslations('live.stream');

  // TODO: fetch session details from DB
  const sessionTitle = t('defaultTitle');
  const streamUrl: string | null = null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Video area */}
      <div className="flex-1 flex flex-col p-4 gap-4 min-w-0">
        <StreamPlayer sessionTitle={sessionTitle} streamUrl={streamUrl} />

        {/* Reactions bar */}
        <div className="flex justify-center">
          <AudienceFeedback congressId={congressId} sessionId={sessionId} />
        </div>

        {/* Poll (below video on mobile) */}
        <div className="lg:hidden">
          <PollWidget congressId={congressId} sessionId={sessionId} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[400px] border-l border-ensemble-200 dark:border-ensemble-700 flex flex-col">
        <Tabs defaultValue="qa" className="flex flex-col flex-1">
          <TabsList className="px-4 pt-2">
            <TabsTrigger value="qa">{t('tabQA')}</TabsTrigger>
            <TabsTrigger value="poll">{t('tabPoll')}</TabsTrigger>
          </TabsList>
          <TabsContent value="qa" className="flex-1 p-4 min-h-0">
            <QAPanel congressId={congressId} sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="poll" className="flex-1 p-4 min-h-0 overflow-y-auto">
            <PollWidget congressId={congressId} sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
