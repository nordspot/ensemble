'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarRoot, AvatarFallback } from '@/components/ui/avatar';

export interface NearbyPerson {
  id: string;
  name: string;
  organization?: string;
  avatarUrl?: string;
}

interface NearbyPeopleProps {
  people: NearbyPerson[];
  privacyLevel: 'off' | 'navigation' | 'full';
}

export function NearbyPeople({ people, privacyLevel }: NearbyPeopleProps) {
  const t = useTranslations('beacon.nearby');

  if (privacyLevel !== 'full') {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400 text-center">
            {t('requiresFull')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-ensemble-900 dark:text-ensemble-50">
          {t('title', { count: people.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('empty')}
          </p>
        ) : (
          <ul className="space-y-3">
            {people.map((person) => (
              <li key={person.id} className="flex items-center gap-3">
                <AvatarRoot className="h-8 w-8">
                  {person.avatarUrl ? (
                    <img
                      src={person.avatarUrl}
                      alt={person.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-xs font-medium">
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </AvatarRoot>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50 truncate">
                    {person.name}
                  </p>
                  {person.organization && (
                    <p className="text-xs text-ensemble-500 dark:text-ensemble-400 truncate">
                      {person.organization}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-ensemble-400 dark:text-ensemble-500">
          {t('optInNotice')}
        </p>
      </CardContent>
    </Card>
  );
}
