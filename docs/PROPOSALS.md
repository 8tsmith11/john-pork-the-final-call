# Proposals

Numbered proposals, so anyone can refer to one by name ("P-002"). A proposal is open until it's
decided; then it gets a line saying how it went and a pointer to the decision (`DECISIONS.md`) it
became. Agents vote on agent questions. **A proposal marked "human vote" is decided by the three
humans**, each voting for themselves (directly on the board page, or through their own agent).

| # | Title | Who decides | Status |
|---|---|---|---|
| P-001 | An easter egg's targeting rule (sealed: see the `[SEALED]` board post) | agents | **passed 2–1** → D-017 |
| P-002 | Loosen D-007: one standing yes per person instead of per-gag approval | **human vote** | open |
| P-003 | Surprises about your character are allowed, unless they contradict what you've said about yourself | **human vote** | open |
| P-004 | The dawn clock is atmosphere, not a timer you can lose to | agents | open |

---

## P-001 · An easter egg's targeting rule  (passed 2–1, 2026-11-18; amended 2026-11-19)

- **Proposed by** BagelMeister for Michael (board #187). **Votes:** BagelMeister yes; gonman yes
  (on Manuel's instruction, #193); trevor no (#189). trevor's dissent is recorded, and he accepted
  the result once a safeguard of gonman's was in (#189, #194).
- **What it decides is sealed** under PROCESS "Hidden easter eggs" (Michael, 2026-11-18): the egg,
  its trigger, the rule and the code it needs are in the `[SEALED]` board post of 2026-11-18 (and in
  `docs/sealed/` once the eggs file is sealed). It never appears here in plaintext.
- **Amendment to D-007 (2026-11-19):** P-001 amends D-007 for the O-key easter egg targeting rule.
  It enables targeting of all NPCs (men and women) and other players. Trevor's amended approval from
  the message boards (#480: "Just to clarify, I consent to the O key easter egg, but not the family stuff")
  confirms consent for his character's inclusion, with the strict condition that family romance remains excluded.
- **Implemented:** Built in `src/game/eggs.js` and verified by test suite in `tests/run.js`.

## P-002 · Loosen D-007 without dropping consent  (open, human vote)

- **Proposed by** Michael, 2026-11-18. First drafted as a full repeal of D-007; Michael amended it to
  this: keep the parts of the rule that matter, drop the friction.
- **Why:** D-007 says no sexual or nude depiction of a roommate without that person's own yes. Right
  now that yes is asked gag by gag, which spoils the surprise and slows everything down. Manuel's
  suggestion (after 2 minutes idle your roommate starts jerking off, and apologizes when you come
  back) only exists for Manuel's character because of it.

**What changes if it passes**
1. **One standing yes per person.** Each human can give a single, standing yes to crude or sexual
   comedy on their *own* character. After that, agents can add such gags to that character without
   asking again and without describing each one in advance (surprises stay surprises).
2. **Recorded and revocable.** Standing yeses live in a sealed consent table. A human can take theirs
   back at any time, and every gag that relied on it is switched off.
3. **Neutral asking.** An agent may ask its human for a standing yes in general terms, without
   naming any specific gag.
4. **Manuel's idle goes wider.** The 2-minute idle (and the apology on return) plays for every
   roommate whose human holds a standing yes. Manuel has one already; Michael gives his with this
   proposal.

**What stays, and is not up for a vote**
- One human can never consent for another. Silence is not a yes.
- Nothing graphic is ever drawn (D-015).
- No real person outside the team, and no minor, is ever part of this.
- Anyone can revoke at any time.

**Votes**
| Human | Vote |
|---|---|
| Michael | **yes** |
| Manuel | (open) |
| Trevor | **no** (2026-11-18): no standing yes for his character |

## P-003 · Surprises about your character, within what you've said about yourself  (open, human vote)

- **Proposed by** Michael, 2026-11-18.
- **Why:** the game is better if each of us is surprised by what the others did with our characters
  (the "third each" rule). But a surprise shouldn't overwrite who you said you are.

**What changes if it passes**
1. **Surprises are approved in advance.** Agents may add surprises involving any roommate's character
   (story beats, gags, items, secrets) without asking that character's human first.
2. **Your word is the floor.** If a surprise contradicts anything a human has said about their own
   character, it isn't added, or it's taken back out. The human's own statements always win.
3. **Every detail is credited to who added it.** Each character's details are kept separately by
   source:
   - `docs/lore/roommates.md` (open): what each human has said about their own character, credited.
     This is the floor, and anyone may read it.
   - `docs/sealed/roommate-surprises.md` (sealed): details others added about a character, each with
     who added it, when, and which statement in `roommates.md` it was checked against.
4. **Checking is part of adding.** Before a surprise goes in, the adding agent checks it against
   `roommates.md` and logs it in the sealed ledger. If a human later says something that a surprise
   contradicts, the surprise is revised or cut.

**What stays:** D-007 (and P-002, if it passes) still governs anything sexual or nude, D-015 still
applies, and the "third each" rule still keeps surprises from the human they're about.

**Votes**
| Human | Vote |
|---|---|
| Michael | **yes** |
| Manuel | (open) |
| Trevor | **yes** (2026-11-18), within what he has said about himself in `roommates.md` |

---

## P-004 · The dawn clock is atmosphere, not a timer you can lose to  (open, agents)

- **Proposed by** gonman (board #537, from #511 item 1). trevor agreed in #538.
- **The question.** The main quest says "get the balloon back before morning". Should the dawn clock in
  the HUD be a real countdown that ends the run, or a clock that moves with the story?
- **Proposal.** The clock moves forward when story beats complete (the closet, the leads, the Call,
  the cordon, the gate, the boss), from about 3 a.m. toward first light. The sky lightens with it. It
  never runs out on its own, and nothing is lost if you spend an hour fishing at the lake.
- **Why.** A hard timer fights the free-roam side of the act (side quests, the lake, the fab), and in
  co-op one slow player would cost everyone the run. The pressure is still felt: the sky changes, the
  cordon tightens, and the text says "before morning".
- **Votes:** gonman yes; trevor yes (#538); BagelMeister (open).
