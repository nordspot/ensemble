'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ── Zod schemas per step ────────────────────────────────────────────────

const personalSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  dietary: z.string().optional(),
  accessibility: z.string().optional(),
});

const ticketSchema = z.object({
  ticketType: z.enum(['early_bird', 'standard', 'vip', 'virtual']),
});

const sessionsSchema = z.object({
  selectedSessions: z.array(z.string()),
});

type PersonalData = z.infer<typeof personalSchema>;
type TicketData = z.infer<typeof ticketSchema>;
type SessionsData = z.infer<typeof sessionsSchema>;

interface FormState {
  personal: PersonalData;
  ticket: TicketData;
  sessions: SessionsData;
}

interface TicketOption {
  type: 'early_bird' | 'standard' | 'vip' | 'virtual';
  priceCents: number;
}

interface BookableSession {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  room_name: string | null;
}

interface RegistrationWizardProps {
  slug: string;
  locale: string;
}

const TICKET_OPTIONS: TicketOption[] = [
  { type: 'early_bird', priceCents: 29000 },
  { type: 'standard', priceCents: 39000 },
  { type: 'vip', priceCents: 79000 },
  { type: 'virtual', priceCents: 14900 },
];

const INITIAL_STATE: FormState = {
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    title: '',
    dietary: '',
    accessibility: '',
  },
  ticket: { ticketType: 'standard' },
  sessions: { selectedSessions: [] },
};

export function RegistrationWizard({ slug, locale }: RegistrationWizardProps) {
  const t = useTranslations('registration');
  const tCommon = useTranslations('common');

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookableSessions] = useState<BookableSession[]>([]);

  const STEPS = [
    t('steps.personal'),
    t('steps.ticket'),
    t('steps.sessions'),
    t('steps.review'),
  ];

  const totalSteps = STEPS.length;

  const formatPrice = useCallback((cents: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CHF',
    }).format(cents / 100);
  }, [locale]);

  const selectedTicket = TICKET_OPTIONS.find(
    (o) => o.type === form.ticket.ticketType
  );

  // ── Validation ──────────────────────────────────────────────────────

  function validateStep(currentStep: number): boolean {
    setErrors({});
    if (currentStep === 0) {
      const result = personalSchema.safeParse(form.personal);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as string;
          fieldErrors[key] = tCommon('errors.required');
        }
        setErrors(fieldErrors);
        return false;
      }
    }
    if (currentStep === 1) {
      const result = ticketSchema.safeParse(form.ticket);
      if (!result.success) {
        setErrors({ ticketType: tCommon('errors.required') });
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // ── Submit ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/congress/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.personal.firstName,
          last_name: form.personal.lastName,
          email: form.personal.email,
          phone: form.personal.phone || undefined,
          organization: form.personal.organization || undefined,
          title: form.personal.title || undefined,
          dietary_requirements: form.personal.dietary || undefined,
          accessibility_needs: form.personal.accessibility || undefined,
          ticket_type: form.ticket.ticketType,
          selected_sessions: form.sessions.selectedSessions,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data && typeof data === 'object' && 'error' in data
            ? (data as { error: { message: string } }).error.message
            : tCommon('errors.serverError');
        setErrors({ submit: msg });
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ submit: tCommon('errors.serverError') });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ───────────────────────────────────────────────────

  if (submitted) {
    return (
      <Card className="text-center">
        <CardContent className="py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('successTitle')}
          </h2>
          <p className="mt-2 text-ensemble-500 dark:text-ensemble-400">
            {t('successMessage')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Step indicators ─────────────────────────────────────────────────

  function StepIndicator() {
    return (
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  i < step
                    ? 'bg-accent-500 text-white'
                    : i === step
                      ? 'bg-accent-500 text-white ring-4 ring-accent-500/20'
                      : 'bg-ensemble-200 text-ensemble-500 dark:bg-ensemble-700 dark:text-ensemble-400'
                )}
              >
                {i < step ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="mt-1.5 text-xs text-ensemble-500 dark:text-ensemble-400 hidden sm:block">
                {label}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-12 sm:w-20 transition-colors',
                  i < step
                    ? 'bg-accent-500'
                    : 'bg-ensemble-200 dark:bg-ensemble-700'
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Step 1: Personal data ───────────────────────────────────────────

  function StepPersonal() {
    function update(field: keyof PersonalData, value: string) {
      setForm((prev) => ({
        ...prev,
        personal: { ...prev.personal, [field]: value },
      }));
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.personal')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('fields.firstName')} *
              </label>
              <Input
                value={form.personal.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder={t('fields.firstNamePlaceholder')}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-error">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('fields.lastName')} *
              </label>
              <Input
                value={form.personal.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                placeholder={t('fields.lastNamePlaceholder')}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-error">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('fields.email')} *
            </label>
            <Input
              type="email"
              value={form.personal.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder={t('fields.emailPlaceholder')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error">{errors.email}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('fields.phone')}
              </label>
              <Input
                type="tel"
                value={form.personal.phone ?? ''}
                onChange={(e) => update('phone', e.target.value)}
                placeholder={t('fields.phonePlaceholder')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('fields.organization')}
              </label>
              <Input
                value={form.personal.organization ?? ''}
                onChange={(e) => update('organization', e.target.value)}
                placeholder={t('fields.organizationPlaceholder')}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('fields.title')}
              </label>
              <Input
                value={form.personal.title ?? ''}
                onChange={(e) => update('title', e.target.value)}
                placeholder={t('fields.titlePlaceholder')}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('fields.dietary')}
            </label>
            <Input
              value={form.personal.dietary ?? ''}
              onChange={(e) => update('dietary', e.target.value)}
              placeholder={t('fields.dietaryPlaceholder')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('fields.accessibility')}
            </label>
            <Input
              value={form.personal.accessibility ?? ''}
              onChange={(e) => update('accessibility', e.target.value)}
              placeholder={t('fields.accessibilityPlaceholder')}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Step 2: Ticket selection ────────────────────────────────────────

  function StepTicket() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.ticket')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {TICKET_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    ticket: { ticketType: opt.type },
                  }))
                }
                className={cn(
                  'relative flex flex-col rounded-xl border-2 p-5 text-left transition-all',
                  form.ticket.ticketType === opt.type
                    ? 'border-accent-500 bg-accent-500/5 dark:bg-accent-500/10'
                    : 'border-ensemble-200 hover:border-ensemble-300 dark:border-ensemble-700 dark:hover:border-ensemble-600'
                )}
              >
                {form.ticket.ticketType === opt.type && (
                  <div className="absolute right-3 top-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                )}
                <span className="text-sm font-semibold text-ensemble-900 dark:text-ensemble-50">
                  {t(`ticketTypes.${opt.type}`)}
                </span>
                <span className="mt-1 text-2xl font-bold text-accent-600 dark:text-accent-400">
                  {formatPrice(opt.priceCents)}
                </span>
                <span className="mt-1 text-xs text-ensemble-500 dark:text-ensemble-400">
                  {t(`ticketDescriptions.${opt.type}`)}
                </span>
              </button>
            ))}
          </div>
          {errors.ticketType && (
            <p className="mt-2 text-xs text-error">{errors.ticketType}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Step 3: Session pre-selection ───────────────────────────────────

  function StepSessions() {
    function toggleSession(sessionId: string) {
      setForm((prev) => {
        const selected = prev.sessions.selectedSessions;
        const next = selected.includes(sessionId)
          ? selected.filter((id) => id !== sessionId)
          : [...selected, sessionId];
        return { ...prev, sessions: { selectedSessions: next } };
      });
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.sessions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {bookableSessions.length === 0 ? (
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('noBookableSessions')}
            </p>
          ) : (
            <div className="space-y-3">
              {bookableSessions.map((session) => {
                const checked =
                  form.sessions.selectedSessions.includes(session.id);
                return (
                  <label
                    key={session.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                      checked
                        ? 'border-accent-500 bg-accent-500/5 dark:bg-accent-500/10'
                        : 'border-ensemble-200 dark:border-ensemble-700'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSession(session.id)}
                      className="mt-0.5 h-4 w-4 rounded border-ensemble-300 text-accent-500 focus:ring-accent-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                        {session.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ensemble-500 dark:text-ensemble-400">
                        {new Date(session.start_time).toLocaleString(locale)} &mdash;{' '}
                        {new Date(session.end_time).toLocaleTimeString(locale)}
                        {session.room_name && ` | ${session.room_name}`}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Step 4: Review ──────────────────────────────────────────────────

  function StepReview() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.review')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-ensemble-700 dark:text-ensemble-300">
              {t('steps.personal')}
            </h4>
            <div className="grid gap-1 text-sm text-ensemble-600 dark:text-ensemble-400">
              <p>
                {form.personal.title && `${form.personal.title} `}
                {form.personal.firstName} {form.personal.lastName}
              </p>
              <p>{form.personal.email}</p>
              {form.personal.phone && <p>{form.personal.phone}</p>}
              {form.personal.organization && (
                <p>{form.personal.organization}</p>
              )}
            </div>
          </div>

          <div className="border-t border-ensemble-100 dark:border-ensemble-800 pt-4">
            <h4 className="mb-2 text-sm font-semibold text-ensemble-700 dark:text-ensemble-300">
              {t('steps.ticket')}
            </h4>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {t(`ticketTypes.${form.ticket.ticketType}`)}
              </Badge>
              <span className="text-lg font-bold text-ensemble-900 dark:text-ensemble-50">
                {selectedTicket ? formatPrice(selectedTicket.priceCents) : '---'}
              </span>
            </div>
          </div>

          {form.sessions.selectedSessions.length > 0 && (
            <div className="border-t border-ensemble-100 dark:border-ensemble-800 pt-4">
              <h4 className="mb-2 text-sm font-semibold text-ensemble-700 dark:text-ensemble-300">
                {t('steps.sessions')}
              </h4>
              <p className="text-sm text-ensemble-600 dark:text-ensemble-400">
                {form.sessions.selectedSessions.length}{' '}
                {t('sessionsSelected')}
              </p>
            </div>
          )}

          <div className="border-t border-ensemble-100 dark:border-ensemble-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ensemble-700 dark:text-ensemble-300">
                {t('total')}
              </span>
              <span className="text-xl font-bold text-ensemble-900 dark:text-ensemble-50">
                {selectedTicket ? formatPrice(selectedTicket.priceCents) : '---'}
              </span>
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-error">{errors.submit}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  const stepComponents = [
    <StepPersonal key="personal" />,
    <StepTicket key="ticket" />,
    <StepSessions key="sessions" />,
    <StepReview key="review" />,
  ];

  return (
    <div>
      <StepIndicator />

      <div className="transition-opacity duration-200">
        {stepComponents[step]}
      </div>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
        >
          {t('back')}
        </Button>

        {step < totalSteps - 1 ? (
          <Button onClick={handleNext}>{t('next')}</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? t('submitting') : t('toPayment')}
          </Button>
        )}
      </div>
    </div>
  );
}
