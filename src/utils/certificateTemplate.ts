export type CertificatePreviewData = {
  pastorName: string;
  completionDate?: unknown;
  certificateId?: string;
  duration?: unknown;
};

export function toCertificatePreviewData(
  certificate: {
    pastorName?: string;
    completionDate?: string;
    issuedAt?: string;
    certificateId?: string;
    duration?: string;
  },
  pastorName: string,
): CertificatePreviewData {
  return {
    pastorName: String(certificate.pastorName || pastorName).trim() || pastorName,
    completionDate: certificate.completionDate ?? certificate.issuedAt,
    certificateId: certificate.certificateId,
    duration: certificate.duration,
  };
}

export function formatCertificateDate(raw?: unknown): string {
  if (!raw) return 'N/A';
  const date = new Date(String(raw));
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
}

export function certificateText(raw: unknown, fallback = 'N/A'): string {
  const value = String(raw ?? '').trim();
  return value || fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildCertificatePreviewHtml(
  data: CertificatePreviewData,
  templateImageBase64: string,
): string {
  const pastorName = escapeHtml(certificateText(data.pastorName, 'Pastor'));
  const completionDate = escapeHtml(formatCertificateDate(data.completionDate));
  const duration = escapeHtml(certificateText(data.duration, '12 Months'));
  const certificateId = escapeHtml(certificateText(data.certificateId));
  const status = 'Completed';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page {
            size: 140.2mm 112.2mm;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          .certificate {
            position: relative;
            width: 1402px;
            height: 1122px;
            overflow: hidden;
            background: #ffffff;
          }
          .certificate-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }
          .pastor-name {
            position: absolute;
            left: 23%;
            right: 18%;
            top: 42.4%;
            margin: 0;
            text-align: center;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 24px;
            font-weight: 700;
            color: #082d72;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .detail {
            position: absolute;
            top: 77.6%;
            margin: 0;
            text-align: center;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 11px;
            font-weight: 600;
            color: #082d72;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .completion-date {
            left: 18.5%;
            width: 10%;
          }
          .duration {
            left: 32%;
            width: 10%;
          }
          .certificate-id {
            left: 58%;
            width: 15%;
            font-size: 9px;
          }
          .status {
            left: 74%;
            width: 10%;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <img
            class="certificate-image"
            src="data:image/png;base64,${templateImageBase64}"
            alt="Completion certificate"
          />
          <p class="pastor-name">${pastorName}</p>
          <p class="detail completion-date">${completionDate}</p>
          <p class="detail duration">${duration}</p>
          <p class="detail certificate-id">${certificateId}</p>
          <p class="detail status">${status}</p>
        </div>
      </body>
    </html>
  `;
}
