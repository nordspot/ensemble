'use client';

import { motion } from 'framer-motion';

interface PlatformSectionProps {
  translations: {
    title: string;
    subtitle: string;
    programSessions: string;
    liveStreaming: string;
    bleNavigation: string;
    aiKnowledge: string;
    nfcBadges: string;
    realtimeChat: string;
    gamification: string;
    cmeCertificates: string;
  };
}

function ScheduleVisual() {
  return (
    <div className="mt-4 space-y-2">
      {[
        { w: '80%', color: 'bg-accent-500/60', label: '09:00' },
        { w: '65%', color: 'bg-ensemble-500/50', label: '10:30' },
        { w: '90%', color: 'bg-accent-500/40', label: '11:00' },
        { w: '55%', color: 'bg-ensemble-400/40', label: '13:00' },
        { w: '75%', color: 'bg-accent-500/30', label: '14:30' },
        { w: '60%', color: 'bg-ensemble-500/30', label: '16:00' },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-ensemble-500 w-8 shrink-0">{row.label}</span>
          <div className={`h-2 rounded-full ${row.color}`} style={{ width: row.w }} />
        </div>
      ))}
    </div>
  );
}

function WaveformVisual() {
  return (
    <div className="mt-4 flex items-end gap-[3px] h-12">
      {Array.from({ length: 32 }).map((_, i) => {
        const height = Math.sin(i * 0.4) * 30 + Math.random() * 15 + 8;
        return (
          <div
            key={i}
            className="w-1 rounded-full bg-accent-500/50"
            style={{ height: `${height}%`, minHeight: 3 }}
          />
        );
      })}
    </div>
  );
}

function MapDotVisual() {
  return (
    <div className="mt-4 relative h-16">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 gap-px opacity-20">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="border border-ensemble-600 rounded-sm" />
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="block h-3 w-3 rounded-full bg-accent-500 animate-ping absolute" />
        <span className="block h-3 w-3 rounded-full bg-accent-500 relative" />
      </div>
    </div>
  );
}

function BrainVisual() {
  return (
    <div className="mt-3 flex items-center justify-center h-12">
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-accent-500/60" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="24" cy="24" r="8" />
        <circle cx="12" cy="16" r="3" />
        <circle cx="36" cy="16" r="3" />
        <circle cx="12" cy="32" r="3" />
        <circle cx="36" cy="32" r="3" />
        <line x1="18" y1="20" x2="15" y2="17" />
        <line x1="30" y1="20" x2="33" y2="17" />
        <line x1="18" y1="28" x2="15" y2="31" />
        <line x1="30" y1="28" x2="33" y2="31" />
      </svg>
    </div>
  );
}

function TapVisual() {
  return (
    <div className="mt-3 flex items-center justify-center h-12">
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-accent-500/60" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="14" y="8" width="20" height="32" rx="3" />
        <circle cx="24" cy="30" r="4" />
        <path d="M18 4 C18 4 24 0 30 4" opacity="0.4" />
        <path d="M16 2 C16 2 24 -3 32 2" opacity="0.2" />
      </svg>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2 items-start">
        <div className="h-5 w-5 rounded-full bg-accent-500/40 shrink-0 mt-0.5" />
        <div className="rounded-lg rounded-tl-none bg-ensemble-700/60 px-3 py-1.5 text-[10px] text-ensemble-300">
          Wie war die Keynote heute Morgen?
        </div>
      </div>
      <div className="flex gap-2 items-start justify-end">
        <div className="rounded-lg rounded-tr-none bg-accent-500/20 px-3 py-1.5 text-[10px] text-ensemble-300">
          Ausgezeichnet! Die Live-Q&A war besonders gut.
        </div>
        <div className="h-5 w-5 rounded-full bg-ensemble-500/40 shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex -space-x-1">
          {[0.6, 0.4, 0.3].map((op, i) => (
            <div key={i} className="h-4 w-4 rounded-full border border-ensemble-800" style={{ backgroundColor: `rgba(232,89,60,${op})` }} />
          ))}
        </div>
        <span className="text-[9px] text-ensemble-500">142 aktiv</span>
      </div>
    </div>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function PlatformSection({ translations: t }: PlatformSectionProps) {
  const cards = [
    { title: t.programSessions, visual: <ScheduleVisual />, span: 'sm:row-span-2' },
    { title: t.liveStreaming, visual: <WaveformVisual />, span: '' },
    { title: t.bleNavigation, visual: <MapDotVisual />, span: '' },
    { title: t.aiKnowledge, visual: <BrainVisual />, span: '' },
    { title: t.nfcBadges, visual: <TapVisual />, span: '' },
    { title: t.realtimeChat, visual: <ChatVisual />, span: 'sm:col-span-2' },
    { title: t.gamification, visual: null, span: '' },
    { title: t.cmeCertificates, visual: null, span: '' },
  ];

  return (
    <section id="platform" className="relative bg-ensemble-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-ensemble-400">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-min"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.07 }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className={`group relative rounded-2xl border border-ensemble-700/40 bg-ensemble-800/30 p-6 backdrop-blur-sm transition-all hover:border-ensemble-600/60 hover:bg-ensemble-800/50 ${card.span}`}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-accent-500/5 to-transparent" />

              <h3 className="relative text-sm font-semibold text-ensemble-200 tracking-wide">
                {card.title}
              </h3>

              {card.visual && (
                <div className="relative">{card.visual}</div>
              )}

              {!card.visual && (
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-1 flex-1 rounded-full bg-ensemble-700/60"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
