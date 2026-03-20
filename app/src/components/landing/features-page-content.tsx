'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { EnsembleLogo } from './ensemble-logo';
import { LandingFooter } from './landing-footer';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Ticket,
  Radio,
  MapPin,
  Users,
  MessageSquare,
  Store,
  Brain,
  Trophy,
  GraduationCap,
  Image,
  Settings,
  ArrowRight,
  ChevronUp,
  // Feature-specific icons
  GripVertical,
  Columns3,
  AlertTriangle,
  Bookmark,
  CalendarPlus,
  LayoutList,
  ClipboardList,
  Tags,
  Clock,
  UsersRound,
  ListOrdered,
  CreditCard,
  FileText,
  MessageCircleQuestion,
  BarChart3,
  Video,
  Heart,
  Star,
  Bluetooth,
  Map,
  Route,
  ScanLine,
  Accessibility,
  Nfc,
  QrCode,
  Radar,
  Contact,
  Send,
  Download,
  Zap,
  Hash,
  MessageSquare as MessageSquareIcon,
  Paperclip,
  Shield,
  Bell,
  ScanBarcode,
  Package,
  Award,
  MapPinned,
  FileDown,
  Database,
  Search,
  FileSearch,
  Languages,
  Sparkles,
  Quote,
  Coins,
  Medal,
  BadgeCheck,
  Share2,
  TrendingUp,
  UserCheck,
  ClipboardCheck,
  FileCheck,
  LayoutDashboard,
  ImagePlus,
  Presentation,
  PlayCircle,
  Camera,
  FolderOpen,
  Wand2,
  UserCog,
  PiggyBank,
  BarChart,
  ScrollText,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────── */

interface Feature {
  key: string;
  name: string;
  description: string;
}

interface Domain {
  id: string;
  name: string;
  features: Feature[];
}

interface FeaturesPageContentProps {
  translations: {
    title: string;
    subtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    navLogin: string;
    navDemo: string;
    domains: Domain[];
  };
}

/* ── Feature Icons ─────────────────────────────────────────────────── */

const FEATURE_ICONS: Record<string, LucideIcon> = {
  // Programm & Sessions
  'programm.dragDrop': GripVertical,
  'programm.multiTrack': Columns3,
  'programm.conflicts': AlertTriangle,
  'programm.personalSchedule': Bookmark,
  'programm.ical': CalendarPlus,
  'programm.sessionTypes': LayoutList,

  // Registrierung & Ticketing
  'registrierung.formBuilder': ClipboardList,
  'registrierung.ticketTypes': Tags,
  'registrierung.earlyBird': Clock,
  'registrierung.groupReg': UsersRound,
  'registrierung.waitlist': ListOrdered,
  'registrierung.payment': CreditCard,

  // Live-Event
  'live.transcription': FileText,
  'live.qa': MessageCircleQuestion,
  'live.polls': BarChart3,
  'live.streaming': Video,
  'live.reactions': Heart,
  'live.ratings': Star,

  // Indoor-Navigation
  'navigation.ble': Bluetooth,
  'navigation.floorplan': Map,
  'navigation.pathfinding': Route,
  'navigation.occupancy': Users,
  'navigation.checkin': ScanLine,
  'navigation.accessible': Accessibility,

  // Networking & Kontakte
  'networking.nfc': Nfc,
  'networking.qr': QrCode,
  'networking.nearby': Radar,
  'networking.directory': Contact,
  'networking.dm': Send,
  'networking.vcard': Download,

  // Chat & Kommunikation
  'chat.realtime': Zap,
  'chat.channels': Hash,
  'chat.directMessages': MessageSquareIcon,
  'chat.files': Paperclip,
  'chat.moderation': Shield,
  'chat.push': Bell,

  // Ausstellung & Sponsoren
  'ausstellung.directory': Store,
  'ausstellung.leads': ScanBarcode,
  'ausstellung.catalogs': Package,
  'ausstellung.sponsorTiers': Award,
  'ausstellung.floorplan': MapPinned,
  'ausstellung.leadExport': FileDown,

  // KI & Wissen
  'ki.rag': Database,
  'ki.search': Search,
  'ki.summaries': FileSearch,
  'ki.translation': Languages,
  'ki.recommendations': Sparkles,
  'ki.citations': Quote,

  // Gamification
  'gamification.points': Coins,
  'gamification.leaderboard': Medal,
  'gamification.achievements': BadgeCheck,
  'gamification.referral': Share2,
  'gamification.tiers': TrendingUp,
  'gamification.teams': UsersRound,

  // CME / Fortbildung
  'cme.creditTypes': GraduationCap,
  'cme.attendance': UserCheck,
  'cme.evaluations': ClipboardCheck,
  'cme.certificates': FileCheck,
  'cme.qrVerify': QrCode,
  'cme.dashboard': LayoutDashboard,

  // Medien & Inhalte
  'medien.gallery': ImagePlus,
  'medien.poster': Presentation,
  'medien.articles': FileText,
  'medien.onDemand': PlayCircle,
  'medien.podcam': Camera,
  'medien.library': FolderOpen,

  // Administration
  'admin.wizard': Wand2,
  'admin.attendees': UserCog,
  'admin.badges': CreditCard,
  'admin.finance': PiggyBank,
  'admin.analytics': BarChart,
  'admin.audit': ScrollText,
};

/* ── Domain config ─────────────────────────────────────────────────── */

const DOMAIN_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; pill: string; dot: string; bar: string }
> = {
  programm: {
    icon: CalendarDays,
    color: 'text-accent-500',
    bg: 'bg-accent-50',
    border: 'border-accent-200',
    pill: 'bg-accent-500 text-white',
    dot: 'bg-accent-500',
    bar: 'bg-accent-500',
  },
  registrierung: {
    icon: Ticket,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    pill: 'bg-blue-500 text-white',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
  },
  live: {
    icon: Radio,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    pill: 'bg-red-500 text-white',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
  },
  navigation: {
    icon: MapPin,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    pill: 'bg-green-500 text-white',
    dot: 'bg-green-500',
    bar: 'bg-green-500',
  },
  networking: {
    icon: Users,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    pill: 'bg-purple-500 text-white',
    dot: 'bg-purple-500',
    bar: 'bg-purple-500',
  },
  chat: {
    icon: MessageSquare,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    pill: 'bg-indigo-500 text-white',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
  },
  ausstellung: {
    icon: Store,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    pill: 'bg-amber-500 text-white',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  ki: {
    icon: Brain,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    pill: 'bg-cyan-500 text-white',
    dot: 'bg-cyan-500',
    bar: 'bg-cyan-500',
  },
  gamification: {
    icon: Trophy,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    pill: 'bg-yellow-500 text-white',
    dot: 'bg-yellow-500',
    bar: 'bg-yellow-500',
  },
  cme: {
    icon: GraduationCap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    pill: 'bg-emerald-500 text-white',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  medien: {
    icon: Image,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    pill: 'bg-pink-500 text-white',
    dot: 'bg-pink-500',
    bar: 'bg-pink-500',
  },
  admin: {
    icon: Settings,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    pill: 'bg-slate-500 text-white',
    dot: 'bg-slate-500',
    bar: 'bg-slate-500',
  },
};

/* ── Pill Navigation ───────────────────────────────────────────────── */

function CategoryPills({
  domains,
  activeId,
  onSelect,
}: {
  domains: Domain[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory px-1 lg:flex-wrap lg:overflow-visible">
        {domains.map((domain) => {
          const meta = DOMAIN_META[domain.id];
          const Icon = meta?.icon ?? CalendarDays;
          const isActive = activeId === domain.id;

          return (
            <button
              key={domain.id}
              onClick={() => onSelect(domain.id)}
              className={`flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${meta?.pill ?? 'bg-ensemble-900 text-white'} shadow-md scale-[1.03]`
                  : 'bg-white text-ensemble-600 border border-ensemble-200 hover:border-ensemble-300 hover:shadow-sm'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{domain.name}</span>
            </button>
          );
        })}
      </div>
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

/* ── Feature Card ──────────────────────────────────────────────────── */

function FeatureCard({ feature, domainId }: { feature: Feature; domainId: string; index: number }) {
  const meta = DOMAIN_META[domainId];
  const featureKey = `${domainId}.${feature.key}`;
  const Icon = FEATURE_ICONS[featureKey] ?? meta?.icon ?? CalendarDays;

  return (
    <div className="group relative rounded-xl border border-ensemble-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-ensemble-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta?.bg ?? 'bg-ensemble-50'}`}>
          <Icon className={`h-3.5 w-3.5 ${meta?.color ?? 'text-ensemble-500'}`} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-ensemble-900 leading-snug">
            {feature.name}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-ensemble-500">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Domain Section ────────────────────────────────────────────────── */

function DomainSection({ domain, index }: { domain: Domain; index: number }) {
  const meta = DOMAIN_META[domain.id];
  const Icon = meta?.icon ?? CalendarDays;

  return (
    <section id={`domain-${domain.id}`} className="scroll-mt-36">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          {/* Colored accent bar */}
          <div className={`h-10 w-1 rounded-full ${meta?.bar ?? 'bg-ensemble-400'}`} />
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta?.bg ?? 'bg-ensemble-50'}`}>
              <Icon className={`h-5 w-5 ${meta?.color ?? 'text-ensemble-500'}`} />
            </div>
            <h3 className="font-heading text-xl font-bold text-ensemble-900 sm:text-2xl">
              {domain.name}
            </h3>
          </div>
          <span className="ml-auto hidden text-sm font-medium text-ensemble-400 sm:block">
            {domain.features.length} Funktionen
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domain.features.map((feature, fi) => (
          <FeatureCard
            key={feature.key}
            feature={feature}
            domainId={domain.id}
            index={fi}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Main Page Content ─────────────────────────────────────────────── */

export function FeaturesPageContent({ translations: t }: FeaturesPageContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    const el = document.getElementById(`domain-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Show back-to-top after scrolling
  if (typeof window !== 'undefined') {
    if (!showBackToTop) {
      // Lazy attach
      const onScroll = () => {
        setShowBackToTop(window.scrollY > 600);
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    }
  }

  const totalFeatures = t.domains.reduce((sum, d) => sum + d.features.length, 0);

  return (
    <main className="min-h-screen bg-white">
      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-lg border-b border-ensemble-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <EnsembleLogo className="h-14 sm:h-16" variant="light" />
        </Link>

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

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-50/40 via-white to-white pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Feature count badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ensemble-200 bg-ensemble-50 px-4 py-1.5 text-sm font-medium text-ensemble-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
              {totalFeatures} Funktionen in 12 Kategorien
            </span>
          </motion.div>

          <motion.h1
            className="mt-8 font-heading text-4xl font-bold tracking-tight text-ensemble-900 sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.title}
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-2xl text-lg text-ensemble-500 sm:text-xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Sticky Category Pills ──────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-ensemble-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <CategoryPills
            domains={t.domains}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* ── Domain Sections ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="space-y-20 sm:space-y-24">
          {t.domains.map((domain, i) => (
            <DomainSection key={domain.id} domain={domain} index={i} />
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="relative bg-ensemble-50 py-20 sm:py-28">
        <motion.div
          className="mx-auto max-w-2xl px-6 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 sm:text-4xl lg:text-5xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {t.ctaTitle}
          </h2>

          <p
            className="mx-auto mt-5 max-w-md text-base text-ensemble-500 sm:text-lg"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {t.ctaSubtitle}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/registrieren"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:brightness-105 active:scale-[0.97]"
            >
              {t.ctaButton}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Back to top ────────────────────────────────────────────── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-ensemble-900 text-white shadow-lg transition-all hover:bg-ensemble-800 active:scale-95"
          aria-label="Nach oben"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </main>
  );
}
