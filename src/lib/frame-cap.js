// Added by the gallery, not by the model: draws a piece at most 30 times a second, so a room of a
// dozen animations stays light. Animation callbacks still get the real time, so anything timed
// by the clock moves exactly as before, just in fewer, slightly larger steps. Only pieces that
// were checked to look the same this way get it (their meta.json has "frameCap": true).
(() => {
  const native = window.requestAnimationFrame.bind(window);
  const STEP = 1000 / 30;
  let callbacks = new Map();
  let nextId = 0;
  let pending = false;
  let last = -Infinity;
  const schedule = () => {
    if (pending || !callbacks.size) return;
    pending = true;
    native(tick);
  };
  const tick = (now) => {
    pending = false;
    if (now - last < STEP - 4) return schedule();
    last = now;
    const run = callbacks;
    callbacks = new Map();
    for (const cb of run.values()) {
      try {
        cb(now);
      } catch (err) {
        setTimeout(() => {
          throw err;
        });
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
})();
