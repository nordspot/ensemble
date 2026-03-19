import { Link } from '@/i18n/navigation';

const footerLinks = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutz' },
  { href: '/agb', label: 'AGB' },
  { href: '/kontakt', label: 'Kontakt' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-ensemble-200 dark:border-ensemble-700 bg-white dark:bg-ensemble-900">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          &copy; 2026 Ensemble by Nord
        </p>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ensemble-500 hover:text-ensemble-900 dark:text-ensemble-400 dark:hover:text-ensemble-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
