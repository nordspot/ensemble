'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────

interface ConversationPreview {
  id: string;
  name: string;
  type: 'channel' | 'direct' | 'session';
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

type TabId = 'channels' | 'direct' | 'sessions';

interface ConversationListProps {
  congressId: string;
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

// ── Component ────────────────────────────────────────────────

export function ConversationList({
  congressId,
  activeId,
  onSelect,
}: ConversationListProps) {
  const t = useTranslations('chat');

  const [tab, setTab] = useState<TabId>('channels');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversations from API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/chat?congressId=${encodeURIComponent(congressId)}&type=${tab}`,
        );
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean; data: ConversationPreview[] };
        if (!cancelled && json.ok) {
          setConversations(json.data);
        }
      } catch {
        // Silently fail — will show empty list
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [congressId, tab]);

  const filtered = search
    ? conversations.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'channels', label: t('channels') },
    { id: 'direct', label: t('directMessages') },
    { id: 'sessions', label: t('sessionChats') },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-ensemble-200 dark:border-ensemble-700">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'flex-1 py-2.5 text-center text-xs font-medium transition-colors',
              tab === item.id
                ? 'border-b-2 border-accent-500 text-accent-600 dark:text-accent-400'
                : 'text-ensemble-500 hover:text-ensemble-700 dark:text-ensemble-400 dark:hover:text-ensemble-200',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchConversations')}
          className="h-8 text-sm"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-ensemble-100 dark:bg-ensemble-800"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-ensemble-400 dark:text-ensemble-500">
            {t('noMessages')}
          </div>
        ) : (
          <div className="space-y-0.5 p-1">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  activeId === conv.id
                    ? 'bg-accent-50 dark:bg-accent-950'
                    : 'hover:bg-ensemble-50 dark:hover:bg-ensemble-800',
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                    conv.type === 'channel'
                      ? 'bg-ensemble-100 text-ensemble-600 dark:bg-ensemble-800 dark:text-ensemble-300'
                      : conv.type === 'direct'
                        ? 'bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-300'
                        : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
                  )}
                >
                  {conv.type === 'channel' ? '#' : conv.type === 'session' ? 'S' : conv.name[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                      {conv.name}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="truncate text-xs text-ensemble-400 dark:text-ensemble-500">
                      {conv.lastMessage}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New conversation button */}
      <div className="border-t border-ensemble-200 p-3 dark:border-ensemble-700">
        <Button variant="outline" size="sm" className="w-full text-sm">
          {t('newConversation')}
        </Button>
      </div>
    </div>
  );
}
