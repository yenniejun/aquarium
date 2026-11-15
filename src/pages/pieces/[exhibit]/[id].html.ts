import type { APIRoute, GetStaticPaths } from 'astro';
import { getExhibits, getPieces } from '../../../lib/exhibits';
import { sandboxHtml } from '../../../lib/sandbox';

export const getStaticPaths = (() =>
  getExhibits().flatMap((exhibit) =>
    getPieces(exhibit).map((piece) => ({
      params: { exhibit: exhibit.slug, id: piece.id },
      props: { html: piece.html, frameCap: piece.entry.frameCap },
    })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(sandboxHtml(props.html, { frameCap: props.frameCap }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
