/**
 * ChatRoom Durable Object — Hibernatable WebSocket API
 *
 * Handles real-time chat for a single conversation/channel.
 * Messages are persisted in DO SQLite storage.
 */

// ── Wire types ────────────────────────────────────────────────

/** Client -> Server */
interface ClientSend {
  type: 'send';
  content: string;
  replyTo?: string;
}

interface ClientDelete {
  type: 'delete';
  messageId: string;
}

interface ClientTyping {
  type: 'typing';
}

interface ClientRead {
  type: 'read';
  lastMessageId: string;
}

type ClientMessage = ClientSend | ClientDelete | ClientTyping | ClientRead;

/** Server -> Client */
interface ServerMessage {
  type: 'message';
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  replyTo?: string;
}

interface ServerDeleted {
  type: 'deleted';
  messageId: string;
}

interface ServerTyping {
  type: 'typing';
  userId: string;
  userName: string;
}

interface ServerHistory {
  type: 'history';
  messages: ServerMessage[];
}

type ServerEvent = ServerMessage | ServerDeleted | ServerTyping | ServerHistory;

// ── Stored message row ────────────────────────────────────────

interface StoredMessage {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  reply_to: string | null;
  created_at: string;
}

// ── Attachment on each WebSocket ──────────────────────────────

interface SessionMeta {
  userId: string;
  userName: string;
}

// ── Constants ─────────────────────────────────────────────────

const MAX_HISTORY = 50;
const MAX_MESSAGE_SIZE = 4096; // 4 KB
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max messages per window

// ── Durable Object ───────────────────────────────────────────

export class ChatRoom implements DurableObject {
  private sql: DurableObjectStorage;
  private initialized = false;

  /** userId -> timestamps of recent sends (for rate-limiting) */
  private rateBuckets = new Map<string, number[]>();

  constructor(private state: DurableObjectState, _env: unknown) {
    this.sql = state.storage;
  }

  // ── Schema bootstrap ──────────────────────────────────────

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        content TEXT NOT NULL,
        reply_to TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    `);
    this.initialized = true;
  }

  // ── HTTP + WebSocket upgrade ──────────────────────────────

  async fetch(request: Request): Promise<Response> {
    await this.ensureSchema();

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    // Expect WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const userId = url.searchParams.get('userId') ?? 'anonymous';
    const userName = url.searchParams.get('userName') ?? 'Anonym';

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    const meta: SessionMeta = { userId, userName };

    this.state.acceptWebSocket(server, [userId]);
    (server as unknown as Record<string, unknown>).__meta = meta;

    // Send history to this new connection
    const history = this.getHistory();
    server.send(JSON.stringify({ type: 'history', messages: history } satisfies ServerHistory));

    return new Response(null, { status: 101, webSocket: client });
  }

  // ── Hibernatable handlers ─────────────────────────────────

  async webSocketMessage(ws: WebSocket, rawData: string | ArrayBuffer): Promise<void> {
    const meta = (ws as unknown as Record<string, unknown>).__meta as SessionMeta | undefined;
    if (!meta) {
      ws.close(4001, 'Missing session metadata');
      return;
    }

    const text = typeof rawData === 'string' ? rawData : new TextDecoder().decode(rawData);

    let msg: ClientMessage;
    try {
      msg = JSON.parse(text) as ClientMessage;
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    switch (msg.type) {
      case 'send':
        this.handleSend(ws, meta, msg);
        break;
      case 'delete':
        this.handleDelete(ws, meta, msg);
        break;
      case 'typing':
        this.handleTyping(meta);
        break;
      case 'read':
        // Read receipts are acknowledged but not stored in the DO.
        // The main app DB handles read tracking.
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  async webSocketClose(ws: WebSocket, code: number, _reason: string, _wasClean: boolean): Promise<void> {
    ws.close(code, 'Connection closed');
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    ws.close(1011, 'Unexpected error');
  }

  // ── Message handlers ──────────────────────────────────────

  private handleSend(ws: WebSocket, meta: SessionMeta, msg: ClientSend): void {
    // Validate size
    if (msg.content.length > MAX_MESSAGE_SIZE) {
      ws.send(JSON.stringify({ type: 'error', message: 'Message too large (max 4KB)' }));
      return;
    }

    if (!msg.content.trim()) {
      ws.send(JSON.stringify({ type: 'error', message: 'Empty message' }));
      return;
    }

    // Rate limit
    if (this.isRateLimited(meta.userId)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Rate limited: max 10 messages/minute' }));
      return;
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    this.state.storage.sql.exec(
      `INSERT INTO messages (id, user_id, user_name, content, reply_to, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      meta.userId,
      meta.userName,
      msg.content,
      msg.replyTo ?? null,
      timestamp,
    );

    const serverMsg: ServerMessage = {
      type: 'message',
      id,
      userId: meta.userId,
      userName: meta.userName,
      content: msg.content,
      timestamp,
      ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
    };

    this.broadcast(JSON.stringify(serverMsg));
  }

  private handleDelete(_ws: WebSocket, meta: SessionMeta, msg: ClientDelete): void {
    // Only allow deletion of own messages
    const row = this.state.storage.sql.exec(
      `SELECT user_id FROM messages WHERE id = ?`,
      msg.messageId,
    ).toArray()[0] as { user_id: string } | undefined;

    if (!row || row.user_id !== meta.userId) return;

    this.state.storage.sql.exec(`DELETE FROM messages WHERE id = ?`, msg.messageId);

    const event: ServerDeleted = { type: 'deleted', messageId: msg.messageId };
    this.broadcast(JSON.stringify(event));
  }

  private handleTyping(meta: SessionMeta): void {
    const event: ServerTyping = {
      type: 'typing',
      userId: meta.userId,
      userName: meta.userName,
    };
    // Broadcast to everyone except the typer
    const sockets = this.state.getWebSockets();
    const payload = JSON.stringify(event);
    for (const s of sockets) {
      const m = (s as unknown as Record<string, unknown>).__meta as SessionMeta | undefined;
      if (m && m.userId !== meta.userId) {
        try { s.send(payload); } catch { /* closed */ }
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────

  private getHistory(): ServerMessage[] {
    const rows = this.state.storage.sql.exec(
      `SELECT id, user_id, user_name, content, reply_to, created_at
       FROM messages ORDER BY created_at DESC LIMIT ?`,
      MAX_HISTORY,
    ).toArray() as StoredMessage[];

    // Return oldest-first
    return rows.reverse().map((r) => ({
      type: 'message' as const,
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      content: r.content,
      timestamp: r.created_at,
      ...(r.reply_to ? { replyTo: r.reply_to } : {}),
    }));
  }

  private broadcast(payload: string): void {
    for (const ws of this.state.getWebSockets()) {
      try { ws.send(payload); } catch { /* closed */ }
    }
  }

  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    let bucket = this.rateBuckets.get(userId);
    if (!bucket) {
      bucket = [];
      this.rateBuckets.set(userId, bucket);
    }
    // Prune old entries
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    const filtered = bucket.filter((ts) => ts > cutoff);
    this.rateBuckets.set(userId, filtered);

    if (filtered.length >= RATE_LIMIT_MAX) return true;

    filtered.push(now);
    return false;
  }
}
