// Keeps the rule files lean: they say how things work now, never how they got there.
// Fails on a date or a history marker in a rule file, or a file over its size budget.
// Records belong in .claude/keeper/agreements/ or .claude/keeper/history/ (not checked).
//   node scripts/check-rules.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Size budgets in bytes. A budget is raised only when the owner agrees.
const budgets = {
  'CLAUDE.md': 10500,
  '.claude/skills/keeper/SKILL.md': 17500,
  '.claude/keeper/project.md': 9000,
  '.claude/keeper/lessons.md': 11500,
  '.claude/keeper/vision.md': 5000,
  '.claude/keeper/taste.md': 5500,
  '.claude/keeper/build-rules.md': 6000,
  '.claude/keeper/panel.md': 2500,
  '.claude/keeper/upkeep.md': 500,
  '.claude/hooks/dont-guess.sh': 800,
  '.claude/hooks/main-checks.sh': 2000,
};
const agentBudget = 4000;
const totalBudget = 86000;

const agents = readdirSync(join(root, '.claude/agents'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => `.claude/agents/${f}`);
const keeperFiles = readdirSync(join(root, '.claude/keeper'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => `.claude/keeper/${f}`);
const files = [...new Set([...Object.keys(budgets), ...keeperFiles, ...agents])]
  .filter((f) => existsSync(join(root, f)));

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
  const budget = budgets[file] ?? (file.startsWith('.claude/agents/') ? agentBudget : 3000);
  if (size > budget) problems.push(`${file}: ${size} bytes, over its budget of ${budget}`);
  text.split('\n').forEach((line, i) => {
    if (allowed(file, line)) return;
    for (const [pattern, what] of markers) {
      if (pattern.test(line)) { problems.push(`${file}:${i + 1}: ${what}: ${line.trim().slice(0, 80)}`); break; }
    }
  });
}
if (total > totalBudget) problems.push(`all rule files together: ${total} bytes, over the budget of ${totalBudget}`);

if (problems.length) {
  console.error('Rule files must say how things work now, without history (CLAUDE.md, "Rule files stay lean"):');
  for (const p of problems) console.error(`  ${p}`);
  console.error('Rewrite the rule as it is now; history lives in git, records in .claude/keeper/history/.');
  process.exit(1);
}
console.log(`Rule files lean: ${files.length} files, ${total} bytes, no history.`);
