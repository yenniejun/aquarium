import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function compile(file) {
  return ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}
const cacheExports = {};
vm.runInNewContext(compile('../src/lib/gallery-cache.ts'), { exports: cacheExports });
const { GalleryCache } = cacheExports;
const navigationSource = compile('../src/scripts/navigation.ts');

class Events {
  listeners = new Map();
  addEventListener(type, cb) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(cb);
  }
  emit(type, event = {}) { for (const cb of this.listeners.get(type) ?? []) cb(event); }
}

function stubGallery(name, log) {
  return {
    suspend(limit) { log.push(`${name}:pause:${limit}`); },
    resume() { log.push(`${name}:resume`); },
    dispose() { log.push(`${name}:dispose`); },
  };
}

test('only the current and previous galleries survive; eviction precedes new drawing', () => {
  const log = [], a = stubGallery('a', log), b = stubGallery('b', log), c = stubGallery('c', log);
  const cache = new GalleryCache('/a/', a, 3);
  cache.activate('/b/', b);
  cache.activate('/a/', a);
  cache.activate('/c/', c, () => log.push('c:skin'));
  assert.deepEqual(log, ['a:pause:3', 'b:resume', 'b:pause:3', 'a:resume', 'b:dispose', 'a:pause:3', 'c:skin', 'c:resume']);
  assert.equal(cache.get('/b/'), undefined);
  assert.equal(cache.get('/a/'), a);
  assert.equal(cache.current, c);
  cache.releasePrevious();
  assert.equal(cache.get('/a/'), undefined);
  assert.equal(cache.current, c);
});

test('a long visit never accumulates older gallery controllers', () => {
  const log = [], first = stubGallery('0', log);
  const cache = new GalleryCache('/0/', first, 1);
  for (let i = 1; i <= 100; i++) cache.activate(`/${i}/`, stubGallery(String(i), log));
  assert.equal(log.filter((item) => item.endsWith(':dispose')).length, 99);
  assert.equal(cache.get('/0/'), undefined);
  assert.ok(cache.get('/99/'));
  assert.ok(cache.get('/100/'));
  assert.ok(log.filter((item) => item.includes(':pause:')).every((item) => item.endsWith(':1')));
});

function navigation({ memory, coarse = false, fetcher } = {}) {
  const document = new Events(), window = new Events(), log = [], requests = [], pushed = [], assigned = [];
  const location = new URL('https://example.test/a/');
  location.assign = (url) => assigned.push(url);
  location.reload = () => assigned.push('reload');
  const history = { pushState(_state, _title, url) { pushed.push(url); location.href = url; } };
  class Element {}
  class Link extends Element {
    constructor(path) { super(); this.href = new URL(path, location).href; this.target = ''; }
    hasAttribute() { return false; }
    closest(selector) { return selector === 'a[data-gallery-link]' ? this : null; }
  }
  const heading = { setAttribute() {}, focus() {} };
  const pages = new Map();
  const metadata = { content: '', href: '' };
  for (const name of ['a', 'b', 'c']) {
    pages.set(name, {
      dataset: { galleryPage: name, skin: name, title: name.toUpperCase(), description: `${name} description` },
      hidden: false,
      querySelectorAll(selector) {
        if (selector === 'a[data-gallery-link]') return ['a', 'b', 'c'].map((slug) => new Link(`/${slug}/`));
        return [];
      },
      querySelector: () => heading,
      remove() { log.push(`${name}:remove`); },
    });
  }
  const initial = pages.get('a');
  document.querySelector = (selector) => selector === '[data-gallery-page]' ? initial : metadata;
  document.querySelectorAll = () => [];
  document.body = { dataset: {}, append(page) { log.push(`${page.dataset.galleryPage}:append`); } };
  document.hidden = false;
  const exports = {};
  vm.runInNewContext(navigationSource, {
    exports, URL, AbortController, Element, document, window, location, history,
    setTimeout, clearTimeout, navigator: { deviceMemory: memory }, matchMedia: () => ({ matches: coarse }),
    require: (name) => name.includes('gallery-cache') ? { GalleryCache } : {
      initGallery(page) {
        const name = page.dataset.galleryPage;
        log.push(`${name}:init`);
        return {
          ...stubGallery(name, log), page,
          resume() { page.hidden = false; log.push(`${name}:resume`); },
          suspend(limit) { page.hidden = true; log.push(`${name}:pause:${limit}`); },
          dispose() { page.remove(); log.push(`${name}:dispose`); },
        };
      },
    },
    fetch: async (url, options) => {
      requests.push(url);
      if (fetcher) await fetcher(url, options.signal);
      return { ok: true, url, text: async () => new URL(url).pathname.split('/')[1] };
    },
    DOMParser: class {
      parseFromString(name) {
        return { querySelector: () => pages.get(name), querySelectorAll: () => [] };
      }
    },
  });
  exports.initNavigation();
  return {
    log, requests, pushed, assigned, document, window, location, pages,
    click(path, modifiers = {}) {
      const event = { button: 0, defaultPrevented: false, target: new Link(path), preventDefault() { this.defaultPrevented = true; }, ...modifiers };
      document.emit('click', event);
      return event;
    },
    back(path) { location.href = new URL(path, location).href; window.emit('popstate'); },
  };
}
const flush = () => new Promise(setImmediate);

test('A → B → A resumes A without fetching or initializing it again', async () => {
  const n = navigation();
  n.click('/b/'); await flush();
  n.click('/a/'); await flush();
  assert.equal(n.requests.length, 1);
  assert.equal(n.log.filter((item) => item === 'a:init').length, 1);
  assert.equal(n.document.title, 'A');
  assert.equal(n.document.body.dataset.skin, 'a');
  assert.equal(n.location.pathname, '/a/');
  assert.ok(n.log.includes('b:pause:3'));
  assert.equal(n.pages.get('a').hidden, false);
  assert.equal(n.pages.get('b').hidden, true);
});

test('back/forward restores cached pages without adding history entries', async () => {
  const n = navigation();
  n.click('/b/'); await flush();
  n.back('/a/'); await flush();
  assert.equal(n.requests.length, 1);
  assert.equal(n.pushed.length, 1);
  assert.equal(n.document.title, 'A');
  n.back('/b/'); await flush();
  assert.equal(n.requests.length, 1);
  assert.equal(n.pushed.length, 1);
  assert.equal(n.document.title, 'B');
});

test('visiting C evicts A, and hiding the tab releases the extra cached page', async () => {
  const n = navigation({ coarse: true });
  n.click('/b/'); await flush();
  n.click('/c/'); await flush();
  assert.ok(n.log.includes('a:dispose'));
  assert.ok(n.log.includes('b:pause:1'));
  assert.ok(n.log.indexOf('a:dispose') < n.log.indexOf('c:resume'));
  n.document.hidden = true;
  n.document.emit('visibilitychange');
  assert.ok(n.log.includes('b:dispose'));
  assert.ok(!n.log.includes('c:dispose'));
});

test('low-memory devices use the smaller retention budget', async () => {
  const n = navigation({ memory: 4 });
  n.click('/b/'); await flush();
  assert.ok(n.log.includes('a:pause:1'));
});

test('modified clicks, query strings, and unrelated links retain normal browser navigation', async () => {
  const n = navigation();
  for (const [url, modifiers] of [['/b/', { metaKey: true }], ['/b/', { ctrlKey: true }], ['/b/?reset', {}], ['/b/#part', {}], ['/missing/', {}], ['https://other.test/b/', {}]]) {
    assert.equal(n.click(url, modifiers).defaultPrevented, false);
  }
  await flush();
  assert.equal(n.requests.length, 0);
});

test('a failed request falls back to the ordinary gallery URL', async () => {
  const n = navigation({ fetcher: async () => { throw new Error('offline'); } });
  n.click('/b/'); await flush();
  assert.deepEqual(n.assigned, ['https://example.test/b/']);
  assert.equal(n.pages.get('a').hidden, false);
});

test('rapid clicks ignore an older fetch even if it completes last', async () => {
  const resolve = new Map();
  const n = navigation({ fetcher: (url) => new Promise((done) => resolve.set(new URL(url).pathname, done)) });
  n.click('/b/'); n.click('/c/');
  resolve.get('/c/')(); await flush();
  resolve.get('/b/')(); await flush();
  assert.equal(n.document.title, 'C');
  assert.deepEqual(n.pushed, ['https://example.test/c/']);
  assert.ok(!n.log.includes('b:init'));
  assert.equal(n.assigned.length, 0);
});

test('back during a pending navigation cancels it without a stale fallback', async () => {
  let complete;
  const n = navigation({ fetcher: () => new Promise((resolve) => { complete = resolve; }) });
  n.click('/b/');
  n.back('/a/');
  complete(); await flush();
  assert.equal(n.document.title, 'A');
  assert.equal(n.pushed.length, 0);
  assert.equal(n.assigned.length, 0);
  assert.ok(!n.log.includes('b:init'));
});

function galleryModule(context = {}) {
  const exports = {};
  vm.runInNewContext(compile('../src/scripts/gallery.ts'), { exports, require: () => ({}), ...context });
  return exports;
}

test('cached pages namespace native popover, dialog, accessibility and SVG references', () => {
  function element(values) {
    const attrs = new Map(Object.entries(values));
    return {
      get id() { return attrs.get('id') ?? ''; },
      set id(value) { attrs.set('id', value); },
      get attributes() { return [...attrs].map(([name, value]) => ({ name, value })); },
      setAttribute(name, value) { attrs.set(name, value); },
      getAttribute(name) { return attrs.get(name); },
    };
  }
  const nav = element({ id: 'site-nav' });
  const panel = element({ id: 'info-panel-models' });
  const hint = element({ id: 'about-hint' });
  const paint = element({ id: 'gilt' });
  const button = element({ popovertarget: 'site-nav', 'aria-controls': 'info-panel-models', 'aria-describedby': 'about-hint unrelated' });
  const svg = element({ fill: 'url(#gilt)', href: '#gilt' });
  const all = [nav, panel, hint, paint, button, svg];
  const page = { dataset: { galleryPage: 'a' }, querySelectorAll: (selector) => selector === '[id]' ? all.filter((el) => el.id) : all };
  galleryModule().namespaceIds(page);
  assert.equal(button.getAttribute('popovertarget'), 'site-nav--a');
  assert.equal(button.getAttribute('aria-controls'), 'info-panel-models--a');
  assert.equal(button.getAttribute('aria-describedby'), 'about-hint--a unrelated');
  assert.equal(svg.getAttribute('fill'), 'url(#gilt--a)');
  assert.equal(svg.getAttribute('href'), '#gilt--a');
});

test('gallery lifecycle preserves scroll and aborts page listeners on eviction', () => {
  const log = [], document = new Events();
  const page = {
    dataset: { galleryPage: 'a' }, hidden: false, inert: false,
    querySelectorAll: () => [], querySelector: () => null,
    remove() { log.push('remove'); },
  };
  let signal;
  const window = { scrollX: 0, scrollY: 420, scrollTo(position) { log.push(['scroll', position.top]); } };
  const { initGallery } = galleryModule({
    window, document, AbortController, requestAnimationFrame() {}, cancelAnimationFrame() {},
    require(name) {
      if (name === './pieces') return { initPieces: () => ({ suspend(limit) { log.push(['keep', limit]); }, resume() { log.push('resume'); }, dispose() { log.push('dispose'); } }) };
      return new Proxy({}, { get: () => (root, controllerSignal) => { assert.equal(root, page); signal = controllerSignal; } });
    },
  });
  const gallery = initGallery(page);
  gallery.suspend(3);
  assert.equal(page.hidden, true);
  assert.equal(page.inert, true);
  window.scrollY = 0;
  gallery.resume();
  assert.equal(page.hidden, false);
  assert.equal(page.inert, false);
  assert.deepEqual(log, [['keep', 3], ['scroll', 420], 'resume']);
  gallery.dispose();
  assert.ok(signal.aborted);
  assert.deepEqual(log.slice(-2), ['dispose', 'remove']);
});
