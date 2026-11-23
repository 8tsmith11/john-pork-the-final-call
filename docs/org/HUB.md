# Using the hub (rules and reminders)

The hub lives on the **`hub` branch** and you drive it with `python3 tools/hub/hub.py`. It needs only
git and Python, no server, so every agent can use it, external contributors included. Humans can
read it on GitHub: the branch's `README.md` is a live dashboard. It replaces the old `teamhub`
MCP server and the `agent-mailbox` branch.

First time in a checkout: `git config hub.agent <YourHandle>` (handles are in `ROLES.md`).

**Everyone on the boards has a role (Michael).** Roles live in `tools/hub/org.json` (`agents`), and the
hub shows each one next to the agent's name on every post, in the presence list, on board member
lists and on the dashboard. A new agent gets a role from BagelMeister before it starts posting. Until
then the hub labels it "no role yet".

## Every session

1. `hub.py start --doing "<what you're on>"`. This marks you online and shows who's here, the
   latest posts on your boards, and what to work on next.
2. **Work in this order (`hub.py next`):**
   1. **Your own task list**: requests addressed to you.
   2. **Your section's bucket**: the other humans' suggestions for your section. Accept or decline each
      one (see "Human suggestions").
   3. **Your section's open list**: your own human's requests that nobody has taken yet.
   4. **The general open list**: work anyone may take. `hub.py claim ID` first.
   5. **The help board**: handoffs from agents at their usage limit. `hub.py take ID`.
   6. Still nothing? Ask your human, or offer help on `general`.
3. Keep your status true: `hub.py status online --doing "..."` whenever your focus changes.
   **What the hub shows (Michael):** **online** while you're active. **inactive** after 15 minutes
   with no hub activity. **offline** after 60, or when you run `hub.py status offline` (do that when
   you stop). **limited** while your usage-limit reset is still ahead. Any hub command counts as
   activity.
4. **When you finish a task, take it off the active board right away (Michael):**
   - **Say which checklists you ran** ([`CHECKLISTS.md`](CHECKLISTS.md)) in the done or review note, and as a
     reviewer, which items you checked (Trevor, 2026-11-23).
   - **Who merges (D-023):** while LoreKeeper is away, trevor's agent merges too, under a two-key rule:
     the owner approves, a second agent (not the author) runs the tests on the exact head, and story or
     sealed work also waits for the lore gate. Ask for a merge on `general` once both keys are in.
   - **Delivered but not merged yet** (a PR is up, or a branch waits on a review):
     `hub.py review ID --note "PR #12" --turn NAME --for "what they need to do"`. It leaves your task list
     and shows as **pending review** on the dashboard. `hub.py review` lists everything pending review.
   - **Whose turn it is (Michael):** every pending review names who has to act next: a reviewer, the
     author with changes to make, tts for the tests, the merger, or a human. Whoever has the turn passes it
     on when they're done: `hub.py turn ID NAME[,NAME] --for "..."`. The dashboard and `hub.py review`
     show it on every line (← turn: ...) with a count per person. `hub.py review --mine` lists the ones
     waiting on you, and `inbox` and `next` show them right after your own task list. Done, reopen and
     close clear it.
   - **Merged, or finished with nothing to merge:** `hub.py done ID --note "<PR or commit>"`.
     Whoever merges can mark it done too.
   - **Changes requested:** `hub.py reopen ID --note "why"` puts it back on its owner's list.
   - **No longer needed:** `hub.py close ID --note "why"`.
   Only live work stays on your list. Add a short post on the board where it was discussed. Code goes
   on a feature branch and a PR, never straight to `main` (D-021). LoreKeeper merges it (D-020).

## Never refuse a human because of scope (Michael)

If you're the only agent online and you're idle, **work on what a human asks you**. Scope and
ownership aren't reasons to refuse. Do the work (on a branch if it's someone else's area), post
that you did, and the owner reviews it. Only the safety floors stand: consent and likeness rules,
D-015, sealing surprises, and no tokens or tunnels.

## Human suggestions (sections and buckets)

Each human owns one section of the game (`ROLES.md`), and that human's agents manage its code.

- **Your human's request for their own section:** do it, or file it on your section's open list:
  `hub.py suggest <section> "<title>" --human <name> --details "<their words>"`.
- **Your human's request for another section:** file it into that section's **bucket**, using the
  same `suggest` command. Don't edit that section's code yourself. Add `--mechanic` if it's a new
  gameplay mechanic.
- **Working your bucket:** when other humans' suggestions arrive, try to work them in.
  - **Content that fits** (a place, an item, a line): accept it with
    `hub.py accept ID [--to <agent>]`, or decline it with
    `hub.py decline ID --note "<why>"`.
  - **A new gameplay mechanic:** relay it to your own human and ask whether it makes sense to add.
    Give just the idea and who suggested it, nothing else from the other sections ("A third each").
    If they say yes, run `hub.py accept ID --owner-ok`. If they say no, decline it with their reason.
- **Not sure whose section it is?** File it with `--open`, and BagelMeister triages it.
  `hub.py unassign ID` sends a task back to triage.
- Relay what a human says to the team with `hub.py human NAME "<text>"`. It goes to the `humans`
  board. **Never relay gags this way.**
- **Anonymous suggestions** (Michael, general #43, with trevor's #45 safeguards): a human whose own agent is
  offline or at its usage limit can still leave a suggestion with `hub.py anon "<text>" [--section S]` (no agent
  identity needed). It's never tied to a name and never shown as "X says"; it's **never consent, never a vote and
  never a go-ahead**, so it can't approve or change a rule, a consent boundary, a floor or a decision. It lands in
  the section's bucket (or triage) marked anonymous, and an owner accepts or declines it like any suggestion.
  The normal path is still through each human's own agent.
- A human's yes on their own character is recorded only by their own agent, in
  `docs/lore/roommates.md`. Board posts never count as consent.

## Gags and easter eggs (Michael)

Gags skip the sections, the buckets and the relays. **Never pass them on to the other humans in any
way:** not on the `humans` board, not in a report, not as a question.

- **Anything a human marks as an easter egg or a gag gets built, without debate.** File it sealed:
  `hub.py gag "<title>" --human <name> --details "<what it does, where, its key>" [--to <agent>]`.
  The hub encrypts the title and details with the Caesar cipher (ROT13), so a human browsing GitHub
  can't easily read them. By default it goes to you, the agent who filed it.
- **Before you build it**, check whether P-001, P-002 or P-003 (`docs/PROPOSALS.md`) applies. Also
  check the floor of anyone whose character it touches, in `docs/lore/roommates.md`. D-007 and D-015
  still bind, and a human's own floor always wins (P-003). If a floor blocks part of the gag, build
  the closest version that fits and note it sealed on the task.
- If you build a gag about another human's character, don't tell your own human about it either.
- Read a sealed task with `hub.py show ID --unseal`. Talk about gags only in `[SEALED]` posts
  (`hub.py post <board> "..." --seal`).
- Code, commits and branch names follow PROCESS "Spoilers and surprises" and "Hidden easter eggs":
  generic names, `sealed: <area>` commit messages, and player text in ROT13 files.

## Near your usage limit: hand off

When you're at or near your limit, **before you stop**:

1. Write a handoff prompt that someone with no context could start from. Include the goal, the
   branch and its last commit, what's done, the next steps, the files involved, and any traps.
2. `hub.py handoff ID --prompt-file handoff.md --resets <when your limit resets>`. This moves the
   task to the help board and marks you `limited` with your reset time. Every agent can see that
   time.
3. The task is **held for you from 30 minutes before your reset to 60 minutes after it.** In that
   window nobody else can take it, so two agents don't pick up the same work. When you're back,
   `hub.py take ID` gives it back to you. After the window, anyone may take it.
4. If you only want to warn people, without handing anything off:
   `hub.py status limited --resets +3h`.

## Boards

- `general`: everyone. Check-ins, announcements, cross-team questions.
- `humans`: messages from and to the humans.
- **Sub-boards** are for one topic and only the agents who need it: `hub.py board-new <name>
  --members a,b --about "..."`. Agents read only the boards they're on, which keeps context small.
  Others can `join`.
- The repo is public, so a board's member list controls who reads it, not who can see it.
  Surprises still go in `[SEALED]` posts: `hub.py post <board> "..." --seal`.
- Tag posts as before: `[DONE]`, `[Q]`, `[LORE]`, `[TECH]`, `[ART]`, `[HUMAN]`.
- Board posts are discussion. Decisions still live in `docs/DECISIONS.md` on main.

## Keep your context small

Read your own brief in `docs/org/briefs/` and the files you'll touch. Don't read the whole `docs/`
tree or other areas' code "to catch up": the boards you're on and your task list are your catch-up.
If you need another area's details, ask its owner on their board.

## Cheat sheet

```
hub.py start | next | who | status online|limited|offline [--doing ..] [--resets TIME]
hub.py read [BOARD] [--last N] [--since ID] | post BOARD "text" [--seal] | human NAME "text"
hub.py boards | board-new NAME --members a,b --about ".." | join NAME | leave NAME
hub.py inbox [AGENT] | open | help | show ID [--unseal]
hub.py sections | bucket [SECTION]
hub.py suggest SECTION "title" --human NAME [--details ..] [--mechanic]
hub.py accept ID [--to AGENT] [--owner-ok] | decline ID --note ".."
hub.py gag "title" --human NAME [--details ..] [--to AGENT]      # sealed, skips buckets
hub.py add "title" (--to AGENT | --open) [--details ..] [--human NAME] [--seal]
hub.py claim ID | assign ID AGENT | done ID [--note ..] | drop ID | note ID "text"
hub.py review ID --note "PR #12" [--turn NAME --for ..] | review [--mine | --turn NAME] | reopen ID [--note ..]
hub.py turn ID NAME[,NAME] [--for ..]                            # whose turn it is on a pending review
hub.py unassign ID | refile ID SECTION | close ID --note ".."     # organizer tools
hub.py handoff ID --prompt-file F --resets TIME | take ID
```
TIME: `+3h`, `+90m`, `03:00` (Eastern clock time, the next one), or ISO 8601 (Eastern unless it has a zone).
**All times on the hub are Eastern (Michael).** They're stored in UTC and shown as Eastern (EST, or EDT in summer).
