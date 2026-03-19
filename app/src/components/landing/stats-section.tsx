'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';

interface StatsSectionProps {
  translations: {
    stats: { value: string; label: string }[];
  };
}

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState(value);

  const animate = useCallback(() => {
    // Extract numeric part
    const match = value.match(/(\d+)/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const target = parseInt(match[1], 10);
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index || 0) + match[1].length);
    const duration = 1200;
    const start = Date.now();

    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplay(`${prefix}${current}${suffix}`);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  useEffect(() => {
    if (inView) animate();
  }, [inView, animate]);

  return <span>{display}</span>;
}

export function StatsSection({ translations: t }: StatsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="stats" className="relative bg-ensemble-900 py-20 sm:py-28 overflow-hidden">
      {/* Glowing separator line at top */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-center">
        <div className="h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center justify-center">
        <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-accent-500/20 to-transparent blur-sm" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div ref={ref} className="relative mx-auto max-w-5xl px-6">
        <motion.div
          className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-heading text-4xl font-bold text-accent-500 sm:text-5xl lg:text-6xl">
                <AnimatedNumber value={stat.value} inView={inView} />
              </div>
              <div className="mt-2 text-sm font-medium text-ensemble-400 sm:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
