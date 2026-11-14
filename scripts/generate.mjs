// Sends an exhibit's prompt.md to the models behind the given entries and saves what comes back.
//
// Usage: npm run generate -- [--exhibit aquarium] [--max-tokens 64000] [--reasoning low] [--attempts 3] <entry> ...
//   --reasoning (OpenRouter and Anthropic): low, medium or high thinking effort instead of the model's default
//   --attempts: ask again (up to this many times) when a reply is missing its page or its name,
//               or the connection drops partway;
//               the first complete reply is kept, and how many tries it took is recorded
//   e.g. npm run generate -- claude-haiku claude-sonnet
//
// Each entry's meta.json says who to ask; see lib/models.mjs for the APIs and keys.
//
// For each entry this writes:
//   raw.md      the model's full reply, untouched (a reply with no HTML in it goes to
//               raw.failed.md instead, which git ignores, and the entry is left as it was)
//   piece.html  the html code block from the reply
//   meta.json   who the model is (kept), plus whatever the reply's json block has (title,
//               statement, …), status "final" and a "generation" record (date, API, params).
//               Fields from an earlier run are replaced, not merged.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ask, block, dropped, parseCard, providerFor } from './lib/models.mjs';

const args = process.argv.slice(2);
/** Removes `--name value` from args and returns the value. */
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const exhibit = option('--exhibit') ?? 'aquarium';
// Generous, since reasoning models spend part of this on thinking before they write the page.
const MAX_TOKENS = Number(option('--max-tokens') ?? 32000);
const REASONING = option('--reasoning');
const ATTEMPTS = Number(option('--attempts') ?? 1);
if (!args.length) {
  console.error('Usage: npm run generate -- [--exhibit aquarium] [--max-tokens 64000] [--reasoning low] <entry> ...');
  process.exit(1);
}

const dir = join('exhibits', exhibit);
// Same as getPrompt() in src/lib/exhibits.ts: HTML comments are notes for us, not the model.
const prompt = readFileSync(join(dir, 'prompt.md'), 'utf8').replace(/<!--[\s\S]*?-->\s*/g, '').trim();
const { promptVersion } = JSON.parse(readFileSync(join(dir, 'exhibit.json'), 'utf8'));

let failed = 0;
for (const slug of args) {
  try {
    await generate(slug);
  } catch (err) {
    failed++;
    console.error(`✗ ${slug}: ${err.message}${err.cause ? ` (${err.cause.code ?? err.cause.message})` : ''}`);
  }
}
process.exit(failed ? 1 : 0);

async function generate(slug) {
  const entryDir = join(dir, 'entries', slug);
  const metaFile = join(entryDir, 'meta.json');
  if (!existsSync(metaFile)) throw new Error(`${metaFile} doesn't exist`);
  const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  const provider = providerFor(meta);

  // A reply counts once it has both a page and a name for the creature.
  let reply, html, card, seconds, attempt;
  for (attempt = 1; ; attempt++) {
    console.log(`→ ${slug}: asking ${meta.modelId}${ATTEMPTS > 1 ? ` (attempt ${attempt} of ${ATTEMPTS})` : ''}…`);
    const started = Date.now();
    try {
      reply = await ask(meta, { prompt, maxTokens: MAX_TOKENS, reasoning: REASONING });
    } catch (err) {
      if (!dropped(err) || attempt >= ATTEMPTS) throw err;
      console.log(`  ↻ ${slug}: the connection dropped (${err.cause?.code ?? err.message}); asking again`);
      continue;
    }
    seconds = Math.round((Date.now() - started) / 1000);
    html = page(reply.text);
    card = parseCard(block(reply.text, 'json'));
    if (html && card.title) break;

    writeFileSync(join(entryDir, 'raw.failed.md'), reply.text);
    const missing = html ? 'no name for its creature' : 'no html page';
    const spent = `${reply.usage.out} tokens${reply.cost != null ? `, $${reply.cost.toFixed(4)}` : ''}`;
    if (attempt >= ATTEMPTS) {
      throw new Error(`${missing} in the reply (stop reason: ${reply.stop}, ${spent}); see ${entryDir}/raw.failed.md`);
    }
    console.log(`  ↻ ${slug}: ${missing} in the reply (${spent}); asking again`);
  }
  const { text, usage, stop, servedBy, cost } = reply;
  writeFileSync(join(entryDir, 'raw.md'), text);
  writeFileSync(join(entryDir, 'piece.html'), html.trim() + '\n');

  const { title, medium, statement } = card;
  const updated = {
    artist: meta.artist,
    provider: meta.provider,
    modelId: meta.modelId,
    ...(meta.route && { route: meta.route }),
    ...(meta.host && { host: meta.host }),
    openWeights: meta.openWeights,
    status: 'final',
    ...(title && { title }),
    ...(medium && { medium }),
    ...(statement && { statement }),
    generation: {
      date: new Date().toISOString().slice(0, 10),
      via: servedBy ? `${provider.via} (served by ${servedBy})` : provider.via,
      params: {
        max_tokens: MAX_TOKENS,
        promptVersion,
        ...(meta.host && { host: meta.host }),
        ...(REASONING && { reasoning: REASONING }),
      },
      attempts: attempt,
      edits: 'none',
    },
  };
  writeFileSync(metaFile, JSON.stringify(updated, null, 2) + '\n');

  console.log(
    `✓ ${slug}: "${updated.title}"${attempt > 1 ? ` (attempt ${attempt})` : ''}, ` +
      `${(html.length / 1024).toFixed(1)} KB of HTML, ${usage.in} in / ${usage.out} out tokens, ${seconds}s` +
      (servedBy ? `, served by ${servedBy}` : '') +
      (cost != null ? `, $${cost.toFixed(4)}` : '') +
      (stop && !['end_turn', 'stop', 'STOP'].includes(stop) ? `, stopped: ${stop}` : ''),
  );
}

/** The page in a reply: its ```html block or, if the model skipped the fence, a bare <html> document. */
function page(text) {
  return block(text, 'html') ?? text.match(/(?:<!doctype html[^>]*>\s*)?<html[\s\S]*<\/html>/i)?.[0];
}
