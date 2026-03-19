'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SessionUploadStatus {
  session_id: string;
  session_title: string;
  start_time: string;
  speaker_role: string;
  has_upload: boolean;
  file_name: string | null;
}

interface SpeakerUploadFormProps {
  congressId: string;
  userId: string;
  sessions: SessionUploadStatus[];
  existingDisclosure?: {
    has_conflicts: boolean;
    disclosure_text: string | null;
    companies: string[];
  } | null;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
];
const ACCEPTED_EXTENSIONS = '.pdf,.pptx,.ppt';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function SpeakerUploadForm({
  congressId,
  userId,
  sessions,
  existingDisclosure,
}: SpeakerUploadFormProps) {
  const t = useTranslations('speaker');

  // File upload state
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disclosure state
  const [hasConflicts, setHasConflicts] = useState(existingDisclosure?.has_conflicts ?? false);
  const [disclosureText, setDisclosureText] = useState(existingDisclosure?.disclosure_text ?? '');
  const [companies, setCompanies] = useState(existingDisclosure?.companies?.join(', ') ?? '');
  const [avRequirements, setAvRequirements] = useState('');
  const [disclosureSaving, setDisclosureSaving] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  function processFile(file: File) {
    setUploadError(null);
    setUploadSuccess(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Nur PDF und PPTX Dateien sind erlaubt.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Datei zu gross. Maximale Groesse: 50 MB.');
      return;
    }
    if (!selectedSession) {
      setUploadError('Bitte waehlen Sie zuerst eine Session aus.');
      return;
    }

    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for demo; in production use XMLHttpRequest or fetch with ReadableStream
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', selectedSession!);
      formData.append('user_id', userId);

      const response = await fetch(`/api/congress/${congressId}/speakers/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      setUploadProgress(100);
      setUploadSuccess(t('uploadSuccess'));
    } catch {
      setUploadError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDisclosureSubmit() {
    setDisclosureSaving(true);
    try {
      await fetch(`/api/congress/${congressId}/speakers/disclosure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          has_conflicts: hasConflicts,
          disclosure_text: disclosureText || null,
          companies: companies
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
          av_requirements: avRequirements || null,
        }),
      });
    } catch {
      // Error handling
    } finally {
      setDisclosureSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Sessions list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('sessions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
                Keine Sessions zugewiesen.
              </p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.session_id}
                  type="button"
                  onClick={() => setSelectedSession(session.session_id)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-lg border text-left transition-colors',
                    selectedSession === session.session_id
                      ? 'border-accent-500 bg-accent-500/5 dark:bg-accent-500/10'
                      : 'border-ensemble-200 dark:border-ensemble-700 hover:border-ensemble-300 dark:hover:border-ensemble-600'
                  )}
                >
                  <div>
                    <p className="font-medium text-ensemble-900 dark:text-ensemble-50">
                      {session.session_title}
                    </p>
                    <p className="text-sm text-ensemble-500 dark:text-ensemble-400 mt-0.5">
                      {new Date(session.start_time).toLocaleDateString('de-CH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.has_upload ? 'success' : 'warning'}>
                      {session.has_upload ? 'Hochgeladen' : 'Ausstehend'}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* File upload dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('uploadPresentation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors',
              dragOver
                ? 'border-accent-500 bg-accent-500/5 dark:bg-accent-500/10'
                : 'border-ensemble-300 dark:border-ensemble-600 hover:border-ensemble-400 dark:hover:border-ensemble-500'
            )}
          >
            <svg className="h-12 w-12 text-ensemble-400 dark:text-ensemble-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Datei hierher ziehen oder klicken
            </p>
            <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
              PDF, PPTX (max. 50 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {uploading ? (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400 text-center">
                {uploadProgress}%
              </p>
            </div>
          ) : null}

          {uploadError ? (
            <p className="mt-3 text-sm text-error">{uploadError}</p>
          ) : null}

          {uploadSuccess ? (
            <p className="mt-3 text-sm text-success">{uploadSuccess}</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Disclosure form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('disclosures')}</CardTitle>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('disclosureRequired')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conflicts toggle */}
          <div>
            <label className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
              {t('hasConflicts')}
            </label>
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setHasConflicts(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  !hasConflicts
                    ? 'border-accent-500 bg-accent-500/10 text-accent-600 dark:text-accent-400'
                    : 'border-ensemble-200 dark:border-ensemble-700 text-ensemble-600 dark:text-ensemble-400'
                )}
              >
                {t('noConflicts')}
              </button>
              <button
                type="button"
                onClick={() => setHasConflicts(true)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  hasConflicts
                    ? 'border-warning bg-warning/10 text-warning'
                    : 'border-ensemble-200 dark:border-ensemble-700 text-ensemble-600 dark:text-ensemble-400'
                )}
              >
                {t('hasConflicts')}
              </button>
            </div>
          </div>

          {/* Disclosure details (shown when has conflicts) */}
          {hasConflicts ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="disclosure-text"
                  className="block text-sm font-medium text-ensemble-900 dark:text-ensemble-50 mb-1.5"
                >
                  {t('disclosures')}
                </label>
                <textarea
                  id="disclosure-text"
                  value={disclosureText}
                  onChange={(e) => setDisclosureText(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-ensemble-200 bg-white px-3 py-2 text-sm dark:border-ensemble-700 dark:bg-ensemble-900 dark:text-ensemble-50 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Beschreibung der Interessenkonflikte..."
                />
              </div>
              <div>
                <label
                  htmlFor="companies"
                  className="block text-sm font-medium text-ensemble-900 dark:text-ensemble-50 mb-1.5"
                >
                  Unternehmen
                </label>
                <Input
                  id="companies"
                  value={companies}
                  onChange={(e) => setCompanies(e.target.value)}
                  placeholder="Firma A, Firma B, ..."
                />
              </div>
            </div>
          ) : null}

          {/* AV Requirements */}
          <div>
            <label
              htmlFor="av-requirements"
              className="block text-sm font-medium text-ensemble-900 dark:text-ensemble-50 mb-1.5"
            >
              AV-Anforderungen
            </label>
            <textarea
              id="av-requirements"
              value={avRequirements}
              onChange={(e) => setAvRequirements(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-ensemble-200 bg-white px-3 py-2 text-sm dark:border-ensemble-700 dark:bg-ensemble-900 dark:text-ensemble-50 focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Besondere technische Anforderungen (Mikrofon, Presenter, etc.)..."
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleDisclosureSubmit}
            disabled={disclosureSaving}
          >
            {disclosureSaving ? 'Wird gespeichert...' : t('submitDisclosure')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
