const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an absolute site path with the configured `base`. */
export const href = (path: string) => base + path;
