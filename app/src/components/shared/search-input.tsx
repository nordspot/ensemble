'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Suchen...', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ensemble-400 dark:text-ensemble-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-lg border border-ensemble-200 bg-white pl-9 pr-9 py-2 text-sm ring-offset-white placeholder:text-ensemble-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ensemble-700 dark:bg-ensemble-900 dark:ring-offset-ensemble-950 dark:placeholder:text-ensemble-500 dark:text-ensemble-50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ensemble-400 hover:text-ensemble-600 dark:text-ensemble-500 dark:hover:text-ensemble-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
