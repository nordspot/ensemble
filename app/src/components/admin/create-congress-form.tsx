'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { generateSlug } from '@/lib/utils/slug';
import type { CongressDiscipline } from '@/types';

const DISCIPLINES: CongressDiscipline[] = [
  'medical',
  'engineering',
  'legal',
  'academic',
  'scientific',
  'other',
];

const CURRENCIES = ['CHF', 'EUR', 'USD', 'GBP'] as const;

const createCongressSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(200),
  slug: z.string().min(1).max(64),
  subtitle: z.string().max(300).optional(),
  discipline: z.enum(['medical', 'engineering', 'legal', 'academic', 'scientific', 'other']),
  start_date: z.string().min(1, 'Startdatum ist erforderlich'),
  end_date: z.string().min(1, 'Enddatum ist erforderlich'),
  venue_name: z.string().max(200).optional(),
  venue_address: z.string().max(300).optional(),
  venue_city: z.string().max(100).optional(),
  venue_country: z.string().max(2).optional(),
  description: z.string().max(5000).optional(),
  max_attendees: z.number().int().positive().optional(),
  currency: z.string().min(1),
  early_bird_price_cents: z.number().int().nonnegative().optional(),
  regular_price_cents: z.number().int().nonnegative().optional(),
});

type FormData = z.infer<typeof createCongressSchema>;

interface FieldErrors {
  [key: string]: string | undefined;
}

export function CreateCongressForm() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<FormData>({
    name: '',
    slug: '',
    subtitle: '',
    discipline: 'medical',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_country: 'CH',
    description: '',
    max_attendees: undefined,
    currency: 'CHF',
    early_bird_price_cents: undefined,
    regular_price_cents: undefined,
  });

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleNameChange = useCallback(
    (value: string) => {
      updateField('name', value);
      updateField('slug', generateSlug(value));
    },
    [updateField]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = createCongressSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (parsed.data.end_date < parsed.data.start_date) {
      setErrors({ end_date: t('createCongress.errors.endBeforeStart') });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/congress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          organization_id: 'org-placeholder', // TODO: use real org from session
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? t('createCongress.errors.generic');
        toast.error(message);
        return;
      }

      const { data } = (await res.json()) as { data: { id: string } };
      toast.success(t('createCongress.success'));
      router.push(`/admin/kongresse/${data.id}`);
    } catch {
      toast.error(t('createCongress.errors.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  function FieldError({ field }: { field: string }) {
    if (!errors[field]) return null;
    return (
      <p className="mt-1 text-xs text-error">{errors[field]}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('createCongress.sections.basic')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.name')} *
            </label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('createCongress.fields.namePlaceholder')}
            />
            <FieldError field="name" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.slug')}
            </label>
            <Input
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="mein-kongress-2026"
            />
            <p className="mt-1 text-xs text-ensemble-400 dark:text-ensemble-500">
              {t('createCongress.fields.slugHint')}
            </p>
            <FieldError field="slug" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.subtitle')}
            </label>
            <Input
              value={form.subtitle ?? ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder={t('createCongress.fields.subtitlePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.discipline')} *
            </label>
            <Select
              value={form.discipline}
              onValueChange={(v) => updateField('discipline', v as CongressDiscipline)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {t(`disciplines.${d}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.description')}
            </label>
            <Textarea
              value={form.description ?? ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              placeholder={t('createCongress.fields.descriptionPlaceholder')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('createCongress.sections.dates')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.startDate')} *
            </label>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => updateField('start_date', e.target.value)}
            />
            <FieldError field="start_date" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.endDate')} *
            </label>
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => updateField('end_date', e.target.value)}
            />
            <FieldError field="end_date" />
          </div>
        </CardContent>
      </Card>

      {/* Venue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('createCongress.sections.venue')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.venueName')}
            </label>
            <Input
              value={form.venue_name ?? ''}
              onChange={(e) => updateField('venue_name', e.target.value)}
              placeholder={t('createCongress.fields.venueNamePlaceholder')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.venueAddress')}
            </label>
            <Input
              value={form.venue_address ?? ''}
              onChange={(e) => updateField('venue_address', e.target.value)}
              placeholder={t('createCongress.fields.venueAddressPlaceholder')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('createCongress.fields.venueCity')}
              </label>
              <Input
                value={form.venue_city ?? ''}
                onChange={(e) => updateField('venue_city', e.target.value)}
                placeholder="Zuerich"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('createCongress.fields.venueCountry')}
              </label>
              <Input
                value={form.venue_country ?? ''}
                onChange={(e) => updateField('venue_country', e.target.value)}
                placeholder="CH"
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('createCongress.sections.pricing')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.maxAttendees')}
            </label>
            <Input
              type="number"
              min={1}
              value={form.max_attendees ?? ''}
              onChange={(e) =>
                updateField('max_attendees', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              placeholder="500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.currency')}
            </label>
            <Select
              value={form.currency}
              onValueChange={(v) => updateField('currency', v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('createCongress.fields.earlyBirdPrice')}
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.early_bird_price_cents != null ? form.early_bird_price_cents / 100 : ''}
                onChange={(e) =>
                  updateField(
                    'early_bird_price_cents',
                    e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                  )
                }
                placeholder="290.00"
              />
              <p className="mt-1 text-xs text-ensemble-400 dark:text-ensemble-500">
                {t('createCongress.fields.priceHint')}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('createCongress.fields.regularPrice')}
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.regular_price_cents != null ? form.regular_price_cents / 100 : ''}
                onChange={(e) =>
                  updateField(
                    'regular_price_cents',
                    e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                  )
                }
                placeholder="390.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/kongresse')}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('createCongress.submit')}
        </Button>
      </div>
    </form>
  );
}
