#!/usr/bin/env node
// Decide whether an automatic release is due, what version it gets, and what
// the release notes say. Used by .github/workflows/auto-release.yml; also
// runnable by hand to preview what the next release would look like.
//
// How it works
//   - Finds the latest release tag (highest x.y.z, with or without a leading v),
//     leaving out tags listed in RELEASE_SKIP_TAGS (comma-separated). The
//     workflow fills that with every pre-release and draft on GitHub, so test
//     cuts never count as "the previous release": changes are counted, and
//     the notes written, from the last real release onward.
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
//   - Release notes are a few player headlines, not a list of commits. If
//     RELEASE-NOTES-NEXT.md (repo root) has real
//     content, the notes are the size label plus that file. The workflow empties
//     the file after a successful publish. If it is empty, the commits' Note:
//     lines are the fallback, capped at 5 bullets with the rest folded into
//     "…and smaller fixes". See renderNotes.
//   - The release size is the biggest commit size, and also at least
//     "medium" once CARD_MEDIUM_THRESHOLD or more cards changed in total.
//   - small -> patch, medium -> minor, large -> major.
//   - A release is only cut when 3+ nights (Amsterdam calendar days) have
//     passed since the last release and there is at least one counting
//     change. The workflow wakes up at night, but GitHub often starts
//     scheduled jobs hours late, so the time of day is not checked: the first
//     run after the 3rd night does the release. --force skips the wait.
//
// Usage:
//   node scripts/release-plan.mjs [--force] [--now ISO] [--last-date ISO]
//   node scripts/release-plan.mjs --print-last-tag
//   node scripts/release-plan.mjs --reset-notes   (empty RELEASE-NOTES-NEXT.md back to its header comment)
// Locally, pre-releases aren't known unless you set RELEASE_SKIP_TAGS=1.1.8,... yourself.
// Prints the plan as JSON. Inside GitHub Actions it also writes
// release / version / size / notes to $GITHUB_OUTPUT.

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TIME_ZONE = 'Europe/Amsterdam';
const NIGHTS_BETWEEN_RELEASES = 3;
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

// Every tag in the repo except the ones named in RELEASE_SKIP_TAGS.
export function candidateTags(env = process.env) {
  const skip = new Set((env.RELEASE_SKIP_TAGS || '').split(',').map((t) => t.trim()).filter(Boolean));
  return git('tag', '--list').split('\n').filter(Boolean).filter((t) => !skip.has(t));
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
      timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}` };
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

// Release notes are a few headlines for players (see RELEASE-NOTES-NEXT.md).
//   File mode: if RELEASE-NOTES-NEXT.md has real content once its comments and
//   blank lines are stripped, the notes are the size label, a blank line, and
//   that content. No automatic "N cards replaced" line: the card headline in
//   the file covers it.
//   Fallback (file empty): the labelled commits' Note: lines, no section
//   headings, at most MAX_BULLETS bullets. When there are more, the most
//   recent ones are kept (the card-count line, if any, always stays first)
//   and the rest fold into one "…and smaller fixes" bullet.
const MAX_BULLETS = 5;
const NOTES_FILE = fileURLToPath(new URL('../RELEASE-NOTES-NEXT.md', import.meta.url));
const SIZE_LABEL = { small: 'Small update', medium: 'Medium update', large: 'Large update' };

// Throws if a comment is opened and never closed: that file is half-written,
// and publishing its text as notes would be worse than using the fallback.
export function headlinesFromFile(text) {
  const stripped = text.replace(/<!--[\s\S]*?-->/g, '');
  if (stripped.includes('<!--')) throw new Error('RELEASE-NOTES-NEXT.md has a "<!--" comment that is never closed.');
  return stripped.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim()).join('\n');
}

// The file with everything after its leading header comment removed.
// Throws if the file does not start with a properly closed comment.
export function resetNotesText(text) {
  const header = /^\s*<!--[\s\S]*?-->/.exec(text)?.[0];
  if (!header) throw new Error('RELEASE-NOTES-NEXT.md must start with a closed "<!-- … -->" header comment; not touching it.');
  return `${header.trimStart()}\n`;
}

// '' for a missing file or an unusable one (with a warning); other read errors surface.
export function readHeadlines(file = NOTES_FILE) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (e) {
    if (e.code === 'ENOENT') return '';
    throw e;
  }
  try { return headlinesFromFile(text); } catch (e) {
    console.warn(`Warning: ${e.message} Using the commits' Note: lines instead.`);
    return '';
  }
}

export function renderNotes(commits, size, cards, headlines = '') {
  const out = [`**${SIZE_LABEL[size]}.**`, ''];
  if (headlines) return [...out, headlines].join('\n');
  const lead = cards ? [`${cards} card${cards === 1 ? '' : 's'} replaced or reworded`] : [];
  const seen = new Set();
  const notes = [];
  const add = (c) => { if (!seen.has(c.blurb)) { seen.add(c.blurb); notes.push(c.blurb); } };
  commits.filter((c) => c.labelled && c.area !== 'Cards').forEach(add);
  commits.filter((c) => !c.labelled && c.area !== 'Cards' && !isNoise(c.subject)).forEach(add);
  const room = MAX_BULLETS - lead.length;
  const items = notes.length > room ? [...lead, ...notes.slice(-(room - 1)), '…and smaller fixes'] : [...lead, ...notes];
  return [...out, ...items.map((i) => `- ${i}`)].join('\n');
}

export function plan({ now = new Date(), lastDate, force = false } = {}) {
  const tag = latestTag(candidateTags());
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
    if (nights < NIGHTS_BETWEEN_RELEASES) { result.reason = `Only ${nights} night(s) since the last release; waiting for ${NIGHTS_BETWEEN_RELEASES}.`; return result; }
  }

  return { ...result, release: true, version: bump(tag, size), notes: renderNotes(commits, size, cards, readHeadlines()) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--print-last-tag')) {
    console.log(latestTag(candidateTags()) || '');
    process.exit(0);
  }
  if (args.includes('--reset-notes')) {
    try { writeFileSync(NOTES_FILE, resetNotesText(readFileSync(NOTES_FILE, 'utf8'))); } catch (e) {
      console.error(`--reset-notes failed: ${e.message}`);
      process.exit(1);
    }
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
