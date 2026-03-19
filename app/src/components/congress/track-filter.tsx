'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Track } from '@/types';

interface TrackFilterProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelect: (trackId: string | null) => void;
}

export function TrackFilter({ tracks, selectedTrackId, onSelect }: TrackFilterProps) {
  const t = useTranslations('schedule');

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          selectedTrackId === null
            ? 'bg-accent-500 text-white'
            : 'border border-ensemble-200 text-ensemble-700 hover:bg-ensemble-50 dark:border-ensemble-700 dark:text-ensemble-300 dark:hover:bg-ensemble-800'
        )}
      >
        {t('allTracks')}
      </button>
      {tracks.map((track) => (
        <button
          key={track.id}
          type="button"
          onClick={() => onSelect(track.id === selectedTrackId ? null : track.id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            selectedTrackId === track.id
              ? 'bg-accent-500 text-white'
              : 'border border-ensemble-200 text-ensemble-700 hover:bg-ensemble-50 dark:border-ensemble-700 dark:text-ensemble-300 dark:hover:bg-ensemble-800'
          )}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: track.color ?? '#6b7280' }}
          />
          {track.name}
        </button>
      ))}
    </div>
  );
}
