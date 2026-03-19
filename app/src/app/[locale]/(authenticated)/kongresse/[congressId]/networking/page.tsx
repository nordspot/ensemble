'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNFC } from '@/hooks/use-nfc';
import { useBeacon } from '@/hooks/use-beacon';
import type { BeaconConfig } from '@/lib/beacon/zone-resolver';

interface Contact {
  id: string;
  name: string;
  email: string;
  organization?: string;
}

const emptyBeaconConfig: BeaconConfig = new Map();

export default function NetworkingPage() {
  const params = useParams<{ locale: string; congressId: string }>();
  const congressId = params.congressId;
  const t = useTranslations('networking');

  const nfc = useNFC();
  const beacon = useBeacon(emptyBeaconConfig);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nfcStatus, setNfcStatus] = useState<string | null>(null);

  // ── NFC Tap to Connect ──────────────────────────────────────────────
  const handleTapToConnect = useCallback(async () => {
    if (!nfc.isSupported) {
      setNfcStatus(t('nfcNotSupported'));
      return;
    }
    setNfcStatus(null);
    const result = await nfc.readTag();
    if (result) {
      // Add scanned contact from NFC badge
      const newContact: Contact = {
        id: result.userId,
        name: result.userId,
        email: '',
        organization: undefined,
      };
      // Try to fetch profile data for the scanned user
      try {
        const res = await fetch(`/api/profiles/${result.userId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            newContact.name = json.data.full_name ?? result.userId;
            newContact.email = json.data.email ?? '';
            newContact.organization = json.data.organization ?? undefined;
          }
        }
      } catch {
        // Use userId as fallback name
      }
      setContacts((prev) => {
        if (prev.some((c) => c.id === newContact.id)) return prev;
        return [...prev, newContact];
      });
      setNfcStatus(null);
    }
  }, [nfc, t]);

  // ── Export contacts as CSV ──────────────────────────────────────────
  const handleExportContacts = useCallback(() => {
    if (contacts.length === 0) return;

    const header = 'Name,E-Mail,Organisation';
    const rows = contacts.map(
      (c) =>
        `"${c.name.replace(/"/g, '""')}","${c.email.replace(/"/g, '""')}","${(c.organization ?? '').replace(/"/g, '""')}"`,
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kontakte-${congressId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [contacts, congressId]);

  // ── Enable Bluetooth beacon scanning ────────────────────────────────
  const handleEnableBluetooth = useCallback(async () => {
    if (!beacon.isSupported) {
      return;
    }
    if (beacon.isScanning) {
      beacon.stopScanning();
    } else {
      await beacon.startScanning();
    }
  }, [beacon]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Search attendees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('findAttendees')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="search" placeholder={t('searchPlaceholder')} />
          <p className="mt-3 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('searchHint')}
          </p>
        </CardContent>
      </Card>

      {/* NFC tap section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/></svg>
            {t('nfcTap')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent-50 dark:bg-accent-950/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-500"><path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/></svg>
          </div>
          <p className="mt-4 text-sm text-ensemble-600 dark:text-ensemble-300">
            {t('nfcHint')}
          </p>
          {nfcStatus && (
            <p className="mt-2 text-xs text-red-500">{nfcStatus}</p>
          )}
          {nfc.error && (
            <p className="mt-2 text-xs text-red-500">{nfc.error}</p>
          )}
          <Button
            className="mt-4"
            onClick={handleTapToConnect}
            disabled={nfc.isReading}
          >
            {nfc.isReading ? 'Lese NFC-Tag...' : t('tapToConnect')}
          </Button>
        </CardContent>
      </Card>

      {/* Contacts list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('myContacts')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportContacts}
            disabled={contacts.length === 0}
          >
            {t('exportContacts')}
          </Button>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('noContacts')}
            </p>
          ) : (
            <ul className="divide-y divide-ensemble-100 dark:divide-ensemble-800">
              {contacts.map((contact) => (
                <li key={contact.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                    {contact.name}
                  </p>
                  {contact.email && (
                    <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                      {contact.email}
                    </p>
                  )}
                  {contact.organization && (
                    <p className="text-xs text-ensemble-400 dark:text-ensemble-500">
                      {contact.organization}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Nearby people (BLE) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {t('nearbyPeople')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('nearbyHint')}
          </p>
          {beacon.error && (
            <p className="mt-2 text-xs text-red-500">{beacon.error}</p>
          )}
          {beacon.isScanning && beacon.nearbyBeacons.length > 0 && (
            <p className="mt-2 text-xs text-accent-500">
              {beacon.nearbyBeacons.length} Geraete in der Naehe
            </p>
          )}
          <Button
            variant="outline"
            className="mt-3"
            onClick={handleEnableBluetooth}
          >
            {beacon.isScanning ? 'Bluetooth deaktivieren' : t('enableBluetooth')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
