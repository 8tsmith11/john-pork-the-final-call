# Combat animation and effects

World section, hub task #97 (Trevor, via John Pork). This is the visual direction and the order of work for
weapon swings and shots, the roommates' R abilities, and the V gadgets. It follows `docs/art/DIRECTION.md`
(the palette, "analog is warm, digital is cold") and the existing camera: a 480×270 view, scaled up by whole
numbers. Engine hooks are John Pork's and trevor's; the drawing is ours.

## The goal

In a busy three-player fight, anyone glancing at the screen should be able to tell, for every effect:

1. **Whose** it is: mine, a roommate's, or an enemy's.
2. **What** it does: hurts, controls, protects, supports or scans.
3. **When it ends**, if it lasts.

## Where it stands (main and `jp/jp2-gadget-engineering`, 2026-11-20)

- Everything is drawn with Phaser shapes (circles, lines, little squares) and tweens. That's fine and stays,
  but the colors are hard-coded hex values, and most of them aren't in the palette: `0x6ff2ff` (Ping),
  `0xffe08a` (sparks, Riff), `0x7fb069` and `0xd65db1` (kills), `0xffb347`, `0xffe6ee` (impacts).
- **Swing:** a white 2 px arc plus the weapon's icon sweeping through it. Good bones; nothing says whose swing it is.
- **Hit and kill:** five amber sparks on a hit, a fourteen-square green and magenta burst on a kill, and a damage
  number for every hit by anyone.
- **Shots:** a sound and a small dot in flight (`0xffd27f` for ours, `0xd65db1` for enemies'). No muzzle
  flash, no impact.
- **R abilities:** Riff is an expanding amber ring. Ping is a cyan ring, and a mark jump is a cyan line. The
  Decoy Bust has a sound and its sprite but no arrival effect. Gonman has its own windup and release.
- **Enemy tells:** a magenta circle, which is also a color the kill burst uses for players' kills.
- **Gadget batch (branch):** Power Chord arcs, Mate Rally ring, Focused Ping line, a scan event, and one
  `gadgetCast` event per kind (screen, vector, arc, tether, relay, patch, ground), with `gadgetBlock` when the
  screen stops a shot.
- **Depths** are picked one by one (5450, 5600, 6000, `p.y + 1`), so some effects draw over others at random.

## The rules

1. **Palette only.** Every effect color comes from `tools/art/palette.json` through one shared table, the same
   rule sprites already follow. No new colors.
2. **Owner rim.** Every player effect carries its roommate's signature color as a rim or trail: Manuel
   `yerba1`, Trevor `tub1`, Michael `soft1`. An AI companion uses its roommate's color, since it is that
   roommate. The core of the effect shows what it does (rule 3).
3. **Function colors.**

   | Function | Core colors | Why |
   |---|---|---|
   | Physical hit, impact | `warm4` sparks, a one-frame `bone` flash | Analog is warm |
   | Electric, tech, scans (Ping, arc, tether, scan) | `screen1`, `screen2` | Digital is cold |
   | Protection (Phase Screen) | `steel` with `screen2` scanlines | Hardware |
   | Support (heal, relay) | `bone` pips and plus signs, a `warm3` glow | Care is warm |
   | Rot drained (Ground Loop) | `rot0` specks pulled out and fading | Shows the rot leaving |
   | **Enemy danger** (tells, telegraphs, enemy shots) | `signal`, and `rot0`/`rot1` for rot enemies | Reserved |

   **Players' effects never use `signal` or the rot colors**, and enemies' never use the roommate colors, so
   danger reads instantly. Pork pink stays John Pork's only; balloon orange stays the balloon's.
4. **Shape tells the role.** Attacks are arcs and lines that point somewhere. Control connects two things (a
   line, a tether, a bracket on the target). Support grows out of the user as a ring and lands as pips on each
   ally it reached. Protection sits on the user (a front arc for the screen). Scans sweep a line and leave a
   chevron pointing at what they found. Color is never the only cue.
5. **Timing.** Big moves get at least 80 ms of anticipation. The impact frame is the brightest frame. Damage
   effects are gone in 300 ms. Anything that lasts shows its time left (a ring or arc that shrinks).
6. **Pixel discipline.** Whole-pixel sizes and positions, 1 px lines (2 px for the local player's own swing),
   stepped alpha (1, 0.66, 0.33) instead of smooth fades, no blur or glow filters.
7. **Noise budget.** Your own effects are full strength. Roommates' effects draw at about 70% alpha with fewer
   particles. Damage numbers show for hits you deal and hits you take. Screen shake and flashes are for the
   local player only, and are off under `prefers-reduced-motion`.
8. **Layers.** One set of named depths: ground decals, world effects sorted with the sprites, overlay effects,
   then text.

## Order of work

**P1: current weapons and R abilities** (main, no new engine needed)

1. `src/game/render/fx.js`: the shared palette table, owner rim, named depths, particle budget and
   reduced-motion switch. Port the existing effects to it with the same behavior, so the rest can build on it.
2. Melee: an owner-colored smear trailing the swing for three frames, a spark and a one-frame `bone` flash on
   the enemy that's hit, and a short local-only shake on the third hit of a combo.
3. Hits and kills: use the player palette for hit sparks. Use the enemy palette for the enemy breakup
   on defeat (rot colors for rot enemies, `steel` and `bone` shards for Continuity hardware). Damage
   numbers follow rule 7.
4. Shots: a muzzle flash in the owner's color, a one-frame tracer, a small puff where the shot lands.
5. R abilities: Riff as amber sound rings with a `tub1` rim and small stun marks on what it stunned. Ping as a
   `screen2` ring, a bracket on each marked enemy for as long as the mark lasts (`mk` is already in the
   snapshot), and the jump line. A Decoy Bust that arrives with a puff of dust and a short drop. Gonman checked
   against the palette.
6. Enemy tells moved to `signal` (and rot colors for rot enemies), freeing magenta from the players' side.
7. **Shrug** (trevor, from the enemy poise change, #240): when an enemy shrugs off a light hit during poise or
   while committed to an attack, the sim emits `shrug`. It gets a 1 px `steel` "tink" spark at the contact
   point and no flinch, so players can see the hit landed and was ignored, not that it vanished.
8. **Parry** reads clearly bigger than any ordinary hit: a `bone` ring snapping outward from the contact point,
   two frames of local hitstop and the existing PARRY pop, so a deliberate swing feels earned next to a shrug.

**P2: the nine-gadget batch** (once `jp/jp2-gadget-engineering` lands)

- **Phase Screen:** a `steel` front arc with `screen2` scanlines, a flicker when it blocks a shot, and a
  shrinking edge for its time left.
- **Vector Actuator:** a smear along the lunge and two fading after-images in the owner's color.
- **Arc Splicer:** a jagged 1 px `screen2` bolt with a bright node at each jump, dimmer with each jump.
- **Phase Tether:** a beaded line to the target, then a `screen1` ring at its feet while it's slowed.
- **Overclock Relay:** small ticks rising over each roommate it reached, for as long as it lasts.
- **Patch Mesh:** `bone` microbot pips flying from the user to each roommate, landing as plus signs.
- **Ground Loop:** `rot0` specks drawn out of each roommate it reached, fading as they leave.
- **Helium sniffer and Salvage Array:** a scanline sweep from the user and a chevron pointing at what it found.

**P3:** the alternate R abilities (Power Chord, Mate Rally, Focused Ping), form-stage variants, a palette
pass on boss arenas, and encounter effects developed with their owners.

## Engine hooks (asks for John Pork and trevor)

Most of what's needed is already in the events and the snapshot. To draw the rest:

- **Owner on every player event.** Most carry `id`. `gadgetBlock` doesn't yet: add the shielded player's id.
- **Lasting states in the snapshot**, so every screen can show time left: a slowed enemy (`slowT`), and the
  gadget timers (`screenT`, `relayT`) on players. Marks (`mk`) and stagger (`h`) are already there.
- **Shot endpoints.** `shot` with its start and its direction (or end point), so the tracer and the impact
  puff land where the shot really went.
- **The third combo hit.** `swing` already carries `combo`; keep it.

## Art assets

Most effects stay drawn in code (they scale with reach and radius). A small `fx` sheet, made by a
`tools/art/gen_fx.py` and checked against the palette like every other sheet, holds the pieces that read
better as pixels: a four-frame spark, the swing smear, the Ping bracket, stun marks, a dust puff, plus-sign
pips, bolt segments and the scan chevron.
