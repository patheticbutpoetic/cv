import type { FitMode } from '@/types/scanner';

/**
 * Pure HTML builder for PDF generation (PRD §17.5). One image per page.
 * On iOS, local file URLs in HTML are unreliable, so callers pass base64 data
 * URIs. Kept framework-free for unit testing.
 */
export interface PdfHtmlPage {
  /** data:image/jpeg;base64,... */
  dataUri: string;
}

function objectFitFor(fitMode: FitMode): string {
  switch (fitMode) {
    case 'FILL':
      return 'cover';
    case 'CENTER':
      return 'none';
    case 'FIT':
    default:
      return 'contain';
  }
}

export function buildPdfHtml(pages: PdfHtmlPage[], fitMode: FitMode = 'FIT'): string {
  const objectFit = objectFitFor(fitMode);
  const body = pages
    .map(
      (page) =>
        `<div class="page"><img src="${page.dataUri}" /></div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page {
        width: 100%;
        height: 100vh;
        page-break-after: always;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        box-sizing: border-box;
      }
      .page:last-child { page-break-after: auto; }
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: ${objectFit};
      }
    </style>
  </head>
  <body>
${body}
  </body>
</html>`;
}

/**
 * ID Card layout HTML: front near top, back centered below, on one page
 * (PRD §46.3).
 */
export function buildIdCardHtml(
  front: string | undefined,
  back: string | undefined,
  includeLabels: boolean
): string {
  const card = (dataUri: string, label: string) => `
    <div class="card">
      ${includeLabels ? `<div class="label">${label}</div>` : ''}
      <img src="${dataUri}" />
    </div>`;

  const cards = [
    front ? card(front, 'Front') : '',
    back ? card(back, 'Back') : '',
  ].join('\n');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page {
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 48px;
        padding: 64px 48px;
        background: #ffffff;
        box-sizing: border-box;
      }
      .card { width: 80%; text-align: center; }
      .label { font-family: -apple-system, sans-serif; color: #6B7280; margin-bottom: 8px; }
      img { width: 100%; border-radius: 12px; }
    </style>
  </head>
  <body>
    <div class="page">
${cards}
    </div>
  </body>
</html>`;
}
