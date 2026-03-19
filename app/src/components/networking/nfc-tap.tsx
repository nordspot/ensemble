'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNFC } from '@/hooks/use-nfc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarRoot, AvatarFallback } from '@/components/ui/avatar';

interface ContactPreview {
  userId: string;
  name: string;
  organization?: string;
  title?: string;
  avatarUrl?: string;
  profileUrl: string;
}

interface NFCTapProps {
  congressId: string;
  onContactSaved?: (contact: ContactPreview) => void;
  onFallbackQR?: () => void;
}

export function NFCTap({ congressId, onContactSaved, onFallbackQR }: NFCTapProps) {
  const t = useTranslations('nfc');
  const { isSupported, isReading, readTag, error } = useNFC();
  const [contact, setContact] = useState<ContactPreview | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleScan = async () => {
    const result = await readTag();
    if (!result) return;

    // Fetch the contact's profile
    try {
      const res = await fetch(`/api/congress/${congressId}/contacts/preview?userId=${result.userId}`);
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; data: ContactPreview };
        if (data.ok) {
          setContact({ ...data.data, profileUrl: result.profileUrl });
        }
      }
    } catch {
      // Show minimal preview if profile fetch fails
      setContact({
        userId: result.userId,
        name: result.userId,
        profileUrl: result.profileUrl,
      });
    }
  };

  const handleSaveContact = async () => {
    if (!contact) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/congress/${congressId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactUserId: contact.userId }),
      });

      if (res.ok) {
        setSaved(true);
        onContactSaved?.(contact);
      }
    } catch {
      // Error handled silently; the user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContact(null);
    setSaved(false);
  };

  // ── Contact preview card ──────────────────────────────────

  if (contact) {
    return (
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="flex items-center gap-4">
            <AvatarRoot className="h-14 w-14">
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-lg font-semibold">
                  {contact.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </AvatarRoot>
            <div className="min-w-0">
              <p className="font-semibold text-ensemble-900 dark:text-ensemble-50 truncate">
                {contact.name}
              </p>
              {contact.title && (
                <p className="text-sm text-ensemble-500 dark:text-ensemble-400 truncate">
                  {contact.title}
                </p>
              )}
              {contact.organization && (
                <p className="text-sm text-ensemble-500 dark:text-ensemble-400 truncate">
                  {contact.organization}
                </p>
              )}
            </div>
          </div>

          {saved ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {t('contactSaved')}
              </p>
              <Button variant="outline" onClick={handleReset} className="w-full">
                {t('scanAnother')}
              </Button>
            </div>
          ) : (
            <Button onClick={handleSaveContact} disabled={saving} className="w-full">
              {saving ? t('saving') : t('saveContact')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Scan prompt ───────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NFC illustration placeholder */}
        <div className="flex items-center justify-center h-32 rounded-lg bg-ensemble-50 dark:bg-ensemble-800">
          <svg
            viewBox="0 0 64 64"
            className="h-16 w-16 text-ensemble-400 dark:text-ensemble-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="16" y="8" width="32" height="48" rx="4" />
            <path d="M28 32 a8 8 0 0 1 8 0" />
            <path d="M24 28 a14 14 0 0 1 16 0" />
            <path d="M20 24 a20 20 0 0 1 24 0" />
            <circle cx="32" cy="36" r="2" fill="currentColor" />
          </svg>
        </div>

        {isSupported ? (
          <Button onClick={handleScan} disabled={isReading} className="w-full">
            {isReading ? t('reading') : t('scanBadge')}
          </Button>
        ) : (
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400 text-center">
            {t('notSupported')}
          </p>
        )}

        {/* QR fallback */}
        <Button variant="outline" onClick={onFallbackQR} className="w-full">
          {t('qrFallback')}
        </Button>

        {error && <p className="text-sm text-error">{error}</p>}
      </CardContent>
    </Card>
  );
}
