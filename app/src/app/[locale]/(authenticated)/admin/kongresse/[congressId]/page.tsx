import { getTranslations } from 'next-intl/server';
import {
  Users,
  CalendarDays,
  Mic2,
  DollarSign,
  Pencil,
  Send,
  ListMusic,
  UserPlus,
  Settings,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CongressStatus } from '@/types';

interface PageProps {
  params: Promise<{ congressId: string; locale: string }>;
}

const STATUS_BADGE_VARIANT: Record<CongressStatus, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  live: 'success',
  completed: 'outline',
  archived: 'outline',
};

export default async function AdminCongressDetailPage({ params }: PageProps) {
  const { congressId } = await params;
  const t = await getTranslations('admin');

  // Placeholder data -- replace with DB query
  const congress = {
    id: congressId,
    name: 'Swiss Medical Congress 2026',
    status: 'published' as CongressStatus,
    start_date: '2026-05-15',
    end_date: '2026-05-17',
    venue_name: 'Kursaal Bern',
    venue_city: 'Bern',
  };

  const stats = {
    registrations: 342,
    sessions: 48,
    speakers: 32,
    revenue: 'CHF 99\'180',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {congress.name}
            </h1>
            <Badge variant={STATUS_BADGE_VARIANT[congress.status]}>
              {t(`status.${congress.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {new Date(congress.start_date).toLocaleDateString('de-CH')} -{' '}
            {new Date(congress.end_date).toLocaleDateString('de-CH')}
            {congress.venue_city && ` · ${congress.venue_name}, ${congress.venue_city}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/kongresse/${congressId}/einstellungen`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {t('congressDetail.actions.edit')}
            </Link>
          </Button>
          <Button size="sm">
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {t('congressDetail.actions.publish')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ensemble-500 dark:text-ensemble-400">
              {t('congressDetail.stats.registrations')}
            </CardTitle>
            <Users className="h-4 w-4 text-ensemble-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {stats.registrations}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ensemble-500 dark:text-ensemble-400">
              {t('congressDetail.stats.sessions')}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-ensemble-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {stats.sessions}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ensemble-500 dark:text-ensemble-400">
              {t('congressDetail.stats.speakers')}
            </CardTitle>
            <Mic2 className="h-4 w-4 text-ensemble-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {stats.speakers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ensemble-500 dark:text-ensemble-400">
              {t('congressDetail.stats.revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-ensemble-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {stats.revenue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('congressDetail.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/admin/kongresse/${congressId}/programm`}>
                <ListMusic className="mr-2 h-4 w-4" />
                {t('congressDetail.actions.manageSessions')}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/admin/kongresse/${congressId}/speaker`}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('congressDetail.actions.manageSpeakers')}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/admin/kongresse/${congressId}/einstellungen`}>
                <Settings className="mr-2 h-4 w-4" />
                {t('congressDetail.actions.settings')}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/admin/kongresse/${congressId}/einstellungen`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('congressDetail.actions.edit')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
