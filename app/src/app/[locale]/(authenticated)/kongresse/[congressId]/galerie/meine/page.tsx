import { getTranslations } from 'next-intl/server';
import { MyPhotosView } from './my-photos-view';

interface MeinePhotosPageProps {
  params: Promise<{ congressId: string }>;
}

export default async function MeinePhotosPage({ params }: MeinePhotosPageProps) {
  const { congressId } = await params;
  const t = await getTranslations('gallery');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('myPhotosTitle')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('myPhotosSubtitle')}
          </p>
        </div>
        <a
          href="../galerie"
          className="text-sm text-ensemble-600 hover:underline dark:text-ensemble-400"
        >
          {t('backToGallery')}
        </a>
      </div>

      <MyPhotosView congressId={congressId} />
    </div>
  );
}
