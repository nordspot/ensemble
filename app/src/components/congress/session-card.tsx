'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, MapPin, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessionStore } from '@/stores/session-store';
import { cn } from '@/lib/utils';
import type { Session, Track, Room } from '@/types';

interface SessionCardProps {
  session: Session;
  track: Track | null;
  room: Room | null;
  speakerNames: string[];
  congressId: string;
  locale: string;
}

const SESSION_TYPE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'warning'> = {
  keynote: 'default',
  workshop: 'warning',
  panel: 'secondary',
  poster: 'outline',
  symposium: 'secondary',
  break: 'outline',
  social: 'outline',
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

export function SessionCard({
  session,
  track,
  room,
  speakerNames,
  congressId,
  locale,
}: SessionCardProps) {
  const t = useTranslations('session');
  const tSchedule = useTranslations('schedule');
  const router = useRouter();
  const { myBookings, bookSession, cancelBooking } = useSessionStore();

  const isBookmarked = myBookings.includes(session.id);

  function handleBookmarkToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (isBookmarked) {
      cancelBooking(session.id);
    } else {
      bookSession(session.id);
    }
  }

  function handleClick() {
    router.push(`/${locale}/kongresse/${congressId}/programm/${session.id}`);
  }

  const badgeVariant = SESSION_TYPE_VARIANTS[session.session_type] ?? 'outline';
  const typeLabel =
    t.has(`types.${session.session_type}`)
      ? t(`types.${session.session_type}` as Parameters<typeof t>[0])
      : session.session_type;

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="cursor-pointer"
      onClick={handleClick}
    >
      <Card className="relative h-full overflow-hidden">
        {track?.color && (
          <div
            className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
            style={{ backgroundColor: track.color }}
          />
        )}
        <CardContent className="flex flex-col gap-2 p-4 pl-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <Badge variant={badgeVariant} className="w-fit text-[11px]">
                {typeLabel}
              </Badge>
              <h4 className="text-sm font-semibold leading-tight text-ensemble-900 dark:text-ensemble-50">
                {session.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={cn(
                'shrink-0 rounded-md p-1 transition-colors',
                isBookmarked
                  ? 'text-accent-500 hover:text-accent-600'
                  : 'text-ensemble-400 hover:text-ensemble-600 dark:text-ensemble-500 dark:hover:text-ensemble-300'
              )}
              aria-label={isBookmarked ? tSchedule('removeFromMySchedule') : tSchedule('addToMySchedule')}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isBookmarked ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {speakerNames.length > 0 && (
            <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
              {speakerNames.join(', ')}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-ensemble-500 dark:text-ensemble-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </span>
            {room && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {room.name}
              </span>
            )}
            {session.cme_credits != null && session.cme_credits > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {session.cme_credits} CME
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
