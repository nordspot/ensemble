'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bookmark,
  CalendarPlus,
  Clock,
  Download,
  MapPin,
  MessageSquare,
  Radio,
  Award,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarRoot, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import { useSessionStore } from '@/stores/session-store';
import { cn } from '@/lib/utils';
import type { Session, Track, Room, Profile } from '@/types';

interface SessionDetailProps {
  session: Session | null;
  track: Track | null;
  room: Room | null;
  speakers: Profile[];
  relatedSessions: Session[];
  congressId: string;
  locale: string;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(profile: Profile): string {
  return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
}

export function SessionDetail({
  session,
  track,
  room,
  speakers,
  relatedSessions,
  congressId,
  locale,
}: SessionDetailProps) {
  const t = useTranslations('session');
  const tSchedule = useTranslations('schedule');
  const router = useRouter();
  const { myBookings, bookSession, cancelBooking } = useSessionStore();

  if (!session) {
    return (
      <EmptyState
        icon={Clock}
        title={tSchedule('noSessions')}
        description=""
      />
    );
  }

  const isBookmarked = myBookings.includes(session.id);
  const isLive = session.status === 'live';

  function handleBookmarkToggle() {
    if (!session) return;
    if (isBookmarked) {
      cancelBooking(session.id);
    } else {
      bookSession(session.id);
    }
  }

  const typeLabel =
    t.has(`types.${session.session_type}`)
      ? t(`types.${session.session_type}` as Parameters<typeof t>[0])
      : session.session_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-ensemble-500 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:text-ensemble-50 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        {tSchedule('title')}
      </button>

      {/* Main info card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge>{typeLabel}</Badge>
            {isLive && (
              <Badge variant="error" className="animate-pulse">
                LIVE
              </Badge>
            )}
            {track && (
              <Badge variant="outline" className="gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: track.color ?? '#6b7280' }}
                />
                {track.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl md:text-2xl">{session.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Date, time, room */}
          <div className="flex flex-wrap gap-4 text-sm text-ensemble-600 dark:text-ensemble-300">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDateTime(session.start_time)}, {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </span>
            {room && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {room.name}
                {room.floor && ` (${room.floor})`}
              </span>
            )}
          </div>

          {/* CME credits */}
          {session.cme_credits != null && session.cme_credits > 0 && (
            <div className="inline-flex items-center gap-1.5 text-sm text-ensemble-600 dark:text-ensemble-300">
              <Award className="h-4 w-4" />
              {session.cme_credits} {tSchedule('cmeCredits')}
            </div>
          )}

          {/* Description */}
          {session.description && (
            <>
              <Separator />
              <p className="text-sm leading-relaxed text-ensemble-700 dark:text-ensemble-300 whitespace-pre-line">
                {session.description}
              </p>
            </>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              onClick={handleBookmarkToggle}
              className="gap-1.5"
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              {isBookmarked ? tSchedule('bookmarked') : tSchedule('bookmark')}
            </Button>
            <Button variant="outline" className="gap-1.5">
              <CalendarPlus className="h-4 w-4" />
              {tSchedule('addToCalendar')}
            </Button>
            {session.slides_url && (
              <Button variant="outline" asChild className="gap-1.5">
                <a href={session.slides_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  {tSchedule('materials')}
                </a>
              </Button>
            )}
          </div>

          {/* Live links */}
          {isLive && (
            <div className="flex flex-wrap gap-2">
              {session.livestream_url && (
                <Button asChild className="gap-1.5">
                  <a href={session.livestream_url} target="_blank" rel="noopener noreferrer">
                    <Radio className="h-4 w-4" />
                    Zur Live-Uebertragung
                  </a>
                </Button>
              )}
              <Button variant="outline" className="gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Zur Q&amp;A
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Speakers */}
      {speakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tSchedule('speakers')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="flex items-center gap-3">
                <AvatarRoot className="h-10 w-10">
                  {speaker.avatar_url ? (
                    <AvatarImage src={speaker.avatar_url} alt={speaker.display_name ?? `${speaker.first_name} ${speaker.last_name}`} />
                  ) : null}
                  <AvatarFallback>{getInitials(speaker)}</AvatarFallback>
                </AvatarRoot>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                    {speaker.title ? `${speaker.title} ` : ''}
                    {speaker.first_name} {speaker.last_name}
                  </span>
                  {speaker.affiliation && (
                    <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
                      {speaker.affiliation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related sessions */}
      {relatedSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tSchedule('relatedSessions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {relatedSessions.map((related) => (
              <button
                key={related.id}
                type="button"
                onClick={() => router.push(`/${locale}/kongresse/${congressId}/programm/${related.id}`)}
                className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-ensemble-50 dark:hover:bg-ensemble-800"
              >
                <Clock className="h-4 w-4 shrink-0 text-ensemble-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                    {related.title}
                  </span>
                  <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
                    {formatTime(related.start_time)} - {formatTime(related.end_time)}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
