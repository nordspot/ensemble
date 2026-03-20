import { NextRequest, NextResponse } from 'next/server';
import { getR2 } from '@/lib/storage/r2';

/**
 * GET /api/files/[...path]
 * Public file serving endpoint that reads from R2.
 * Serves files with aggressive caching headers.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const r2Key = path.join('/');

  const r2 = getR2();
  if (!r2) {
    return new NextResponse('Storage not available', { status: 503 });
  }

  const object = await r2.get(r2Key);
  if (!object) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers = new Headers();
  if (object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType);
  }
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new NextResponse(object.body, { headers });
}
