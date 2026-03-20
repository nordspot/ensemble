'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────

interface SignageSession {
  id: string;
  title: string;
  speakers: string;
  room: string;
  startTime: string;
  endTime: string;
  trackColor: string | null;
}

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string | null;
  tier: string;
}

interface SignageData {
  congressName: string;
  currentSessions: SignageSession[];
  nextSessions: SignageSession[];
  sponsors: Sponsor[];
}

interface SignageViewProps {
  congressId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getTimeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Jetzt';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `in ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `in ${hours}h ${mins}m`;
}

// ── Component ────────────────────────────────────────────────────────────

export function SignageView({ congressId }: SignageViewProps) {
  const [data, setData] = useState<SignageData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [now, setNow] = useState(new Date());

  // ── Fetch signage data ────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/congress/${congressId}/sessions?view=signage`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setData(json.data as SignageData);
      }
    } catch {
      // silent
    }
  }, [congressId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate slides: current sessions -> next sessions -> sponsors
  const slides = ['current', 'next', 'sponsors'] as const;
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 12000); // 12 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length]);

  // ── Fallback data for display before API loads ────────────────────────

  const currentSessions = data?.currentSessions ?? [];
  const nextSessions = data?.nextSessions ?? [];
  const sponsors = data?.sponsors ?? [];
  const congressName = data?.congressName ?? 'Ensemble';

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#111827] to-[#0A0F1E] text-white overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-12 py-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-lg font-bold">E</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{congressName}</h1>
        </div>
        <div className="flex items-center gap-3 text-xl font-mono tabular-nums">
          <Clock className="h-5 w-5 opacity-60" />
          {now.toLocaleTimeString('de-CH', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 px-12 py-4">
        <AnimatePresence mode="wait">
          {slides[currentSlide] === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-white/60 uppercase tracking-wider mb-6">
                Aktuelle Sessions
              </h2>
              {currentSessions.length === 0 ? (
                <p className="text-xl text-white/40 text-center py-20">
                  Derzeit keine laufenden Sessions
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {currentSessions.slice(0, 6).map((session, i) => (
                    <SessionCard key={session.id} session={session} index={i} showCountdown />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {slides[currentSlide] === 'next' && (
            <motion.div
              key="next"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-white/60 uppercase tracking-wider mb-6">
                Kommende Sessions
              </h2>
              {nextSessions.length === 0 ? (
                <p className="text-xl text-white/40 text-center py-20">
                  Keine weiteren Sessions heute
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {nextSessions.slice(0, 6).map((session, i) => (
                    <SessionCard key={session.id} session={session} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {slides[currentSlide] === 'sponsors' && sponsors.length > 0 && (
            <motion.div
              key="sponsors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-white/60 uppercase tracking-wider mb-8">
                Unsere Sponsoren
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-12">
                {sponsors.map((sponsor) => (
                  <motion.div
                    key={sponsor.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="h-20 w-auto object-contain brightness-0 invert opacity-80"
                      />
                    ) : (
                      <div className="h-20 w-40 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-white/60">
                          {sponsor.name}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-white/40 uppercase tracking-wider">
                      {sponsor.tier}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom indicator dots */}
      <div className="flex items-center justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === currentSlide
                ? 'w-8 bg-white/60'
                : 'w-1.5 bg-white/20',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ── Session Card ─────────────────────────────────────────────────────────

function SessionCard({
  session,
  index,
  showCountdown,
}: {
  session: SignageSession;
  index: number;
  showCountdown?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm"
    >
      {session.trackColor && (
        <div
          className="h-1 w-12 rounded-full mb-3"
          style={{ backgroundColor: session.trackColor }}
        />
      )}
      <h3 className="text-lg font-semibold text-white/90 line-clamp-2">
        {session.title}
      </h3>
      {session.speakers && (
        <p className="flex items-center gap-1.5 mt-1.5 text-sm text-white/50">
          <Users className="h-3.5 w-3.5" />
          {session.speakers}
        </p>
      )}
      <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(session.startTime)} - {formatTime(session.endTime)}
        </span>
        {session.room && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {session.room}
          </span>
        )}
        {showCountdown && (
          <span className="ml-auto text-xs font-mono text-white/30">
            {getTimeUntil(session.endTime)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
