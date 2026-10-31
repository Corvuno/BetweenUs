// Keeps the GitHub board "Between Us backlog" and the backlog labels on the issues in step
// (owner, 2026-10-31). The labels are what sessions change; the board is what the owner looks at.
//
//  - A label change (or closing/reopening) moves the card straight away (run on the issue event).
//  - A card the owner dragged changes the labels on the next check (every 15 minutes).
//  - When both changed since they last matched, the newer change wins.
//
// Columns: New (owner's own wish, not sorted yet), Waiting on owner, Next, Building now, Parked,
// Done. Done = issue closed as completed. Closed as not planned = taken off the board.
//
// Needs BOARD_TOKEN (a key the owner made, allowed to change projects) and GITHUB_TOKEN.
// See .claude/keeper/project.md, "The backlog".

const OWNER = 'Corvuno';
const REPO = 'BetweenUs';
const TITLE = 'Between Us backlog';
const COLUMNS = [
  { name: 'New', color: 'GRAY', description: 'Your own wish, not sorted yet' },
  { name: 'Waiting on owner', color: 'ORANGE', description: 'Needs your answer' },
  { name: 'Next', color: 'BLUE', description: 'Agreed, waiting its turn' },
  { name: 'Building now', color: 'YELLOW', description: 'A builder is at work' },
  { name: 'Parked', color: 'PURPLE', description: 'Kept for later' },
  { name: 'Done', color: 'GREEN', description: 'Landed on main' },
];
const STATUS_LABELS = ['Waiting on owner', 'Next', 'Building now', 'Parked'];
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
  const d = await gql(`query($o:String!,$r:String!){
    user(login:$o){ id projectsV2(first:50){ nodes{ id title number url } } }
    repository(owner:$o,name:$r){ id }
  }`, { o: OWNER, r: REPO });
  let p = d.user.projectsV2.nodes.find(n => n.title === TITLE);
  if (!p) {
    console.log(`Creating the board "${TITLE}"`);
    const c = await gql(`mutation($owner:ID!,$title:String!,$repo:ID!){
      createProjectV2(input:{ownerId:$owner,title:$title,repositoryId:$repo}){ projectV2{ id title number url } }
    }`, { owner: d.user.id, title: TITLE, repo: d.repository.id });
    p = c.createProjectV2.projectV2;
  }
  console.log(`Board: ${p.url}`);
  let field = await statusField(p.id);
  const have = field.options.map(o => o.name).join('|');
  const want = COLUMNS.map(c => c.name).join('|');
  if (have !== want) {
    console.log(`Setting the columns (were: ${have})`);
    await gql(`mutation($f:ID!,$opts:[ProjectV2SingleSelectFieldOptionInput!]){
      updateProjectV2Field(input:{fieldId:$f,singleSelectOptions:$opts}){ projectV2Field{ ... on ProjectV2SingleSelectField{ id } } }
    }`, { f: field.id, opts: COLUMNS });
    field = await statusField(p.id);
  }
  return { id: p.id, fieldId: field.id, optionId: Object.fromEntries(field.options.map(o => [o.name, o.id])) };
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
            fieldValueByName(name:"Status"){ ... on ProjectV2ItemFieldSingleSelectValue{ name updatedAt } } } }
        } } } }`, { o: OWNER, r: REPO, after });
    const page = d.repository.issues;
    out.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return out;
}

// What the labels and open/closed state say the column is. null = not on the board.
function columnFromIssue(i) {
  if (i.state === 'CLOSED') return i.stateReason === 'NOT_PLANNED' || i.stateReason === 'DUPLICATE' ? null : 'Done';
  const names = i.labels.nodes.map(l => l.name);
  // If two status labels are on at once, the one further along wins.
  for (const s of ['Building now', 'Waiting on owner', 'Next', 'Parked']) if (names.includes(s)) return s;
  return 'New';
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

async function applyColumnToIssue(i, column) {
  const names = i.labels.nodes.map(l => l.name);
  if (column !== 'Done' && i.state === 'CLOSED') await rest('PATCH', `/issues/${i.number}`, { state: 'open' });
  for (const s of STATUS_LABELS) {
    if (s !== column && names.includes(s)) await rest('DELETE', `/issues/${i.number}/labels/${encodeURIComponent(s)}`);
  }
  if (column === 'Done' && i.state !== 'CLOSED') await rest('PATCH', `/issues/${i.number}`, { state: 'closed', state_reason: 'completed' });
  if (STATUS_LABELS.includes(column) && !names.includes(column)) await rest('POST', `/issues/${i.number}/labels`, { labels: [column] });
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
  if (!eventIssue && onBoard && boardChanged > issueChanged) {
    console.log(`${tag}: moved on the board to ${onBoard}, labels follow (were: ${fromIssue})`);
    await applyColumnToIssue(i, onBoard);
  } else {
    console.log(`${tag}: card moves to ${fromIssue} (was: ${onBoard || 'no column'})`);
    await setColumn(board, item.id, fromIssue);
  }
  changed++;
}
console.log(changed ? `${changed} change(s).` : 'Board and labels already match.');
