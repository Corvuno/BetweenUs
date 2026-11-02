// Keeps the owner's GitHub board and the backlog labels on the issues in step (owner,
// 2026-10-31; the owner made the board from GitHub's Kanban template on 2026-11-02). The labels
// are what sessions change; the board is what the owner looks at.
//
//  - A label change (or closing/reopening) moves the card straight away (run on the issue event).
//  - A card the owner dragged changes the labels on the next check (every 15 minutes).
//  - When both changed since they last matched, the newer change wins.
//  - The 15-minute check also puts the Ready column in queue order: Top first, Fill last,
//    otherwise oldest first (project.md, "Order of Next").
//
// The board's own columns are used as they are, never renamed:
//   Backlog = an open issue with no status label (the owner's new wish) or Parked
//   Refinement = Refine, Ready = Next, In progress = Building now, Done = closed as completed.
// Closed as not planned = taken off the board (archived).
//
// Needs BOARD_TOKEN (a key the owner made, allowed to change projects) and GITHUB_TOKEN.
// See .claude/keeper/project.md, "The backlog".

const OWNER = 'Corvuno';
const REPO = 'BetweenUs';
const LABEL_TO_COLUMN = { New: 'Backlog', Parked: 'Backlog', Refine: 'Refinement', Next: 'Ready', 'Building now': 'In progress', Done: 'Done' };
const COLUMNS = ['Backlog', 'Refinement', 'Ready', 'In progress', 'Done'];
const STATUS_LABELS = ['Refine', 'Next', 'Building now', 'Parked'];
const DONE_DAYS = 14; // closed issues older than this are not added to the board

const boardToken = process.env.BOARD_TOKEN;
const repoToken = process.env.GITHUB_TOKEN || boardToken;
const eventIssue = Number(process.env.EVENT_ISSUE || 0) || null; // set on an issue event
const dryRun = process.argv.includes('--dry-run');

if (!boardToken) {
  console.log('::warning::BOARD_TOKEN is not set yet, so the board is not updated. See .claude/keeper/project.md, "The backlog".');
  process.exit(0);
}

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${boardToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`GraphQL: ${res.status} ${JSON.stringify(body.errors || body)}`);
  return body.data;
}

async function rest(method, path, data) {
  if (dryRun) { console.log('  (dry run)', method, path, data ? JSON.stringify(data) : ''); return null; }
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${repoToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok && res.status !== 404) throw new Error(`REST ${method} ${path}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

// ---- the board -------------------------------------------------------------

async function ensureBoard() {
  // The owner's board: one of their projects whose Status column has all five columns.
  const d = await gql(`query($o:String!){ user(login:$o){ projectsV2(first:50){ nodes{ id title url closed
    field(name:"Status"){ ... on ProjectV2SingleSelectField{ id options{ id name } } } } } } }`, { o: OWNER });
  const fits = d.user.projectsV2.nodes.filter(n => !n.closed && n.field &&
    COLUMNS.every(c => n.field.options.some(o => o.name === c)));
  if (fits.length !== 1) {
    console.log(`::warning::Expected one open board with the columns ${COLUMNS.join(', ')}; found ${fits.length}. Nothing changed.`);
    process.exit(0);
  }
  const p = fits[0];
  console.log(`Board: ${p.title} ${p.url}`);
  return { id: p.id, fieldId: p.field.id, optionId: Object.fromEntries(p.field.options.map(o => [o.name, o.id])) };
}

async function statusField(projectId) {
  const d = await gql(`query($p:ID!){ node(id:$p){ ... on ProjectV2{
    field(name:"Status"){ ... on ProjectV2SingleSelectField{ id options{ id name } } } } } }`, { p: projectId });
  const f = d.node.field;
  if (!f) throw new Error('The board has no Status field');
  return f;
}

// ---- the issues ------------------------------------------------------------

async function issues() {
  const out = [];
  let after = null;
  do {
    const d = await gql(`query($o:String!,$r:String!,$after:String){
      repository(owner:$o,name:$r){ issues(first:50,after:$after,orderBy:{field:UPDATED_AT,direction:DESC}){
        pageInfo{ hasNextPage endCursor }
        nodes{ id number title state stateReason closedAt
          labels(first:20){ nodes{ name } }
          timelineItems(last:1,itemTypes:[LABELED_EVENT,UNLABELED_EVENT,CLOSED_EVENT,REOPENED_EVENT]){
            nodes{ __typename ... on LabeledEvent{createdAt} ... on UnlabeledEvent{createdAt}
                   ... on ClosedEvent{createdAt} ... on ReopenedEvent{createdAt} } }
          createdAt
          projectItems(first:10,includeArchived:true){ nodes{ id isArchived project{ id }
            fieldValueByName(name:"Status"){ ... on ProjectV2ItemFieldSingleSelectValue{ name updatedAt creator{ login } } } } }
        } } } }`, { o: OWNER, r: REPO, after });
    const page = d.repository.issues;
    out.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return out;
}

// What the labels and open/closed state say the column is. null = not on the board.
function columnFromIssue(i) {
  if (i.state === 'CLOSED') return i.stateReason === 'NOT_PLANNED' || i.stateReason === 'DUPLICATE' ? null : LABEL_TO_COLUMN.Done;
  const names = i.labels.nodes.map(l => l.name);
  // If two status labels are on at once, the one further along wins.
  for (const s of ['Building now', 'Refine', 'Next', 'Parked']) if (names.includes(s)) return LABEL_TO_COLUMN[s];
  return LABEL_TO_COLUMN.New;
}

async function setColumn(board, itemId, column) {
  if (dryRun) { console.log('  (dry run) card →', column); return; }
  await gql(`mutation($p:ID!,$i:ID!,$f:ID!,$o:String!){
    updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{singleSelectOptionId:$o}}){ clientMutationId } }`,
  { p: board.id, i: itemId, f: board.fieldId, o: board.optionId[column] });
}

async function addCard(board, issueId) {
  if (dryRun) { console.log('  (dry run) add card'); return 'dry'; }
  const d = await gql(`mutation($p:ID!,$c:ID!){ addProjectV2ItemById(input:{projectId:$p,contentId:$c}){ item{ id } } }`,
    { p: board.id, c: issueId });
  return d.addProjectV2ItemById.item.id;
}

async function archiveCard(board, itemId) {
  if (dryRun) { console.log('  (dry run) archive card'); return; }
  await gql(`mutation($p:ID!,$i:ID!){ archiveProjectV2Item(input:{projectId:$p,itemId:$i}){ clientMutationId } }`,
    { p: board.id, i: itemId });
}

// The owner dragged a card: make the labels and open/closed say the same.
async function applyColumnToIssue(i, column) {
  const names = i.labels.nodes.map(l => l.name);
  // Backlog keeps Parked if the item was parked; otherwise it means "not sorted yet": no status label.
  const label = { Refinement: 'Refine', Ready: 'Next', 'In progress': 'Building now' }[column]
    || (column === 'Backlog' && names.includes('Parked') ? 'Parked' : null);
  if (column !== 'Done' && i.state === 'CLOSED') await rest('PATCH', `/issues/${i.number}`, { state: 'open' });
  for (const s of STATUS_LABELS) {
    if (s !== label && names.includes(s)) await rest('DELETE', `/issues/${i.number}/labels/${encodeURIComponent(s)}`);
  }
  if (column === 'Done' && i.state !== 'CLOSED') await rest('PATCH', `/issues/${i.number}`, { state: 'closed', state_reason: 'completed' });
  if (label && !names.includes(label)) await rest('POST', `/issues/${i.number}/labels`, { labels: [label] });
}

// Ready in queue order: Top first, Fill last, otherwise oldest (lowest number) first.
async function orderReady(board, all) {
  const d = await gql(`query($p:ID!){ node(id:$p){ ... on ProjectV2{ items(first:100){ nodes{ id
    content{ ... on Issue{ number labels(first:20){ nodes{ name } } } }
    fieldValueByName(name:"Status"){ ... on ProjectV2ItemFieldSingleSelectValue{ name } } } } } } }`, { p: board.id });
  const ready = d.node.items.nodes.filter(n => n.fieldValueByName?.name === 'Ready' && n.content?.number);
  const rank = n => { const l = n.content.labels.nodes.map(x => x.name); return l.includes('Top') ? 0 : l.includes('Fill') ? 2 : 1; };
  const want = [...ready].sort((a, b) => rank(a) - rank(b) || a.content.number - b.content.number);
  if (want.map(n => n.id).join() === ready.map(n => n.id).join()) return 0;
  console.log(`Ready put in queue order: ${want.map(n => '#' + n.content.number).join(', ')}`);
  if (dryRun) return 1;
  let after = null;
  for (const n of want) {
    await gql(`mutation($p:ID!,$i:ID!,$a:ID){ updateProjectV2ItemPosition(input:{projectId:$p,itemId:$i,afterId:$a}){ clientMutationId } }`,
      { p: board.id, i: n.id, a: after });
    after = n.id;
  }
  return 1;
}

// ---- sync ------------------------------------------------------------------

const board = await ensureBoard();
const all = await issues();
const cutoff = Date.now() - DONE_DAYS * 864e5;
let changed = 0;

for (const i of all) {
  if (eventIssue && i.number !== eventIssue) continue;
  const item = i.projectItems.nodes.find(n => n.project.id === board.id);
  const fromIssue = columnFromIssue(i);
  const tag = `#${i.number} ${i.title}`;

  if (!item) {
    if (!fromIssue) continue;
    if (fromIssue === 'Done' && new Date(i.closedAt).getTime() < cutoff) continue;
    console.log(`${tag}: added to the board in ${fromIssue}`);
    const id = await addCard(board, i.id);
    if (id !== 'dry') await setColumn(board, id, fromIssue);
    changed++;
    continue;
  }
  if (!fromIssue) {
    if (!item.isArchived) { console.log(`${tag}: closed as not planned, taken off the board`); await archiveCard(board, item.id); changed++; }
    continue;
  }
  if (item.isArchived) continue; // archived by hand or by GitHub's auto-archive: leave it
  const onBoard = item.fieldValueByName?.name || null;
  if (onBoard === fromIssue) continue;

  // They differ. On an issue event the issue just changed, so the issue wins.
  // On the 15-minute check, the newer change wins.
  const issueChanged = new Date(i.timelineItems.nodes[0]?.createdAt || i.createdAt).getTime();
  const boardChanged = item.fieldValueByName?.updatedAt ? new Date(item.fieldValueByName.updatedAt).getTime() : 0;
  // Only a person's drag counts. A move the board made by itself (GitHub's own workflows, such
  // as "new items go to Backlog") never overrides the labels.
  const mover = item.fieldValueByName?.creator?.login || '';
  const byPerson = mover && !mover.endsWith('[bot]') && !/automation/i.test(mover);
  if (!eventIssue && onBoard && byPerson && boardChanged > issueChanged) {
    console.log(`${tag}: moved on the board to ${onBoard}, labels follow (were: ${fromIssue})`);
    await applyColumnToIssue(i, onBoard);
  } else {
    console.log(`${tag}: card moves to ${fromIssue} (was: ${onBoard || 'no column'})`);
    await setColumn(board, item.id, fromIssue);
  }
  changed++;
}
if (!eventIssue) changed += await orderReady(board, all);
console.log(changed ? `${changed} change(s).` : 'Board and labels already match.');
