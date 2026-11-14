/**
 * The terrarium's shared day: a 40-second loop of sun then moon. Every piece is told to compute
 * the time of day the same way from the clock (see exhibits/terrarium/prompt.md), so they stay in
 * sync with each other and with the sky on the page without talking to it.
 *
 *    0-20  day: the sun rises at 0, is highest at 10, sets at 20 (dawn 0-3, dusk 17-20)
 *   20-40  night: the moon rises at 20, is highest at 30, sets at 40, and the sun rises again
 */
export const DAY = 40;
export const HALF = DAY / 2;
const TWILIGHT = 3;

/** Seconds into the current day. */
export function timeOfDay(now = Date.now()): number {
  return (now / 1000) % DAY;
}

/** 0 at night, 1 in full daylight, easing through dawn and dusk. */
export function daylight(t: number): number {
  if (t >= HALF) return 0;
  if (t < TWILIGHT) return t / TWILIGHT;
  if (t > HALF - TWILIGHT) return (HALF - t) / TWILIGHT;
  return 1;
}

/** How far the sun is across the sky, 0 (rising) to 1 (setting); outside that it's down. */
export function sunArc(t: number): number {
  return t / HALF;
}

/** The same for the moon, which rises as the sun sets. */
export function moonArc(t: number): number {
  return (t - HALF) / HALF;
}
