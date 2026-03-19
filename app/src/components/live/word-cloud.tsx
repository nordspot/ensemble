'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface WordEntry {
  text: string;
  count: number;
}

interface WordCloudProps {
  congressId: string;
  sessionId: string;
  pollId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────

const COLORS = [
  'text-accent-500',
  'text-accent-600',
  'text-success',
  'text-warning',
  'text-error',
  'text-ensemble-700 dark:text-ensemble-300',
  'text-ensemble-600 dark:text-ensemble-400',
];

function sizeClass(count: number, maxCount: number): string {
  if (maxCount <= 1) return 'text-base';
  const ratio = count / maxCount;
  if (ratio >= 0.8) return 'text-4xl font-bold';
  if (ratio >= 0.6) return 'text-3xl font-semibold';
  if (ratio >= 0.4) return 'text-2xl font-medium';
  if (ratio >= 0.2) return 'text-xl';
  return 'text-base';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Component ────────────────────────────────────────────────────────────

export function WordCloud({ congressId, sessionId, pollId }: WordCloudProps) {
  const t = useTranslations('live.wordCloud');

  const [words, setWords] = useState<WordEntry[]>([]);

  const fetchWords = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/congress/${congressId}/polls?sessionId=${sessionId}&pollId=${pollId}&type=word_cloud`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setWords(json.data.words ?? []);
      }
    } catch {
      // silent
    }
  }, [congressId, sessionId, pollId]);

  useEffect(() => {
    fetchWords();
    const interval = setInterval(fetchWords, 4000);
    return () => clearInterval(interval);
  }, [fetchWords]);

  const maxCount = useMemo(
    () => Math.max(...words.map((w) => w.count), 1),
    [words]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="h-5 w-5 text-accent-500" />
          {t('title')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {words.length === 0 ? (
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400 text-center py-8">
            {t('empty')}
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3 py-4 min-h-[200px]">
            <AnimatePresence>
              {words.map((word) => {
                const colorIdx = hashString(word.text) % COLORS.length;
                return (
                  <motion.span
                    key={word.text}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      sizeClass(word.count, maxCount),
                      COLORS[colorIdx],
                      'leading-tight px-1 select-none transition-all'
                    )}
                    title={`${word.text}: ${word.count}`}
                  >
                    {word.text}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
