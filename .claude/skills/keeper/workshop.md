# The workshop — how an item gets built

Several conversations build at once, so this part is kept strictly. The product's `project.md`
names its backlog, its areas and its checks; `build-rules.md` says how its code is written.

## The backlog

- One queue with four states: `Refine` (still being thought through), `Next` (could be built
  without asking anything), `Building now`, `Parked`; done is closed. What the owner changes
  there wins. New items go to the bottom unless the owner says top. Search before adding.
- An item starts only when its files are named exactly and none is shared with an item in
  `Building now`; at most three at once. Starting: pull the main branch, mark it `Building now`
  with a comment holding the session link, and take along `Next` items on the same files.
- Once taken, nothing is asked again; when its checks pass it lands. A real question about what
  the owner wants sends it back to `Refine` with the question on the item.
- Built means closed: the landing closes its item and every other open item the same work
  covers. A follow-up is a new item.
- Every commit names its item, or says why it has none.

## Building

- A small fix you build yourself: the product's quick checks, a test that reproduces a bug, your
  own read of the diff, a look at the result. No agents.
- A new or reworked feature goes to the `builder` with the full item and anything it depends
  on, then once to the `checker`. A "must fix" goes back to the builder. Builders run one after
  another, never two on the same files. Builders and the checker run on Sonnet, read-only
  sweeps on Haiku, unless the owner asks otherwise.
- After any build, look at the result as a whole, next to its neighbours: does it still belong,
  did anything else move, does one part now have more than its siblings? That is where noticing
  starts.
- Only a fault against the agreement goes back to the builder. Nice-to-haves become a line in
  the report or a new item. A check that passed is not run again.

## Landing and reporting

- Run the product's static checks on exactly what is pushed; a new finding blocks the push. Wait
  for the product's remote checks after a change to the product itself and fix red in the same
  session. Notes and Keeper files land without waiting. Nothing finished stays on a side branch.
- Report by area: what changed against the agreement, something to look at for anything
  visible, what turned out different, what is not done.

## Cost

- Heavy reading (a large file, the history, old conversations) goes to a cheap agent that reports
  a short summary. `searcher` answers "was this done or decided?".
- When a conversation has grown long, say so; a fresh one starts from `state.md` and the item.

## Upkeep

Once a month (`upkeep.md` holds the date), in its own conversation: read all Keeper files of the
product and the cases, shorten what has grown, and look for the same kind of miss appearing more
than once. Each repeat is raised with the owner, with what was tried before, to find out what
they expected; then the text is modified. Nothing is added by default. At the end, record the
sizes (`sh .claude/hooks/keeper-size.sh --record`): there is no size limit, only a signal at the
start of a session when the files have grown a lot since then.
