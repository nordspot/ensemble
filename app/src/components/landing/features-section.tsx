'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  Radio,
  MapPin,
  Users,
  Brain,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

const features: Feature[] = [
  {
    icon: CalendarDays,
    titleKey: 'programTitle',
    descriptionKey: 'programDesc',
  },
  {
    icon: Radio,
    titleKey: 'streamingTitle',
    descriptionKey: 'streamingDesc',
  },
  {
    icon: MapPin,
    titleKey: 'navigationTitle',
    descriptionKey: 'navigationDesc',
  },
  {
    icon: Users,
    titleKey: 'networkingTitle',
    descriptionKey: 'networkingDesc',
  },
  {
    icon: Brain,
    titleKey: 'aiTitle',
    descriptionKey: 'aiDesc',
  },
  {
    icon: Trophy,
    titleKey: 'gamificationTitle',
    descriptionKey: 'gamificationDesc',
  },
];

interface FeaturesSectionProps {
  sectionTitle: string;
  translations: Record<string, string>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function FeaturesSection({
  sectionTitle,
  translations,
}: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 bg-white dark:bg-ensemble-900"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50 sm:text-4xl lg:text-5xl">
            {sectionTitle}
          </h2>
          <div className="mt-4 mx-auto h-1 w-16 rounded-full bg-accent-500" />
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                variants={card}
                className="group relative rounded-2xl border border-ensemble-100 dark:border-ensemble-700/50 bg-ensemble-50/50 dark:bg-ensemble-800/40 p-8 backdrop-blur-sm transition-all hover:border-ensemble-200 dark:hover:border-ensemble-600 hover:shadow-lg hover:shadow-ensemble-200/20 dark:hover:shadow-ensemble-900/40"
              >
                {/* Icon */}
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ensemble-100 dark:bg-ensemble-700/50 text-ensemble-600 dark:text-ensemble-300 transition-colors group-hover:bg-accent-500/10 group-hover:text-accent-500">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
                  {translations[feature.titleKey]}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm leading-relaxed text-ensemble-500 dark:text-ensemble-400">
                  {translations[feature.descriptionKey]}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
