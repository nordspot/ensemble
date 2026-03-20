/**
 * Generate a CSV string from headers and rows.
 * Includes UTF-8 BOM for proper Excel rendering of special characters.
 */
export function generateCsv(headers: string[], rows: string[][]): string {
  const BOM = '\uFEFF';
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return BOM + lines.join('\r\n');
}
