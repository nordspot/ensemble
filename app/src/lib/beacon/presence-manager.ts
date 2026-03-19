/**
 * Manages presence reporting to the PresenceZone Durable Object via WebSocket.
 *
 * - Reports zone changes
 * - Sends heartbeats every 30 s
 * - Rate-limits zone updates to max 1 per 5 s
 */

import {
  PRESENCE_HEARTBEAT_MS,
  ZONE_UPDATE_RATE_LIMIT_MS,
} from './constants';
import type { ZoneInfo } from './zone-resolver';

interface PresenceMessage {
  type: 'zone_update' | 'heartbeat' | 'disconnect';
  userId: string;
  congressId: string;
  zone?: string;
  roomId?: string;
  floor?: string;
  timestamp: number;
}

export class PresenceManager {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastZoneReport = 0;
  private pendingZone: ZoneInfo | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;

  constructor(
    private readonly userId: string,
    private readonly congressId: string,
    private readonly realtimeBaseUrl: string,
    private readonly token: string,
  ) {}

  /**
   * Connect to the PresenceZone Durable Object WebSocket.
   */
  connect(): void {
    if (this.ws) return;
    this.intentionallyClosed = false;

    const protocol = this.realtimeBaseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = this.realtimeBaseUrl.replace(/^https?:\/\//, '');
    const url = `${protocol}://${host}/ws/PresenceZone/${this.congressId}?token=${encodeURIComponent(this.token)}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      return;
    }

    this.ws.addEventListener('open', () => {
      this.startHeartbeat();
    });

    this.ws.addEventListener('close', () => {
      this.stopHeartbeat();
      this.ws = null;
    });

    this.ws.addEventListener('error', () => {
      // Errors are followed by close events
    });
  }

  /**
   * Disconnect from the WebSocket.
   */
  disconnect(): void {
    this.intentionallyClosed = true;
    this.stopHeartbeat();

    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }

    if (this.ws) {
      this.send({
        type: 'disconnect',
        userId: this.userId,
        congressId: this.congressId,
        timestamp: Date.now(),
      });
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Report a zone change. Rate-limited to 1 update per 5 seconds.
   */
  reportZoneChange(zone: ZoneInfo | null): void {
    const now = Date.now();
    const elapsed = now - this.lastZoneReport;

    if (elapsed >= ZONE_UPDATE_RATE_LIMIT_MS) {
      this.sendZoneUpdate(zone);
      this.lastZoneReport = now;
    } else {
      // Queue the update
      this.pendingZone = zone;
      if (!this.pendingTimer) {
        const delay = ZONE_UPDATE_RATE_LIMIT_MS - elapsed;
        this.pendingTimer = setTimeout(() => {
          this.pendingTimer = null;
          if (this.pendingZone !== undefined) {
            this.sendZoneUpdate(this.pendingZone);
            this.lastZoneReport = Date.now();
            this.pendingZone = null;
          }
        }, delay);
      }
    }
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ── Internal ──────────────────────────────────────────────────

  private sendZoneUpdate(zone: ZoneInfo | null): void {
    const msg: PresenceMessage = {
      type: 'zone_update',
      userId: this.userId,
      congressId: this.congressId,
      zone: zone?.zone,
      roomId: zone?.roomId,
      floor: zone?.floor,
      timestamp: Date.now(),
    };
    this.send(msg);
  }

  private send(msg: PresenceMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'heartbeat',
        userId: this.userId,
        congressId: this.congressId,
        timestamp: Date.now(),
      });
    }, PRESENCE_HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
