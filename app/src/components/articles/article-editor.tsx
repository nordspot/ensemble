'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ArticleEditorProps {
  congressId: string;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
];
const MAX_SIZE_MB = 20;
const MAX_KEYWORDS = 6;

export function ArticleEditor({ congressId }: ArticleEditorProps) {
  const t = useTranslations('articles');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw || keywords.length >= MAX_KEYWORDS || keywords.includes(kw)) return;
    setKeywords((prev) => [...prev, kw]);
    setKeywordInput('');
  }

  function removeKeyword(index: number) {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }

  function validateAndSetFile(f: File) {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError(t('invalidFileType'));
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(t('fileTooLarge', { maxMb: MAX_SIZE_MB }));
      return;
    }
    setFile(f);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('summary', summary.trim());
      formData.append('keywords', JSON.stringify(keywords));
      formData.append('file', file);

      const res = await fetch(`/api/congress/${congressId}/articles`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? t('submitError'));
      }

      router.push(`../artikel`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  function getFileTypeLabel(type: string): string {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word')) return 'DOCX';
    if (type.includes('markdown')) return 'MD';
    return type.split('/').pop()?.toUpperCase() ?? '';
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="article-title"
          className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
        >
          {t('fieldTitle')} *
        </label>
        <Input
          id="article-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('fieldTitlePlaceholder')}
          required
          maxLength={300}
        />
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="article-summary"
          className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
        >
          {t('fieldSummary')}
        </label>
        <Textarea
          id="article-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={t('fieldSummaryPlaceholder')}
          rows={4}
          maxLength={2000}
        />
      </div>

      {/* Keywords */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
          {t('fieldKeywords')} ({keywords.length}/{MAX_KEYWORDS})
        </label>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {keywords.map((kw, i) => (
              <motion.div
                key={kw}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="secondary" className="gap-1 pr-1">
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(i)}
                    className="ml-1 rounded-full p-0.5 hover:bg-ensemble-300 dark:hover:bg-ensemble-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {keywords.length < MAX_KEYWORDS && (
          <div className="mt-2 flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('keywordPlaceholder')}
              className="max-w-xs text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
              {t('addKeyword')}
            </Button>
          </div>
        )}
      </div>

      {/* File upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
          {t('fieldFile')} *
        </label>
        {file ? (
          <Card className="bg-ensemble-50 dark:bg-ensemble-800">
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-8 w-8 text-ensemble-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                  {file.name}
                </p>
                <p className="text-xs text-ensemble-500">
                  {getFileTypeLabel(file.type)} &middot;{' '}
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
              isDragging
                ? 'border-ensemble-500 bg-ensemble-50 dark:bg-ensemble-800/50'
                : 'border-ensemble-300 hover:border-ensemble-400 dark:border-ensemble-600 dark:hover:border-ensemble-500',
            )}
          >
            <Upload className="mb-2 h-8 w-8 text-ensemble-400 dark:text-ensemble-500" />
            <p className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('fileDropzone')}
            </p>
            <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
              {t('fileDropzoneHint', { maxMb: MAX_SIZE_MB })}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) validateAndSetFile(f);
              }}
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={submitting || !file || !title.trim()}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('submitButton')}
        </Button>
      </div>
    </form>
  );
}
