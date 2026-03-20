import { emailLayout } from './base';

export function abstractDecisionEmail(params: {
  name: string;
  congressName: string;
  abstractTitle: string;
  decision: 'accepted' | 'rejected' | 'revision_requested';
  feedback?: string;
}): string {
  const decisionText = {
    accepted: {
      title: 'Abstract angenommen',
      color: '#16a34a',
      text: 'Ihr Abstract wurde angenommen.',
    },
    rejected: {
      title: 'Abstract nicht angenommen',
      color: '#dc2626',
      text: 'Leider konnte Ihr Abstract nicht ber\u00fccksichtigt werden.',
    },
    revision_requested: {
      title: '\u00dcberarbeitung erbeten',
      color: '#ca8a04',
      text: 'Wir bitten Sie, Ihr Abstract zu \u00fcberarbeiten.',
    },
  }[params.decision];

  return emailLayout(
    `
    <h1>${decisionText.title}</h1>
    <p>Hallo ${params.name},</p>
    <p>${decisionText.text}</p>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid ${decisionText.color};">
      <p style="margin: 0; font-weight: 600;">${params.abstractTitle}</p>
    </div>
    ${
      params.feedback
        ? `
    <p><strong>Feedback der Gutachter:</strong></p>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${params.feedback}</p>
    </div>`
        : ''
    }
    <p style="text-align: center; margin: 24px 0;">
      <a href="https://ensemble.events/de/dashboard" class="btn">Zum Dashboard</a>
    </p>
  `,
    { congressName: params.congressName }
  );
}
