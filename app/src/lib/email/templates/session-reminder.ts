import { emailLayout } from './base';

export function sessionReminderEmail(params: {
  name: string;
  congressName: string;
  sessionTitle: string;
  speaker: string;
  room: string;
  time: string;
  minutesUntil: number;
}): string {
  return emailLayout(
    `
    <h1>Session in ${params.minutesUntil} Minuten</h1>
    <p>Hallo ${params.name},</p>
    <p>Ihre gebuchte Session beginnt in K\u00fcrze:</p>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 4px; font-weight: 600; font-size: 16px;">${params.sessionTitle}</p>
      <p style="margin: 0; color: #71717a; font-size: 13px;">${params.speaker} &middot; ${params.room} &middot; ${params.time}</p>
    </div>
    <p style="text-align: center; margin: 24px 0;">
      <a href="https://ensemble.events/de/dashboard" class="btn">Zur Session</a>
    </p>
  `,
    { congressName: params.congressName }
  );
}
