'use client';

import { cn } from '@/lib/utils';
import { AvatarRoot, AvatarFallback } from '@/components/ui/avatar';

// ── Props ─────────────────────────────────────────────────────

interface MessageBubbleProps {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  replyTo?: string;
  isOwn: boolean;
  onReply?: () => void;
  onDelete?: () => void;
}

// ── Basic markdown-like formatting ───────────────────────────

function formatContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on bold (**text**) and code (`text`) markers
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      nodes.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // Inline code
      nodes.push(
        <code
          key={match.index}
          className="rounded bg-ensemble-100 px-1 py-0.5 text-xs dark:bg-ensemble-700"
        >
          {match[3]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// ── Helpers ───────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ── Component ────────────────────────────────────────────────

export function MessageBubble({
  id,
  userId,
  userName,
  content,
  timestamp,
  replyTo,
  isOwn,
  onReply,
  onDelete,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'group flex items-end gap-2 py-1',
        isOwn ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <AvatarRoot className="h-7 w-7 shrink-0">
          <AvatarFallback className="text-[10px]">
            {initials(userName)}
          </AvatarFallback>
        </AvatarRoot>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'relative max-w-[70%] rounded-2xl px-3.5 py-2',
          isOwn
            ? 'rounded-br-md bg-accent-500 text-white'
            : 'rounded-bl-md bg-ensemble-100 text-ensemble-900 dark:bg-ensemble-800 dark:text-ensemble-50',
        )}
      >
        {/* Sender name (others only) */}
        {!isOwn && (
          <p className="mb-0.5 text-[11px] font-semibold text-accent-600 dark:text-accent-400">
            {userName}
          </p>
        )}

        {/* Reply indicator */}
        {replyTo && (
          <div
            className={cn(
              'mb-1.5 rounded border-l-2 px-2 py-1 text-xs',
              isOwn
                ? 'border-white/40 bg-white/10 text-white/80'
                : 'border-accent-300 bg-ensemble-50 text-ensemble-500 dark:border-accent-700 dark:bg-ensemble-700 dark:text-ensemble-400',
            )}
          >
            <p className="line-clamp-2">{replyTo}</p>
          </div>
        )}

        {/* Content */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {formatContent(content)}
        </p>

        {/* Time */}
        <p
          className={cn(
            'mt-0.5 text-right text-[10px]',
            isOwn
              ? 'text-white/60'
              : 'text-ensemble-400 dark:text-ensemble-500',
          )}
        >
          {formatTime(timestamp)}
        </p>

        {/* Hover actions */}
        <div
          className={cn(
            'pointer-events-none absolute top-0 flex gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100',
            isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1',
          )}
        >
          {onReply && (
            <button
              onClick={onReply}
              className="rounded p-1 text-ensemble-400 hover:bg-ensemble-100 hover:text-ensemble-600 dark:hover:bg-ensemble-700 dark:hover:text-ensemble-300"
              title="Antworten"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded p-1 text-ensemble-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
              title="Löschen"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
