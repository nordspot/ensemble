'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, FileImage, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Poster } from '@/lib/db/posters';

interface PosterCardProps {
  poster: Poster;
  congressId: string;
  locale: string;
  onVote: () => void;
}

export function PosterCard({ poster, congressId, locale, onVote }: PosterCardProps) {
  const t = useTranslations('poster');
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
          router.push(
            `/${locale}/kongresse/${congressId}/poster/${poster.id}`,
          )
        }
      >
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] w-full bg-ensemble-100 dark:bg-ensemble-700">
          {poster.thumbnail_key ? (
            <img
              src={`/api/r2/${poster.thumbnail_key}`}
              alt={poster.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <FileImage className="h-12 w-12 text-ensemble-300 dark:text-ensemble-600" />
              <span className="text-xs text-ensemble-400 dark:text-ensemble-500">
                {t('noPreview')}
              </span>
            </div>
          )}

          {/* Poster number */}
          {poster.poster_number && (
            <div className="absolute left-2 top-2">
              <Badge variant="default" className="gap-1 text-xs">
                <Hash className="h-3 w-3" />
                {poster.poster_number}
              </Badge>
            </div>
          )}

          {/* Category */}
          {poster.category && (
            <div className="absolute right-2 top-2">
              <Badge variant="outline" className="bg-white/80 text-xs dark:bg-ensemble-900/80">
                {poster.category}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold text-ensemble-900 dark:text-ensemble-50">
            {poster.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-ensemble-600 dark:text-ensemble-400">
            {poster.authors}
          </p>

          {/* Vote button */}
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onVote();
              }}
            >
              <Star className="h-4 w-4" />
              {poster.vote_count}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
