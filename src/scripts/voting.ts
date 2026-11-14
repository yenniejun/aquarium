/**
 * Blind voting on the client. Works with any skin whose Room renders these hooks:
 *
 *   [data-exhibit]     root; data-state="voting" | "revealed", data-reveal-url
 *   [data-pieces]      the list (children get shuffled with CSS `order`, so iframes don't reload)
 *   [data-piece="id"]  one per piece; gets [data-picked] once the visitor votes
 *   [data-pending]     an empty slot (no piece yet): not shuffled or votable, stays at the end
 *   [data-vote]        clicking it votes for its piece (clicks inside the piece's iframe count too)
 *   [data-artist], [data-medium]   filled in on reveal
 *   [data-vote-hint]   its text is swapped for its data-done text after voting
 *
 * The vote is remembered in this browser only; each real pick is also counted (anonymously) in the
 * site's analytics, if it has any. Add ?reset to the URL to vote again.
 */
import { track } from './analytics';

type Reveal = Record<string, { title: string; artist: string; provider: string; medium: string | null }>;

const root = document.querySelector<HTMLElement>('[data-exhibit]');
if (root?.dataset.state === 'voting') init(root);

function init(root: HTMLElement) {
  const key = `museum:vote:${root.dataset.exhibit}`;
  const pieces = [...root.querySelectorAll<HTMLElement>('[data-piece]')];
  const ids = new Set(pieces.map((p) => p.dataset.piece));

  if (new URLSearchParams(location.search).has('reset')) store(key, null);
  let picked = store(key);
  if (picked && !ids.has(picked)) picked = null;

  if (picked) {
    reveal(root, pieces, picked);
    return;
  }

  // Shuffle per visit so position can't bias the vote. Empty slots stay at the end.
  const ready = pieces.filter((p) => !p.hasAttribute('data-pending'));
  const order = ready.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  ready.forEach((piece, i) => (piece.style.order = String(order[i])));
  for (const piece of pieces) if (!ready.includes(piece)) piece.style.order = String(ready.length);

  const castVote = async (id: string) => {
    if (picked) return;
    picked = id;
    store(key, id);
    const data = await reveal(root, pieces, id);
    const info = data?.[id];
    // The maker is in the event's name so Umami's Events list reads as a leaderboard.
    const maker = info?.artist ?? 'unknown';
    track(`pick · ${maker}`, { exhibit: root.dataset.exhibit!, tank: info?.title ?? id, maker });
  };

  for (const piece of ready) {
    for (const el of piece.querySelectorAll('[data-vote]')) {
      el.addEventListener('click', () => castVote(piece.dataset.piece!));
    }
  }

  // A click inside a sandboxed iframe never reaches this page, but it does move focus into
  // the iframe. (Iframes are tabindex="-1", so keyboard focus can't trigger this.)
  addEventListener('blur', () =>
    setTimeout(() => {
      const el = document.activeElement;
      const piece = el instanceof HTMLIFrameElement ? el.closest<HTMLElement>('[data-piece]') : null;
      if (piece && ready.includes(piece)) castVote(piece.dataset.piece!);
    }),
  );
}

async function reveal(root: HTMLElement, pieces: HTMLElement[], picked: string): Promise<Reveal | null> {
  pieces.find((p) => p.dataset.piece === picked)?.setAttribute('data-picked', '');
  let data: Reveal | null = null;
  try {
    data = await fetch(root.dataset.revealUrl!).then((r) => r.json());
    for (const piece of pieces) {
      const info = data![piece.dataset.piece!];
      if (!info) continue;
      piece.querySelectorAll('[data-artist]').forEach((el) => (el.textContent = info.artist));
      piece.querySelectorAll<HTMLElement>('[data-medium]').forEach((el) => {
        el.textContent = el.title = info.medium ?? '';
      });
    }
  } catch (err) {
    console.error('Could not load who made what', err);
  }
  root.dataset.state = 'revealed';
  const hint = document.querySelector<HTMLElement>('[data-vote-hint]');
  if (hint?.dataset.done) hint.textContent = hint.dataset.done;
  return data;
}

function store(key: string, value?: string | null): string | null {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.): the vote just won't persist across reloads.
  }
  return null;
}
