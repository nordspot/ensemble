'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Check, Clock, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/hooks/use-realtime';
import { sessionChannel } from '@/lib/realtime/channels';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

type PollStatus = 'waiting' | 'active' | 'closed';

interface PollOption {
  label: string;
  count: number;
  percentage: number;
}

interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  status: PollStatus;
  totalVotes: number;
  myVote: string | null;
}

interface PollWidgetProps {
  congressId: string;
  sessionId: string;
}

// ── Component ────────────────────────────────────────────────────────────

export function PollWidget({ congressId, sessionId }: PollWidgetProps) {
  const t = useTranslations('live.poll');

  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── WebSocket for real-time updates ─────────────────────────────────

  const doId = sessionChannel(congressId, sessionId);

  const handleServerEvent = useCallback((data: unknown) => {
    const event = data as {
      type: string;
      poll?: PollData;
      pollId?: string;
      options?: PollOption[];
      totalVotes?: number;
    };

    switch (event.type) {
      case 'poll_update':
        if (event.poll) {
          setPoll(event.poll);
          if (event.poll.myVote) {
            setHasVoted(true);
            setSelectedOption(event.poll.myVote);
          }
        }
        break;

      case 'poll_results':
        if (event.pollId && poll?.id === event.pollId && event.options) {
          setPoll((prev) =>
            prev
              ? { ...prev, options: event.options!, totalVotes: event.totalVotes ?? prev.totalVotes }
              : prev
          );
        }
        break;

      case 'poll_closed':
        if (event.pollId && poll?.id === event.pollId) {
          setPoll((prev) => (prev ? { ...prev, status: 'closed' } : prev));
        }
        break;
    }
  }, [poll?.id]);

  const { send: wsSend, isConnected } = useRealtime(
    'SessionRoom',
    doId,
    { onMessage: handleServerEvent },
  );

  // ── Fetch active poll (initial load) ──────────────────────────────

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/congress/${congressId}/polls?sessionId=${sessionId}`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok && json.data.poll) {
        const p = json.data.poll as PollData;
        setPoll(p);
        if (p.myVote) {
          setHasVoted(true);
          setSelectedOption(p.myVote);
        }
      } else {
        setPoll(null);
      }
    } catch {
      // silent
    }
  }, [congressId, sessionId]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  // ── Submit vote ─────────────────────────────────────────────────────

  const handleVote = async () => {
    if (!poll || !selectedOption || hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isConnected) {
        wsSend({
          type: 'vote',
          pollId: poll.id,
          answer: selectedOption,
        });
        setHasVoted(true);
      } else {
        // Fallback to HTTP
        const res = await fetch(`/api/congress/${congressId}/polls`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'vote',
            pollId: poll.id,
            answer: selectedOption,
          }),
        });
        if (res.ok) {
          setHasVoted(true);
          await fetchPoll();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Status badge ────────────────────────────────────────────────────

  const statusConfig: Record<PollStatus, { label: string; variant: 'default' | 'success' | 'secondary'; icon: React.ElementType }> = {
    waiting: { label: t('statusWaiting'), variant: 'secondary', icon: Clock },
    active: { label: t('statusActive'), variant: 'default', icon: BarChart3 },
    closed: { label: t('statusClosed'), variant: 'secondary', icon: Lock },
  };

  if (!poll) return null;

  const showResults = hasVoted || poll.status === 'closed';
  const status = statusConfig[poll.status];
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-accent-500" />
            {t('title')}
          </CardTitle>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
          {poll.question}
        </p>

        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {poll.options.map((option) => {
              const isSelected = selectedOption === option.label;

              return (
                <motion.div
                  key={option.label}
                  layout
                  className="relative"
                >
                  {showResults ? (
                    /* Results bar */
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-lg border p-3',
                        'border-ensemble-200 dark:border-ensemble-700',
                        isSelected && 'border-accent-500 dark:border-accent-400'
                      )}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-accent-500/10 dark:bg-accent-400/10"
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      <div className="relative flex items-center justify-between">
                        <span className="text-sm text-ensemble-900 dark:text-ensemble-50 flex items-center gap-1.5">
                          {isSelected && (
                            <Check className="h-4 w-4 text-accent-500" />
                          )}
                          {option.label}
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <motion.span
                            className="font-semibold text-ensemble-900 dark:text-ensemble-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {Math.round(option.percentage)}%
                          </motion.span>
                          <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
                            ({option.count})
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Voting button */
                    <button
                      type="button"
                      onClick={() => setSelectedOption(option.label)}
                      disabled={poll.status !== 'active'}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left text-sm transition-colors',
                        'border-ensemble-200 dark:border-ensemble-700',
                        'hover:border-accent-500 dark:hover:border-accent-400',
                        isSelected &&
                          'border-accent-500 bg-accent-500/5 dark:border-accent-400 dark:bg-accent-400/5'
                      )}
                    >
                      <span className="text-ensemble-900 dark:text-ensemble-50">
                        {option.label}
                      </span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Vote button or total */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
            {t('totalVotes', { count: poll.totalVotes })}
          </span>
          {!hasVoted && poll.status === 'active' && (
            <Button
              size="sm"
              onClick={handleVote}
              disabled={!selectedOption || isSubmitting}
            >
              {t('submitVote')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
