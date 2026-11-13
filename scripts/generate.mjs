// Sends an exhibit's prompt.md to the models behind the given entries and saves what comes back.
//
// Usage: npm run generate -- [--exhibit aquarium] [--max-tokens 64000] [--reasoning low] [--attempts 3] <entry> ...
//   --reasoning (OpenRouter and Anthropic): low, medium or high thinking effort instead of the model's default
//   --attempts: ask again (up to this many times) when a reply is missing its page or its name;
//               the first complete reply is kept, and how many tries it took is recorded
//   e.g. npm run generate -- claude-haiku claude-sonnet
//
// Each entry's meta.json says who to ask: "provider" (Anthropic, OpenAI or Google) and "modelId".
// Models from other makers go through OpenRouter: "route": "OpenRouter", plus "host" to pin the
// request to one host (usually the maker's own servers) with no fallbacks.
// API keys come from .env (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY),
// which git ignores.
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

const providers = {
  Anthropic: { key: 'ANTHROPIC_API_KEY', via: 'Anthropic Messages API', ask: askAnthropic },
  OpenAI: { key: 'OPENAI_API_KEY', via: 'OpenAI Chat Completions API', ask: askOpenAI },
  Google: { key: 'GEMINI_API_KEY', via: 'Gemini API', ask: askGemini },
  OpenRouter: { key: 'OPENROUTER_API_KEY', via: 'OpenRouter', ask: askOpenRouter },
};

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
  const route = meta.route ?? meta.provider;
  const provider = providers[route];
  if (!provider) throw new Error(`no API set up for "${route}" (have: ${Object.keys(providers).join(', ')})`);
  if (!meta.modelId) throw new Error(`${metaFile} needs a "modelId"`);
  const apiKey = process.env[provider.key];
  if (!apiKey) throw new Error(`${provider.key} isn't set (add it to .env)`);

  // A reply counts once it has both a page and a name for the creature.
  let reply, html, card, seconds, attempt;
  for (attempt = 1; ; attempt++) {
    console.log(`→ ${slug}: asking ${meta.modelId}${ATTEMPTS > 1 ? ` (attempt ${attempt} of ${ATTEMPTS})` : ''}…`);
    const started = Date.now();
    reply = await provider.ask(meta.modelId, apiKey, meta);
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

/** The reply's json block as an object, or {} if it's missing or isn't valid JSON. */
function parseCard(json) {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

/** The page in a reply: its ```html block or, if the model skipped the fence, a bare <html> document. */
function page(text) {
  return block(text, 'html') ?? text.match(/(?:<!doctype html[^>]*>\s*)?<html[\s\S]*<\/html>/i)?.[0];
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
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      stream: true,
      ...(REASONING && { output_config: { effort: REASONING } }),
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  let text = '';
  const usage = { in: 0, out: 0 };
  let stop;
  const progress = every30s(() => `${model}: ${text.length.toLocaleString()} chars of reply so far`);
  try {
    for await (const event of sse(res)) {
      if (event.type === 'message_start') usage.in = event.message.usage?.input_tokens ?? 0;
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') text += event.delta.text;
      if (event.type === 'message_delta') {
        stop = event.delta.stop_reason;
        usage.out = event.usage?.output_tokens ?? usage.out;
      }
      if (event.type === 'error') throw new Error(`Anthropic API: ${event.error.message}`);
    }
  } finally {
    clearInterval(progress);
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
  const progress = every30s(() => `${model}: ${text.length.toLocaleString()} chars of reply so far`);
  try {
    for await (const event of sse(res)) {
      const choice = event.choices?.[0];
      if (choice?.delta?.content) text += choice.delta.content;
      if (choice?.finish_reason) stop = choice.finish_reason;
      if (event.usage) [usage.in, usage.out] = [event.usage.prompt_tokens, event.usage.completion_tokens];
    }
  } finally {
    clearInterval(progress);
  }
  return { text, usage, stop };
}

async function askGemini(model, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: MAX_TOKENS },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  let text = '';
  const usage = { in: 0, out: 0 };
  let stop;
  const progress = every30s(() => `${model}: ${text.length.toLocaleString()} chars of reply so far`);
  try {
    for await (const event of sse(res)) {
      const candidate = event.candidates?.[0];
      for (const part of candidate?.content?.parts ?? []) if (part.text && !part.thought) text += part.text;
      if (candidate?.finishReason) stop = candidate.finishReason;
      if (event.usageMetadata) [usage.in, usage.out] = [event.usageMetadata.promptTokenCount, event.usageMetadata.candidatesTokenCount];
    }
  } finally {
    clearInterval(progress);
  }
  return { text, usage, stop };
}

/** OpenAI-style API in front of many hosts. Reports which host answered and what it cost. */
async function askOpenRouter(model, apiKey, meta) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      stream: true,
      usage: { include: true },
      ...(REASONING && { reasoning: { effort: REASONING } }),
      ...(meta.host && { provider: { only: [meta.host], allow_fallbacks: false } }),
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  let text = '';
  const usage = { in: 0, out: 0 };
  let stop, servedBy, cost;
  let thinking = 0;
  const progress = every30s(() => `${model}: ${thinking.toLocaleString()} chars of thinking, ${text.length.toLocaleString()} of reply`);
  try {
    for await (const event of sse(res)) {
      if (event.error) throw new Error(`OpenRouter: ${event.error.message}`);
      servedBy ??= event.provider;
      const choice = event.choices?.[0];
      thinking += choice?.delta?.reasoning?.length ?? 0;
      if (choice?.delta?.content) text += choice.delta.content;
      if (choice?.finish_reason) stop = choice.finish_reason;
      if (event.usage) {
        [usage.in, usage.out] = [event.usage.prompt_tokens, event.usage.completion_tokens];
        cost = event.usage.cost;
      }
    }
  } finally {
    clearInterval(progress);
  }
  return { text, usage, stop, servedBy, cost };
}

/** Logs a status line every 30s while a long reply streams in; clear it with clearInterval. */
function every30s(status) {
  return setInterval(() => console.log(`  … ${status()}`), 30_000);
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
