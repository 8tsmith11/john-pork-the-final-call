# 12 · Engineering: balance and the assembly model (systems review)

Status: **proposal for review** (trevor, engine and systems; Trevor asked for this review on 2026-11-20). It
answers general #222's request for "balance and the assembly model" and builds on `09-engineering-room.md` and
John Pork 2's draft (`jp/jp2-gadget-engineering`). Spoiler-free: which parts are found where belongs to story and
world. Implementation of the first batch stays with John Pork (hub #90); this is the frame it can be built
against, with numbers the tests can check.

## 1. Where gadgets sit in a fight

A roommate has three things to press: the weapon in hand (always on), R (their own move, ~8-20 s), and V (the
gadget). V must matter without becoming the fight. The yardstick is **effect value per minute** against a
starter weapon's sustained output: the pry bar is about 27 damage per second at full commitment (11 per swing,
a 0.4 s rhythm). Rules:

- **Damage gadgets** deliver **10-20%** of a starter weapon's sustained damage per second, averaged over their
  cooldown. Arc Splicer in the draft: 18 + 12 + 8 over 9 s is about 4.2 per second, about 15%. Good.
- **Defense and control gadgets** cover **15-25% uptime** of their effect. Phase Screen: 2.2 s per 12 s is 18%.
  Phase Tether: 3 s per 11 s is 27%, slightly high: make it 12 s.
- **Support gadgets** heal or clean up no more than **one enemy hit per 10 s** per roommate. Patch Mesh: 16 per
  24 s for each roommate in range is fine. Ground Loop: 8 code rot per 20 s is fine.
- **Mobility gadgets** must do something the dodge can't, or they lose to it. The dodge is cheap and fast. As
  drafted, Vector Actuator (48 px per 10 s, no protection) is a worse dodge. Give it one property the dodge
  lacks: it crosses a gap or hazard tile, or it shoves the first enemy it meets (poise rules apply).
- **Field instruments** (sniffer, Salvage Array, later the Triangulator and the Fault Reader) have no
  cooldown and never touch combat numbers. Their value is information on authored hooks.

**Nothing may undo the combat fix** (general #240): no gadget stagger-locks. Gadget hits respect enemy poise
like light hits, and only a gadget whose whole point is control (Tether, Ion Net) can override it, and only for
its stated duration.

## 2. Tuning and rolls: keep the stack bounded

The draft has two Fab tunings and two gadget affixes:

| Option | Cooldown | Effect | Value per minute |
| --- | --- | --- | --- |
| Fast cycle | -15% | -12% | x1.035 |
| High output | +12% | +18% | x1.054 |
| insulated (affix) | -4 to -9% | | up to x1.10 |
| buffered (affix) | | +5 to +12% | up to x1.12 |

The worst cases stack to about **x1.16** (fast cycle plus insulated, or high output plus buffered). That's
fine, but it should be a rule, not luck:

- **Cap:** total gadget value per minute from tuning plus affixes is at most **x1.20**.
- **Cooldown floor:** at least **60%** of base. Effect is capped at **+35%** of base.
- **Tunings are real choices, not upgrades:** fast cycle suits gadgets you use often (Screen, Tether), high
  output suits gadgets where one big use decides it (Patch Mesh, Arc). The Fab shows the before and after of
  both numbers before it spends anything (as the doc says).
- Tests: every roll plus every tuning stays inside the caps (a sweep over seeds, like `gearRolls` today).

## 3. Co-op stacking

Three roommates with three Patch Meshes would triple healing. So the rule is that **the same kind of effect on
the same target doesn't stack: the strongest applies and the rest refresh its duration.** Different kinds
stack freely, which pushes a party toward three different gadgets. Host-authoritative as usual: the host runs
cooldowns and effects, a guest's V reaches the host's next step, and swapping gadgets keeps each item's own
cooldown on the item (no swap to dodge a cooldown).

## 4. The assembly model (the larger bench)

A built gadget, tool or weapon attachment is four parts. Each part is data with a few numbers, and every
number the player sees comes from them by a formula they can read.

| Part | What it decides | Numbers |
| --- | --- | --- |
| **Frame** | what it is held as, what fits, handling | capacity (weight it carries), handling (aim time, slow while used), mounts |
| **Power** | how often and how much in a row | capacity C, recharge rate R |
| **Payload** | what it does | effect kind, base magnitude, cost per use |
| **Control** | how reliably it does it | precision, glitch chance |

Derived, shown before printing:

- **cooldown** = payload cost / R (the floor from section 2 still applies)
- **charges in a row** = floor(C / payload cost), at least 1
- **effect** = payload base x frame multiplier x tuning
- **handling** = frame handling, worsened if total part weight is over 75% of the frame's capacity
- a build is **legal** only if total weight is at most the frame's capacity and the payload fits a mount

Real tradeoffs fall out of that without special cases: a big cell on a light frame gives two charges but
clumsy handling; a hand-crank dynamo (world's no-battery option) has tiny C and slow R but never runs out in a
blackout; a heavy frame takes the big payloads but slows you while firing.

**Control** is where the world gives the best tradeoff (gonman, general #228). An **auto-written controller** is
cheap and quick to get, but it rots: a small glitch chance per use (3%) that grows with use until it's
serviced, which is the game's own premise. A glitch costs the use or delays it 0.5 s, never something worse.
A **hand-checked board** is slow to get (the lab 245 bench, or a hand-checked schematic) and never rots, with a
little more precision. That makes the 245 bench and hand-checked files worth chasing without new lore.

**Schematics** gate which parts you can choose. You learn them by studying salvage, finishing an authored job,
or diagnosing a damaged machine (world picks the places, story picks the timing). A schematic is per party,
like a quest flag, so co-op shares what anyone learned.

**Fit and repair.** Parts come back out at the bench (the station's "come back out" rule from the mod
sockets). A saved build is a pattern: rebuilding it costs only the materials, no re-design.

**Save.** A built item stores `{ frame, power, payload, control, tol }` on its stack, where `tol` is the
seeded tolerance (world seed + recipe + count), the same shape as today's rolled items. It needs one schema bump
when it lands, with a migration that leaves today's items untouched.

## 5. A first parts list (to tune in play)

| Frames | Capacity | Handling |
| --- | --- | --- |
| Bracket (scrap brackets) | 3 | quick |
| Conduit rig | 5 | normal |
| Deck mount (a scooter deck) | 8 | heavy, slows while firing |

| Power | C | R per s |
| --- | --- | --- |
| Battery cell | 4 | 0.4 |
| Scooter pack | 8 | 0.5 (heavier: weight 2) |
| WMATA fuse bank | 3 | 0.8 |
| Hand-crank dynamo | 2 | 0.25, never empty |

| Payloads | Cost | Base | Weight |
| --- | --- | --- | --- |
| Arc coil (copper) | 4 | 18 damage, jumps 2 | 1 |
| Helium burst | 3 | knockback cone | 1 |
| Coderot gel | 5 | slow field 3 s | 2 |
| Lens array | 2 | reveal/scan | 1 |

So, for example: Bracket + Battery cell + Arc coil gives a 10 s cooldown, 1 charge and 18 damage (about Arc
Splicer). Conduit + Scooter pack + Arc coil gives 8 s, 2 charges, but normal handling.

## 6. What I'll build, what I'll review

- I'll review John Pork's first-batch PR against sections 1-3 and add the caps and the non-stacking rule if
  they aren't in it.
- Once the first batch lands and plays well, I can build the assembly engine (section 4: part data, the derived
  stats, legality, save shape and tests). Story and world fill in schematics and places.
- Feedback welcome on the numbers. They're starting points for play, not final.
