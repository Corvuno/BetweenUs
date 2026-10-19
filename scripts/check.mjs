// Static checks (type check + lint) with a baseline: findings that already existed when the
// checks were introduced are listed in checks-baseline.json and do not fail; any finding
// beyond the baseline does. Line numbers are ignored when comparing, so editing a file
// doesn't make old findings look new.
//   node scripts/check.mjs                  compare against the baseline
//   node scripts/check.mjs --update-baseline   rewrite the baseline (after a clean-up)
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = join(root, 'checks-baseline.json');
const run = (args) => spawnSync('npx', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 });

const typeFindings = () => ['jsconfig.json', 'jsconfig.sw.json'].flatMap((config) => {
  const out = run(['tsc', '-p', config, '--pretty', 'false']).stdout;
  return [...out.matchAll(/^(.+?)\(\d+,\d+\): error (TS\d+): (.*)$/gm)]
    .map(([, file, code, message]) => ({ file, rule: code, message }));
});

const lintFindings = () => {
  const out = run(['eslint', '.', '-f', 'json']).stdout;
  return JSON.parse(out).flatMap((result) => result.messages.map((m) => ({
    file: relative(root, result.filePath), rule: m.ruleId ?? 'parse-error', message: m.message,
  })));
};

const count = (findings) => findings.reduce((acc, { file, rule, message }) => {
  const key = `${file} | ${rule} | ${message}`;
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});

const current = count([...typeFindings(), ...lintFindings()]);
const total = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);

if (process.argv.includes('--update-baseline')) {
  writeFileSync(baselinePath, `${JSON.stringify(Object.fromEntries(Object.entries(current).sort()), null, 2)}\n`);
  console.log(`Baseline written: ${total(current)} findings.`);
  process.exit(0);
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {};
const added = Object.entries(current).filter(([key, n]) => n > (baseline[key] ?? 0));
const fixed = Object.entries(baseline).filter(([key, n]) => (current[key] ?? 0) < n);

if (fixed.length) console.log(`${fixed.length} old finding(s) are gone - run "npm run check:baseline" to shrink the baseline.`);
if (added.length) {
  console.error(`\n${added.length} NEW finding(s) (not in checks-baseline.json):`);
  for (const [key, n] of added) console.error(`  ${key}${n > 1 ? `  (x${n})` : ''}`);
  process.exit(1);
}
console.log(`Type check + lint OK: no new findings (${total(current)} old ones in the baseline).`);
