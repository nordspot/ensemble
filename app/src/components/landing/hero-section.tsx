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
    { time: '10:30', track: 0, title: 'Neue Therapieansatze', speaker: 'Dr. A. Weber', room: 'Saal A', color: 'bg-ensemble-500', textColor: 'text-white', span: 1 },
    { time: '10:30', track: 1, title: 'Workshop: KI-Diagnostik', speaker: 'Dr. L. Fischer', room: 'Saal B', color: 'bg-blue-500', textColor: 'text-white', span: 1 },
    { time: '10:30', track: 2, title: 'Poster Session', speaker: 'Diverse', room: 'Foyer', color: 'bg-ensemble-200', textColor: 'text-ensemble-700', span: 1 },
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
        className="relative rounded-xl border border-ensemble-200 bg-white shadow-xl overflow-hidden"
        style={{
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
            <span className="text-[9px] text-ensemble-500">app.ensemble.swiss/programm</span>
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
                <h4 className="text-[10px] sm:text-[11px] font-semibold text-ensemble-900">Kongress-Programm</h4>
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
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5">
        <Link href="/" className="shrink-0">
          <EnsembleLogo className="h-7 sm:h-8" variant="light" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#platform" className="text-sm font-medium text-ensemble-600 hover:text-ensemble-900 transition-colors">
            {t.navPlatform}
          </a>
          <a href="#stats" className="text-sm font-medium text-ensemble-600 hover:text-ensemble-900 transition-colors">
            {t.navPricing}
          </a>
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
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-600 active:scale-[0.97]"
          >
            {t.navDemo}
          </Link>
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
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ensemble-500 sm:text-xl"
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
              className="inline-flex items-center justify-center rounded-lg bg-accent-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.97]"
            >
              {t.ctaPrimary}
            </Link>
            <a
              href="#platform"
              className="inline-flex items-center justify-center rounded-lg border border-ensemble-300 px-8 py-3.5 text-base font-semibold text-ensemble-700 transition-all hover:border-ensemble-400 hover:text-ensemble-900 active:scale-[0.97]"
            >
              {t.ctaSecondary}
            </a>
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
