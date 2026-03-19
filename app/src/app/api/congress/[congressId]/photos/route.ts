import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, paginated, ERRORS } from '@/lib/api/response';
import {
  listPhotos,
  getPhotosForGallery,
  createPhoto,
  deletePhoto,
  togglePublic,
} from '@/lib/db/photos';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// ── Schemas ─────────────────────────────────────────────────────────────

const createPhotoSchema = z.object({
  r2_key: z.string().min(1),
  thumbnail_key: z.string().optional(),
  caption: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  is_public: z.boolean().optional(),
});

// ── GET: list photos ────────────────────────────────────────────────────

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
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '24', 10);
  const mine = url.searchParams.get('mine') === '1';

  if (mine) {
    const auth = await getRequestAuth();
    if (!auth) return ERRORS.UNAUTHORIZED();

    const result = await listPhotos(db, congressId, {
      userId: auth.userId,
      page,
      pageSize,
    });
    return paginated(result.photos, result.total, page, pageSize);
  }

  const result = await getPhotosForGallery(db, congressId, page, pageSize);
  return paginated(result.photos, result.total, page, pageSize);
}

// ── POST: create photo record ───────────────────────────────────────────

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
    // FormData uploads - extract JSON fields
    const formData = await request.formData();
    body = {
      r2_key: formData.get('r2_key') as string,
      thumbnail_key: (formData.get('thumbnail_key') as string) || undefined,
      caption: (formData.get('caption') as string) || undefined,
      location: (formData.get('location') as string) || undefined,
      is_public: formData.get('is_public') === '1',
    };
  }

  const parsed = createPhotoSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const id = await createPhoto(db, {
    congress_id: congressId,
    user_id: auth.userId,
    user_name: 'Unknown',
    r2_key: parsed.data.r2_key,
    thumbnail_key: parsed.data.thumbnail_key,
    caption: parsed.data.caption,
    location: parsed.data.location,
    is_public: parsed.data.is_public,
  });

  return success({ id }, 201);
}

// ── PATCH: toggle public ────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> },
) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  await params; // consume params
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const url = new URL(request.url);
  const photoId = url.searchParams.get('id');
  const action = url.searchParams.get('action');

  if (!photoId) return ERRORS.VALIDATION_ERROR('Missing photo id');

  if (action === 'togglePublic') {
    await togglePublic(db, photoId, auth.userId);
    return success({ toggled: true });
  }

  return ERRORS.VALIDATION_ERROR('Unknown action');
}

// ── DELETE: delete photo ────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> },
) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  await params; // consume params
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const url = new URL(request.url);
  const photoId = url.searchParams.get('id');

  if (!photoId) return ERRORS.VALIDATION_ERROR('Missing photo id');

  await deletePhoto(db, photoId, auth.userId);
  return success({ deleted: true });
}
