'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  ArrowDown,
  Clock,
  Pause,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface TranscriptSegment {
  id: string;
  timestamp: number; // seconds from start
  text: string;
  speaker: string | null;
}

interface TranscriptViewerProps {
  congressId: string;
  sessionId: string;
  isLive?: boolean;
  onTimestampClick?: (seconds: number) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Component ────────────────────────────────────────────────────────────

export function TranscriptViewer({
  congressId,
  sessionId,
  isLive = false,
  onTimestampClick,
}: TranscriptViewerProps) {
  const t = useTranslations('live.transcript');

  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSegmentCountRef = useRef(0);

  // ── Fetch transcript ────────────────────────────────────────────────

  const fetchTranscript = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/congress/${congressId}/sessions/${sessionId}/transcript`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        const newSegments = json.data.segments ?? [];
        setSegments(newSegments);

        // Auto-scroll on new segments
        if (
          autoScroll &&
          newSegments.length > lastSegmentCountRef.current &&
          scrollRef.current
        ) {
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 100);
        }
        lastSegmentCountRef.current = newSegments.length;
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [congressId, sessionId, autoScroll]);

  // SSE for live updates
  useEffect(() => {
    fetchTranscript();

    if (!isLive) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(
        `/api/congress/${congressId}/sessions/${sessionId}/transcript?stream=1`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type: string;
            segments?: TranscriptSegment[];
            segment?: TranscriptSegment;
          };

          if (data.type === 'init' && data.segments) {
            setSegments(data.segments);
            lastSegmentCountRef.current = data.segments.length;
            setIsLoading(false);
          } else if (data.type === 'segment' && data.segment) {
            setSegments((prev) => {
              const next = [...prev, data.segment!];
              if (autoScroll && scrollRef.current) {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({
                    top: scrollRef.current!.scrollHeight,
                    behavior: 'smooth',
                  });
                }, 100);
              }
              lastSegmentCountRef.current = next.length;
              return next;
            });
          }
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        // Fall back to polling on SSE failure
        eventSource?.close();
        eventSource = null;
      };
    } catch {
      // SSE not available, fall back to polling
    }

    // Fallback polling if SSE disconnects
    const interval = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        fetchTranscript();
      }
    }, 5000);

    return () => {
      eventSource?.close();
      clearInterval(interval);
    };
  }, [congressId, sessionId, isLive, fetchTranscript, autoScroll]);

  // ── Filter by search ────────────────────────────────────────────────

  const filtered = searchQuery.trim()
    ? segments.filter(
        (s) =>
          s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false)
      )
    : segments;

  // ── Handle scroll position (disable auto-scroll if user scrolled up) ─

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (!atBottom && autoScroll) {
      setAutoScroll(false);
    }
  };

  const scrollToBottom = () => {
    setAutoScroll(true);
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-accent-500" />
            {t('title')}
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-normal text-error">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
                </span>
                LIVE
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll((prev) => !prev)}
            className={cn(
              'text-xs gap-1',
              autoScroll
                ? 'text-accent-500'
                : 'text-ensemble-500 dark:text-ensemble-400'
            )}
          >
            {autoScroll ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {t('autoScroll')}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ensemble-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-ensemble-100 dark:bg-ensemble-800 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-center text-ensemble-500 dark:text-ensemble-400 py-8">
            {searchQuery ? t('noResults') : t('empty')}
          </p>
        ) : (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-y-auto h-full space-y-1 pr-1"
            >
              <AnimatePresence initial={false}>
                {filtered.map((segment) => (
                  <motion.div
                    key={segment.id}
                    initial={isLive ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'group flex gap-3 py-1.5 px-2 rounded-md',
                      'hover:bg-ensemble-50 dark:hover:bg-ensemble-800/50',
                      'transition-colors'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onTimestampClick?.(segment.timestamp)}
                      className="shrink-0 text-xs text-accent-500 hover:text-accent-600 font-mono mt-0.5 tabular-nums"
                      title={t('jumpTo')}
                    >
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatTimestamp(segment.timestamp)}
                    </button>
                    <div className="flex-1 min-w-0">
                      {segment.speaker && (
                        <span className="text-xs font-semibold text-ensemble-700 dark:text-ensemble-300 mr-1.5">
                          {segment.speaker}:
                        </span>
                      )}
                      <span className="text-sm text-ensemble-900 dark:text-ensemble-50">
                        {segment.text}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Scroll-to-bottom indicator */}
            {!autoScroll && isLive && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={scrollToBottom}
                  className="shadow-lg text-xs gap-1"
                >
                  <ArrowDown className="h-3 w-3" />
                  {t('scrollToLatest')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
