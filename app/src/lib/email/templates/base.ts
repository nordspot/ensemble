export function emailLayout(
  content: string,
  options?: { congressName?: string; accentColor?: string }
): string {
  const accent = options?.accentColor ?? '#6366F1';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; color: #18181b; }
  .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
  .card { background: white; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; }
  .header { text-align: center; margin-bottom: 24px; }
  .logo { font-size: 24px; font-weight: 600; letter-spacing: 2px; color: #18181b; }
  .congress-name { font-size: 13px; color: #71717a; margin-top: 4px; }
  .btn { display: inline-block; padding: 12px 28px; background: ${accent}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
  .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #a1a1aa; }
  .footer a { color: #71717a; }
  h1 { font-size: 22px; margin: 0 0 16px; }
  p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #3f3f46; }
  .muted { color: #71717a; font-size: 13px; }
</style></head><body>
<div class="container">
  <div class="card">
    <div class="header">
      <div class="logo">ensemble</div>
      ${options?.congressName ? `<div class="congress-name">${options.congressName}</div>` : ''}
    </div>
    ${content}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Ensemble by Nord &middot; Made in Switzerland</p>
    <p><a href="https://ensemble.events/de/datenschutz">Datenschutz</a> &middot; <a href="https://ensemble.events/de/impressum">Impressum</a></p>
  </div>
</div>
</body></html>`;
}
