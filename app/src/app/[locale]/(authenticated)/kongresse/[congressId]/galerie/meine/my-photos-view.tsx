'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PhotoUpload } from '@/components/gallery/photo-upload';
import { cn } from '@/lib/utils';
import type { Photo } from '@/lib/db/photos';

interface MyPhotosViewProps {
  congressId: string;
}

export function MyPhotosView({ congressId }: MyPhotosViewProps) {
  const t = useTranslations('gallery');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/congress/${congressId}/photos?mine=1`,
      );
      const json = (await res.json()) as {
        ok: boolean;
        data: Photo[];
      };
      if (json.ok) {
        setPhotos(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, [congressId]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  async function handleTogglePublic(photoId: string) {
    await fetch(`/api/congress/${congressId}/photos?id=${photoId}&action=togglePublic`, {
      method: 'PATCH',
    });
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, is_public: !p.is_public } : p,
      ),
    );
  }

  async function handleDelete(photoId: string) {
    await fetch(`/api/congress/${congressId}/photos?id=${photoId}`, {
      method: 'DELETE',
    });
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  return (
    <div className="space-y-6">
      {/* Upload toggle */}
      <Button
        onClick={() => setShowUpload(!showUpload)}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {showUpload ? t('hideUpload') : t('uploadButton')}
      </Button>

      {showUpload && (
        <PhotoUpload
          congressId={congressId}
          onUploadComplete={() => {
            setShowUpload(false);
            void fetchPhotos();
          }}
        />
      )}

      {/* Photos grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-ensemble-200 dark:bg-ensemble-700"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="py-16 text-center text-ensemble-500 dark:text-ensemble-400">
          <p>{t('noOwnPhotos')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-xl bg-ensemble-100 dark:bg-ensemble-800"
              >
                <img
                  src={`/api/r2/${photo.thumbnail_key ?? photo.r2_key}`}
                  alt={photo.caption ?? ''}
                  className="aspect-square w-full object-cover"
                />

                {/* Status badge */}
                <div className="absolute left-2 top-2">
                  <Badge variant={photo.is_public ? 'default' : 'outline'}>
                    {photo.is_public ? t('public') : t('private')}
                  </Badge>
                </div>

                {/* Action buttons on hover */}
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center gap-2 bg-black/50',
                    'opacity-0 transition-opacity group-hover:opacity-100',
                  )}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublic(photo.id)}
                    className="text-white hover:bg-white/20"
                    title={photo.is_public ? t('makePrivate') : t('makePublic')}
                  >
                    {photo.is_public ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(photo.id)}
                    className="text-red-400 hover:bg-red-500/20"
                    title={t('deletePhoto')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Caption */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">{photo.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
