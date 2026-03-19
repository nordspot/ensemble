'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhotoViewer } from './photo-viewer';
import type { Photo } from '@/lib/db/photos';

interface PhotoGridProps {
  congressId: string;
  initialPhotos: Photo[];
  initialTotal: number;
  pageSize?: number;
  showUserInfo?: boolean;
}

export function PhotoGrid({
  congressId,
  initialPhotos,
  initialTotal,
  pageSize = 24,
  showUserInfo = true,
}: PhotoGridProps) {
  const t = useTranslations('gallery');
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const hasMore = photos.length < total;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/congress/${congressId}/photos?page=${nextPage}&pageSize=${pageSize}`,
      );
      const json = (await res.json()) as {
        ok: boolean;
        data: Photo[];
        meta: { total: number };
      };
      if (json.ok) {
        setPhotos((prev) => [...prev, ...json.data]);
        setTotal(json.meta.total);
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
    }
  }, [congressId, page, pageSize, loading, hasMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-ensemble-500 dark:text-ensemble-400">
          <p className="text-lg">{t('empty')}</p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: (index % pageSize) * 0.03 }}
                className="mb-4 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setViewerIndex(index)}
                  className={cn(
                    'group relative w-full overflow-hidden rounded-xl',
                    'bg-ensemble-100 dark:bg-ensemble-800',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ensemble-500',
                  )}
                >
                  {/* Photo image */}
                  <img
                    src={`/api/r2/${photo.thumbnail_key ?? photo.r2_key}`}
                    alt={photo.caption ?? t('photoAlt')}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {showUserInfo && (
                        <p className="text-sm font-medium text-white">
                          {photo.user_name}
                        </p>
                      )}
                      {photo.location && (
                        <p className="flex items-center gap-1 text-xs text-white/80">
                          <MapPin className="h-3 w-3" />
                          {photo.location}
                        </p>
                      )}
                      <p className="flex items-center gap-1 text-xs text-white/80">
                        <Clock className="h-3 w-3" />
                        {formatTime(photo.created_at)}
                      </p>
                    </div>

                    {/* Like button */}
                    <div className="absolute right-2 top-2">
                      <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs text-white">
                        <Heart className="h-3.5 w-3.5" />
                        {photo.like_count}
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          {loading && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ensemble-300 border-t-ensemble-600 dark:border-ensemble-600 dark:border-t-ensemble-300" />
          )}
        </div>
      )}

      {/* Lightbox viewer */}
      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
