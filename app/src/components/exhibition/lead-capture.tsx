'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Lead {
  id: string;
  userName: string;
  notes: string;
  rating: number;
  scannedAt: string;
}

interface LeadCaptureProps {
  exhibitorId: string;
  congressId: string;
  existingLeads?: Lead[];
}

export function LeadCapture({
  exhibitorId,
  congressId,
  existingLeads = [],
}: LeadCaptureProps) {
  const t = useTranslations('exhibition');
  const [leads, setLeads] = useState<Lead[]>(existingLeads);
  const [scanning, setScanning] = useState(false);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [scannedUser, setScannedUser] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleScan = useCallback(async () => {
    setScanning(true);
    try {
      // Check for NFC support
      if ('NDEFReader' in window) {
        const ndef = new (window as unknown as { NDEFReader: new () => { scan: () => Promise<void>; onreading: ((event: { message: { records: Array<{ data: ArrayBuffer }> } }) => void) | null } }).NDEFReader();
        await ndef.scan();
        ndef.onreading = (event) => {
          const record = event.message.records[0];
          if (record) {
            const decoder = new TextDecoder();
            const data = decoder.decode(record.data);
            try {
              const parsed = JSON.parse(data) as { userId: string; name: string };
              setScannedUser({ id: parsed.userId, name: parsed.name });
            } catch {
              // Fallback: treat as plain user ID
              setScannedUser({ id: data, name: data });
            }
          }
          setScanning(false);
        };
      } else {
        // Fallback: QR code scanning would be triggered here
        // For now simulate with a prompt
        setScanning(false);
      }
    } catch {
      setScanning(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!scannedUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/congress/${congressId}/exhibitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_lead',
          exhibitor_id: exhibitorId,
          user_id: scannedUser.id,
          notes,
          rating,
        }),
      });
      if (res.ok) {
        const newLead: Lead = {
          id: crypto.randomUUID(),
          userName: scannedUser.name,
          notes,
          rating,
          scannedAt: new Date().toISOString(),
        };
        setLeads((prev) => [newLead, ...prev]);
        setScannedUser(null);
        setNotes('');
        setRating(0);
      }
    } finally {
      setSaving(false);
    }
  }, [scannedUser, notes, rating, exhibitorId, congressId]);

  const handleExportCsv = useCallback(() => {
    const header = 'Name,Notizen,Bewertung,Datum\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.userName}","${l.notes}","${l.rating}","${l.scannedAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${exhibitorId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [leads, exhibitorId]);

  return (
    <div className="space-y-6">
      {/* Scan section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('scanBadge')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scannedUser ? (
            <Button onClick={handleScan} disabled={scanning} className="w-full gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              {scanning ? t('scanning') : t('scanBadge')}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-ensemble-50 p-4 dark:bg-ensemble-800">
                <p className="font-medium text-ensemble-900 dark:text-ensemble-50">
                  {scannedUser.name}
                </p>
              </div>

              {/* Notes */}
              <Textarea
                placeholder={t('notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />

              {/* Rating */}
              <div>
                <p className="mb-2 text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('rating')}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={star <= rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={
                          star <= rating
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

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? t('saving') : t('saveLead')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('leads')}</CardTitle>
          {leads.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              {t('exportLeads')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('noLeads')}
            </p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border border-ensemble-100 p-3 dark:border-ensemble-800"
                >
                  <div>
                    <p className="font-medium text-ensemble-900 dark:text-ensemble-50">
                      {lead.userName}
                    </p>
                    {lead.notes && (
                      <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                        {lead.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill={star <= lead.rating ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                          className={
                            star <= lead.rating
                              ? 'text-yellow-500'
                              : 'text-ensemble-300 dark:text-ensemble-600'
                          }
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-ensemble-400">
                      {new Date(lead.scannedAt).toLocaleTimeString('de-CH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
