'use client';

import { motion } from 'framer-motion';

interface PlatformSectionProps {
  translations: {
    titleLine1: string;
    titleLine2: string;
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
        { w: '65%', color: 'bg-ensemble-300/50', label: '10:30' },
        { w: '90%', color: 'bg-accent-500/40', label: '11:00' },
        { w: '55%', color: 'bg-ensemble-300/40', label: '13:00' },
        { w: '75%', color: 'bg-accent-500/30', label: '14:30' },
        { w: '60%', color: 'bg-ensemble-300/30', label: '16:00' },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-ensemble-400 w-8 shrink-0">{row.label}</span>
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
          <div key={i} className="border border-ensemble-300 rounded-sm" />
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
        <div className="rounded-lg rounded-tl-none bg-ensemble-200 px-3 py-1.5 text-[10px] text-ensemble-600">
          Wie war die Keynote heute Morgen?
        </div>
      </div>
      <div className="flex gap-2 items-start justify-end">
        <div className="rounded-lg rounded-tr-none bg-accent-500/20 px-3 py-1.5 text-[10px] text-ensemble-600">
          Ausgezeichnet! Die Live-Q&A war besonders gut.
        </div>
        <div className="h-5 w-5 rounded-full bg-ensemble-300/40 shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex -space-x-1">
          {[0.6, 0.4, 0.3].map((op, i) => (
            <div key={i} className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: `rgba(99,102,241,${op})` }} />
          ))}
        </div>
        <span className="text-[9px] text-ensemble-400">142 aktiv</span>
      </div>
    </div>
  );
}

function GamificationVisual() {
  return (
    <div className="mt-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 20 20" className="h-5 w-5 text-yellow-500/80 shrink-0" fill="currentColor">
          <path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.49L10 13.68l-4.94 2.42L6 10.61l-4-3.9 5.61-.87z" />
        </svg>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-ensemble-200 overflow-hidden">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-yellow-500/60 to-accent-500/50" />
          </div>
        </div>
        <span className="text-[10px] font-mono text-ensemble-400 shrink-0">2&apos;840</span>
      </div>
      <div className="flex gap-2">
        {[
          { icon: '1.', pts: '3120', color: 'text-yellow-500' },
          { icon: '2.', pts: '2840', color: 'text-ensemble-500' },
          { icon: '3.', pts: '2650', color: 'text-accent-400' },
        ].map((entry, i) => (
          <div key={i} className="flex-1 rounded-md bg-ensemble-100 px-2 py-1.5 text-center">
            <span className={`text-[10px] font-semibold ${entry.color}`}>{entry.icon}</span>
            <div className="text-[9px] font-mono text-ensemble-400 mt-0.5">{entry.pts} Pkt</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CmeVisual() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <div className="relative">
        <svg viewBox="0 0 40 40" className="h-10 w-10 text-accent-500/50" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="4" y="6" width="32" height="24" rx="2" />
          <path d="M4 12h32" />
          <circle cx="20" cy="22" r="4" />
          <path d="M17.5 22l1.5 1.5 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-success flex items-center justify-center">
          <svg viewBox="0 0 12 12" className="h-2 w-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6l2.5 2.5 4.5-5" />
          </svg>
        </div>
      </div>
      <div className="flex gap-1.5 items-center">
        <span className="text-[10px] font-medium text-ensemble-400">12 Credits</span>
        <span className="text-ensemble-300">&middot;</span>
        <span className="text-[10px] text-success">Bestanden</span>
      </div>
    </div>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const cardDescriptions: Record<string, string> = {
  programSessions: 'Tagesplan & Agenda',
  liveStreaming: 'Echtzeit-Video',
  bleNavigation: 'Indoor-Wegfindung',
  aiKnowledge: 'Smarte Suche',
  nfcBadges: 'Kontaktlos einchecken',
  realtimeChat: 'Direkt vernetzen',
  gamification: 'Punkte & Ranglisten',
  cmeCertificates: 'Automatisch erfasst',
};

export function PlatformSection({ translations: t }: PlatformSectionProps) {
  const cards = [
    { key: 'programSessions', title: t.programSessions, visual: <ScheduleVisual />, span: 'sm:row-span-2' },
    { key: 'liveStreaming', title: t.liveStreaming, visual: <WaveformVisual />, span: '' },
    { key: 'bleNavigation', title: t.bleNavigation, visual: <MapDotVisual />, span: '' },
    { key: 'aiKnowledge', title: t.aiKnowledge, visual: <BrainVisual />, span: '' },
    { key: 'nfcBadges', title: t.nfcBadges, visual: <TapVisual />, span: '' },
    { key: 'realtimeChat', title: t.realtimeChat, visual: <ChatVisual />, span: 'sm:col-span-2 lg:col-span-2' },
    { key: 'gamification', title: t.gamification, visual: <GamificationVisual />, span: '' },
    { key: 'cmeCertificates', title: t.cmeCertificates, visual: <CmeVisual />, span: '' },
  ];

  return (
    <section id="platform" className="relative bg-ensemble-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 sm:text-4xl lg:text-5xl">
            {t.titleLine1}
            <br />
            <span className="text-accent-500">{t.titleLine2}</span>
          </h2>
          <p className="mt-4 text-lg text-ensemble-500">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-min"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.07 }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.key}
              variants={cardVariant}
              className={`group relative rounded-2xl border border-ensemble-200 bg-white shadow-sm p-7 transition-all hover:border-ensemble-300 hover:shadow-md ${card.span}`}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-accent-500/5 to-transparent" />

              <h3 className="relative text-sm font-semibold text-ensemble-900 tracking-wide">
                {card.title}
              </h3>
              <p className="relative mt-1 text-[11px] text-ensemble-500">
                {cardDescriptions[card.key]}
              </p>

              <div className="relative">{card.visual}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
