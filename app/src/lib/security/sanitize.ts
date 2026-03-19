// Strip HTML tags from user input (prevent XSS)
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitize for SQL LIKE queries (escape wildcards)
export function sanitizeLike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}
