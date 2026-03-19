import { Link } from '@/i18n/navigation';

export default function DatenschutzPage() {
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
          Datenschutzerklaerung
        </h1>
        <p className="mb-8 text-sm text-ensemble-400">Letzte Aktualisierung: 19. Maerz 2026</p>

        <div className="space-y-8 text-ensemble-600 dark:text-ensemble-400">
          {/* 1. Verantwortlicher */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              1. Verantwortlicher
            </h2>
            <div className="rounded-xl border border-ensemble-200 bg-ensemble-50/50 p-5 dark:border-ensemble-700 dark:bg-ensemble-900/50">
              <p>
                <strong className="text-ensemble-700 dark:text-ensemble-300">Nord GmbH</strong><br />
                Ittigen, Schweiz<br />
                E-Mail: <a href="mailto:info@nord.spot" className="text-accent-500 hover:text-accent-600">info@nord.spot</a>
              </p>
            </div>
            <p className="mt-3">
              Fuer Fragen zum Datenschutz wenden Sie sich bitte an die oben genannte Adresse.
            </p>
          </section>

          {/* 2. Welche Daten wir erheben */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              2. Welche Daten wir erheben
            </h2>
            <h3 className="mb-2 mt-4 font-semibold text-ensemble-700 dark:text-ensemble-300">
              2.1 Registrierungsdaten
            </h3>
            <p>
              Bei der Erstellung eines Kontos erheben wir: Name, E-Mail-Adresse, Passwort (verschluesselt gespeichert),
              sowie optionale Angaben wie Titel, Organisation, Fachgebiet, Telefonnummer und Biografie.
            </p>

            <h3 className="mb-2 mt-4 font-semibold text-ensemble-700 dark:text-ensemble-300">
              2.2 Nutzungsdaten
            </h3>
            <p>
              Bei der Nutzung unserer Plattform erfassen wir technische Daten wie IP-Adresse, Browser-Typ,
              Geraetetyp, Betriebssystem sowie Datum und Uhrzeit des Zugriffs. Diese Daten werden fuer den
              Betrieb und die Sicherheit der Plattform benoetigt.
            </p>

            <h3 className="mb-2 mt-4 font-semibold text-ensemble-700 dark:text-ensemble-300">
              2.3 BLE-Standortdaten (optional)
            </h3>
            <p>
              Wenn Sie die BLE-Standortbestimmung in Ihrem Profil aktivieren, erfassen wir waehrend
              Kongressen Ihren ungefaehren Standort innerhalb des Veranstaltungsortes. Diese Funktion
              ist standardmaessig deaktiviert und erfordert Ihre ausdrueckliche Einwilligung.
            </p>

            <h3 className="mb-2 mt-4 font-semibold text-ensemble-700 dark:text-ensemble-300">
              2.4 Kongress-bezogene Daten
            </h3>
            <p>
              Registrierungen fuer Kongresse, Session-Buchungen, Check-ins, Chat-Nachrichten, Poster-Einreichungen
              und Gamification-Punkte werden fuer die Bereitstellung der Kongressdienste gespeichert.
            </p>
          </section>

          {/* 3. Rechtsgrundlage */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              3. Rechtsgrundlage der Verarbeitung
            </h2>
            <p>Wir verarbeiten Ihre Daten auf folgenden Grundlagen:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Vertragsdurchfuehrung:</strong> Verarbeitung zur Bereitstellung der Plattform und Kongressdienste.</li>
              <li><strong>Einwilligung:</strong> BLE-Standorterfassung, optionale Profilangaben, Push-Benachrichtigungen.</li>
              <li><strong>Berechtigtes Interesse:</strong> Sicherheit der Plattform, Missbrauchspraevention, Analyse zur Verbesserung.</li>
            </ul>
          </section>

          {/* 4. Datenweitergabe */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              4. Datenweitergabe
            </h2>
            <p>
              Wir geben Ihre personenbezogenen Daten nicht an Dritte zu Werbezwecken weiter.
            </p>
            <p className="mt-2">
              <strong>Auftragsverarbeiter:</strong> Wir nutzen Cloudflare (Cloudflare Inc., USA) als
              technischen Dienstleister fuer Hosting, CDN und Datenbankdienste. Cloudflare verarbeitet
              Daten in unserem Auftrag und gemaess unseren Weisungen.
            </p>
            <p className="mt-2">
              <strong>Kongress-Organisatoren:</strong> Wenn Sie sich fuer einen Kongress registrieren,
              werden Ihre Registrierungsdaten dem jeweiligen Organisator zur Verfuegung gestellt.
            </p>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              5. Cookies
            </h2>
            <p>
              Wir verwenden ausschliesslich technisch notwendige Cookies und Authentifizierungs-Cookies.
              Wir setzen keine Tracking-Cookies, keine Werbe-Cookies und keine Analyse-Cookies von
              Drittanbietern ein.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-ensemble-200 dark:border-ensemble-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ensemble-50 dark:bg-ensemble-900">
                    <th className="px-4 py-2 text-left font-medium text-ensemble-700 dark:text-ensemble-300">Cookie</th>
                    <th className="px-4 py-2 text-left font-medium text-ensemble-700 dark:text-ensemble-300">Zweck</th>
                    <th className="px-4 py-2 text-left font-medium text-ensemble-700 dark:text-ensemble-300">Dauer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-ensemble-200 dark:border-ensemble-700">
                    <td className="px-4 py-2 font-mono text-xs">next-auth.session-token</td>
                    <td className="px-4 py-2">Authentifizierung</td>
                    <td className="px-4 py-2">30 Tage</td>
                  </tr>
                  <tr className="border-t border-ensemble-200 dark:border-ensemble-700">
                    <td className="px-4 py-2 font-mono text-xs">next-auth.csrf-token</td>
                    <td className="px-4 py-2">CSRF-Schutz</td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr className="border-t border-ensemble-200 dark:border-ensemble-700">
                    <td className="px-4 py-2 font-mono text-xs">theme</td>
                    <td className="px-4 py-2">Design-Praeferenz</td>
                    <td className="px-4 py-2">1 Jahr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Speicherdauer */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              6. Speicherdauer
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Kontodaten:</strong> So lange Ihr Konto besteht, plus 30 Tage nach Loeschung.</li>
              <li><strong>Kongressdaten:</strong> 2 Jahre nach Ende des jeweiligen Kongresses.</li>
              <li><strong>Standortdaten (BLE):</strong> Werden nach Ende des jeweiligen Kongresses automatisch geloescht.</li>
              <li><strong>Server-Logs:</strong> 90 Tage.</li>
              <li><strong>Kontaktanfragen:</strong> 1 Jahr nach Abschluss der Anfrage.</li>
            </ul>
          </section>

          {/* 7. Ihre Rechte */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              7. Ihre Rechte
            </h2>
            <p>
              Gemaess dem Bundesgesetz ueber den Datenschutz (nDSG) und der EU-Datenschutz-Grundverordnung (DSGVO)
              haben Sie folgende Rechte:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Auskunftsrecht:</strong> Sie koennen Auskunft ueber Ihre gespeicherten Daten verlangen.</li>
              <li><strong>Berichtigungsrecht:</strong> Sie koennen die Berichtigung unrichtiger Daten verlangen.</li>
              <li><strong>Loeschungsrecht:</strong> Sie koennen die Loeschung Ihrer Daten verlangen.</li>
              <li><strong>Datenportabilitaet:</strong> Sie koennen die Herausgabe Ihrer Daten in maschinenlesbarem Format verlangen.</li>
              <li><strong>Widerspruchsrecht:</strong> Sie koennen der Verarbeitung Ihrer Daten widersprechen.</li>
              <li><strong>Widerruf der Einwilligung:</strong> Sie koennen eine erteilte Einwilligung jederzeit widerrufen.</li>
            </ul>
            <p className="mt-3">
              Zur Ausuebung Ihrer Rechte wenden Sie sich bitte an:{' '}
              <a href="mailto:info@nord.spot" className="text-accent-500 hover:text-accent-600">info@nord.spot</a>
            </p>
          </section>

          {/* 8. Beschwerderecht */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              8. Beschwerderecht
            </h2>
            <p>
              Sie haben das Recht, sich bei der zustaendigen Datenschutzbehoerde zu beschweren.
              In der Schweiz ist dies der Eidgenoessische Datenschutz- und Oeffentlichkeitsbeauftragte (EDOEB).
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ensemble-100 py-8 dark:border-ensemble-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-ensemble-400">
            <Link href="/impressum" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Impressum</Link>
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
