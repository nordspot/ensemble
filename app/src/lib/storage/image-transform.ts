/**
 * Cloudflare Images transform URL helpers for thumbnails and optimized images.
 * Uses CF's cdn-cgi/image endpoint for on-the-fly image transformations.
 */

const BASE_URL = 'https://ensemble.events';

export function getThumbnailUrl(r2Key: string, width = 400, quality = 80): string {
  const publicUrl = `${BASE_URL}/api/files/${encodeURIComponent(r2Key)}`;
  return `${BASE_URL}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${publicUrl}`;
}

export function getOptimizedUrl(
  r2Key: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'scale-down';
  } = {}
): string {
  const { width = 800, quality = 85, fit = 'scale-down' } = options;
  const publicUrl = `${BASE_URL}/api/files/${encodeURIComponent(r2Key)}`;
  const params = [`width=${width}`, `quality=${quality}`, `fit=${fit}`, 'format=auto'];
  if (options.height) params.push(`height=${options.height}`);
  return `${BASE_URL}/cdn-cgi/image/${params.join(',')}/${publicUrl}`;
}
