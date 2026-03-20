'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface FeatureShowcaseProps {
  translations: {
    section1TitleLine1: string;
    section1TitleLine2: string;
    section1Items: string[];
    section2TitleLine1: string;
    section2TitleLine2: string;
    section2Items: string[];
    section3TitleLine1: string;
    section3TitleLine2: string;
    section3Items: string[];
    section4TitleLine1: string;
    section4TitleLine2: string;
    section4Items: string[];
    section5TitleLine1: string;
    section5TitleLine2: string;
    section5Items: string[];
    allFeaturesLink: string;
  };
}

// ── Section 1: Live Dashboard ──────────────────────────────────────────

function LiveDashboardMockup() {
  return (
    <div className="rounded-xl border border-ensemble-200 bg-white p-5 shadow-xl">
      {/* Session header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-[9px] font-semibold text-red-500 uppercase tracking-wider">Live</span>
        </div>
        <div className="ml-auto text-[8px] text-ensemble-400 font-mono">09:32</div>
      </div>

      {/* Session title */}
      <div className="mb-4">
        <h4 className="text-[12px] font-semibold text-ensemble-900 leading-tight">
          Keynote: Die Zukunft der Kardiologie
        </h4>
        <p className="text-[10px] text-ensemble-500 mt-0.5">Prof. Dr. Thomas Muller &middot; Grosser Saal</p>
      </div>

      {/* Transcript preview */}
      <div className="rounded-lg bg-ensemble-50 p-3 mb-3 border border-ensemble-100">
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="h-3 w-3 text-ensemble-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[8px] font-medium text-ensemble-500 uppercase tracking-wider">Transkription</span>
        </div>
        <div className="space-y-1.5">
          {[
            { time: '09:30', text: 'Die interventionelle Kardiologie steht vor einem Paradigmenwechsel...' },
            { time: '09:31', text: 'Katheterbasierte Verfahren ermoglichen heute minimalinvasive Eingriffe...' },
            { time: '09:32', text: 'Unsere multizentrische Studie mit 2.400 Patienten zeigt signifikante...' },
          ].map((line, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[7px] text-ensemble-400 font-mono mt-0.5 shrink-0 w-7">{line.time}</span>
              <p className="text-[9px] text-ensemble-700 leading-relaxed">{line.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Q&A sidebar preview */}
      <div className="rounded-lg bg-ensemble-50 p-3 mb-3 border border-ensemble-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-medium text-ensemble-500 uppercase tracking-wider">Q&A</span>
          <span className="text-[8px] text-ensemble-400">12 Fragen</span>
        </div>
        <div className="space-y-2">
          {[
            { q: 'Welche Langzeitdaten liegen zur TAVI vor?', votes: 24 },
            { q: 'Gibt es Kontraindikationen bei Multimorbiditat?', votes: 18 },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex flex-col items-center shrink-0">
                <svg className="h-3 w-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-[8px] font-medium text-accent-500">{item.votes}</span>
              </div>
              <p className="text-[9px] text-ensemble-700 leading-tight">{item.q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reaction bar */}
      <div className="flex items-center gap-2 pt-1">
        {[
          { emoji: '\uD83D\uDC4F', count: 142 },
          { emoji: '\uD83D\uDCA1', count: 38 },
          { emoji: '\u2764\uFE0F', count: 67 },
          { emoji: '\uD83D\uDE4F', count: 12 },
        ].map((reaction, i) => (
          <div key={i} className="flex items-center gap-1 rounded-full bg-ensemble-50 border border-ensemble-200 px-2 py-0.5">
            <span className="text-[10px]">{reaction.emoji}</span>
            <span className="text-[8px] text-ensemble-500 font-medium">{reaction.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section 2: Indoor Map ──────────────────────────────────────────────

function IndoorMapMockup() {
  return (
    <div className="rounded-xl border border-ensemble-200 bg-white p-5 shadow-xl">
      {/* Floor selector */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-[8px] text-ensemble-500 font-medium mr-2">Stockwerk:</span>
        {['EG', 'OG1'].map((f, i) => (
          <button
            key={f}
            className={`text-[9px] px-2.5 py-1 rounded-md font-medium transition-colors ${
              i === 0
                ? 'bg-accent-500 text-white shadow-sm'
                : 'bg-ensemble-100 text-ensemble-500 hover:bg-ensemble-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SVG Floor Plan */}
      <div className="relative rounded-lg bg-ensemble-50 border border-ensemble-100 overflow-hidden">
        <svg viewBox="0 0 400 240" className="w-full h-auto" fill="none">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(226 232 240)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="url(#grid)" />

          {/* Main Hall */}
          <rect x="20" y="20" width="180" height="120" rx="4" fill="rgb(241 245 249)" stroke="rgb(148 163 184)" strokeWidth="1.5" />
          <text x="110" y="75" textAnchor="middle" className="text-[11px] font-semibold" fill="rgb(71 85 105)">Grosser Saal</text>
          <text x="110" y="90" textAnchor="middle" className="text-[8px]" fill="rgb(148 163 184)">480 Platze</text>
          <rect x="40" y="30" width="140" height="12" rx="2" fill="rgb(226 232 240)" />
          <text x="110" y="39" textAnchor="middle" className="text-[7px]" fill="rgb(148 163 184)">Buhne</text>

          {/* Corridor */}
          <rect x="200" y="40" width="40" height="160" fill="rgb(248 250 252)" stroke="rgb(203 213 225)" strokeWidth="1" strokeDasharray="4 2" />
          <text x="220" y="125" textAnchor="middle" className="text-[7px]" fill="rgb(203 213 225)" transform="rotate(-90, 220, 125)">Korridor</text>

          {/* Saal A */}
          <rect x="250" y="20" width="130" height="70" rx="4" fill="rgb(241 245 249)" stroke="rgb(148 163 184)" strokeWidth="1.5" />
          <text x="315" y="52" textAnchor="middle" className="text-[10px] font-semibold" fill="rgb(71 85 105)">Saal A</text>
          <text x="315" y="65" textAnchor="middle" className="text-[8px]" fill="rgb(148 163 184)">120 Platze</text>

          {/* Saal B */}
          <rect x="250" y="100" width="130" height="60" rx="4" fill="rgb(241 245 249)" stroke="rgb(148 163 184)" strokeWidth="1.5" />
          <text x="315" y="128" textAnchor="middle" className="text-[10px] font-semibold" fill="rgb(71 85 105)">Saal B</text>
          <text x="315" y="141" textAnchor="middle" className="text-[8px]" fill="rgb(148 163 184)">80 Platze</text>

          {/* Registration desk */}
          <rect x="20" y="180" width="80" height="40" rx="4" fill="rgb(254 243 199)" stroke="rgb(251 191 36)" strokeWidth="1" />
          <text x="60" y="198" textAnchor="middle" className="text-[8px] font-medium" fill="rgb(161 98 7)">Registration</text>
          <text x="60" y="210" textAnchor="middle" className="text-[7px]" fill="rgb(202 138 4)">Eingang</text>

          {/* Exhibitor area */}
          <rect x="120" y="155" width="80" height="65" rx="4" fill="rgb(219 234 254)" stroke="rgb(96 165 250)" strokeWidth="1" />
          <text x="160" y="172" textAnchor="middle" className="text-[8px] font-medium" fill="rgb(37 99 235)">Aussteller</text>
          {[0, 1, 2, 3, 4, 5].map((b) => (
            <rect
              key={b}
              x={130 + (b % 3) * 22}
              y={178 + Math.floor(b / 3) * 18}
              width="16"
              height="12"
              rx="2"
              fill="rgb(191 219 254)"
              stroke="rgb(147 197 253)"
              strokeWidth="0.5"
            />
          ))}

          {/* You are here - pulsing blue dot */}
          <circle cx="160" cy="140" r="10" fill="rgb(59 130 246)" opacity="0.15">
            <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="140" r="5" fill="rgb(59 130 246)" stroke="white" strokeWidth="2" />

          {/* Route line from dot to Saal A */}
          <path
            d="M165 140 L220 140 L220 55 L250 55"
            stroke="rgb(59 130 246)"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.6"
          >
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.5s" repeatCount="indefinite" />
          </path>

          {/* Route destination marker */}
          <circle cx="250" cy="55" r="4" fill="rgb(59 130 246)" opacity="0.3" />
          <circle cx="250" cy="55" r="2" fill="rgb(59 130 246)" />
        </svg>
      </div>

      {/* Navigation info */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[9px] text-ensemble-600 font-medium">Ihr Standort</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-ensemble-500">
          <svg className="h-3 w-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Saal A &middot; 2 Min Fussweg</span>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: AI Chat ─────────────────────────────────────────────────

function AiChatMockup() {
  return (
    <div className="rounded-xl border border-ensemble-200 bg-white p-5 shadow-xl">
      {/* Chat header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ensemble-100">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="currentColor">
            <circle cx="8" cy="8" r="2.5" />
            <circle cx="8" cy="2.5" r="1.2" />
            <circle cx="8" cy="13.5" r="1.2" />
            <circle cx="2.5" cy="8" r="1.2" />
            <circle cx="13.5" cy="8" r="1.2" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-ensemble-900">Ensemble KI-Assistent</span>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] text-ensemble-400">Bereit</span>
          </div>
        </div>
      </div>

      {/* User question */}
      <div className="flex gap-2 items-start mb-4">
        <div className="h-6 w-6 rounded-full bg-ensemble-200 shrink-0 flex items-center justify-center">
          <span className="text-[8px] font-medium text-ensemble-600">TM</span>
        </div>
        <div className="rounded-xl rounded-tl-sm bg-ensemble-100 px-3.5 py-2 text-[10px] text-ensemble-800 leading-relaxed">
          Welche neuen Ergebnisse zur katheterbasierten Mitralklappentherapie wurden heute prasentiert?
        </div>
      </div>

      {/* AI response */}
      <div className="flex gap-2 items-start mb-3">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="currentColor">
            <circle cx="8" cy="8" r="2" />
          </svg>
        </div>
        <div className="rounded-xl rounded-tl-sm bg-accent-500/5 border border-accent-500/10 px-3.5 py-2.5 text-[10px] text-ensemble-800 leading-relaxed flex-1">
          <p className="font-medium mb-1.5">Heute wurden 3 relevante Prasentationen vorgestellt:</p>
          <ul className="space-y-1.5 ml-0.5">
            <li className="flex gap-2">
              <span className="text-accent-500 font-bold shrink-0">&bull;</span>
              <span><strong>CLASP IID-Studie</strong> (09:30, Grosser Saal): Signifikante Reduktion der Mitralregurgitation um 72% nach 2 Jahren</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent-500 font-bold shrink-0">&bull;</span>
              <span><strong>EXPAND-Registerstudie</strong> (11:00, Saal A): Langzeitdaten zu TEER bei 1.800 Patienten</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent-500 font-bold shrink-0">&bull;</span>
              <span><strong>Poster #47</strong>: Neuer Device-Prototyp fur sekundare MR</span>
            </li>
          </ul>

          {/* Source badges */}
          <div className="mt-3 pt-2 border-t border-accent-500/10">
            <span className="text-[8px] text-ensemble-400 font-medium uppercase tracking-wider">Quellen:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {[
                { label: 'Abstract #12', color: 'bg-accent-500/10 text-accent-600' },
                { label: 'Session A1', color: 'bg-ensemble-100 text-ensemble-600' },
                { label: 'Poster #47', color: 'bg-blue-50 text-blue-600' },
              ].map((s, i) => (
                <span key={i} className={`text-[8px] font-medium rounded-md px-2 py-0.5 ${s.color}`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 4: Registration + Badge ────────────────────────────────────

function RegistrationMockup() {
  return (
    <div className="rounded-xl border border-ensemble-200 bg-white p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ensemble-100">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="2" width="10" height="12" rx="1.5" />
            <path d="M6 5h4M6 7.5h4M6 10h2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-ensemble-900">Fachkongress-Anmeldung</span>
          <span className="text-[8px] text-ensemble-400 block">Swiss Cardiology Congress 2026</span>
        </div>
      </div>

      {/* Ticket selection */}
      <div className="space-y-2 mb-4">
        <span className="text-[8px] font-medium text-ensemble-500 uppercase tracking-wider">Ticket wahlen</span>
        {[
          { label: 'Standard', price: 'CHF 450', selected: false },
          { label: 'VIP', price: 'CHF 890', selected: true },
          { label: 'Virtuell', price: 'CHF 190', selected: false },
        ].map((ticket, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${
              ticket.selected
                ? 'border-accent-500 bg-accent-500/5'
                : 'border-ensemble-200 hover:border-ensemble-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                ticket.selected ? 'border-accent-500' : 'border-ensemble-300'
              }`}>
                {ticket.selected && <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
              </div>
              <span className={`text-[10px] font-medium ${ticket.selected ? 'text-accent-600' : 'text-ensemble-700'}`}>
                {ticket.label}
              </span>
            </div>
            <span className={`text-[10px] font-semibold ${ticket.selected ? 'text-accent-600' : 'text-ensemble-500'}`}>
              {ticket.price}
            </span>
          </div>
        ))}
      </div>

      {/* Badge preview */}
      <div className="rounded-lg bg-ensemble-50 border border-ensemble-100 p-3">
        <span className="text-[8px] font-medium text-ensemble-500 uppercase tracking-wider">Badge-Vorschau</span>
        <div className="mt-2 flex items-center gap-3">
          {/* QR code mockup */}
          <div className="h-14 w-14 rounded-md bg-white border border-ensemble-200 p-1 shrink-0">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              {/* Simplified QR pattern */}
              <rect x="2" y="2" width="10" height="10" fill="rgb(30 41 59)" rx="1" />
              <rect x="28" y="2" width="10" height="10" fill="rgb(30 41 59)" rx="1" />
              <rect x="2" y="28" width="10" height="10" fill="rgb(30 41 59)" rx="1" />
              <rect x="4" y="4" width="6" height="6" fill="white" rx="0.5" />
              <rect x="30" y="4" width="6" height="6" fill="white" rx="0.5" />
              <rect x="4" y="30" width="6" height="6" fill="white" rx="0.5" />
              <rect x="6" y="6" width="2" height="2" fill="rgb(30 41 59)" />
              <rect x="32" y="6" width="2" height="2" fill="rgb(30 41 59)" />
              <rect x="6" y="32" width="2" height="2" fill="rgb(30 41 59)" />
              {/* Data cells */}
              {[14,16,18,20,22,24].map((x) => (
                [14,16,18,20,22,24].map((y) => (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width="1.5"
                    height="1.5"
                    fill={Math.random() > 0.4 ? 'rgb(30 41 59)' : 'transparent'}
                  />
                ))
              ))}
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-ensemble-900">Dr. Lisa Schneider</p>
            <p className="text-[9px] text-ensemble-500">Kantonsspital Zurich</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[8px] font-medium text-white bg-accent-500 rounded px-1.5 py-0.5">VIP</span>
              <span className="text-[8px] text-ensemble-400">Ticket #2847</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 5: Gamification + Networking ───────────────────────────────

function EngagementMockup() {
  return (
    <div className="rounded-xl border border-ensemble-200 bg-white p-5 shadow-xl">
      {/* Leaderboard header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ensemble-100">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="currentColor">
            <path d="M8 1l2 4.1 4.5.65-3.25 3.17.77 4.48L8 11.27 3.98 13.4l.77-4.48L1.5 5.75 6 5.1z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-ensemble-900">Bestenliste</span>
          <span className="text-[8px] text-ensemble-400 block">Heute</span>
        </div>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-2 mb-4">
        {[
          { rank: 1, name: 'Dr. M. Weber', pts: 3120, medal: 'text-yellow-500', bg: 'bg-yellow-50' },
          { rank: 2, name: 'Prof. A. Fischer', pts: 2840, medal: 'text-ensemble-400', bg: 'bg-ensemble-50' },
          { rank: 3, name: 'Dr. T. Muller', pts: 2650, medal: 'text-orange-400', bg: 'bg-orange-50' },
        ].map((entry) => (
          <div key={entry.rank} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${entry.bg}`}>
            <span className={`text-[11px] font-bold ${entry.medal} w-4 text-center`}>{entry.rank}</span>
            <div className="h-6 w-6 rounded-full bg-ensemble-200 shrink-0 flex items-center justify-center">
              <span className="text-[7px] font-medium text-ensemble-600">{entry.name.split(' ').pop()?.[0]}</span>
            </div>
            <span className="text-[10px] font-medium text-ensemble-800 flex-1">{entry.name}</span>
            <span className="text-[9px] font-mono font-semibold text-ensemble-500">{entry.pts} Pkt</span>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="rounded-lg bg-accent-500/5 border border-accent-500/15 p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="h-3.5 w-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-[9px] font-semibold text-accent-600">Empfehlungslink</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md bg-white border border-ensemble-200 px-2.5 py-1.5">
            <span className="text-[8px] font-mono text-ensemble-500 truncate block">ensemble.events/ref/dr-schneider</span>
          </div>
          <button className="text-[8px] font-medium text-white bg-accent-500 rounded-md px-2.5 py-1.5 hover:bg-accent-600 transition-colors">
            Kopieren
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[8px] text-ensemble-500">12 Klicks</span>
          <span className="text-[8px] text-ensemble-500">3 Anmeldungen</span>
          <span className="text-[8px] text-accent-600 font-medium">+150 Pkt</span>
        </div>
      </div>

      {/* NFC contact card preview */}
      <div className="rounded-lg bg-ensemble-50 border border-ensemble-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <svg className="h-3.5 w-3.5 text-ensemble-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
          </svg>
          <span className="text-[9px] font-medium text-ensemble-600">NFC-Kontakttausch</span>
        </div>
        <p className="text-[8px] text-ensemble-400">Badge an Badge halten zum sofortigen Austausch der Kontaktdaten.</p>
      </div>
    </div>
  );
}

// ── Feature Block Layout ───────────────────────────────────────────────

function FeatureBlock({
  titleLine1,
  titleLine2,
  items,
  visual,
  reverse,
}: {
  titleLine1: string;
  titleLine2: string;
  items: string[];
  visual: React.ReactNode;
  reverse: boolean;
  index: number;
}) {
  return (
    <div className={`flex flex-col gap-8 lg:gap-16 ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
      {/* Visual - on mobile, show first */}
      <motion.div
        className="flex-1 w-full max-w-md lg:max-w-none order-first lg:order-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {visual}
      </motion.div>

      {/* Text */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading text-4xl font-bold text-ensemble-900 sm:text-5xl lg:text-6xl">
          {titleLine1}
          <br />
          <span className="text-accent-500">{titleLine2}</span>
        </h2>
        <ul className="mt-6 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-ensemble-600">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shrink-0" />
              <span className="text-sm sm:text-base">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export function FeatureShowcase({ translations: t }: FeatureShowcaseProps) {
  const sections = [
    { titleLine1: t.section1TitleLine1, titleLine2: t.section1TitleLine2, items: t.section1Items, visual: <LiveDashboardMockup /> },
    { titleLine1: t.section2TitleLine1, titleLine2: t.section2TitleLine2, items: t.section2Items, visual: <IndoorMapMockup /> },
    { titleLine1: t.section3TitleLine1, titleLine2: t.section3TitleLine2, items: t.section3Items, visual: <AiChatMockup /> },
    { titleLine1: t.section4TitleLine1, titleLine2: t.section4TitleLine2, items: t.section4Items, visual: <RegistrationMockup /> },
    { titleLine1: t.section5TitleLine1, titleLine2: t.section5TitleLine2, items: t.section5Items, visual: <EngagementMockup /> },
  ];

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-24 sm:space-y-32">
        {sections.map((section, i) => (
          <FeatureBlock
            key={i}
            index={i}
            titleLine1={section.titleLine1}
            titleLine2={section.titleLine2}
            items={section.items}
            visual={section.visual}
            reverse={i % 2 === 1}
          />
        ))}

        {/* All features link */}
        <motion.div
          className="text-center pt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/funktionen"
            className="inline-flex items-center gap-2 text-lg font-semibold text-accent-500 hover:text-accent-600 transition-colors group"
          >
            {t.allFeaturesLink}
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
