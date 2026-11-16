/** Initialize controls inside one cached gallery, without touching other galleries. */
export function initAbout(page: HTMLElement) {
  const info = page.querySelector<HTMLDialogElement>('dialog.info-dialog')!;
  const tabs = [...info.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      page.querySelector<HTMLElement>(`#${CSS.escape(t.getAttribute('aria-controls')!)}`)!.hidden = !on;
    }
  };
  for (const [i, tab] of tabs.entries()) {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  }
  page.querySelector('.info-toggle')!.addEventListener('click', () => {
    select(tabs[0]);
    info.showModal();
    info.focus();
  });

  // Clicking the backdrop closes either modal.
  for (const dialog of page.querySelectorAll<HTMLDialogElement>('dialog.modal')) {
    dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
  }

  for (const button of page.querySelectorAll<HTMLButtonElement>('dialog [data-copy]')) {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy!);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => (button.textContent = 'Copy'), 1600);
    });
  }
}
