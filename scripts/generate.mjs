// Sends an exhibit's prompt.md to the models behind the given entries and saves what comes back.
//
// Usage: npm run generate -- [--exhibit aquarium] <entry> [<entry> ...]
//   e.g. npm run generate -- claude-haiku claude-sonnet
//
// Each entry's meta.json says who to ask: "provider" (Anthropic or OpenAI) and "modelId".
// API keys come from .env (ANTHROPIC_API_KEY, OPENAI_API_KEY), which git ignores.
//
// For each entry this writes:
//   raw.md      the model's full reply, untouched
//   piece.html  the html code block from the reply
//   meta.json   title, medium and statement from the reply's json block, status "final",
//               and a "generation" record (date, API, params)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MAX_TOKENS = 16000;

const args = process.argv.slice(2);
let exhibit = 'aquarium';
const flag = args.indexOf('--exhibit');
if (flag !== -1) [, exhibit] = args.splice(flag, 2);
if (!args.length) {
  console.error('Usage: npm run generate -- [--exhibit aquarium] <entry> [<entry> ...]');
  process.exit(1);
}

const dir = join('exhibits', exhibit);
// Same as getPrompt() in src/lib/exhibits.ts: HTML comments are notes for us, not the model.
const prompt = readFileSync(join(dir, 'prompt.md'), 'utf8').replace(/<!--[\s\S]*?-->\s*/g, '').trim();
const { promptVersion } = JSON.parse(readFileSync(join(dir, 'exhibit.json'), 'utf8'));

const providers = {
  Anthropic: { key: 'ANTHROPIC_API_KEY', via: 'Anthropic Messages API', ask: askAnthropic },
  OpenAI: { key: 'OPENAI_API_KEY', via: 'OpenAI Chat Completions API', ask: askOpenAI },
};

let failed = 0;
for (const slug of args) {
  try {
    await generate(slug);
  } catch (err) {
    failed++;
    console.error(`✗ ${slug}: ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);

async function generate(slug) {
  const entryDir = join(dir, 'entries', slug);
  const metaFile = join(entryDir, 'meta.json');
  if (!existsSync(metaFile)) throw new Error(`${metaFile} doesn't exist`);
  const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  const provider = providers[meta.provider];
  if (!provider) throw new Error(`no API set up for provider "${meta.provider}" (have: ${Object.keys(providers).join(', ')})`);
  if (!meta.modelId) throw new Error(`${metaFile} needs a "modelId"`);
  const apiKey = process.env[provider.key];
  if (!apiKey) throw new Error(`${provider.key} isn't set (add it to .env)`);

  console.log(`→ ${slug}: asking ${meta.modelId}…`);
  const started = Date.now();
  const { text, usage, stop } = await provider.ask(meta.modelId, apiKey);
  const seconds = Math.round((Date.now() - started) / 1000);

  writeFileSync(join(entryDir, 'raw.md'), text);
  const html = block(text, 'html');
  const json = block(text, 'json');
  if (!html) throw new Error(`no html code block in the reply (stop reason: ${stop}); see ${entryDir}/raw.md`);
  writeFileSync(join(entryDir, 'piece.html'), html.trim() + '\n');

  let card = {};
  try {
    card = json ? JSON.parse(json) : {};
  } catch {
    console.warn(`  ! couldn't parse the json block; title/medium/statement left as they were`);
  }
  const { title, medium, statement } = card;
  const updated = {
    ...meta,
    status: 'final',
    ...(title && { title }),
    ...(medium && { medium }),
    ...(statement && { statement }),
    generation: {
      date: new Date().toISOString().slice(0, 10),
      via: provider.via,
      params: { max_tokens: MAX_TOKENS, promptVersion },
      attempts: 1,
      edits: 'none',
    },
  };
  writeFileSync(metaFile, JSON.stringify(updated, null, 2) + '\n');

  console.log(
    `✓ ${slug}: "${updated.title ?? 'untitled'}" (${updated.medium ?? 'medium not given'}), ` +
      `${(html.length / 1024).toFixed(1)} KB of HTML, ${usage.in} in / ${usage.out} out tokens, ${seconds}s` +
      (stop && !['end_turn', 'stop'].includes(stop) ? `, stopped: ${stop}` : ''),
  );
}

/** The first ```lang fenced block in a reply. */
function block(text, lang) {
  return text.match(new RegExp('```' + lang + '\\s*\\n([\\s\\S]*?)\\n```'))?.[1];
}

/** Streams so long replies don't hit the HTTP client's timeout. */
async function askAnthropic(model, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: MAX_TOKENS, stream: true, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  let text = '';
  const usage = { in: 0, out: 0 };
  let stop;
  for await (const event of sse(res)) {
    if (event.type === 'message_start') usage.in = event.message.usage?.input_tokens ?? 0;
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') text += event.delta.text;
    if (event.type === 'message_delta') {
      stop = event.delta.stop_reason;
      usage.out = event.usage?.output_tokens ?? usage.out;
    }
    if (event.type === 'error') throw new Error(`Anthropic API: ${event.error.message}`);
  }
  return { text, usage, stop };
}

async function askOpenAI(model, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_completion_tokens: MAX_TOKENS,
      stream: true,
      stream_options: { include_usage: true },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
  let text = '';
  const usage = { in: 0, out: 0 };
  let stop;
  for await (const event of sse(res)) {
    const choice = event.choices?.[0];
    if (choice?.delta?.content) text += choice.delta.content;
    if (choice?.finish_reason) stop = choice.finish_reason;
    if (event.usage) [usage.in, usage.out] = [event.usage.prompt_tokens, event.usage.completion_tokens];
  }
  return { text, usage, stop };
}

/** Parsed JSON from each `data:` line of a server-sent event stream. */
async function* sse(res) {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data && data !== '[DONE]') yield JSON.parse(data);
    }
  }
}
