'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

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
    <section className="relative bg-ensemble-50 py-20 sm:py-28">
      <motion.div
        className="mx-auto max-w-2xl px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 sm:text-4xl lg:text-5xl"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          {t.headlineLine1}{' '}
          <span className="text-accent-500">{t.headlineLine2}</span>
        </h2>

        <p
          className="mx-auto mt-5 max-w-md text-base text-ensemble-500 sm:text-lg"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          {t.subtitle}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/registrieren"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(232,89,60,0.3)] transition-all hover:shadow-[0_4px_16px_rgba(232,89,60,0.4)] hover:brightness-105 active:scale-[0.97]"
          >
            {t.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/kontakt"
            className="inline-flex items-center rounded-full border border-ensemble-200 bg-white px-7 py-3.5 text-sm font-medium text-ensemble-600 shadow-sm transition-all hover:border-ensemble-300 hover:shadow-md active:scale-[0.97]"
          >
            {t.alternative}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
