import { initAbout } from './about';
import { initViewer } from './viewer';
import { initVoting } from './voting';
import { initPieces } from './pieces';
import { daylight, moonArc, sunArc, timeOfDay } from '../skins/cabinet/day';

export interface Gallery {
  page: HTMLElement;
  scroll: { left: number; top: number };
  suspend(limit: number): void;
  resume(): void;
  dispose(): void;
}

/** Every DOM ID is page-local, including native popover targets and SVG paint references. */
export function namespaceIds(page: HTMLElement) {
  const suffix = `--${page.dataset.galleryPage}`;
  const ids = new Map<string, string>();
  for (const element of page.querySelectorAll<HTMLElement>('[id]')) {
    const id = element.id;
    ids.set(id, id + suffix);
    element.id += suffix;
  }
  for (const element of page.querySelectorAll('*')) {
    for (const attribute of [...element.attributes]) {
      let value = attribute.value;
      if (['aria-controls', 'aria-describedby', 'aria-labelledby', 'popovertarget', 'for'].includes(attribute.name)) {
        value = value.split(' ').map((id) => ids.get(id) ?? id).join(' ');
      }
      if (['href', 'xlink:href'].includes(attribute.name) && value.startsWith('#')) {
        value = `#${ids.get(value.slice(1)) ?? value.slice(1)}`;
      }
      value = value.replace(/url\(#([^)]*)\)/g, (_, id) => `url(#${ids.get(id) ?? id})`);
      if (value !== attribute.value) element.setAttribute(attribute.name, value);
    }
  }
}

export function initGallery(page: HTMLElement): Gallery {
  namespaceIds(page);
  const events = new AbortController();
  initAbout(page, events.signal);
  initViewer(page, events.signal);
  initVoting(page, events.signal);
  const pieces = initPieces(page);
  const room = page.querySelector<HTMLElement>('.room[data-variant="terrarium"]');
  let dayFrame = 0;
  const tick = () => {
    dayFrame = 0;
    if (!room || page.hidden || document.hidden) return;
    const t = timeOfDay();
    room.style.setProperty('--light', daylight(t).toFixed(3));
    room.style.setProperty('--sun', sunArc(t).toFixed(4));
    room.style.setProperty('--moon', moonArc(t).toFixed(4));
    dayFrame = requestAnimationFrame(tick);
  };
  const stopDay = () => { cancelAnimationFrame(dayFrame); dayFrame = 0; };
  document.addEventListener('visibilitychange', () => {
    stopDay();
    tick();
  }, { signal: events.signal });
  if (!page.hidden) tick();

  return {
    page,
    scroll: { left: 0, top: 0 },
    suspend(limit) {
      this.scroll = { left: window.scrollX, top: window.scrollY };
      for (const dialog of page.querySelectorAll<HTMLDialogElement>('dialog[open]')) dialog.close();
      for (const popover of page.querySelectorAll<HTMLElement>('[popover]')) {
        if (popover.hidePopover && popover.matches(':popover-open')) popover.hidePopover();
      }
      pieces.suspend(limit);
      stopDay();
      page.hidden = true;
      page.inert = true;
    },
    resume() {
      page.hidden = false;
      page.inert = false;
      window.scrollTo({ ...this.scroll, behavior: 'instant' });
      pieces.resume();
      stopDay();
      tick();
    },
    dispose() {
      stopDay();
      pieces.dispose();
      events.abort();
      page.remove();
    },
  };
}
