/**
 * Generate an iCal (RFC 5545) VCALENDAR string from an array of events.
 */

export interface IcalEvent {
  uid: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  timezone?: string;
}

function formatIcalDate(iso: string, timezone: string): string {
  // Convert ISO 8601 to iCal DTSTART;TZID format: YYYYMMDDTHHMMSS
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `DTSTART;TZID=${timezone}:${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function foldLine(line: string): string {
  // RFC 5545: lines should be max 75 octets; fold with CRLF + space
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  const parts: string[] = [];
  parts.push(line.substring(0, maxLen));
  let i = maxLen;
  while (i < line.length) {
    parts.push(' ' + line.substring(i, i + maxLen - 1));
    i += maxLen - 1;
  }
  return parts.join('\r\n');
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateIcal(events: IcalEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ensemble Events//Congress Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const tz = event.timezone ?? 'Europe/Zurich';
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    const formatDt = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const h = String(d.getUTCHours()).padStart(2, '0');
      const min = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      return `${y}${m}${day}T${h}${min}${s}`;
    };

    lines.push('BEGIN:VEVENT');
    lines.push(foldLine(`UID:${event.uid}`));
    lines.push(foldLine(`SUMMARY:${escapeText(event.title)}`));
    lines.push(`DTSTART;TZID=${tz}:${formatDt(startDate)}`);
    lines.push(`DTEND;TZID=${tz}:${formatDt(endDate)}`);

    if (event.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeText(event.description)}`));
    }
    if (event.location) {
      lines.push(foldLine(`LOCATION:${escapeText(event.location)}`));
    }

    const now = new Date();
    lines.push(`DTSTAMP:${formatDt(now)}Z`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
