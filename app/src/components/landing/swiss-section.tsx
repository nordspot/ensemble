'use client';

import { motion } from 'framer-motion';

interface SwissSectionProps {
  translations: {
    title: string;
    cards: { title: string; description: string }[];
  };
}

const cardIcons = [
  // Shield (data)
  <svg key="shield" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>,
  // Eye off (no tracking)
  <svg key="eye" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>,
  // Lock (security)
  <svg key="lock" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
    <circle cx="12" cy="16" r="1" />
  </svg>,
  // Code (API)
  <svg key="code" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>,
];

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function SwissSection({ translations: t }: SwissSectionProps) {
  return (
    <section id="swiss" className="relative bg-ensemble-100 py-24 sm:py-32 overflow-hidden">
      {/* Swiss cross background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
        <svg viewBox="0 0 200 200" className="h-[500px] w-[500px]">
          <rect x="80" y="20" width="40" height="160" fill="#94a3b8" />
          <rect x="20" y="80" width="160" height="40" fill="#94a3b8" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <motion.h2
          className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 text-center sm:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.title}
        </motion.h2>

        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.08 }}
        >
          {t.cards.map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className="group rounded-2xl border border-ensemble-200 bg-white shadow-sm p-6 transition-all hover:border-ensemble-300 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ensemble-100 text-accent-500 transition-colors group-hover:bg-accent-500/10">
                {cardIcons[i]}
              </div>
              <h3 className="text-base font-semibold text-ensemble-900">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ensemble-500">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
