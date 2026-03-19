'use client';

import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyStateAction({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateActionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ensemble-100 dark:bg-ensemble-800">
        <Icon className="h-8 w-8 text-ensemble-400 dark:text-ensemble-500" />
      </div>
      <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-1">
        {title}
      </h3>
      <p className="text-sm text-ensemble-500 dark:text-ensemble-400 max-w-sm mb-6">
        {description}
      </p>
      <div className="flex gap-3">
        {primaryAction && (
          <Button onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
