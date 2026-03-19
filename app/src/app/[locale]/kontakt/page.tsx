import { Link } from '@/i18n/navigation';
import { ContactForm } from '@/components/contact/contact-form';

export default function KontaktPage() {
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
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
          Kontakt
        </h1>
        <p className="mb-8 text-ensemble-500 dark:text-ensemble-400">
          Haben Sie Fragen oder Anregungen? Wir freuen uns auf Ihre Nachricht.
        </p>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
              <ContactForm />
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Address */}
            <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-900/30">
                <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ensemble-900 dark:text-ensemble-50">
                Adresse
              </h3>
              <p className="mt-2 text-sm text-ensemble-600 dark:text-ensemble-400">
                Nord GmbH<br />
                Ittigen<br />
                Schweiz
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-900/30">
                <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-semibold text-ensemble-900 dark:text-ensemble-50">
                E-Mail
              </h3>
              <a
                href="mailto:info@nord.spot"
                className="mt-2 block text-sm text-accent-500 hover:text-accent-600"
              >
                info@nord.spot
              </a>
            </div>

            {/* Response Time */}
            <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-900/30">
                <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ensemble-900 dark:text-ensemble-50">
                Antwortzeit
              </h3>
              <p className="mt-2 text-sm text-ensemble-600 dark:text-ensemble-400">
                Wir bemuehen uns, innerhalb von 1-2 Werktagen zu antworten.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ensemble-100 py-8 dark:border-ensemble-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-ensemble-400">
            <Link href="/impressum" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Datenschutz</Link>
            <Link href="/agb" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">AGB</Link>
          </div>
          <p className="mt-4 text-center text-xs text-ensemble-400">
            &copy; {new Date().getFullYear()} Ensemble by Nord GmbH. Made in Switzerland.
          </p>
        </div>
      </footer>
    </div>
  );
}
