'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BoothDetailProps {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  boothNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  products: string[];
  boothMapX: number | null;
  boothMapY: number | null;
  onScanBadge?: () => void;
}

export function BoothDetail({
  name,
  description,
  logoUrl,
  website,
  boothNumber,
  contactEmail,
  contactPhone,
  products,
  boothMapX,
  boothMapY,
  onScanBadge,
}: BoothDetailProps) {
  const t = useTranslations('exhibition');
  const [demoRequested, setDemoRequested] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Logo */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-ensemble-50 dark:bg-ensemble-800">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-16 w-16 rounded-lg object-contain"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ensemble-400"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
                {name}
              </h1>
              {boothNumber && (
                <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
                  {t('booth')} {boothNumber}
                </p>
              )}
              {description && (
                <p className="mt-3 text-sm text-ensemble-600 dark:text-ensemble-300">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => setDemoRequested(true)}
              disabled={demoRequested}
            >
              {demoRequested ? t('demoRequested') : t('bookDemo')}
            </Button>
            <Button variant="outline" onClick={onScanBadge}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              {t('scanBadge')}
            </Button>
            {website && (
              <Button variant="outline" asChild>
                <a href={website} target="_blank" rel="noopener noreferrer">
                  {t('visitWebsite')}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('products')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <Badge key={product} variant="secondary">
                  {product}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      {(contactEmail || contactPhone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('contact')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contactEmail && (
              <div className="flex items-center gap-2 text-sm text-ensemble-600 dark:text-ensemble-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <a href={`mailto:${contactEmail}`} className="hover:text-accent-500">
                  {contactEmail}
                </a>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-center gap-2 text-sm text-ensemble-600 dark:text-ensemble-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href={`tel:${contactPhone}`} className="hover:text-accent-500">
                  {contactPhone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map location */}
      {boothMapX !== null && boothMapY !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('mapLocation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg bg-ensemble-50 dark:bg-ensemble-800">
              <div className="text-center text-sm text-ensemble-500 dark:text-ensemble-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <p>{t('booth')} {boothNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
