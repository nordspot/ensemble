/**
 * PresenceZone Durable Object — tracks users entering/leaving zones.
 *
 * - Heartbeat every 30 s (auto-disconnect if missed)
 * - Broadcasts zone updates to all subscribers
 */

// ── Types ─────────────────────────────────────────────────────

interface PresenceUser {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  enteredAt: number;
  lastHeartbeat: number;
}

interface SessionMeta {
  userId: string;
  userName: string;
  avatarUrl: string | null;
}

interface ClientEnter { type: 'enter' }
interface ClientLeave { type: 'leave' }
interface ClientHeartbeat { type: 'heartbeat' }
type ClientMessage = ClientEnter | ClientLeave | ClientHeartbeat;

// ── Constants ─────────────────────────────────────────────────

const HEARTBEAT_TIMEOUT_MS = 60_000; // 2 missed heartbeats at 30 s interval
const CLEANUP_INTERVAL_MS = 15_000;

// ── Durable Object ───────────────────────────────────────────

export class PresenceZone implements DurableObject {
  private users = new Map<string, PresenceUser>();
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private state: DurableObjectState, _env: unknown) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    // REST endpoint: get current presence list
    if (url.pathname === '/users') {
      this.pruneStale();
      const list = Array.from(this.users.values()).map((u) => ({
        userId: u.userId,
        userName: u.userName,
        avatarUrl: u.avatarUrl,
        enteredAt: u.enteredAt,
      }));
      return Response.json({ users: list, count: list.length });
    }

    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const userId = url.searchParams.get('userId') ?? 'anonymous';
    const userName = url.searchParams.get('userName') ?? 'Anonym';
    const avatarUrl = url.searchParams.get('avatarUrl') ?? null;

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    const meta: SessionMeta = { userId, userName, avatarUrl };
    this.state.acceptWebSocket(server, [userId]);
    (server as unknown as Record<string, unknown>).__meta = meta;

    // Send current presence snapshot
    this.pruneStale();
    const snapshot = Array.from(this.users.values()).map((u) => ({
      userId: u.userId,
      userName: u.userName,
      avatarUrl: u.avatarUrl,
    }));
    server.send(JSON.stringify({ type: 'presence:snapshot', users: snapshot }));

    // Start periodic cleanup if not already running
    this.ensureCleanup();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, rawData: string | ArrayBuffer): Promise<void> {
    const meta = (ws as unknown as Record<string, unknown>).__meta as SessionMeta | undefined;
    if (!meta) { ws.close(4001, 'Missing session'); return; }

    const text = typeof rawData === 'string' ? rawData : new TextDecoder().decode(rawData);
    let msg: ClientMessage;
    try { msg = JSON.parse(text) as ClientMessage; } catch { return; }

    switch (msg.type) {
      case 'enter':
        this.handleEnter(meta);
        break;
      case 'leave':
        this.handleLeave(meta);
        break;
      case 'heartbeat':
        this.handleHeartbeat(meta);
        break;
    }
  }

  async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    const meta = (ws as unknown as Record<string, unknown>).__meta as SessionMeta | undefined;
    if (meta) this.handleLeave(meta);
    ws.close(code, 'Closed');
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    const meta = (ws as unknown as Record<string, unknown>).__meta as SessionMeta | undefined;
    if (meta) this.handleLeave(meta);
    ws.close(1011, 'Error');
  }

  // ── Handlers ──────────────────────────────────────────────

  private handleEnter(meta: SessionMeta): void {
    const now = Date.now();
    if (this.users.has(meta.userId)) {
      // Already present — update heartbeat
      const existing = this.users.get(meta.userId)!;
      existing.lastHeartbeat = now;
      return;
    }

    this.users.set(meta.userId, {
      userId: meta.userId,
      userName: meta.userName,
      avatarUrl: meta.avatarUrl,
      enteredAt: now,
      lastHeartbeat: now,
    });

    this.broadcast(JSON.stringify({
      type: 'presence:joined',
      userId: meta.userId,
      userName: meta.userName,
      avatarUrl: meta.avatarUrl,
      count: this.users.size,
    }));
  }

  private handleLeave(meta: SessionMeta): void {
    if (!this.users.has(meta.userId)) return;
    this.users.delete(meta.userId);

    this.broadcast(JSON.stringify({
      type: 'presence:left',
      userId: meta.userId,
      count: this.users.size,
    }));
  }

  private handleHeartbeat(meta: SessionMeta): void {
    const user = this.users.get(meta.userId);
    if (user) {
      user.lastHeartbeat = Date.now();
    }
  }

  // ── Stale user cleanup ────────────────────────────────────

  private pruneStale(): void {
    const cutoff = Date.now() - HEARTBEAT_TIMEOUT_MS;
    const stale: string[] = [];

    for (const [userId, user] of this.users) {
      if (user.lastHeartbeat < cutoff) {
        stale.push(userId);
      }
    }

    for (const userId of stale) {
      this.users.delete(userId);
      this.broadcast(JSON.stringify({
        type: 'presence:left',
        userId,
        count: this.users.size,
      }));
    }
  }

  private ensureCleanup(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      this.pruneStale();
      // Stop timer if no more connections
      if (this.state.getWebSockets().length === 0) {
        clearInterval(this.cleanupTimer!);
        this.cleanupTimer = null;
      }
    }, CLEANUP_INTERVAL_MS);
  }

  // ── Helpers ───────────────────────────────────────────────

  private broadcast(payload: string): void {
    for (const ws of this.state.getWebSockets()) {
      try { ws.send(payload); } catch { /* closed */ }
    }
  }
}
