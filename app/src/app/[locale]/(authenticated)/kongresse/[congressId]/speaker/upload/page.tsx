import { getTranslations } from 'next-intl/server';
import { SpeakerUploadForm } from '@/components/congress/speaker-upload-form';

export default async function SpeakerUploadPage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { congressId } = await params;
  const t = await getTranslations('speaker');

  // In production: get userId from session/auth, fetch sessions + disclosure from D1
  const userId = ''; // will be replaced by auth context
  const sessions: {
    session_id: string;
    session_title: string;
    start_time: string;
    speaker_role: string;
    has_upload: boolean;
    file_name: string | null;
  }[] = [];
  const existingDisclosure = null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('uploadPresentation')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('uploadDeadline')}
        </p>
      </div>

      <SpeakerUploadForm
        congressId={congressId}
        userId={userId}
        sessions={sessions}
        existingDisclosure={existingDisclosure}
      />
    </div>
  );
}
