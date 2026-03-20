// R2 storage helpers for Cloudflare R2 bucket operations

export interface R2Env {
  ENSEMBLE_R2: R2Bucket;
}

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    contentDisposition?: string;
  };
  customMetadata?: Record<string, string>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: {
    contentType?: string;
  };
  customMetadata?: Record<string, string>;
  body?: ReadableStream;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
}

interface R2ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
  delimiter?: string;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: R2PutOptions,
  ): Promise<R2Object>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

/**
 * Generate a storage path for an upload.
 * Path format: congresses/{congressId}/{type}/{timestamp}_{sanitized-filename}
 */
export function getUploadPath(
  congressId: string,
  type: 'photos' | 'presentations' | 'posters' | 'documents' | 'avatars',
  filename: string,
): string {
  const timestamp = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `congresses/${congressId}/${type}/${timestamp}_${safe}`;
}

/**
 * Derive a thumbnail path from an original file path.
 * e.g. "congresses/abc/photos/123_img.jpg" -> "congresses/abc/photos/123_img_thumb.jpg"
 */
export function getThumbnailPath(originalPath: string): string {
  return originalPath.replace(/(\.[^.]+)$/, '_thumb$1');
}

/** Max file size in bytes (50MB) */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Allowed MIME types per upload type */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  photos: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  presentations: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ],
  posters: ['application/pdf', 'image/jpeg', 'image/png'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
};

/** Allowed MIME types for photo uploads */
export const PHOTO_MIME_TYPES = ALLOWED_MIME_TYPES.photos;

/** Allowed MIME types for document uploads */
export const DOCUMENT_MIME_TYPES = ALLOWED_MIME_TYPES.documents;

/** Max file sizes in bytes */
export const MAX_FILE_SIZES = {
  photo: 10 * 1024 * 1024, // 10 MB
  document: 20 * 1024 * 1024, // 20 MB
  poster: 50 * 1024 * 1024, // 50 MB
} as const;

/** Check if a MIME type is allowed for the given upload type */
export function isAllowedMimeType(contentType: string, type: string): boolean {
  const allowed = ALLOWED_MIME_TYPES[type];
  if (!allowed) return false;
  return allowed.includes(contentType);
}

/** Get R2 bucket binding from Cloudflare context */
export function getR2(): R2Bucket | null {
  // Try OpenNext's getCloudflareContext first (production on CF Workers)
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.ENSEMBLE_R2) return ctx.env.ENSEMBLE_R2 as R2Bucket;
  } catch {
    // Not running on Cloudflare Workers
  }
  // Fallback: globalThis (for local dev or direct Worker context)
  const env = globalThis as Record<string, unknown>;
  return (env.ENSEMBLE_R2 as R2Bucket) ?? null;
}

/** Public URL for R2 objects served via the /api/files endpoint */
export function getPublicUrl(r2Key: string): string {
  return `https://ensemble.events/api/files/${encodeURIComponent(r2Key)}`;
}
