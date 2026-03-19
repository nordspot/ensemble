'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchInput } from '@/components/shared/search-input';
import { EmptyState } from '@/components/shared/empty-state';
import { TrackFilter } from '@/components/congress/track-filter';
import { SessionCard } from '@/components/congress/session-card';
import { useSessionStore } from '@/stores/session-store';
import type { Session, Track, Room } from '@/types';

interface ScheduleViewProps {
  congressId: string;
}

interface SessionWithMeta {
  session: Session;
  track: Track | null;
  room: Room | null;
  speakerNames: string[];
}

function formatDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function formatDayLabel(dateStr: string, index: number, prefix: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const weekday = date.toLocaleDateString('de-CH', { weekday: 'short' });
  const day = date.toLocaleDateString('de-CH', { day: 'numeric', month: 'short' });
  return `${prefix} ${index + 1} - ${weekday}, ${day}`;
}

function formatTimeSlot(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

export function ScheduleView({ congressId }: ScheduleViewProps) {
  const t = useTranslations('schedule');
  const {
    sessions,
    setSessions,
    selectedDate,
    setSelectedDate,
    selectedTrack,
    setSelectedTrack,
  } = useSessionStore();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [speakerMap, setSpeakerMap] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [locale] = useState('de');

  // Fetch sessions, tracks, rooms
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
        // Silently handle - empty state will show
        if (!cancelled) {
          setSessions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => { cancelled = true; };
  }, [congressId, setSessions]);

  // Compute unique dates from sessions
  const dates = useMemo(() => {
    const dateSet = new Set<string>();
    for (const session of sessions) {
      dateSet.add(formatDateKey(session.start_time));
    }
    return Array.from(dateSet).sort();
  }, [sessions]);

  // Auto-select first date
  useEffect(() => {
    if (dates.length > 0 && (!selectedDate || !dates.includes(selectedDate))) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate, setSelectedDate]);

  // Build track/room lookup maps
  const trackMap = useMemo(() => {
    const map = new Map<string, Track>();
    for (const track of tracks) {
      map.set(track.id, track);
    }
    return map;
  }, [tracks]);

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    for (const room of rooms) {
      map.set(room.id, room);
    }
    return map;
  }, [rooms]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return sessions.filter((session) => {
      // Filter by date
      if (selectedDate && formatDateKey(session.start_time) !== selectedDate) return false;
      // Filter by track
      if (selectedTrack && session.track_id !== selectedTrack) return false;
      // Filter by search
      if (query) {
        const titleMatch = session.title.toLowerCase().includes(query);
        const speakerMatch = (speakerMap[session.id] ?? []).some((name) =>
          name.toLowerCase().includes(query)
        );
        if (!titleMatch && !speakerMatch) return false;
      }
      return true;
    });
  }, [sessions, selectedDate, selectedTrack, searchQuery, speakerMap]);

  // Group by time slot
  const groupedByTime = useMemo(() => {
    const groups = new Map<string, SessionWithMeta[]>();
    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    for (const session of sorted) {
      const key = formatTimeSlot(session.start_time);
      const entry: SessionWithMeta = {
        session,
        track: session.track_id ? (trackMap.get(session.track_id) ?? null) : null,
        room: session.room_id ? (roomMap.get(session.room_id) ?? null) : null,
        speakerNames: speakerMap[session.id] ?? [],
      };
      const existing = groups.get(key);
      if (existing) {
        existing.push(entry);
      } else {
        groups.set(key, [entry]);
      }
    }
    return groups;
  }, [filteredSessions, trackMap, roomMap, speakerMap]);

  const handleTrackSelect = useCallback(
    (trackId: string | null) => {
      setSelectedTrack(trackId);
    },
    [setSelectedTrack]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Day tabs */}
      {dates.length > 0 && (
        <Tabs
          value={selectedDate ?? dates[0]}
          onValueChange={(val) => setSelectedDate(val)}
        >
          <TabsList className="w-full overflow-x-auto">
            {dates.map((date, idx) => (
              <TabsTrigger key={date} value={date} className="whitespace-nowrap">
                {formatDayLabel(date, idx, t('dayPrefix'))}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Track filter */}
      {tracks.length > 0 && (
        <TrackFilter
          tracks={tracks}
          selectedTrackId={selectedTrack}
          onSelect={handleTrackSelect}
        />
      )}

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('searchPlaceholder')}
      />

      {/* Timeline grid */}
      {groupedByTime.size === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t('noSessions')}
          description={t('noSessionsDescription')}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from(groupedByTime.entries()).map(([timeSlot, items]) => (
            <div key={timeSlot} className="flex flex-col gap-3">
              {/* Time divider */}
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-sm font-semibold text-ensemble-500 dark:text-ensemble-400">
                  {timeSlot}
                </span>
                <div className="h-px flex-1 bg-ensemble-200 dark:bg-ensemble-700" />
              </div>
              {/* Session cards grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ session, track, room, speakerNames }) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    track={track}
                    room={room}
                    speakerNames={speakerNames}
                    congressId={congressId}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
