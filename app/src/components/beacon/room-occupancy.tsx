'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RoomOccupancyData {
  id: string;
  name: string;
  current: number;
  max: number;
}

interface RoomOccupancyProps {
  rooms: RoomOccupancyData[];
}

function occupancyColor(ratio: number): string {
  if (ratio >= 0.8) return 'bg-red-500';
  if (ratio >= 0.5) return 'bg-yellow-500';
  return 'bg-green-500';
}

function occupancyTextColor(ratio: number): string {
  if (ratio >= 0.8) return 'text-red-600 dark:text-red-400';
  if (ratio >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export function RoomOccupancy({ rooms }: RoomOccupancyProps) {
  const t = useTranslations('beacon.occupancy');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-ensemble-900 dark:text-ensemble-50">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('empty')}
          </p>
        ) : (
          <ul className="space-y-3">
            {rooms.map((room) => {
              const ratio = room.max > 0 ? room.current / room.max : 0;
              return (
                <li key={room.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-ensemble-700 dark:text-ensemble-300 truncate">
                      {room.name}
                    </span>
                    <span className={cn('text-xs font-medium', occupancyTextColor(ratio))}>
                      {room.current}/{room.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ensemble-100 dark:bg-ensemble-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', occupancyColor(ratio))}
                      style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
