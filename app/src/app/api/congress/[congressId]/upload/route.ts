import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getRequestAuth } from '@/lib/api/server-helpers';
import { success, ERRORS } from '@/lib/api/response';
import { getUploadPath, isAllowedMimeType, MAX_FILE_SIZE, getR2 } from '@/lib/storage/r2';

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  type: z.enum(['photos', 'presentations', 'posters', 'documents', 'avatars']),
  fileSize: z.number().optional(),
});

/**
 * POST /api/congress/[congressId]/upload
 * Create an upload intent — returns the r2Key to use with PUT.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> }
) {
  try {
    const auth = await getRequestAuth();
    if (!auth) return ERRORS.UNAUTHORIZED();

    const { congressId } = await params;
    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) return ERRORS.VALIDATION_ERROR(parsed.error.message);

    const { filename, contentType, type, fileSize } = parsed.data;

    // Validate MIME type
    if (!isAllowedMimeType(contentType, type)) {
      return ERRORS.VALIDATION_ERROR('Dateityp nicht erlaubt');
    }

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return ERRORS.VALIDATION_ERROR('Datei zu gross (max 50MB)');
    }

    // Generate R2 key
    const r2Key = getUploadPath(congressId, type, filename);

    return success({
      r2Key,
      maxSize: MAX_FILE_SIZE,
    });
  } catch (err) {
    console.error('Upload intent error:', err);
    return ERRORS.INTERNAL_ERROR('Upload fehlgeschlagen');
  }
}

/**
 * PUT /api/congress/[congressId]/upload
 * Direct upload via R2 binding. Accepts the file body and writes to R2.
 * Requires x-r2-key header with the key returned from POST.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ congressId: string }> }
) {
  try {
    const auth = await getRequestAuth();
    if (!auth) return ERRORS.UNAUTHORIZED();

    const { congressId } = await params;
    const r2Key = request.headers.get('x-r2-key');
    const contentType = request.headers.get('content-type') ?? 'application/octet-stream';

    if (!r2Key || !r2Key.startsWith(`congresses/${congressId}/`)) {
      return ERRORS.VALIDATION_ERROR('Ungültiger Upload-Pfad');
    }

    // Get R2 bucket binding
    const r2 = getR2();
    if (!r2) return ERRORS.INTERNAL_ERROR('Storage nicht verfügbar');

    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_FILE_SIZE) {
      return ERRORS.VALIDATION_ERROR('Datei zu gross (max 50MB)');
    }

    await r2.put(r2Key, body, {
      httpMetadata: { contentType },
      customMetadata: { uploadedBy: auth.userId, congressId },
    });

    return success({ r2Key, size: body.byteLength });
  } catch (err) {
    console.error('Upload error:', err);
    return ERRORS.INTERNAL_ERROR('Upload fehlgeschlagen');
  }
}
