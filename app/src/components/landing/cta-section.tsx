'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

interface CtaSectionProps {
  translations: {
    headlineLine1: string;
    headlineLine2: string;
    subtitle: string;
    cta: string;
    alternative: string;
  };
}

export function CtaSection({ translations: t }: CtaSectionProps) {
  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-6">
        <motion.div
          className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-ensemble-900 via-ensemble-800 to-ensemble-900" />

          {/* Animated accent orbs */}
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-accent-500/20 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-accent-500/15 blur-[60px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-accent-500/10 blur-[40px]" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            {/* Small feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {['50+ Funktionen', '4 Sprachen', 'Swiss Hosted', 'DSGVO-konform'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-ensemble-600/40 bg-ensemble-800/40 px-3 py-1 text-xs font-medium text-ensemble-300 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t.headlineLine1}
              <br />
              <span className="bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent">
                {t.headlineLine2}
              </span>
            </h2>

            <p
              className="mx-auto mt-4 max-w-md text-base text-ensemble-300 sm:text-lg"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {t.subtitle}
            </p>

            {/* CTA group */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/registrieren"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-accent-400 to-accent-600 px-8 py-4 text-base font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2),0_6px_20px_rgba(232,89,60,0.4)] transition-all hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_10px_32px_rgba(232,89,60,0.5)] hover:brightness-110 active:scale-[0.97]"
              >
                {t.cta}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center rounded-full border border-ensemble-500/40 bg-ensemble-800/30 px-7 py-3.5 text-sm font-medium text-ensemble-200 backdrop-blur-sm transition-all hover:border-ensemble-400/60 hover:bg-ensemble-700/30 hover:text-white active:scale-[0.97]"
              >
                {t.alternative}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
