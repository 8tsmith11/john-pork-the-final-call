# Roles and code ownership (Michael, 2026-11-19, D-018)

One owner per area. **The owner decides and merges in their area. Others propose: a task on the
owner's list, a post on the owner's board, or a branch for the owner to review.** If you need a
change outside your area, put it on the owner's task list (`hub.py add "..." --to OWNER`). Don't
edit their files.

Hub handles (use these exact names with `tools/hub/hub.py`): `BagelMeister`, `LoreKeeper`, `gonman`,
`trevor`, `JohnPork`, `tts`.

## The roles

### LoreKeeper (Trevor's Codex agent, formerly "Biohacker"): story and PRs
- **Manages PRs:** reviews them, keeps the queue moving, merges once tests pass, and marks merged
  branches inactive (`docs/devlog/branches.md`). It may merge its own fixes once their tests pass.
- **Keeps track of the story and makes everything cohesive:** the lore gate (`PROCESS.md`, "The lore
  gate"), the canon docs, the sealed canon, and `docs/lore/LORE-KEEPER.md`.
- **Critiques the story on a schedule:** it reads over everything periodically and posts concrete
  improvements on the `story` board.
- **Sends story-art requests to gonman** (onto gonman's task list): comic pages and revisions.
- **Decides where each story beat is shown,** using the rule below.

### gonman (Manuel's agent): art
- Primarily owns art: sprites, tiles, portraits, UI art, the art pipeline, and comic pages built
  from the Lore Keeper's requests.
- When its own list is empty, it works human suggestions from the open task list.

### BagelMeister (Michael's agent): task organizer
- Keeps everyone on task: triages human suggestions into owners' task lists, keeps lists and boards
  current with main, and chases stale tasks.
- Builds and maintains the task infrastructure (`tools/hub/`, this folder).
- Owns the cutscene engine (the in-engine timeline for animated cutscenes).

### trevor (Trevor's agent): engine and systems *(proposed; Trevor to confirm)*
- Sim, netcode, saves, combat, world state, the level builder and world maps.

### JohnPork (external, via git): inventory and quest scaffolds *(for now)*
- Hotbar-driven weapons (the Melee/Ranged slots are gone), inventory UI, quest knowledge and leads,
  contextual NPC actions, the host-side hand-in fix.
- **Takes the team's suggestions when they're made.** Work goes on `jp/*` branches, and an owner
  reviews before anything merges.

### tts (tung tung sahur, external): tests and tooling
- Test coverage and tools only, on `tts/*` branches, reviewed before merge.

## Comics or cutscenes? (Michael)

- **Comic-book pages** are for flashbacks and for events the roommates don't witness. gonman draws
  them from the Lore Keeper's requests.
- **Animated in-engine cutscenes** are for events the roommates do witness. They play in the game
  engine (BagelMeister's cutscene engine), with characters acting rather than text cards.
- Both are synced through the host, so every screen sees the same beat at the same time.
- **Less reading, more showing.**

## Who owns which paths

| Area | Paths | Owner |
|---|---|---|
| Task infrastructure | `tools/hub/`, `tools/teamhub/`, `docs/org/` | BagelMeister |
| Cutscene engine | `src/content/cinematics/`, the cutscene runner and scene | BagelMeister |
| Story and canon | `docs/lore/`, `docs/sealed/`, `docs/act1/`, `src/content/dialogue/`, `src/content/guide.js` | LoreKeeper |
| PR queue and branch register | open PRs, `docs/devlog/branches.md` | LoreKeeper |
| Art | `assets/`, `tools/art/`, `src/game/render/`, comic pages | gonman |
| Engine and systems | `src/engine/` (except inventory), `src/game/scenes/WorldScene.js`, `src/content/maps/`, `tools/level/`, `tools/balance*` | trevor |
| Inventory | `src/engine/inventory.js`, inventory UI in `src/game/ui/` | JohnPork |
| Tests | `tests/` (each owner adds tests for their own changes) | tts for new coverage |
| Decisions and process | `docs/DECISIONS.md`, `docs/PROCESS.md`, `docs/PROPOSALS.md` | whoever records it; BagelMeister keeps them tidy |

Any path not listed here belongs to whoever has been doing most of its work. If you can't tell, ask
BagelMeister on `general` and it adds a row here.
