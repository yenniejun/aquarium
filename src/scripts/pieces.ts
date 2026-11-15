/** Start pieces one at a time, but present each visual row together once its first frames are
 * ready. A slow piece can hold a row for at most 700 ms after its first neighbour is ready. */
const frames = [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-piece-frame]')];
const pieces = frames.filter((frame) => frame.hasAttribute('data-src'));
const waiting = new Set<HTMLIFrameElement>();
const visible = new Set<HTMLIFrameElement>();
const ready = new Map<HTMLIFrameElement, number>();
const ROW_WAIT = 700;
let busy = false;

const top = (frame: HTMLIFrameElement) => (frame.closest('[data-piece]') ?? frame).getBoundingClientRect().top;

function revealRows() {
  // Use current positions, including the blind shuffle and responsive column changes.
  const positions = pieces.map((frame) => ({ frame, top: top(frame) }));
  for (const { frame, top: y } of positions) {
    if (!ready.has(frame) || 'loaded' in frame.parentElement!.dataset) continue;
    const row = positions.filter((item) => Math.abs(item.top - y) < 8).map((item) => item.frame);
    const firstReady = Math.min(...row.map((item) => ready.get(item) ?? Infinity));
    if (!row.every((item) => ready.has(item)) && performance.now() - firstReady < ROW_WAIT) continue;
    frame.parentElement!.dataset.loaded = '';
    syncVisibility(frame);
  }
}

function syncVisibility(frame: HTMLIFrameElement) {
  const modal = document.querySelector<HTMLDialogElement>('dialog[open]');
  const presented = 'loaded' in frame.parentElement!.dataset;
  const active = presented && !document.hidden && visible.has(frame) && (!modal || modal.contains(frame));
  // Sandboxed pieces have opaque origins, so the destination must be '*'. The child checks
  // event.source, and we accept its messages only from a known iframe's contentWindow.
  frame.contentWindow?.postMessage({ type: 'museum:visibility', active }, '*');
}

function start() {
  if (busy) return;
  const frame = [...waiting].sort((a, b) => top(a) - top(b) || a.getBoundingClientRect().left - b.getBoundingClientRect().left)[0];
  if (!frame) return;
  waiting.delete(frame);
  busy = true;
  let finished = false;
  const next = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    frame.removeEventListener('load', next);
    busy = false;
    setTimeout(start, 60);
  };
  const timeout = setTimeout(next, 1500);
  frame.addEventListener('load', next);
  frame.src = frame.dataset.src!;
  delete frame.dataset.src;
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.data?.type !== 'museum:piece-init' && event.data?.type !== 'museum:piece-ready') return;
  const frame = frames.find((item) => item.contentWindow === event.source);
  if (!frame) return;
  syncVisibility(frame);
  if (event.data.type === 'museum:piece-init') {
    ready.delete(frame); // The larger viewer reuses its iframe for each newly opened piece.
    return;
  }
  if (ready.has(frame)) return;
  ready.set(frame, performance.now());
  if (pieces.includes(frame)) {
    revealRows();
    setTimeout(revealRows, ROW_WAIT);
  } else {
    // The larger viewer is a single piece, so it doesn't wait for a gallery row.
    frame.parentElement!.dataset.loaded = '';
    syncVisibility(frame);
  }
});

const nearby = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const frame = entry.target as HTMLIFrameElement;
    if (!frame.hasAttribute('data-src')) continue;
    if (entry.isIntersecting) waiting.add(frame);
    else waiting.delete(frame);
  }
  start();
}, { rootMargin: '200px 0px' });

const onscreen = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const frame = entry.target as HTMLIFrameElement;
    if (entry.isIntersecting) visible.add(frame);
    else visible.delete(frame);
    syncVisibility(frame);
  }
});
for (const frame of pieces) nearby.observe(frame);
for (const frame of frames) onscreen.observe(frame);

const syncAll = () => frames.forEach(syncVisibility);
document.addEventListener('visibilitychange', syncAll);
const dialogs = new MutationObserver(syncAll);
for (const dialog of document.querySelectorAll('dialog')) dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] });
window.addEventListener('resize', revealRows);

export {};
