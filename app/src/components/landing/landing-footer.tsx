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
    <footer className="border-t border-ensemble-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <EnsembleLogoIcon className="h-5" />
          <span className="text-sm text-ensemble-500">{t.copyright}</span>
        </div>
        <div className="flex items-center gap-4">
          {t.legal.map((link, i) => (
            <Link
              key={i}
              href={link.href as '/impressum' | '/datenschutz' | '/agb'}
              className="text-xs text-ensemble-400 hover:text-ensemble-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
