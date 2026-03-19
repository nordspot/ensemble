'use client';

import { motion } from 'framer-motion';

interface FeatureShowcaseProps {
  translations: {
    section1Title: string;
    section1Items: string[];
    section2Title: string;
    section2Items: string[];
    section3Title: string;
    section3Items: string[];
  };
}

function LiveDashboardMockup() {
  return (
    <div className="rounded-xl border border-ensemble-700/50 bg-ensemble-800/60 p-4 backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
        <span className="text-[10px] font-mono text-accent-400">LIVE</span>
        <div className="ml-auto flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 w-6 rounded-full bg-ensemble-700" />
          ))}
        </div>
      </div>
      {/* Transcript lines */}
      <div className="space-y-1.5 mb-3">
        {['Die Ergebnisse der Studie zeigen...', 'Signifikante Verbesserung bei...', 'Im Vergleich zur Kontrollgruppe...'].map((line, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-[8px] text-ensemble-600 font-mono mt-0.5 shrink-0">
              {`0${i + 1}:${2 + i}${3 + i}`}
            </span>
            <div className="text-[10px] text-ensemble-400 leading-tight">{line}</div>
          </div>
        ))}
      </div>
      {/* Q&A bar */}
      <div className="rounded-lg bg-ensemble-900/60 p-2 flex items-center gap-2">
        <div className="text-[9px] text-ensemble-500">Q&A</div>
        <div className="h-4 flex-1 rounded bg-ensemble-800 flex items-center px-2">
          <span className="text-[8px] text-ensemble-600">Frage stellen...</span>
        </div>
        <div className="flex gap-0.5">
          {['24', '8'].map((n, i) => (
            <span key={i} className="text-[8px] bg-ensemble-700/60 rounded px-1 py-0.5 text-ensemble-400">{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndoorMapMockup() {
  return (
    <div className="rounded-xl border border-ensemble-700/50 bg-ensemble-800/60 p-4 backdrop-blur-sm">
      {/* Floor selector */}
      <div className="flex gap-1 mb-3">
        {['EG', 'OG1', 'OG2'].map((f, i) => (
          <div
            key={f}
            className={`text-[9px] px-2 py-0.5 rounded ${i === 0 ? 'bg-accent-500/20 text-accent-400' : 'bg-ensemble-700/40 text-ensemble-500'}`}
          >
            {f}
          </div>
        ))}
      </div>
      {/* Map grid */}
      <div className="relative h-28 rounded-lg bg-ensemble-900/40 overflow-hidden">
        <div className="absolute inset-2 grid grid-cols-4 grid-rows-3 gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${[2, 5, 8].includes(i) ? 'bg-ensemble-600/30' : 'bg-ensemble-700/20'}`}
            />
          ))}
        </div>
        {/* Blue dot */}
        <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
          <span className="block h-4 w-4 rounded-full bg-blue-500/30 animate-ping absolute -top-0.5 -left-0.5" />
          <span className="block h-3 w-3 rounded-full bg-blue-500 border-2 border-blue-300 relative" />
        </div>
        {/* Route line */}
        <svg className="absolute inset-0" viewBox="0 0 200 112" fill="none">
          <path
            d="M80 56 L120 56 L120 28 L160 28"
            stroke="rgba(96,165,250,0.4)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </svg>
      </div>
      {/* Destination */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
        <span className="text-[9px] text-ensemble-400">Saal 3 &middot; 2 Min</span>
      </div>
    </div>
  );
}

function AiChatMockup() {
  return (
    <div className="rounded-xl border border-ensemble-700/50 bg-ensemble-800/60 p-4 backdrop-blur-sm">
      {/* Question */}
      <div className="flex gap-2 items-start mb-3">
        <div className="h-5 w-5 rounded-full bg-ensemble-600/40 shrink-0 mt-0.5" />
        <div className="rounded-lg bg-ensemble-700/40 px-3 py-1.5 text-[10px] text-ensemble-300">
          Welche Studien wurden heute zu Immuntherapie vorgestellt?
        </div>
      </div>
      {/* AI answer */}
      <div className="flex gap-2 items-start">
        <div className="h-5 w-5 rounded bg-accent-500/20 shrink-0 mt-0.5 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-accent-500" fill="currentColor">
            <circle cx="8" cy="8" r="3" />
            <circle cx="8" cy="2" r="1" />
            <circle cx="8" cy="14" r="1" />
            <circle cx="2" cy="8" r="1" />
            <circle cx="14" cy="8" r="1" />
          </svg>
        </div>
        <div className="rounded-lg bg-ensemble-900/60 px-3 py-2 text-[10px] text-ensemble-300 leading-relaxed">
          <p>Heute wurden 3 relevante Studien vorgestellt:</p>
          <ol className="mt-1 ml-3 space-y-0.5 list-decimal">
            <li>CheckMate-901 (Saal 1, 09:30)</li>
            <li>KEYNOTE-789 (Saal 2, 11:00)</li>
            <li>IMbrave150 Update (Poster #42)</li>
          </ol>
          {/* Sources */}
          <div className="mt-2 flex gap-1">
            {['Abstract #12', 'Session B3'].map((s, i) => (
              <span key={i} className="text-[8px] bg-ensemble-700/60 rounded px-1.5 py-0.5 text-ensemble-500">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBlock({
  title,
  items,
  visual,
  reverse,
  index,
}: {
  title: string;
  items: string[];
  visual: React.ReactNode;
  reverse: boolean;
  index: number;
}) {
  return (
    <div className={`flex flex-col gap-8 lg:gap-16 ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
      {/* Text */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h3>
        <ul className="mt-6 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-ensemble-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shrink-0" />
              <span className="text-sm sm:text-base">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Visual */}
      <motion.div
        className="flex-1 w-full max-w-md lg:max-w-none"
        initial={{ opacity: 0, x: reverse ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {visual}
      </motion.div>
    </div>
  );
}

export function FeatureShowcase({ translations: t }: FeatureShowcaseProps) {
  const sections = [
    { title: t.section1Title, items: t.section1Items, visual: <LiveDashboardMockup /> },
    { title: t.section2Title, items: t.section2Items, visual: <IndoorMapMockup /> },
    { title: t.section3Title, items: t.section3Items, visual: <AiChatMockup /> },
  ];

  return (
    <section className="relative bg-ensemble-900 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-24 sm:space-y-32">
        {sections.map((section, i) => (
          <FeatureBlock
            key={i}
            index={i}
            title={section.title}
            items={section.items}
            visual={section.visual}
            reverse={i % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}
