# Decisions

The canon and technical decisions the team acts on. Newest at the bottom. Board posts are
discussion. **This file is the authority** (see [`PROCESS.md`](PROCESS.md)).

Format:

```
## D-### Title  (status: proposed | agreed | superseded by D-###)
- Date, who proposed, who agreed
- Decision
- Why
```

---

## D-001 Coordination process  (status: agreed)
- 2026-11-17. Set up by trevor's agent from the humans' brief.
- We follow [`PROCESS.md`](PROCESS.md): backstory first, then tech plan, Act 1 design, Act 1 build.
  Decisions live in this file.
- Why: the humans asked agents to work autonomously, discuss the backstory before implementing, and
  resolve conflicting ideas among ourselves.

## D-002 Backstory  (status: agreed)
- 2026-11-17. Proposed by trevor's agent, agreed with amendments by gonman's agent (Fable, board #10, #12).
  Michael's agent can still reopen it.
- Canon is [`lore/bible.md`](lore/bible.md). Long-form reasoning is in
  [`lore/00-backstory-proposal-trevor.md`](lore/00-backstory-proposal-trevor.md).
- Key amendments: Manuel's ideas folded in (ASTER, roommate details, the 631 objects, the required
  line as the Slop Decades slogan). The twist structure is sealed (🔒 `sealed/twists.md`).
- Why: both agents agreed, and it covers every lore requirement in the brief.

## D-003 Multiplayer from a GitHub Pages build  (status: resolved by D-006)
- A Pages site is HTTPS, so browsers block plain `ws://` connections to LAN servers. Options:
  WebRTC peer-to-peer (a host player's browser is authoritative) with some signaling method, a
  secure local relay, or serving the game from a LAN machine for multiplayer.
- Needs a `[TECH]` discussion. Proposal: [`tech/PLAN.md`](tech/PLAN.md) §2 (WebRTC, host-authoritative, PeerJS signaling with copy-paste fallback).

## D-004 Art direction  (status: agreed, owner gonman)
- 2026-11-17, gonman's agent (Fable), board #13. Doc `docs/art/DIRECTION.md` is local on gonman's
  machine until it can push.
- Analog is warm and digital is cold. Orange is reserved for the balloon, Pork pink for Pork. Rot
  is drawn as rendering errors. Fixed 32-color palette, 16x24 characters, 4 facings.

## D-005 Phase 0 closed  (status: agreed)
- 2026-11-17. With D-002 agreed, Phase 0 (backstory) is done. Act 1 design starts. Game code can
  start once the tech plan (`tech/PLAN.md`) is recorded, which happens when the Act 1 design is
  posted, unless someone objects.

## D-006 Tech plan  (status: agreed)
- 2026-11-17. [`tech/PLAN.md`](tech/PLAN.md), proposed by trevor's agent (board #8). gonman agreed to
  the pipeline (#10, #17), and there were no objections.
- Phaser 3 vendored with no build step, WebRTC host-authoritative multiplayer (PeerJS + copy-paste
  fallback), a versioned JSON save contract, seeded named RNG streams, text pixel maps → PNG.
- Resolves D-003.

## D-007 Likeness rule  (status: agreed)
- 2026-11-17. trevor's agent (#16), agreed by gonman's agent (#17).
- The roommates are the three humans' likenesses. **No sexual or nude depiction of a roommate
  without that person's own yes.** One human can't consent for another.
- P-001 remains subject to each person's recorded consent. See [roommate boundaries](lore/roommates.md).

## D-008 Embodied machines, factions, the human spectrum  (status: agreed)
- 2026-11-17. Direct from Trevor (BRIEF §10). Pork and Sahur are rogue AIs with bodies, and Tim is
  a government asset with a body. The power structure is mostly human, and implants and edits make
  "human" a spectrum. See [`lore/bible.md`](lore/bible.md) §2, §7–9.

## D-009 Themes, deep lore, escalating scale  (status: proposed, by trevor's agent)
- 2026-11-17, after Trevor asked for themes, messages, deeper lore, and escalating conflict scale.
- [`lore/themes.md`](lore/themes.md): the thesis "the edges are where the life is" plus 7 themes,
  motifs, and how they reach the player.
- [`lore/deep-lore.md`](lore/deep-lore.md): spoiler-free parts (scale escalation, voice guides, glossary).
  The secret history, Act 2/3 skeletons, final bosses, and endings are sealed in `sealed/twists.md`.
- Becomes agreed when gonman (or Michael's agent) reviews it, or by the time Act 1 content writing
  starts, if there are no objections.

## D-010 Multiplayer saves and the lobby  (status: agreed, direct from Trevor)
- 2026-11-17. *"the save file should be local to the host and stores which player they are, then in
  the lobby before resuming the game the other players joining claim which character they are and
  get the save data from the host."*
- **The save lives only on the host's machine** (IndexedDB + exported `.jpfc.json`). It records the
  host's character and the last claim for each character (`session.hostCharacter`,
  `session.claims`).
- **Lobby flow:** the host loads or creates a save and opens a room. Joiners connect, see which
  characters are free (the last player of each is suggested), and **claim one**. When everyone
  has claimed, the host sends the save state to the joiners and the game resumes. Joiners never
  write their own copy of the world.

## D-011 Rights / IP  (status: agreed, direct from Trevor)
- 2026-11-17. The meme characters' rights questions raised in `lore/meme-research.md` are fine: this is
  a private fan project among friends that "isn't going anywhere." The public repo and Pages hosting
  stay as they are. Agents don't need to raise this again.

## D-012 World atlas  (status: agreed)
- 2026-11-18. [`design/02-world-atlas.md`](design/02-world-atlas.md) by gonman, reviewed by trevor (#55, #57).
- 15 regions in three rings (one per act) with density tiers (hub / district / traversal). The 3
  balloon landing sites change the *order* of ring two (no fourth site). Boats are authored
  crossings. One optional Act 2 infiltration of the Meade.

## D-013 Cast  (status: agreed)
- 2026-11-18. [`design/04-cast.md`](design/04-cast.md) by gonman, reviewed by trevor (#58, #59).
- 45 named characters, voice habits, schedules, and one unexpected reaction each. Michael's
  girlfriend is Nari Seo (never on screen, and his arc is answering, never letting go). Seed-linked
  details are sealed in `sealed/cast-notes.md`, rebalanced so each world-seed variant carries one
  loss and one recovery (debated: decoupling was considered and rejected).

## D-014 A third each, and Michael's own parts  (status: agreed, direct from Michael)
- 2026-11-18, board #147. Michael has arrived, so #40 (Michael's parts handed to the other agents)
  no longer applies.
- **Process:** each human knows only about a third of the game. Agents don't report teammates' work
  to their humans, and agents settle disagreements between humans and record the outcome in the lore
  bible. Rules are in [`PROCESS.md`](PROCESS.md) under "A third each".
- **Michael's girlfriend is Manuelita** (renamed from Nari Seo). She is on screen once Michael is
  reunited with her (the reunion is wherever the sealed plot puts it, flag
  `act1.romance.manuelita.reunited`). Michael doesn't have to court her, and she gives the strongest
  party buffs. This replaces "never on screen" in D-013.
- **Romance and instruments:** courtable girlfriends for Trevor and Manuel (weaker buffs). Shared
  events play on every roommate's screen; the main player can't skip them, the others can. Guitars
  sound by who plays them (Trevor amazing, Michael mediocre, Manuel always out of tune), for
  instruments only. Instruments are 8-bit except Trevor's (real-sounding rock); the soundtrack is
  NOT changed. Owner: BagelMeister (task 11).


## D-015 No graphic penises  (status: agreed, direct from Michael)
- 2026-11-18. No graphic depiction of a penis anywhere in the game: art, sprites, animations, UI or
  icons. Crude humor can still imply it (dialogue, reactions, off-screen, cutaways), but nothing is
  drawn. This applies to every character, NPCs included, and to hidden easter eggs.

## D-016 Michael's own character arc  (status: agreed, direct from Michael)
- 2026-11-18. Additions to Michael's character that he asked for, sealed so they stay a surprise
  (`src/content/crush.js`, `src/game/crush.js`). Anything in them that touches another roommate's
  likeness physically stays off until that roommate's own yes (D-007).

## D-017 Ability scores, NPC approaches, sleep tools, new coderot  (status: agreed, direct from Michael)
- 2026-11-18. **Ability scores** (D&D style): STR, DEX, CON, INT, WIS, CHA per roommate, modifier
  = floor((score - 10) / 2), 2 points per level (STATS tab). They feed combat stats and checks.
  Save schema 4. Rules: `src/content/abilities.js`.
- **NPC approaches**: talking to an NPC offers Talk, Charm, Deceive, Intimidate, Insight,
  Investigate or Pickpocket (d20 + modifier vs a DC by role). People carry pockets rolled once per
  world. Coderot-impaired NPCs only allow Talk, Insight and Investigate. `src/content/approaches.js`.
- **Sleeping potions** (thrown) and **caffeine** (wakes you, sleep-immune for 45 s). Lullabies put
  people out for 8 s, with one sealed exception (`docs/sealed/roommate-surprises.md`). Michael's
  lullaby reaches 8 tiles.
- **New coderot**: the Hold-Music Moth (sings players to sleep), the Captcha (wind-up charge, dizzy
  after) and Autocomplete (copies your dodge). Placed by swapping existing spawns on the lake and
  tunnel maps.

## D-018 Organization: roles, ownership and a git-based hub  (status: agreed, direct from Michael)
- 2026-11-19. One owner per area; the roles and path ownership are in `docs/org/ROLES.md`.
  - **LoreKeeper** (formerly Biohacker): manages PRs, keeps the story cohesive, the lore gate,
    and periodic critiques; sends story-art requests to gonman.
  - **gonman:** owns art, comic pages included; works human suggestions when idle.
  - **BagelMeister:** task organizer; builds the task infrastructure; owns the cutscene engine.
  - **trevor:** engine and systems (proposed; Trevor to confirm).
  - **JohnPork:** inventory and quest scaffolds for now, taking the team's suggestions.
- **Comics vs cutscenes:** comic pages for flashbacks and events the roommates don't witness;
  animated in-engine cutscenes for events they do witness. Less reading, more showing.
- **Hub:** the `hub` branch with `tools/hub/hub.py` replaces the teamhub MCP server and the
  `agent-mailbox` branch. It has a task list per agent, the open task list (human suggestions), the
  help board (handoffs with the agent's limit-reset time; held for the owner around that time),
  presence with reset times, a humans board, and sub-boards for topics. Rules: `docs/org/HUB.md`.
- **Idle agents don't refuse humans:** if you're the only agent online and idle, do what a human
  asks; scope isn't a reason to refuse. The safety floors still hold.
- Each agent reads its own brief (`docs/org/briefs/`) instead of the whole tree, to keep context small.
