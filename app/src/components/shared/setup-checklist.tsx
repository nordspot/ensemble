'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  FileText,
  Mic,
  Users,
  DoorOpen,
  Palette,
  CalendarCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SetupChecklistProps {
  congressId: string;
  locale: string;
  checks: {
    hasBasicInfo: boolean;
    hasSessions: boolean;
    hasSpeakers: boolean;
    registrationOpen: boolean;
    hasRooms: boolean;
    hasLogo: boolean;
  };
}

interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  icon: React.ElementType;
  critical: boolean;
}

export function SetupChecklist({
  congressId,
  locale,
  checks,
}: SetupChecklistProps) {
  const t = useTranslations('setupChecklist');

  const items: ChecklistItem[] = useMemo(
    () => [
      {
        key: 'basicInfo',
        label: t('basicInfo'),
        done: checks.hasBasicInfo,
        href: `/${locale}/admin/kongresse/${congressId}/einstellungen`,
        icon: FileText,
        critical: true,
      },
      {
        key: 'sessions',
        label: t('sessions'),
        done: checks.hasSessions,
        href: `/${locale}/admin/kongresse/${congressId}/programm`,
        icon: CalendarCheck,
        critical: true,
      },
      {
        key: 'speakers',
        label: t('speakers'),
        done: checks.hasSpeakers,
        href: `/${locale}/admin/kongresse/${congressId}/referenten`,
        icon: Mic,
        critical: true,
      },
      {
        key: 'registration',
        label: t('registration'),
        done: checks.registrationOpen,
        href: `/${locale}/admin/kongresse/${congressId}/einstellungen`,
        icon: Users,
        critical: true,
      },
      {
        key: 'rooms',
        label: t('rooms'),
        done: checks.hasRooms,
        href: `/${locale}/admin/kongresse/${congressId}/raeume`,
        icon: DoorOpen,
        critical: false,
      },
      {
        key: 'branding',
        label: t('branding'),
        done: checks.hasLogo,
        href: `/${locale}/admin/kongresse/${congressId}/einstellungen`,
        icon: Palette,
        critical: false,
      },
    ],
    [checks, congressId, locale, t],
  );

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const allCriticalDone = items
    .filter((i) => i.critical)
    .every((i) => i.done);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('progress', { completed, total })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-ensemble-100 dark:bg-ensemble-800">
          <div
            className="h-full rounded-full bg-accent-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Checklist */}
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.done ? CheckCircle2 : Circle;
            return (
              <li key={item.key}>
                {item.done ? (
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ensemble-500 dark:text-ensemble-400">
                    <Icon className="h-5 w-5 shrink-0 text-green-500" />
                    <span className="line-through">{item.label}</span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                      'text-ensemble-900 dark:text-ensemble-50',
                      'hover:bg-ensemble-50 dark:hover:bg-ensemble-800/50',
                      'transition-colors',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-ensemble-300 dark:text-ensemble-600" />
                    <span>{item.label}</span>
                    {item.critical && (
                      <span className="ml-auto text-xs text-red-500">
                        {t('required')}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Publish button */}
        <Button className="w-full" disabled={!allCriticalDone}>
          {t('publish')}
        </Button>
        {!allCriticalDone && (
          <p className="text-center text-xs text-ensemble-400 dark:text-ensemble-500">
            {t('publishHint')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
