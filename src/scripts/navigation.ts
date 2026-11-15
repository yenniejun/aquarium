import { GalleryCache } from '../lib/gallery-cache';
import { initGallery, type Gallery } from './gallery';

/** Gallery links progressively enhance normal, independently addressable Astro pages. */
export function initNavigation() {
  const initial = document.querySelector<HTMLElement>('[data-gallery-page]');
  if (!initial) return;
  const gallery = initGallery(initial);
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const retention = (memory !== undefined && memory <= 4) || matchMedia('(pointer: coarse)').matches ? 1 : 3;
  const cache = new GalleryCache(location.pathname, gallery, retention);
  const paths = new Set([...initial.querySelectorAll<HTMLAnchorElement>('a[data-gallery-link]')].map((link) => new URL(link.href).pathname));
  let request: AbortController | null = null;
  let navigation = 0;
  const styleLoads = new Map<string, Promise<void>>();
  history.scrollRestoration = 'manual';

  const updateHead = (page: HTMLElement, url: URL) => {
    document.body.dataset.skin = page.dataset.skin;
    document.title = page.dataset.title!;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = page.dataset.description ?? '';
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = url.origin + url.pathname;
  };

  // Stylesheets are small and shared by pages. Do not execute fetched page scripts: controls
  // have explicit initializers and disposers, so returning doesn't accumulate global listeners.
  const loadStyles = async (doc: Document, url: URL) => {
    await Promise.all([...doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((source) => {
      const href = new URL(source.getAttribute('href')!, url).href;
      if (styleLoads.has(href)) return styleLoads.get(href);
      const existing = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].find((link) => link.href === href);
      if (existing) return;
      const loading = new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        const timeout = setTimeout(() => { link.remove(); styleLoads.delete(href); reject(new Error('Stylesheet timed out')); }, 8000);
        link.onload = () => { clearTimeout(timeout); resolve(); };
        link.onerror = () => { clearTimeout(timeout); link.remove(); styleLoads.delete(href); reject(new Error('Stylesheet failed')); };
        document.head.append(link);
      });
      styleLoads.set(href, loading);
      return loading;
    }));
  };

  const navigate = async (url: URL, push: boolean) => {
    const turn = ++navigation;
    request?.abort();
    request = new AbortController();
    const signal = request.signal;
    let fresh: Gallery | undefined;
    try {
      let target = cache.get(url.pathname);
      if (!target) {
        const response = await fetch(url.href, { signal });
        const destination = new URL(response.url);
        if (!response.ok || destination.origin !== url.origin || destination.pathname !== url.pathname) throw new Error('Gallery unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const page = doc.querySelector<HTMLElement>('[data-gallery-page]');
        if (!page) throw new Error('Not a gallery');
        await loadStyles(doc, url);
        if (turn !== navigation) return;
        // The older cached page is no longer useful once a third gallery has been chosen.
        cache.releasePrevious();
        page.querySelectorAll('script').forEach((script) => script.remove());
        page.hidden = true;
        page.inert = true;
        document.body.append(page);
        fresh = target = initGallery(page);
      }
      if (turn !== navigation) { fresh?.dispose(); return; }
      // Save the outgoing page's scroll and visible pieces before changing body skin; apply
      // the new skin before restoring the incoming page's layout and scroll position.
      cache.activate(url.pathname, target, () => updateHead(target.page, url));
      if (document.hidden) cache.releasePrevious();
      if (push && location.pathname !== url.pathname) history.pushState(null, '', url.href);
      target.page.querySelector<HTMLElement>('h1')?.setAttribute('tabindex', '-1');
      target.page.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    } catch (error) {
      fresh?.dispose();
      if (turn !== navigation || signal.aborted) return;
      // A failed fetch or unsupported feature still leaves normal navigation available.
      location.assign(url.href);
    }
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const reset = target?.closest<HTMLElement>('.reset-vote[data-key]');
    if (reset) {
      try { localStorage.removeItem(reset.dataset.key!); } catch {}
      location.reload();
      return;
    }
    const link = target?.closest<HTMLAnchorElement>('a[data-gallery-link]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !paths.has(url.pathname) || url.search || url.hash) return;
    const nav = link.closest<HTMLElement>('nav');
    if (nav?.hidePopover && nav.matches(':popover-open')) nav.hidePopover();
    event.preventDefault();
    void navigate(url, true);
  });

  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    if (!paths.has(url.pathname) || url.search || url.hash) { location.reload(); return; }
    void navigate(url, false);
  });
  // Drop the extra live artwork when the visitor leaves this tab.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cache.releasePrevious();
  });
}
