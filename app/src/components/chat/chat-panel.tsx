'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRealtime } from '@/hooks/use-realtime';
import { chatChannel } from '@/lib/realtime/channels';
import { useChatStore } from '@/stores/chat-store';
import { ConversationList } from './conversation-list';
import { MessageBubble } from './message-bubble';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Wire types matching the ChatRoom DO ──────────────────────

interface ServerMessage {
  type: 'message';
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  replyTo?: string;
}

interface ServerDeleted {
  type: 'deleted';
  messageId: string;
}

interface ServerTyping {
  type: 'typing';
  userId: string;
  userName: string;
}

interface ServerHistory {
  type: 'history';
  messages: ServerMessage[];
}

type ServerEvent = ServerMessage | ServerDeleted | ServerTyping | ServerHistory;

// ── Local chat message type ──────────────────────────────────

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  replyTo?: string;
}

// ── Component ────────────────────────────────────────────────

interface ChatPanelProps {
  congressId: string;
}

export function ChatPanel({ congressId }: ChatPanelProps) {
  const t = useTranslations('chat');
  const { activeConversationId, setActiveConversation } = useChatStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Current user stub (will be replaced with real auth)
  const currentUserId = 'current-user';

  const doId = activeConversationId
    ? chatChannel(congressId, activeConversationId)
    : '';

  const handleServerEvent = useCallback((data: unknown) => {
    const event = data as ServerEvent;

    switch (event.type) {
      case 'history':
        setMessages(
          event.messages.map((m) => ({
            id: m.id,
            userId: m.userId,
            userName: m.userName,
            content: m.content,
            timestamp: m.timestamp,
            replyTo: m.replyTo,
          })),
        );
        break;

      case 'message':
        setMessages((prev) => [
          ...prev,
          {
            id: event.id,
            userId: event.userId,
            userName: event.userName,
            content: event.content,
            timestamp: event.timestamp,
            replyTo: event.replyTo,
          },
        ]);
        break;

      case 'deleted':
        setMessages((prev) => prev.filter((m) => m.id !== event.messageId));
        break;

      case 'typing': {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.set(event.userId, event.userName);
          return next;
        });
        // Clear typing indicator after 3 s
        const existing = typingTimers.current.get(event.userId);
        if (existing) clearTimeout(existing);
        typingTimers.current.set(
          event.userId,
          setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.delete(event.userId);
              return next;
            });
          }, 3000),
        );
        break;
      }
    }
  }, []);

  const { send, isConnected } = useRealtime(
    activeConversationId ? 'ChatRoom' : '',
    doId,
    { onMessage: handleServerEvent },
  );

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear messages when conversation changes
  useEffect(() => {
    setMessages([]);
    setReplyTo(null);
    setDraft('');
  }, [activeConversationId]);

  // Typing indicator debounce
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInputChange(value: string) {
    setDraft(value);
    if (!typingDebounceRef.current) {
      send({ type: 'typing' });
    }
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      typingDebounceRef.current = null;
    }, 2000);
  }

  function handleSend() {
    const content = draft.trim();
    if (!content) return;

    send({
      type: 'send',
      content,
      ...(replyTo ? { replyTo: replyTo.id } : {}),
    });

    setDraft('');
    setReplyTo(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleDelete(messageId: string) {
    send({ type: 'delete', messageId });
  }

  const typingNames = Array.from(typingUsers.values());

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-ensemble-200 bg-white dark:border-ensemble-700 dark:bg-ensemble-900">
      {/* Left sidebar: conversation list */}
      <div className="w-80 shrink-0 border-r border-ensemble-200 dark:border-ensemble-700">
        <ConversationList
          congressId={congressId}
          activeId={activeConversationId}
          onSelect={setActiveConversation}
        />
      </div>

      {/* Right: message area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-ensemble-200 px-4 py-3 dark:border-ensemble-700">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isConnected
                    ? 'bg-green-500'
                    : 'bg-ensemble-300 dark:bg-ensemble-600',
                )}
              />
              <span className="text-sm text-ensemble-500 dark:text-ensemble-400">
                {isConnected ? 'Verbunden' : 'Verbindung wird hergestellt...'}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-ensemble-400 dark:text-ensemble-500">
                    {t('noMessages')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      id={msg.id}
                      userId={msg.userId}
                      userName={msg.userName}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      replyTo={
                        msg.replyTo
                          ? messages.find((m) => m.id === msg.replyTo)?.content
                          : undefined
                      }
                      isOwn={msg.userId === currentUserId}
                      onReply={() => setReplyTo(msg)}
                      onDelete={
                        msg.userId === currentUserId
                          ? () => handleDelete(msg.id)
                          : undefined
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Typing indicator */}
            {typingNames.length > 0 && (
              <div className="px-4 py-1 text-xs text-ensemble-400 dark:text-ensemble-500">
                {typingNames.length === 1
                  ? `${typingNames[0]} ${t('typing')}...`
                  : `${typingNames.join(', ')} ${t('typing')}...`}
              </div>
            )}

            {/* Reply indicator */}
            {replyTo && (
              <div className="flex items-center gap-2 border-t border-ensemble-200 bg-ensemble-50 px-4 py-2 dark:border-ensemble-700 dark:bg-ensemble-800">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ensemble-500 dark:text-ensemble-400">
                    Antwort an {replyTo.userName}
                  </p>
                  <p className="truncate text-xs text-ensemble-400 dark:text-ensemble-500">
                    {replyTo.content}
                  </p>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-ensemble-400 hover:text-ensemble-600 dark:text-ensemble-500 dark:hover:text-ensemble-300"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Compose */}
            <div className="flex items-center gap-2 border-t border-ensemble-200 px-4 py-3 dark:border-ensemble-700">
              <Input
                value={draft}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('typeMessage')}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!draft.trim()}>
                {t('send')}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-ensemble-400 dark:text-ensemble-500">
              {t('selectConversation')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
