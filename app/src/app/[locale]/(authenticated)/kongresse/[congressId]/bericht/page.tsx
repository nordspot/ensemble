'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportPage() {
  const params = useParams<{ locale: string; congressId: string }>();
  const congressId = params.congressId;
  const t = useTranslations('report');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadReport = useCallback(async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/congress/${congressId}/report`);
      if (!res.ok) {
        // If no API endpoint, generate a simple client-side summary
        const reportContent = [
          `Kongressbericht - ${congressId}`,
          `Erstellt am: ${new Date().toLocaleDateString('de-CH')}`,
          '',
          'Dieser Bericht wird nach Abschluss des Kongresses automatisch generiert.',
          'Enthalten sind Teilnehmerstatistiken, Session-Auswertungen und Feedback-Zusammenfassungen.',
        ].join('\n');

        const blob = new Blob([reportContent], {
          type: 'text/plain;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bericht-${congressId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // If the API returns a file, download it directly
      const blob = await res.blob();
      const contentType = res.headers.get('content-type') ?? '';
      const ext = contentType.includes('pdf') ? 'pdf' : 'txt';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bericht-${congressId}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Bericht konnte nicht heruntergeladen werden. Bitte versuchen Sie es spaeter erneut.');
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
          onClick={handleDownloadReport}
          disabled={downloading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          {downloading ? 'Wird heruntergeladen...' : t('downloadReport')}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* AI-generated executive summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            {t('executiveSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-ensemble-50 p-4 dark:bg-ensemble-800">
            <p className="text-sm italic text-ensemble-500 dark:text-ensemble-400">
              {t('summaryPlaceholder')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('stats.attendees')} value="--" />
        <StatCard label={t('stats.sessions')} value="--" />
        <StatCard label={t('stats.speakers')} value="--" />
        <StatCard label={t('stats.satisfaction')} value="--%" />
      </div>

      {/* Programme with recording links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('recordings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('noRecordings')}
          </p>
        </CardContent>
      </Card>

      {/* Content library */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('contentLibrary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('noContent')}
          </p>
        </CardContent>
      </Card>

      {/* Feedback summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('feedbackSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('noFeedback')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {value}
        </p>
        <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}
