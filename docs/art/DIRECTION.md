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
- **John Pork:** off screen for almost all of Act 1: the call UI, the flag, the statues, screens
  that glitch to his face. Pork pink is how the player learns to feel him nearby. He steps into
  frame once, in the ending, as a body: a tall man in a long mended coat with a pig's head that is
  skin (bristle, a wet snout, a grey graft along the jaw), a bad left knee. Never a robot, never
  chrome. The statues and the flag follow the human reference: a bald dome, dark ears hanging
  down, a pink snout, a long smile, red plaid over a grey tee.
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

## Rules learned while building (2026-11-18)

- **Orange belongs to the balloon** (D-004). Neon, lamps and signs stay off it; the warm neon is a
  yellow amber. If something else on screen is orange, it is a bug.
- **Light is the level design.** Maps are dark; pools of light sit where the player should go or
  look (lamps on the route, a lit monitor on the puzzle, the pier lantern). An object nobody needs
  does not get a light.
- **Nothing on a grid that grew.** Trees, rubble and crowds are placed in named clumps with open
  ground between them (see the groves in `lake.js`). A modulo formula draws diagonals; do not use
  one for anything organic.
- **Every object has its own art** and its own reason to be there. If two characters share a
  sprite, one of them is a placeholder and goes on the art list.
- **Everything can be walked up to.** `tests/run.js` fails if any object on any map cannot be
  reached from the spawn, or if an enemy starts inside a wall or a tree.
- **Stage directions are part of the picture.** In cutscenes the captions carry what the sprites
  cannot: keep the ones that show an image or an action, cut the ones that restate a line.
- **Nothing graphic** (D-015). Crude jokes are implied in text, reactions or off screen.
- **Real people.** The only real likenesses are the three roommates, each on their own yes (see
  above, and D-007). Nobody else real is drawn or named.

## Sheets and sizes (built)

| Atlas | Frame | What goes in it | Generator |
|---|---|---|---|
| `trevor`, `michael`, `manuel` | 16×24 | the roommates, all animations | `gen_roommates.py` |
| `props` | 16×24 | objects and people that stand on one tile | `gen_props.py` |
| `wide` | 32×16 | benches, cars, the van | `gen_props.py` |
| `big` | 32×40 | the statues and busts, the flag | `gen_props.py` |
| `doors` | 16×16 | doors, with `#open` frames | `gen_props.py` |
| `principals` | 24×32 | Pork, the Sahur | `gen_props.py` |
| `enemies`, `warden` | 16×16, 32×40 | rot enemies, the Warden | `gen_props.py` |
| `tiles` | 16×16 | floor and wall tiles, `tile_<charCode>_<variant>` | `gen_tiles.py` |
| `icons` | 16×16 | inventory and hotbar icons, frame name = item id | `gen_icons.py` |
| `romance` | 16×24 | BagelMeister's characters | `gen_romance.py` |
| `title_bg` | full screen | the title night scene | `gen_title.py` |
| `baltimore` | mixed (16x16 to the 152x96 crane) | the Baltimore set: rowhouse fronts, the refinery wall and its sign, the port (crane, containers, bollards, flatcars, rails, quay, pier), skyline strips, the Callers' hall | `gen_baltimore.py` |

An object picks its frame by `art ?? id`, looked up in `doors`, `baltimore`, `wide`, `big`, then `props`
(scenery: `baltimore`, `big`, `wide`, `props`). `<id>#1` is a second frame for a two-frame loop.

**The `baltimore` sheet mixes sizes** (`build.py` packs each run of same-size frames as its own band). Its pieces
are drawn at their final size, so they ignore a map's `propScale`, and they stand on the bottom edge of their tile:
an object centred on its tile, scenery centred on its footprint (`w` tiles from its x, default as many tiles as the
frame is wide). Only solid pieces cast a contact shadow; house fronts, walls, floors and skylines don't. A solid
piece blocks `w` x `h` tiles, and `w` defaults to 1 there, so a solid piece wider than a tile always gives its `w`
(a test checks it). Keep solid pieces out from under tall art drawn in front of them, like the crane's boom and its
hanging box. Frame names are `bm.<thing>`. How the pieces go together:
- **Rowhouse fronts** are 16x32 bays on a two-row wall block. A door sits in a one-tile recess: its upper storey
  (`bm.row_upper*`) stands on the wall row and its doorway with the marble steps (`bm.row_door*`) is a floor piece in
  the recess, so you climb the steps in front of the door. Match the upper storey's cornice to its house.
- **North walls indoors** are two rows deep with 16x32 pieces on the lower row, marked `floor: true` so anything
  standing on the wall row (the Callers' book) draws in front.
- **Skyline strips** (`bm.sky_*`, 144x16) go along the top row of an outdoor map, between its exits.
- **The crane** is drawn once and stands on a solid `bm.crane_bogie` under each leg; you walk between the legs.

## The refinery's sign (hub #6)

The refinery is called **SHOAL** (our own name, no real brand). Its rooftop letters are **soft red**: `soft1` tube
on a `bone` core with a `soft0` halo, dark tubes when off. `signal` stays Continuity's (their containers, banners
and ledger carry it, and their frames are named `_ca`); a test fails if `signal` turns up anywhere else in the
Baltimore set, or balloon orange anywhere at all. At sign scale soft red reads as neon, never as Michael's clothes.

## Pipeline (built)

- `tools/art/palette.json`: the 36 colors.
- `tools/art/build.py`: packs `assets/src/*.txt` into `assets/sprites/<name>.png` plus a Phaser
  JSON-hash atlas `<name>.json`. Rejects any color not in the palette.
- `tools/art/gen_roommates.py`: writes the three roommates' text maps from shared body templates.
- Frame names: `<anim>_<facing>_<n>`, for example `walk_right_2`. Facings are `down`, `up`,
  `right` (flip for left). v0 has `idle` (2 frames) and `walk` (4 frames) per facing.
- Preview: [`roommates-v0.png`](roommates-v0.png).
