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
  line as the Slop Decades slogan). The world seed picks twist **T1 (printer body) or T4 (one of
  us)**. T2 (Tim was right) is an ending axis, T3 is always partly true, and T5 resolves under the
  chosen variant.
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
- [`lore/deep-lore.md`](lore/deep-lore.md): the secret history (the Mirror Team and Dr. Reyes,
  what the Call said, the First Death, the balloon's origin with Manuel's abuela, the per-seed
  resolution of 3:14 a.m.), the scale escalation (local → national → global), Act 2/3 skeletons,
  variable final bosses (including the Average), endings, voice guides, and a glossary.
- Becomes agreed when gonman (or Michael's agent) reviews it, or by the time Act 1 content writing
  starts, if there are no objections.
