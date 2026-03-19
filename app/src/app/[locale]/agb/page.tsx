import { Link } from '@/i18n/navigation';

export default function AGBPage() {
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
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <p className="mb-8 text-sm text-ensemble-400">Gültig ab: 19. März 2026</p>

        <div className="space-y-8 text-ensemble-600 dark:text-ensemble-400">
          {/* 1. Geltungsbereich */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              1. Geltungsbereich
            </h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform
              &quot;Ensemble&quot; (nachfolgend &quot;Plattform&quot;), betrieben von der Nord GmbH,
              Ittigen, Schweiz (nachfolgend &quot;Betreiber&quot;). Mit der Registrierung akzeptieren
              Sie diese AGB.
            </p>
          </section>

          {/* 2. Leistungsbeschreibung */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              2. Leistungsbeschreibung
            </h2>
            <p>
              Ensemble ist eine digitale Fachkongress-Plattform, die folgende Dienste anbietet:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Organisation und Verwaltung von Fachkongressen und Fachveranstaltungen</li>
              <li>Teilnehmerregistrierung und Ticketing</li>
              <li>Programmplanung und Session-Verwaltung</li>
              <li>Networking-Funktionen und Messaging</li>
              <li>Poster- und Abstrakt-Einreichung</li>
              <li>Gamification und CME-Akkreditierung</li>
              <li>Indoor-Navigation und BLE-Standortdienste (optional)</li>
              <li>Live-Streaming und Aufzeichnungen</li>
            </ul>
          </section>

          {/* 3. Registrierung und Konto */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              3. Registrierung und Konto
            </h2>
            <p>
              3.1 Für die Nutzung der Plattform ist eine Registrierung mit korrekten und vollständigen
              Angaben erforderlich. Sie sind verpflichtet, Ihre Zugangsdaten vertraulich zu behandeln.
            </p>
            <p className="mt-2">
              3.2 Sie sind für alle Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden.
              Bei Verdacht auf unbefugte Nutzung sind Sie verpflichtet, uns unverzüglich zu informieren.
            </p>
            <p className="mt-2">
              3.3 Der Betreiber behält sich das Recht vor, Konten bei Verstoß gegen diese AGB zu
              sperren oder zu löschen.
            </p>
          </section>

          {/* 4. Nutzerpflichten */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              4. Nutzerpflichten
            </h2>
            <p>Als Nutzer verpflichten Sie sich:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Keine rechtswidrigen, belästigenden oder diskriminierenden Inhalte zu veröffentlichen</li>
              <li>Geistiges Eigentum Dritter zu respektieren</li>
              <li>Keine automatisierten Zugriffe (Bots, Scraper) auf die Plattform durchzuführen</li>
              <li>Keine Schadsoftware oder Spam zu verbreiten</li>
              <li>Die Plattform nicht in einer Weise zu nutzen, die deren Betrieb beeinträchtigt</li>
            </ul>
          </section>

          {/* 5. Zahlungsbedingungen */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              5. Zahlungsbedingungen
            </h2>
            <p>
              5.1 Die Registrierung auf der Plattform ist kostenlos. Für die Teilnahme an
              kostenpflichtigen Fachkongressen gelten die vom jeweiligen Organisator festgelegten Preise.
            </p>
            <p className="mt-2">
              5.2 Zahlungen werden über sichere Zahlungsdienstleister abgewickelt. Alle Preise
              verstehen sich in der jeweiligen Kongresswährung (standardmäßig CHF) und sind, wo
              anwendbar, inklusive Mehrwertsteuer.
            </p>
            <p className="mt-2">
              5.3 Rechnungen werden elektronisch zugestellt. Zahlungen sind innerhalb von 14 Tagen
              nach Rechnungsstellung fällig, sofern nicht anders vereinbart.
            </p>
          </section>

          {/* 6. Geistiges Eigentum */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              6. Geistiges Eigentum
            </h2>
            <p>
              6.1 Alle Rechte an der Plattform, einschließlich Design, Code, Marken und Logos,
              gehören dem Betreiber oder seinen Lizenzgebern.
            </p>
            <p className="mt-2">
              6.2 Inhalte, die Sie auf der Plattform hochladen (Poster, Abstracts, Präsentationen),
              verbleiben in Ihrem Eigentum. Sie gewähren dem Betreiber eine nicht-exklusive Lizenz
              zur Anzeige und Bereitstellung innerhalb der Plattform.
            </p>
            <p className="mt-2">
              6.3 Diese Lizenz endet, wenn Sie den jeweiligen Inhalt löschen oder Ihr Konto schließen.
            </p>
          </section>

          {/* 7. Haftungsbeschränkung */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              7. Haftungsbeschränkung
            </h2>
            <p>
              7.1 Der Betreiber haftet nicht für Schäden, die aus der Nutzung oder Nichtverfügbarkeit
              der Plattform entstehen, soweit gesetzlich zulässig.
            </p>
            <p className="mt-2">
              7.2 Die Haftung für leichte Fahrlässigkeit wird ausgeschlossen, soweit keine wesentlichen
              Vertragspflichten verletzt werden.
            </p>
            <p className="mt-2">
              7.3 Der Betreiber übernimmt keine Garantie für die ununterbrochene Verfügbarkeit der
              Plattform und behält sich Wartungsarbeiten vor.
            </p>
          </section>

          {/* 8. Stornierung und Rücktritt */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              8. Stornierung und Rücktritt
            </h2>
            <p>
              8.1 Die Stornierung einer Fachkongress-Registrierung richtet sich nach den Bedingungen des
              jeweiligen Fachkongressorganisators.
            </p>
            <p className="mt-2">
              8.2 Sofern nicht anders angegeben, gilt folgende Stornierungsregelung:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Bis 30 Tage vor Fachkongressbeginn: volle Rückerstattung</li>
              <li>15-30 Tage vor Fachkongressbeginn: 50% Rückerstattung</li>
              <li>Weniger als 15 Tage vor Fachkongressbeginn: keine Rückerstattung</li>
            </ul>
            <p className="mt-2">
              8.3 Bei Absage eines Fachkongresses durch den Organisator erhalten Sie eine volle Rückerstattung.
            </p>
          </section>

          {/* 9. Kündigung */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              9. Kündigung
            </h2>
            <p>
              9.1 Sie können Ihr Konto jederzeit über Ihre Profileinstellungen löschen.
            </p>
            <p className="mt-2">
              9.2 Der Betreiber kann das Nutzungsverhältnis mit einer Frist von 30 Tagen kündigen.
              Bei schwerwiegenden Verstößen ist eine fristlose Kündigung möglich.
            </p>
          </section>

          {/* 10. Anwendbares Recht und Gerichtsstand */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              10. Anwendbares Recht und Gerichtsstand
            </h2>
            <div className="rounded-xl border border-ensemble-200 bg-ensemble-50/50 p-5 dark:border-ensemble-700 dark:bg-ensemble-900/50">
              <p className="font-medium text-ensemble-700 dark:text-ensemble-300">
                Es gilt ausschließlich schweizerisches Recht unter Ausschluss der Kollisionsnormen
                und des UN-Kaufrechts.
              </p>
              <p className="mt-2 font-medium text-ensemble-700 dark:text-ensemble-300">
                Ausschließlicher Gerichtsstand ist Bern, Schweiz.
              </p>
            </div>
          </section>

          {/* 11. Schlussbestimmungen */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              11. Schlussbestimmungen
            </h2>
            <p>
              11.1 Sollte eine Bestimmung dieser AGB unwirksam sein, bleiben die übrigen Bestimmungen
              davon unberührt.
            </p>
            <p className="mt-2">
              11.2 Der Betreiber behält sich das Recht vor, diese AGB jederzeit zu ändern.
              Änderungen werden per E-Mail oder auf der Plattform mitgeteilt. Bei wesentlichen
              Änderungen werden Sie um erneute Zustimmung gebeten.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ensemble-100 py-8 dark:border-ensemble-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-ensemble-400">
            <Link href="/impressum" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-ensemble-600 dark:hover:text-ensemble-300">Datenschutz</Link>
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
