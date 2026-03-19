'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { ArrowRight, PlayCircle } from 'lucide-react';

interface HeroSectionProps {
  heroTitle: string;
  tagline: string;
  registerLabel: string;
  learnMoreLabel: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export function HeroSection({
  heroTitle,
  tagline,
  registerLabel,
  learnMoreLabel,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ensemble-50 via-white to-ensemble-100 dark:from-ensemble-900 dark:via-ensemble-800 dark:to-ensemble-900" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-ensemble-200/30 dark:bg-ensemble-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent-500/10 dark:bg-accent-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-ensemble-200 dark:border-ensemble-700 bg-white/60 dark:bg-ensemble-800/60 px-4 py-1.5 text-sm font-medium text-ensemble-600 dark:text-ensemble-300 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              Swiss Congress Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-heading text-5xl font-bold leading-tight tracking-tight text-ensemble-900 dark:text-ensemble-50 sm:text-6xl lg:text-7xl"
          >
            {heroTitle}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="max-w-2xl text-xl leading-relaxed text-ensemble-600 dark:text-ensemble-300 sm:text-2xl"
          >
            {tagline}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={item}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.98]"
            >
              {registerLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="#features"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-ensemble-200 dark:border-ensemble-700 bg-white/80 dark:bg-ensemble-800/80 px-8 py-3.5 text-base font-semibold text-ensemble-700 dark:text-ensemble-200 backdrop-blur-sm transition-all hover:bg-ensemble-50 dark:hover:bg-ensemble-700/80 active:scale-[0.98]"
            >
              <PlayCircle className="h-4 w-4" />
              {learnMoreLabel}
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.p
            variants={item}
            className="mt-4 text-sm text-ensemble-400 dark:text-ensemble-500"
          >
            Hosted in Switzerland &middot; GDPR-compliant &middot; Enterprise-ready
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
