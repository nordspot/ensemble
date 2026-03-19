'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecordingCardProps {
  id: string;
  title: string;
  speaker: string;
  thumbnailUrl: string | null;
  duration: number; // seconds
  recordedAt: string;
  congressId: string;
  locale: string;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function RecordingCard({
  id,
  title,
  speaker,
  thumbnailUrl,
  duration,
  recordedAt,
  congressId,
  locale,
}: RecordingCardProps) {
  const t = useTranslations('onDemand');
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'cursor-pointer overflow-hidden transition-shadow hover:shadow-lg',
          'bg-white dark:bg-ensemble-800',
        )}
        onClick={() =>
          router.push(`/${locale}/kongresse/${congressId}/on-demand/${id}`)
        }
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full bg-ensemble-200 dark:bg-ensemble-700">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-12 w-12 text-ensemble-400 dark:text-ensemble-500" />
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 dark:bg-ensemble-900/90">
              <Play className="ml-1 h-6 w-6 text-ensemble-900 dark:text-ensemble-100" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {formatDuration(duration)}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold text-ensemble-900 dark:text-ensemble-50">
            {title}
          </h3>
          <p className="mt-1 text-sm text-ensemble-600 dark:text-ensemble-400">
            {speaker}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-ensemble-500 dark:text-ensemble-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(recordedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
