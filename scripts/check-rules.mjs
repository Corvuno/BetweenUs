// Keeps the rule files lean: they say how things work now, never how they got there.
// Fails on a date or a history marker in a rule file. Size is not limited, only signalled.
// Records belong in .claude/keeper/agreements/ or .claude/keeper/history/ (not checked).
//   node scripts/check-rules.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// The generic Keeper files are copies from Corvuno/Keeper; this check covers only what belongs
// to this product. There is no size limit: growth is signalled at session start
// (.claude/hooks/keeper-size.sh), never refused.
const generic = new Set(
  (existsSync(join(root, '.claude/keeper-core.txt')) ? readFileSync(join(root, '.claude/keeper-core.txt'), 'utf8') : '')
    .split('\n').filter((l) => l && !l.startsWith('#')).map((l) => `.claude/${l}`),
);

const agents = readdirSync(join(root, '.claude/agents'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => `.claude/agents/${f}`);
const keeperFiles = readdirSync(join(root, '.claude/keeper'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => `.claude/keeper/${f}`);
const files = [...new Set(['CLAUDE.md', ...keeperFiles, ...agents])]
  .filter((f) => existsSync(join(root, f)) && !generic.has(f));

const markers = [
  [/\b20\d\d-\d\d-\d\d\b/, 'a date'],
  [/\(owner,? 20/i, 'an "owner, <date>" note'],
  [/\buntil 20\d\d/i, 'an "until <year>" note'],
  [/^#+\s*(history|changes|change log)\b/i, 'a history section'],
  [/\b(updated|refined|replaced|added|since) (on )?20\d\d/i, 'a dated change note'],
];
// The one line where a date is the rule itself.
const allowed = (file, line) => file === '.claude/keeper/upkeep.md' && /^Last upkeep: \d{4}-\d\d-\d\d$/.test(line);

const problems = [];
let total = 0;
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  const size = Buffer.byteLength(text);
  total += size;
  text.split('\n').forEach((line, i) => {
    if (allowed(file, line)) return;
    for (const [pattern, what] of markers) {
      if (pattern.test(line)) { problems.push(`${file}:${i + 1}: ${what}: ${line.trim().slice(0, 80)}`); break; }
    }
  });
}

if (problems.length) {
  console.error('Rule files must say how things work now, without history (CLAUDE.md, "Rule files stay lean"):');
  for (const p of problems) console.error(`  ${p}`);
  console.error('Rewrite the rule as it is now; history lives in git, records in .claude/keeper/history/.');
  process.exit(1);
}
console.log(`Keeper files: ${files.length} files, ${total} bytes, no history.`);
