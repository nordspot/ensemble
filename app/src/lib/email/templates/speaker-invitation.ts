import { emailLayout } from './base';

export function speakerInvitationEmail(params: {
  name: string;
  congressName: string;
  sessionTitle: string;
  sessionDate: string;
  acceptUrl: string;
  deadline: string;
}): string {
  return emailLayout(
    `
    <h1>Einladung als Referent/in</h1>
    <p>Hallo ${params.name},</p>
    <p>Wir laden Sie herzlich ein, beim <strong>${params.congressName}</strong> als Referent/in teilzunehmen.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Session</td><td style="padding: 8px 0; font-weight: 600;">${params.sessionTitle}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Datum</td><td style="padding: 8px 0;">${params.sessionDate}</td></tr>
      <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Frist</td><td style="padding: 8px 0;">${params.deadline}</td></tr>
    </table>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${params.acceptUrl}" class="btn">Einladung annehmen</a>
    </p>
    <p class="muted">Nach der Annahme k\u00f6nnen Sie Ihr Profil, Ihre Pr\u00e4sentation und die Offenlegung von Interessenkonflikten im Speaker-Portal vervollst\u00e4ndigen.</p>
  `,
    { congressName: params.congressName }
  );
}
