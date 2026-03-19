import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { generateId } from '@/lib/db/client';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ──────────────────────────────────────────────────

const listSchema = z.object({
  congressId: z.string().min(1),
  type: z.enum(['channels', 'direct', 'sessions']).optional(),
});

const createSchema = z.object({
  congressId: z.string().min(1),
  name: z.string().min(1).max(200),
  type: z.enum(['direct', 'group', 'session', 'topic', 'announcement']),
  sessionId: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

// ── Row types ────────────────────────────────────────────────

interface ConversationWithPreview {
  id: string;
  congress_id: string;
  type: string;
  name: string | null;
  session_id: string | null;
  topic: string | null;
  is_moderated: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

// ── Helpers ──────────────────────────────────────────────────

function mapConversationType(dbType: string): 'channel' | 'direct' | 'session' {
  if (dbType === 'direct') return 'direct';
  if (dbType === 'session') return 'session';
  return 'channel';
}

function filterTypeToDbTypes(filterType: string): string[] {
  switch (filterType) {
    case 'channels': return ['group', 'topic', 'announcement'];
    case 'direct': return ['direct'];
    case 'sessions': return ['session'];
    default: return ['group', 'topic', 'announcement', 'direct', 'session'];
  }
}

// ── GET: List conversations for user in congress ─────────────

export async function GET(request: NextRequest) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { searchParams } = new URL(request.url);
  const parsed = listSchema.safeParse({
    congressId: searchParams.get('congressId'),
    type: searchParams.get('type') || undefined,
  });

  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid query');
  }

  const { congressId, type } = parsed.data;
  const dbTypes = filterTypeToDbTypes(type ?? 'channels');

  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  try {
    const placeholders = dbTypes.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT c.*,
        (SELECT m.body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
        0 as unread_count
      FROM conversations c
      INNER JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE c.congress_id = ?
        AND cm.user_id = ?
        AND c.type IN (${placeholders})
      ORDER BY c.updated_at DESC
    `).bind(congressId, auth.userId, ...dbTypes);

    const result = await stmt.all<ConversationWithPreview>();
    const data = result.results.map((row) => ({
      id: row.id,
      name: row.name ?? 'Unbenannt',
      type: mapConversationType(row.type),
      lastMessage: row.last_message ?? null,
      lastMessageAt: row.last_message_at ?? null,
      unreadCount: row.unread_count ?? 0,
    }));

    return success(data);
  } catch (err) {
    console.error('[api/chat] GET error:', err);
    return ERRORS.INTERNAL_ERROR();
  }
}

// ── POST: Create a new conversation ──────────────────────────

export async function POST(request: NextRequest) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { congressId, name, type, sessionId, memberIds } = parsed.data;

  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  try {
    const id = generateId();
    const now = new Date().toISOString();

    await db.batch([
      db.prepare(`
        INSERT INTO conversations (id, congress_id, type, name, session_id, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, congressId, type, name, sessionId ?? null, auth.userId, now, now),
      // Add creator as member
      db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id, joined_at)
        VALUES (?, ?, ?)
      `).bind(id, auth.userId, now),
      // Add other members if provided
      ...(memberIds ?? []).map((uid) =>
        db.prepare(`
          INSERT INTO conversation_members (conversation_id, user_id, joined_at)
          VALUES (?, ?, ?)
        `).bind(id, uid, now),
      ),
    ]);

    return success({ id, name, type, congressId }, 201);
  } catch (err) {
    console.error('[api/chat] POST error:', err);
    return ERRORS.INTERNAL_ERROR();
  }
}
