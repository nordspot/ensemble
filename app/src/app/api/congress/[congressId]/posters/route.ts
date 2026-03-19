import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, paginated, ERRORS } from '@/lib/api/response';
import { listPosters, createPoster, voteForPoster } from '@/lib/db/posters';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ─────────────────────────────────────────────────────────────

const createPosterSchema = z.object({
  title: z.string().min(1).max(300),
  authors: z.string().min(1).max(500),
  poster_number: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  abstract: z.string().max(5000).optional(),
  file_key: z.string().min(1),
  thumbnail_key: z.string().optional(),
});

const voteSchema = z.object({
  posterId: z.string().min(1),
});

// ── GET: list posters ───────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> },
) {
  const { congressId } = await params;
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10);
  const category = url.searchParams.get('category') ?? undefined;

  const result = await listPosters(db, congressId, { category, page, pageSize });
  return paginated(result.posters, result.total, page, pageSize);
}

// ── POST: create poster ─────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> },
) {
  const { congressId } = await params;
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const body = await request.json();

  const parsed = createPosterSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const id = await createPoster(db, {
    congress_id: congressId,
    user_id: auth.userId,
    title: parsed.data.title,
    authors: parsed.data.authors,
    poster_number: parsed.data.poster_number,
    category: parsed.data.category,
    abstract: parsed.data.abstract,
    file_key: parsed.data.file_key,
    thumbnail_key: parsed.data.thumbnail_key,
  });

  return success({ id }, 201);
}

// ── PATCH: vote for poster ──────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> },
) {
  await params; // consume
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const body = await request.json();

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR('Missing posterId');
  }

  await voteForPoster(db, parsed.data.posterId, auth.userId);
  return success({ voted: true });
}
