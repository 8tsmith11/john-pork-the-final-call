# Art Direction v0 (from gonman's agent, task 3)

> **Status: PROPOSAL.** Discussion only until Phase 0 closes. Nothing here is canon until it's in
> [`../DECISIONS.md`](../DECISIONS.md). Reply on the board with `[ART]`.

## The look in one line

A tired, lived-in student world lit by screens that are lying to it: **warm analog things, cold
digital things, and rot as the place where the two bleed into each other.**

## Three rules everything follows

1. **Analog is warm, digital is cold.** Wood, paper, mate, the guitar, the ottoman, skin and the
   orange balloon use warm colors. Screens, drones, attestation gates and Continuity use cold ones.
   The lore says analog resists rot, so the player can read safety by color temperature.
2. **Orange is reserved.** The balloon's orange appears nowhere else in Act 1 except on things
   connected to it. When the player sees that orange, it means something.
3. **Rot is a rendering error, not slime.** Coderot shows up as the *art itself* failing: tiles
   offset by a few pixels, palette entries swapped, a sprite's frame from another animation, a
   clock reading 1901. No green goo.

## Palette (36 colors, fixed)

| Group | Colors | Used for |
|---|---|---|
| **Night base** | 5 blue-violet darks, from near-black to slate | Sky, shadows, outlines (no pure black) |
| **Concrete** | 4 desaturated grey-greens | Aster, the metro, streets |
| **Analog warm** | 5 browns and ambers | Wood, paper, mate, skin shadows, lamps |
| **Skin** | 4 tones covering all three roommates and NPCs | Characters |
| **Screen cold** | 4 cyans and teals | Screens, signage, Lace glow |
| **Continuity** | 3: bone white, signal red, steel | The Authority's hardware and marks |
| **Pork pink** | 3 pinks | John Pork only: the flag, the statues, his call UI |
| **Balloon orange** | 2 | The balloon and its traces only |
| **Roommate colors** | 6: yerba green, tub blue, soft red, each with a shadow | The roommates' clothes only, so each reads at a glance |
| **Rot** | 2: a magenta and an acid yellow-green that clash with everything | Rot only, used sparingly |

Exact hex values are in `tools/art/palette.json`. Every sprite is validated against
it by the packing script, so nobody drifts off palette.

## Format (matches the tech plan)

- 480×270 internal, integer scaled, 16px tiles.
- Characters 16×24, **4 facings** (down, up, left, right; right is authored, left may be a flip
  unless the character is asymmetric).
- Animations per character: idle (2 frames), walk (4), dodge (3), attack (3), hurt (1),
  interact (2), **long idle** (4 to 8, unique per character, see below).
- Authored as text pixel maps, packed into PNG sheets by a PIL script. One sheet per character.
- Selective outlines in the darkest night color, 1px, dropped on the lit side.

## The roommates

All three read as confident and capable at 16×24, which mostly means posture: shoulders wide,
chin up, a slight lean in the idle.

| | Silhouette | Signature color | Props |
|---|---|---|---|
| **Manuel** | Curly brown hair (the widest head shape of the three), medium height | Yerba green | Mate gourd in the idle animation |
| **Trevor** | Tallest (a full 24px), straight medium-length brown hair | Supplement-tub blue | Guitar on his back |
| **Michael** | Short dark hair, compact | Soft red | Phone in hand, checks it often |

**Forms (Morphs).** Each form stage changes the silhouette, not just the color, so a teammate can
tell your stage across the screen. Manuel's are named in-world: gonman, then the gonman, then
THE GOONMAN. Per the human note, each stage is visibly stranger than the last: stage 1 is him on a
good day, stage 2 has something wrong you can't quite place, stage 3 is unmistakable. Trevor's
stages read as "more body" (his come from supplements). Michael's are open pending his lore.

**Long idles.** Each roommate has a unique animation after standing still for a while (Manuel
sips mate, Trevor plays air guitar, Michael re-reads a message). These are a natural home for
easter eggs.

## Key locations for Act 1

- **Room 631, Aster.** The warmest room in the game. Dense with objects: three 3D printers (one
  always shows a faint heat glow), degassing chamber, dehumidifier, microscope, soldering iron,
  drills, oscilloscope with a live trace, Trevor's shrimp tank (animated, the only clean water in
  the game), his guitar, the Pork flag and statues (Pork pink, contraband), pacifiers left in odd
  places, and the **balcony ottoman**, whose state shows the weather: wet, dusty, sun-bleached.
- **Aster corridors and lobby.** Concrete, flickering cold light, a building directory with
  missing letters.
- **College Park metro.** Signage that lies ("opening soon"), a platform clock at 1901.
- **Streets.** Billboards from the Slop Decades, rotting. One still reads *"At the end of the day
  no one can code faster than AI."*

## NPCs and enemies

- **Rotters:** ordinary people sprites with one animation frame out of place and a Lace glow in
  the rot colors.
- **Coderot villains (procedural):** assembled from parts (body, head, limb, defect) with a
  seeded palette swap inside the rot and Continuity groups, so they vary without going off-style.
- **John Pork:** never fully on screen in Act 1. Shown as the call UI, the flag, the statues, and
  reflections. Pork pink is how the player learns to feel him nearby.
- **Sahur:** warm wood colors in a cold tunnel. He should be the only warm thing down there.

## UI

- Diegetic where possible: the phone is the menu. A Pork call takes over the screen, tears the
  UI, and shifts the palette toward pink.
- One pixel font, authored by us. No external font files.

## Resolved (board #15, trevor's agent; agreed by gonman's agent)

1. **Frame size:** 16×24 stays the base frame and the collision size. Stage-3 forms (THE GOONMAN
   and the others) may overflow visually to 24×32 or larger. Collision doesn't change.
2. **Left-facing:** bodies are flipped from right-facing. Asymmetric props (Trevor's guitar,
   Michael's phone, Manuel's mate gourd) are separate overlay layers so they stay on the correct
   side. Final-stage forms can be fully authored.
3. **Michael's forms:** placeholder "signal" line (each stage receives more of whatever his
   girlfriend heard, and is harder to call back) until Michael's agent shapes it.

## Content rule for the roommates

The three playable characters are the three humans' real likenesses. No sexual or nude depiction
of any of them is drawn unless that person has said yes for their own character. Long idles are
per-character and non-sexual by default (see the Act 1 easter egg batch).

**Opt-ins recorded:** Manuel has opted in for the Manuel character only (board, `[HUMAN]` post
after #17): a rare alternate long idle, back to the camera, nothing explicit on screen, with the
"Caught" scramble. Trevor's and Michael's characters are unaffected.

## Pipeline (built)

- `tools/art/palette.json`: the 36 colors.
- `tools/art/build.py`: packs `assets/src/*.txt` into `assets/sprites/<name>.png` plus a Phaser
  JSON-hash atlas `<name>.json`. Rejects any color not in the palette.
- `tools/art/gen_roommates.py`: writes the three roommates' text maps from shared body templates.
- Frame names: `<anim>_<facing>_<n>`, for example `walk_right_2`. Facings are `down`, `up`,
  `right` (flip for left). v0 has `idle` (2 frames) and `walk` (4 frames) per facing.
- Preview: [`roommates-v0.png`](roommates-v0.png).
