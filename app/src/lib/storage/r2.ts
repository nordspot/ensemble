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

/** Allowed MIME types for photo uploads */
export const PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
] as const;

/** Allowed MIME types for document uploads */
export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
] as const;

/** Max file sizes in bytes */
export const MAX_FILE_SIZES = {
  photo: 10 * 1024 * 1024, // 10 MB
  document: 20 * 1024 * 1024, // 20 MB
  poster: 50 * 1024 * 1024, // 50 MB
} as const;
