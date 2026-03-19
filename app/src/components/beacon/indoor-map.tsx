'use client';

import { useRef, useState, useCallback, useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { IndoorPosition } from '@/hooks/use-indoor-position';

// ── Types ─────────────────────────────────────────────────────────

export interface MapRoom {
  id: string;
  name: string;
  floor: string;
  points: Array<{ x: number; y: number }>;
  status: 'available' | 'in-session' | 'full';
  currentOccupancy?: number;
  maxCapacity?: number;
  sessionTitle?: string;
}

export interface MapPOI {
  id: string;
  x: number;
  y: number;
  floor: string;
  label: string;
  icon: 'wc' | 'elevator' | 'stairs' | 'exit' | 'food' | 'info';
}

export interface FloorPlan {
  id: string;
  label: string;
  viewBox: string;
  backgroundPath?: string;
}

interface IndoorMapProps {
  floors: FloorPlan[];
  rooms: MapRoom[];
  pois: MapPOI[];
  userPosition: IndoorPosition | null;
  routePath?: Array<{ x: number; y: number }>;
  onRoomTap?: (room: MapRoom) => void;
  className?: string;
}

// ── Constants ─────────────────────────────────────────────────────

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

const ROOM_COLORS: Record<MapRoom['status'], string> = {
  available: '#22c55e',
  'in-session': '#3b82f6',
  full: '#ef4444',
};

const POI_ICONS: Record<MapPOI['icon'], string> = {
  wc: 'WC',
  elevator: 'Lift',
  stairs: 'T',
  exit: 'E',
  food: 'F',
  info: 'i',
};

// ── Component ─────────────────────────────────────────────────────

export function IndoorMap({
  floors,
  rooms,
  pois,
  userPosition,
  routePath,
  onRoomTap,
  className,
}: IndoorMapProps) {
  const t = useTranslations('beacon.map');
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeFloor, setActiveFloor] = useState(floors[0]?.id ?? '');
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [selectedRoom, setSelectedRoom] = useState<MapRoom | null>(null);

  // Pan state
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Pinch zoom state
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Switch floor when user moves between floors
  useEffect(() => {
    if (userPosition?.floor && floors.some((f) => f.id === userPosition.floor)) {
      setActiveFloor(userPosition.floor);
    }
  }, [userPosition?.floor, floors]);

  const currentFloor = floors.find((f) => f.id === activeFloor);
  const floorRooms = rooms.filter((r) => r.floor === activeFloor);
  const floorPois = pois.filter((p) => p.floor === activeFloor);

  // ── Pointer handlers for pan ────────────────────────────────

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1) {
      isPanning.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } else if (activePointers.current.size === 2) {
      // Start pinch
      const pts = Array.from(activePointers.current.values());
      pinchStartDist.current = Math.hypot(
        pts[1].x - pts[0].x,
        pts[1].y - pts[0].y,
      );
      pinchStartScale.current = scale;
    }
  }, [scale]);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 2) {
      // Pinch zoom
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const newScale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, pinchStartScale.current * (dist / pinchStartDist.current)),
      );
      setScale(newScale);
    } else if (isPanning.current && activePointers.current.size === 1) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  }, []);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size === 0) {
      isPanning.current = false;
    }
  }, []);

  // ── Room tap ────────────────────────────────────────────────

  const handleRoomTap = useCallback(
    (room: MapRoom) => {
      setSelectedRoom(room);
      onRoomTap?.(room);
    },
    [onRoomTap],
  );

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Floor switcher tabs */}
      <div className="flex gap-1 p-2 bg-ensemble-50 dark:bg-ensemble-900 border-b border-ensemble-200 dark:border-ensemble-700">
        {floors.map((floor) => (
          <button
            key={floor.id}
            type="button"
            onClick={() => setActiveFloor(floor.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeFloor === floor.id
                ? 'bg-accent-500 text-white'
                : 'text-ensemble-600 dark:text-ensemble-400 hover:bg-ensemble-100 dark:hover:bg-ensemble-800',
            )}
          >
            {floor.label}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-ensemble-50 dark:bg-ensemble-950 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg
          viewBox={currentFloor?.viewBox ?? '0 0 1000 800'}
          className="w-full h-full"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Floor plan background */}
          {currentFloor?.backgroundPath && (
            <path
              d={currentFloor.backgroundPath}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="text-ensemble-300 dark:text-ensemble-600"
            />
          )}

          {/* Rooms */}
          {floorRooms.map((room) => (
            <g key={room.id} onClick={() => handleRoomTap(room)} className="cursor-pointer">
              <polygon
                points={room.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={ROOM_COLORS[room.status]}
                fillOpacity={0.2}
                stroke={ROOM_COLORS[room.status]}
                strokeWidth={2}
              />
              <text
                x={room.points.reduce((s, p) => s + p.x, 0) / room.points.length}
                y={room.points.reduce((s, p) => s + p.y, 0) / room.points.length}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] fill-ensemble-900 dark:fill-ensemble-100 pointer-events-none select-none"
              >
                {room.name}
              </text>
            </g>
          ))}

          {/* POIs */}
          {floorPois.map((poi) => (
            <g key={poi.id}>
              <circle
                cx={poi.x}
                cy={poi.y}
                r={8}
                className="fill-ensemble-200 dark:fill-ensemble-700 stroke-ensemble-400 dark:stroke-ensemble-500"
                strokeWidth={1}
              />
              <text
                x={poi.x}
                y={poi.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[7px] font-bold fill-ensemble-600 dark:fill-ensemble-300 pointer-events-none select-none"
              >
                {POI_ICONS[poi.icon]}
              </text>
            </g>
          ))}

          {/* Route path */}
          {routePath && routePath.length > 1 && (
            <polyline
              points={routePath.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeDasharray="8,4"
              strokeLinecap="round"
              className="animate-[dash_1s_linear_infinite]"
            />
          )}

          {/* User position — pulsing blue dot */}
          {userPosition && userPosition.floor === activeFloor && (
            <g>
              <circle
                cx={userPosition.x}
                cy={userPosition.y}
                r={12}
                fill="#3b82f6"
                fillOpacity={0.2}
              >
                <animate
                  attributeName="r"
                  values="8;16;8"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  values="0.3;0.1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={userPosition.x} cy={userPosition.y} r={6} fill="#3b82f6" />
              <circle cx={userPosition.x} cy={userPosition.y} r={3} fill="white" />
            </g>
          )}
        </svg>
      </div>

      {/* Room detail slide-up panel */}
      {selectedRoom && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-ensemble-900 border-t border-ensemble-200 dark:border-ensemble-700 rounded-t-xl p-4 shadow-lg animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-ensemble-900 dark:text-ensemble-50">
              {selectedRoom.name}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedRoom(null)}
              className="text-ensemble-400 hover:text-ensemble-600 dark:hover:text-ensemble-300"
            >
              &times;
            </button>
          </div>

          {selectedRoom.sessionTitle && (
            <p className="text-sm text-ensemble-600 dark:text-ensemble-400 mb-1">
              {selectedRoom.sessionTitle}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ROOM_COLORS[selectedRoom.status] }}
            />
            <span className="text-ensemble-500 dark:text-ensemble-400">
              {t(`status.${selectedRoom.status}`)}
            </span>
            {selectedRoom.currentOccupancy !== undefined &&
              selectedRoom.maxCapacity !== undefined && (
                <span className="text-ensemble-400 dark:text-ensemble-500">
                  {selectedRoom.currentOccupancy}/{selectedRoom.maxCapacity}
                </span>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
