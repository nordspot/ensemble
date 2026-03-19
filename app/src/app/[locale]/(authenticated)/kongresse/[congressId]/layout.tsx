import { CongressNav } from '@/components/layout/congress-nav';

interface CongressLayoutProps {
  children: React.ReactNode;
  params: Promise<{ congressId: string }>;
}

export default async function CongressLayout({
  children,
  params,
}: CongressLayoutProps) {
  const { congressId } = await params;

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <CongressNav congressId={congressId} />
      <div className="p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
