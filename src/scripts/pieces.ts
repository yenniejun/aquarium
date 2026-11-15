/** Start pieces one at a time, but present each visual row together once its first frames are
 * ready. A slow piece can hold a row for at most 700 ms after its first neighbour is ready. */
export function initPieces(page: HTMLElement) {
  const frames = [...page.querySelectorAll<HTMLIFrameElement>('iframe[data-piece-frame]')];
  const pieces = frames.filter((frame) => frame.hasAttribute('data-src'));
  const waiting = new Set<HTMLIFrameElement>();
  const visible = new Set<HTMLIFrameElement>();
  const ready = new Map<HTMLIFrameElement, number>();
  const sources = new Map(pieces.map((frame) => [frame, frame.dataset.src!]));
  const events = new AbortController();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const ROW_WAIT = 700;
  let busy = false;
  let active = true;
  let disposed = false;
  let finishLoad: (() => void) | null = null;

  function later(callback: () => void, delay: number) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!disposed) callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  const top = (frame: HTMLIFrameElement) => (frame.closest('[data-piece]') ?? frame).getBoundingClientRect().top;

  function revealRows() {
    if (!active || disposed) return;
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
    const modal = page.querySelector<HTMLDialogElement>('dialog[open]');
    const presented = 'loaded' in frame.parentElement!.dataset;
    const running = active && presented && !document.hidden && visible.has(frame) && (!modal || modal.contains(frame));
    // Sandboxed pieces have opaque origins, so the destination must be '*'. The child checks
    // event.source, and we accept its messages only from a known iframe's contentWindow.
    frame.contentWindow?.postMessage({ type: 'museum:visibility', active: running }, '*');
  }

  function start() {
    if (busy || !active || disposed) return;
    const frame = [...waiting].sort((a, b) => top(a) - top(b) || a.getBoundingClientRect().left - b.getBoundingClientRect().left)[0];
    if (!frame) return;
    waiting.delete(frame);
    busy = true;
    let finished = false;
    const next = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      timers.delete(timeout);
      frame.removeEventListener('load', next);
      finishLoad = null;
      busy = false;
      if (active) later(start, 60);
    };
    finishLoad = next;
    const timeout = later(next, 1500);
    frame.addEventListener('load', next);
    frame.src = frame.dataset.src!;
    delete frame.dataset.src;
  }

  window.addEventListener('message', (event: MessageEvent) => {
    if (event.data?.type !== 'museum:piece-init' && event.data?.type !== 'museum:piece-ready') return;
    const frame = frames.find((item) => item.contentWindow === event.source);
    if (!frame || !frame.hasAttribute('src')) return;
    syncVisibility(frame);
    if (event.data.type === 'museum:piece-init') {
      ready.delete(frame); // The larger viewer reuses its iframe for each newly opened piece.
      return;
    }
    if (ready.has(frame)) return;
    ready.set(frame, performance.now());
    if (pieces.includes(frame)) {
      revealRows();
      later(revealRows, ROW_WAIT);
    } else {
      // The larger viewer is a single piece, so it doesn't wait for a gallery row.
      frame.parentElement!.dataset.loaded = '';
      syncVisibility(frame);
    }
  }, { signal: events.signal });

  const nearby = new IntersectionObserver((entries) => {
    if (!active || disposed) return;
    for (const entry of entries) {
      const frame = entry.target as HTMLIFrameElement;
      if (!frame.hasAttribute('data-src')) continue;
      if (entry.isIntersecting) waiting.add(frame);
      else waiting.delete(frame);
    }
    start();
  }, { rootMargin: '200px 0px' });

  const onscreen = new IntersectionObserver((entries) => {
    if (!active || disposed) return;
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
  document.addEventListener('visibilitychange', syncAll, { signal: events.signal });
  const dialogs = new MutationObserver(syncAll);
  for (const dialog of page.querySelectorAll('dialog')) dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  window.addEventListener('resize', revealRows, { signal: events.signal });

  function unload(frame: HTMLIFrameElement) {
    // Navigating away releases the artwork document and its canvases, rather than just hiding it.
    frame.removeAttribute('src');
    delete frame.parentElement!.dataset.loaded;
    ready.delete(frame);
    visible.delete(frame);
    const source = sources.get(frame);
    if (source) frame.dataset.src = source;
  }

  return {
    suspend(limit = 3) {
      // Select before hiding the page: its boxes collapse once hidden. Keep only painted,
      // on-screen pieces; an unfinished frame should not continue loading in the cache.
      const keep = new Set(pieces.filter((frame) => ready.has(frame) && visible.has(frame) && 'loaded' in frame.parentElement!.dataset)
        .sort((a, b) => top(a) - top(b) || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        .slice(0, Math.max(0, limit)));
      active = false;
      syncAll();
      finishLoad?.();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      waiting.clear();
      nearby.disconnect();
      onscreen.disconnect();
      for (const frame of frames) if (!keep.has(frame)) unload(frame);
      visible.clear();
      return keep.size;
    },
    resume() {
      if (disposed) return;
      active = true;
      for (const frame of pieces) nearby.observe(frame);
      for (const frame of frames) onscreen.observe(frame);
      later(revealRows, 0);
    },
    dispose() {
      this.suspend(0);
      disposed = true;
      events.abort();
      dialogs.disconnect();
    },
  };
}
