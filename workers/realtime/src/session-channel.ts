// SessionChannel Durable Object — live Q&A, polls, reactions, transcript relay
// Uses Hibernatable WebSocket API with SQLite for persistent state

interface Env {}

interface Question {
  id: string;
  userId: string;
  text: string;
  upvotes: number;
  answered: boolean;
  anonymous: boolean;
  created_at: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  results: number[];
  active: boolean;
}

export class SessionChannel {
  state: DurableObjectState;
  private initialized = false;

  // Ephemeral reaction batching
  private reactionBuffer: Map<string, number> = new Map();
  private alarmScheduled = false;

  // Track upvotes in memory (userId -> Set<questionId>) to prevent duplicates
  private userUpvotes: Map<string, Set<string>> = new Map();

  // Track poll votes (pollId -> Map<userId, optionIndex>) to prevent duplicates
  private pollVotes: Map<string, Map<string, number>> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;

    // Restore upvote tracking from SQLite on construction
    this.state.blockConcurrencyWhile(async () => {
      this.ensureSchema();
      this.restoreUpvoteTracking();
      this.restorePollVoteTracking();
    });
  }

  private ensureSchema(): void {
    if (this.initialized) return;
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        text TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        answered INTEGER DEFAULT 0,
        anonymous INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS question_upvotes (
        question_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        PRIMARY KEY (question_id, user_id)
      )
    `);
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        results TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        poll_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        option_index INTEGER NOT NULL,
        PRIMARY KEY (poll_id, user_id)
      )
    `);
    this.initialized = true;
  }

  private restoreUpvoteTracking(): void {
    const rows = [...this.state.storage.sql.exec('SELECT question_id, user_id FROM question_upvotes')];
    for (const row of rows as any[]) {
      if (!this.userUpvotes.has(row.user_id)) {
        this.userUpvotes.set(row.user_id, new Set());
      }
      this.userUpvotes.get(row.user_id)!.add(row.question_id);
    }
  }

  private restorePollVoteTracking(): void {
    const rows = [...this.state.storage.sql.exec('SELECT poll_id, user_id, option_index FROM poll_votes')];
    for (const row of rows as any[]) {
      if (!this.pollVotes.has(row.poll_id)) {
        this.pollVotes.set(row.poll_id, new Map());
      }
      this.pollVotes.get(row.poll_id)!.set(row.user_id, row.option_index);
    }
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    this.ensureSchema();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);

    // Send full state on connect
    const questions = this.getQuestions();
    const poll = this.getActivePoll();
    server.send(JSON.stringify({
      type: 'state',
      questions,
      poll,
    }));

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
      case 'question': {
        const text = String(data.text || '').trim();
        const userId = String(data.userId || '').trim();
        if (!text || !userId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing text or userId' }));
          return;
        }
        if (text.length > 2000) {
          ws.send(JSON.stringify({ type: 'error', message: 'Question too long (max 2000 chars)' }));
          return;
        }

        const id = crypto.randomUUID();
        const anonymous = data.anonymous === true;
        const createdAt = new Date().toISOString();

        this.state.storage.sql.exec(
          'INSERT INTO questions (id, user_id, text, anonymous, created_at) VALUES (?, ?, ?, ?, ?)',
          id, userId, text, anonymous ? 1 : 0, createdAt,
        );

        const question: Question = {
          id,
          userId: anonymous ? '' : userId,
          text,
          upvotes: 0,
          answered: false,
          anonymous,
          created_at: createdAt,
        };

        this.broadcast(JSON.stringify({ type: 'question', ...question }));
        break;
      }

      case 'upvote': {
        const questionId = String(data.questionId || '').trim();
        const userId = String(data.userId || '').trim();
        if (!questionId || !userId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing questionId or userId' }));
          return;
        }

        // Check for duplicate upvote
        const userSet = this.userUpvotes.get(userId);
        if (userSet && userSet.has(questionId)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Already upvoted this question' }));
          return;
        }

        // Verify question exists
        const qRows = [...this.state.storage.sql.exec('SELECT id FROM questions WHERE id = ?', questionId)];
        if (qRows.length === 0) {
          ws.send(JSON.stringify({ type: 'error', message: 'Question not found' }));
          return;
        }

        // Record upvote
        this.state.storage.sql.exec(
          'INSERT INTO question_upvotes (question_id, user_id) VALUES (?, ?)',
          questionId, userId,
        );
        this.state.storage.sql.exec(
          'UPDATE questions SET upvotes = upvotes + 1 WHERE id = ?',
          questionId,
        );

        if (!this.userUpvotes.has(userId)) {
          this.userUpvotes.set(userId, new Set());
        }
        this.userUpvotes.get(userId)!.add(questionId);

        // Get updated count
        const updated = [...this.state.storage.sql.exec('SELECT upvotes FROM questions WHERE id = ?', questionId)];
        const upvotes = (updated[0] as any).upvotes;

        this.broadcast(JSON.stringify({ type: 'upvoted', questionId, upvotes }));
        break;
      }

      case 'answer': {
        const questionId = String(data.questionId || '').trim();
        if (!questionId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing questionId' }));
          return;
        }

        // Moderator-only action (trust the client flag for now; auth layer above)
        this.state.storage.sql.exec(
          'UPDATE questions SET answered = 1 WHERE id = ?',
          questionId,
        );

        this.broadcast(JSON.stringify({ type: 'answered', questionId }));
        break;
      }

      case 'poll_create': {
        // Moderator creates a poll
        const question = String(data.question || '').trim();
        const options = data.options as string[];
        if (!question || !Array.isArray(options) || options.length < 2) {
          ws.send(JSON.stringify({ type: 'error', message: 'Poll needs a question and at least 2 options' }));
          return;
        }

        // Deactivate any existing poll
        this.state.storage.sql.exec('UPDATE polls SET active = 0 WHERE active = 1');

        const pollId = crypto.randomUUID();
        const results = new Array(options.length).fill(0);

        this.state.storage.sql.exec(
          'INSERT INTO polls (id, question, options, results) VALUES (?, ?, ?, ?)',
          pollId, question, JSON.stringify(options), JSON.stringify(results),
        );

        this.pollVotes.set(pollId, new Map());

        const poll: Poll = { id: pollId, question, options, results, active: true };
        this.broadcast(JSON.stringify({ type: 'poll_created', poll }));
        break;
      }

      case 'poll_vote': {
        const pollId = String(data.pollId || '').trim();
        const userId = String(data.userId || '').trim();
        const optionIndex = Number(data.optionIndex);

        if (!pollId || !userId || isNaN(optionIndex)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing pollId, userId, or optionIndex' }));
          return;
        }

        // Check poll exists and is active
        const pollRows = [...this.state.storage.sql.exec(
          'SELECT options, results FROM polls WHERE id = ? AND active = 1', pollId,
        )];
        if (pollRows.length === 0) {
          ws.send(JSON.stringify({ type: 'error', message: 'Poll not found or inactive' }));
          return;
        }

        const pollData = pollRows[0] as any;
        const options = JSON.parse(pollData.options) as string[];
        const results = JSON.parse(pollData.results) as number[];

        if (optionIndex < 0 || optionIndex >= options.length) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid option index' }));
          return;
        }

        // Check duplicate vote
        const votes = this.pollVotes.get(pollId);
        if (votes && votes.has(userId)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Already voted on this poll' }));
          return;
        }

        // Record vote
        results[optionIndex]++;
        this.state.storage.sql.exec(
          'UPDATE polls SET results = ? WHERE id = ?',
          JSON.stringify(results), pollId,
        );
        this.state.storage.sql.exec(
          'INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES (?, ?, ?)',
          pollId, userId, optionIndex,
        );

        if (!this.pollVotes.has(pollId)) {
          this.pollVotes.set(pollId, new Map());
        }
        this.pollVotes.get(pollId)!.set(userId, optionIndex);

        this.broadcast(JSON.stringify({ type: 'poll_update', pollId, results }));
        break;
      }

      case 'poll_close': {
        const pollId = String(data.pollId || '').trim();
        if (!pollId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing pollId' }));
          return;
        }
        this.state.storage.sql.exec('UPDATE polls SET active = 0 WHERE id = ?', pollId);
        this.broadcast(JSON.stringify({ type: 'poll_closed', pollId }));
        break;
      }

      case 'reaction': {
        const emoji = String(data.emoji || '').trim();
        if (!emoji) return;

        // Accumulate in buffer for batching
        const current = this.reactionBuffer.get(emoji) || 0;
        this.reactionBuffer.set(emoji, current + 1);

        // Schedule alarm for flushing if not already scheduled
        if (!this.alarmScheduled) {
          this.alarmScheduled = true;
          this.state.storage.setAlarm(Date.now() + 2000);
        }
        break;
      }

      case 'transcript': {
        // Relay transcript segment to all clients (from transcription service)
        const segment = data.segment;
        const timestamp = data.timestamp || new Date().toISOString();
        this.broadcast(JSON.stringify({ type: 'transcript', segment, timestamp }));
        break;
      }

      default: {
        ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${data.type}` }));
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    ws.close(1011, 'WebSocket error');
  }

  async alarm(): Promise<void> {
    // Flush reaction buffer
    this.alarmScheduled = false;

    if (this.reactionBuffer.size > 0) {
      for (const [emoji, count] of this.reactionBuffer) {
        this.broadcast(JSON.stringify({ type: 'reaction_burst', emoji, count }));
      }
      this.reactionBuffer.clear();
    }
  }

  private getQuestions(): Question[] {
    const rows = [...this.state.storage.sql.exec(
      'SELECT id, user_id, text, upvotes, answered, anonymous, created_at FROM questions ORDER BY upvotes DESC, created_at ASC',
    )];
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.anonymous ? '' : row.user_id,
      text: row.text,
      upvotes: row.upvotes,
      answered: row.answered === 1,
      anonymous: row.anonymous === 1,
      created_at: row.created_at,
    }));
  }

  private getActivePoll(): Poll | null {
    const rows = [...this.state.storage.sql.exec(
      'SELECT id, question, options, results, active FROM polls WHERE active = 1 LIMIT 1',
    )];
    if (rows.length === 0) return null;
    const row = rows[0] as any;
    return {
      id: row.id,
      question: row.question,
      options: JSON.parse(row.options),
      results: JSON.parse(row.results),
      active: true,
    };
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
