import { emailLayout } from './base';

export function passwordResetEmail(params: {
  name: string;
  resetUrl: string;
  expiresIn: string;
}): string {
  return emailLayout(`
    <h1>Passwort zur\u00fccksetzen</h1>
    <p>Hallo ${params.name},</p>
    <p>Sie haben das Zur\u00fccksetzen Ihres Passworts angefordert. Klicken Sie auf den folgenden Button, um ein neues Passwort festzulegen:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${params.resetUrl}" class="btn">Neues Passwort festlegen</a>
    </p>
    <p class="muted">Dieser Link ist ${params.expiresIn} g\u00fcltig. Falls Sie kein neues Passwort angefordert haben, k\u00f6nnen Sie diese E-Mail ignorieren.</p>
  `);
}
