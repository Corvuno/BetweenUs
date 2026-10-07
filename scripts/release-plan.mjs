#!/usr/bin/env node
// Decide whether an automatic release is due, what version it gets, and what
// the release notes say. Used by .github/workflows/auto-release.yml; also
// runnable by hand to preview what the next release would look like.
//
// How it works
//   - Finds the latest release tag (highest x.y.z, with or without a leading v).
//   - Looks at every non-merge commit since then. Commits that only touch
//     docs / question notes / tests / workflows don't count — they never
//     trigger or shape a release.
//   - A commit can say how big it is with two lines in its message:
//         Change: small | medium | large
//         Note: one short line for the release notes
//     Commits without a Change line are sized and described by the script
//     itself (see classifyUnlabelled and cleanSubject): clear "small" signals
//     (fix/tweak/nudge/bump/revert/trim/swap...) stay small, clear feature
//     signals (new files, big diffs, add/rebuild/redesign...) are medium,
//     and anything it can't read with confidence defaults to medium.
//   - The release size is the biggest commit size, and also at least
//     "medium" once CARD_MEDIUM_THRESHOLD or more cards changed in total.
//   - small -> patch, medium -> minor, large -> major.
//   - A release is only cut when 3+ nights (Amsterdam calendar days) have
//     passed since the last release, it's night-time in Amsterdam, and there
//     is at least one counting change. --force skips the timing checks.
//
// Usage:
//   node scripts/release-plan.mjs [--force] [--now ISO] [--last-date ISO]
//   node scripts/release-plan.mjs --print-last-tag
// Prints the plan as JSON. Inside GitHub Actions it also writes
// release / version / size / notes to $GITHUB_OUTPUT.

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TIME_ZONE = 'Europe/Amsterdam';
const NIGHTS_BETWEEN_RELEASES = 3;
const NIGHT_HOURS = [3, 6]; // local hour >= 3 and < 6
const CARD_MEDIUM_THRESHOLD = 3; // this many changed cards -> at least medium
const CODE_MEDIUM_LINES = 300; // this many changed non-card lines -> medium

// Paths that never count towards a release.
const IGNORED = [/\.md$/i, /^questions\//, /^tests\//, /^\.github\//, /^\.claude\//, /^\.gitignore$/];

const AREAS = [
  { name: 'Cards', test: (f) => f === 'questions.js' },
  { name: 'Look & feel', test: (f) => f === 'styles.css' || f === 'gilt.js' },
  { name: 'Build & tooling', test: (f) => f.startsWith('scripts/') },
  { name: 'App', test: () => true },
];

const SIZES = ['small', 'medium', 'large'];
const BUMPS = { small: 'patch', medium: 'minor', large: 'major' };

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

export const isIgnored = (file) => IGNORED.some((re) => re.test(file));
export const areaOf = (file) => AREAS.find((a) => a.test(file)).name;

export function parseTag(tag) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function latestTag(tags) {
  return tags
    .map((t) => ({ t, v: parseTag(t) }))
    .filter((x) => x.v)
    .sort((a, b) => b.v[0] - a.v[0] || b.v[1] - a.v[1] || b.v[2] - a.v[2])[0]?.t;
}

export function bump(tag, size) {
  const [maj, min, pat] = parseTag(tag);
  const kind = BUMPS[size];
  if (kind === 'major') return `${maj + 1}.0.0`;
  if (kind === 'minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

export const maxSize = (a, b) => (SIZES.indexOf(a) >= SIZES.indexOf(b) ? a : b);

// Pull "Change:" and "Note:" out of a commit message body. "Blurb:" is the
// old name for "Note:" and is still read, so earlier commits keep working.
export function parseTrailers(body) {
  const change = /^Change:\s*(small|medium|large)\s*$/im.exec(body)?.[1]?.toLowerCase();
  const note = /^(?:Note|Blurb):\s*(.+?)\s*$/im.exec(body)?.[1];
  return { change, blurb: note };
}

// Size an unlabelled commit. Small only on a clear small signal; big diffs,
// new app files and feature words are medium; anything the rules can't place
// confidently defaults to medium rather than being quietly under-counted.
// Card edits are also counted across the whole release (3+ cards -> medium).
const SMALL_WORDS = /^(fix|fixes|fixed|nudge|tweak|bump|revert|trim|settle|replace|swap|polish|align|rename|relocate|pull|mute|remove|hide|move|make|force|drop|add a (subtle|temp))\b/i;
const MEDIUM_WORDS = /^(add|rebuild|redesign|extract|rework|introduce|new|implement|create|overhaul)\b/i;

export function classifyUnlabelled({ subject, codeLines, addedAppFile, cardLines, otherFiles }) {
  if (codeLines >= CODE_MEDIUM_LINES || addedAppFile) return 'medium';
  if (cardLines && !otherFiles) return 'small'; // card-only commit; the release-wide card count decides medium
  if (MEDIUM_WORDS.test(subject)) return 'medium';
  if (SMALL_WORDS.test(subject)) return 'small';
  return 'medium';
}

// Turn a developer commit subject into a release-note line: drop the
// "(owner-approved)"-style parentheticals and process words, capitalise.
export function cleanSubject(subject) {
  let t = subject.replace(/\s*\((?:owner[^)]*|no-loss[^)]*|[^)]*round \d[^)]*)\)/gi, '')
    .replace(/,?\s*(?:for real this time|closing the .*)$/i, '').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Subjects that are plumbing, not news: still counted, never listed.
export const isNoise = (subject) => /^(merge|revert)\b/i.test(subject) || /cache[- ]?bust/i.test(subject);

export function amsterdamParts(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function nightsBetween(lastDate, now) {
  const a = Date.parse(amsterdamParts(lastDate).day);
  const b = Date.parse(amsterdamParts(now).day);
  return Math.round((b - a) / 86400000);
}

function collectCommits(tag) {
  const log = git('log', '--no-merges', '--reverse', '--format=%H%x1f%s%x1f%b%x1e', `${tag}..HEAD`);
  const commits = [];
  for (const rec of log.split('\x1e')) {
    const [sha, subject, body = ''] = rec.replace(/^\n/, '').split('\x1f');
    if (!sha) continue;
    const stats = git('show', '--numstat', '--format=', sha).trim().split('\n').filter(Boolean)
      .map((l) => { const [add, del, file] = l.split('\t'); return { file, lines: (Number(add) || 0) + (Number(del) || 0) }; })
      .filter((s) => !isIgnored(s.file));
    if (!stats.length) continue;
    const t = parseTrailers(body);
    const nonCard = stats.filter((s) => s.file !== 'questions.js');
    const codeLines = nonCard.reduce((n, s) => n + s.lines, 0);
    const added = git('show', '--diff-filter=A', '--name-only', '--format=', sha).split('\n').filter(Boolean);
    const addedAppFile = added.some((f) => !isIgnored(f) && f !== 'questions.js');
    const cardLines = stats.some((s) => s.file === 'questions.js')
      ? git('show', '-U0', '--format=', sha, '--', 'questions.js').split('\n')
        .filter((l) => l.startsWith('+') && !l.startsWith('+++') && l.includes('question:')).length
      : 0;
    commits.push({
      sha, subject, area: AREAS.map((a) => a.name).find((n) => stats.some((s) => areaOf(s.file) === n)),
      size: t.change || classifyUnlabelled({ subject, codeLines, addedAppFile, cardLines, otherFiles: nonCard.length }),
      labelled: Boolean(t.change), blurb: t.blurb || cleanSubject(subject),
    });
  }
  return commits;
}

function changedCardCount(tag) {
  const diff = git('diff', '-U0', `${tag}..HEAD`, '--', 'questions.js');
  return diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++') && l.includes('question:')).length;
}

// Labelled commits always get their note. Unlabelled ones use a cleaned-up
// subject (plumbing like merges/reverts/cache-busts is left out), at most
// MAX_UNLABELLED per area. Unlabelled card edits aren't listed one by one;
// the Cards section ends with a single total instead.
const MAX_UNLABELLED = 6;

export function renderNotes(commits, size, cards) {
  const label = { small: 'Small update', medium: 'Medium update', large: 'Large update' }[size];
  const out = [`**${label}.**`, ''];
  for (const area of AREAS.map((a) => a.name)) {
    const mine = commits.filter((c) => c.area === area);
    const labelled = [...new Set(mine.filter((c) => c.labelled).map((c) => c.blurb))];
    const rest = area === 'Cards' ? [] : [...new Set(mine.filter((c) => !c.labelled && !isNoise(c.subject)).map((c) => c.blurb))];
    const shown = rest.slice(-MAX_UNLABELLED);
    const lines = [...labelled, ...shown];
    if (rest.length > shown.length) lines.push(`…and ${rest.length - shown.length} smaller changes`);
    if (area === 'Cards' && cards) lines.push(`${cards} card${cards === 1 ? '' : 's'} replaced or reworded`);
    if (!lines.length) continue;
    out.push(`### ${area}`, ...lines.map((i) => `- ${i}`), '');
  }
  return out.join('\n').trim();
}

export function plan({ now = new Date(), lastDate, force = false } = {}) {
  const tag = latestTag(git('tag', '--list').split('\n').filter(Boolean));
  if (!tag) throw new Error('No release tag found — fetch tags first (git fetch --tags).');

  const commits = collectCommits(tag);
  const cards = changedCardCount(tag);
  let size = commits.reduce((s, c) => maxSize(s, c.size), 'small');
  if (cards >= CARD_MEDIUM_THRESHOLD) size = maxSize(size, 'medium');

  const result = { release: false, reason: '', lastTag: tag, size, commits: commits.length, cards };
  if (!commits.length) { result.reason = 'No counting changes since the last release.'; return result; }

  if (!force) {
    const last = lastDate ? new Date(lastDate) : new Date(git('log', '-1', '--format=%cI', tag).trim());
    const nights = nightsBetween(last, now);
    const { hour } = amsterdamParts(now);
    if (nights < NIGHTS_BETWEEN_RELEASES) { result.reason = `Only ${nights} night(s) since the last release; waiting for ${NIGHTS_BETWEEN_RELEASES}.`; return result; }
    if (hour < NIGHT_HOURS[0] || hour >= NIGHT_HOURS[1]) { result.reason = `Not night-time in Amsterdam yet/anymore (hour ${hour}).`; return result; }
  }

  return { ...result, release: true, version: bump(tag, size), notes: renderNotes(commits, size, cards) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--print-last-tag')) {
    console.log(latestTag(git('tag', '--list').split('\n').filter(Boolean)) || '');
    process.exit(0);
  }
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  const result = plan({
    force: args.includes('--force'),
    now: opt('--now') ? new Date(opt('--now')) : new Date(),
    lastDate: opt('--last-date'),
  });
  console.log(JSON.stringify(result, null, 2));
  if (process.env.GITHUB_OUTPUT) {
    const lines = [`release=${result.release}`, `size=${result.size}`, `reason=${result.reason}`];
    if (result.release) lines.push(`version=${result.version}`, `notes<<NOTES_EOF\n${result.notes}\nNOTES_EOF`);
    appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
  }
}
