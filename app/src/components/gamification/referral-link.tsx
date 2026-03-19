'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface ReferralData {
  code: string;
  url: string;
  clicks: number;
  conversions: number;
  rewardTiers: Array<{
    tier: string;
    required: number;
    reached: boolean;
  }>;
}

interface ReferralLinkProps {
  congressId: string;
}

export function ReferralLink({ congressId }: ReferralLinkProps) {
  const t = useTranslations('gamification');
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReferral() {
      try {
        const res = await fetch(`/api/congress/${congressId}/gamification`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data?.referral ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReferral();
  }, [congressId]);

  const handleCopy = useCallback(async () => {
    if (!data?.url) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = data.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data?.url]);

  const handleShare = useCallback(async () => {
    if (!data?.url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('shareTitle'),
          url: data.url,
        });
      } catch {
        // User cancelled share
      }
    }
  }, [data?.url, t]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-24 animate-pulse rounded bg-ensemble-100 dark:bg-ensemble-800" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const maxConversions = data.rewardTiers.length > 0
    ? data.rewardTiers[data.rewardTiers.length - 1].required
    : 10;
  const conversionProgress = Math.min(100, Math.round((data.conversions / maxConversions) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('referral')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Link with copy */}
        <div className="flex gap-2">
          <Input
            value={data.url}
            readOnly
            className="font-mono text-xs"
          />
          <Button variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-ensemble-50 p-3 text-center dark:bg-ensemble-800">
            <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {data.clicks}
            </p>
            <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
              {t('clicks')}
            </p>
          </div>
          <div className="rounded-lg bg-ensemble-50 p-3 text-center dark:bg-ensemble-800">
            <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              {data.conversions}
            </p>
            <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
              {t('conversions')}
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          {'share' in navigator && (
            <Button variant="outline" onClick={handleShare} className="flex-1 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
              {t('share')}
            </Button>
          )}
        </div>

        {/* Reward tiers progress */}
        {data.rewardTiers.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('rewardTiers')}
            </p>
            <Progress value={conversionProgress} className="mb-3" />
            <div className="space-y-2">
              {data.rewardTiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`flex items-center justify-between text-sm ${
                    tier.reached
                      ? 'text-accent-600 dark:text-accent-400'
                      : 'text-ensemble-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tier.reached ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    )}
                    {t(`tiers.${tier.tier}`)}
                  </span>
                  <span>
                    {tier.required} {t('conversions')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
