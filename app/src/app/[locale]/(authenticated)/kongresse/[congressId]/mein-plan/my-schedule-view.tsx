'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarHeart, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { SessionCard } from '@/components/congress/session-card';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/session-store';
import { Link } from '@/i18n/navigation';
import type { Session, Track, Room } from '@/types';

interface MyScheduleViewProps {
  congressId: string;
  locale: string;
}

function formatTimeSlot(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeading(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function MyScheduleView({ congressId, locale }: MyScheduleViewProps) {
  const t = useTranslations('schedule');
  const { sessions, setSessions, myBookings } = useSessionStore();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [speakerMap, setSpeakerMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/congress/${congressId}/sessions`);
        if (!res.ok) throw new Error('Failed to load sessions');
        const data = await res.json();
        if (!cancelled) {
          setSessions(data.data?.sessions ?? []);
          setTracks(data.data?.tracks ?? []);
          setRooms(data.data?.rooms ?? []);
          setSpeakerMap(data.data?.speakerMap ?? {});
        }
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => { cancelled = true; };
  }, [congressId, setSessions]);

  const trackMap = useMemo(() => {
    const map = new Map<string, Track>();
    for (const track of tracks) map.set(track.id, track);
    return map;
  }, [tracks]);

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    for (const room of rooms) map.set(room.id, room);
    return map;
  }, [rooms]);

  // Filter only bookmarked sessions, sorted by start time
  const bookedSessions = useMemo(() => {
    return sessions
      .filter((s) => myBookings.includes(s.id))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [sessions, myBookings]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const session of bookedSessions) {
      const dateKey = new Date(session.start_time).toISOString().slice(0, 10);
      const existing = groups.get(dateKey);
      if (existing) {
        existing.push(session);
      } else {
        groups.set(dateKey, [session]);
      }
    }
    return groups;
  }, [bookedSessions]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800"
          />
        ))}
      </div>
    );
  }

  if (bookedSessions.length === 0) {
    return (
      <EmptyState
        icon={CalendarHeart}
        title={t('myScheduleEmpty')}
        description={t('myScheduleEmptyDescription')}
        action={
          <Link href={`/kongresse/${congressId}/programm`}>
            <Button variant="outline" className="gap-1.5">
              {t('title')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {Array.from(groupedByDate.entries()).map(([dateKey, daySessions]) => (
        <div key={dateKey} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
            {formatDateHeading(daySessions[0].start_time)}
          </h2>
          {/* Group by time within the day */}
          {(() => {
            const timeGroups = new Map<string, Session[]>();
            for (const session of daySessions) {
              const slot = formatTimeSlot(session.start_time);
              const existing = timeGroups.get(slot);
              if (existing) existing.push(session);
              else timeGroups.set(slot, [session]);
            }
            return Array.from(timeGroups.entries()).map(([timeSlot, timeSessions]) => (
              <div key={timeSlot} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-sm font-semibold text-ensemble-500 dark:text-ensemble-400">
                    {timeSlot}
                  </span>
                  <div className="h-px flex-1 bg-ensemble-200 dark:bg-ensemble-700" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {timeSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      track={session.track_id ? (trackMap.get(session.track_id) ?? null) : null}
                      room={session.room_id ? (roomMap.get(session.room_id) ?? null) : null}
                      speakerNames={speakerMap[session.id] ?? []}
                      congressId={congressId}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      ))}
    </div>
  );
}
