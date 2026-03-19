'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Clock,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';
import type { SessionType } from '@/types';

interface SessionBuilderProps {
  congressId: string;
}

const SESSION_TYPES: SessionType[] = [
  'keynote',
  'panel',
  'workshop',
  'poster',
  'oral',
  'symposium',
  'live_surgery',
  'social',
  'break',
  'other',
];

const sessionFormSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(300),
  subtitle: z.string().max(300).optional(),
  session_type: z.string().min(1),
  track_id: z.string().optional(),
  room_id: z.string().optional(),
  start_time: z.string().min(1, 'Startzeit ist erforderlich'),
  end_time: z.string().min(1, 'Endzeit ist erforderlich'),
  description: z.string().max(5000).optional(),
  max_attendees: z.number().int().positive().optional(),
  is_bookable: z.boolean(),
  is_recorded: z.boolean(),
  cme_credits: z.number().int().nonnegative().optional(),
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

interface SessionEntry {
  id: string;
  title: string;
  subtitle?: string;
  session_type: SessionType;
  track_id?: string;
  room_id?: string;
  start_time: string;
  end_time: string;
  description?: string;
  max_attendees?: number;
  is_bookable: boolean;
  is_recorded: boolean;
  cme_credits?: number;
  sort_order: number;
}

interface ConflictWarning {
  sessionA: string;
  sessionB: string;
  room: string;
}

// Placeholder data
const MOCK_TRACKS = [
  { id: 'track-1', name: 'Kardiologie' },
  { id: 'track-2', name: 'Neurologie' },
  { id: 'track-3', name: 'Allgemein' },
];

const MOCK_ROOMS = [
  { id: 'room-1', name: 'Saal A' },
  { id: 'room-2', name: 'Saal B' },
  { id: 'room-3', name: 'Workshop-Raum 1' },
];

const MOCK_SESSIONS: SessionEntry[] = [
  {
    id: 's1',
    title: 'Eröffnungskeynote',
    session_type: 'keynote',
    track_id: 'track-3',
    room_id: 'room-1',
    start_time: '2026-05-15T09:00:00',
    end_time: '2026-05-15T10:00:00',
    is_bookable: false,
    is_recorded: true,
    sort_order: 0,
  },
  {
    id: 's2',
    title: 'Aktuelle Entwicklungen in der Kardiologie',
    session_type: 'panel',
    track_id: 'track-1',
    room_id: 'room-1',
    start_time: '2026-05-15T10:30:00',
    end_time: '2026-05-15T12:00:00',
    is_bookable: true,
    is_recorded: true,
    cme_credits: 2,
    sort_order: 1,
  },
  {
    id: 's3',
    title: 'Workshop: Neurorehabilitation',
    session_type: 'workshop',
    track_id: 'track-2',
    room_id: 'room-3',
    start_time: '2026-05-15T10:30:00',
    end_time: '2026-05-15T12:00:00',
    is_bookable: true,
    is_recorded: false,
    max_attendees: 30,
    cme_credits: 3,
    sort_order: 2,
  },
];

const EMPTY_FORM: SessionFormData = {
  title: '',
  subtitle: '',
  session_type: 'keynote',
  track_id: '',
  room_id: '',
  start_time: '',
  end_time: '',
  description: '',
  max_attendees: undefined,
  is_bookable: false,
  is_recorded: false,
  cme_credits: undefined,
};

export function SessionBuilder({ congressId }: SessionBuilderProps) {
  const t = useTranslations('admin');
  const [sessions, setSessions] = useState<SessionEntry[]>(MOCK_SESSIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Group sessions by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, SessionEntry[]> = {};
    const sorted = [...sessions].sort((a, b) => a.sort_order - b.sort_order);
    for (const session of sorted) {
      const date = session.start_time.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [sessions]);

  // Conflict detection
  const conflicts = useMemo<ConflictWarning[]>(() => {
    const warnings: ConflictWarning[] = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const a = sessions[i];
        const b = sessions[j];
        if (
          a.room_id &&
          a.room_id === b.room_id &&
          a.start_time < b.end_time &&
          b.start_time < a.end_time
        ) {
          const room = MOCK_ROOMS.find((r) => r.id === a.room_id)?.name ?? a.room_id;
          warnings.push({ sessionA: a.title, sessionB: b.title, room });
        }
      }
    }
    return warnings;
  }, [sessions]);

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(session: SessionEntry) {
    setEditingId(session.id);
    setForm({
      title: session.title,
      subtitle: session.subtitle ?? '',
      session_type: session.session_type,
      track_id: session.track_id ?? '',
      room_id: session.room_id ?? '',
      start_time: session.start_time.slice(0, 16), // for datetime-local input
      end_time: session.end_time.slice(0, 16),
      description: session.description ?? '',
      max_attendees: session.max_attendees,
      is_bookable: session.is_bookable,
      is_recorded: session.is_recorded,
      cme_credits: session.cme_credits,
    });
    setModalOpen(true);
  }

  async function handleSaveSession() {
    const parsed = sessionFormSchema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(', ');
      toast.error(msg);
      return;
    }

    if (parsed.data.end_time <= parsed.data.start_time) {
      toast.error(t('sessionBuilder.errors.endBeforeStart'));
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing
        setSessions((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? { ...s, ...parsed.data, session_type: parsed.data.session_type as SessionType }
              : s
          )
        );
        toast.success(t('sessionBuilder.sessionUpdated'));
      } else {
        // Create new
        const newSession: SessionEntry = {
          id: `s-${Date.now()}`,
          ...parsed.data,
          session_type: parsed.data.session_type as SessionType,
          sort_order: sessions.length,
        };
        setSessions((prev) => [...prev, newSession]);

        // Also POST to API
        await fetch(`/api/congress/${congressId}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        toast.success(t('sessionBuilder.sessionCreated'));
      }
      setModalOpen(false);
    } catch {
      toast.error(t('sessionBuilder.errors.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success(t('sessionBuilder.sessionDeleted'));
  }

  function handleMoveUp(id: string) {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
  }

  function handleMoveDown(id: string) {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          {sessions.length} {t('sessionBuilder.sessionsCount')}
        </p>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          {t('sessionBuilder.createSession')}
        </Button>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-warning">
                {t('sessionBuilder.conflictsDetected')}
              </p>
              {conflicts.map((c, i) => (
                <p key={i} className="text-xs text-ensemble-600 dark:text-ensemble-400">
                  &laquo;{c.sessionA}&raquo; &amp; &laquo;{c.sessionB}&raquo; &mdash; {c.room}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions grouped by date */}
      {groupedByDate.map(([date, dateSessions]) => (
        <div key={date} className="space-y-3">
          <h2 className="text-sm font-semibold text-ensemble-700 dark:text-ensemble-300">
            {new Date(date).toLocaleDateString('de-CH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <div className="space-y-2">
            {dateSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(session.id)}
                      className="rounded p-0.5 text-ensemble-400 hover:text-ensemble-700 dark:hover:text-ensemble-200"
                      aria-label="Nach oben"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(session.id)}
                      className="rounded p-0.5 text-ensemble-400 hover:text-ensemble-700 dark:hover:text-ensemble-200"
                      aria-label="Nach unten"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ensemble-900 dark:text-ensemble-50 truncate">
                        {session.title}
                      </span>
                      <Badge variant="secondary" className="text-[11px]">
                        {t(`sessionTypes.${session.session_type}`)}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-ensemble-500 dark:text-ensemble-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </span>
                      {session.room_id && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {MOCK_ROOMS.find((r) => r.id === session.room_id)?.name}
                        </span>
                      )}
                      {session.cme_credits != null && session.cme_credits > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {session.cme_credits} CME
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(session)}
                      aria-label={t('sessionBuilder.editSession')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(session.id)}
                      aria-label={t('sessionBuilder.deleteSession')}
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="mb-3 h-10 w-10 text-ensemble-300 dark:text-ensemble-600" />
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('sessionBuilder.noSessions')}
            </p>
            <Button className="mt-4" onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              {t('sessionBuilder.createSession')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session Form Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <ModalHeader>
            <ModalTitle>
              {editingId
                ? t('sessionBuilder.editSession')
                : t('sessionBuilder.createSession')}
            </ModalTitle>
            <ModalDescription>
              {t('sessionBuilder.formDescription')}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('sessionBuilder.fields.title')} *
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder={t('sessionBuilder.fields.titlePlaceholder')}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('sessionBuilder.fields.subtitle')}
              </label>
              <Input
                value={form.subtitle ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              />
            </div>

            {/* Type & Track & Room */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.type')} *
                </label>
                <Select
                  value={form.session_type}
                  onValueChange={(v) => setForm((p) => ({ ...p, session_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {t(`sessionTypes.${st}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.track')}
                </label>
                <Select
                  value={form.track_id ?? ''}
                  onValueChange={(v) => setForm((p) => ({ ...p, track_id: v || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('sessionBuilder.fields.noTrack')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('sessionBuilder.fields.noTrack')}</SelectItem>
                    {MOCK_TRACKS.map((tr) => (
                      <SelectItem key={tr.id} value={tr.id}>
                        {tr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.room')}
                </label>
                <Select
                  value={form.room_id ?? ''}
                  onValueChange={(v) => setForm((p) => ({ ...p, room_id: v || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('sessionBuilder.fields.noRoom')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('sessionBuilder.fields.noRoom')}</SelectItem>
                    {MOCK_ROOMS.map((rm) => (
                      <SelectItem key={rm.id} value={rm.id}>
                        {rm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start / End Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.startTime')} *
                </label>
                <Input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.endTime')} *
                </label>
                <Input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('sessionBuilder.fields.description')}
              </label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Max Attendees / CME Credits */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.maxAttendees')}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.max_attendees ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      max_attendees: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                  {t('sessionBuilder.fields.cmeCredits')}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.cme_credits ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      cme_credits: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-ensemble-700 dark:text-ensemble-300">
                <input
                  type="checkbox"
                  checked={form.is_bookable}
                  onChange={(e) => setForm((p) => ({ ...p, is_bookable: e.target.checked }))}
                  className="h-4 w-4 rounded border-ensemble-300 text-accent-500 focus:ring-accent-500"
                />
                {t('sessionBuilder.fields.isBookable')}
              </label>
              <label className="flex items-center gap-2 text-sm text-ensemble-700 dark:text-ensemble-300">
                <input
                  type="checkbox"
                  checked={form.is_recorded}
                  onChange={(e) => setForm((p) => ({ ...p, is_recorded: e.target.checked }))}
                  className="h-4 w-4 rounded border-ensemble-300 text-accent-500 focus:ring-accent-500"
                />
                {t('sessionBuilder.fields.isRecorded')}
              </label>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveSession} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? t('common.save') : t('sessionBuilder.createSession')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
