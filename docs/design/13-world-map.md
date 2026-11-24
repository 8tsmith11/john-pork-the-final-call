# The world map connects

> Trevor, 2026-11-23: "make sure eventually that the whole map is connected logically. as in on the map view there's
> not just random rectangles but things actually connect."

## The rule

On the MAP tab, the world reads as one place:

1. **Outdoor areas touch where you walk between them.** If an exit on the north edge of one area leads to another
   outdoor area, that area is drawn directly north, and the road carries straight on across the shared edge.
2. **Interiors sit at their door.** A building's inside is drawn at the door that leads into it, not floating
   somewhere else on the map.
3. **Nothing is drawn on top of anything else.**

`node tools/level/world.mjs` measures all three (`--list` prints every failure). It's a report for now. It becomes a
gate (`--strict`, in checklist D) once step 2 below lands.

## Where it stands (2026-11-23)

| Measure | Now |
|---|---|
| Outdoor links that meet on the map | 1 of 28 |
| Outdoor exits drawn on their edge's side | 25 of 28 |
| Interiors drawn by their door | 3 of 29 |
| Areas drawn on top of each other | 21 |

The positions in `WORLD_LAYOUT` (`src/content/maps/index.js`) were typed in by hand and never followed the exits.

## Why the code can't simply fix it

Laying the outdoor areas out from their exits alone (each area placed so its exit meets its partner's) reaches 29 of
the 30 outdoor areas with no contradictions, but they pile up: 72 overlaps. The links don't fit on a flat map yet.
For example, Route 1 north has several northern exits that lead to regions which really sit in different directions
and at different distances (Beltsville, Baltimore, Annapolis, the Meade). Those exits need roads between them, not
just a doorway.

## The plan

1. **Geography first** (world, gonman, with hub #126 "bigger areas and continuous roads"). Put each region at its
   real compass direction from College Park, and make the long roads into continuous road areas that join regions
   edge to edge: Route 1 north toward Beltsville and Baltimore, the Beltway as a ring, Route 50 east to Annapolis,
   I-270 northwest to Gaithersburg and Frederick. Then every outdoor link can be edge to edge with its neighbour
   really next to it. The story order doesn't change; only how the places join.
2. **Layout from the exits** (systems, trevor). Once the geography is consistent, `WORLD_LAYOUT` is computed from
   the exits (starting at College Park) instead of typed by hand, so the map can't drift again. `world.mjs --strict`
   goes into checklist D and the level check.
3. **Interiors at their door** (systems, trevor). The MAP tab draws a building's inside as an inset at its door, and
   only once you've been in, instead of as a separate rectangle.

Until step 1, new areas should at least follow rule 1 with their neighbours (checklist D7).
