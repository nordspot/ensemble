'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalRegistrations: number;
  totalCheckins: number;
  revenue: number;
  engagementScore: number;
  registrationsByDay: Array<{ date: string; count: number }>;
  topSessions: Array<{ id: string; title: string; attendance: number }>;
  referralFunnel: { invites: number; clicks: number; conversions: number };
  topSpeakers: Array<{ name: string; rating: number; sessions: number }>;
}

interface AnalyticsDashboardProps {
  congressId: string;
  locale: string;
}

export function AnalyticsDashboard({ congressId, locale }: AnalyticsDashboardProps) {
  const t = useTranslations('analytics');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/congress/${congressId}/analytics`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [congressId]);

  const handleExport = useCallback(
    (format: 'csv' | 'pdf') => {
      const d = data ?? {
        totalRegistrations: 0,
        totalCheckins: 0,
        revenue: 0,
        engagementScore: 0,
        registrationsByDay: [] as Array<{ date: string; count: number }>,
        topSessions: [] as Array<{ id: string; title: string; attendance: number }>,
        referralFunnel: { invites: 0, clicks: 0, conversions: 0 },
        topSpeakers: [] as Array<{ name: string; rating: number; sessions: number }>,
      };

      if (format === 'csv') {
        // Generate CSV from current data client-side
        const csvRows: string[] = [];
        csvRows.push('Metrik,Wert');
        csvRows.push(`Anmeldungen,${d.totalRegistrations}`);
        csvRows.push(`Check-ins,${d.totalCheckins}`);
        csvRows.push(`Umsatz (CHF),${(d.revenue / 100).toFixed(2)}`);
        csvRows.push(`Engagement,${d.engagementScore}%`);
        csvRows.push('');
        if (d.registrationsByDay.length > 0) {
          csvRows.push('Datum,Anmeldungen');
          for (const day of d.registrationsByDay) {
            csvRows.push(`${day.date},${day.count}`);
          }
          csvRows.push('');
        }
        if (d.topSessions.length > 0) {
          csvRows.push('Session,Teilnehmer');
          for (const session of d.topSessions) {
            csvRows.push(`"${session.title.replace(/"/g, '""')}",${session.attendance}`);
          }
          csvRows.push('');
        }
        if (d.topSpeakers.length > 0) {
          csvRows.push('Referent,Sessions,Bewertung');
          for (const speaker of d.topSpeakers) {
            csvRows.push(`"${speaker.name.replace(/"/g, '""')}",${speaker.sessions},${speaker.rating.toFixed(1)}`);
          }
        }

        const csv = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csv], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${congressId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF: use the browser print-to-PDF dialog
        window.print();
      }
    },
    [congressId, data]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800" />
        ))}
      </div>
    );
  }

  const stats = data ?? {
    totalRegistrations: 0,
    totalCheckins: 0,
    revenue: 0,
    engagementScore: 0,
    registrationsByDay: [],
    topSessions: [],
    referralFunnel: { invites: 0, clicks: 0, conversions: 0 },
    topSpeakers: [],
  };

  const maxRegistrations = Math.max(
    ...stats.registrationsByDay.map((d) => d.count),
    1
  );

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          {t('exportCsv')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
          {t('exportPdf')}
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('stats.registrations')}
          value={stats.totalRegistrations.toLocaleString('de-CH')}
        />
        <StatCard
          label={t('stats.checkins')}
          value={stats.totalCheckins.toLocaleString('de-CH')}
        />
        <StatCard
          label={t('stats.revenue')}
          value={`CHF ${(stats.revenue / 100).toLocaleString('de-CH', {
            minimumFractionDigits: 2,
          })}`}
        />
        <StatCard
          label={t('stats.engagement')}
          value={`${stats.engagementScore}%`}
        />
      </div>

      {/* Registration timeline */}
      {stats.registrationsByDay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('registrationTimeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-1">
              {stats.registrationsByDay.map((day) => {
                const height = (day.count / maxRegistrations) * 100;
                return (
                  <div
                    key={day.date}
                    className="group relative flex-1"
                    title={`${day.date}: ${day.count}`}
                  >
                    <div
                      className="w-full rounded-t bg-accent-500 transition-colors hover:bg-accent-600"
                      style={{ height: `${height}%`, minHeight: '2px' }}
                    />
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-ensemble-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-ensemble-100 dark:text-ensemble-900">
                      {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-ensemble-400">
              {stats.registrationsByDay.length > 0 && (
                <>
                  <span>{stats.registrationsByDay[0].date}</span>
                  <span>
                    {stats.registrationsByDay[stats.registrationsByDay.length - 1].date}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-column: Sessions + Referral */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('topSessions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSessions.length === 0 ? (
              <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
                {t('noData')}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topSessions.map((session, i) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ensemble-100 text-xs font-bold text-ensemble-600 dark:bg-ensemble-800 dark:text-ensemble-300">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm text-ensemble-900 dark:text-ensemble-50">
                        {session.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-ensemble-500">
                      {session.attendance}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('referralFunnel')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FunnelBar
                label={t('funnel.invites')}
                value={stats.referralFunnel.invites}
                max={stats.referralFunnel.invites}
              />
              <FunnelBar
                label={t('funnel.clicks')}
                value={stats.referralFunnel.clicks}
                max={stats.referralFunnel.invites}
              />
              <FunnelBar
                label={t('funnel.conversions')}
                value={stats.referralFunnel.conversions}
                max={stats.referralFunnel.invites}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top speakers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('topSpeakers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topSpeakers.length === 0 ? (
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('noData')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ensemble-100 dark:border-ensemble-800">
                    <th className="pb-2 text-left font-medium text-ensemble-500 dark:text-ensemble-400">
                      {t('speaker')}
                    </th>
                    <th className="pb-2 text-right font-medium text-ensemble-500 dark:text-ensemble-400">
                      {t('sessions')}
                    </th>
                    <th className="pb-2 text-right font-medium text-ensemble-500 dark:text-ensemble-400">
                      {t('avgRating')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSpeakers.map((speaker) => (
                    <tr
                      key={speaker.name}
                      className="border-b border-ensemble-50 dark:border-ensemble-800/50"
                    >
                      <td className="py-2 text-ensemble-900 dark:text-ensemble-50">
                        {speaker.name}
                      </td>
                      <td className="py-2 text-right text-ensemble-500">
                        {speaker.sessions}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <span className="text-ensemble-900 dark:text-ensemble-50">
                            {speaker.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {value}
        </p>
        <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

function FunnelBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ensemble-700 dark:text-ensemble-300">{label}</span>
        <span className="font-medium text-ensemble-900 dark:text-ensemble-50">
          {value}
        </span>
      </div>
      <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-ensemble-100 dark:bg-ensemble-800">
        <div
          className="h-full rounded-full bg-accent-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
