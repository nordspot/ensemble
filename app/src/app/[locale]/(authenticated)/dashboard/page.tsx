import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

interface DashboardStats {
  congresses: number;
  upcomingSessions: number;
  unreadMessages: number;
  points: number;
}

interface Activity {
  id: string;
  text: string;
  time: string;
}

async function fetchDashboardData(): Promise<{
  stats: DashboardStats;
  recentActivity: Activity[];
  isNewUser: boolean;
}> {
  // In production: fetch from D1 via getServerAuth() + queries
  // const auth = await getServerAuth();
  // const db = getDb();
  // For now, return demo data or new-user state

  // Simulate: check if user has any congress registrations
  // When D1 is available:
  // const congressCount = await db.prepare('SELECT COUNT(*) as c FROM registrations WHERE user_id = ?').bind(auth.userId).first();
  // const isNewUser = congressCount.c === 0;

  const isNewUser = false; // Toggle to true to see onboarding state

  if (isNewUser) {
    return {
      stats: { congresses: 0, upcomingSessions: 0, unreadMessages: 0, points: 0 },
      recentActivity: [],
      isNewUser: true,
    };
  }

  return {
    stats: {
      congresses: 3,
      upcomingSessions: 12,
      unreadMessages: 7,
      points: 840,
    },
    recentActivity: [
      { id: '1', text: 'Neue Session "KI in der Medizin" hinzugefuegt', time: 'vor 2 Stunden' },
      { id: '2', text: 'Poster-Einreichung genehmigt', time: 'vor 5 Stunden' },
      { id: '3', text: 'Networking-Match mit Dr. Mueller', time: 'gestern' },
      { id: '4', text: 'Badge "Erster Beitrag" erhalten', time: 'gestern' },
    ],
    isNewUser: false,
  };
}

export default async function DashboardPage() {
  const t = await getTranslations('common');
  const { stats, recentActivity, isNewUser } = await fetchDashboardData();

  // New user onboarding
  if (isNewUser) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
            {t('dashboard.welcomeBack')}
          </h1>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-6 py-8 sm:px-8">
            <h2 className="text-2xl font-bold text-white">
              Willkommen bei Ensemble!
            </h2>
            <p className="mt-2 max-w-xl text-white/80">
              Erstellen Sie Ihren ersten Kongress oder melden Sie sich fuer einen an.
              Vervollstaendigen Sie Ihr Profil, um das Beste aus der Plattform herauszuholen.
            </p>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/profil"
                className="group flex flex-col items-center rounded-xl border border-ensemble-200 p-6 text-center transition-colors hover:border-accent-300 hover:bg-accent-50/50 dark:border-ensemble-700 dark:hover:border-accent-700 dark:hover:bg-accent-900/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ensemble-100 group-hover:bg-accent-100 dark:bg-ensemble-800 dark:group-hover:bg-accent-900/30">
                  <svg className="h-6 w-6 text-ensemble-500 group-hover:text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-ensemble-900 dark:text-ensemble-50">
                  Profil vervollstaendigen
                </h3>
                <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
                  Fachgebiet, Organisation und Biografie hinzufuegen
                </p>
              </Link>

              <Link
                href="/kongresse"
                className="group flex flex-col items-center rounded-xl border border-ensemble-200 p-6 text-center transition-colors hover:border-accent-300 hover:bg-accent-50/50 dark:border-ensemble-700 dark:hover:border-accent-700 dark:hover:bg-accent-900/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ensemble-100 group-hover:bg-accent-100 dark:bg-ensemble-800 dark:group-hover:bg-accent-900/30">
                  <svg className="h-6 w-6 text-ensemble-500 group-hover:text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-ensemble-900 dark:text-ensemble-50">
                  Kongress erstellen
                </h3>
                <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
                  Organisieren Sie Ihre eigene Veranstaltung
                </p>
              </Link>

              <Link
                href="/"
                className="group flex flex-col items-center rounded-xl border border-ensemble-200 p-6 text-center transition-colors hover:border-accent-300 hover:bg-accent-50/50 dark:border-ensemble-700 dark:hover:border-accent-700 dark:hover:bg-accent-900/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ensemble-100 group-hover:bg-accent-100 dark:bg-ensemble-800 dark:group-hover:bg-accent-900/30">
                  <svg className="h-6 w-6 text-ensemble-500 group-hover:text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-ensemble-900 dark:text-ensemble-50">
                  Kongresse entdecken
                </h3>
                <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
                  Finden und besuchen Sie Fachveranstaltungen
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Existing user dashboard
  const statItems = [
    {
      title: t('dashboard.myCongresses'),
      value: stats.congresses.toString(),
      change: stats.congresses > 0 ? `${stats.congresses} aktiv` : '-',
      icon: (
        <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
    },
    {
      title: t('dashboard.upcomingSessions'),
      value: stats.upcomingSessions.toString(),
      change: 'heute 2',
      icon: (
        <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      title: t('dashboard.messages'),
      value: stats.unreadMessages.toString(),
      change: `${stats.unreadMessages} neu`,
      icon: (
        <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      title: t('dashboard.points'),
      value: stats.points.toString(),
      change: '+120',
      icon: (
        <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m5.25-6.124a6.002 6.002 0 01-5.25 6.124" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
          {t('dashboard.welcomeBack')}
        </h1>
        <p className="mt-1 text-ensemble-500 dark:text-ensemble-400">
          Hier ist eine Uebersicht Ihrer aktuellen Aktivitaeten.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">
                {stat.title}
              </CardDescription>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-ensemble-900 dark:text-ensemble-50">
                  {stat.value}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/kongresse">
                {t('dashboard.createCongress')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profil">
                {t('dashboard.editProfile')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                      <p className="text-sm text-ensemble-700 dark:text-ensemble-300">
                        {activity.text}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ensemble-400">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ensemble-400">
                {t('dashboard.noActivity')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
