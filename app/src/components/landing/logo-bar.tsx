'use client';

import { motion } from 'framer-motion';

interface LogoBarProps {
  label: string;
}

const orgs = ['SGIM', 'Swiss Medtech', 'ETH Events', 'Inselspital', 'Uni Bern', 'SAKK'];

export function LogoBar({ label }: LogoBarProps) {
  return (
    <section className="relative bg-[#0D1326] py-10 sm:py-12">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ensemble-700/50 to-transparent" />

      <div className="mx-auto max-w-5xl px-6">
        <motion.p
          className="text-center text-xs font-medium tracking-wide text-ensemble-500/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {label}
        </motion.p>

        {/* Desktop: centered row with middot separators */}
        <motion.div
          className="mt-6 hidden sm:flex items-center justify-center gap-0"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {orgs.map((org, i) => (
            <div key={org} className="flex items-center">
              <span className="text-[13px] font-medium tracking-wide text-ensemble-400/70 select-none">
                {org}
              </span>
              {i < orgs.length - 1 && (
                <span className="mx-4 text-ensemble-600/50 select-none">&middot;</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Mobile: horizontally scrolling */}
        <motion.div
          className="mt-6 flex sm:hidden items-center gap-5 overflow-x-auto scrollbar-hide px-2 -mx-2"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {orgs.map((org) => (
            <span
              key={org}
              className="shrink-0 text-[13px] font-medium tracking-wide text-ensemble-400/70 select-none"
            >
              {org}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ensemble-700/50 to-transparent" />
    </section>
  );
}
