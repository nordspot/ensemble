'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FilePreview {
  file: File;
  preview: string;
  caption: string;
  isPublic: boolean;
  uploading: boolean;
  progress: number;
  error: string | null;
  done: boolean;
}

interface PhotoUploadProps {
  congressId: string;
  onUploadComplete?: () => void;
}

const MAX_FILES = 10;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export function PhotoUpload({ congressId, onUploadComplete }: PhotoUploadProps) {
  const t = useTranslations('gallery');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles: FilePreview[] = [];
      const remaining = MAX_FILES - files.length;
      const toAdd = Array.from(incoming).slice(0, remaining);

      for (const file of toAdd) {
        if (!ACCEPTED_TYPES.includes(file.type)) continue;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) continue;

        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          caption: '',
          isPublic: false,
          uploading: false,
          progress: 0,
          error: null,
          done: false,
        });
      }

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length],
  );

  function removeFile(index: number) {
    setFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  }

  function updateFile(index: number, update: Partial<FilePreview>) {
    setFiles((prev) => {
      const copy = [...prev];
      const existing = copy[index];
      if (existing) {
        copy[index] = { ...existing, ...update };
      }
      return copy;
    });
  }

  async function uploadAll() {
    for (let i = 0; i < files.length; i++) {
      const fp = files[i];
      if (!fp || fp.done || fp.uploading) continue;

      updateFile(i, { uploading: true, progress: 5 });

      try {
        // Step 1: Get upload intent (r2Key) from server
        const intentRes = await fetch(`/api/congress/${congressId}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fp.file.name,
            contentType: fp.file.type,
            type: 'photos',
            fileSize: fp.file.size,
          }),
        });

        if (!intentRes.ok) {
          const err = (await intentRes.json()) as { error?: { message?: string } };
          throw new Error(err.error?.message ?? 'Upload-Intent fehlgeschlagen');
        }

        const { data: intentData } = (await intentRes.json()) as {
          data: { r2Key: string };
        };

        updateFile(i, { progress: 20 });

        // Step 2: Upload file to R2 via PUT
        const uploadRes = await fetch(`/api/congress/${congressId}/upload`, {
          method: 'PUT',
          headers: {
            'Content-Type': fp.file.type,
            'x-r2-key': intentData.r2Key,
          },
          body: fp.file,
        });

        if (!uploadRes.ok) {
          const err = (await uploadRes.json()) as { error?: { message?: string } };
          throw new Error(err.error?.message ?? 'Datei-Upload fehlgeschlagen');
        }

        updateFile(i, { progress: 70 });

        // Step 3: Create photo record with the r2Key
        const photoRes = await fetch(`/api/congress/${congressId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            r2_key: intentData.r2Key,
            caption: fp.caption || undefined,
            is_public: fp.isPublic,
          }),
        });

        if (!photoRes.ok) {
          const err = (await photoRes.json()) as { error?: { message?: string } };
          throw new Error(err.error?.message ?? 'Foto-Eintrag fehlgeschlagen');
        }

        updateFile(i, { progress: 100, done: true, uploading: false });
      } catch (err) {
        updateFile(i, {
          error: err instanceof Error ? err.message : 'Unbekannter Fehler',
          uploading: false,
        });
      }
    }

    onUploadComplete?.();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  const allDone = files.length > 0 && files.every((f) => f.done);
  const anyUploading = files.some((f) => f.uploading);
  const canSubmit = files.length > 0 && !anyUploading && !allDone;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-ensemble-500 bg-ensemble-50 dark:bg-ensemble-800/50'
            : 'border-ensemble-300 hover:border-ensemble-400 dark:border-ensemble-600 dark:hover:border-ensemble-500',
        )}
      >
        <Upload className="mb-2 h-8 w-8 text-ensemble-400 dark:text-ensemble-500" />
        <p className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
          {t('dropzone')}
        </p>
        <p className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
          {t('dropzoneHint', { max: MAX_FILES, sizeMb: MAX_SIZE_MB })}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* File previews */}
      <AnimatePresence>
        {files.map((fp, index) => (
          <motion.div
            key={fp.preview}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-lg bg-ensemble-50 p-3 dark:bg-ensemble-800"
          >
            <img
              src={fp.preview}
              alt=""
              className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={fp.caption}
                  onChange={(e) => updateFile(index, { caption: e.target.value })}
                  placeholder={t('captionPlaceholder')}
                  disabled={fp.uploading || fp.done}
                  className="text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFile(index, { isPublic: !fp.isPublic })}
                  disabled={fp.uploading || fp.done}
                  title={fp.isPublic ? t('public') : t('private')}
                >
                  {fp.isPublic ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={fp.uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {(fp.uploading || fp.done) && (
                <Progress value={fp.progress} className="h-1.5" />
              )}
              {fp.error && (
                <p className="text-xs text-red-500">{fp.error}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Submit */}
      {files.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              files.forEach((f) => URL.revokeObjectURL(f.preview));
              setFiles([]);
            }}
            disabled={anyUploading}
          >
            {t('clearAll')}
          </Button>
          <Button onClick={uploadAll} disabled={!canSubmit}>
            {anyUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {allDone
              ? t('uploadComplete')
              : t('uploadPhotos', { count: files.filter((f) => !f.done).length })}
          </Button>
        </div>
      )}
    </div>
  );
}
