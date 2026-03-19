'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { X, Rocket, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DISMISSED_KEY = 'ensemble-onboarding-dismissed';

export function OnboardingBanner() {
  const t = useTranslations('onboarding');
  const params = useParams<{ locale: string }>();
  const locale = params.locale;

  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    setDismissed(stored === 'true');
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (dismissed) return null;

  return (
    <Card className="relative overflow-hidden border-accent-200 bg-gradient-to-r from-accent-50 to-ensemble-50 dark:border-accent-800 dark:from-accent-950/30 dark:to-ensemble-900">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-900/50">
          <Rocket className="h-6 w-6 text-accent-600 dark:text-accent-400" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-base font-semibold text-ensemble-900 dark:text-ensemble-50">
            {t('title')}
          </h3>
          <p className="text-sm text-ensemble-600 dark:text-ensemble-300">
            {t('description')}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={`/${locale}/admin/kongresse/neu`}>
              {t('createCongress')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/kongresse`}>
              <Search className="mr-2 h-4 w-4" />
              {t('browseCongresses')}
            </Link>
          </Button>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-ensemble-400 hover:text-ensemble-600 dark:text-ensemble-500 dark:hover:text-ensemble-300"
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}
