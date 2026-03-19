'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { SessionDetail } from '@/components/congress/session-detail';
import { EmptyState } from '@/components/shared/empty-state';
import type { Session, Track, Room, Profile } from '@/types';

interface SessionDetailClientProps {
  congressId: string;
  sessionId: string;
  locale: string;
}

interface SessionDetailData {
  session: Session | null;
  track: Track | null;
  room: Room | null;
  speakers: Profile[];
  relatedSessions: Session[];
}

export function SessionDetailClient({ congressId, sessionId, locale }: SessionDetailClientProps) {
  const [data, setData] = useState<SessionDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      setLoading(true);
      try {
        const res = await fetch(`/api/congress/${congressId}/sessions?sessionId=${sessionId}`);
        if (!res.ok) throw new Error('Failed to load session');
        const json = await res.json();
        if (!cancelled) {
          setData(json.data ?? null);
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchSession();
    return () => { cancelled = true; };
  }, [congressId, sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-ensemble-100 dark:bg-ensemble-800" />
        <div className="h-64 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800" />
      </div>
    );
  }

  if (!data?.session) {
    return (
      <EmptyState
        icon={Clock}
        title="Session nicht gefunden"
        description="Die angeforderte Session konnte nicht geladen werden."
      />
    );
  }

  return (
    <SessionDetail
      session={data.session}
      track={data.track}
      room={data.room}
      speakers={data.speakers}
      relatedSessions={data.relatedSessions}
      congressId={congressId}
      locale={locale}
    />
  );
}
