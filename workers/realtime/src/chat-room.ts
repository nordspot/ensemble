// ChatRoom Durable Object — real-time messaging with Hibernatable WebSocket API

interface Env {}

interface StoredMessage {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  reply_to: string | null;
  created_at: string;
}

interface RateEntry {
  count: number;
  windowStart: number;
}

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export class ChatRoom {
  state: DurableObjectState;
  private initialized = false;
  private rateLimits: Map<WebSocket, RateEntry> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }

  private ensureSchema(): void {
    if (this.initialized) return;
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        content TEXT NOT NULL,
        reply_to TEXT,
        deleted INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    this.initialized = true;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    this.ensureSchema();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept with hibernation support
    this.state.acceptWebSocket(server);

    // Send message history on connect
    const history = this.getHistory(50);
    server.send(JSON.stringify({ type: 'history', messages: history }));

    // Notify others of participant count
    const count = this.state.getWebSockets().length;
    this.broadcast(JSON.stringify({ type: 'presence', count }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    this.ensureSchema();

    let data: any;
    try {
      data = JSON.parse(message as string);
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    switch (data.type) {
      case 'send': {
        // Rate limit check
        if (!this.checkRateLimit(ws)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Rate limit exceeded. Max 10 messages per minute.',
          }));
          return;
        }

        const userId = String(data.userId || '').trim();
        const userName = String(data.userName || '').trim();
        const content = String(data.content || '').trim();

        if (!userId || !userName || !content) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing required fields: userId, userName, content' }));
          return;
        }

        if (content.length > 4000) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message too long (max 4000 chars)' }));
          return;
        }

        const id = crypto.randomUUID();
        const replyTo = data.replyTo || null;
        const timestamp = new Date().toISOString();

        this.storeMessage({ id, userId, userName, content, replyTo, timestamp });

        const broadcast = JSON.stringify({
          type: 'message',
          id,
          userId,
          userName,
          content,
          timestamp,
          replyTo,
        });
        this.broadcast(broadcast);
        break;
      }

      case 'typing': {
        const userName = String(data.userName || '').trim();
        if (!userName) return;
        const msg = JSON.stringify({ type: 'typing', userName });
        this.broadcast(msg, ws);
        break;
      }

      case 'read': {
        // Read receipt — acknowledged but not stored for now
        break;
      }

      case 'delete': {
        const messageId = String(data.messageId || '').trim();
        const userId = String(data.userId || '').trim();
        if (!messageId || !userId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing messageId or userId' }));
          return;
        }

        // Only the message author or a moderator can delete
        const isModerator = data.moderator === true;
        const rows = [...this.state.storage.sql.exec(
          'SELECT user_id FROM messages WHERE id = ?',
          messageId,
        )];

        if (rows.length === 0) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message not found' }));
          return;
        }

        const authorId = (rows[0] as any).user_id;
        if (authorId !== userId && !isModerator) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not authorized to delete this message' }));
          return;
        }

        this.state.storage.sql.exec(
          'UPDATE messages SET deleted = 1 WHERE id = ?',
          messageId,
        );

        this.broadcast(JSON.stringify({ type: 'deleted', messageId }));
        break;
      }

      default: {
        ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${data.type}` }));
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    this.rateLimits.delete(ws);
    ws.close(code, reason);

    // Broadcast updated presence count
    const count = this.state.getWebSockets().length;
    this.broadcast(JSON.stringify({ type: 'presence', count }));
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    this.rateLimits.delete(ws);
    ws.close(1011, 'WebSocket error');
  }

  private getHistory(limit: number): StoredMessage[] {
    const rows = [...this.state.storage.sql.exec(
      'SELECT id, user_id, user_name, content, reply_to, created_at FROM messages WHERE deleted = 0 ORDER BY created_at DESC LIMIT ?',
      limit,
    )];
    // Return in chronological order
    return rows.reverse().map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      content: row.content,
      replyTo: row.reply_to,
      timestamp: row.created_at,
    })) as any;
  }

  private storeMessage(msg: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    replyTo: string | null;
    timestamp: string;
  }): void {
    this.state.storage.sql.exec(
      'INSERT INTO messages (id, user_id, user_name, content, reply_to, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      msg.id,
      msg.userId,
      msg.userName,
      msg.content,
      msg.replyTo,
      msg.timestamp,
    );
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

  private checkRateLimit(ws: WebSocket): boolean {
    const now = Date.now();
    let entry = this.rateLimits.get(ws);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      entry = { count: 1, windowStart: now };
      this.rateLimits.set(ws, entry);
      return true;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return false;
    }
    return true;
  }
}
