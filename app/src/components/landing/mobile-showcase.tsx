'use client';

import { motion } from 'framer-motion';

/* eslint-disable @next/next/no-img-element */

export function MobileShowcase() {
  return (
    <section className="relative bg-ensemble-50 py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">

          {/* Text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ensemble-900 sm:text-6xl lg:text-7xl">
              Immer dabei.
              <br />
              <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
                In der Tasche.
              </span>
            </h2>
            <p className="mt-6 max-w-md mx-auto lg:mx-0 text-base text-ensemble-500 sm:text-lg leading-relaxed">
              Ihr Fachkongress auf dem Smartphone. Programm, Navigation, Live-Sessions, Networking und Check-in. Alles optimiert für unterwegs.
            </p>
            <ul className="mt-8 space-y-4 max-w-md mx-auto lg:mx-0">
              {[
                'Persönlicher Zeitplan mit Erinnerungen',
                'Live-Transkription und Q&A',
                'Indoor-Navigation zum nächsten Vortrag',
                'NFC-Badge scannen für Kontakte',
                'Push-Benachrichtigungen in Echtzeit',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-ensemble-600">
                  <span className="h-2 w-2 rounded-full bg-accent-400 shrink-0" />
                  <span className="text-base sm:text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* iPhone mockup */}
          <motion.div
            className="relative flex-shrink-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Glow behind phone */}
            <div className="absolute -inset-8 rounded-[3rem] bg-accent-500/10 blur-3xl" />

            <div className="relative w-[280px] sm:w-[320px]">
              {/* iPhone frame */}
              <img
                src="/images/iphone-frame.png"
                alt=""
                className="relative z-10 w-full h-auto pointer-events-none"
              />

              {/* Screen content - positioned inside the frame */}
              <div
                className="absolute z-0 overflow-hidden bg-white"
                style={{
                  top: '3.2%',
                  left: '5.8%',
                  right: '5.8%',
                  bottom: '3.2%',
                  borderRadius: '2rem',
                }}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1">
                  <span className="text-[9px] font-semibold text-ensemble-900">09:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="h-2.5 w-2.5 text-ensemble-900" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                    <svg className="h-2.5 w-2.5 text-ensemble-900" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                  </div>
                </div>

                {/* App header */}
                <div className="px-4 pt-2 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[13px] font-bold text-ensemble-900">Swiss Cardiology Congress</h3>
                      <p className="text-[9px] text-ensemble-400 mt-0.5">15. Juni 2026</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-accent-500/10 flex items-center justify-center">
                        <svg className="h-3 w-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Day tabs */}
                  <div className="flex gap-2 mt-3">
                    {['Tag 1', 'Tag 2', 'Tag 3'].map((day, i) => (
                      <div
                        key={day}
                        className={`px-3 py-1 rounded-full text-[9px] font-semibold ${
                          i === 0
                            ? 'bg-accent-500 text-white'
                            : 'bg-ensemble-100 text-ensemble-500'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session list */}
                <div className="px-4 space-y-2.5 pb-4">
                  {/* Current session - highlighted */}
                  <div className="rounded-xl bg-accent-500/5 border border-accent-500/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-wider">Jetzt</span>
                      <span className="text-[7px] text-ensemble-400 ml-auto">09:00 - 10:00</span>
                    </div>
                    <p className="text-[10px] font-semibold text-ensemble-900 leading-snug">
                      Keynote: Die Zukunft der Kardiologie
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="h-4 w-4 rounded-full bg-accent-500/20 flex items-center justify-center">
                        <span className="text-[6px] font-bold text-accent-600">TM</span>
                      </div>
                      <span className="text-[8px] text-ensemble-500">Prof. Dr. T. Müller</span>
                      <span className="text-[8px] text-ensemble-400 ml-auto">Grosser Saal</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-ensemble-200 overflow-hidden">
                      <div className="h-full w-[40%] rounded-full bg-accent-500" />
                    </div>
                  </div>

                  {/* Upcoming sessions */}
                  {[
                    { time: '10:30', title: 'TAVI im Jahr 2026: Neue Evidenz', speaker: 'Dr. A. Fischer', room: 'Saal A', color: 'bg-emerald-500' },
                    { time: '10:30', title: 'Workshop: KI-gestützte EKG-Analyse', speaker: 'Dr. M. Dubois', room: 'Saal B', color: 'bg-blue-500' },
                    { time: '12:00', title: 'Mittagspause & Networking', speaker: '', room: 'Foyer', color: 'bg-ensemble-300' },
                    { time: '14:00', title: 'Herzinsuffizienz: Neue Therapien', speaker: 'Panel', room: 'Grosser Saal', color: 'bg-violet-500' },
                  ].map((session, i) => (
                    <div key={i} className="flex gap-3 items-start py-2 border-b border-ensemble-100 last:border-0">
                      <div className="shrink-0 pt-0.5">
                        <span className="text-[9px] font-mono text-ensemble-400">{session.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${session.color} shrink-0`} />
                          <p className="text-[9px] font-semibold text-ensemble-900 leading-tight truncate">
                            {session.title}
                          </p>
                        </div>
                        {session.speaker && (
                          <p className="text-[8px] text-ensemble-500 mt-0.5 ml-3">{session.speaker}</p>
                        )}
                        <p className="text-[7px] text-ensemble-400 ml-3">{session.room}</p>
                      </div>
                      <svg className="h-3 w-3 text-ensemble-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* Bottom tab bar */}
                <div className="absolute bottom-0 inset-x-0 bg-white border-t border-ensemble-100 px-4 py-2 flex items-center justify-around">
                  {[
                    { label: 'Programm', active: true },
                    { label: 'Live', active: false },
                    { label: 'Karte', active: false },
                    { label: 'Chat', active: false },
                    { label: 'Profil', active: false },
                  ].map((tab) => (
                    <div key={tab.label} className="flex flex-col items-center gap-0.5">
                      <div className={`h-4 w-4 rounded-md ${tab.active ? 'bg-accent-500' : 'bg-ensemble-200'}`} />
                      <span className={`text-[6px] font-medium ${tab.active ? 'text-accent-500' : 'text-ensemble-400'}`}>
                        {tab.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
