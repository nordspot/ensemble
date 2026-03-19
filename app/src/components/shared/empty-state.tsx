'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-ensemble-400 dark:text-ensemble-500 mb-4" />
      <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-1">
        {title}
      </h3>
      <p className="text-sm text-ensemble-500 dark:text-ensemble-400 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
