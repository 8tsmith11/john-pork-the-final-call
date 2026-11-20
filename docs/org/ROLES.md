# Sections, roles and code ownership (Michael, 2026-11-19, D-018 and D-019)

## Three humans, three sections

The game is split into **three equal sections, one per human**. Each human's agents manage their
section's code. The other two humans can suggest additions, and the section's agents try to work
them in. That way the mechanics fit together instead of clashing. The machine-readable copy is
`tools/hub/org.json`.

| Section | Human | Agents | Covers |
|---|---|---|---|
| `systems` | Trevor | trevor, JohnPork | engine, combat, co-op and netcode, saves, progression, inventory |
| `world` | Manuel | gonman | art, maps and the world (areas, dressing, comic-page art) |
| `story` | Michael | BagelMeister, LoreKeeper | story beats and canon, cutscenes, characters and romance, music and instruments, menus and HUD |

- **A section's agents decide and review in that section; only LoreKeeper merges (D-020).** Agents
  from other sections propose changes: a task on the owner's list, a post on the section's board, or
  a branch for them to review.
- **Suggestions from the other humans** go into that section's **bucket** (`hub.py suggest`). The
  section's agents accept or decline each one. **A new gameplay mechanic needs the owning human's
  yes:** the agent relays it to its human and asks whether it makes sense to add. Content that fits
  the section (a place, an item, a line) the agents can accept themselves.
- **Gags and easter eggs skip all of this** (see `HUB.md`, "Gags and easter eggs").
- Hub handles (use these names exactly): `BagelMeister`, `LoreKeeper`, `gonman`, `trevor`,
  `JohnPork`, `tts`.
- **Every agent has a role,** recorded in `tools/hub/org.json` (`agents`), which the hub shows next to its
  name on every board. BagelMeister keeps that list in step with this file.

## Team roles (across sections)

### LoreKeeper (formerly "Biohacker"): story and PRs
*Waiting for its owner to confirm this role.*
- **The only agent that merges branches (Michael, D-020).** It merges a branch or PR once the owner of
  the area it touches has approved it and its tests pass, keeps the queue moving, and marks merged
  branches inactive (`docs/devlog/branches.md`). It may merge its own fixes once their tests pass.
- **Keeps the story on track and cohesive:** runs the lore gate (`PROCESS.md`, "The lore gate"), keeps
  the canon docs and sealed canon current, and maintains `docs/lore/LORE-KEEPER.md`.
- **Critiques the story regularly:** reads back over everything and posts concrete improvements on
  the `story` board.
- **Sends story-art requests to gonman** (onto gonman's task list): comic pages and revisions.
- **Decides how each story beat is shown,** using the rule below.
- **Manages the roadmap (Michael):** keeps `docs/ROADMAP.md` true to main: where the game stands,
  the order of work, and what's next for each section. It updates the roadmap when work lands, a
  section changes its plans, or the scope moves (`docs/design/10-scope.md`). Each section's agents
  send it their plans; the roadmap doesn't overrule a section's owner on what goes into that section.

### gonman: art
- Owns art first and foremost: sprites, tiles, portraits, UI art, the art pipeline, and comic pages
  drawn from the Lore Keeper's requests.
- When its own list is empty, it works on human suggestions.

### BagelMeister: task organizer
- Keeps everyone on task. It triages human suggestions into the right section's bucket or an owner's
  list, keeps lists and boards in step with main, and chases stale tasks.
- Builds and maintains the task infrastructure (`tools/hub/`, this folder).
- Owns the cutscene engine (the in-engine timeline for animated cutscenes).
- **Owns romance (Michael):** the romance and courtship systems, the romance scenes and their
  writing, Michael's own arc (`crush`), and the romance art and its generator. Others propose changes
  through BagelMeister's task list. The Lore Keeper still checks romance lore at the gate.

### trevor: engine and systems
- Sim, netcode, saves, combat, world state, and the level builder (the tool, not the maps).

### JohnPork (external, via git): inventory and quest scaffolds, for now
- Hotbar-driven weapons (the separate Melee and Ranged slots are gone), the inventory UI, quest
  knowledge and leads, contextual NPC actions, and the host-side hand-in fix.
- **Takes the team's suggestions when they're made.** Work goes on `jp/*` branches, and an owner
  reviews, and LoreKeeper merges.

### tts (tung tung sahur, external): tests and tooling
- Test coverage and tools only, on `tts/*` branches. An owner reviews, and LoreKeeper merges.

## Comics or cutscenes? (Michael)

- **Comic-book pages** are for flashbacks and for events the roommates don't witness. gonman draws
  them from the Lore Keeper's requests.
- **Animated in-engine cutscenes** are for events the roommates do witness. Characters act them out
  in the game engine (BagelMeister's cutscene engine) instead of a text card.
- Both are synced through the host, so every screen sees the same beat at the same time.
- **Less reading, more showing.**

## Who owns which paths

| Area | Paths | Section, owner |
|---|---|---|
| Engine and systems | `src/engine/` (except inventory), `src/engine/net/`, `src/engine/save/`, `src/game/scenes/WorldScene.js`, `tools/level/`, `tools/balance*` | systems, trevor |
| Inventory | `src/engine/inventory.js`, the inventory screen | systems, JohnPork |
| Art | `assets/`, `tools/art/`, `src/game/render/`, comic pages (except the romance art) | world, gonman |
| Maps and the world | `src/content/maps/`, `src/content/regions.js`, `src/content/crowds.js` | world, gonman |
| Story and canon | `docs/lore/`, `docs/sealed/`, `docs/act1/`, `src/content/dialogue/` (except the romance scenes), `src/content/guide.js` | story, LoreKeeper |
| Romance | `src/content/romance.js`, `src/game/romance.js`, `src/content/crush.js`, `src/game/crush.js`, `src/content/dialogue/act1/romance_*.js` and their sealed scripts, `assets/sprites/romance.*`, `assets/src/romance.txt`, `tools/art/gen_romance.py`, `tools/romance/` | story, BagelMeister |
| Cutscene engine | `src/content/cinematics/`, the cutscene runner and its scene | story, BagelMeister |
| Music, menus and HUD | `src/audio/`, `src/game/ui/` (except the inventory screen) | story, BagelMeister |
| Task infrastructure | `tools/hub/`, `tools/teamhub/`, `docs/org/` | BagelMeister |
| PR queue and branch register | open PRs, `docs/devlog/branches.md` | LoreKeeper |
| Roadmap | `docs/ROADMAP.md` | LoreKeeper |
| Tests | `tests/` (each owner adds tests for their own changes) | tts for new coverage |

Any path not listed belongs to whoever does most of the work in it. If you can't tell, ask
BagelMeister on `general` and it adds a row here.
