'use client';

import { motion } from 'framer-motion';

interface LogoBarProps {
  label: string;
}

const orgs = ['SGIM', 'Swiss Medtech', 'ETH Events', 'Inselspital', 'Uni Bern', 'SAKK'];

export function LogoBar({ label }: LogoBarProps) {
  return (
    <section className="relative bg-[#0D1326] py-12 sm:py-16">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ensemble-700/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          className="text-center text-sm font-medium tracking-wide text-ensemble-500 uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {label}
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-8 sm:gap-12 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {orgs.map((org) => (
            <div
              key={org}
              className="shrink-0 rounded-md px-4 py-2 text-sm font-semibold tracking-wider text-ensemble-500 uppercase select-none transition-colors hover:text-ensemble-300"
            >
              {org}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ensemble-700/50 to-transparent" />
    </section>
  );
}
