/**
 * Blind voting on the client. Works with any skin whose Room renders these hooks:
 *
 *   [data-exhibit]     root; data-state="voting" | "revealed", data-reveal-url
 *   [data-pieces]      the list (children get shuffled with CSS `order`, so iframes don't reload)
 *   [data-piece="id"]  one per piece; gets [data-picked] once the visitor votes
 *   [data-vote]        clicking it votes for its piece (clicks inside the piece's iframe count too)
 *   [data-artist], [data-medium]   filled in on reveal
 *   [data-vote-hint]   its text is swapped for its data-done text after voting
 *
 * v0 remembers the vote in this browser only. v2 swaps castVote() for POST /api/vote,
 * which returns the same reveal map plus tallies. Add ?reset to the URL to vote again.
 */
type Reveal = Record<string, { artist: string; provider: string; medium: string | null }>;

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

  // Shuffle per visit so position can't bias the vote.
  const order = pieces.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  pieces.forEach((piece, i) => (piece.style.order = String(order[i])));

  const castVote = (id: string) => {
    if (picked) return;
    picked = id;
    store(key, id);
    reveal(root, pieces, id);
  };

  for (const piece of pieces) {
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
      if (piece) castVote(piece.dataset.piece!);
    }),
  );
}

async function reveal(root: HTMLElement, pieces: HTMLElement[], picked: string) {
  pieces.find((p) => p.dataset.piece === picked)?.setAttribute('data-picked', '');
  try {
    const data: Reveal = await fetch(root.dataset.revealUrl!).then((r) => r.json());
    for (const piece of pieces) {
      const info = data[piece.dataset.piece!];
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
