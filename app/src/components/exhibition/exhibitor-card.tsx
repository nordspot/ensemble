'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExhibitorCardProps {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  boothNumber: string | null;
  products: string[];
  congressId: string;
  locale: string;
}

export function ExhibitorCard({
  id,
  name,
  description,
  logoUrl,
  boothNumber,
  products,
  congressId,
  locale,
}: ExhibitorCardProps) {
  const t = useTranslations('exhibition');

  return (
    <Link href={`/${locale}/kongresse/${congressId}/ausstellung/${id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          {/* Logo + name */}
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ensemble-50 dark:bg-ensemble-800">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-10 w-10 rounded object-contain"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ensemble-400 dark:text-ensemble-500"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-ensemble-900 dark:text-ensemble-50">
                {name}
              </h3>
              {boothNumber && (
                <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                  {t('booth')} {boothNumber}
                </p>
              )}
            </div>
          </div>

          {/* Description preview */}
          {description && (
            <p className="mt-3 line-clamp-2 text-sm text-ensemble-600 dark:text-ensemble-300">
              {description}
            </p>
          )}

          {/* Product tags */}
          {products.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {products.slice(0, 3).map((product) => (
                <Badge key={product} variant="secondary" className="text-xs">
                  {product}
                </Badge>
              ))}
              {products.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{products.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
