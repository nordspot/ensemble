'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useNotificationStore } from '@/stores/notification-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/kongresse': 'Kongresse',
  '/profil': 'Profil',
  '/einstellungen': 'Einstellungen',
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check prefix match
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }

  return '';
}

export function AppHeader() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();

  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ensemble-100 bg-white px-4 dark:border-ensemble-800 dark:bg-ensemble-900 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {title && (
          <h1 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
            {title}
          </h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('nav.search')}
          className="text-ensemble-500 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:text-ensemble-50"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('nav.notifications')}
          className={cn(
            'relative text-ensemble-500 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:text-ensemble-50'
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
        <button
          className="ml-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ensemble-200 transition hover:ring-2 hover:ring-accent-500 hover:ring-offset-2 dark:bg-ensemble-700 dark:hover:ring-offset-ensemble-900"
          aria-label="Benutzer-Menu"
        >
          <span className="text-xs font-medium text-ensemble-600 dark:text-ensemble-300">
            MK
          </span>
        </button>
      </div>
    </header>
  );
}
