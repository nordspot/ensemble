'use client';

import { Link } from '@/i18n/navigation';
import { EnsembleLogoIcon } from './ensemble-logo';

interface LandingFooterProps {
  translations: {
    copyright: string;
    legal: { label: string; href: string }[];
    [key: string]: unknown;
  };
}

export function LandingFooter({ translations: t }: LandingFooterProps) {
  return (
    <footer className="border-t border-ensemble-100 bg-ensemble-50">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 shrink-0">
            <EnsembleLogoIcon className="h-4 w-4 shrink-0" />
            <span className="text-xs text-ensemble-400 whitespace-nowrap">{t.copyright}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {t.legal.map((link, i) => (
              <Link
                key={i}
                href={link.href as '/impressum' | '/datenschutz' | '/agb'}
                className="text-xs text-ensemble-400 hover:text-ensemble-600 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
