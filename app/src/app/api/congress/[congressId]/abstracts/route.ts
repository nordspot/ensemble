import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, paginated, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getCongress } from '@/lib/db/congresses';
import { listAbstracts, createAbstract, getAbstract } from '@/lib/db/abstracts';
import { isOrganizer } from '@/lib/auth/permissions';
import { paginationSchema } from '@/lib/utils/validation';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// ── Schemas ──────────────────────────────────────────────────────────

const authorSchema = z.object({
  name: z.string().min(1, 'Author name required'),
  affiliation: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  is_presenter: z.boolean().default(false),
  sort_order: z.number().int().nonnegative().default(0),
});

const createAbstractSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title max 200 characters'),
  abstract_text: z.string().min(1, 'Abstract text required').max(3000, 'Abstract max 3000 characters'),
  presentation_type: z.enum(['oral', 'poster', 'either'] as const),
  keywords: z.array(z.string().min(1)).min(3, 'At least 3 keywords').max(6, 'At most 6 keywords'),
  authors: z.array(authorSchema).min(1, 'At least one author required'),
  track_id: z.string().optional(),
});

// ── GET /api/congress/[congressId]/abstracts ─────────────────────────

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId } = await context.params;
  const url = new URL(request.url);

  // Parse query params
  const status = url.searchParams.get('status') ?? undefined;
  const trackId = url.searchParams.get('track_id') ?? undefined;
  const pageParam = url.searchParams.get('page') ?? '1';
  const pageSizeParam = url.searchParams.get('pageSize') ?? '20';

  const pag = paginationSchema.safeParse({ page: pageParam, pageSize: pageSizeParam });
  const page = pag.success ? pag.data.page : 1;
  const pageSize = pag.success ? pag.data.pageSize : 20;

  try {
    // Non-organizers can only see their own abstracts
    if (isOrganizer(auth.role)) {
      const { abstracts, total } = await listAbstracts(db, congressId, {
        status: status as 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'revision_requested' | undefined,
        trackId,
        page,
        pageSize,
      });
      return paginated(abstracts, total, page, pageSize);
    }

    // Regular users: only their own abstracts for this congress
    const { abstracts, total } = await listAbstracts(db, congressId, { page, pageSize });
    const own = abstracts.filter((a) => a.user_id === auth.userId);
    return paginated(own, own.length, page, pageSize);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// ── POST /api/congress/[congressId]/abstracts ────────────────────────

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId } = await context.params;

  // Verify congress exists
  const congress = await getCongress(db, congressId);
  if (!congress) return ERRORS.NOT_FOUND('Congress not found');

  // Check if abstract submission is open
  if (!congress.abstract_submission_open) {
    return ERRORS.VALIDATION_ERROR('Abstract submission is closed');
  }
  if (congress.abstract_deadline) {
    const deadline = new Date(congress.abstract_deadline);
    if (new Date() > deadline) {
      return ERRORS.VALIDATION_ERROR('Abstract submission deadline has passed');
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createAbstractSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  try {
    const id = await createAbstract(db, {
      congress_id: congressId,
      user_id: auth.userId,
      track_id: input.track_id ?? null,
      title: input.title,
      body: input.abstract_text,
      keywords: input.keywords,
      authors: input.authors.map((a, i) => ({
        name: a.name,
        affiliation: a.affiliation ?? null,
        email: a.email ?? null,
        is_presenter: a.is_presenter,
        sort_order: a.sort_order ?? i,
      })),
      presentation_type: input.presentation_type,
      status: 'submitted',
    });

    const created = await getAbstract(db, id);
    return success(created, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) {
      return ERRORS.CONFLICT('Duplicate abstract submission');
    }
    return ERRORS.INTERNAL_ERROR(message);
  }
}
