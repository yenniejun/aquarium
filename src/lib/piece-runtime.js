// Gallery-owned scheduling; the model's drawing code stays untouched. Only pieces already
// checked at 30 fps are capped. All pieces can sleep when the parent says they're offscreen.
(() => {
  const capped = document.currentScript.hasAttribute('data-frame-cap');
  const nativeFrame = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  const callbacks = new Map();
  let nextId = 0;
  let pending = null;
  let last = -Infinity;
  let active = true;
  let warmup = true;

  const schedule = () => {
    if (pending !== null || !callbacks.size || (!warmup && (!active || document.hidden))) return;
    pending = nativeFrame(tick);
  };
  const tick = (now) => {
    pending = null;
    if (!warmup && (!active || document.hidden)) return;
    if (capped && now - last < 1000 / 30 - 4) return schedule();
    last = now;
    warmup = false;
    // Snapshot IDs, so a callback can still cancel another callback in this same frame.
    for (const id of [...callbacks.keys()]) {
      const cb = callbacks.get(id);
      if (!cb) continue;
      callbacks.delete(id);
      try {
        cb(now);
      } catch (err) {
        setTimeout(() => { throw err; });
      }
    }
    schedule();
  };
  window.requestAnimationFrame = (cb) => {
    callbacks.set(++nextId, cb);
    schedule();
    return nextId;
  };
  window.cancelAnimationFrame = (id) => {
    callbacks.delete(id);
  };

  // CSS animations need pausing too; RAF alone only covers JavaScript drawing loops.
  const style = document.createElement('style');
  style.textContent = 'html[data-museum-paused], html[data-museum-paused] *, html[data-museum-paused]::before, html[data-museum-paused]::after, html[data-museum-paused] *::before, html[data-museum-paused] *::after { animation-play-state: paused !important; }';
  document.head.append(style);
  const sync = () => {
    const paused = !active || document.hidden;
    document.documentElement.toggleAttribute('data-museum-paused', paused);
    if (paused && !warmup && pending !== null) {
      nativeCancel(pending);
      pending = null;
    }
    if (!paused) {
      last = -Infinity;
      schedule();
    }
  };
  document.addEventListener('visibilitychange', sync);
  if (window.parent !== window) {
    window.addEventListener('message', (event) => {
      if (event.source !== window.parent || event.data?.type !== 'museum:visibility') return;
      if (typeof event.data.active !== 'boolean') return;
      active = event.data.active;
      sync();
    });
    window.parent.postMessage({ type: 'museum:piece-init' }, '*');
    // A document's load event can precede its first canvas paint. Give drawing callbacks a
    // turn, then let the parent reveal it. Warmup allows one draw even while preloaded asleep.
    window.addEventListener('load', () => {
      nativeFrame(() => nativeFrame(() => {
        window.parent.postMessage({ type: 'museum:piece-ready' }, '*');
      }));
    }, { once: true });
  }
  sync();
})();
