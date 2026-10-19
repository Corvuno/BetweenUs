// Release-notes tests. Run: node --test tests/release-plan.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { headlinesFromFile, readHeadlines, renderNotes, resetNotesText } from '../scripts/release-plan.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/release-plan.mjs', import.meta.url));
const HEADER = '<!--\nHeader rules.\n-->';
const tmpFile = (text) => {
  const file = join(mkdtempSync(join(tmpdir(), 'notes-')), 'notes.md');
  if (text !== undefined) writeFileSync(file, text);
  return file;
};

test('empty file has no headlines', () => assert.equal(headlinesFromFile(''), ''));
test('comment-only file has no headlines', () => assert.equal(headlinesFromFile(`${HEADER}\n`), ''));
test('headlines are read after the comment', () => assert.equal(headlinesFromFile(`${HEADER}\n- One.\n\n- Two.\n`), '- One.\n- Two.'));
test('CRLF file reads cleanly', () => assert.equal(headlinesFromFile('<!--\r\nx\r\n-->\r\n- One.\r\n- Two.\r\n'), '- One.\n- Two.'));
test('unclosed comment throws', () => assert.throws(() => headlinesFromFile('<!--\n- One.\n'), /never closed/));

test('readHeadlines: missing file is empty', () => assert.equal(readHeadlines(tmpFile()), ''));
test('readHeadlines: unclosed comment warns and is empty', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  assert.equal(readHeadlines(tmpFile('<!--\n- One.\n')), '');
  assert.equal(warn.mock.callCount(), 1);
});
test('readHeadlines: other read errors are rethrown', () => {
  assert.throws(() => readHeadlines(tmpdir()), { code: 'EISDIR' });
});

test('resetNotesText keeps only the header comment', () => assert.equal(resetNotesText(`${HEADER}\n- One.\n- Two.\n`), `${HEADER}\n`));
test('resetNotesText refuses a file without a closed leading comment', () => {
  assert.throws(() => resetNotesText('- One.\n<!-- x -->\n'), /must start with/);
  assert.throws(() => resetNotesText('<!--\n- One.\n'), /must start with/);
});

test('--reset-notes rewrites the file; fails with a message on a bad one', () => {
  // The CLI always works on the repo's own file, so run it in a copy of the layout.
  const root = mkdtempSync(join(tmpdir(), 'repo-'));
  execFileSync('mkdir', ['-p', join(root, 'scripts')]);
  execFileSync('cp', [SCRIPT, join(root, 'scripts', 'release-plan.mjs')]);
  const notes = join(root, 'RELEASE-NOTES-NEXT.md');
  const run = () => execFileSync('node', [join(root, 'scripts', 'release-plan.mjs'), '--reset-notes'], { encoding: 'utf8', stdio: 'pipe' });
  writeFileSync(notes, `${HEADER}\n- One.\n`);
  run();
  assert.equal(readFileSync(notes, 'utf8'), `${HEADER}\n`);
  writeFileSync(notes, '- no header\n');
  assert.throws(run, (e) => e.status === 1 && /--reset-notes failed: .*must start with/.test(e.stderr));
  assert.equal(readFileSync(notes, 'utf8'), '- no header\n');
});

const commit = (n) => ({ labelled: true, area: 'App', subject: `s${n}`, blurb: `Note ${n}` });
const notesOf = (md) => md.split('\n').slice(2);

test('fallback within the cap lists everything in order', () => {
  assert.deepEqual(notesOf(renderNotes([1, 2, 3].map(commit), 'small', 0)), ['- Note 1', '- Note 2', '- Note 3']);
});
test('fallback over the cap keeps the most recent notes, oldest first', () => {
  assert.deepEqual(notesOf(renderNotes([1, 2, 3, 4, 5, 6, 7].map(commit), 'small', 0)),
    ['- Note 4', '- Note 5', '- Note 6', '- Note 7', '- …and smaller fixes']);
});
test('fallback keeps the card-count line first and within five bullets', () => {
  assert.deepEqual(notesOf(renderNotes([1, 2, 3, 4, 5, 6, 7].map(commit), 'medium', 4)),
    ['- 4 cards replaced or reworded', '- Note 5', '- Note 6', '- Note 7', '- …and smaller fixes']);
});
test('headlines from the file win over the fallback', () => {
  assert.equal(renderNotes([commit(1)], 'medium', 0, '- A.'), '**Medium update.**\n\n- A.');
});
