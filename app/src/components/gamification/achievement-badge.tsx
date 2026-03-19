'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  earned: boolean;
  earnedAt: string | null;
}

interface AchievementBadgeProps {
  congressId: string;
}

export function AchievementBadge({ congressId }: AchievementBadgeProps) {
  const t = useTranslations('gamification');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch(`/api/congress/${congressId}/gamification`);
        if (res.ok) {
          const json = await res.json();
          setAchievements(json.data?.achievements ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, [congressId]);

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800" />
        ))}
      </>
    );
  }

  if (achievements.length === 0) {
    return (
      <p className="col-span-full text-sm text-ensemble-500 dark:text-ensemble-400">
        {t('noAchievements')}
      </p>
    );
  }

  return (
    <>
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`flex flex-col items-center rounded-xl border p-4 text-center transition-colors ${
            achievement.earned
              ? 'border-accent-200 bg-accent-50/50 dark:border-accent-800 dark:bg-accent-950/20'
              : 'border-ensemble-100 bg-ensemble-50/50 opacity-60 dark:border-ensemble-800 dark:bg-ensemble-900/50'
          }`}
        >
          {/* Badge icon */}
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              achievement.earned
                ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400'
                : 'bg-ensemble-100 text-ensemble-400 dark:bg-ensemble-800 dark:text-ensemble-500'
            }`}
          >
            {achievement.iconUrl ? (
              <img
                src={achievement.iconUrl}
                alt={achievement.name}
                className="h-8 w-8"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            )}
          </div>

          {/* Title */}
          <p className="mt-2 text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
            {achievement.name}
          </p>

          {/* Description */}
          <p className="mt-0.5 text-xs text-ensemble-500 dark:text-ensemble-400">
            {achievement.description}
          </p>

          {/* Earned date */}
          {achievement.earned && achievement.earnedAt && (
            <p className="mt-2 text-xs text-accent-500">
              {new Date(achievement.earnedAt).toLocaleDateString('de-CH')}
            </p>
          )}

          {/* Locked indicator */}
          {!achievement.earned && (
            <div className="mt-2 flex items-center gap-1 text-xs text-ensemble-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {t('locked')}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
