import { getTranslations } from 'next-intl/server';
import { PointsDisplay } from '@/components/gamification/points-display';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { AchievementBadge } from '@/components/gamification/achievement-badge';
import { ReferralLink } from '@/components/gamification/referral-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GamificationPageProps {
  params: Promise<{ locale: string; congressId: string }>;
}

export default async function GamificationPage({ params }: GamificationPageProps) {
  const { locale, congressId } = await params;
  const t = await getTranslations('gamification');

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Points + Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PointsDisplay congressId={congressId} />
        <Leaderboard congressId={congressId} />
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('achievements')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Achievements loaded client-side via AchievementBadge */}
            <AchievementBadge
              congressId={congressId}
            />
          </div>
        </CardContent>
      </Card>

      {/* Referral link */}
      <ReferralLink congressId={congressId} />
    </div>
  );
}
