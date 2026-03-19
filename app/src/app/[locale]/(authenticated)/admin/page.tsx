import { getTranslations } from 'next-intl/server';
import {
  Building2,
  Users,
  DollarSign,
  Radio,
  Plus,
  UserCog,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CongressStatus } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-ensemble-500 dark:text-ensemble-400">
          {title}
        </CardTitle>
        <div className="text-ensemble-400 dark:text-ensemble-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {value}
        </div>
        {description && (
          <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const STATUS_BADGE_VARIANT: Record<CongressStatus, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  live: 'success',
  completed: 'outline',
  archived: 'outline',
};

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin');

  // Placeholder data -- will be replaced with real DB queries
  const stats = {
    totalCongresses: 12,
    totalUsers: 1843,
    totalRevenue: 'CHF 284\'500',
    activeEvents: 3,
  };

  const recentCongresses: {
    id: string;
    name: string;
    status: CongressStatus;
    start_date: string;
    registrations: number;
  }[] = [
    { id: '1', name: 'Swiss Medical Congress 2026', status: 'live', start_date: '2026-03-20', registrations: 342 },
    { id: '2', name: 'Engineering Summit Zurich', status: 'published', start_date: '2026-05-15', registrations: 128 },
    { id: '3', name: 'Legal Tech Conference', status: 'draft', start_date: '2026-06-10', registrations: 0 },
    { id: '4', name: 'Academic Research Days', status: 'completed', start_date: '2026-01-12', registrations: 567 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/kongresse/neu">
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.createCongress')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/benutzer">
              <UserCog className="mr-2 h-4 w-4" />
              {t('actions.manageUsers')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalCongresses')}
          value={stats.totalCongresses}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title={t('stats.totalUsers')}
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title={t('stats.totalRevenue')}
          value={stats.totalRevenue}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title={t('stats.activeEvents')}
          value={stats.activeEvents}
          icon={<Radio className="h-5 w-5" />}
        />
      </div>

      {/* Recent Congresses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('dashboard.recentCongresses')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/kongresse">{t('actions.viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-ensemble-100 dark:divide-ensemble-800">
            {recentCongresses.map((congress) => (
              <Link
                key={congress.id}
                href={`/admin/kongresse/${congress.id}`}
                className="flex items-center justify-between py-3 transition-colors hover:bg-ensemble-50 dark:hover:bg-ensemble-800/50 -mx-2 px-2 rounded-lg"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                    {congress.name}
                  </span>
                  <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
                    {new Date(congress.start_date).toLocaleDateString('de-CH')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ensemble-500 dark:text-ensemble-400">
                    {congress.registrations} {t('labels.registrations')}
                  </span>
                  <Badge variant={STATUS_BADGE_VARIANT[congress.status]}>
                    {t(`status.${congress.status}`)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
