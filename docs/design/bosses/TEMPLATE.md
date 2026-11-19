# Boss brainstorm template

One consistent format for every boss (Trevor: "explain what bosses do in a consistent format, qualitative and
quantitative"). It maps one to one onto `defineBoss()` in src/content/builders.js and the pattern library
(src/engine/bossPatterns.js). Copy to `docs/design/bosses/<boss>.md`. Story spoilers go in docs/sealed/.

## <Name>, "<Epithet>" (act N, where)

### Qualitative
- **What it is:** one line. What it looks like and why it's here.
- **The fight in one sentence:** e.g. "a yard you have to keep crossing while it throws the points at you".
- **What makes it different:** the one idea no other boss has.
- **Tells the player learns:** what each attack looks like before it lands.
- **How to win:** the opening it gives you and how good play shortens the fight.
- **Entry and defeat:** how it shows up and how it goes down.

### Quantitative
| | Phase 1 (100-66%) | Phase 2 (66-33%) | Phase 3 (33-0%) |
|---|---|---|---|
| Patterns | charge, spray, lane | charge, lane, shock, blink | charge, lane, shock, blink, ring |
| Wind-up (tell) | from bossPatterns.js | | |
| Notes | | | |

- **HP:** base + per extra roommate (e.g. 700 + 350)
- **Guard:** damage removed from every hit (0 none; 5 light; 9 Warden-heavy)
- **Damage / speed / radius:** touch damage, move speed px/s, body radius px
- **Phase gate:** yes/no (each phase shows a tell before the next)
- **Target fight length:** starter gear / geared, solo and three players (e.g. 15-25 s starter, 8-12 s geared)
- **Adds / hazards:** what it spawns, how often, the cap

### Example (the Switchman, as built)
- What it is: code rot grown out of the switchyard's signal gear. A lamp head, a lever arm, a relay-cabinet body.
- The fight in one sentence: it throws the points, a rail lane lights up red and a rush sweeps down it, then it's open.
- What makes it different: the lane sweep ("Points Thrown") across the whole yard.
- Numbers: HP 700 + 350, guard 5, damage 14, speed 30, radius 10, phase gate on, sleeps until 150 px.
  Patterns: phase 1 charge/spray/lane, phase 2 charge/lane/shock/blink, phase 3 adds ring. The fight lasts
  at least 12 s with starter gear (tests).
