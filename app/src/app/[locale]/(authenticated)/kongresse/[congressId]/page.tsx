import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CongressOverviewProps {
  params: Promise<{ locale: string; congressId: string }>;
}

export default async function CongressOverviewPage({
  params,
}: CongressOverviewProps) {
  const { locale, congressId } = await params;
  const t = await getTranslations('congressOverview');
  const tCommon = await getTranslations('common');

  // Server-side data fetching would happen here via DB calls.
  // For now we render the layout structure; data loading will be
  // wired once the data layer is fully connected.

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('welcome')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('overviewSubtitle')}
          </p>
        </div>
        <Badge variant="secondary" className="self-start text-sm px-3 py-1">
          {t('statusDraft')}
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('stats.registered')}
          value="--"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }
        />
        <StatCard
          label={t('stats.capacity')}
          value="--%"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
          }
        />
        <StatCard
          label={t('stats.sessions')}
          value="--"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          }
        />
        <StatCard
          label={t('stats.speakers')}
          value="--"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          }
        />
      </div>

      {/* Quick actions + Upcoming sessions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href={`/${locale}/kongresse/${congressId}/programm`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                {t('actions.viewSchedule')}
              </Button>
            </Link>
            <Link href={`/${locale}/kongresse/${congressId}/live`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                {t('actions.checkin')}
              </Button>
            </Link>
            <Link href={`/${locale}/kongresse/${congressId}/networking`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {t('actions.map')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('upcomingSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('noUpcomingSessions')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('announcements')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('noAnnouncements')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {value}
          </p>
          <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
