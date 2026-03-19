import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, paginated, ERRORS } from '@/lib/api/response';
import { listArticles, createArticle } from '@/lib/db/articles';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ─────────────────────────────────────────────────────────────

const createArticleSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().max(2000).optional(),
  keywords: z.array(z.string().max(50)).max(6).optional(),
  file_key: z.string().min(1),
  file_type: z.string().min(1),
  file_size: z.number().int().positive(),
});

// ── GET: list articles ──────────────────────────────────────────────────

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

  // Non-organizers only see published articles
  const auth = await getRequestAuth();
  const showAll = auth && isOrganizer(auth.role);

  const result = await listArticles(db, congressId, {
    published: showAll ? undefined : true,
    page,
    pageSize,
  });

  return paginated(result.articles, result.total, page, pageSize);
}

// ── POST: create article ────────────────────────────────────────────────

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

  let body: unknown;
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    body = await request.json();
  } else {
    // FormData
    const formData = await request.formData();
    let keywords: string[] = [];
    const rawKeywords = formData.get('keywords') as string | null;
    if (rawKeywords) {
      try {
        keywords = JSON.parse(rawKeywords) as string[];
      } catch {
        keywords = [];
      }
    }
    body = {
      title: formData.get('title') as string,
      summary: (formData.get('summary') as string) || undefined,
      keywords,
      file_key: (formData.get('file_key') as string) ?? '',
      file_type: (formData.get('file_type') as string) ?? 'application/pdf',
      file_size: parseInt((formData.get('file_size') as string) ?? '0', 10),
    };
  }

  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const id = await createArticle(db, {
    congress_id: congressId,
    user_id: auth.userId,
    title: parsed.data.title,
    summary: parsed.data.summary,
    keywords: parsed.data.keywords,
    file_key: parsed.data.file_key,
    file_type: parsed.data.file_type,
    file_size: parsed.data.file_size,
  });

  return success({ id }, 201);
}
