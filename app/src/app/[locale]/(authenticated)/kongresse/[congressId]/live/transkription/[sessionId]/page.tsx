import { getTranslations } from 'next-intl/server';
import { TranscriptViewer } from '@/components/live/transcript-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

export default async function TranscriptionPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string; sessionId: string }>;
}) {
  const { congressId, sessionId } = await params;
  const t = await getTranslations('live.transcript');

  // TODO: fetch session details from DB
  const sessionTitle = t('defaultTitle');
  const isLive = true;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Transcript */}
      <div className="flex-1 p-4 min-w-0 min-h-0">
        <TranscriptViewer
          congressId={congressId}
          sessionId={sessionId}
          isLive={isLive}
        />
      </div>

      {/* Session info sidebar */}
      <div className="w-full lg:w-[320px] border-l border-ensemble-200 dark:border-ensemble-700 p-4 overflow-y-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('sessionInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-ensemble-900 dark:text-ensemble-50">
              {sessionTitle}
            </h3>

            {isLive && (
              <Badge variant="error" className="flex items-center gap-1 w-fit text-[10px]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                LIVE
              </Badge>
            )}

            <div className="space-y-2 text-sm text-ensemble-500 dark:text-ensemble-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{t('timeNotAvailable')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{t('roomNotAvailable')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0" />
                <span>{t('speakerNotAvailable')}</span>
              </div>
            </div>

            <p className="text-xs text-ensemble-400 dark:text-ensemble-500 pt-2 border-t border-ensemble-200 dark:border-ensemble-700">
              {t('transcriptHint')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
