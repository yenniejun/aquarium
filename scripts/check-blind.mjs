// Flags pieces that could give their artist away before a blind vote: model, company or product
// names in the code, comments or visible text, or in the title and statement the model wrote.
// Usage: npm run check:blind
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const NAMES = [
  'claude', 'anthropic', 'gpt', 'chatgpt', 'openai', 'gemini', 'deepmind', 'bard',
  'llama', 'meta ai', 'qwen', 'alibaba', 'deepseek', 'mistral', 'grok', 'xai', 'kimi', 'moonshot',
  'sonnet', 'haiku', 'opus', 'gemma', 'glm', 'zhipu', 'muse', 'z.ai', 'spacexai',
];
const pattern = new RegExp(`\\b(${NAMES.join('|')})\\b`, 'gi');

let problems = 0;
for (const exhibit of readdirSync('exhibits')) {
  const entries = join('exhibits', exhibit, 'entries');
  if (!existsSync(entries)) continue;
  for (const entry of readdirSync(entries)) {
    // The model's own words on the plaque and wall label count too.
    const metaFile = join(entries, entry, 'meta.json');
    if (existsSync(metaFile)) {
      const { title = '', statement = '' } = JSON.parse(readFileSync(metaFile, 'utf8'));
      for (const [field, text] of Object.entries({ title, statement })) {
        const hits = text.match(pattern);
        if (hits) {
          problems++;
          console.log(`${metaFile} (${field})  ${[...new Set(hits)].join(', ')}\n    ${text.slice(0, 140)}`);
        }
      }
    }
    const file = join(entries, entry, 'piece.html');
    if (!existsSync(file)) continue;
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      // CDN URLs like fonts.googleapis.com aren't a giveaway.
      const hits = line.replace(/https?:\/\/\S+/g, '').match(pattern);
      if (hits) {
        problems++;
        console.log(`${file}:${i + 1}  ${[...new Set(hits)].join(', ')}\n    ${line.trim().slice(0, 140)}`);
      }
    });
  }
}

console.log(problems ? `\n${problems} line(s) might reveal an artist.` : 'No artist names found in any piece.');
process.exit(problems ? 1 : 0);
