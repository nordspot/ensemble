// PresenceZone Durable Object — user presence and zone tracking
// Uses Hibernatable WebSocket API, fully ephemeral (no SQLite)

interface Env {}

interface UserPresence {
  userId: string;
  userName: string;
  zone: string;
  lastSeen: number;
}

const HEARTBEAT_TIMEOUT_MS = 60_000;
const ALARM_INTERVAL_MS = 30_000;

export class PresenceZone {
  state: DurableObjectState;

  // WebSocket -> presence data
  private users: Map<WebSocket, UserPresence> = new Map();
  private alarmScheduled = false;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);

    // Send current zone counts on connect
    const zoneCounts = this.getZoneCounts();
    server.send(JSON.stringify({ type: 'zone_counts', zones: zoneCounts }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    let data: any;
    try {
      data = JSON.parse(message as string);
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    switch (data.type) {
      case 'enter': {
        const userId = String(data.userId || '').trim();
        const userName = String(data.userName || '').trim();
        const zone = String(data.zone || '').trim();

        if (!userId || !userName || !zone) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing userId, userName, or zone' }));
          return;
        }

        // Track previous zone for cleanup
        const previous = this.users.get(ws);
        const previousZone = previous?.zone;

        this.users.set(ws, {
          userId,
          userName,
          zone,
          lastSeen: Date.now(),
        });

        // Schedule heartbeat alarm if not already active
        this.ensureAlarm();

        // Broadcast update for the new zone
        this.broadcastZoneUpdate(zone);

        // If user moved from a different zone, broadcast update for old zone too
        if (previousZone && previousZone !== zone) {
          this.broadcastZoneUpdate(previousZone);
        }
        break;
      }

      case 'leave': {
        const presence = this.users.get(ws);
        if (presence) {
          const zone = presence.zone;
          this.users.delete(ws);
          this.broadcastZoneUpdate(zone);
        }
        break;
      }

      case 'heartbeat': {
        const presence = this.users.get(ws);
        if (presence) {
          presence.lastSeen = Date.now();
        }
        break;
      }

      default: {
        ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${data.type}` }));
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    const presence = this.users.get(ws);
    if (presence) {
      const zone = presence.zone;
      this.users.delete(ws);
      this.broadcastZoneUpdate(zone);
    }
    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    const presence = this.users.get(ws);
    if (presence) {
      const zone = presence.zone;
      this.users.delete(ws);
      this.broadcastZoneUpdate(zone);
    }
    ws.close(1011, 'WebSocket error');
  }

  async alarm(): Promise<void> {
    this.alarmScheduled = false;

    // Remove stale entries
    const now = Date.now();
    const staleZones = new Set<string>();

    for (const [ws, presence] of this.users) {
      if (now - presence.lastSeen > HEARTBEAT_TIMEOUT_MS) {
        staleZones.add(presence.zone);
        this.users.delete(ws);
        // Close the stale WebSocket
        try {
          ws.close(1000, 'Heartbeat timeout');
        } catch {
          // Already closed
        }
      }
    }

    // Broadcast updates for all affected zones
    for (const zone of staleZones) {
      this.broadcastZoneUpdate(zone);
    }

    // Reschedule alarm if there are still active users
    if (this.users.size > 0) {
      this.ensureAlarm();
    }
  }

  private ensureAlarm(): void {
    if (!this.alarmScheduled) {
      this.alarmScheduled = true;
      this.state.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS);
    }
  }

  private getZoneCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const presence of this.users.values()) {
      counts[presence.zone] = (counts[presence.zone] || 0) + 1;
    }
    return counts;
  }

  private getUsersInZone(zone: string): string[] {
    const names: string[] = [];
    for (const presence of this.users.values()) {
      if (presence.zone === zone) {
        names.push(presence.userName);
      }
    }
    return names;
  }

  private broadcastZoneUpdate(zone: string): void {
    const users = this.getUsersInZone(zone);
    const msg = JSON.stringify({
      type: 'zone_update',
      zone,
      count: users.length,
      users,
    });
    this.broadcast(msg);
  }

  private broadcast(message: string, exclude?: WebSocket): void {
    for (const ws of this.state.getWebSockets()) {
      if (ws !== exclude) {
        try {
          ws.send(message);
        } catch {
          // Socket already closed; ignore
        }
      }
    }
  }
}
