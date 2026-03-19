import { getTranslations } from 'next-intl/server';
import { ExhibitorCard } from '@/components/exhibition/exhibitor-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ExhibitionPageProps {
  params: Promise<{ locale: string; congressId: string }>;
}

export default async function ExhibitionPage({ params }: ExhibitionPageProps) {
  const { locale, congressId } = await params;
  const t = await getTranslations('exhibition');

  // Data will be fetched server-side via DB once connected
  const exhibitors: Array<{
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    booth_number: string | null;
    products: string[];
  }> = [];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('subtitle')}
          </p>
        </div>
        <Button variant="outline" className="self-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          {t('mapView')}
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Exhibitor grid */}
      {exhibitors.length === 0 ? (
        <div className="rounded-xl border border-ensemble-100 bg-white p-12 text-center dark:border-ensemble-800 dark:bg-ensemble-900">
          <p className="text-ensemble-500 dark:text-ensemble-400">
            {t('empty')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exhibitors.map((exhibitor) => (
            <ExhibitorCard
              key={exhibitor.id}
              id={exhibitor.id}
              name={exhibitor.name}
              description={exhibitor.description}
              logoUrl={exhibitor.logo_url}
              boothNumber={exhibitor.booth_number}
              products={exhibitor.products}
              congressId={congressId}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
