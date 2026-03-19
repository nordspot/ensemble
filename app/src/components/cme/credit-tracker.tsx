'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CreditType {
  id: string;
  name: string;
  authority: string;
  earned: number;
  max: number;
}

interface SessionCredit {
  sessionId: string;
  sessionTitle: string;
  credits: number;
  status: 'attended' | 'evaluated' | 'credited';
  evaluationMissing: boolean;
}

interface CreditTrackerProps {
  congressId: string;
  locale: string;
}

export function CreditTracker({ congressId, locale }: CreditTrackerProps) {
  const t = useTranslations('cme');
  const [creditTypes, setCreditTypes] = useState<CreditType[]>([]);
  const [sessions, setSessions] = useState<SessionCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch(`/api/congress/${congressId}/cme`);
        if (res.ok) {
          const json = await res.json();
          setCreditTypes(json.data?.creditTypes ?? []);
          setSessions(json.data?.sessions ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCredits();
  }, [congressId]);

  const totalEarned = creditTypes.reduce((sum, ct) => sum + ct.earned, 0);
  const totalAvailable = creditTypes.reduce((sum, ct) => sum + ct.max, 0);
  const percentage = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;
  const missingEvaluations = sessions.filter((s) => s.evaluationMissing);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ensemble-500 dark:text-ensemble-400">
                {t('totalCredits')}
              </p>
              <p className="mt-1 text-3xl font-bold text-ensemble-900 dark:text-ensemble-50">
                {totalEarned}
                <span className="text-lg font-normal text-ensemble-400"> / {totalAvailable}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent-500">{percentage}%</p>
            </div>
          </div>
          <Progress value={percentage} className="mt-4" />
        </CardContent>
      </Card>

      {/* Credit type breakdown */}
      {creditTypes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creditTypes.map((ct) => {
            const pct = ct.max > 0 ? Math.round((ct.earned / ct.max) * 100) : 0;
            return (
              <Card key={ct.id}>
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                    {ct.name}
                  </p>
                  <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                    {ct.authority}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-bold text-ensemble-900 dark:text-ensemble-50">
                      {ct.earned} / {ct.max}
                    </span>
                    <span className="text-ensemble-400">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Missing evaluations warning */}
      {missingEvaluations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-yellow-800 dark:text-yellow-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              {t('missingEvaluations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {t('missingEvaluationsHint', { count: missingEvaluations.length })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Session list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('sessionCredits')}</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('noSessions')}
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between rounded-lg border border-ensemble-100 p-3 dark:border-ensemble-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ensemble-900 dark:text-ensemble-50">
                      {session.sessionTitle}
                    </p>
                    <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                      {session.credits} {t('credits')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.status === 'credited'
                        ? 'default'
                        : session.status === 'evaluated'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      session.evaluationMissing
                        ? 'border-yellow-500 text-yellow-700 dark:text-yellow-300'
                        : ''
                    }
                  >
                    {t(`status.${session.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
