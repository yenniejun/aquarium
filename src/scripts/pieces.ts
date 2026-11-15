/**
 * Starts the pieces gradually. Each iframe arrives with data-src instead of src; a piece starts
 * only as it comes near the screen, and pieces start one at a time, a moment apart, nearest the
 * top first. A gallery is a dozen animations, and starting them all at once on arrival made a
 * fresh visit slow, with some pieces sitting blank while the rest fought for the processor.
 */
const waiting: HTMLIFrameElement[] = [];
let busy = false;

function start() {
  if (busy) return;
  const frame = waiting.shift();
  if (!frame) return;
  busy = true;
  const next = () => {
    if (!busy) return;
    busy = false;
    setTimeout(start, 60);
  };
  frame.addEventListener('load', next, { once: true });
  setTimeout(next, 1500); // never let one slow piece hold up the rest
  frame.src = frame.dataset.src!;
  delete frame.dataset.src;
}

/** Sort key: rows first, then left to right, as they sit on the screen (the shuffle is CSS order). */
const place = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.top * 10_000 + r.left;
};

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      waiting.push(entry.target as HTMLIFrameElement);
    }
    waiting.sort((a, b) => place(a) - place(b));
    start();
  },
  { rootMargin: '200px 0px' },
);

for (const frame of document.querySelectorAll<HTMLIFrameElement>('iframe[data-src]')) observer.observe(frame);

export {};
