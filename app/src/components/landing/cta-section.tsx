'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

interface CtaSectionProps {
  translations: {
    headline: string;
    subtitle: string;
    cta: string;
    alternative: string;
  };
}

export function CtaSection({ translations: t }: CtaSectionProps) {
  return (
    <section className="relative bg-ensemble-900 py-24 sm:py-32">
      {/* Accent gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent-500/10 blur-[120px]" />

      <motion.div
        className="relative mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t.headline}
        </h2>
        <p className="mt-4 text-lg text-ensemble-400">
          {t.subtitle}
        </p>
        <div className="mt-10">
          <Link
            href="/registrieren"
            className="inline-flex items-center justify-center rounded-lg bg-accent-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.97]"
          >
            {t.cta}
          </Link>
        </div>
        <p className="mt-5 text-sm text-ensemble-500">
          {t.alternative}
        </p>
      </motion.div>
    </section>
  );
}
