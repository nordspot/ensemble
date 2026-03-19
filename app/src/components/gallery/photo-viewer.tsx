'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Photo } from '@/lib/db/photos';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const t = useTranslations('gallery');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
          break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!photo) return null;

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={t('viewerTitle')}
      >
        {/* Main image */}
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[85vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={`/api/r2/${photo.r2_key}`}
            alt={photo.caption ?? t('photoAlt')}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          />
        </motion.div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Previous button */}
        {hasPrev && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Next button */}
        {hasNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Photo details bar */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0',
            'bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pt-12',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex max-w-3xl items-end justify-between">
            <div>
              {photo.caption && (
                <p className="mb-1 text-lg font-medium text-white">
                  {photo.caption}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {photo.user_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(photo.created_at)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20"
            >
              <a
                href={`/api/r2/${photo.r2_key}`}
                download
                title={t('download')}
              >
                <Download className="h-5 w-5" />
              </a>
            </Button>
          </div>
          {/* Counter */}
          <p className="mt-2 text-center text-xs text-white/50">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
