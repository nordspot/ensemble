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
    <div
      className="relative h-[340px] bg-gradient-to-br from-accent-50/30 to-ensemble-50/30 rounded-2xl"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Back layer - faded transcript lines */}
      <div
        className="absolute inset-x-4 top-4 bottom-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg p-4"
        style={{ transform: 'rotateY(8deg) rotateX(4deg) translateZ(0px)', willChange: 'transform' }}
      >
        <div className="opacity-30">
          <div className="flex items-center gap-1.5 mb-3">
            <svg className="h-3 w-3 text-ensemble-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[8px] font-medium text-ensemble-500 uppercase tracking-wider">Transkription</span>
          </div>
          <div className="space-y-2.5">
            {[85, 70, 90, 60, 80, 75, 55].map((w, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="h-2 w-7 rounded bg-ensemble-200" />
                <div className="h-2 rounded bg-ensemble-200" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle layer - Q&A panel */}
      <div
        className="absolute left-6 right-6 top-10 rounded-2xl bg-white/50 backdrop-blur-md border border-white/50 shadow-xl p-4"
        style={{ transform: 'rotateY(8deg) rotateX(4deg) translateZ(24px)', willChange: 'transform' }}
      >
        <div className="opacity-50">
          <div className="flex items-center justify-between mb-2.5">
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
      </div>

      {/* Front layer - LIVE session card (hero) */}
      <div
        className="absolute left-5 right-5 top-14 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-2xl p-5"
        style={{ transform: 'rotateY(8deg) rotateX(4deg) translateZ(48px)', willChange: 'transform' }}
      >
        {/* Session header */}
        <div className="flex items-center gap-2 mb-3">
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
        <div className="mb-3">
          <h4 className="text-[12px] font-semibold text-ensemble-900 leading-tight">
            Keynote: Die Zukunft der Kardiologie
          </h4>
          <p className="text-[10px] text-ensemble-500 mt-0.5">Prof. Dr. Thomas Muller &middot; Grosser Saal</p>
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
    </div>
  );
}

// ── Section 2: Indoor Map ──────────────────────────────────────────────

function IndoorMapMockup() {
  return (
    <div
      className="relative h-[340px] bg-gradient-to-br from-blue-50/30 to-ensemble-50/30 rounded-2xl"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Back layer - EG ground floor plan (slightly faded) */}
      <div
        className="absolute inset-x-4 top-4 bottom-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-3 overflow-hidden"
        style={{ transform: 'rotateY(-8deg) rotateX(4deg) translateZ(0px)', willChange: 'transform' }}
      >
        <div className="opacity-25">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[8px] font-semibold text-ensemble-500 bg-ensemble-100 rounded px-1.5 py-0.5">EG</span>
            <span className="text-[8px] text-ensemble-400">Erdgeschoss</span>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-auto" fill="none">
            <defs>
              <pattern id="grid-eg" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgb(226 232 240)" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="320" height="170" fill="url(#grid-eg)" />

            {/* Main Hall */}
            <rect x="10" y="10" width="140" height="80" rx="3" fill="rgb(241 245 249)" stroke="rgb(148 163 184)" strokeWidth="1" />
            <text x="80" y="48" textAnchor="middle" className="text-[9px] font-semibold" fill="rgb(71 85 105)">Grosser Saal</text>
            <rect x="25" y="16" width="110" height="10" rx="2" fill="rgb(226 232 240)" />
            <text x="80" y="24" textAnchor="middle" className="text-[6px]" fill="rgb(148 163 184)">Buhne</text>

            {/* Registration */}
            <rect x="10" y="120" width="70" height="35" rx="3" fill="rgb(254 243 199)" stroke="rgb(251 191 36)" strokeWidth="0.8" />
            <text x="45" y="137" textAnchor="middle" className="text-[7px] font-medium" fill="rgb(161 98 7)">Registration</text>
            <text x="45" y="147" textAnchor="middle" className="text-[6px]" fill="rgb(202 138 4)">Eingang</text>

            {/* Exhibitor area */}
            <rect x="100" y="105" width="70" height="50" rx="3" fill="rgb(219 234 254)" stroke="rgb(96 165 250)" strokeWidth="0.8" />
            <text x="135" y="120" textAnchor="middle" className="text-[7px] font-medium" fill="rgb(37 99 235)">Aussteller</text>
            {[0, 1, 2, 3].map((b) => (
              <rect key={b} x={108 + (b % 2) * 28} y={126 + Math.floor(b / 2) * 16} width="20" height="10" rx="1.5" fill="rgb(191 219 254)" stroke="rgb(147 197 253)" strokeWidth="0.4" />
            ))}

            {/* You are here - pulsing blue dot */}
            <circle cx="135" cy="95" r="8" fill="rgb(59 130 246)" opacity="0.15">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="135" cy="95" r="4" fill="rgb(59 130 246)" stroke="white" strokeWidth="1.5" />

            {/* "Ihr Standort" label */}
            <rect x="148" y="88" width="52" height="14" rx="3" fill="rgb(59 130 246)" opacity="0.9" />
            <text x="174" y="98" textAnchor="middle" className="text-[6px] font-medium" fill="white">Ihr Standort</text>
          </svg>
        </div>
      </div>

      {/* Front layer - OG1 floor plan floating above */}
      <div
        className="absolute left-6 right-6 top-12 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-2xl p-3 overflow-hidden"
        style={{ transform: 'rotateY(-8deg) rotateX(4deg) translateZ(40px)', willChange: 'transform' }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[8px] font-semibold text-white bg-accent-500 rounded px-1.5 py-0.5">OG1</span>
          <span className="text-[8px] text-ensemble-500">Obergeschoss 1</span>
        </div>
        <svg viewBox="0 0 320 130" className="w-full h-auto" fill="none">
          <defs>
            <pattern id="grid-og1" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgb(226 232 240)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="320" height="130" fill="url(#grid-og1)" />

          {/* Corridor */}
          <rect x="130" y="10" width="30" height="110" fill="rgb(248 250 252)" stroke="rgb(203 213 225)" strokeWidth="0.8" strokeDasharray="3 2" />

          {/* Saal A - highlighted as destination */}
          <rect x="170" y="10" width="135" height="55" rx="3" fill="rgb(239 246 255)" stroke="rgb(59 130 246)" strokeWidth="1.5" />
          <text x="237" y="35" textAnchor="middle" className="text-[10px] font-semibold" fill="rgb(37 99 235)">Saal A</text>
          <text x="237" y="48" textAnchor="middle" className="text-[7px]" fill="rgb(96 165 250)">120 Platze</text>

          {/* Saal B */}
          <rect x="170" y="75" width="135" height="45" rx="3" fill="rgb(241 245 249)" stroke="rgb(148 163 184)" strokeWidth="1" />
          <text x="237" y="97" textAnchor="middle" className="text-[9px] font-semibold" fill="rgb(71 85 105)">Saal B</text>
          <text x="237" y="108" textAnchor="middle" className="text-[7px]" fill="rgb(148 163 184)">80 Platze</text>

          {/* Dashed route going UP from corridor to Saal A */}
          <path
            d="M145 120 L145 38 L170 38"
            stroke="rgb(59 130 246)"
            strokeWidth="2"
            strokeDasharray="5 3"
            opacity="0.7"
          >
            <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.5s" repeatCount="indefinite" />
          </path>

          {/* Destination marker on Saal A */}
          <circle cx="170" cy="38" r="4" fill="rgb(59 130 246)" opacity="0.3" />
          <circle cx="170" cy="38" r="2" fill="rgb(59 130 246)" />

          {/* "Ziel" label */}
          <rect x="60" y="105" width="72" height="16" rx="4" fill="rgb(59 130 246)" opacity="0.9" />
          <text x="96" y="116" textAnchor="middle" className="text-[7px] font-medium" fill="white">Ziel: Saal A, OG1</text>
        </svg>
      </div>
    </div>
  );
}

// ── Section 3: AI Chat ─────────────────────────────────────────────────

function AiChatMockup() {
  return (
    <div
      className="relative h-[360px] bg-gradient-to-br from-accent-50/30 to-ensemble-50/30 rounded-2xl"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Back layer - faded knowledge base text lines */}
      <div
        className="absolute inset-x-4 top-4 bottom-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg p-4"
        style={{ transform: 'rotateY(6deg) rotateX(3deg) translateZ(0px)', willChange: 'transform' }}
      >
        <div className="opacity-30">
          <div className="text-[7px] font-medium text-ensemble-400 uppercase tracking-wider mb-3">Wissensbasis</div>
          <div className="space-y-2.5">
            {[95, 70, 85, 60, 90, 75, 50, 80, 65].map((w, i) => (
              <div key={i} className="h-1.5 rounded bg-ensemble-200" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Middle layer - source citation cards */}
      <div
        className="absolute left-6 right-6 top-8 rounded-2xl bg-white/50 backdrop-blur-md border border-white/50 shadow-xl p-4"
        style={{ transform: 'rotateY(6deg) rotateX(3deg) translateZ(24px)', willChange: 'transform' }}
      >
        <div className="opacity-50">
          <span className="text-[8px] text-ensemble-400 font-medium uppercase tracking-wider">Quellen</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: 'Abstract #12', color: 'bg-accent-500/10 text-accent-600 border-accent-500/20' },
              { label: 'Session A1', color: 'bg-ensemble-100 text-ensemble-600 border-ensemble-200' },
              { label: 'Poster #47', color: 'bg-blue-50 text-blue-600 border-blue-200' },
            ].map((s, i) => (
              <span key={i} className={`text-[9px] font-medium rounded-lg px-3 py-1.5 border ${s.color}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Front layer - AI chat bubble with answer */}
      <div
        className="absolute left-5 right-5 top-16 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-2xl p-5"
        style={{ transform: 'rotateY(6deg) rotateX(3deg) translateZ(48px)', willChange: 'transform' }}
      >
        {/* Chat header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-ensemble-100/50">
          <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="currentColor">
              <circle cx="8" cy="8" r="2.5" />
              <circle cx="8" cy="2.5" r="1.2" />
              <circle cx="8" cy="13.5" r="1.2" />
              <circle cx="2.5" cy="8" r="1.2" />
              <circle cx="13.5" cy="8" r="1.2" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-ensemble-900">Ensemble KI-Assistent</span>
          <div className="flex items-center gap-1 ml-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] text-ensemble-400">Bereit</span>
          </div>
        </div>

        {/* User question (compact) */}
        <div className="rounded-lg bg-ensemble-100/60 px-3 py-1.5 text-[9px] text-ensemble-700 mb-3">
          Welche neuen Ergebnisse zur katheterbasierten Mitralklappentherapie wurden heute prasentiert?
        </div>

        {/* AI response */}
        <div className="text-[10px] text-ensemble-800 leading-relaxed">
          <p className="font-medium mb-1.5">Heute wurden 3 relevante Prasentationen vorgestellt:</p>
          <ul className="space-y-1 ml-0.5">
            <li className="flex gap-2">
              <span className="text-accent-500 font-bold shrink-0">&bull;</span>
              <span><strong>CLASP IID-Studie</strong> (09:30): Reduktion der Mitralregurgitation um 72%</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent-500 font-bold shrink-0">&bull;</span>
              <span><strong>EXPAND-Registerstudie</strong> (11:00): Langzeitdaten zu TEER bei 1.800 Patienten</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent-500 font-bold shrink-0">&bull;</span>
              <span><strong>Poster #47</strong>: Neuer Device-Prototyp fur sekundare MR</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Section 4: Registration + Badge ────────────────────────────────────

function RegistrationMockup() {
  return (
    <div
      className="relative h-[340px] bg-gradient-to-br from-emerald-50/30 to-ensemble-50/30 rounded-2xl"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Back layer - ticket selection form */}
      <div
        className="absolute inset-x-4 top-4 bottom-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg p-4"
        style={{ transform: 'rotateY(-6deg) rotateX(3deg) translateZ(0px)', willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-ensemble-100/50">
          <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="2" width="10" height="12" rx="1.5" />
              <path d="M6 5h4M6 7.5h4M6 10h2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-ensemble-900">Fachkongress-Anmeldung</span>
            <span className="text-[7px] text-ensemble-400 block">Swiss Cardiology Congress 2026</span>
          </div>
        </div>

        {/* Ticket selection */}
        <div className="space-y-1.5">
          <span className="text-[8px] font-medium text-ensemble-500 uppercase tracking-wider">Ticket wahlen</span>
          {[
            { label: 'Standard', price: 'CHF 450', selected: false },
            { label: 'VIP', price: 'CHF 890', selected: true },
            { label: 'Virtuell', price: 'CHF 190', selected: false },
          ].map((ticket, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 border transition-colors ${
                ticket.selected
                  ? 'border-accent-500 bg-accent-500/5'
                  : 'border-ensemble-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                  ticket.selected ? 'border-accent-500' : 'border-ensemble-300'
                }`}>
                  {ticket.selected && <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                </div>
                <span className={`text-[9px] font-medium ${ticket.selected ? 'text-accent-600' : 'text-ensemble-700'}`}>
                  {ticket.label}
                </span>
              </div>
              <span className={`text-[9px] font-semibold ${ticket.selected ? 'text-accent-600' : 'text-ensemble-500'}`}>
                {ticket.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Front layer - generated badge / name tag */}
      <div
        className="absolute left-6 right-6 top-20 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-2xl p-5"
        style={{ transform: 'rotateY(-6deg) rotateX(3deg) translateZ(36px)', willChange: 'transform' }}
      >
        <div className="text-[8px] font-medium text-ensemble-400 uppercase tracking-wider mb-3">Ihr Badge</div>
        <div className="flex items-start gap-4">
          {/* QR code - dense realistic pattern */}
          <div className="h-16 w-16 rounded-lg bg-white border border-ensemble-200 p-1 shrink-0 shadow-sm">
            <svg viewBox="0 0 33 33" className="w-full h-full">
              {/* 3 position markers */}
              <rect x="0" y="0" width="9" height="9" fill="#1e293b"/><rect x="1" y="1" width="7" height="7" fill="white"/><rect x="2" y="2" width="5" height="5" fill="#1e293b"/>
              <rect x="24" y="0" width="9" height="9" fill="#1e293b"/><rect x="25" y="1" width="7" height="7" fill="white"/><rect x="26" y="2" width="5" height="5" fill="#1e293b"/>
              <rect x="0" y="24" width="9" height="9" fill="#1e293b"/><rect x="1" y="25" width="7" height="7" fill="white"/><rect x="2" y="26" width="5" height="5" fill="#1e293b"/>
              {/* Timing patterns */}
              {[10,12,14,16,18,20,22].map(i=><rect key={`th${i}`} x={i} y={6} width="1" height="1" fill={i%2===0?"#1e293b":"white"}/>)}
              {[10,12,14,16,18,20,22].map(i=><rect key={`tv${i}`} x={6} y={i} width="1" height="1" fill={i%2===0?"#1e293b":"white"}/>)}
              {/* Dense data modules */}
              {(() => {
                const d = '0110100110011010110010110011010011011001010110100110010110101100110100110110010101101001100101101011001101001011010011010110010110011010011011001010110100110010110';
                const els: React.ReactElement[] = [];
                let idx = 0;
                for (let y = 10; y <= 31; y++) {
                  for (let x = 10; x <= 31; x++) {
                    if (x >= 24 && y >= 24) continue;
                    if (d[idx % d.length] === '1') {
                      els.push(<rect key={`d${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1e293b"/>);
                    }
                    idx++;
                  }
                }
                return els;
              })()}
              {/* Alignment pattern */}
              <rect x="20" y="20" width="5" height="5" fill="#1e293b"/><rect x="21" y="21" width="3" height="3" fill="white"/><rect x="22" y="22" width="1" height="1" fill="#1e293b"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-ensemble-900">Dr. Lisa Schneider</p>
            <p className="text-[10px] text-ensemble-500 mt-0.5">Kantonsspital Zurich</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[9px] font-semibold text-white bg-accent-500 rounded-md px-2 py-0.5 shadow-sm">VIP</span>
              <span className="text-[8px] text-ensemble-400 font-mono">Ticket #2847</span>
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
    <div
      className="relative h-[360px] bg-gradient-to-br from-yellow-50/30 to-ensemble-50/30 rounded-2xl"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Back layer - NFC contact exchange hint */}
      <div
        className="absolute inset-x-4 top-4 bottom-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg p-4"
        style={{ transform: 'rotateY(8deg) rotateX(4deg) translateZ(0px)', willChange: 'transform' }}
      >
        <div className="opacity-30">
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <svg className="h-10 w-10 text-ensemble-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
            <div className="text-center">
              <p className="text-[10px] font-medium text-ensemble-400">NFC-Kontakttausch</p>
              <p className="text-[8px] text-ensemble-300 mt-1">Badge anhalten</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle layer - referral link card */}
      <div
        className="absolute left-6 right-6 top-8 rounded-2xl bg-white/50 backdrop-blur-md border border-white/50 shadow-xl p-4"
        style={{ transform: 'rotateY(8deg) rotateX(4deg) translateZ(20px)', willChange: 'transform' }}
      >
        <div className="opacity-50">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-3.5 w-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-[9px] font-semibold text-accent-600">Empfehlungslink</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md bg-white/80 border border-ensemble-200 px-2.5 py-1.5">
              <span className="text-[8px] font-mono text-ensemble-500 truncate block">ensemble.events/ref/dr-schneider</span>
            </div>
            <button className="text-[8px] font-medium text-white bg-accent-500 rounded-md px-2.5 py-1.5">
              Kopieren
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[8px] text-ensemble-500">12 Klicks</span>
            <span className="text-[8px] text-ensemble-500">3 Anmeldungen</span>
            <span className="text-[8px] text-accent-600 font-medium">+150 Pkt</span>
          </div>
        </div>
      </div>

      {/* Front layer - leaderboard podium */}
      <div
        className="absolute left-5 right-5 top-20 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-2xl p-5"
        style={{ transform: 'rotateY(8deg) rotateX(4deg) translateZ(44px)', willChange: 'transform' }}
      >
        {/* Leaderboard header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="currentColor">
              <path d="M8 1l2 4.1 4.5.65-3.25 3.17.77 4.48L8 11.27 3.98 13.4l.77-4.48L1.5 5.75 6 5.1z" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-ensemble-900">Bestenliste</span>
          <span className="text-[8px] text-ensemble-400 ml-auto">Heute</span>
        </div>

        {/* Leaderboard entries */}
        <div className="space-y-2">
          {[
            { rank: 1, name: 'Dr. M. Weber', pts: 3120, medal: 'text-yellow-500', bg: 'bg-yellow-50/80' },
            { rank: 2, name: 'Prof. A. Fischer', pts: 2840, medal: 'text-ensemble-400', bg: 'bg-ensemble-50/80' },
            { rank: 3, name: 'Dr. T. Muller', pts: 2650, medal: 'text-orange-400', bg: 'bg-orange-50/80' },
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
