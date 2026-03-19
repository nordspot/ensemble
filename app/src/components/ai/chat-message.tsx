'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { SourceCard } from './source-card';

// ── Types ───────────────────────────────────────────────────

export interface ChatMessageSource {
  title: string;
  speaker: string;
  congress: string;
  sessionTitle: string;
  excerpt: string;
  url?: string;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatMessageSource[];
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

// ── Markdown-like rendering ─────────────────────────────────

function renderContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Handle bold (**text**), inline code (`text`), and source citations [Source: ...]
  const regex = /(\*\*(.+?)\*\*|`(.+?)`|\[Source:\s*([^\]]+)\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      nodes.push(
        <code
          key={match.index}
          className="rounded bg-ensemble-100 px-1 py-0.5 text-xs dark:bg-ensemble-700"
        >
          {match[3]}
        </code>,
      );
    } else if (match[4]) {
      nodes.push(
        <span
          key={match.index}
          className="inline-flex items-center rounded bg-accent-50 px-1.5 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-950 dark:text-accent-300"
        >
          {match[4]}
        </span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// ── Component ───────────────────────────────────────────────

export function ChatMessage({ message }: ChatMessageProps) {
  const t = useTranslations('knowledge');
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [message.content]);

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          isUser
            ? 'bg-accent-500 text-white'
            : 'bg-ensemble-100 text-ensemble-600 dark:bg-ensemble-800 dark:text-ensemble-300',
        )}
      >
        {isUser ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'group relative max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'rounded-br-md bg-accent-500 text-white'
            : 'rounded-bl-md bg-ensemble-50 text-ensemble-900 dark:bg-ensemble-800 dark:text-ensemble-50',
        )}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {renderContent(message.content)}
          {message.isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current" />
          )}
        </div>

        {/* Source cards */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-ensemble-500 dark:text-ensemble-400">
              {t('sources')} ({message.sources.length})
            </p>
            {message.sources.map((source, idx) => (
              <SourceCard key={idx} source={source} />
            ))}
          </div>
        )}

        {/* Copy button (AI messages only) */}
        {!isUser && !message.isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 right-0 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-ensemble-400 opacity-0 transition-opacity hover:text-ensemble-600 group-hover:opacity-100 dark:text-ensemble-500 dark:hover:text-ensemble-300"
            title={t('copy')}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            {copied ? t('copied') : t('copy')}
          </button>
        )}
      </div>
    </div>
  );
}
