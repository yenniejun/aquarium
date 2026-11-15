/** Initialize controls inside one cached gallery, without touching other galleries. */
export function initViewer(page: HTMLElement, signal: AbortSignal) {
  const dialog = page.querySelector<HTMLDialogElement>('dialog.viewer');
  if (!dialog) return;
  const iframe = dialog.querySelector('iframe')!;
  const name = dialog.querySelector<HTMLElement>('.name')!;
  const who = dialog.querySelector<HTMLElement>('.who')!;
  const label = dialog.querySelector<HTMLElement>('.label')!;

  for (const link of page.querySelectorAll<HTMLAnchorElement>('[data-expand]')) {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // still lets people open it in a new tab
      e.preventDefault();
      const piece = link.closest('[data-piece]');
      const revealed = link.closest<HTMLElement>('[data-exhibit]')?.dataset.state === 'revealed';
      const artist = piece?.querySelector('[data-artist]')?.textContent;
      name.textContent = iframe.title = link.dataset.expand!;
      who.textContent = revealed && artist ? artist : '';
      label.textContent = link.dataset.statement ?? '';
      delete iframe.parentElement!.dataset.loaded;
      iframe.src = link.href;
      dialog.showModal();
    }, { signal });
  }

  // Click outside the tank to close. Unload the tank so it stops animating.
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close(), { signal });
  dialog.addEventListener('close', () => iframe.removeAttribute('src'), { signal });
}
