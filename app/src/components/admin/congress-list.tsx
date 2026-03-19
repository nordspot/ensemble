'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Plus, Search, Calendar, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CongressStatus } from '@/types';

interface CongressListItem {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  status: CongressStatus;
  registrations: number;
  venue_city: string | null;
}

const STATUS_BADGE_VARIANT: Record<CongressStatus, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  live: 'success',
  completed: 'outline',
  archived: 'outline',
};

const STATUS_OPTIONS: CongressStatus[] = ['draft', 'published', 'live', 'completed', 'archived'];

// Placeholder data - replace with API call
const MOCK_CONGRESSES: CongressListItem[] = [
  { id: '1', name: 'Swiss Medical Congress 2026', slug: 'smc-2026', start_date: '2026-03-20', end_date: '2026-03-22', status: 'live', registrations: 342, venue_city: 'Bern' },
  { id: '2', name: 'Engineering Summit Zurich', slug: 'esz-2026', start_date: '2026-05-15', end_date: '2026-05-17', status: 'published', registrations: 128, venue_city: 'Zürich' },
  { id: '3', name: 'Legal Tech Conference', slug: 'ltc-2026', start_date: '2026-06-10', end_date: '2026-06-11', status: 'draft', registrations: 0, venue_city: 'Basel' },
  { id: '4', name: 'Academic Research Days', slug: 'ard-2026', start_date: '2026-01-12', end_date: '2026-01-14', status: 'completed', registrations: 567, venue_city: 'Lausanne' },
  { id: '5', name: 'Scientific Symposium Geneva', slug: 'ssg-2026', start_date: '2026-09-01', end_date: '2026-09-03', status: 'draft', registrations: 0, venue_city: 'Genf' },
];

export function CongressListAdmin() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = MOCK_CONGRESSES.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function formatDateRange(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('de-CH')} - ${e.toLocaleDateString('de-CH')}`;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ensemble-400" />
            <Input
              placeholder={t('congresses.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('congresses.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('congresses.allStatuses')}</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push('/admin/kongresse/neu')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.createCongress')}
        </Button>
      </div>

      {/* Congress List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('congresses.noCongresses')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((congress) => (
            <Card
              key={congress.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/admin/kongresse/${congress.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ensemble-900 dark:text-ensemble-50 truncate">
                      {congress.name}
                    </span>
                    <Badge variant={STATUS_BADGE_VARIANT[congress.status]}>
                      {t(`status.${congress.status}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ensemble-500 dark:text-ensemble-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange(congress.start_date, congress.end_date)}
                    </span>
                    {congress.venue_city && (
                      <span>{congress.venue_city}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-ensemble-500 dark:text-ensemble-400">
                  <UsersIcon className="h-4 w-4" />
                  <span>{congress.registrations}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
