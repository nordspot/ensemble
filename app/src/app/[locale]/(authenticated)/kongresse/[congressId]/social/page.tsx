import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SocialPageProps {
  params: Promise<{ locale: string; congressId: string }>;
}

interface SocialEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  dressCode: string | null;
  capacity: number;
  rsvpCount: number;
  description: string | null;
}

export default async function SocialPage({ params }: SocialPageProps) {
  const { locale, congressId } = await params;
  const t = await getTranslations('social');

  // Server-side data fetching will be wired here
  const events: SocialEvent[] = [];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ensemble-300 dark:text-ensemble-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p className="mt-4 text-ensemble-500 dark:text-ensemble-400">
              {t('noEvents')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
                        {event.title}
                      </h3>
                      <Badge variant="secondary">
                        {t(`types.${event.type}`)}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="mt-2 text-sm text-ensemble-600 dark:text-ensemble-300">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-ensemble-500 dark:text-ensemble-400">
                      {/* Date + time */}
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {event.date} {event.time}
                      </div>
                      {/* Location */}
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {event.location}
                      </div>
                      {/* Dress code */}
                      {event.dressCode && (
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 1.88v16.34a1 1 0 0 0 1 1h17.44a1 1 0 0 0 1-1V5.34a2 2 0 0 0-1.34-1.88Z"/></svg>
                          {event.dressCode}
                        </div>
                      )}
                      {/* Capacity */}
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        {event.rsvpCount} / {event.capacity}
                      </div>
                    </div>
                  </div>

                  <Button className="shrink-0 self-start">
                    {t('rsvp')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
