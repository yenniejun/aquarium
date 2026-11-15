import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Deterministic clocks exercise the real browser scripts without network or rendering timing.
class Events {
  listeners = new Map();
  addEventListener(type, callback, options) {
    const listener = options?.once ? (...args) => {
      this.removeEventListener(type, listener);
      callback(...args);
    } : callback;
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  emit(type, event = {}) { for (const cb of [...(this.listeners.get(type) ?? [])]) cb(event); }
}

function clock() {
  let now = 0, id = 0;
  const timers = new Map();
  return {
    now: () => now,
    setTimeout(cb, delay = 0) { const key = ++id; timers.set(key, { cb, at: now + delay }); return key; },
    clearTimeout(key) { timers.delete(key); },
    advance(to) {
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > to) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].cb();
      }
      now = to;
    },
  };
}

const runtimeSource = readFileSync(new URL('../src/lib/piece-runtime.js', import.meta.url), 'utf8');
const loaderSource = ts.transpileModule(readFileSync(new URL('../src/scripts/pieces.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function runtime({ capped = false, embedded = true } = {}) {
  const window = new Events(), document = new Events();
  const attributes = new Set(), nativeCallbacks = new Map(), messages = [];
  let id = 0;
  document.hidden = false;
  document.currentScript = { hasAttribute: () => capped };
  document.createElement = () => ({});
  document.head = { append() {} };
  document.documentElement = { toggleAttribute: (name, on) => on ? attributes.add(name) : attributes.delete(name) };
  window.requestAnimationFrame = (cb) => { nativeCallbacks.set(++id, cb); return id; };
  window.cancelAnimationFrame = (key) => nativeCallbacks.delete(key);
  window.parent = embedded ? { postMessage: (message) => messages.push(message) } : window;
  vm.runInNewContext(runtimeSource, { window, document, setTimeout });
  return {
    window, document, messages, attributes, nativeCallbacks,
    active(value, source = window.parent) {
      window.emit('message', { source, data: { type: 'museum:visibility', active: value } });
    },
    step(time) {
      for (const key of [...nativeCallbacks.keys()]) {
        const cb = nativeCallbacks.get(key);
        if (!cb) continue;
        nativeCallbacks.delete(key);
        cb(time);
      }
    },
  };
}

function gallery(positions = [[0, 0], [0, 100], [0, 200]], viewer = false) {
  const time = clock(), window = new Events(), document = new Events();
  const observers = [], mutations = [], starts = [];
  const frames = positions.map(([top, left], i) => {
    const frame = new Events();
    frame.dataset = viewer && i === positions.length - 1 ? {} : { src: `/piece-${i}.html` };
    frame.parentElement = { dataset: {} };
    frame.position = { top, left };
    frame.getBoundingClientRect = () => frame.position;
    frame.closest = () => frame;
    frame.hasAttribute = (name) => name === 'data-src' && 'src' in frame.dataset;
    frame.contentWindow = { messages: [], postMessage(message) { this.messages.push(message); } };
    Object.defineProperty(frame, 'src', { set(value) { starts.push({ i, at: time.now(), value }); } });
    return frame;
  });
  document.hidden = false;
  document.modal = null;
  document.querySelectorAll = (selector) => selector === 'dialog' ? [{}] : frames;
  document.querySelector = () => document.modal;
  vm.runInNewContext(loaderSource, {
    window, document, exports: {}, performance: { now: time.now },
    setTimeout: time.setTimeout, clearTimeout: time.clearTimeout,
    IntersectionObserver: class {
      constructor(cb, options) { this.cb = cb; this.options = options; observers.push(this); }
      observe() {}
    },
    MutationObserver: class { constructor(cb) { mutations.push(cb); } observe() {} },
  });
  return {
    frames, starts, time, window, document,
    near(indices, isIntersecting = true) {
      observers[0].cb(indices.map((i) => ({ target: frames[i], isIntersecting })));
    },
    visible(indices, isIntersecting = true) {
      observers[1].cb(indices.map((i) => ({ target: frames[i], isIntersecting })));
    },
    signal(i, type = 'museum:piece-ready') {
      window.emit('message', { source: frames[i].contentWindow, data: { type } });
    },
    modal(value) { document.modal = value; mutations.forEach((cb) => cb()); },
  };
}

test('offscreen pieces draw one warmup frame, then stop; returning resumes without reloading', () => {
  const r = runtime();
  let draws = 0;
  const draw = () => { draws++; r.window.requestAnimationFrame(draw); };
  r.active(false);
  r.window.requestAnimationFrame(draw);
  r.window.emit('load');
  r.step(0); r.step(16); r.step(32);
  assert.equal(draws, 1);
  assert.equal(r.nativeCallbacks.size, 0);
  assert.ok(r.attributes.has('data-museum-paused'));
  assert.ok(r.messages.some((message) => message.type === 'museum:piece-ready'));
  r.active(true);
  r.step(48);
  assert.equal(draws, 2);
  assert.ok(!r.attributes.has('data-museum-paused'));
});

test('only reviewed pieces get the 30 fps cap; standalone pieces still animate', () => {
  for (const capped of [false, true]) {
    const r = runtime({ capped, embedded: false });
    let draws = 0;
    const draw = () => { draws++; r.window.requestAnimationFrame(draw); };
    r.window.requestAnimationFrame(draw);
    for (let i = 0; i < 60; i++) r.step(i * 1000 / 60);
    assert.equal(draws, capped ? 30 : 60);
  }
});

test('unrelated windows cannot control the runtime; hidden tabs sleep too', () => {
  const r = runtime();
  let draws = 0;
  const draw = () => { draws++; r.window.requestAnimationFrame(draw); };
  r.window.requestAnimationFrame(draw);
  r.step(0);
  r.active(false, {});
  r.step(16);
  assert.equal(draws, 2);
  r.document.hidden = true;
  r.document.emit('visibilitychange');
  r.step(32);
  assert.equal(draws, 2);
  r.document.hidden = false;
  r.document.emit('visibilitychange');
  r.step(48);
  assert.equal(draws, 3);
});

test('RAF cancellation works even for callbacks in the current frame', () => {
  const r = runtime();
  const calls = [];
  let second;
  r.window.requestAnimationFrame(() => { calls.push('first'); r.window.cancelAnimationFrame(second); });
  second = r.window.requestAnimationFrame(() => calls.push('second'));
  r.step(0);
  assert.deepEqual(calls, ['first']);
});

test('a visual row reveals together, based on painted readiness rather than document load', () => {
  const g = gallery();
  g.visible([0, 1, 2]);
  g.near([0, 1, 2]);
  g.frames[0].emit('load');
  g.signal(0);
  g.time.advance(100);
  g.frames[1].emit('load');
  g.signal(1);
  assert.ok(g.frames.every((frame) => !('loaded' in frame.parentElement.dataset)));
  assert.ok(g.frames.every((frame) => !frame.contentWindow.messages.at(-1).active));
  g.time.advance(200);
  g.signal(2);
  assert.ok(g.frames.every((frame) => 'loaded' in frame.parentElement.dataset));
  assert.ok(g.frames.every((frame) => frame.contentWindow.messages.at(-1).active));
});

test('a slow or failed neighbour cannot hold the ready tanks past the reveal deadline', () => {
  const g = gallery();
  g.near([0, 1, 2]);
  g.frames[0].emit('load');
  g.signal(0);
  g.time.advance(699);
  assert.ok(!('loaded' in g.frames[0].parentElement.dataset));
  g.time.advance(700);
  assert.ok('loaded' in g.frames[0].parentElement.dataset);
  assert.ok(!('loaded' in g.frames[1].parentElement.dataset));
  g.signal(1);
  assert.ok('loaded' in g.frames[1].parentElement.dataset);
});

test('successful loads cancel their fallback; a late load cannot advance another tank', () => {
  const g = gallery([[0, 0], [0, 100], [0, 200], [100, 0]]);
  g.near([0, 1, 2, 3]);
  g.time.advance(100);
  g.frames[0].emit('load');
  g.time.advance(1560);
  assert.deepEqual(g.starts.map(({ i, at }) => [i, at]), [[0, 0], [1, 160]]);
  g.time.advance(1720);
  assert.deepEqual(g.starts.map(({ i, at }) => [i, at]), [[0, 0], [1, 160], [2, 1720]]);
  g.frames[1].emit('load');
  g.time.advance(2000);
  assert.equal(g.starts.length, 3);
});

test('loading follows visual shuffle order and drops queued pieces scrolled far away', () => {
  const g = gallery([[100, 0], [0, 100], [0, 0]]);
  g.near([0, 1, 2]);
  assert.equal(g.starts[0].i, 2);
  g.near([1], false);
  g.frames[2].emit('load');
  g.time.advance(60);
  assert.equal(g.starts[1].i, 0);
});

test('visibility messages pause background tanks while a viewer is open', () => {
  const g = gallery([[0, 0], [0, 100]], true);
  g.visible([0, 1]);
  g.signal(0);
  g.signal(1);
  assert.ok(g.frames[0].contentWindow.messages.at(-1).active);
  g.modal({ contains: (frame) => frame === g.frames[1] });
  assert.equal(g.frames[0].contentWindow.messages.at(-1).active, false);
  assert.equal(g.frames[1].contentWindow.messages.at(-1).active, true);
  g.modal(null);
  g.visible([0], false);
  assert.equal(g.frames[0].contentWindow.messages.at(-1).active, false);
  g.document.hidden = true;
  g.document.emit('visibilitychange');
  assert.equal(g.frames[1].contentWindow.messages.at(-1).active, false);
});

test('the viewer can report readiness again after navigating to another piece', () => {
  const g = gallery([[0, 0]], true);
  g.signal(0, 'museum:piece-init');
  g.signal(0);
  assert.ok('loaded' in g.frames[0].parentElement.dataset);
  delete g.frames[0].parentElement.dataset.loaded;
  g.signal(0, 'museum:piece-init');
  g.signal(0);
  assert.ok('loaded' in g.frames[0].parentElement.dataset);
});

test('unknown frame messages cannot reveal artworks; row grouping adapts to resize', () => {
  const g = gallery();
  g.window.emit('message', { source: {}, data: { type: 'museum:piece-ready' } });
  assert.ok(g.frames.every((frame) => !('loaded' in frame.parentElement.dataset)));
  g.signal(0);
  g.frames[1].position.top = 100;
  g.frames[2].position.top = 100;
  g.window.emit('resize');
  assert.ok('loaded' in g.frames[0].parentElement.dataset);
  assert.ok(!('loaded' in g.frames[1].parentElement.dataset));
});
