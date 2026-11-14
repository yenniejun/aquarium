// The APIs behind each entry, shared by generate.mjs (whole pieces) and names.mjs (names only).
//
// Each entry's meta.json says who to ask: "provider" (Anthropic, OpenAI or Google) and "modelId".
// Models from other makers go through OpenRouter: "route": "OpenRouter", plus "host" to pin the
// request to one host (usually the maker's own servers) with no fallbacks.
// API keys come from .env (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY),
// which git ignores.
//
// ask(meta, { prompt, maxTokens, reasoning }) streams one reply and resolves to
// { text, usage: { in, out }, stop, servedBy?, cost? }. usage.out includes any thinking, since
// that's billed as output too.

export const providers = {
  Anthropic: { key: 'ANTHROPIC_API_KEY', via: 'Anthropic Messages API', ask: askAnthropic },
  OpenAI: { key: 'OPENAI_API_KEY', via: 'OpenAI Chat Completions API', ask: askOpenAI },
  Google: { key: 'GEMINI_API_KEY', via: 'Gemini API', ask: askGemini },
  OpenRouter: { key: 'OPENROUTER_API_KEY', via: 'OpenRouter', ask: askOpenRouter },
};

/** The provider an entry goes through, checking it's set up (API and key). */
export function providerFor(meta) {
  const route = meta.route ?? meta.provider;
  const provider = providers[route];
  if (!provider) throw new Error(`no API set up for "${route}" (have: ${Object.keys(providers).join(', ')})`);
  if (!meta.modelId) throw new Error(`the entry needs a "modelId"`);
  if (!process.env[provider.key]) throw new Error(`${provider.key} isn't set (add it to .env)`);
  return provider;
}

export function ask(meta, options) {
  const provider = providerFor(meta);
  return provider.ask(meta, process.env[provider.key], options);
}

/** A connection that dropped partway (a host going quiet for minutes, a reset) is worth another
 * try; API errors (no credits, a bad model id…) aren't. */
export function dropped(err) {
  return err.message === 'terminated' || err.message === 'fetch failed';
}

/** Streams so long replies don't hit the HTTP client's timeout. */
async function askAnthropic(meta, apiKey, { prompt, maxTokens, reasoning }) {
  const model = meta.modelId;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      ...(reasoning && { output_config: { effort: reasoning } }),
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

async function askOpenAI(meta, apiKey, { prompt, maxTokens }) {
  const model = meta.modelId;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_completion_tokens: maxTokens,
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

async function askGemini(meta, apiKey, { prompt, maxTokens }) {
  const model = meta.modelId;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
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
      // Gemini counts its thinking separately from the reply; both are billed as output.
      const u = event.usageMetadata;
      if (u) [usage.in, usage.out] = [u.promptTokenCount, (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0)];
    }
  } finally {
    clearInterval(progress);
  }
  return { text, usage, stop };
}

/** OpenAI-style API in front of many hosts. Reports which host answered and what it cost. */
async function askOpenRouter(meta, apiKey, { prompt, maxTokens, reasoning }) {
  const model = meta.modelId;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      usage: { include: true },
      ...(reasoning && { reasoning: { effort: reasoning } }),
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

/** The first ```lang fenced block in a reply. */
export function block(text, lang) {
  return text.match(new RegExp('```' + lang + '\\s*\\n([\\s\\S]*?)\\n```'))?.[1];
}

/** The reply's json block as an object, or {} if it's missing or isn't valid JSON. */
export function parseCard(json) {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}
