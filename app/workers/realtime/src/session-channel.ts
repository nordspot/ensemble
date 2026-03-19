/**
 * SessionChannel Durable Object — real-time session interactions.
 *
 * Handles Q&A, Polls, Reactions, and Transcript segments via
 * the Hibernatable WebSocket API.
 */

// ── Wire types ────────────────────────────────────────────────

/** Q&A */
interface QASubmit { type: 'qa:submit'; body: string; anonymous?: boolean }
interface QAUpvote { type: 'qa:upvote'; questionId: string }
interface QAAnswer { type: 'qa:answer'; questionId: string }

/** Polls */
interface PollCreate {
  type: 'poll:create';
  question: string;
  options: string[];
}
interface PollVote { type: 'poll:vote'; pollId: string; optionIndex: number }
interface PollClose { type: 'poll:close'; pollId: string }

/** Reactions */
interface ReactionSend { type: 'reaction'; emoji: string }

/** Transcript */
interface TranscriptSegment {
  type: 'transcript:segment';
  text: string;
  timestamp: string;
  isFinal: boolean;
}

type ClientMessage =
  | QASubmit | QAUpvote | QAAnswer
  | PollCreate | PollVote | PollClose
  | ReactionSend | TranscriptSegment;

/** Stored types */
interface StoredQuestion {
  id: string;
  user_id: string;
  user_name: string;
  body: string;
  anonymous: number;
  is_answered: number;
  upvotes: string; // JSON array of userIds
  created_at: string;
}

interface StoredPoll {
  id: string;
  creator_id: string;
  question: string;
  options: string; // JSON array
  votes: string; // JSON: Record<userId, optionIndex>
  is_active: number;
  created_at: string;
}

interface SessionMeta {
  userId: string;
  userName: string;
  role: string; // 'attendee' | 'speaker' | 'organizer' etc.
}

// ── Constants ─────────────────────────────────────────────────

const REACTION_AGGREGATE_MS = 2_000;

// ── Durable Object ───────────────────────────────────────────

export class SessionChannel implements DurableObject {
  private initialized = false;
  /** Pending reaction counts to aggregate before broadcast */
  private pendingReactions = new Map<string, number>();
  private reactionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private state: DurableObjectState, _env: unknown) {}

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        body TEXT NOT NULL,
        anonymous INTEGER NOT NULL DEFAULT 0,
        is_answered INTEGER NOT NULL DEFAULT 0,
        upvotes TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        creator_id TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL DEFAULT '[]',
        votes TEXT NOT NULL DEFAULT '{}',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    this.initialized = true;
  }

  // ── HTTP / WS upgrade ─────────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    await this.ensureSchema();

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const userId = url.searchParams.get('userId') ?? 'anonymous';
    const userName = url.searchParams.get('userName') ?? 'Anonym';
    const role = url.searchParams.get('role') ?? 'attendee';

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    const meta: SessionMeta = { userId, userName, role };
    this.state.acceptWebSocket(server, [userId]);
    (server as unknown as Record<string, unknown>).__meta = meta;

    // Send current state to new connection
    const questions = this.getAllQuestions();
    const polls = this.getAllPolls();
    server.send(JSON.stringify({ type: 'state', questions, polls }));

    return new Response(null, { status: 101, webSocket: client });
  }

  // ── Hibernatable handlers ─────────────────────────────────

  async webSocketMessage(ws: WebSocket, rawData: string | ArrayBuffer): Promise<void> {
    const meta = (ws as unknown as Record<string, unknown>).__meta as SessionMeta | undefined;
    if (!meta) { ws.close(4001, 'Missing session'); return; }

    const text = typeof rawData === 'string' ? rawData : new TextDecoder().decode(rawData);
    let msg: ClientMessage;
    try { msg = JSON.parse(text) as ClientMessage; } catch { return; }

    switch (msg.type) {
      case 'qa:submit': this.handleQASubmit(meta, msg); break;
      case 'qa:upvote': this.handleQAUpvote(meta, msg); break;
      case 'qa:answer': this.handleQAAnswer(meta, msg); break;
      case 'poll:create': this.handlePollCreate(meta, msg); break;
      case 'poll:vote': this.handlePollVote(meta, msg); break;
      case 'poll:close': this.handlePollClose(meta, msg); break;
      case 'reaction': this.handleReaction(msg); break;
      case 'transcript:segment': this.handleTranscript(meta, msg); break;
    }
  }

  async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    ws.close(code, 'Closed');
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    ws.close(1011, 'Error');
  }

  // ── Q&A ───────────────────────────────────────────────────

  private handleQASubmit(meta: SessionMeta, msg: QASubmit): void {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.state.storage.sql.exec(
      `INSERT INTO questions (id, user_id, user_name, body, anonymous, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      id, meta.userId, meta.userName, msg.body, msg.anonymous ? 1 : 0, now,
    );
    this.broadcast(JSON.stringify({
      type: 'qa:new',
      question: {
        id,
        userId: msg.anonymous ? null : meta.userId,
        userName: msg.anonymous ? 'Anonym' : meta.userName,
        body: msg.body,
        anonymous: !!msg.anonymous,
        isAnswered: false,
        upvotes: 0,
        upvotedByMe: false,
        createdAt: now,
      },
    }));
  }

  private handleQAUpvote(meta: SessionMeta, msg: QAUpvote): void {
    const row = this.state.storage.sql.exec(
      `SELECT upvotes FROM questions WHERE id = ?`, msg.questionId,
    ).toArray()[0] as { upvotes: string } | undefined;
    if (!row) return;

    const upvotes: string[] = JSON.parse(row.upvotes);
    // 1 upvote per user
    if (upvotes.includes(meta.userId)) return;
    upvotes.push(meta.userId);

    this.state.storage.sql.exec(
      `UPDATE questions SET upvotes = ? WHERE id = ?`,
      JSON.stringify(upvotes), msg.questionId,
    );

    this.broadcast(JSON.stringify({
      type: 'qa:upvoted',
      questionId: msg.questionId,
      upvoteCount: upvotes.length,
    }));
  }

  private handleQAAnswer(meta: SessionMeta, msg: QAAnswer): void {
    // Only organizer/speaker can mark answered
    if (meta.role !== 'organizer' && meta.role !== 'speaker') return;

    this.state.storage.sql.exec(
      `UPDATE questions SET is_answered = 1 WHERE id = ?`, msg.questionId,
    );
    this.broadcast(JSON.stringify({ type: 'qa:answered', questionId: msg.questionId }));
  }

  // ── Polls ─────────────────────────────────────────────────

  private handlePollCreate(meta: SessionMeta, msg: PollCreate): void {
    if (meta.role !== 'organizer' && meta.role !== 'speaker') return;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.state.storage.sql.exec(
      `INSERT INTO polls (id, creator_id, question, options, created_at) VALUES (?, ?, ?, ?, ?)`,
      id, meta.userId, msg.question, JSON.stringify(msg.options), now,
    );

    this.broadcast(JSON.stringify({
      type: 'poll:created',
      poll: {
        id,
        question: msg.question,
        options: msg.options,
        results: msg.options.map(() => 0),
        isActive: true,
        totalVotes: 0,
      },
    }));
  }

  private handlePollVote(meta: SessionMeta, msg: PollVote): void {
    const row = this.state.storage.sql.exec(
      `SELECT votes, options, is_active FROM polls WHERE id = ?`, msg.pollId,
    ).toArray()[0] as { votes: string; options: string; is_active: number } | undefined;
    if (!row || !row.is_active) return;

    const votes: Record<string, number> = JSON.parse(row.votes);
    // One vote per user
    if (meta.userId in votes) return;

    const options: string[] = JSON.parse(row.options);
    if (msg.optionIndex < 0 || msg.optionIndex >= options.length) return;

    votes[meta.userId] = msg.optionIndex;
    this.state.storage.sql.exec(
      `UPDATE polls SET votes = ? WHERE id = ?`, JSON.stringify(votes), msg.pollId,
    );

    // Aggregate results
    const results = options.map((_, i) =>
      Object.values(votes).filter((v) => v === i).length,
    );

    this.broadcast(JSON.stringify({
      type: 'poll:results',
      pollId: msg.pollId,
      results,
      totalVotes: Object.keys(votes).length,
    }));
  }

  private handlePollClose(meta: SessionMeta, msg: PollClose): void {
    if (meta.role !== 'organizer' && meta.role !== 'speaker') return;

    this.state.storage.sql.exec(
      `UPDATE polls SET is_active = 0 WHERE id = ?`, msg.pollId,
    );
    this.broadcast(JSON.stringify({ type: 'poll:closed', pollId: msg.pollId }));
  }

  // ── Reactions (aggregated every 2 s) ──────────────────────

  private handleReaction(msg: ReactionSend): void {
    const current = this.pendingReactions.get(msg.emoji) ?? 0;
    this.pendingReactions.set(msg.emoji, current + 1);

    if (!this.reactionTimer) {
      this.reactionTimer = setTimeout(() => {
        this.flushReactions();
      }, REACTION_AGGREGATE_MS);
    }
  }

  private flushReactions(): void {
    if (this.pendingReactions.size === 0) return;

    const aggregated: Record<string, number> = {};
    for (const [emoji, count] of this.pendingReactions) {
      aggregated[emoji] = count;
    }
    this.pendingReactions.clear();
    this.reactionTimer = null;

    this.broadcast(JSON.stringify({ type: 'reactions', aggregated }));
  }

  // ── Transcript ────────────────────────────────────────────

  private handleTranscript(meta: SessionMeta, msg: TranscriptSegment): void {
    // Only organizer/speaker can push transcript
    if (meta.role !== 'organizer' && meta.role !== 'speaker') return;

    this.broadcast(JSON.stringify({
      type: 'transcript:segment',
      text: msg.text,
      timestamp: msg.timestamp,
      isFinal: msg.isFinal,
    }));
  }

  // ── Helpers ───────────────────────────────────────────────

  private getAllQuestions(): unknown[] {
    const rows = this.state.storage.sql.exec(
      `SELECT * FROM questions ORDER BY created_at ASC`,
    ).toArray() as StoredQuestion[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.anonymous ? null : r.user_id,
      userName: r.anonymous ? 'Anonym' : r.user_name,
      body: r.body,
      anonymous: !!r.anonymous,
      isAnswered: !!r.is_answered,
      upvotes: (JSON.parse(r.upvotes) as string[]).length,
      createdAt: r.created_at,
    }));
  }

  private getAllPolls(): unknown[] {
    const rows = this.state.storage.sql.exec(
      `SELECT * FROM polls ORDER BY created_at DESC`,
    ).toArray() as StoredPoll[];

    return rows.map((r) => {
      const options: string[] = JSON.parse(r.options);
      const votes: Record<string, number> = JSON.parse(r.votes);
      const results = options.map((_, i) =>
        Object.values(votes).filter((v) => v === i).length,
      );
      return {
        id: r.id,
        question: r.question,
        options,
        results,
        isActive: !!r.is_active,
        totalVotes: Object.keys(votes).length,
      };
    });
  }

  private broadcast(payload: string): void {
    for (const ws of this.state.getWebSockets()) {
      try { ws.send(payload); } catch { /* closed */ }
    }
  }
}
