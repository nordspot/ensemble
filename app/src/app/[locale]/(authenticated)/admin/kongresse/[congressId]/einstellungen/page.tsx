'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CongressSettingsPage() {
  const t = useTranslations('admin');
  const params = useParams<{ congressId: string }>();
  const congressId = params.congressId;

  // General settings
  const [name, setName] = useState('Swiss Medical Congress 2026');
  const [description, setDescription] = useState('Jaehrlicher medizinischer Fachkongress');
  const [startDate, setStartDate] = useState('2026-05-15');
  const [endDate, setEndDate] = useState('2026-05-17');

  // Registration settings
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-05-10');
  const [earlyBirdDeadline, setEarlyBirdDeadline] = useState('2026-04-01');
  const [earlyBirdPrice, setEarlyBirdPrice] = useState('290');
  const [regularPrice, setRegularPrice] = useState('390');

  // Feature toggles
  const [qaEnabled, setQaEnabled] = useState(true);
  const [pollsEnabled, setPollsEnabled] = useState(true);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);
  const [bleBeaconsEnabled, setBleBeaconsEnabled] = useState(false);

  // Branding
  const [accentColor, setAccentColor] = useState('#4F46E5');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  async function handleSaveGeneral() {
    setSaving(true);
    try {
      await fetch(`/api/congress/${congressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      toast.success(t('settings.saved'));
    } catch {
      toast.error(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRegistration() {
    setSaving(true);
    try {
      await fetch(`/api/congress/${congressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_open: registrationOpen,
          registration_deadline: registrationDeadline,
          early_bird_deadline: earlyBirdDeadline,
          early_bird_price_cents: Math.round(parseFloat(earlyBirdPrice) * 100),
          regular_price_cents: Math.round(parseFloat(regularPrice) * 100),
        }),
      });
      toast.success(t('settings.saved'));
    } catch {
      toast.error(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFeatures() {
    setSaving(true);
    try {
      await fetch(`/api/congress/${congressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            qa_enabled: qaEnabled,
            polls_enabled: pollsEnabled,
            gamification_enabled: gamificationEnabled,
            ble_beacons_enabled: bleBeaconsEnabled,
          },
        }),
      });
      toast.success(t('settings.saved'));
    } catch {
      toast.error(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== name) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/congress/${congressId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('settings.deleted'));
        window.location.href = '/admin/kongresse';
      } else {
        toast.error(t('settings.deleteFailed'));
      }
    } catch {
      toast.error(t('settings.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  }

  function Toggle({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
  }) {
    return (
      <label className="flex items-center justify-between py-2">
        <span className="text-sm text-ensemble-700 dark:text-ensemble-300">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-accent-500' : 'bg-ensemble-200 dark:bg-ensemble-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </label>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.sections.general')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.name')}
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('createCongress.fields.description')}
            </label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('createCongress.fields.startDate')}
              </label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('createCongress.fields.endDate')}
              </label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.sections.registration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            checked={registrationOpen}
            onChange={setRegistrationOpen}
            label={t('settings.registrationOpen')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('settings.registrationDeadline')}
              </label>
              <Input
                type="date"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('settings.earlyBirdDeadline')}
              </label>
              <Input
                type="date"
                value={earlyBirdDeadline}
                onChange={(e) => setEarlyBirdDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('settings.earlyBirdPrice')}
              </label>
              <Input
                type="number"
                min={0}
                value={earlyBirdPrice}
                onChange={(e) => setEarlyBirdPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                {t('settings.regularPrice')}
              </label>
              <Input
                type="number"
                min={0}
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveRegistration} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.sections.features')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Toggle checked={qaEnabled} onChange={setQaEnabled} label={t('settings.features.qa')} />
          <Toggle checked={pollsEnabled} onChange={setPollsEnabled} label={t('settings.features.polls')} />
          <Toggle
            checked={gamificationEnabled}
            onChange={setGamificationEnabled}
            label={t('settings.features.gamification')}
          />
          <Toggle
            checked={bleBeaconsEnabled}
            onChange={setBleBeaconsEnabled}
            label={t('settings.features.bleBeacons')}
          />
          <div className="flex justify-end pt-3">
            <Button onClick={handleSaveFeatures} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.sections.branding')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('settings.logoUpload')}
            </label>
            <Input type="file" accept="image/*" />
            <p className="mt-1 text-xs text-ensemble-400 dark:text-ensemble-500">
              {t('settings.logoHint')}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('settings.accentColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-ensemble-200 dark:border-ensemble-700"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-32"
                maxLength={7}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/30">
        <CardHeader>
          <CardTitle className="text-base text-error">{t('settings.dangerZone')}</CardTitle>
          <CardDescription>{t('settings.dangerZoneDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ensemble-600 dark:text-ensemble-400">
            {t('settings.deleteWarning')}
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              {t('settings.deleteConfirmLabel', { name })}
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={name}
            />
          </div>
          <Button
            variant="destructive"
            disabled={deleteConfirm !== name || deleting}
            onClick={handleDelete}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t('settings.deleteCongress')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
