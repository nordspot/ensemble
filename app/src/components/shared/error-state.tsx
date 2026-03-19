'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-error mb-4" />
      <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50 mb-1">
        {title}
      </h3>
      <p className="text-sm text-ensemble-500 dark:text-ensemble-400 max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Erneut versuchen
        </Button>
      )}
    </div>
  );
}
