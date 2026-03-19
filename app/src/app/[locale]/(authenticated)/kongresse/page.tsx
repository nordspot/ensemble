import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Placeholder data -- replaced with real DB queries when D1 is available
const demoCongresses = [
  {
    id: 'demo-1',
    name: 'Schweizerischer Kardiologie-Kongress 2026',
    slug: 'kardiologie-2026',
    start_date: '2026-06-15',
    end_date: '2026-06-17',
    venue_city: 'Bern',
    venue_name: 'Kursaal Bern',
    status: 'published',
    role: 'organizer',
    registered_count: 342,
  },
  {
    id: 'demo-2',
    name: 'Digital Health Summit',
    slug: 'digital-health-summit',
    start_date: '2026-09-22',
    end_date: '2026-09-23',
    venue_city: 'Zuerich',
    venue_name: 'ETH Zuerich',
    status: 'draft',
    role: 'organizer',
    registered_count: 0,
  },
  {
    id: 'demo-3',
    name: 'Neurologie Update 2026',
    slug: 'neurologie-update-2026',
    start_date: '2026-11-08',
    end_date: '2026-11-10',
    venue_city: 'Basel',
    venue_name: 'Congress Center Basel',
    status: 'published',
    role: 'attendee',
    registered_count: 567,
  },
];

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Entwurf',
    published: 'Veroeffentlicht',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    archived: 'Archiviert',
  };
  return map[status] ?? status;
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'published' || status === 'active') return 'default';
  if (status === 'draft') return 'secondary';
  return 'outline';
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}. - ${e.toLocaleDateString('de-CH', opts)}`;
  }
  return `${s.toLocaleDateString('de-CH', opts)} - ${e.toLocaleDateString('de-CH', opts)}`;
}

export default async function KongressePage() {
  const t = await getTranslations('common');

  // In production: fetch from D1
  // const db = getDb();
  // const congresses = await db.prepare(...).all();
  const congresses = demoCongresses;
  const hasOrganizerRole = true; // Check from auth session

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
            Meine Kongresse
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            Verwalten Sie Ihre Kongresse oder entdecken Sie neue Veranstaltungen.
          </p>
        </div>
        {hasOrganizerRole && (
          <Button size="lg" asChild>
            <Link href="/kongresse/neu">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Neuen Kongress erstellen
            </Link>
          </Button>
        )}
      </div>

      {/* Congress Grid */}
      {congresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {congresses.map((congress) => (
            <Link key={congress.id} href={`/kongresse/${congress.id}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-lg">
                {/* Banner placeholder */}
                <div className="h-32 rounded-t-xl bg-gradient-to-br from-accent-400 to-accent-600 p-4">
                  <Badge
                    variant={getStatusVariant(congress.status)}
                    className="bg-white/20 text-white backdrop-blur-sm"
                  >
                    {getStatusLabel(congress.status)}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2 text-base group-hover:text-accent-500">
                    {congress.name}
                  </CardTitle>
                  <CardDescription>
                    {formatDateRange(congress.start_date, congress.end_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-ensemble-500 dark:text-ensemble-400">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {congress.venue_city}
                    </div>
                    {congress.registered_count > 0 && (
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {congress.registered_count}
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {congress.role === 'organizer' ? 'Organisator' : 'Teilnehmer'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="py-16 text-center">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ensemble-100 dark:bg-ensemble-800">
              <svg className="h-8 w-8 text-ensemble-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
              Noch keine Kongresse
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ensemble-500 dark:text-ensemble-400">
              Erstellen Sie Ihren ersten Kongress oder melden Sie sich fuer einen veroeffentlichten Kongress an.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/kongresse/neu">Kongress erstellen</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Kongresse entdecken</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
