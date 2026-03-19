'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { IndoorMap, type MapRoom, type MapPOI, type FloorPlan } from '@/components/beacon/indoor-map';
import { Wayfinder } from '@/components/beacon/wayfinder';
import { RoomOccupancy, type RoomOccupancyData } from '@/components/beacon/room-occupancy';
import { NearbyPeople, type NearbyPerson } from '@/components/beacon/nearby-people';
import { BeaconScannerCard } from '@/components/beacon/beacon-scanner';
import { useBeacon } from '@/hooks/use-beacon';
import { useIndoorPosition } from '@/hooks/use-indoor-position';
import { useBeaconStore } from '@/stores/beacon-store';
import type { BeaconConfig } from '@/lib/beacon/zone-resolver';
import type { WayfinderNode, WayfinderEdge } from '@/lib/beacon/wayfinder-algorithm';

interface IndoorMapPageProps {
  congressId: string;
  locale: string;
}

/**
 * Client-side indoor map page.
 *
 * In production, floors/rooms/beaconConfig/nodes/edges would be fetched
 * from the API. Here we provide empty defaults - the components are
 * fully wired and ready for real data.
 */
export function IndoorMapPage({ congressId }: IndoorMapPageProps) {
  const t = useTranslations('beacon.map');
  const store = useBeaconStore();

  // Placeholder data - replace with API fetch
  const beaconConfig: BeaconConfig = useMemo(() => new Map(), []);
  const knownBeacons: never[] = useMemo(() => [], []);
  const floors: FloorPlan[] = useMemo(
    () => [{ id: 'EG', label: 'EG', viewBox: '0 0 1000 800' }],
    [],
  );
  const rooms: MapRoom[] = useMemo(() => [], []);
  const pois: MapPOI[] = useMemo(() => [], []);
  const wayfinderNodes: WayfinderNode[] = useMemo(() => [], []);
  const wayfinderEdges: WayfinderEdge[] = useMemo(() => [], []);
  const roomList: Array<{ id: string; name: string; linkedNodeId: string }> = useMemo(() => [], []);
  const occupancy: RoomOccupancyData[] = useMemo(() => [], []);
  const nearbyPeople: NearbyPerson[] = useMemo(() => [], []);

  const { nearbyBeacons } = useBeacon(beaconConfig);
  const { position } = useIndoorPosition(nearbyBeacons, knownBeacons);

  const [routePath, setRoutePath] = useState<Array<{ x: number; y: number }> | undefined>();

  // Find the closest wayfinder node to the user position
  const currentNodeId = useMemo(() => {
    if (!position) return null;
    let closest: WayfinderNode | null = null;
    let minDist = Infinity;
    for (const node of wayfinderNodes) {
      if (node.floor !== position.floor) continue;
      const d = Math.hypot(node.x - position.x, node.y - position.y);
      if (d < minDist) {
        minDist = d;
        closest = node;
      }
    }
    return closest?.id ?? null;
  }, [position, wayfinderNodes]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Map area */}
      <div className="flex-1 relative">
        <IndoorMap
          floors={floors}
          rooms={rooms}
          pois={pois}
          userPosition={position}
          routePath={routePath}
          className="h-full"
        />
      </div>

      {/* Sidebar */}
      <aside className="w-80 border-l border-ensemble-200 dark:border-ensemble-700 overflow-y-auto p-4 space-y-4 hidden lg:block">
        <BeaconScannerCard beaconConfig={beaconConfig} />

        <Wayfinder
          nodes={wayfinderNodes}
          edges={wayfinderEdges}
          currentNodeId={currentNodeId}
          rooms={roomList}
          onRouteCalculated={setRoutePath}
          onRouteCancelled={() => setRoutePath(undefined)}
        />

        <RoomOccupancy rooms={occupancy} />

        <NearbyPeople people={nearbyPeople} privacyLevel={store.privacyLevel} />
      </aside>
    </div>
  );
}
