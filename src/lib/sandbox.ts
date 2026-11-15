/**
 * Pieces are untrusted, model-written code. Two layers keep them in their tank:
 *
 * 1. The iframe is `sandbox="allow-scripts"` with no `allow-same-origin`, so the piece
 *    runs in an opaque origin: it can't read the parent page, its cookies, or its
 *    storage (which matters once votes exist).
 * 2. We inject the CSP below as the first thing in <head>, enforcing the brief's
 *    "everything is code" rule: no network, no external images, scripts only from
 *    the CDN allowlist.
 *
 * A gallery-owned runtime pauses offscreen drawing and reports when the first frame is ready.
 * Only pieces checked to look the same at 30 fps also get the optional frame cap.
 */
import pieceRuntime from './piece-runtime.js?raw';
export const PIECE_CDNS = ['https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://unpkg.com'];

export const PIECE_CSP = [
  `default-src 'none'`,
  `script-src 'unsafe-inline' 'unsafe-eval' ${PIECE_CDNS.join(' ')}`,
  `style-src 'unsafe-inline' ${PIECE_CDNS.join(' ')} https://fonts.googleapis.com`,
  `font-src data: https://fonts.gstatic.com`,
  `img-src data: blob:`,
  `media-src data: blob:`,
  `worker-src blob:`,
  `connect-src 'none'`,
].join('; ');

const META = `<meta http-equiv="Content-Security-Policy" content="${PIECE_CSP}">`;

export function sandboxHtml(html: string, { frameCap = false } = {}): string {
  const inject = META + `<script${frameCap ? ' data-frame-cap' : ''}>${pieceRuntime}</script>`;
  const head = html.match(/<head[^>]*>/i);
  if (head) return html.replace(head[0], `${head[0]}${inject}`);
  // Never put anything before <!doctype>, it would flip the page into quirks mode.
  const doctype = html.match(/<!doctype[^>]*>/i);
  if (doctype) return html.replace(doctype[0], `${doctype[0]}${inject}`);
  return inject + html;
}
