import { getTranslations } from 'next-intl/server';

export default async function KongressProgrammPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Programm</h1>
      <p className="mt-2 text-muted-foreground">Coming soon</p>
    </div>
  );
}
