import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

/**
 * GET /api/congress/[congressId]/gamification
 * Get user's points, leaderboard, achievements, referral stats
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();
  const { congressId } = await context.params;

  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  const [
    pointsResult,
    recentActivity,
    dailyLeaderboard,
    overallLeaderboard,
    achievements,
    referralLink,
  ] = await Promise.all([
    // Total points
    db
      .prepare(
        'SELECT COALESCE(SUM(points), 0) as total FROM points_ledger WHERE congress_id = ? AND user_id = ?'
      )
      .bind(congressId, auth.userId)
      .first<{ total: number }>(),
    // Recent activity
    db
      .prepare(
        `SELECT id, points, reason, description, created_at
         FROM points_ledger WHERE congress_id = ? AND user_id = ?
         ORDER BY created_at DESC LIMIT 5`
      )
      .bind(congressId, auth.userId)
      .all<{ id: string; points: number; reason: string; description: string | null; created_at: string }>(),
    // Daily leaderboard (top 10)
    db
      .prepare(
        `SELECT pl.user_id, p.full_name as name, SUM(pl.points) as points
         FROM points_ledger pl
         JOIN profiles p ON p.user_id = pl.user_id
         WHERE pl.congress_id = ? AND DATE(pl.created_at) = DATE('now')
         GROUP BY pl.user_id ORDER BY points DESC LIMIT 10`
      )
      .bind(congressId)
      .all<{ user_id: string; name: string; points: number }>(),
    // Overall leaderboard (top 50)
    db
      .prepare(
        `SELECT pl.user_id, p.full_name as name, SUM(pl.points) as points
         FROM points_ledger pl
         JOIN profiles p ON p.user_id = pl.user_id
         WHERE pl.congress_id = ?
         GROUP BY pl.user_id ORDER BY points DESC LIMIT 50`
      )
      .bind(congressId)
      .all<{ user_id: string; name: string; points: number }>(),
    // Achievements
    db
      .prepare(
        `SELECT a.id, a.name, a.description, a.icon_url,
                CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as earned,
                ua.created_at as earned_at
         FROM achievements a
         LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
         WHERE a.congress_id = ?
         ORDER BY earned DESC, a.name ASC`
      )
      .bind(auth.userId, congressId)
      .all<{ id: string; name: string; description: string; icon_url: string | null; earned: number; earned_at: string | null }>(),
    // Referral link
    db
      .prepare(
        'SELECT * FROM referral_links WHERE congress_id = ? AND referrer_id = ? LIMIT 1'
      )
      .bind(congressId, auth.userId)
      .first<{ code: string; uses: number }>(),
  ]);

  // Build leaderboard with rank and current user indicator
  const buildLeaderboard = (
    entries: Array<{ user_id: string; name: string; points: number }>
  ) =>
    entries.map((e, i) => ({
      rank: i + 1,
      userId: e.user_id,
      name: e.name,
      points: e.points,
      isCurrentUser: e.user_id === auth.userId,
    }));

  // Determine tier
  const totalPoints = pointsResult?.total ?? 0;
  let currentTier = 'bronze';
  let nextTier: string | null = 'silver';
  let nextTierThreshold = 100;
  if (totalPoints >= 500) {
    currentTier = 'diamond';
    nextTier = null;
    nextTierThreshold = 500;
  } else if (totalPoints >= 250) {
    currentTier = 'gold';
    nextTier = 'diamond';
    nextTierThreshold = 500;
  } else if (totalPoints >= 100) {
    currentTier = 'silver';
    nextTier = 'gold';
    nextTierThreshold = 250;
  }

  const baseUrl = request.nextUrl.origin;
  const referralCode = referralLink?.code ?? '';

  return success({
    points: {
      totalPoints,
      currentTier,
      nextTier,
      nextTierThreshold,
      recentActivity: recentActivity?.results ?? [],
    },
    leaderboard: {
      daily: buildLeaderboard(dailyLeaderboard?.results ?? []),
      overall: buildLeaderboard(overallLeaderboard?.results ?? []),
    },
    achievements: (achievements?.results ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      iconUrl: a.icon_url,
      earned: !!a.earned,
      earnedAt: a.earned_at,
    })),
    referral: referralCode
      ? {
          code: referralCode,
          url: `${baseUrl}/r/${referralCode}`,
          clicks: 0,
          conversions: referralLink?.uses ?? 0,
          rewardTiers: [
            { tier: 'bronze', required: 3, reached: (referralLink?.uses ?? 0) >= 3 },
            { tier: 'silver', required: 10, reached: (referralLink?.uses ?? 0) >= 10 },
            { tier: 'gold', required: 25, reached: (referralLink?.uses ?? 0) >= 25 },
          ],
        }
      : null,
  });
}
