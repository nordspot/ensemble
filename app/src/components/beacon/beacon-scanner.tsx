'use client';

import { useTranslations } from 'next-intl';
import { useBeaconStore } from '@/stores/beacon-store';
import { useBeacon } from '@/hooks/use-beacon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PrivacyLevel } from '@/types';
import type { BeaconConfig } from '@/lib/beacon/zone-resolver';

interface BeaconScannerProps {
  beaconConfig: BeaconConfig;
}

const PRIVACY_OPTIONS: { value: PrivacyLevel; labelKey: string }[] = [
  { value: 'off', labelKey: 'privacyOff' },
  { value: 'navigation', labelKey: 'privacyNavigation' },
  { value: 'full', labelKey: 'privacyFull' },
];

export function BeaconScannerCard({ beaconConfig }: BeaconScannerProps) {
  const t = useTranslations('beacon');
  const store = useBeaconStore();
  const {
    isScanning,
    currentZone,
    nearbyBeacons,
    error,
    startScanning,
    stopScanning,
    isSupported,
  } = useBeacon(beaconConfig);

  const handlePrivacyChange = (level: PrivacyLevel) => {
    store.setPrivacyLevel(level);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </CardTitle>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          {t('privacyExplanation')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Privacy level selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
            {t('privacyLevel')}
          </label>
          <div className="flex gap-2">
            {PRIVACY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePrivacyChange(option.value)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  store.privacyLevel === option.value
                    ? 'bg-accent-500 text-white'
                    : 'bg-ensemble-100 text-ensemble-700 hover:bg-ensemble-200 dark:bg-ensemble-800 dark:text-ensemble-300 dark:hover:bg-ensemble-700'
                }`}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Start/Stop button */}
        {isSupported && store.privacyLevel !== 'off' && (
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            variant={isScanning ? 'secondary' : 'default'}
            className="w-full"
          >
            {isScanning ? t('stopScanning') : t('startScanning')}
          </Button>
        )}

        {!isSupported && (
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('notSupported')}
          </p>
        )}

        {/* Status */}
        {isScanning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-sm text-ensemble-700 dark:text-ensemble-300">
                {t('scanning')}
              </span>
            </div>

            <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('beaconsFound', { count: nearbyBeacons.length })}
            </p>

            {currentZone && (
              <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
                {t('currentZone')}: {currentZone.zone}
              </p>
            )}
          </div>
        )}

        {/* Battery warning */}
        {store.privacyLevel !== 'off' && (
          <p className="text-xs text-ensemble-400 dark:text-ensemble-500">
            {t('batteryWarning')}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
