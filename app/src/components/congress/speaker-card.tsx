'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AvatarRoot, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SpeakerCardData {
  user_id: string;
  full_name: string;
  title: string | null;
  organization_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  session_count: number;
}

interface SpeakerCardProps {
  speaker: SpeakerCardData;
  congressId: string;
  href?: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function SpeakerCard({ speaker, congressId, href, className }: SpeakerCardProps) {
  const t = useTranslations('speaker');

  const cardContent = (
    <Card
      className={cn(
        'group relative flex flex-col items-center p-6 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'dark:hover:border-ensemble-600',
        className
      )}
    >
      <AvatarRoot className="h-20 w-20 mb-4 ring-2 ring-ensemble-100 dark:ring-ensemble-700 group-hover:ring-accent-500 transition-all duration-200">
        {speaker.avatar_url ? (
          <AvatarImage src={speaker.avatar_url} alt={speaker.full_name} />
        ) : null}
        <AvatarFallback className="text-lg font-semibold">
          {getInitials(speaker.full_name)}
        </AvatarFallback>
      </AvatarRoot>

      <h3 className="text-base font-semibold text-ensemble-900 dark:text-ensemble-50 text-center leading-tight">
        {speaker.full_name}
      </h3>

      {speaker.title ? (
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400 text-center">
          {speaker.title}
        </p>
      ) : null}

      {speaker.organization_name ? (
        <p className="mt-0.5 text-sm text-ensemble-400 dark:text-ensemble-500 text-center">
          {speaker.organization_name}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {speaker.specialty ? (
          <Badge variant="secondary" className="text-xs">
            {speaker.specialty}
          </Badge>
        ) : null}
        {speaker.session_count > 0 ? (
          <Badge variant="outline" className="text-xs">
            {speaker.session_count} {t('sessions')}
          </Badge>
        ) : null}
      </div>
    </Card>
  );

  const linkHref = href ?? `/kongresse/${congressId}/speaker?id=${speaker.user_id}`;

  return (
    <Link href={linkHref} className="block focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-xl">
      {cardContent}
    </Link>
  );
}
