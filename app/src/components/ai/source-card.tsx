'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// ── Types ───────────────────────────────────────────────────

interface Source {
  title: string;
  speaker: string;
  congress: string;
  sessionTitle: string;
  excerpt: string;
  url?: string;
}

interface SourceCardProps {
  source: Source;
}

// ── Component ───────────────────────────────────────────────

export function SourceCard({ source }: SourceCardProps) {
  const t = useTranslations('knowledge');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-ensemble-200 bg-white p-3 text-xs dark:border-ensemble-700 dark:bg-ensemble-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ensemble-900 dark:text-ensemble-50">
            {source.title}
          </p>
          <p className="mt-0.5 text-ensemble-500 dark:text-ensemble-400">
            {source.speaker}
            {source.congress && (
              <span className="ml-1 text-ensemble-400 dark:text-ensemble-500">
                &middot; {source.congress}
              </span>
            )}
          </p>
          {source.sessionTitle && (
            <p className="mt-0.5 text-ensemble-400 dark:text-ensemble-500">
              {source.sessionTitle}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 rounded p-1 text-ensemble-400 hover:bg-ensemble-100 hover:text-ensemble-600 dark:hover:bg-ensemble-800 dark:hover:text-ensemble-300"
          aria-label={isExpanded ? t('collapse') : t('expand')}
        >
          <svg
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              isExpanded && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </div>

      {/* Collapsible excerpt */}
      {isExpanded && source.excerpt && (
        <div className="mt-2 border-t border-ensemble-100 pt-2 dark:border-ensemble-800">
          <p className="whitespace-pre-wrap leading-relaxed text-ensemble-600 dark:text-ensemble-300">
            {source.excerpt}
          </p>
        </div>
      )}

      {/* Link to original content */}
      {source.url && (
        <a
          href={source.url}
          className="mt-2 inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          {t('goToContext')}
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      )}
    </div>
  );
}
