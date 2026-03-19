'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PosterCard } from '@/components/congress/poster-card';
import { cn } from '@/lib/utils';
import type { Poster } from '@/lib/db/posters';

interface PosterPageProps {
  params: Promise<{ congressId: string; locale: string }>;
}

const CATEGORIES = [
  'all',
  'clinical',
  'research',
  'case-study',
  'technology',
  'education',
] as const;

export default function PosterPage({ params }: PosterPageProps) {
  const t = useTranslations('poster');
  const [congressId, setCongressId] = useState('');
  const [locale, setLocale] = useState('de');
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    void params.then((p) => {
      setCongressId(p.congressId);
      setLocale(p.locale);
    });
  }, [params]);

  const fetchPosters = useCallback(async () => {
    if (!congressId) return;
    setLoading(true);
    try {
      const url = new URL(`/api/congress/${congressId}/posters`, window.location.origin);
      if (category !== 'all') url.searchParams.set('category', category);
      const res = await fetch(url.toString());
      const json = (await res.json()) as { ok: boolean; data: Poster[] };
      if (json.ok) setPosters(json.data);
    } finally {
      setLoading(false);
    }
  }, [congressId, category]);

  useEffect(() => {
    void fetchPosters();
  }, [fetchPosters]);

  const filtered = search
    ? posters.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.authors.toLowerCase().includes(search.toLowerCase()),
      )
    : posters;

  async function handleVote(posterId: string) {
    await fetch(`/api/congress/${congressId}/posters`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posterId }),
    });
    setPosters((prev) =>
      prev.map((p) =>
        p.id === posterId ? { ...p, vote_count: p.vote_count + 1 } : p,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ensemble-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-lg border border-ensemble-300 bg-white py-2 pl-9 pr-4 text-sm text-ensemble-900 placeholder:text-ensemble-400 focus:border-ensemble-500 focus:outline-none focus:ring-1 focus:ring-ensemble-500 dark:border-ensemble-600 dark:bg-ensemble-800 dark:text-ensemble-50 dark:placeholder:text-ensemble-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory(cat)}
            >
              {t(`categories.${cat}`)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Poster grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-ensemble-200 dark:bg-ensemble-700"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-ensemble-500 dark:text-ensemble-400">
          <p className="text-lg">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((poster) => (
            <PosterCard
              key={poster.id}
              poster={poster}
              congressId={congressId}
              locale={locale}
              onVote={() => handleVote(poster.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
