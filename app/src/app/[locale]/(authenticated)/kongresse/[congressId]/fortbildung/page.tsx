'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { CreditTracker } from '@/components/cme/credit-tracker';
import { Button } from '@/components/ui/button';

export default function CmePage() {
  const params = useParams<{ locale: string; congressId: string }>();
  const congressId = params.congressId;
  const locale = params.locale;
  const t = useTranslations('cme');
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDownloadCertificate = useCallback(async () => {
    setDownloading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/congress/${congressId}/certificate`,
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zertifikat-${congressId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (res.status === 404) {
        setMessage(
          'Das Zertifikat wurde noch nicht erstellt. Bitte schliessen Sie zuerst alle erforderlichen Evaluationen ab.',
        );
      } else {
        setMessage(
          'Zertifikat konnte nicht heruntergeladen werden. Bitte versuchen Sie es spaeter erneut.',
        );
      }
    } catch {
      setMessage(
        'Zertifikat konnte nicht heruntergeladen werden. Bitte versuchen Sie es spaeter erneut.',
      );
    } finally {
      setDownloading(false);
    }
  }, [congressId]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          className="self-start gap-2"
          onClick={handleDownloadCertificate}
          disabled={downloading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          {downloading ? 'Wird heruntergeladen...' : t('downloadCertificate')}
        </Button>
      </div>

      {message && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
          {message}
        </div>
      )}

      {/* Credit tracker (client component) */}
      <CreditTracker congressId={congressId} locale={locale} />
    </div>
  );
}
