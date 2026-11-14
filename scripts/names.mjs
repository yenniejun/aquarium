// The names experiment: how much do models repeat themselves? Sends a gallery's brief with the
// building part taken out, so each model only imagines its piece and sends back a name and a
// description, as many times as asked, and saves every answer.
//
// Usage: npm run names -- --exhibit planetarium [--runs 10] [--max-tokens 12000] [<entry> ...]
//   entries default to the gallery's lineup. Each model is asked the way its gallery piece was
//   (same thinking effort, same host), at its default temperature.
//
// Writes experiments/names/<exhibit>/prompt.md (exactly what was sent) and one file per answer,
// experiments/names/<exhibit>/<entry>/<n>.json: the name and description, tokens, cost and the
// whole reply. Answers already saved are skipped, so a run can be stopped and resumed, or topped
// up later with a higher --runs. An answer with no name goes to <n>.failed.json and is asked again
// next time.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ask, block, dropped, parseCard } from './lib/models.mjs';

const args = process.argv.slice(2);
/** Removes `--name value` from args and returns the value. */
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const exhibit = option('--exhibit');
const RUNS = Number(option('--runs') ?? 1);
// Only a name comes back, but thinking counts against this too, so leave room (the longest answer
// so far was about 6,000 tokens). OpenRouter holds back credit for the most a request could cost,
// so a much higher cap gets requests refused when the balance is low.
const MAX_TOKENS = Number(option('--max-tokens') ?? 12000);
// How many answers of one model to ask for at once (models themselves all run side by side). New
// OpenRouter accounts get only a few requests a minute per model, so those go one at a time.
const atOnce = (meta) => (meta.route === 'OpenRouter' ? 1 : 3);
if (!exhibit) {
  console.error('Usage: npm run names -- --exhibit planetarium [--runs 10] [--max-tokens 12000] [<entry> ...]');
  process.exit(1);
}

// $ per million tokens (input, output) for the models we call directly: list prices as shown on
// OpenRouter in November 2026. OpenRouter reports what its own calls cost.
const PRICES = {
  'claude-haiku-5-5': [0.1, 0.5],
  'claude-sonnet-5-5': [2, 10],
  'claude-opus-5-5': [4, 20],
  'gpt-6-luna': [0.1, 0.5],
  'gpt-6.1-sol': [2, 10],
  'gemini-4-hydrogen': [1.5, 7.5],
  'gemini-4-carbon': [2, 10],
};

const dir = join('exhibits', exhibit);
const { lineup, promptVersion } = JSON.parse(readFileSync(join(dir, 'exhibit.json'), 'utf8'));
const entries = args.length ? args : lineup;
const prompt = namesPrompt(readFileSync(join(dir, 'prompt.md'), 'utf8'));

const out = join('experiments', 'names', exhibit);
mkdirSync(out, { recursive: true });
const promptFile = join(out, 'prompt.md');
// One prompt per experiment folder, so answers stay comparable.
if (existsSync(promptFile) && readFileSync(promptFile, 'utf8') !== prompt) {
  console.error(`✗ ${exhibit}'s brief changed since ${promptFile} was written; move the old answers aside first`);
  process.exit(1);
}
writeFileSync(promptFile, prompt);

const results = await Promise.all(entries.map((slug) => askModel(slug)));
const answers = results.flat();
const failed = answers.filter((a) => !a.title).length;
const cost = answers.reduce((sum, a) => sum + (a.cost ?? 0), 0);
console.log(`\n${answers.length - failed} new answers${failed ? `, ${failed} without a name` : ''}, $${cost.toFixed(2)}`);

/** The gallery's brief, word for word, minus building it: no technical section, and only the
 * json block (name and description) to send back. */
function namesPrompt(brief) {
  const text = brief.replace(/<!--[\s\S]*?-->\s*/g, '').trim();
  const json = block(text, 'json');
  if (!/^## Technical requirements$/m.test(text) || !/^## What to send back$/m.test(text) || !json) {
    throw new Error(`${dir}/prompt.md needs "## Technical requirements", "## What to send back" and a json block`);
  }
  return (
    text
      .replace(/^## Technical requirements\n[\s\S]*?(?=^## )/m, '')
      .replace(
        /^## What to send back\n[\s\S]*$/m,
        "## What to send back\n\nThis time, don't build the piece: just imagine it, and send back only its name and description, " +
          "as a JSON code block. Don't mention who you are:\n\n```json\n" + json + '\n```',
      ) + '\n'
  );
}

async function askModel(slug) {
  const meta = JSON.parse(readFileSync(join(dir, 'entries', slug, 'meta.json'), 'utf8'));
  if (!meta.generation) {
    console.error(`✗ ${slug}: no gallery piece yet to copy its settings from`);
    return [];
  }
  const reasoning = meta.generation.params?.reasoning;
  console.log(`→ ${slug}: ${meta.modelId}, ${reasoning ? `${reasoning} thinking` : 'default thinking'}`);
  mkdirSync(join(out, slug), { recursive: true });
  const todo = [];
  for (let n = 1; n <= RUNS; n++) if (!existsSync(join(out, slug, `${n}.json`))) todo.push(n);
  const answers = [];
  const worker = async () => {
    for (let n; (n = todo.shift()) !== undefined; ) answers.push(await askOnce(slug, meta, reasoning, n));
  };
  await Promise.all(Array.from({ length: atOnce(meta) }, worker));
  return answers;
}

async function askOnce(slug, meta, reasoning, n) {
  const started = Date.now();
  let reply;
  for (let attempt = 1; ; attempt++) {
    try {
      reply = await ask(meta, { prompt, maxTokens: MAX_TOKENS, reasoning });
      break;
    } catch (err) {
      // A rate limit, or credit held back for requests still running, clears up after a wait.
      const busy = / 429: |in-flight requests/.test(err.message);
      if (!(dropped(err) || busy) || attempt >= 6) {
        console.error(`✗ ${slug} #${n}: ${err.message.slice(0, 200)}`);
        return {};
      }
      if (busy) await new Promise((r) => setTimeout(r, 20_000 * attempt));
    }
  }
  const { title, statement } = parseCard(block(reply.text, 'json'));
  const price = PRICES[meta.modelId];
  const cost = reply.cost ?? (price && (reply.usage.in * price[0] + reply.usage.out * price[1]) / 1e6);
  const answer = {
    exhibit,
    entry: slug,
    model: meta.artist,
    modelId: meta.modelId,
    run: n,
    date: new Date().toISOString(),
    promptVersion,
    params: { max_tokens: MAX_TOKENS, ...(reasoning && { reasoning }), ...(meta.host && { host: meta.host }) },
    title,
    statement,
    usage: reply.usage,
    cost,
    costFrom: reply.cost != null ? 'OpenRouter' : 'list price',
    ...(reply.servedBy && { servedBy: reply.servedBy }),
    stop: reply.stop,
    seconds: Math.round((Date.now() - started) / 1000),
    reply: reply.text,
  };
  writeFileSync(join(out, slug, `${n}${title ? '' : '.failed'}.json`), JSON.stringify(answer, null, 2) + '\n');
  console.log(
    `${title ? '✓' : '✗'} ${slug} #${n}: ${title ? `"${title}"` : 'no name in the reply'}, ` +
      `${reply.usage.out} out tokens, ${answer.seconds}s${cost != null ? `, $${cost.toFixed(4)}` : ''}`,
  );
  return answer;
}
