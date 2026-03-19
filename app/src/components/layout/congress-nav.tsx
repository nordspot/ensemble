'use client';

import {
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
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface CongressNavProps {
  congressId: string;
}

interface NavTab {
  segment: string;
  label: string;
  icon: React.ElementType;
}

export function CongressNav({ congressId }: CongressNavProps) {
  const t = useTranslations('common');
  const pathname = usePathname();

  const tabs: NavTab[] = [
    { segment: 'programm', label: t('nav.schedule'), icon: CalendarDays },
    { segment: 'live', label: t('nav.live'), icon: Radio },
    { segment: 'networking', label: t('nav.networking'), icon: Users },
    { segment: 'chat', label: t('nav.chat'), icon: MessageSquare },
    { segment: 'galerie', label: t('nav.gallery'), icon: Image },
    { segment: 'poster', label: t('nav.poster'), icon: PanelLeft },
    { segment: 'artikel', label: t('nav.articles'), icon: FileText },
    { segment: 'ausstellung', label: t('nav.exhibition'), icon: Store },
    { segment: 'wissen', label: t('nav.knowledge'), icon: Brain },
    { segment: 'gamification', label: t('nav.gamification'), icon: Trophy },
  ];

  const basePath = `/kongresse/${congressId}`;

  return (
    <div className="border-b border-ensemble-100 bg-white dark:border-ensemble-800 dark:bg-ensemble-900">
      <nav className="-mb-px flex gap-1 overflow-x-auto px-4 scrollbar-none sm:px-6">
        {tabs.map((tab) => {
          const href = `${basePath}/${tab.segment}`;
          const active = pathname.startsWith(href);

          return (
            <Link
              key={tab.segment}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                active
                  ? 'border-accent-500 text-accent-500'
                  : 'border-transparent text-ensemble-500 hover:border-ensemble-300 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:border-ensemble-600 dark:hover:text-ensemble-50'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
