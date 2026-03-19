'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage, type ChatMessageData } from './chat-message';
import { Button } from '@/components/ui/button';

// ── Types ───────────────────────────────────────────────────

interface SourceRef {
  title: string;
  speaker: string;
  congress: string;
  sessionTitle: string;
  excerpt: string;
  url?: string;
}

interface KnowledgeChatProps {
  congressId: string;
}

// ── Component ───────────────────────────────────────────────

export function KnowledgeChat({ congressId }: KnowledgeChatProps) {
  const t = useTranslations('knowledge');
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const question = input.trim();
      if (!question || isLoading) return;

      // Add user message
      const userMessage: ChatMessageData = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      // Prepare AI placeholder
      const aiMessageId = crypto.randomUUID();
      const aiMessage: ChatMessageData = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        sources: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMessage]);

      try {
        const response = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, congressId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';
        let sources: SourceRef[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data) as {
                  type: 'text' | 'sources';
                  content?: string;
                  sources?: SourceRef[];
                };

                if (parsed.type === 'text' && parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId
                        ? { ...m, content: fullContent }
                        : m,
                    ),
                  );
                } else if (parsed.type === 'sources' && parsed.sources) {
                  sources = parsed.sources;
                }
              } catch {
                // Non-JSON line, treat as raw text
                fullContent += data;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: fullContent }
                      : m,
                  ),
                );
              }
            }
          }
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: fullContent, sources, isStreaming: false }
              : m,
          ),
        );
      } catch (err) {
        console.error('[KnowledgeChat] Error:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? {
                  ...m,
                  content: t('errorResponse'),
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, congressId, t],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleNewQuestion = useCallback(() => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Message area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 dark:bg-accent-950">
                <svg
                  className="h-8 w-8 text-accent-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
                {t('title')}
              </h3>
              <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
                {t('subtitle')}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-ensemble-100 bg-white p-4 dark:border-ensemble-800 dark:bg-ensemble-900">
        {messages.length > 0 && (
          <div className="mb-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewQuestion}
            >
              {t('newQuestion')}
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-ensemble-200 bg-ensemble-50 px-4 py-3 text-sm text-ensemble-900 placeholder:text-ensemble-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-ensemble-700 dark:bg-ensemble-800 dark:text-ensemble-50 dark:placeholder:text-ensemble-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            aria-label={t('send')}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
