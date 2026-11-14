/**
 * The terrarium's shared 60-second day. Every piece is told to compute the time of day the same
 * way from the clock (see exhibits/terrarium/prompt.md), so they stay in sync with each other and
 * with the sky on the page, without talking to it.
 */
export const DAY = 60;
export const SUNRISE = [8, 14] as const;
export const SUNSET = [46, 52] as const;

/** Seconds into the current day. */
export function timeOfDay(now = Date.now()): number {
  return (now / 1000) % DAY;
}

/** 0 at night, 1 in full daylight, easing through sunrise and sunset. */
export function daylight(t: number): number {
  if (t < SUNRISE[0] || t >= SUNSET[1]) return 0;
  if (t < SUNRISE[1]) return (t - SUNRISE[0]) / (SUNRISE[1] - SUNRISE[0]);
  if (t < SUNSET[0]) return 1;
  return 1 - (t - SUNSET[0]) / (SUNSET[1] - SUNSET[0]);
}

/** Where the sun is on its arc: 0 as it rises, 1 as it sets; outside 0..1 it's below the horizon. */
export function sunArc(t: number): number {
  return (t - SUNRISE[0]) / (SUNSET[1] - SUNRISE[0]);
}
