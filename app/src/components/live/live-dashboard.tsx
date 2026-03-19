'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Radio,
  Clock,
  Users,
  MessageCircleQuestion,
  QrCode,
  Map,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface LiveSession {
  id: string;
  title: string;
  room: string | null;
  speakerNames: string[];
  start_time: string;
  end_time: string;
  attendeeCount: number;
  questionCount: number;
  reactionCount: number;
  status: 'live' | 'scheduled';
}

interface Announcement {
  id: string;
  body: string;
  created_at: string;
}

interface LiveDashboardProps {
  congressId: string;
  locale: string;
}

// ── Component ────────────────────────────────────────────────────────────

export function LiveDashboard({ congressId, locale }: LiveDashboardProps) {
  const t = useTranslations('live.dashboard');
  const router = useRouter();

  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch live data ─────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/congress/${congressId}/sessions?live=true`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 60 * 1000);

        const sessions: LiveSession[] = (json.data.sessions ?? []).map(
          (s: Record<string, unknown>) => ({
            id: s.id as string,
            title: s.title as string,
            room: s.room_name as string | null ?? null,
            speakerNames: (json.data.speakerMap?.[s.id as string] as string[]) ?? [],
            start_time: s.start_time as string,
            end_time: s.end_time as string,
            attendeeCount: (s.attendee_count as number) ?? 0,
            questionCount: (s.question_count as number) ?? 0,
            reactionCount: (s.reaction_count as number) ?? 0,
            status:
              new Date(s.start_time as string) <= now &&
              new Date(s.end_time as string) >= now
                ? 'live' as const
                : 'scheduled' as const,
          })
        );

        setLiveSessions(sessions.filter((s) => s.status === 'live'));
        setUpcomingSessions(
          sessions
            .filter(
              (s) =>
                s.status === 'scheduled' &&
                new Date(s.start_time) <= soon &&
                new Date(s.start_time) > now
            )
            .sort(
              (a, b) =>
                new Date(a.start_time).getTime() -
                new Date(b.start_time).getTime()
            )
        );
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [congressId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Helpers ─────────────────────────────────────────────────────────

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const navigateToSession = (sessionId: string) => {
    router.push(
      `/${locale}/kongresse/${congressId}/live/stream/${sessionId}`
    );
  };

  const navigateToQA = (sessionId: string) => {
    router.push(
      `/${locale}/kongresse/${congressId}/live/qa/${sessionId}`
    );
  };

  // ── Render ──────────────────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-ensemble-100 dark:bg-ensemble-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Live now */}
      <section>
        <motion.h2
          variants={itemVariants}
          className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-4 flex items-center gap-2"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-error" />
          </span>
          {t('liveNow')}
        </motion.h2>

        {liveSessions.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-center text-ensemble-500 dark:text-ensemble-400">
                  {t('noLiveSessions')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveSessions.map((session) => (
              <motion.div key={session.id} variants={itemVariants}>
                <SessionCard
                  session={session}
                  isLive
                  onClickStream={() => navigateToSession(session.id)}
                  onClickQA={() => navigateToQA(session.id)}
                  t={t}
                  formatTime={formatTime}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Coming up */}
      <section>
        <motion.h2
          variants={itemVariants}
          className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-4 flex items-center gap-2"
        >
          <Clock className="h-5 w-5 text-ensemble-500" />
          {t('comingSoon')}
        </motion.h2>

        {upcomingSessions.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-center text-ensemble-500 dark:text-ensemble-400">
                  {t('noUpcoming')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {upcomingSessions.map((session) => (
              <motion.div key={session.id} variants={itemVariants}>
                <SessionCard
                  session={session}
                  isLive={false}
                  onClickStream={() => navigateToSession(session.id)}
                  onClickQA={() => navigateToQA(session.id)}
                  t={t}
                  formatTime={formatTime}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <motion.section variants={itemVariants}>
        <h2 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-4">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard
            icon={QrCode}
            label={t('actionCheckin')}
            onClick={() => router.push(`/${locale}/kongresse/${congressId}`)}
          />
          <QuickActionCard
            icon={MessageCircleQuestion}
            label={t('actionQA')}
            onClick={() => {
              if (liveSessions[0]) navigateToQA(liveSessions[0].id);
            }}
          />
          <QuickActionCard
            icon={Map}
            label={t('actionMap')}
            onClick={() => router.push(`/${locale}/kongresse/${congressId}`)}
          />
        </div>
      </motion.section>

      {/* Announcements */}
      <motion.section variants={itemVariants}>
        <h2 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-ensemble-500" />
          {t('announcements')}
        </h2>

        {announcements.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-center text-ensemble-500 dark:text-ensemble-400">
                {t('noAnnouncements')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <Card key={a.id}>
                <CardContent className="py-3">
                  <p className="text-sm text-ensemble-900 dark:text-ensemble-50">
                    {a.body}
                  </p>
                  <p className="text-xs text-ensemble-500 dark:text-ensemble-400 mt-1">
                    {new Date(a.created_at).toLocaleString('de-CH')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

// ── Session card sub-component ───────────────────────────────────────────

interface SessionCardProps {
  session: LiveSession;
  isLive: boolean;
  onClickStream: () => void;
  onClickQA: () => void;
  t: ReturnType<typeof useTranslations>;
  formatTime: (iso: string) => string;
}

function SessionCard({
  session,
  isLive,
  onClickStream,
  onClickQA,
  t,
  formatTime,
}: SessionCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        isLive && 'ring-1 ring-error/30'
      )}
      onClick={onClickStream}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isLive && (
                <Badge variant="error" className="flex items-center gap-1 text-[10px]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  LIVE
                </Badge>
              )}
              {session.room && (
                <Badge variant="secondary" className="text-[10px]">
                  {session.room}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm text-ensemble-900 dark:text-ensemble-50 line-clamp-2">
              {session.title}
            </h3>
            {session.speakerNames.length > 0 && (
              <p className="text-xs text-ensemble-500 dark:text-ensemble-400 mt-0.5">
                {session.speakerNames.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-ensemble-500 dark:text-ensemble-400">
          <span>
            {formatTime(session.start_time)} - {formatTime(session.end_time)}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {session.attendeeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircleQuestion className="h-3 w-3" />
              {session.questionCount}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onClickQA();
            }}
          >
            Q&A
          </Button>
          <Button
            size="sm"
            className="text-xs h-7 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onClickStream();
            }}
          >
            {t('watchStream')}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Quick action card ────────────────────────────────────────────────────

interface QuickActionCardProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function QuickActionCard({ icon: Icon, label, onClick }: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl',
        'border border-ensemble-200 dark:border-ensemble-700',
        'bg-white dark:bg-ensemble-900',
        'hover:bg-ensemble-50 dark:hover:bg-ensemble-800',
        'transition-colors text-center'
      )}
    >
      <Icon className="h-6 w-6 text-accent-500" />
      <span className="text-xs font-medium text-ensemble-700 dark:text-ensemble-300">
        {label}
      </span>
    </button>
  );
}
