'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EvaluationFormProps {
  sessionId: string;
  sessionTitle: string;
  congressId: string;
  onComplete?: () => void;
}

interface RatingCategory {
  key: string;
  value: number;
}

const CATEGORIES = ['contentQuality', 'speakerEffectiveness', 'relevance', 'organization'] as const;

export function EvaluationForm({
  sessionId,
  sessionTitle,
  congressId,
  onComplete,
}: EvaluationFormProps) {
  const t = useTranslations('cme');
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  );
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setRating = useCallback((category: string, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  }, []);

  const averageRating = (() => {
    const values = Object.values(ratings);
    const sum = values.reduce((a, b) => a + b, 0);
    return values.length > 0 ? sum / values.length : 0;
  })();

  const isValid = Object.values(ratings).every((v) => v > 0);

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/congress/${congressId}/cme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          session_id: sessionId,
          rating: Math.round(averageRating * 10) / 10,
          feedback: comments || null,
          categories: ratings,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        onComplete?.();
      }
    } finally {
      setSubmitting(false);
    }
  }, [isValid, congressId, sessionId, averageRating, comments, ratings, onComplete]);

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="mt-4 font-semibold text-ensemble-900 dark:text-ensemble-50">
            {t('evaluationSubmitted')}
          </p>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('creditAwarded')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('evaluateSession')}</CardTitle>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          {sessionTitle}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating categories */}
        {CATEGORIES.map((category) => (
          <div key={category}>
            <label className="mb-2 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t(`categories.${category}`)}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(category, star)}
                  className="rounded p-1 transition-colors hover:bg-ensemble-50 dark:hover:bg-ensemble-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={star <= ratings[category] ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={
                      star <= ratings[category]
                        ? 'text-yellow-500'
                        : 'text-ensemble-300 dark:text-ensemble-600'
                    }
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Comments */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
            {t('comments')}
          </label>
          <Textarea
            placeholder={t('commentsPlaceholder')}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full"
        >
          {submitting ? t('submitting') : t('submitEvaluation')}
        </Button>
      </CardContent>
    </Card>
  );
}
