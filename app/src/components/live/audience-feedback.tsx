'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

interface ReactionCount {
  emoji: string;
  count: number;
}

interface AudienceFeedbackProps {
  congressId: string;
  sessionId: string;
}

// ── Constants ────────────────────────────────────────────────────────────

const REACTIONS = [
  { emoji: '\uD83D\uDC4F', key: 'clap' },
  { emoji: '\u2764\uFE0F', key: 'heart' },
  { emoji: '\uD83D\uDCA1', key: 'idea' },
  { emoji: '\uD83D\uDE2E', key: 'wow' },
  { emoji: '\uD83D\uDE02', key: 'laugh' },
] as const;

let floatingIdCounter = 0;

// ── Component ────────────────────────────────────────────────────────────

export function AudienceFeedback({ congressId, sessionId }: AudienceFeedbackProps) {
  const t = useTranslations('live.reactions');

  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const [counts, setCounts] = useState<ReactionCount[]>(
    REACTIONS.map((r) => ({ emoji: r.emoji, count: 0 }))
  );
  const cooldownRef = useRef<Record<string, boolean>>({});

  // ── Send reaction ───────────────────────────────────────────────────

  const sendReaction = useCallback(
    async (emoji: string) => {
      // Cooldown per emoji (500ms)
      if (cooldownRef.current[emoji]) return;
      cooldownRef.current[emoji] = true;
      setTimeout(() => {
        cooldownRef.current[emoji] = false;
      }, 500);

      // Optimistic floating animation
      const id = `float-${++floatingIdCounter}`;
      const x = 20 + Math.random() * 60; // random x between 20-80%
      setFloating((prev) => [...prev, { id, emoji, x }]);

      // Remove after animation
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.id !== id));
      }, 2000);

      // Optimistic count
      setCounts((prev) =>
        prev.map((c) =>
          c.emoji === emoji ? { ...c, count: c.count + 1 } : c
        )
      );

      // Fire-and-forget API call
      try {
        await fetch(`/api/congress/${congressId}/qa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reaction',
            sessionId,
            emoji,
          }),
        });
      } catch {
        // silent
      }
    },
    [congressId, sessionId]
  );

  return (
    <div className="relative">
      {/* Floating emojis overlay */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 h-64 z-50 overflow-hidden">
        <AnimatePresence>
          {floating.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 1, y: 0, x: `${f.x}%` }}
              animate={{ opacity: 0, y: -200 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-0 text-3xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction bar */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 p-2 rounded-xl',
          'bg-white/80 dark:bg-ensemble-900/80 backdrop-blur-md',
          'border border-ensemble-200 dark:border-ensemble-700',
          'shadow-lg'
        )}
      >
        {REACTIONS.map((reaction) => {
          const count = counts.find((c) => c.emoji === reaction.emoji)?.count ?? 0;

          return (
            <button
              key={reaction.key}
              type="button"
              onClick={() => sendReaction(reaction.emoji)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg',
                'transition-transform hover:scale-110 active:scale-95',
                'hover:bg-ensemble-100 dark:hover:bg-ensemble-800'
              )}
            >
              <span className="text-2xl leading-none">{reaction.emoji}</span>
              {count > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-semibold text-ensemble-500 dark:text-ensemble-400"
                >
                  {count}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
