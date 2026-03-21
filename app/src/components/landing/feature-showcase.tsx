'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

/* ── Bottom App Nav Bar (shared across mockups) ──────────────────────── */

const navItems = [
  { id: 'programm', label: 'Programm', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
  )},
  { id: 'live', label: 'Live', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" strokeLinecap="round"/></svg>
  )},
  { id: 'karte', label: 'Karte', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round"/><circle cx="12" cy="10" r="3"/></svg>
  )},
  { id: 'chat', label: 'Chat', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { id: 'wissen', label: 'Wissen', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round"/></svg>
  )},
];

function MockupNavBar({ active }: { active: string }) {
  return (
    <div className="absolute bottom-0 inset-x-0 z-30 rounded-b-2xl bg-white border-t border-ensemble-200 px-4 py-3 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = item.id === active;
        return (
          <div key={item.id} className="flex flex-col items-center gap-1">
            <div className={isActive ? 'text-accent-500' : 'text-ensemble-400'}>
              {item.icon}
            </div>
            <span className={`text-[8px] font-semibold ${isActive ? 'text-accent-500' : 'text-ensemble-400'}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
    <div className="max-w-sm mx-auto" style={{ perspective: '1200px' }}>
      <div
        className="relative rounded-2xl border border-ensemble-200 shadow-xl bg-white overflow-hidden pb-14"
        style={{ transform: 'rotateY(6deg) rotateX(2deg)' }}
      >
        <div className="p-5 space-y-4">
          {/* LIVE header */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[9px] font-semibold text-red-500 uppercase tracking-wider">Live</span>
            <span className="ml-auto text-[9px] text-ensemble-400 font-mono">09:32</span>
          </div>

          {/* Session info */}
          <div>
            <h4 className="text-[13px] font-bold text-ensemble-900 leading-tight">
              Keynote: Die Zukunft der Kardiologie
            </h4>
            <p className="text-[10px] text-ensemble-500 mt-1">Prof. Dr. Thomas M&uuml;ller &middot; Grosser Saal</p>
          </div>

          {/* Transcript section */}
          <div>
            <div className="text-[8px] font-medium text-ensemble-400 uppercase tracking-wider mb-2">Transkription</div>
            <div className="space-y-1.5">
              {[
                { time: '09:30', text: 'Die interventionelle Kardiologie hat in den letzten Jahren enorme Fortschritte gemacht...' },
                { time: '09:31', text: 'Besonders die katheterbasierte Mitralklappentherapie zeigt vielversprechende Ergebnisse.' },
                { time: '09:32', text: 'Lassen Sie mich die aktuellen Studiendaten zusammenfassen.' },
              ].map((line, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[8px] font-mono text-ensemble-300 shrink-0 pt-0.5">{line.time}</span>
                  <span className="text-[9px] text-ensemble-600 leading-snug">{line.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-medium text-ensemble-400 uppercase tracking-wider">Q&A</span>
              <span className="text-[8px] text-ensemble-300">12 Fragen</span>
            </div>
            <div className="space-y-1.5">
              {[
                { q: 'Welche Langzeitdaten liegen zur TAVI vor?', votes: 24 },
                { q: 'Gibt es Kontraindikationen bei Multimorbidit\u00e4t?', votes: 18 },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-ensemble-50 px-3 py-2">
                  <div className="flex flex-col items-center shrink-0">
                    <svg className="h-3 w-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-[8px] font-semibold text-accent-500">{item.votes}</span>
                  </div>
                  <p className="text-[9px] text-ensemble-700 leading-snug">{item.q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reaction bar */}
          <div className="flex items-center gap-2">
            {[
              { emoji: '\uD83D\uDC4F', count: 142 },
              { emoji: '\uD83D\uDCA1', count: 38 },
              { emoji: '\u2764\uFE0F', count: 67 },
              { emoji: '\uD83D\uDE4F', count: 12 },
            ].map((reaction, i) => (
              <div key={i} className="flex items-center gap-1 rounded-full bg-ensemble-50 border border-ensemble-200 px-2.5 py-1">
                <span className="text-[10px]">{reaction.emoji}</span>
                <span className="text-[8px] text-ensemble-500 font-medium">{reaction.count}</span>
              </div>
            ))}
          </div>
        </div>

        <MockupNavBar active="live" />
      </div>
    </div>
  );
}

// ── Section 2: Indoor Map ──────────────────────────────────────────────

function IndoorMapMockup() {
  return (
    <div className="max-w-sm mx-auto" style={{ perspective: '1200px' }}>
      <div
        className="relative rounded-2xl border border-ensemble-200 shadow-xl bg-white overflow-hidden pb-14"
        style={{ transform: 'rotateY(-6deg) rotateX(2deg)' }}
      >
        <div className="p-5 space-y-3">
          {/* Floor selector tabs */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-white bg-accent-500 rounded px-2.5 py-1">EG</span>
            <span className="text-[9px] font-medium text-ensemble-400 bg-ensemble-50 rounded px-2.5 py-1 border border-ensemble-200">OG1</span>
          </div>

          {/* SVG floor plan */}
          <svg viewBox="0 0 320 220" className="w-full h-auto" fill="none">
            <defs>
              <pattern id="grid-floor" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgb(241 245 249)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="320" height="220" fill="url(#grid-floor)" rx="6" />

            {/* Grosser Saal (large room) */}
            <rect x="10" y="10" width="150" height="85" rx="4" fill="rgb(241 245 249)" stroke="rgb(203 213 225)" strokeWidth="1" />
            <text x="85" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="rgb(71 85 105)">Grosser Saal</text>
            <rect x="30" y="16" width="110" height="10" rx="2" fill="rgb(226 232 240)" />
            <text x="85" y="24" textAnchor="middle" fontSize="6" fill="rgb(148 163 184)">B&uuml;hne</text>

            {/* Corridor */}
            <rect x="10" y="95" width="300" height="24" fill="rgb(248 250 252)" stroke="rgb(226 232 240)" strokeWidth="0.8" strokeDasharray="4 2" />
            <text x="160" y="110" textAnchor="middle" fontSize="7" fill="rgb(203 213 225)">Korridor</text>

            {/* Saal A - destination, highlighted */}
            <rect x="170" y="10" width="140" height="85" rx="4" fill="rgb(239 246 255)" stroke="rgb(59 130 246)" strokeWidth="1.5" />
            <text x="240" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="rgb(37 99 235)">Saal A</text>
            <text x="240" y="60" textAnchor="middle" fontSize="7" fill="rgb(96 165 250)">120 Pl&auml;tze</text>

            {/* Saal B */}
            <rect x="220" y="119" width="90" height="50" rx="4" fill="rgb(241 245 249)" stroke="rgb(203 213 225)" strokeWidth="1" />
            <text x="265" y="148" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgb(100 116 139)">Saal B</text>

            {/* Registration desk */}
            <rect x="10" y="119" width="85" height="40" rx="4" fill="rgb(254 243 199)" stroke="rgb(251 191 36)" strokeWidth="0.8" />
            <text x="52" y="138" textAnchor="middle" fontSize="8" fontWeight="500" fill="rgb(161 98 7)">Registration</text>
            <text x="52" y="150" textAnchor="middle" fontSize="6" fill="rgb(202 138 4)">Eingang</text>

            {/* Aussteller area */}
            <rect x="105" y="119" width="105" height="55" rx="4" fill="rgb(219 234 254)" stroke="rgb(147 197 253)" strokeWidth="0.8" />
            <text x="157" y="138" textAnchor="middle" fontSize="8" fontWeight="500" fill="rgb(37 99 235)">Aussteller</text>
            {[0, 1, 2, 3].map((b) => (
              <rect key={b} x={115 + (b % 2) * 40} y={145 + Math.floor(b / 2) * 14} width="30" height="9" rx="2" fill="rgb(191 219 254)" stroke="rgb(147 197 253)" strokeWidth="0.4" />
            ))}

            {/* Pulsing blue dot - your location */}
            <circle cx="52" cy="107" r="10" fill="rgb(59 130 246)" opacity="0.12">
              <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.04;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="52" cy="107" r="5" fill="rgb(59 130 246)" stroke="white" strokeWidth="2" />

            {/* Animated dashed route from dot to Saal A */}
            <path
              d="M62 107 L240 107 L240 85"
              stroke="rgb(59 130 246)"
              strokeWidth="2"
              strokeDasharray="6 3"
              opacity="0.6"
              fill="none"
            >
              <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.5s" repeatCount="indefinite" />
            </path>

            {/* Destination pin */}
            <circle cx="240" cy="85" r="4" fill="rgb(59 130 246)" opacity="0.3" />
            <circle cx="240" cy="85" r="2" fill="rgb(59 130 246)" />
          </svg>

          {/* Bottom info bar */}
          <div className="flex items-center justify-between rounded-lg bg-ensemble-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-[9px] font-medium text-ensemble-700">Ihr Standort</span>
            </div>
            <span className="text-[9px] font-semibold text-blue-600">Saal A &middot; 2 Min</span>
          </div>
        </div>

        <MockupNavBar active="karte" />
      </div>
    </div>
  );
}

// ── Section 3: AI Chat ─────────────────────────────────────────────────

function AiChatMockup() {
  return (
    <div className="max-w-sm mx-auto" style={{ perspective: '1200px' }}>
      <div
        className="relative rounded-2xl border border-ensemble-200 shadow-xl bg-white overflow-hidden pb-14"
        style={{ transform: 'rotateY(6deg) rotateX(2deg)' }}
      >
        <div className="p-5 space-y-4">
          {/* Chat header */}
          <div className="flex items-center gap-2 pb-3 border-b border-ensemble-100">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="currentColor">
                <circle cx="8" cy="8" r="2.5" />
                <circle cx="8" cy="2.5" r="1.2" />
                <circle cx="8" cy="13.5" r="1.2" />
                <circle cx="2.5" cy="8" r="1.2" />
                <circle cx="13.5" cy="8" r="1.2" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-ensemble-900">Ensemble KI</span>
            <div className="flex items-center gap-1 ml-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[8px] text-ensemble-400">Bereit</span>
            </div>
          </div>

          {/* User message - right aligned */}
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-md bg-ensemble-100 px-3.5 py-2.5 max-w-[85%]">
              <p className="text-[10px] text-ensemble-700 leading-snug">
                Welche neuen Ergebnisse zur Mitralklappentherapie wurden heute vorgestellt?
              </p>
            </div>
          </div>

          {/* AI response - left aligned */}
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-accent-50 border border-accent-100 px-3.5 py-2.5 max-w-[90%]">
              <p className="text-[10px] text-ensemble-800 font-medium mb-2 leading-snug">Heute wurden 3 relevante Pr&auml;sentationen vorgestellt:</p>
              <ul className="space-y-1.5">
                <li className="flex gap-2">
                  <span className="text-accent-500 font-bold shrink-0 text-[10px]">&bull;</span>
                  <span className="text-[9px] text-ensemble-700 leading-snug"><strong>CLASP IID-Studie</strong> (09:30, Saal A): Reduktion der Mitralregurgitation um 72%</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent-500 font-bold shrink-0 text-[10px]">&bull;</span>
                  <span className="text-[9px] text-ensemble-700 leading-snug"><strong>EXPAND-Registerstudie</strong> (11:00, Saal B): Langzeitdaten zu TEER bei 1.800 Patienten</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent-500 font-bold shrink-0 text-[10px]">&bull;</span>
                  <span className="text-[9px] text-ensemble-700 leading-snug"><strong>Poster #47</strong>: Neuer Device-Prototyp f&uuml;r sekund&auml;re MR</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Source badges */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Abstract #12', color: 'bg-accent-50 text-accent-600 border-accent-200' },
              { label: 'Session A1', color: 'bg-ensemble-50 text-ensemble-600 border-ensemble-200' },
              { label: 'Poster #47', color: 'bg-blue-50 text-blue-600 border-blue-200' },
            ].map((s, i) => (
              <span key={i} className={`text-[8px] font-medium rounded-md px-2.5 py-1 border ${s.color}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <MockupNavBar active="wissen" />
      </div>
    </div>
  );
}

// ── Section 4: Registration + Badge ────────────────────────────────────

function RegistrationMockup() {
  return (
    <div className="max-w-sm mx-auto" style={{ perspective: '1200px' }}>
      <div
        className="relative rounded-2xl border border-ensemble-200 shadow-xl bg-white overflow-hidden pb-14"
        style={{ transform: 'rotateY(-6deg) rotateX(2deg)' }}
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="text-[9px] font-medium text-ensemble-400 uppercase tracking-wider">Ihr Badge</div>

          {/* Badge card */}
          <div className="rounded-xl border border-ensemble-200 bg-ensemble-50/50 p-4">
            <div className="flex items-start gap-4">
              {/* QR code */}
              <div className="h-20 w-20 rounded-lg bg-white border border-ensemble-200 p-2 shrink-0 shadow-sm">
                <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges">
                  {[
                    '111111101001011111111',
                    '100000101101010000001',
                    '101110101100010111001',
                    '101110100011010111001',
                    '101110101010010111001',
                    '100000101010010000001',
                    '111111101010101111111',
                    '000000001110100000000',
                    '110011110100011001011',
                    '010100011011010110010',
                    '011010100110101001110',
                    '001101010011100101001',
                    '110110110100011010110',
                    '000000001011010011010',
                    '111111100010101010111',
                    '100000100110100010010',
                    '101110100101011011101',
                    '101110101001010100110',
                    '101110100110101101001',
                    '100000101100011010100',
                    '111111101011010011011',
                  ].map((row, y) => (
                    <g key={y}>
                      {row.split('').map((cell, x) => (
                        cell === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1e293b" /> : null
                      ))}
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-ensemble-900 leading-tight">Dr. Lisa Schneider</p>
                <p className="text-[10px] text-ensemble-500 mt-1">Kantonsspital Z&uuml;rich</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[9px] font-semibold text-white bg-accent-500 rounded-md px-2.5 py-0.5 shadow-sm">VIP</span>
                  <span className="text-[8px] text-ensemble-400 font-mono">Ticket #2847</span>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in status */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[11px] font-semibold text-green-700">Check-in bereit</span>
          </div>
        </div>

        <MockupNavBar active="programm" />
      </div>
    </div>
  );
}

// ── Section 5: Gamification + Networking ───────────────────────────────

function EngagementMockup() {
  return (
    <div className="max-w-sm mx-auto" style={{ perspective: '1200px' }}>
      <div
        className="relative rounded-2xl border border-ensemble-200 shadow-xl bg-white overflow-hidden pb-14"
        style={{ transform: 'rotateY(6deg) rotateX(2deg)' }}
      >
        <div className="p-5 space-y-4">
          {/* Leaderboard header */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="currentColor">
                <path d="M8 1l2 4.1 4.5.65-3.25 3.17.77 4.48L8 11.27 3.98 13.4l.77-4.48L1.5 5.75 6 5.1z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-ensemble-900">Bestenliste</span>
            <span className="text-[9px] text-ensemble-400 ml-auto">Heute</span>
          </div>

          {/* Leaderboard entries */}
          <div className="space-y-2">
            {[
              { rank: 1, name: 'Dr. M. Weber', pts: 3120, medal: 'text-yellow-500', bg: 'bg-yellow-50' },
              { rank: 2, name: 'Prof. A. Fischer', pts: 2840, medal: 'text-ensemble-400', bg: 'bg-ensemble-50' },
              { rank: 3, name: 'Dr. T. M\u00fcller', pts: 2650, medal: 'text-orange-400', bg: 'bg-orange-50' },
            ].map((entry) => (
              <div key={entry.rank} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${entry.bg}`}>
                <span className={`text-[12px] font-bold ${entry.medal} w-5 text-center`}>{entry.rank}</span>
                <div className="h-7 w-7 rounded-full bg-ensemble-200 shrink-0 flex items-center justify-center">
                  <span className="text-[8px] font-semibold text-ensemble-600">{entry.name.split(' ').pop()?.[0]}</span>
                </div>
                <span className="text-[10px] font-medium text-ensemble-800 flex-1">{entry.name}</span>
                <span className="text-[9px] font-mono font-semibold text-ensemble-500">{entry.pts} Pkt</span>
              </div>
            ))}
          </div>

          {/* Referral link card */}
          <div className="rounded-xl border border-ensemble-200 bg-ensemble-50/50 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-3.5 w-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-[9px] font-semibold text-ensemble-700">Empfehlungslink</span>
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex-1 rounded-md bg-white border border-ensemble-200 px-2.5 py-1.5">
                <span className="text-[8px] font-mono text-ensemble-500 truncate block">ensemble.events/ref/dr-schneider</span>
              </div>
              <button className="text-[8px] font-medium text-white bg-accent-500 rounded-md px-2.5 py-1.5 shrink-0">
                Kopieren
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] text-ensemble-500">12 Klicks</span>
              <span className="text-[9px] text-ensemble-500">3 Anmeldungen</span>
              <span className="text-[9px] text-accent-600 font-semibold">+150 Pkt</span>
            </div>
          </div>
        </div>

        <MockupNavBar active="chat" />
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
        <h2 className="font-heading text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ensemble-900 sm:text-6xl lg:text-7xl">
          {titleLine1}
          <br />
          <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">{titleLine2}</span>
        </h2>
        <ul className="mt-8 space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-ensemble-600">
              <span className="h-2 w-2 rounded-full bg-accent-400 shrink-0" />
              <span className="text-base sm:text-lg">{item}</span>
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
