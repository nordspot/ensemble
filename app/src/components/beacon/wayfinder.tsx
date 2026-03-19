'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  findPath,
  buildGraph,
  type WayfinderNode,
  type WayfinderEdge,
  type WayfinderResult,
} from '@/lib/beacon/wayfinder-algorithm';

interface WayfinderProps {
  nodes: WayfinderNode[];
  edges: WayfinderEdge[];
  currentNodeId: string | null;
  rooms: Array<{ id: string; name: string; linkedNodeId: string }>;
  accessibleOnly?: boolean;
  onRouteCalculated?: (path: Array<{ x: number; y: number }>) => void;
  onRouteCancelled?: () => void;
}

export function Wayfinder({
  nodes,
  edges,
  currentNodeId,
  rooms,
  accessibleOnly = false,
  onRouteCalculated,
  onRouteCancelled,
}: WayfinderProps) {
  const t = useTranslations('beacon.wayfinder');
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [route, setRoute] = useState<WayfinderResult | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const graph = useMemo(() => buildGraph(nodes, edges), [nodes, edges]);

  const handleNavigate = () => {
    if (!currentNodeId || !destinationId) return;

    const result = findPath(graph, currentNodeId, destinationId, accessibleOnly);
    if (result) {
      setRoute(result);
      setIsNavigating(true);
      onRouteCalculated?.(result.path.map((n) => ({ x: n.x, y: n.y })));
    }
  };

  const handleCancel = () => {
    setRoute(null);
    setIsNavigating(false);
    setDestinationId(null);
    onRouteCancelled?.();
  };

  if (isNavigating && route) {
    return (
      <div className="p-4 bg-white dark:bg-ensemble-900 rounded-xl border border-ensemble-200 dark:border-ensemble-700 shadow-sm space-y-3">
        {/* Route info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ensemble-900 dark:text-ensemble-50">
              {route.path[route.path.length - 1]?.label}
            </p>
            <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
              {Math.round(route.distance)} m &middot; {route.estimatedTime}
            </p>
          </div>

          {/* Direction arrows */}
          <div className="flex items-center gap-1">
            {route.path.map((node, i) => {
              if (i === 0) return null;
              const prev = route.path[i - 1];
              if (prev.floor !== node.floor) {
                return (
                  <span
                    key={node.id}
                    className="inline-flex items-center justify-center h-6 w-6 rounded bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-xs font-bold"
                    title={node.floor}
                  >
                    {node.floor}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>

        <Button variant="outline" onClick={handleCancel} className="w-full">
          {t('cancel')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-ensemble-900 rounded-xl border border-ensemble-200 dark:border-ensemble-700 shadow-sm space-y-3">
      {/* Destination selector */}
      <label className="block">
        <span className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
          {t('navigateTo')}
        </span>
        <select
          value={destinationId ?? ''}
          onChange={(e) => setDestinationId(e.target.value || null)}
          className="mt-1 block w-full rounded-lg border border-ensemble-200 dark:border-ensemble-700 bg-white dark:bg-ensemble-800 px-3 py-2 text-sm text-ensemble-900 dark:text-ensemble-50"
        >
          <option value="">{t('selectDestination')}</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.linkedNodeId}>
              {room.name}
            </option>
          ))}
        </select>
      </label>

      <Button
        onClick={handleNavigate}
        disabled={!currentNodeId || !destinationId}
        className="w-full"
      >
        {t('startNavigation')}
      </Button>

      {!currentNodeId && (
        <p className="text-xs text-ensemble-400 dark:text-ensemble-500">
          {t('positionRequired')}
        </p>
      )}
    </div>
  );
}
