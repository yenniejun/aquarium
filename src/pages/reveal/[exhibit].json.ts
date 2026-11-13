import type { APIRoute, GetStaticPaths } from 'astro';
import { getExhibits, getReveal } from '../../lib/exhibits';

// v0 stand-in for the voting API: the page only fetches this after a vote, so artist
// names aren't in the page source. v2 replaces it with POST /api/vote (same shape + tallies).
export const getStaticPaths = (() =>
  getExhibits().map((exhibit) => ({ params: { exhibit: exhibit.slug }, props: { exhibit } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => Response.json(getReveal(props.exhibit));
