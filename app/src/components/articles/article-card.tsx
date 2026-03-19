'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Eye, Download, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Article } from '@/lib/db/articles';

interface ArticleCardProps {
  article: Article;
  congressId: string;
  locale: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArticleCard({ article, congressId, locale }: ArticleCardProps) {
  const t = useTranslations('articles');
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-lg',
          'bg-white dark:bg-ensemble-800',
        )}
        onClick={() =>
          router.push(
            `/${locale}/kongresse/${congressId}/artikel/${article.id}`,
          )
        }
      >
        <CardContent className="p-5">
          {/* File type icon + title */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-ensemble-100 dark:bg-ensemble-700">
              <FileText className="h-5 w-5 text-ensemble-600 dark:text-ensemble-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-semibold text-ensemble-900 dark:text-ensemble-50">
                {article.title}
              </h3>
              {article.summary && (
                <p className="mt-1 line-clamp-2 text-sm text-ensemble-600 dark:text-ensemble-400">
                  {article.summary}
                </p>
              )}
            </div>
          </div>

          {/* Keywords */}
          {article.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-4 text-xs text-ensemble-500 dark:text-ensemble-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {article.download_count}
            </span>
            <span className="ml-auto uppercase text-ensemble-400">
              {article.file_type.split('/').pop()} ({formatFileSize(article.file_size)})
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
