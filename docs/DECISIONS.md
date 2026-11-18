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
