import { Link } from '@/i18n/navigation';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-ensemble-950">
      {/* Header */}
      <header className="border-b border-ensemble-100 dark:border-ensemble-800">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-ensemble-900 dark:text-ensemble-50">
              Ensemble
            </span>
          </Link>
          <Link
            href="/anmelden"
            className="text-sm font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400"
          >
            Anmelden
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
          Impressum
        </h1>

        <div className="prose prose-ensemble max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              Angaben gemäß Art. 3 Abs. 1 lit. s UWG
            </h2>
            <div className="mt-4 rounded-xl border border-ensemble-200 bg-ensemble-50/50 p-6 dark:border-ensemble-700 dark:bg-ensemble-900/50">
              <p className="text-ensemble-700 dark:text-ensemble-300">
                <strong>Nord GmbH</strong><br />
                Ittigen, Schweiz
              </p>
              <p className="mt-3 text-ensemble-700 dark:text-ensemble-300">
                E-Mail: <a href="mailto:info@nord.spot" className="text-accent-500 hover:text-accent-600">info@nord.spot</a>
              </p>
              <p className="mt-3 text-ensemble-700 dark:text-ensemble-300">
                UID: CHE-000.000.000 (in Bearbeitung)
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              Vertretungsberechtigte Person
            </h2>
            <p className="mt-2 text-ensemble-700 dark:text-ensemble-300">
              Daniel, Mitgründer und Geschäftsführer
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              Inhaltliche Verantwortung
            </h2>
            <p className="mt-2 text-ensemble-700 dark:text-ensemble-300">
              Verantwortlich für den Inhalt dieser Webseite:<br />
              Daniel, Nord GmbH, Ittigen, Schweiz
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              Haftungsausschluss
            </h2>
            <p className="mt-2 text-ensemble-600 dark:text-ensemble-400">
              Die Inhalte dieser Webseite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
              Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              Urheberrecht
            </h2>
            <p className="mt-2 text-ensemble-600 dark:text-ensemble-400">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem schweizerischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
              jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              Streitbeilegung
            </h2>
            <p className="mt-2 text-ensemble-600 dark:text-ensemble-400">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ensemble-100 py-8 dark:border-ensemble-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-ensemble-400">
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
