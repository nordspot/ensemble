'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircleQuestion,
  ThumbsUp,
  CheckCircle2,
  EyeOff,
  Send,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  session_id: string;
  user_id: string;
  author_name: string | null;
  body: string;
  is_anonymous: boolean;
  is_answered: boolean;
  is_approved: boolean;
  upvote_count: number;
  voted_by_me: boolean;
  created_at: string;
}

interface QAPanelProps {
  congressId: string;
  sessionId: string;
  isModerator?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────

export function QAPanel({ congressId, sessionId, isModerator = false }: QAPanelProps) {
  const t = useTranslations('live.qa');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // ── Fetch questions ──────────────────────────────────────────────────

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/congress/${congressId}/qa?sessionId=${sessionId}`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setQuestions(json.data.questions);
      }
    } catch {
      // silent
    }
  }, [congressId, sessionId]);

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, [fetchQuestions]);

  // ── Sorted by votes ─────────────────────────────────────────────────

  const sorted = useMemo(
    () =>
      [...questions]
        .filter((q) => isModerator || q.is_approved)
        .sort((a, b) => b.upvote_count - a.upvote_count),
    [questions, isModerator]
  );

  // ── Submit question ─────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/congress/${congressId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          body: trimmed,
          is_anonymous: isAnonymous,
        }),
      });
      if (res.ok) {
        setInput('');
        await fetchQuestions();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Vote ────────────────────────────────────────────────────────────

  const handleVote = async (questionId: string) => {
    if (votedIds.has(questionId)) return;
    setVotedIds((prev) => new Set(prev).add(questionId));

    try {
      await fetch(`/api/congress/${congressId}/qa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', questionId }),
      });
      await fetchQuestions();
    } catch {
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  };

  // ── Moderator actions ───────────────────────────────────────────────

  const handleModAction = async (
    questionId: string,
    action: 'mark_answered' | 'hide'
  ) => {
    try {
      await fetch(`/api/congress/${congressId}/qa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, questionId }),
      });
      await fetchQuestions();
    } catch {
      // silent
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircleQuestion className="h-5 w-5 text-accent-500" />
          {t('title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4 overflow-hidden">
        {/* Question list */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {sorted.length === 0 ? (
            <EmptyState
              icon={MessageCircleQuestion}
              title={t('empty')}
              description={t('emptyDescription')}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {sorted.map((q) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    'rounded-lg border p-3',
                    'border-ensemble-200 dark:border-ensemble-700',
                    'bg-ensemble-50 dark:bg-ensemble-800/50',
                    q.is_answered && 'border-success/30 bg-success/5 dark:bg-success/10'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Vote column */}
                    <button
                      type="button"
                      onClick={() => handleVote(q.id)}
                      disabled={votedIds.has(q.id)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 pt-0.5',
                        'text-ensemble-400 hover:text-accent-500 transition-colors',
                        votedIds.has(q.id) && 'text-accent-500'
                      )}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs font-semibold">{q.upvote_count}</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ensemble-900 dark:text-ensemble-50">
                        {q.body}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-ensemble-500 dark:text-ensemble-400">
                          <User className="h-3 w-3" />
                          {q.is_anonymous ? t('anonymous') : (q.author_name ?? t('anonymous'))}
                        </span>
                        {q.is_answered && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            {t('answered')}
                          </Badge>
                        )}
                        {!q.is_approved && isModerator && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            {t('pendingApproval')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Moderator actions */}
                    {isModerator && (
                      <div className="flex items-center gap-1 shrink-0">
                        {!q.is_answered && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleModAction(q.id, 'mark_answered')}
                            title={t('markAnswered')}
                          >
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleModAction(q.id, 'hide')}
                          title={t('hide')}
                        >
                          <EyeOff className="h-4 w-4 text-ensemble-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Submit form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-ensemble-200 dark:border-ensemble-700">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-1"
            maxLength={500}
          />
          <label className="flex items-center gap-1.5 text-xs text-ensemble-500 dark:text-ensemble-400 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-ensemble-300 dark:border-ensemble-600"
            />
            {t('anonymousToggle')}
          </label>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
