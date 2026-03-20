'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useCallback } from 'react';

interface SwissSectionProps {
  translations: {
    title: string;
    cards: { title: string; description: string }[];
  };
}

const cardIcons = [
  <svg key="shield" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>,
  <svg key="eye" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>,
  <svg key="lock" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
    <circle cx="12" cy="16" r="1" />
  </svg>,
  <svg key="code" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>,
];

/* Animated connection lines between the 4 cards */
function ConnectionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: false, margin: '-100px' });
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    timeRef.current += 0.008;
    const t = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    // 4 card center points (approximate positions in the grid)
    const cols = w < 640 ? 2 : 4;
    const rows = cols === 2 ? 2 : 1;
    const cardW = w / cols;
    const cardH = h / rows;
    const points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (points.length >= 4) break;
        points.push({ x: cardW * c + cardW / 2, y: cardH * r + cardH / 2 });
      }
    }

    // Draw flowing connections between all pairs
    const pairs = [[0,1],[1,2],[2,3],[0,2],[1,3],[0,3]];
    for (const [a, b] of pairs) {
      if (!points[a] || !points[b]) continue;
      const ax = points[a].x;
      const ay = points[a].y;
      const bx = points[b].x;
      const by = points[b].y;

      // Animated gradient along the line
      const grad = ctx.createLinearGradient(ax, ay, bx, by);
      const phase = (Math.sin(t * 2 + a + b) + 1) / 2;
      grad.addColorStop(0, `rgba(99, 102, 241, ${0.03 + phase * 0.08})`);
      grad.addColorStop(0.5, `rgba(99, 102, 241, ${0.08 + phase * 0.12})`);
      grad.addColorStop(1, `rgba(99, 102, 241, ${0.03 + phase * 0.08})`);

      ctx.beginPath();
      // Curved path with sine wave
      const mx = (ax + bx) / 2 + Math.sin(t + a * 2) * 20;
      const my = (ay + by) / 2 + Math.cos(t + b * 2) * 15;
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(mx, my, bx, by);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Animated dots traveling along connections
    for (const [a, b] of pairs.slice(0, 4)) {
      if (!points[a] || !points[b]) continue;
      const progress = (Math.sin(t * 1.5 + a * 1.3 + b * 0.7) + 1) / 2;
      const dx = points[a].x + (points[b].x - points[a].x) * progress;
      const dy = points[a].y + (points[b].y - points[a].y) * progress;

      // Glow
      const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 12);
      glow.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.beginPath();
      ctx.arc(dx, dy, 12, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (inView) {
      rafRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, draw]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export function SwissSection({ translations: t }: SwissSectionProps) {
  return (
    <section id="swiss" className="relative bg-ensemble-50 py-24 sm:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <motion.h2
          className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 text-center sm:text-4xl lg:text-5xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.title}
        </motion.h2>

        <div className="relative mt-16">
          {/* Animated connection lines between cards */}
          <ConnectionCanvas />

          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative rounded-2xl border border-ensemble-200 bg-white/80 backdrop-blur-sm shadow-sm p-6 transition-all hover:border-accent-300 hover:shadow-lg hover:shadow-accent-500/5 hover:-translate-y-1"
              >
                {/* Glow on hover */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-accent-500/10 via-transparent to-accent-500/5" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500 transition-all group-hover:bg-accent-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent-500/25">
                    {cardIcons[i]}
                  </div>
                  <h3 className="text-base font-semibold text-ensemble-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ensemble-500">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
