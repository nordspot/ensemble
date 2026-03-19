'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { EnsembleLogo } from './ensemble-logo';
import { NetworkAnimation } from './network-animation';

interface HeroSectionProps {
  translations: {
    navPlatform: string;
    navPricing: string;
    navAbout: string;
    navLogin: string;
    navDemo: string;
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaNote: string;
  };
}

export function HeroSection({ translations: t }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col bg-ensemble-900">
      <NetworkAnimation />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5">
        <Link href="/" className="shrink-0">
          <EnsembleLogo className="h-7 sm:h-8" variant="dark" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#platform" className="text-sm font-medium text-ensemble-300 hover:text-white transition-colors">
            {t.navPlatform}
          </a>
          <a href="#stats" className="text-sm font-medium text-ensemble-300 hover:text-white transition-colors">
            {t.navPricing}
          </a>
          <a href="#swiss" className="text-sm font-medium text-ensemble-300 hover:text-white transition-colors">
            {t.navAbout}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/anmelden"
            className="hidden sm:block text-sm font-medium text-ensemble-300 hover:text-white transition-colors"
          >
            {t.navLogin}
          </Link>
          <Link
            href="/kontakt"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-600 active:scale-[0.97]"
          >
            {t.navDemo}
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ensemble-700/60 bg-ensemble-800/40 px-4 py-1.5 text-sm font-medium text-ensemble-300 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
              {t.eyebrow}
            </span>
          </motion.div>

          {/* Headline with clip-path reveal */}
          <div className="mt-8 overflow-hidden">
            <motion.h1
              className="font-heading text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl"
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {t.headlineLine1}
              <br />
              <span className="text-accent-500">{t.headlineLine2}</span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ensemble-300 sm:text-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {t.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Link
              href="/registrieren"
              className="inline-flex items-center justify-center rounded-lg bg-accent-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.97]"
            >
              {t.ctaPrimary}
            </Link>
            <a
              href="#platform"
              className="inline-flex items-center justify-center rounded-lg border border-ensemble-600 px-8 py-3.5 text-base font-semibold text-ensemble-200 transition-all hover:border-ensemble-400 hover:text-white active:scale-[0.97]"
            >
              {t.ctaSecondary}
            </a>
          </motion.div>

          {/* Note */}
          <motion.p
            className="mt-5 text-sm text-ensemble-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            {t.ctaNote}
          </motion.p>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D1326] to-transparent" />
    </section>
  );
}
