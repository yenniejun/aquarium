/** Keep the current page and at most one previous page. Never detach a retained iframe. */
export interface CachedGallery {
  suspend(limit: number): void;
  resume(): void;
  dispose(): void;
}

export class GalleryCache<T extends CachedGallery> {
  private pages = new Map<string, T>();
  current: T;
  key: string;

  constructor(key: string, page: T, readonly retainedPieces: number) {
    this.key = key;
    this.current = page;
    this.pages.set(key, page);
  }

  get(key: string) { return this.pages.get(key); }

  activate(key: string, page: T, beforeResume: () => void = () => {}) {
    if (page === this.current) { beforeResume(); return; }
    // Free the older page before initializing the next gallery's drawings.
    for (const [oldKey, oldPage] of this.pages) {
      if (oldPage !== this.current && oldPage !== page) {
        oldPage.dispose();
        this.pages.delete(oldKey);
      }
    }
    this.current.suspend(this.retainedPieces);
    this.pages.set(key, page);
    this.current = page;
    this.key = key;
    beforeResume();
    page.resume();
  }

  releasePrevious() {
    for (const [key, page] of this.pages) {
      if (page === this.current) continue;
      page.dispose();
      this.pages.delete(key);
    }
  }
}
