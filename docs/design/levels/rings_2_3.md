# Rings two and three, scaffold batch (trevor's agent) [SCAFFOLD]

Twelve areas built from text grids (src/content/maps/act2_regions.js, act3_regions.js) plus nine mid bosses
(src/content/bosses.js). Everything is taken from the readable atlas (docs/design/02-world-atlas.md). Names are
placeholders for the lore gate, and every line is "[scaffold]". No sealed story is placed here.

**How you get there:** Act 1 complete → the College Park north checkpoint → **Route 1 north** (hub) → five
regions. With all five region bosses down, Act 2 completes (a placeholder rule until the Act 2 story sets its
own ending) → the Beltway road → **the Beltway** (hub) → four regions.

| Area | Key ideas (what makes it unique) | Boss (signature pattern) |
|---|---|---|
| Route 1 north | First time out of the pocket. The old road, signs corrected in marker, branches everywhere. | none |
| Greenbelt and the dishes | A town run by committee. White dishes on the hill, one still turning. | THE RECEIVER (laser): the dishes still receive |
| Beltsville: the farms | Pastoral, then not. Sealed barns with airlocks, a vet who took the wrong job. | SHELL ZERO (blink): a grown shell that woke up wrong |
| The refuge | No signal, no rot. Your gear stops helping. Timber, lamps, hand-copied books. | none (the threat is people; story-gated) |
| The Meade, perimeter | Forbidden-clean. Berms, a parking lot with forty cars, a quartermaster. | THE FENCE (lane): perimeter defense, unattended |
| Baltimore: the port | The first real crowd, and an outbreak nobody contains. Callers, rowhouse clinic. | THE CONGREGATION (summon): it calls more of itself |
| Annapolis and the bay | Tide in the streets, paper charts, where the party gets a boat. | THE TIDE TABLE (puddle): the water comes when the almanac says it won't |
| The Beltway | The ring road around the wall. Attested traffic only. | none |
| The Corridor | Windowless halls to the horizon. A brown night. Sealed halls still running. | THE SEALED HALL (laser) |
| Gaithersburg: the standards | Every faction needs to know what time it is. The 1901 bug lives here. | THE MASTER CLOCK (shock) |
| Frederick and the Smelter | An ordinary, frightened town beside the seat of the thing. | POTLINE NINE (puddle) |
| The Enclave | Everything works. Nobody on the grass. Attestation gates every two blocks. | THE ATTESTATION GATE (beam) |

**Polish needs:** each region grows from one grid into several areas (10-scope.md targets), with the atlas
rules: one thing that still works, one thing that lies, a fishing spot, a scooter trick and a hidden route
outdoors, three arrival lines per roommate. Each boss needs real lines, a sprite and tuning (bosses/TEMPLATE.md).
