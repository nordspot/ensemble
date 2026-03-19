'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  title: string | null;
  organization_name: string | null;
  department: string | null;
  specialty: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  bio: string | null;
  linkedin_url: string | null;
  orcid: string | null;
  website: string | null;
  preferred_language: string;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  ble_location_enabled: boolean | number;
  avatar_url: string | null;
  role: string;
}

export function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/profile');
      const result = (await response.json()) as { ok: boolean; data: ProfileData };
      if (result.ok) {
        setProfile(result.data);
      }
    } catch {
      toast.error('Profil konnte nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      full_name: formData.get('full_name') as string,
      title: (formData.get('title') as string) || null,
      organization_name: (formData.get('organization_name') as string) || null,
      department: (formData.get('department') as string) || null,
      specialty: (formData.get('specialty') as string) || null,
      country: (formData.get('country') as string) || null,
      city: (formData.get('city') as string) || null,
      phone: (formData.get('phone') as string) || null,
      bio: (formData.get('bio') as string) || null,
      linkedin_url: (formData.get('linkedin_url') as string) || null,
      orcid: (formData.get('orcid') as string) || null,
      website: (formData.get('website') as string) || null,
      preferred_language: formData.get('preferred_language') as string,
      dietary_requirements: (formData.get('dietary_requirements') as string) || null,
      accessibility_needs: (formData.get('accessibility_needs') as string) || null,
      ble_location_enabled: formData.get('ble_location_enabled') === 'on',
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as { ok: boolean };

      if (result.ok) {
        toast.success('Profil erfolgreich gespeichert.');
      } else {
        toast.error('Profil konnte nicht gespeichert werden.');
      }
    } catch {
      toast.error('Ein Fehler ist aufgetreten.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch('/api/profile', { method: 'DELETE' });
      const result = (await response.json()) as { ok: boolean };
      if (result.ok) {
        toast.success('Konto wurde gelöscht.');
        window.location.href = '/';
      } else {
        toast.error('Konto konnte nicht gelöscht werden.');
      }
    } catch {
      toast.error('Ein Fehler ist aufgetreten.');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-ensemble-100 dark:bg-ensemble-800" />
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-ensemble-200 bg-white p-8 text-center dark:border-ensemble-700 dark:bg-ensemble-900">
        <p className="text-ensemble-500 dark:text-ensemble-400">
          Profil konnte nicht geladen werden.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Avatar Section */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Profilbild
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-ensemble-100 dark:bg-ensemble-800">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <svg className="h-12 w-12 text-ensemble-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              JPG, PNG oder GIF. Max. 2 MB.
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-2">
              Bild ändern
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Persönliche Informationen
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Vollständiger Name *
            </label>
            <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ''} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Titel / Anrede
            </label>
            <Input id="title" name="title" placeholder="z.B. Dr. med., Prof." defaultValue={profile.title ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="email_display" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              E-Mail
            </label>
            <Input id="email_display" value={profile.email} disabled className="bg-ensemble-50 dark:bg-ensemble-800/50" />
            <p className="text-xs text-ensemble-400">E-Mail-Adresse kann nicht geändert werden.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Telefon
            </label>
            <Input id="phone" name="phone" type="tel" placeholder="+41 ..." defaultValue={profile.phone ?? ''} />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Berufliche Informationen
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="organization_name" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Organisation
            </label>
            <Input id="organization_name" name="organization_name" placeholder="z.B. Universitätsspital Bern" defaultValue={profile.organization_name ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Abteilung
            </label>
            <Input id="department" name="department" defaultValue={profile.department ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="specialty" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Fachgebiet
            </label>
            <Input id="specialty" name="specialty" placeholder="z.B. Kardiologie" defaultValue={profile.specialty ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Land
            </label>
            <Input id="country" name="country" placeholder="z.B. Schweiz" defaultValue={profile.country ?? ''} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="city" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Stadt
            </label>
            <Input id="city" name="city" defaultValue={profile.city ?? ''} />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Biografie
        </h3>
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
            Über Sie
          </label>
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder="Erzählen Sie etwas über sich..."
            defaultValue={profile.bio ?? ''}
            maxLength={2000}
          />
          <p className="text-xs text-ensemble-400">Max. 2000 Zeichen</p>
        </div>
      </div>

      {/* Online Presence */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Online-Präsenz
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="linkedin_url" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              LinkedIn URL
            </label>
            <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." defaultValue={profile.linkedin_url ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="orcid" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              ORCID
            </label>
            <Input id="orcid" name="orcid" placeholder="0000-0000-0000-0000" defaultValue={profile.orcid ?? ''} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="website" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Website
            </label>
            <Input id="website" name="website" type="url" placeholder="https://..." defaultValue={profile.website ?? ''} />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Einstellungen
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="preferred_language" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Bevorzugte Sprache
            </label>
            <select
              id="preferred_language"
              name="preferred_language"
              defaultValue={profile.preferred_language}
              className="flex h-10 w-full rounded-lg border border-ensemble-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:border-ensemble-700 dark:bg-ensemble-900 dark:text-ensemble-50"
            >
              <option value="de">Deutsch</option>
              <option value="fr">Französisch</option>
              <option value="it">Italienisch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="dietary_requirements" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Ernährungsbedürfnisse
            </label>
            <Input id="dietary_requirements" name="dietary_requirements" placeholder="z.B. vegetarisch, vegan, glutenfrei" defaultValue={profile.dietary_requirements ?? ''} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="accessibility_needs" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
              Barrierefreiheit
            </label>
            <Input id="accessibility_needs" name="accessibility_needs" placeholder="z.B. Rollstuhlzugang, Hörhilfe" defaultValue={profile.accessibility_needs ?? ''} />
          </div>
        </div>
      </div>

      {/* Privacy & Notifications */}
      <div className="rounded-xl border border-ensemble-200 bg-white p-6 dark:border-ensemble-700 dark:bg-ensemble-900">
        <h3 className="mb-4 text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          Datenschutz & Benachrichtigungen
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="ble_location_enabled"
              defaultChecked={!!profile.ble_location_enabled}
              className="h-4 w-4 rounded border-ensemble-300 text-accent-500 focus:ring-accent-500"
            />
            <div>
              <span className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                BLE-Standortbestimmung aktivieren
              </span>
              <p className="text-xs text-ensemble-400">
                Ermöglicht Indoor-Navigation und Standort-basierte Dienste während Fachkongressen.
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="push_notifications"
              defaultChecked
              className="h-4 w-4 rounded border-ensemble-300 text-accent-500 focus:ring-accent-500"
            />
            <div>
              <span className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
                Push-Benachrichtigungen
              </span>
              <p className="text-xs text-ensemble-400">
                Erhalten Sie Benachrichtigungen über Session-Änderungen, Nachrichten und Updates.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Speichern...
            </span>
          ) : (
            'Änderungen speichern'
          )}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
          Gefahrenzone
        </h3>
        <p className="mb-4 text-sm text-red-600/80 dark:text-red-400/80">
          Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten werden permanent entfernt.
        </p>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Ja, Konto endgültig löschen
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Abbrechen
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Konto löschen
          </Button>
        )}
      </div>
    </form>
  );
}
