import { getTranslations } from 'next-intl/server';
import { PhotoGrid } from '@/components/gallery/photo-grid';
import { Badge } from '@/components/ui/badge';

interface GaleriePageProps {
  params: Promise<{ congressId: string; locale: string }>;
  searchParams: Promise<{ day?: string; featured?: string }>;
}

export default async function GaleriePage({
  params,
  searchParams,
}: GaleriePageProps) {
  const { congressId } = await params;
  const query = await searchParams;
  const t = await getTranslations('gallery');

  // In production, these would be fetched server-side via D1 binding.
  // For now we pass empty arrays; the client component fetches via API.
  const initialPhotos: never[] = [];
  const initialTotal = 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('subtitle')}
          </p>
        </div>
        <a
          href={`galerie/meine`}
          className="inline-flex items-center gap-2 rounded-lg bg-ensemble-600 px-4 py-2 text-sm font-medium text-white hover:bg-ensemble-700 dark:bg-ensemble-500 dark:hover:bg-ensemble-400"
        >
          {t('myPhotos')}
        </a>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!query.featured ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          {t('filterAll')}
        </Badge>
        <Badge
          variant={query.featured === '1' ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          {t('filterFeatured')}
        </Badge>
      </div>

      <PhotoGrid
        congressId={congressId}
        initialPhotos={initialPhotos}
        initialTotal={initialTotal}
        showUserInfo
      />
    </div>
  );
}
