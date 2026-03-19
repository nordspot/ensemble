'use client';

import { Link } from '@/i18n/navigation';
import { EnsembleLogo } from './ensemble-logo';

interface LandingFooterProps {
  translations: {
    tagline: string;
    colPlatform: string;
    colResources: string;
    colCompany: string;
    platformLinks: { label: string; href: string }[];
    resourceLinks: { label: string; href: string }[];
    companyLinks: { label: string; href: string }[];
    copyright: string;
    legal: { label: string; href: string }[];
  };
}

export function LandingFooter({ translations: t }: LandingFooterProps) {
  return (
    <footer className="bg-ensemble-900 border-t border-ensemble-800/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <EnsembleLogo className="h-7" variant="dark" />
            <p className="mt-4 text-sm text-ensemble-500 max-w-xs leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-ensemble-200 tracking-wide">
              {t.colPlatform}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {t.platformLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-sm text-ensemble-500 hover:text-ensemble-300 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-ensemble-200 tracking-wide">
              {t.colResources}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {t.resourceLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-sm text-ensemble-500 hover:text-ensemble-300 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-ensemble-200 tracking-wide">
              {t.colCompany}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {t.companyLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-sm text-ensemble-500 hover:text-ensemble-300 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ensemble-800/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-ensemble-600">
            {t.copyright}
          </p>
          <div className="flex items-center gap-6">
            {t.legal.map((link, i) => (
              <Link
                key={i}
                href={link.href as '/impressum' | '/datenschutz' | '/agb'}
                className="text-xs text-ensemble-600 hover:text-ensemble-400 transition-colors"
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
