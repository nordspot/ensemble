'use client';

import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  title: string;
  content: string;
  learnMoreUrl?: string;
  className?: string;
}

export function HelpTooltip({
  title,
  content,
  learnMoreUrl,
  className,
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              'inline-flex h-5 w-5 items-center justify-center rounded-full',
              'border border-ensemble-300 text-ensemble-400',
              'text-xs font-medium leading-none',
              'hover:border-accent-400 hover:text-accent-500',
              'focus:outline-none focus:ring-2 focus:ring-accent-400/40',
              'transition-colors',
              'dark:border-ensemble-600 dark:text-ensemble-500',
              'dark:hover:border-accent-500 dark:hover:text-accent-400',
              className,
            )}
            aria-label={`Hilfe: ${title}`}
          >
            ?
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs space-y-1.5 p-3"
        >
          <p className="text-xs font-semibold">{title}</p>
          <p className="text-xs font-normal leading-relaxed opacity-90">
            {content}
          </p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium text-accent-400 hover:underline"
            >
              Mehr erfahren
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
