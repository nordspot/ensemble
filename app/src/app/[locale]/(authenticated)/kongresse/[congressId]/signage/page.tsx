import { SignageView } from '@/components/live/signage-view';

export default async function SignagePage({
  params,
}: {
  params: Promise<{ locale: string; congressId: string }>;
}) {
  const { congressId } = await params;

  return <SignageView congressId={congressId} />;
}
