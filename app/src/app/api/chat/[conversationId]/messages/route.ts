import { NextRequest } from 'next/server';
import { z } from 'zod';
import { paginated, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schema ───────────────────────────────────────────────────

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().optional(), // ISO timestamp for cursor-based paging
});

// ── Row type ─────────────────────────────────────────────────

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  type: string;
  body: string;
  media_url: string | null;
  reply_to_id: string | null;
  is_pinned: number;
  is_deleted: number;
  created_at: string;
}

// ── GET: Paginated messages from D1 backup ───────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { conversationId } = await params;
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    page: searchParams.get('page') ?? 1,
    pageSize: searchParams.get('pageSize') ?? 50,
    before: searchParams.get('before') ?? undefined,
  });

  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid query');
  }

  const { page, pageSize, before } = parsed.data;

  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  try {
    // Verify user is a member of this conversation
    const membership = await db
      .prepare(
        `SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      )
      .bind(conversationId, auth.userId)
      .first<{ '1': number }>();

    if (!membership) {
      return ERRORS.FORBIDDEN('Not a member of this conversation');
    }

    // Count total messages
    const countResult = await db
      .prepare(
        `SELECT COUNT(*) as cnt FROM messages WHERE conversation_id = ? AND is_deleted = 0`,
      )
      .bind(conversationId)
      .first<{ cnt: number }>();
    const total = countResult?.cnt ?? 0;

    // Fetch messages (cursor or offset)
    let stmt;
    if (before) {
      stmt = db
        .prepare(
          `SELECT m.*, p.display_name as sender_name
           FROM messages m
           LEFT JOIN profiles p ON p.id = m.sender_id
           WHERE m.conversation_id = ? AND m.is_deleted = 0 AND m.created_at < ?
           ORDER BY m.created_at DESC
           LIMIT ?`,
        )
        .bind(conversationId, before, pageSize);
    } else {
      const offset = (page - 1) * pageSize;
      stmt = db
        .prepare(
          `SELECT m.*, p.display_name as sender_name
           FROM messages m
           LEFT JOIN profiles p ON p.id = m.sender_id
           WHERE m.conversation_id = ? AND m.is_deleted = 0
           ORDER BY m.created_at DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(conversationId, pageSize, offset);
    }

    const result = await stmt.all<MessageRow>();
    const messages = result.results.reverse().map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: row.sender_name ?? 'Unbekannt',
      type: row.type,
      body: row.body,
      mediaUrl: row.media_url,
      replyToId: row.reply_to_id,
      isPinned: !!row.is_pinned,
      createdAt: row.created_at,
    }));

    return paginated(messages, total, page, pageSize);
  } catch (err) {
    console.error('[api/chat/messages] GET error:', err);
    return ERRORS.INTERNAL_ERROR();
  }
}
