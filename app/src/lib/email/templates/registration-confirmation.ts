import { emailLayout } from './base';

export function registrationConfirmationEmail(params: {
  name: string;
  congressName: string;
  ticketType: string;
  dates: string;
  venue: string;
  registrationId: string;
}): string {
  return emailLayout(
    `
    <h1>Anmeldung best\u00e4tigt</h1>
    <p>Hallo ${params.name},</p>
    <p>Ihre Anmeldung zum <strong>${params.congressName}</strong> wurde best\u00e4tigt.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Ticket</td><td style="padding: 8px 0; font-weight: 600;">${params.ticketType}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Datum</td><td style="padding: 8px 0;">${params.dates}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Ort</td><td style="padding: 8px 0;">${params.venue}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Registrierung</td><td style="padding: 8px 0; font-family: monospace;">${params.registrationId}</td></tr>
    </table>
    <p style="text-align: center; margin: 24px 0;">
      <a href="https://ensemble.events/de/dashboard" class="btn">Zum Dashboard</a>
    </p>
    <p class="muted">Bringen Sie Ihr Smartphone mit der Ensemble-App zum Check-in mit.</p>
  `,
    { congressName: params.congressName }
  );
}
