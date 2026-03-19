'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RecentActivity {
  id: string;
  points: number;
  reason: string;
  description: string | null;
  created_at: string;
}

interface PointsData {
  totalPoints: number;
  currentTier: string;
  nextTier: string | null;
  nextTierThreshold: number;
  recentActivity: RecentActivity[];
}

interface PointsDisplayProps {
  congressId: string;
}

export function PointsDisplay({ congressId }: PointsDisplayProps) {
  const t = useTranslations('gamification');
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await fetch(`/api/congress/${congressId}/gamification`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data?.points ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
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

  const points = data ?? {
    totalPoints: 0,
    currentTier: 'bronze',
    nextTier: 'silver',
    nextTierThreshold: 100,
    recentActivity: [],
  };

  const progressToNext =
    points.nextTierThreshold > 0
      ? Math.min(100, Math.round((points.totalPoints / points.nextTierThreshold) * 100))
      : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('points')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Big points number */}
        <div className="text-center">
          <p className="text-5xl font-bold text-accent-500">
            {points.totalPoints.toLocaleString('de-CH')}
          </p>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('totalPoints')}
          </p>
        </div>

        {/* Tier progress */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ensemble-700 dark:text-ensemble-300">
              {t(`tiers.${points.currentTier}`)}
            </span>
            {points.nextTier && (
              <span className="text-ensemble-400">
                {t(`tiers.${points.nextTier}`)}
              </span>
            )}
          </div>
          <Progress value={progressToNext} />
          {points.nextTier && (
            <p className="mt-1 text-xs text-ensemble-400">
              {t('pointsToNext', {
                points: points.nextTierThreshold - points.totalPoints,
                tier: t(`tiers.${points.nextTier}`),
              })}
            </p>
          )}
        </div>

        {/* Recent activity */}
        {points.recentActivity.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('recentActivity')}
            </p>
            <div className="space-y-2">
              {points.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ensemble-600 dark:text-ensemble-400">
                    {activity.description ?? t(`reasons.${activity.reason}`)}
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    +{activity.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
