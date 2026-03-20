/**
 * HTML-based PDF renderer for badges and certificates.
 *
 * Returns printable HTML that can be opened in a browser and printed to PDF
 * using the browser's native print dialog or a headless browser.
 */

interface BadgeParams {
  name: string;
  org: string;
  ticketType: string;
  qrDataUrl: string;
  congressName: string;
  roleColor: string;
}

interface CertificateParams {
  name: string;
  congressName: string;
  credits: number;
  creditType: string;
  verificationCode: string;
  date: string;
}

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
`;

export function generateBadgeHtml(params: BadgeParams): string {
  const { name, org, ticketType, qrDataUrl, congressName, roleColor } = params;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Badge – ${escapeHtml(name)}</title>
  <style>
    ${BASE_STYLES}
    @page {
      size: 85.6mm 54mm; /* CR-80 card */
      margin: 0;
    }
    .badge {
      width: 85.6mm;
      height: 54mm;
      padding: 4mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .badge::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6mm;
      background: ${escapeHtml(roleColor)};
    }
    .congress-name {
      font-size: 7pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      margin-top: 7mm;
    }
    .attendee-name {
      font-size: 14pt;
      font-weight: 700;
      color: #0A0F1E;
      line-height: 1.2;
      margin-top: 1mm;
    }
    .org-name {
      font-size: 9pt;
      color: #444;
      margin-top: 0.5mm;
    }
    .badge-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .ticket-type {
      font-size: 8pt;
      font-weight: 600;
      color: ${escapeHtml(roleColor)};
      text-transform: uppercase;
      letter-spacing: 0.3pt;
    }
    .qr-code {
      width: 14mm;
      height: 14mm;
    }
  </style>
</head>
<body>
  <div class="badge">
    <div>
      <div class="congress-name">${escapeHtml(congressName)}</div>
      <div class="attendee-name">${escapeHtml(name)}</div>
      <div class="org-name">${escapeHtml(org)}</div>
    </div>
    <div class="badge-footer">
      <div class="ticket-type">${escapeHtml(ticketType)}</div>
      <img class="qr-code" src="${escapeHtml(qrDataUrl)}" alt="QR Code" />
    </div>
  </div>
</body>
</html>`;
}

export function generateCertificateHtml(params: CertificateParams): string {
  const { name, congressName, credits, creditType, verificationCode, date } = params;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Zertifikat – ${escapeHtml(name)}</title>
  <style>
    ${BASE_STYLES}
    @page {
      size: A4 landscape;
      margin: 15mm;
    }
    .certificate {
      width: 267mm;
      height: 180mm;
      padding: 20mm;
      border: 2px solid #0A0F1E;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .certificate::before,
    .certificate::after {
      content: '';
      position: absolute;
      border: 1px solid #ccc;
    }
    .certificate::before {
      inset: 3mm;
    }
    .certificate::after {
      inset: 5mm;
    }
    .header-text {
      font-size: 11pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2pt;
      margin-bottom: 4mm;
    }
    .congress-title {
      font-size: 16pt;
      font-weight: 700;
      color: #0A0F1E;
      margin-bottom: 8mm;
    }
    .certifies {
      font-size: 10pt;
      color: #666;
      margin-bottom: 3mm;
    }
    .recipient-name {
      font-size: 22pt;
      font-weight: 700;
      color: #0A0F1E;
      margin-bottom: 8mm;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3mm;
      min-width: 100mm;
    }
    .credits-text {
      font-size: 12pt;
      color: #333;
      margin-bottom: 2mm;
    }
    .credit-value {
      font-size: 18pt;
      font-weight: 700;
      color: #0A0F1E;
      margin-bottom: 10mm;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: auto;
      padding-top: 10mm;
    }
    .footer-item {
      font-size: 8pt;
      color: #888;
    }
    .verification {
      font-family: monospace;
      font-size: 8pt;
      color: #999;
      margin-top: 5mm;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 24px;
      background: #0A0F1E;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Drucken / PDF</button>
  <div class="certificate">
    <div class="header-text">Teilnahmezertifikat</div>
    <div class="congress-title">${escapeHtml(congressName)}</div>
    <div class="certifies">Hiermit wird bescheinigt, dass</div>
    <div class="recipient-name">${escapeHtml(name)}</div>
    <div class="credits-text">erfolgreich teilgenommen hat und</div>
    <div class="credit-value">${credits} ${escapeHtml(creditType)}-Punkte</div>
    <div class="credits-text">erworben hat.</div>
    <div class="footer">
      <div class="footer-item">Datum: ${escapeHtml(date)}</div>
      <div class="footer-item">ensemble.events</div>
    </div>
    <div class="verification">Verifizierungscode: ${escapeHtml(verificationCode)}</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
