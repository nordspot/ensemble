import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// In production, fetch from D1 by slug
function getCongressBySlug(slug: string) {
  return {
    id: 'demo-1',
    name: 'Schweizerischer Kardiologie-Kongress 2026',
    slug,
    subtitle: 'Innovationen in der kardiovaskulaeren Medizin',
    description:
      'Der jaehrliche Schweizerische Kardiologie-Kongress bringt fuehrende Expertinnen und Experten aus der kardiovaskulaeren Medizin zusammen. Drei Tage voller Wissensaustausch, Networking und Fortbildung erwarten Sie in Bern.',
    start_date: '2026-06-15',
    end_date: '2026-06-17',
    venue_name: 'Kursaal Bern',
    venue_city: 'Bern',
    venue_country: 'Schweiz',
    venue_address: 'Kornhausstrasse 3, 3013 Bern',
    speakers_count: 48,
    sessions_count: 72,
    registered_count: 342,
    registration_open: true,
    cme_credits: 18,
    currency: 'CHF',
    regular_price_cents: 45000,
    early_bird_price_cents: 35000,
    early_bird_deadline: '2026-04-30',
    highlights: [
      {
        id: 's1',
        title: 'Keynote: Die Zukunft der interventionellen Kardiologie',
        speaker: 'Prof. Dr. Anna Mueller',
        time: 'Mo, 15. Juni 2026 - 09:00',
        type: 'keynote',
      },
      {
        id: 's2',
        title: 'Workshop: KI-gestuetzte EKG-Analyse',
        speaker: 'Dr. Thomas Weber',
        time: 'Di, 16. Juni 2026 - 14:00',
        type: 'workshop',
      },
      {
        id: 's3',
        title: 'Panel: Praezisionsmedizin in der Herzchirurgie',
        speaker: 'Diverse Referierende',
        time: 'Mi, 17. Juni 2026 - 10:00',
        type: 'panel',
      },
    ],
    speakers: [
      { id: 'sp1', name: 'Prof. Dr. Anna Mueller', title: 'Chefaerztin Kardiologie', org: 'Inselspital Bern' },
      { id: 'sp2', name: 'Dr. Thomas Weber', title: 'Leiter KI-Forschung', org: 'ETH Zuerich' },
      { id: 'sp3', name: 'Prof. Dr. Maria Rossi', title: 'Herzchirurgin', org: 'CHUV Lausanne' },
      { id: 'sp4', name: 'Dr. Lukas Berger', title: 'Kardiologe', org: 'USZ Zuerich' },
      { id: 'sp5', name: 'Prof. Dr. Sarah Klein', title: 'Forschungsleiterin', org: 'Universitaet Basel' },
      { id: 'sp6', name: 'Dr. Marco Fontana', title: 'Interventioneller Kardiologe', org: 'Cardiocentro Lugano' },
    ],
  };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPrice(cents: number, currency: string): string {
  return `${currency} ${(cents / 100).toFixed(0)}.-`;
}

export default async function KongressPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations();
  const congress = getCongressBySlug(slug);

  return (
    <div className="min-h-screen bg-white dark:bg-ensemble-950">
      {/* Header */}
      <header className="border-b border-ensemble-100 dark:border-ensemble-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-ensemble-900 dark:text-ensemble-50">
              Ensemble
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/anmelden"
              className="text-sm font-medium text-ensemble-600 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:text-ensemble-50"
            >
              Anmelden
            </Link>
            <Button asChild size="sm">
              <Link href="/registrieren">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,white_0%,transparent_50%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white backdrop-blur-sm">
              {formatDate(congress.start_date)} - {formatDate(congress.end_date)}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {congress.name}
            </h1>
            {congress.subtitle && (
              <p className="mt-3 text-lg text-white/80 sm:text-xl">
                {congress.subtitle}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {congress.venue_name}, {congress.venue_city}
              </div>
              {congress.cme_credits > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                  {congress.cme_credits} CME Credits
                </div>
              )}
            </div>
            <div className="mt-8">
              <Button size="lg" className="bg-white text-accent-600 hover:bg-white/90">
                Jetzt anmelden
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="border-b border-ensemble-100 dark:border-ensemble-800">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-ensemble-100 dark:divide-ensemble-800 sm:grid-cols-4">
          {[
            { label: 'Referierende', value: congress.speakers_count },
            { label: 'Sessions', value: congress.sessions_count },
            { label: 'Angemeldet', value: congress.registered_count },
            { label: 'CME Credits', value: congress.cme_credits },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center sm:px-6">
              <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              Ueber den Kongress
            </h2>
            <p className="mt-4 text-ensemble-600 leading-relaxed dark:text-ensemble-400">
              {congress.description}
            </p>

            {/* Programme Highlights */}
            <h2 className="mt-12 text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              Programmhighlights
            </h2>
            <div className="mt-4 space-y-3">
              {congress.highlights.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-ensemble-200 p-4 transition-colors hover:bg-ensemble-50 dark:border-ensemble-700 dark:hover:bg-ensemble-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="outline" className="mb-2 text-xs capitalize">
                        {session.type}
                      </Badge>
                      <h3 className="font-semibold text-ensemble-900 dark:text-ensemble-50">
                        {session.title}
                      </h3>
                      <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
                        {session.speaker}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ensemble-400">{session.time}</p>
                </div>
              ))}
            </div>

            {/* Speakers */}
            <h2 className="mt-12 text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
              Referierende
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {congress.speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center gap-3 rounded-xl border border-ensemble-200 p-4 dark:border-ensemble-700"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ensemble-100 dark:bg-ensemble-800">
                    <span className="text-sm font-semibold text-ensemble-500 dark:text-ensemble-400">
                      {speaker.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ensemble-900 dark:text-ensemble-50">
                      {speaker.name}
                    </p>
                    <p className="truncate text-xs text-ensemble-500 dark:text-ensemble-400">
                      {speaker.title}
                    </p>
                    <p className="truncate text-xs text-ensemble-400">
                      {speaker.org}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration Card */}
            <div className="sticky top-4 rounded-xl border border-ensemble-200 bg-white p-6 shadow-lg dark:border-ensemble-700 dark:bg-ensemble-900">
              <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
                Registrierung
              </h3>
              {congress.early_bird_price_cents && congress.early_bird_deadline && (
                <div className="mt-4 rounded-lg bg-accent-50 p-3 dark:bg-accent-900/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-accent-600 dark:text-accent-400">
                    Early Bird bis {formatDate(congress.early_bird_deadline)}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-accent-600 dark:text-accent-400">
                    {formatPrice(congress.early_bird_price_cents, congress.currency)}
                  </p>
                </div>
              )}
              <div className="mt-3">
                <p className="text-xs text-ensemble-400">Regulaerer Preis</p>
                <p className="text-xl font-bold text-ensemble-900 dark:text-ensemble-50">
                  {formatPrice(congress.regular_price_cents, congress.currency)}
                </p>
              </div>
              <Button className="mt-4 w-full" size="lg">
                Jetzt anmelden
              </Button>
              <p className="mt-3 text-center text-xs text-ensemble-400">
                {congress.registered_count} Teilnehmende angemeldet
              </p>
            </div>

            {/* Venue Card */}
            <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
              <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
                Veranstaltungsort
              </h3>
              <div className="mt-3 space-y-1 text-sm text-ensemble-600 dark:text-ensemble-400">
                <p className="font-medium text-ensemble-900 dark:text-ensemble-50">
                  {congress.venue_name}
                </p>
                <p>{congress.venue_address}</p>
                <p>{congress.venue_city}, {congress.venue_country}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ensemble-50 dark:bg-ensemble-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            Sichern Sie sich Ihren Platz
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-ensemble-500 dark:text-ensemble-400">
            Werden Sie Teil des {congress.name} und vernetzen Sie sich mit fuehrenden Expertinnen und Experten.
          </p>
          <Button className="mt-6" size="lg">
            Jetzt anmelden
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ensemble-100 py-8 dark:border-ensemble-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-ensemble-400">
            <Link href="/impressum" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Datenschutz</Link>
            <Link href="/agb" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">AGB</Link>
            <Link href="/kontakt" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Kontakt</Link>
          </div>
          <p className="mt-4 text-center text-xs text-ensemble-400">
            &copy; {new Date().getFullYear()} Ensemble by Nord GmbH. Made in Switzerland.
          </p>
        </div>
      </footer>
    </div>
  );
}
