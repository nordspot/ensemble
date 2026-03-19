import { getTranslations } from 'next-intl/server';
import { SessionDetail } from '@/components/congress/session-detail';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ congressId: string; sessionId: string; locale: string }>;
}) {
  const { congressId, sessionId, locale } = await params;
  const t = await getTranslations('schedule');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="sr-only">{t('sessionDetail')}</h1>
      <SessionDetailLoader
        congressId={congressId}
        sessionId={sessionId}
        locale={locale}
      />
    </div>
  );
}

/**
 * Server-side data fetching wrapper that passes data to the client component.
 * In production this would fetch from the DB directly; for now it renders
 * the client component which fetches via API.
 */
function SessionDetailLoader({
  congressId,
  sessionId,
  locale,
}: {
  congressId: string;
  sessionId: string;
  locale: string;
}) {
  return (
    <SessionDetailClient
      congressId={congressId}
      sessionId={sessionId}
      locale={locale}
    />
  );
}

// Inline client wrapper to handle fetch on mount
import { SessionDetailClient } from './session-detail-client';
