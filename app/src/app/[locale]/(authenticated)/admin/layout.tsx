import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth/get-server-auth';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const auth = await getServerAuth();

  if (!auth) {
    redirect(`/${locale}/anmelden`);
  }

  const allowedRoles = ['organizer', 'admin', 'superadmin'];
  if (!allowedRoles.includes(auth.role)) {
    redirect(`/${locale}/dashboard`);
  }

  return <>{children}</>;
}
