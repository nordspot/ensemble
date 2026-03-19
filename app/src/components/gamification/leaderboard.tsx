'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  congressId: string;
}

export function Leaderboard({ congressId }: LeaderboardProps) {
  const t = useTranslations('gamification');
  const [daily, setDaily] = useState<LeaderboardEntry[]>([]);
  const [overall, setOverall] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/congress/${congressId}/gamification`);
        if (res.ok) {
          const json = await res.json();
          setDaily(json.data?.leaderboard?.daily ?? []);
          setOverall(json.data?.leaderboard?.overall ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [congressId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 animate-pulse rounded bg-ensemble-100 dark:bg-ensemble-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('leaderboard')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
            <TabsTrigger value="overall">{t('overall')}</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4">
            <LeaderboardList entries={daily.slice(0, 10)} t={t} />
          </TabsContent>
          <TabsContent value="overall" className="mt-4">
            <LeaderboardList entries={overall.slice(0, 50)} t={t} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LeaderboardList({
  entries,
  t,
}: {
  entries: LeaderboardEntry[];
  t: ReturnType<typeof useTranslations>;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
        {t('noEntries')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={`flex items-center justify-between rounded-lg p-3 ${
            entry.isCurrentUser
              ? 'bg-accent-50 dark:bg-accent-950/30'
              : 'hover:bg-ensemble-50 dark:hover:bg-ensemble-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Rank */}
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                entry.rank <= 3
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-ensemble-100 text-ensemble-500 dark:bg-ensemble-800 dark:text-ensemble-400'
              }`}
            >
              {entry.rank}
            </span>
            <span
              className={`text-sm ${
                entry.isCurrentUser
                  ? 'font-bold text-accent-600 dark:text-accent-400'
                  : 'text-ensemble-900 dark:text-ensemble-50'
              }`}
            >
              {entry.name}
              {entry.isCurrentUser && (
                <span className="ml-1 text-xs text-ensemble-400">
                  ({t('you')})
                </span>
              )}
            </span>
          </div>
          <span className="text-sm font-medium text-ensemble-600 dark:text-ensemble-300">
            {entry.points.toLocaleString('de-CH')} {t('pts')}
          </span>
        </div>
      ))}
    </div>
  );
}
