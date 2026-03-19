'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  User,
  CalendarDays,
  Radio,
  Users,
  MessageSquare,
  Image,
  PanelLeft,
  FileText,
  Store,
  Brain,
  Trophy,
  Settings,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function AppSidebar() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useUIStore();

  // Extract congressId from pathname if we're inside a congress
  const congressMatch = pathname.match(/^\/kongresse\/([^/]+)/);
  const congressId = congressMatch?.[1];

  const mainNav: NavItem[] = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/kongresse', label: t('nav.congresses'), icon: Building2 },
    { href: '/profil', label: t('nav.profile'), icon: User },
  ];

  const congressNav: NavItem[] = congressId
    ? [
        { href: `/kongresse/${congressId}/programm`, label: t('nav.schedule'), icon: CalendarDays },
        { href: `/kongresse/${congressId}/live`, label: t('nav.live'), icon: Radio },
        { href: `/kongresse/${congressId}/networking`, label: t('nav.networking'), icon: Users },
        { href: `/kongresse/${congressId}/chat`, label: t('nav.chat'), icon: MessageSquare },
        { href: `/kongresse/${congressId}/galerie`, label: t('nav.gallery'), icon: Image },
        { href: `/kongresse/${congressId}/poster`, label: t('nav.poster'), icon: PanelLeft },
        { href: `/kongresse/${congressId}/artikel`, label: t('nav.articles'), icon: FileText },
        { href: `/kongresse/${congressId}/ausstellung`, label: t('nav.exhibition'), icon: Store },
        { href: `/kongresse/${congressId}/wissen`, label: t('nav.knowledge'), icon: Brain },
        { href: `/kongresse/${congressId}/gamification`, label: t('nav.gamification'), icon: Trophy },
      ]
    : [];

  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') return pathname === '/dashboard';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) return;
      setSidebarOpen(false);
    };
    // Close on pathname change for mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-ensemble-100 px-5 dark:border-ensemble-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-ensemble-900 dark:text-ensemble-50">
            Ensemble
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-ensemble-400 transition hover:bg-ensemble-100 hover:text-ensemble-600 dark:hover:bg-ensemble-800 dark:hover:text-ensemble-300 lg:hidden"
          aria-label="Sidebar schließen"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-ensemble-100 font-medium text-accent-500 dark:bg-ensemble-800'
                  : 'text-ensemble-600 hover:bg-ensemble-50 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:bg-ensemble-800/50 dark:hover:text-ensemble-50'
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Congress Navigation */}
        {congressNav.length > 0 && (
          <>
            <div className="my-4 border-t border-ensemble-100 dark:border-ensemble-800" />
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-ensemble-400 dark:text-ensemble-500">
              Fachkongress
            </p>
            <div className="space-y-1">
              {congressNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-ensemble-100 font-medium text-accent-500 dark:bg-ensemble-800'
                      : 'text-ensemble-600 hover:bg-ensemble-50 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:bg-ensemble-800/50 dark:hover:text-ensemble-50'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-ensemble-100 px-3 py-4 dark:border-ensemble-800">
        <div className="space-y-1">
          <Link
            href="/einstellungen"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname.startsWith('/einstellungen')
                ? 'bg-ensemble-100 font-medium text-accent-500 dark:bg-ensemble-800'
                : 'text-ensemble-600 hover:bg-ensemble-50 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:bg-ensemble-800/50 dark:hover:text-ensemble-50'
            )}
          >
            <Settings className="h-4.5 w-4.5 shrink-0" />
            {t('nav.settings')}
          </Link>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ensemble-600 transition-colors hover:bg-ensemble-50 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:bg-ensemble-800/50 dark:hover:text-ensemble-50"
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <Moon className="h-4.5 w-4.5 shrink-0" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ensemble-600 transition-colors hover:bg-ensemble-50 hover:text-error dark:text-ensemble-400 dark:hover:bg-ensemble-800/50 dark:hover:text-error"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] shrink-0 border-r border-ensemble-100 bg-white dark:border-ensemble-800 dark:bg-ensemble-900 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-ensemble-900/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-ensemble-100 bg-white dark:border-ensemble-800 dark:bg-ensemble-900 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
