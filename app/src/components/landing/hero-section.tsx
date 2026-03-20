'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { EnsembleLogo } from './ensemble-logo';

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

function DashboardPreview() {
  const sessions = [
    // 09:00 row
    { time: '09:00', track: 0, title: 'Keynote: Zukunft der Kardiologie', speaker: 'Prof. Dr. T. Muller', room: 'Grosser Saal', color: 'bg-accent-500', textColor: 'text-white', span: 3 },
    // 10:30 row
    { time: '10:30', track: 0, title: 'Neue Therapieansätze', speaker: 'Dr. A. Weber', room: 'Saal A', color: 'bg-emerald-500', textColor: 'text-white', span: 1 },
    { time: '10:30', track: 1, title: 'Workshop: KI-Diagnostik', speaker: 'Dr. L. Fischer', room: 'Saal B', color: 'bg-blue-500', textColor: 'text-white', span: 1 },
    { time: '10:30', track: 2, title: 'Poster Session', speaker: 'Diverse', room: 'Foyer', color: 'bg-violet-100', textColor: 'text-violet-700', span: 1 },
    // 12:00 row
    { time: '12:00', track: 0, title: 'Mittagspause & Networking', speaker: '', room: 'Foyer', color: 'bg-ensemble-100', textColor: 'text-ensemble-500', span: 3 },
    // 14:00 row
    { time: '14:00', track: 0, title: 'Podiumsdiskussion', speaker: 'Panel', room: 'Grosser Saal', color: 'bg-accent-500', textColor: 'text-white', span: 2 },
    { time: '14:00', track: 2, title: 'Live-OP Stream', speaker: 'Prof. Dr. S. Koch', room: 'Saal C', color: 'bg-blue-500', textColor: 'text-white', span: 1 },
  ];

  const timeSlots = ['09:00', '10:30', '12:00', '14:00'];
  const tracks = ['Track 1', 'Track 2', 'Track 3'];

  return (
    <motion.div
      className="mx-auto mt-16 max-w-4xl px-4 sm:mt-20"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="relative rounded-xl border border-ensemble-200 bg-white shadow-xl"
        style={{
          perspective: '800px',
          transformStyle: 'preserve-3d',
          transform: 'perspective(1200px) rotateX(3deg)',
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-ensemble-50 border-b border-ensemble-200">
          <div className="h-2.5 w-2.5 rounded-full bg-ensemble-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-3 h-5 flex-1 max-w-[240px] rounded-md bg-ensemble-100 border border-ensemble-200 flex items-center px-2.5">
            <svg className="h-2.5 w-2.5 text-ensemble-400 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[9px] text-ensemble-500">ensemble.events/programm</span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex min-h-[220px] sm:min-h-[280px]">
          {/* Sidebar */}
          <div className="w-12 sm:w-14 shrink-0 bg-ensemble-50 border-r border-ensemble-200 py-3 px-1.5 space-y-3">
            <div className="h-5 w-5 rounded-md bg-accent-500 mx-auto flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">E</span>
            </div>
            <div className="space-y-2.5 pt-1">
              {['Programm', 'Live', 'Karte', 'Chat'].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <div className={`h-4 w-4 rounded ${i === 0 ? 'bg-accent-500/15' : 'bg-ensemble-100'}`} />
                  <span className={`text-[6px] ${i === 0 ? 'text-accent-500 font-medium' : 'text-ensemble-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-3 sm:p-4">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[10px] sm:text-[11px] font-semibold text-ensemble-900">Programm</h4>
                <span className="text-[7px] bg-accent-500/10 text-accent-500 font-medium px-1.5 py-0.5 rounded-full">Tag 1</span>
              </div>
              <div className="ml-auto flex gap-1">
                <div className="h-5 w-12 rounded-md bg-accent-500 flex items-center justify-center">
                  <span className="text-[7px] font-medium text-white">Live</span>
                </div>
              </div>
            </div>

            {/* Schedule grid */}
            <div className="rounded-lg border border-ensemble-100 overflow-hidden">
              {/* Track headers */}
              <div className="grid grid-cols-[40px_1fr_1fr_1fr] sm:grid-cols-[50px_1fr_1fr_1fr] bg-ensemble-50 border-b border-ensemble-100">
                <div className="p-1.5" />
                {tracks.map((track) => (
                  <div key={track} className="p-1.5 text-[7px] sm:text-[8px] font-medium text-ensemble-500 text-center border-l border-ensemble-100">
                    {track}
                  </div>
                ))}
              </div>

              {/* Time rows */}
              {timeSlots.map((time) => {
                const rowSessions = sessions.filter((s) => s.time === time);
                return (
                  <div key={time} className="grid grid-cols-[40px_1fr_1fr_1fr] sm:grid-cols-[50px_1fr_1fr_1fr] border-b border-ensemble-50 last:border-0">
                    <div className="p-1.5 sm:p-2 flex items-start">
                      <span className="text-[7px] sm:text-[8px] font-mono text-ensemble-400">{time}</span>
                    </div>
                    {rowSessions.map((session, si) => (
                      <div
                        key={si}
                        className={`p-1 sm:p-1.5 border-l border-ensemble-100 ${session.span === 3 ? 'col-span-3' : session.span === 2 ? 'col-span-2' : ''}`}
                      >
                        <div className={`${session.color} rounded-md p-1.5 sm:p-2 h-full`}>
                          <div className={`text-[7px] sm:text-[8px] font-medium ${session.textColor} leading-tight truncate`}>
                            {session.title}
                          </div>
                          {session.speaker && (
                            <div className={`text-[6px] sm:text-[7px] ${session.textColor} opacity-75 mt-0.5 truncate`}>
                              {session.speaker}
                            </div>
                          )}
                          <div className={`text-[6px] ${session.textColor} opacity-60 mt-0.5`}>
                            {session.room}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Bottom stats bar */}
            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-ensemble-100">
              <div className="flex -space-x-1.5">
                {[
                  'bg-accent-400', 'bg-ensemble-400', 'bg-blue-400', 'bg-green-400',
                ].map((color, i) => (
                  <div key={i} className={`h-5 w-5 rounded-full ${color} border-2 border-white`} />
                ))}
              </div>
              <div className="flex gap-3 text-[8px] sm:text-[9px] text-ensemble-500">
                <span className="font-medium">248 Teilnehmer</span>
                <span className="text-ensemble-300">&middot;</span>
                <span>12 Sessions</span>
                <span className="text-ensemble-300">&middot;</span>
                <span>5 Raume</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating workshop block - pops out above schedule */}
        <motion.div
          className="absolute z-20"
          style={{
            top: '38%',
            left: '22%',
            width: '38%',
            transform: 'translateZ(60px)',
          }}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: [0, -4, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.5, delay: 1.8 },
            scale: { duration: 0.5, delay: 1.8 },
            y: { duration: 3, delay: 2.3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {/* Glow behind */}
          <div className="absolute -inset-3 rounded-2xl bg-blue-500/20 blur-xl" />
          <div className="relative rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_8px_32px_rgba(59,130,246,0.5)] p-3 sm:p-4">
            {/* Jetzt badge */}
            <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 bg-emerald-500 text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Jetzt
            </div>
            <div className="text-[10px] sm:text-[12px] font-bold text-white leading-tight">
              Workshop: KI-Diagnostik
            </div>
            <div className="text-[8px] sm:text-[9px] text-white/80 mt-1">
              Dr. L. Fischer · Saal B
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-[35%] rounded-full bg-white/80" />
              </div>
              <span className="text-[7px] sm:text-[8px] text-white/70 font-mono">35 min</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function HeroSection({ translations: t }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col bg-white">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-white to-ensemble-50 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <EnsembleLogo className="h-14 sm:h-16" variant="light" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-sm font-medium text-ensemble-600 hover:text-ensemble-900 transition-colors">
              {t.navPlatform}
            </a>
            <Link href="/funktionen" className="text-sm font-medium text-ensemble-600 hover:text-ensemble-900 transition-colors">
              Funktionen
            </Link>
            <a href="#swiss" className="text-sm font-medium text-ensemble-600 hover:text-ensemble-900 transition-colors">
              {t.navAbout}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/anmelden"
              className="hidden sm:block text-sm font-medium text-ensemble-600 hover:text-ensemble-900 transition-colors"
            >
              {t.navLogin}
            </Link>
            <Link
              href="/kontakt"
              className="rounded-full bg-gradient-to-b from-accent-400 to-accent-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.97]"
            >
              {t.navDemo}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ensemble-200 bg-ensemble-100 px-4 py-1.5 text-sm font-medium text-ensemble-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
              {t.eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mt-8 overflow-hidden">
            <motion.h1
              className="font-heading text-5xl font-bold leading-[1.08] tracking-tight text-ensemble-900 sm:text-6xl lg:text-7xl xl:text-8xl"
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
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ensemble-500 sm:max-w-2xl sm:text-lg lg:text-xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
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
              className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-b from-accent-400 to-accent-600 px-8 py-4 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(99,102,241,0.25)] transition-all hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(99,102,241,0.35)] hover:brightness-110 active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t.ctaPrimary}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/funktionen"
              className="inline-flex items-center justify-center rounded-full border-2 border-ensemble-200 bg-white px-8 py-3.5 text-base font-semibold text-ensemble-700 shadow-sm transition-all hover:border-ensemble-300 hover:bg-ensemble-50 hover:shadow-md active:scale-[0.97]"
            >
              {t.ctaSecondary}
            </Link>
          </motion.div>

          {/* Note */}
          <motion.p
            className="mt-5 text-sm text-ensemble-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            {t.ctaNote}
          </motion.p>

          {/* Dashboard preview */}
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
