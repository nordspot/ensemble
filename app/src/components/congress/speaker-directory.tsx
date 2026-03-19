'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { SpeakerCard, type SpeakerCardData } from './speaker-card';
import { cn } from '@/lib/utils';

interface SpeakerDirectoryProps {
  speakers: SpeakerCardData[];
  congressId: string;
  /** If true, renders read-only cards without authenticated features */
  publicMode?: boolean;
}

export function SpeakerDirectory({ speakers, congressId, publicMode = false }: SpeakerDirectoryProps) {
  const t = useTranslations('speaker');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return speakers;
    const q = search.toLowerCase();
    return speakers.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        (s.organization_name && s.organization_name.toLowerCase().includes(q)) ||
        (s.specialty && s.specialty.toLowerCase().includes(q))
    );
  }, [speakers, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, SpeakerCardData[]>();
    for (const speaker of filtered) {
      const letter = speaker.full_name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      const group = map.get(key);
      if (group) {
        group.push(speaker);
      } else {
        map.set(key, [speaker]);
      }
    }
    return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filtered]);

  const letters = useMemo(() => Array.from(grouped.keys()), [grouped]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = document.getElementById(`speaker-group-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const basePath = publicMode
    ? `/kongress/${congressId}/speaker`
    : `/kongresse/${congressId}/speaker`;

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-ensemble-100 dark:bg-ensemble-800 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-ensemble-400 dark:text-ensemble-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <p className="text-ensemble-500 dark:text-ensemble-400">
              {search.trim()
                ? t('noResults')
                : t('noSpeakers')}
            </p>
          </div>
        ) : (
          /* Grouped speaker grid */
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([letter, group]) => (
              <section key={letter} id={`speaker-group-${letter}`}>
                <h2 className="text-lg font-bold text-ensemble-900 dark:text-ensemble-50 mb-4 sticky top-0 bg-white/80 dark:bg-ensemble-950/80 backdrop-blur-sm py-2 z-10 border-b border-ensemble-100 dark:border-ensemble-800">
                  {letter}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((speaker) => (
                    <SpeakerCard
                      key={speaker.user_id}
                      speaker={speaker}
                      congressId={congressId}
                      href={`${basePath}?id=${speaker.user_id}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Alphabet sidebar */}
      {letters.length > 1 ? (
        <nav
          className="hidden md:flex flex-col items-center gap-0.5 sticky top-24 self-start"
          aria-label="Alphabet navigation"
        >
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => scrollToLetter(letter)}
              className={cn(
                'w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center',
                'text-ensemble-500 dark:text-ensemble-400',
                'hover:bg-accent-500 hover:text-white',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-accent-500'
              )}
            >
              {letter}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
