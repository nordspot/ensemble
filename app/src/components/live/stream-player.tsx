'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Maximize,
  Minimize,
  Settings,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface StreamPlayerProps {
  sessionTitle: string;
  streamUrl: string | null;
}

type Quality = 'auto' | '1080p' | '720p' | '480p';

// ── Component ────────────────────────────────────────────────────────────

export function StreamPlayer({ sessionTitle, streamUrl }: StreamPlayerProps) {
  const t = useTranslations('live.stream');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<Quality>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [hasError, setHasError] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initialize HLS ──────────────────────────────────────────────────

  useEffect(() => {
    if (!streamUrl || !videoRef.current) {
      setHasError(!streamUrl);
      return;
    }

    const video = videoRef.current;

    // Try HLS.js if available, otherwise native
    // Try native HLS first (Safari), then fallback
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
        setIsPlaying(true);
      });
      video.addEventListener('error', () => setHasError(true));
    } else {
      // HLS.js dynamic import — will gracefully fail if not installed
      // @ts-expect-error CDN module has no type declarations
      import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.mjs')
        .then((mod) => {
          const Hls = mod.default as {
            isSupported: () => boolean;
            Events: { ERROR: string; MANIFEST_PARSED: string };
            new (config: Record<string, unknown>): {
              loadSource: (url: string) => void;
              attachMedia: (el: HTMLMediaElement) => void;
              on: (event: string, cb: (...args: unknown[]) => void) => void;
              destroy: () => void;
            };
          };
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (...args: unknown[]) => {
              const data = args[1] as { fatal?: boolean } | undefined;
              if (data?.fatal) {
                setHasError(true);
              }
            });
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
              setIsPlaying(true);
              // Store HLS instance for quality switching
              hlsRef.current = hls as unknown as {
                currentLevel: number;
                levels: Array<{ height: number }>;
              };
            });
          } else {
            setHasError(true);
          }
        })
        .catch(() => {
          // HLS.js not available — show fallback
          setHasError(true);
        });
    }
  }, [streamUrl]);

  // ── Controls auto-hide ──────────────────────────────────────────────

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // ── Toggle fullscreen ───────────────────────────────────────────────

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // ── Toggle mute ─────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  // ── Quality options ─────────────────────────────────────────────────

  const qualities: Quality[] = ['auto', '1080p', '720p', '480p'];

  // Map quality label to HLS level height
  const qualityToHeight: Record<Quality, number | null> = {
    auto: null,
    '1080p': 1080,
    '720p': 720,
    '480p': 480,
  };

  const hlsRef = useRef<{
    currentLevel: number;
    levels: Array<{ height: number }>;
  } | null>(null);

  // Apply quality selection to HLS instance
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;

    const targetHeight = qualityToHeight[quality];
    if (targetHeight === null) {
      // Auto: let HLS.js decide
      hls.currentLevel = -1;
    } else {
      const levelIndex = hls.levels.findIndex(
        (l) => l.height === targetHeight,
      );
      if (levelIndex >= 0) {
        hls.currentLevel = levelIndex;
      }
    }
  }, [quality]);

  // ── Error / no stream fallback ──────────────────────────────────────

  if (hasError || !streamUrl) {
    return (
      <div
        className={cn(
          'relative flex flex-col items-center justify-center aspect-video rounded-xl',
          'bg-ensemble-950 text-white'
        )}
      >
        <WifiOff className="h-12 w-12 text-ensemble-400 mb-3" />
        <p className="text-sm font-medium">{t('unavailable')}</p>
        <p className="text-xs text-ensemble-400 mt-1">{t('unavailableHint')}</p>

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <p className="text-sm font-medium truncate">{sessionTitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-xl overflow-hidden bg-black group"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Title overlay (always visible at top) */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 p-4',
          'bg-gradient-to-b from-black/60 to-transparent',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <p className="text-sm font-medium text-white truncate">
          {sessionTitle}
        </p>
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3',
          'bg-gradient-to-t from-black/60 to-transparent',
          'flex items-center justify-between',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quality selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setShowQualityMenu((prev) => !prev)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-ensemble-900/95 border border-ensemble-700 rounded-lg py-1 min-w-[100px]">
                {qualities.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={cn(
                      'w-full px-3 py-1.5 text-xs text-left',
                      'hover:bg-ensemble-800 transition-colors',
                      quality === q
                        ? 'text-accent-400 font-medium'
                        : 'text-ensemble-300'
                    )}
                  >
                    {q === 'auto' ? t('qualityAuto') : q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
