# Baltimore 2098: research brief for the Act 2 port

Michael asked the world section for a research brief on Baltimore (hub #12) before we build its
Act 2 maps. This brief covers the real city first: its harbor and port, its industry, rowhouse blocks,
neighborhoods, landmarks, transit and skyline. Then it says how each could plausibly look in 2098,
where Baltimore is the Act 2 outbreak that nobody contains. It ends with map hooks and art hooks the
world section can build, mapped onto `src/content/maps/districts.js`, the Baltimore maps in
`act2_regions.js` and `act2_more.js`, and the atlas entry (`docs/design/02-world-atlas.md` §10).
Spoiler-free.

**Sources, and how much to trust them.** Government and agency pages (the port administration,
the state transportation authority, the National Park Service, the Census) are marked *(gov)*.
Preservation groups, museums and the state's historical trust are marked *(heritage)*. News is
marked *(news)*, and Wikipedia *(wiki)*. Where sources disagree, the brief gives the range or says
so. Anything not checked is marked **unverified**. Links are at the end.

## Summary

1. **Baltimore is a working harbor city with a tourist harbor inside it.** The Inner Harbor is the
   tourist face. The working port sits downstream at Locust Point, Canton, Dundalk and Fairfield,
   with container cranes about 450 ft tall.
2. **Two landmarks do most of the work in pixel art:** the red refinery sign over the water (1951,
   70 by 120 ft), and the container cranes. The atlas already leans on both.
3. **Rowhouses are the city's grain:** brick fronts in long rows, white marble steps that people
   still scrub, formstone, and painted window screens that let you see out while nobody sees in.
   The screens are the best single art hook in this brief, because a 2098 version hides people
   from drone cameras.
4. **The water is coming up.** The state's 2023 projection for Baltimore is about 2.4 ft above 2005
   by 2090 and 2.7 ft by 2100 (median). Lower Fells Point and the Inner Harbor promenade already
   flood at high tide several times a year. In 2098 they flood far more often.
5. **The rail line from College Park goes straight there.** The Camden Line stops at College Park
   and ends at Camden Station beside the harbor. That gives the party a real way in by train.
6. **The code rot hood should be picked on wiring.** In our canon, code rot takes lace-connected
   people and networked things, so the outbreak's heart belongs in Baltimore's newest, most wired
   district. My first pick is the Port Covington peninsula. Locust Point and the container
   terminals come next. Section 4 has the reasoning.
7. **The cautions are heavy here.** They cover a recent bridge collapse that killed six workers,
   the country's highest big-city overdose death rate, vacancy and displacement history,
   environmental-justice fights, and TV-drama stereotypes. Section 9 has a table, in the same
   format as `docs/lore/meme-research.md` §7.

## 1. The harbor and the port

### Today

- **The Inner Harbor** is the old basin at the head of the harbor's Northwest Branch, ringed by a
  brick promenade. It has the pavilions, now being redeveloped (two residential towers and a park
  building are planned; as of October 2026 the timeline is unclear and the plan faces a court
  challenge) *(news)*. It also has the five-sided World Trade Center and the old Pratt Street power
  plant with its four smokestacks (built 1900 to 1909, converted to entertainment in the 1980s)
  *(heritage, wiki)*.
- **The port administration works out of the five-sided tower.** The Maryland Port Administration's
  address is the World Trade Center, 401 E. Pratt Street. The building is billed as the world's
  tallest pentagonal building, with a public observation level on the 27th floor *(gov)*. Reports in
  2026 conflict on whether that deck stays open *(news)*.
- **Public marine terminals** *(gov; acreage varies by source)*:
  - Dundalk, about 570 acres: containers, roll-on/roll-off, autos, farm and construction machinery.
  - Seagirt, about 275 to 320 acres: the container terminal, run by a private operator under a
    50-year concession. It has two 50-ft berths and 11 cranes, 8 of them Neo-Panamax, reaching 22
    containers across. The newest four arrived in 2021, each about 450 ft tall and about 1,740 tons.
  - South Locust Point, about 80 acres: general cargo, and the cruise terminal.
  - Fairfield and Masonville: autos.
- **Autos and machinery.** The state calls Baltimore the nation's top port for roll-on/roll-off cargo
  and, in the years its manual reports, for autos and light trucks *(gov)*.
- **Two tunnels go under the harbor.** The Harbor Tunnel (1957, four lanes) and the Fort McHenry
  Tunnel (1985, eight lanes, about 1.4 miles, linking Locust Point and Canton just south of the fort)
  *(gov)*. The I-95 crossing was planned as a bridge, and became a tunnel because a bridge would have
  hurt the fort's status as a national monument.
- **The Key Bridge** carried the outer harbor crossing until a container ship struck it on 26 March
  2024. Six construction workers died. The state's latest estimate (November 2025) puts the
  replacement at $4.3 to 5.2 billion, open to traffic in late 2030 *(gov, news)*. See Cautions.
- **Immigration.** From 1868 to 1914, transatlantic steamers landed immigrants at Locust Point, at
  piers built by the railroad next to its terminal. One estimate is 1.2 million arrivals *(heritage;
  the count is a single secondary estimate)*.

### In 2098

- The terminals still run, because Continuity needs the port. The cranes are driven by a terminal
  system, and the people on the quay are dockhand shells with a union (atlas §10). Code rot in the
  terminal system shows as cranes that pick the wrong box, stack it, and pick it again.
- The container stacks hold people, as the atlas says. The plausible part: retired boxes get stacked
  on dead berths, while the live berths keep moving.
- The Inner Harbor promenade floods at most high tides (section 6). The old pavilions, or whatever
  replaced them, have sandbag walls and a painted tide line.
- The five-sided tower keeps the port authority, with Continuity flags at the door (scaffold
  `bmore_authority`). Its observation level looks over the whole harbor, which makes it a map-reveal
  spot.
- The replacement Key Bridge stands, seventy years old, on the horizon. It is never shown broken.

## 2. Industry

| Site | What's real | 2098 hook |
|---|---|---|
| **The sugar refinery**, Locust Point | Opened April 1922 on about 21 acres; the last of Baltimore's six refineries *(news, heritage)*. About 42 ships a year bring raw cane sugar; a conveyor runs from the dock to a weigh house and a raw sugar shed holding up to 85 million lb *(heritage)*. Four new silos went up in 2022 *(news)*. About 6.5 to 7 million lb a day *(news; figures vary)* | Still running. The sign is the city's compass (scaffold switch: "People navigate by it"). Inside: ship unloaders, a conveyor you cross under, and a shed with sugar banked like dunes |
| **The sign** | Lit 1951, 70 ft high and 120 ft wide; once about 650 neon tubes; unplugged in the 1970s energy crisis; rebuilt in LED and relit 4 July 2021 *(news)* | The atlas's "lit red over the water". One letter flickers (scaffold). A landmark you can see from the hub map |
| **Steel**, Sparrows Point (county, east) | Once called the world's largest steel mill, about 30,000 workers at its peak; closed 2012; now a logistics park *(wiki, news)* | Warehouses run by machines: a second candidate for where code rot spreads, outside the city map |
| **Canneries**, Canton | More than 100 packing houses by 1870 (oysters in winter, produce in summer); a can works from 1895, later the American Can Company, now lofts *(heritage, Smithsonian)* | Brick cannery shells with tall stacks; stall rows inside. Good bones for the Callers' hall, or for a market |
| **Spice plant**, Light Street | A spice company's factory and offices stood on the Inner Harbor from 1920 to 1989, and the harbor smelled of cinnamon *(heritage)* | A memory line for an old NPC. Smell is free to write and costs no art |
| **Mills**, Jones Falls valley (Hampden, Woodberry) | Stone mill villages along the stream; by 1899 the merged mills controlled about 80% of the world's cotton duck (sailcloth) *(heritage)* | An analog district in the city: mill races, stone duplexes. A natural Analogist outpost |
| **Power plant**, Pratt Street | Four stacks on the Inner Harbor skyline, built to power the streetcars *(heritage)* | Skyline silhouette. In 2098 its stacks could smoke again, feeding the port |
| **Incinerator**, Westport | A white stack with BALTIMORE lettered down it, visible from I-95 since 1985; the city's largest stationary source of industrial air pollution, under an EPA civil-rights complaint *(news)* | A skyline landmark only. See Cautions |
| **Coal terminal**, Curtis Bay | A 2021 explosion blanketed homes with coal dust; residents have fought the terminal for years *(news)* | Keep out of the story. See Cautions |
| **Rail shops**, Mount Clare | The B&O's shops, birthplace of the first US commercial railroad (1827). A 22-sided 1884 roundhouse, about 235 to 245 ft across, with a 60-ft turntable; half its roof fell in under snow in 2003 *(heritage)* | A boss arena: a round hall with a turntable at the center that turns the floor |

## 3. Rowhouse blocks

### Today

- **Brick rows.** Most of the city is rowhouses: brick fronts sharing party walls, long blocks with
  alleys behind *(heritage)*.
- **White marble steps.** They came mainly from Beaver Dam marble (one estimate says 60%). Scrubbing
  them, with pumice and scouring powder, was a household routine. Marble use declined after the
  1920s *(heritage, news)*. The scaffold already uses this: "Scrubbed white this morning. Outbreak
  or no outbreak."
- **Formstone.** A stucco imitation of stone, marketed as a low-maintenance front and common by the
  1950s, and strongly associated with Baltimore. Its preservation status is still argued over
  *(wiki, news)*.
- **Painted screens.** Window and door screens painted with scenes (a red-roofed cottage by a lake
  is the classic). They let light and air in and let you see out, but the street can't see in.
  Baltimore's tradition started in 1913 (the craft is older, from 18th-century London), and at its
  mid-century peak 100,000 to 200,000 windows had them *(heritage)*.
- **Murals** on blank end walls: **unverified** for this brief; check photos before relying on it.

### In 2098

- **Painted screens beat cameras.** That is the "one thing that still works" in rowhouse
  Baltimore: abatement drones see a lake and a cottage, never the room behind it. Painters are
  trusted people, and a screen is a gift.
- The steps are still scrubbed, as a habit and a statement. Formstone still argues with brick.
- Some houses are boarded. Boarded houses can appear, but never as a shorthand for a community
  (see Cautions). Our canon says code rot has less to take where people have no lace, which suggests
  the old analog blocks hold out longer (a suggestion, not canon).

## 4. Neighborhoods, and where the code rot hood goes

### A shortlist of neighborhoods

| Neighborhood | What's real | 2098 read | Use |
|---|---|---|---|
| **Inner Harbor** | The basin, the promenade, the five-sided tower, the power plant, the pavilions *(gov, news)* | Tourist face gone tidal; Continuity's front office | The hub (`baltimore`) |
| **Federal Hill** | A hill park looking north over the harbor; rowhouses behind it (**unverified** beyond common knowledge) | Lookout; the scooter run down to the water | Edge of the hub, or `bmore_rows` |
| **Locust Point** | A peninsula: rowhouses along Fort Avenue, the refinery on its north shore, the South Locust Point terminal, the star fort at the tip, the 1868 to 1914 immigration piers *(gov, heritage)* | The port's own neighborhood; the refinery's people | `bmore_rows`, `bmore_refinery`; a code rot hood candidate |
| **Fells Point** | Laid out in the 1760s; up to 18 shipyards; Belgian-block streets; more than 300 buildings on the National Register; Thames Street floods at high tide *(heritage, news)* | Tide in the streets; tugs and water taxis; a market | New map `bmore_fells` |
| **Canton** | Cannery district turned lofts; waterfront park; next to the Seagirt terminal; the I-95 tunnel comes up here *(heritage, gov)* | Lofts against the container stacks | Edge of `bmore_stacks` |
| **Port Covington ("Baltimore Peninsula")** | A railroad terminal from 1904; a bulk rail yard to 1990; a newspaper printing plant (1992); a large mixed-use redevelopment since 2016, renamed in 2022. Cut off from nearby rowhouses by I-95, rail lines and rail yards *(wiki, gov)* | The newest, most wired district in the city | Code rot hood, first pick |
| **Mount Vernon** | A 178-ft column monument (1815 to 1829) and a library hall with five tiers of cast-iron balconies under a 61-ft skylight (1878) *(heritage, wiki)* | An Archivist reading room | New map later |
| **Hampden and Woodberry** | Jones Falls mill villages (section 2) | Analog district | New map later |
| **Patterson Park** | A park with a 60-ft octagonal, four-storey observatory (1891 to 1892) built as a lookout over the city *(wiki, heritage)* | A climb for a view; a signal tower | Small hook |
| **Druid Hill Park** | A glass palm house, opened 1888, with 50-ft glass walls *(heritage)* | The warmest green room in the city | Small hook |
| **Pigtown** | Named for 19th-century hogs driven from B&O cars to slaughterhouses; residents kept the name, and the pig is a local symbol *(heritage, wiki)* | A John Pork nod, lightly | One sign at most (see Cautions) |

### The code rot hood: candidates

The rule from our canon (`docs/lore/bible.md`, "Pockets and zones"): code rot takes lace-connected
people and networked things; zones still hold people with no lace, because the rot has less to take.
So the heart of the outbreak should be where Baltimore is most wired. Picking on geography and wiring
also keeps the choice away from real communities.

1. **Port Covington, "the Peninsula" (recommended).**
   - Why it fits (our extrapolation): by 2098 it is the oldest of the city's "smart district"
     builds, so it is the densest in networked buildings and lace. That makes it plausible as the
     first place to tip from pocket to zone.
   - Geography: water on three sides (the Middle Branch). On the land side it is walled off by I-95
     and rail yards, so the cordon had only a few underpasses to hold, and the map can show where
     it failed.
   - It sits next to Locust Point, so the outbreak spreads into the refinery's neighborhood. That
     ties it to maps we already have.
   - Caution: it is a real development by a real company today. Give it a 2098 in-world name, and
     never name or mock the developer or its brand.
2. **Locust Point.**
   - Why it fits: a peninsula with one main street (Fort Avenue). The automated terminal at its tip
     is the source, and the rowhouses between the terminal and the city are the line that holds or
     breaks.
   - It uses the scaffold as it stands: `bmore_rows` and `bmore_refinery`.
   - Caution: it is a long-standing residential neighborhood. Make the source the machines, and make
     the residents the people holding the line.
3. **The container terminals (Seagirt and Dundalk).**
   - Why it fits: cranes, carriers and gates are all run by one system, which matches the bestiary's
     "a dockhand in a loop".
   - The atlas's stacks community is a 2098 invention, so no real community is implied. Put the rot's
     heart in the terminal system, not in the people who live in the boxes, or it reads as "poor
     people are the disease".

**Not recommended:**
- Any residential neighborhood that real-world coverage ties to vacancy, policing or crime.
- Curtis Bay and Westport. They look industrial on a map, but they are places where residents are
  fighting real pollution (Cautions).
- The Inner Harbor itself. It is the hub, and it needs to stay walkable and full of talk.

## 5. Transit and skyline

### Transit, today and in 2098

| Line | Real | 2098 |
|---|---|---|
| **MARC Camden Line** | About 39 miles of CSX track from Washington Union Station to Camden Station, with stops at Greenbelt and **College Park**; weekday rush hours only, in the timetables checked *(gov, wiki)* | The party's train. Arrives at Camden Station beside the long brick warehouse (1,116 ft, built 1899 to 1905, claimed as the longest brick building on the East Coast) *(heritage, wiki)* |
| **Light rail** | North-south line, 33 stations, opened in stages from 1992 *(news, wiki)* | Mostly runs, like College Park's Green Line |
| **Metro subway** | One line, 14 stations, about 15 miles, opened 1983 *(news, wiki)* | Flooded at its low end, or sealed |
| **Red Line** | An east-west line cancelled in 2015, revived in 2023, still in planning in 2026 with its mode reopened *(news, gov)* | Don't reuse the Purple Line's "opening soon" gag. One per game is enough |
| **Water taxis** | Free city commuter boats link Fells Point, Canton, Locust Point, the Inner Harbor and Federal Hill *(gov)* | Fast travel inside Baltimore: a boat network between landings |
| **Freight tunnel** | The 8,700-ft Howard Street rail tunnel under downtown, rebuilt for double-stack trains; a chemical train fire closed downtown in 2001 *(news, wiki)* | A hidden way in from the rail yards |
| **Buried stream** | The Jones Falls runs in a conduit under downtown, completed around 1914 to 1915, from near Penn Station to the Inner Harbor, with a street built in its old bed *(heritage)* | The hidden route: three concrete tubes, with the rot vermin from the bestiary |

### Skyline (silhouettes to keep)

| Shape | Real | Note |
|---|---|---|
| Tallest tower | 100 Light Street, 529 ft, 1973 *(wiki)* | Background only |
| Deco tower | 10 Light Street, about 509 ft, finished 1929 *(heritage, wiki)* | The crown is the one to draw |
| Clock tower | 289 ft, 1911; four 24-ft faces with **twelve letters instead of numbers**; once billed as the largest four-dial gravity-driven clock *(wiki, heritage)* | Best "thing that still works": a clock with no chip that doesn't say 1901 |
| Five-sided tower | The port administration's building, 27th-floor observation level *(gov)* | Readable at 16 px if drawn as a pentagon from above |
| Power plant | Four stacks *(heritage)* | Four stacks read instantly |
| Shot tower | Brick, 1828, about 215 to 234 ft; the tallest US structure until 1846 *(heritage, wiki)* | A round brick chimney-tower |
| Column monument | 178 ft, 1815 to 1829 *(wiki)* | Draw the figure on top as unreadable at this scale |
| Cranes | About 450 ft *(gov)* | The real skyline of the working harbor |
| The red sign | 70 by 120 ft *(news)* | At water level, across the harbor |

## 6. Water and climate

- **Sea level.** The state's 2023 projections for Baltimore, Current Commitments scenario, measured
  from 2005 *(gov, Table 2)*:

  | Year | Likely to exceed | Best estimate | Unlikely to exceed | Low-probability high end |
  |---|---|---|---|---|
  | 2050 | 0.9 ft | 1.2 ft | 1.5 ft | 1.6 ft |
  | 2090 | 1.9 ft | 2.4 ft | 3.1 ft | 4.3 ft |
  | 2100 | 2.0 ft | 2.7 ft | 3.5 ft | 4.9 ft |

  For 2098, the median is about 2.6 ft, and a high case is about 3.5 ft.
- **Today's flooding.** The east end of Thames Street (Fells Point) and the Inner Harbor promenade
  flood at high tide several times a year without a storm. NOAA projected 50 to 160 such events a
  year by 2050 *(news, 2018)*. Tropical Storm Isabel (2003) put up to 8 ft of water into the Inner
  Harbor area *(news)*. A federal plan focuses on protecting the harbor tunnels *(news)*.
- **What that means for 2098** (our extrapolation): with about 2.6 ft more sea, flooding at ordinary
  high tides becomes routine in lower Fells Point and on the promenade. The tunnels have floodgates.
  A wall of painted high-water lines with years (2003 among them) shows the trend without a word.
  This matches the atlas's Annapolis ("the tide in its streets twice a day").
- **City size.** The city peaked at about 950,000 people in 1950 and had 568,271 in 2024 *(gov)*.
  It was built for far more people than it holds. In 2098 that spare room is where the people from
  the zones crowd in, which fits the atlas's "the first real crowd the party has seen".
- **The 1904 fire** burned about 140 acres and roughly 1,500 buildings downtown. The city rebuilt
  within about two years, with wider streets as firebreaks *(heritage, wiki)*. That is useful as
  deep history for a city that has come back before.

## 7. Map hooks

### The atlas entry, anchored

| Atlas §10 line | Real anchor | Where it lives |
|---|---|---|
| "Cranes" | Seagirt's Neo-Panamax cranes | `bmore_stacks` quay; hub skyline |
| "Rowhouses with marble steps" | Locust Point and Federal Hill rows | `bmore_rows`, hub south half |
| "A sugar refinery sign still lit red over the water" | The Locust Point refinery sign | Hub east edge; `bmore_refinery` roof |
| "Container stacks with whole neighborhoods living in them" | Retired boxes on dead berths at Seagirt or Dundalk | `bmore_stacks` |
| "Continuity holds the port authority" | The port administration in the five-sided tower | `bmore_authority` |
| "The Callers hold the streets" | No real anchor; keep it fictional | `bmore_hall` (see below) |
| "Dockhand shells have a union" | The working terminals | `bmore_stacks` steward |
| "A doctor running a clinic out of a rowhouse" | Rowhouse plan: narrow and deep | `bmore_clinic` |
| *(missing)* Getting around | Water taxis; the buried stream | Suggest adding: "On foot and by water taxi. **Shortcut:** the old stream tunnel under downtown." |

### The scaffold maps, one by one

| Map | Stands for | Layout changes | Landmarks and props |
|---|---|---|---|
| `baltimore` (hub) | Inner Harbor, south shore | Keep the water north. Put the refinery sign on the east horizon as drawn scenery, with the existing board as the spot to read it from. Swap a few pier tiles at the water's edge for shallow water, add sandbags, and paint a tide line on the pier wall. If the map grows north, add the far shore: the five-sided tower and the four stacks | Water-taxi landing (fast travel); a high-water wall; the trash wheel stand-in at a stream mouth (section 8) |
| `bmore_rows` | Locust Point rowhouses on Fort Avenue | Real rows have no gaps: make the fronts continuous, with an alley row behind (gravel or pavers) and a corner store at each end. Give every door a marble stoop. Put the mural on a blank end wall. Mix in formstone fronts | Painted screens on some windows; a marble stoop per house; a scrubbing bucket |
| `bmore_refinery` | The sugar refinery | Replace the four degasser pairs with round silos and one long conveyor that crosses the room. Put the dock and unloader at one edge, and a raw sugar shed with banked sugar. Raise the sign boss (`boss.bmore_sign`) to a roof level | Unloader, conveyor, weigh house, silos, sugar banks, the sign's switch |
| `bmore_hall` | The Callers' hall | Never a real church, synagogue or mosque. Best fit: an old market shed (the city's main market has run since 1782, the longest-running public market in the US) or a cannery floor, where stall frames become the pews | Stall frames; a hand-painted Pork banner; the book |
| `bmore_authority` | The five-sided tower | A pentagon floor (diagonal walls), desks in rings, and a window wall onto the harbor. The 27th-floor deck can be a second floor for the map reveal. In reality it is on the north shore, so the water taxi is a better link than the street | Ledger; Continuity flags; a harbor-view window |
| `bmore_stacks` | Seagirt or Dundalk | Put the quay on the water edge, with crane portals you can walk under. Lay stack blocks in rows with straddle lanes between. Retired blocks at the far end have curtains, stairs, laundry lines and rooftop gardens. The live blocks move (a puzzle, if the engine allows moving solids) | Crane legs, a straddle carrier, a gate booth, a union notice board |
| `bmore_clinic` | A rowhouse front room | Real rowhouses are narrow and deep. Try about 7 tiles wide by 16 deep: front room, middle room, kitchen, side stairs, and the line out of the front door | Boiled bandages, a triage chalkboard |

### New maps, ranked

1. **`bmore_peninsula`: the code rot hood** (if the story owners pick it). Glass mid-rises on an old
   rail-yard grid, with spur tracks between them. Water on three sides, and a promenade along it.
   An I-95 viaduct along the land edge, with two or three underpasses: the failed cordon. The art
   breaks here first: tiles offset, palette entries swapped, a fountain cycling the wrong pattern.
   Enemies: Code-rot-taken in numbers, procedural code rot villains, rotted shells.
2. **`bmore_fells`: Fells Point.** Belgian-block streets. The low end of the street is under water at
   high tide. A tug pier, a market shed and a water-taxi landing. The region's fishing spot.
3. **`bmore_camden`: the rail arrival.** The Camden Line from College Park ends here. A very wide map
   with one long brick building. A hidden exit into the freight tunnel.
4. **`bmore_fort`: the star fort** at the tip of Locust Point. Five-pointed walls and a flagpole. The
   I-95 tunnel runs just south of it. A quiet vantage map for a scene.
5. **`bmore_culvert`: the buried stream.** Three concrete tubes from the north of downtown to the
   harbor outfall. The hidden route between the hub and Mount Vernon.
6. **Later:** the Mount Vernon reading room (Archivists), the roundhouse (boss arena with a turning
   floor), the Jones Falls mills (Analogists), the park observatory (lookout), the palm house.

### Routes

```
           [five-sided tower]--water taxi--+
                                           |
 [Camden Station]----[ hub: Inner Harbor ]----water taxi----[Fells Point]----[Canton / stacks]
        |                 |         \                                          |
  freight tunnel      buried stream  \                                         |
        |                 |           [Locust Point rows]--------I-95 tunnel---+
   (rail yards)     [Mount Vernon]     /      |       \
                                [refinery] [hall]  [star fort]
                                     |
                              [the Peninsula]  (across the Middle Branch, under I-95)
```

- **By rail:** College Park to Camden Station (the real Camden Line). The current scaffold arrives by
  road instead (`route1_north` to the hub); both can stay.
- **By water:** the water-taxi landings become fast-travel nodes once each is found.
- **Under the harbor:** the I-95 tunnel joins Locust Point and Canton. A service gallery would be our
  invention (**unverified** that one exists).

### The atlas's region rules, for Baltimore

| Rule | Baltimore answer |
|---|---|
| One thing that still works | The gravity clock tower, the one public clock that doesn't read 1901. Painted screens too |
| One thing that lies | The terminal system's manifest (the scaffold's port ledger: "every container accounted for, except the ones that are") |
| A fishing spot | A Fells Point pier. The real harbor cleanup aimed for "swimmable and fishable" |
| A scooter trick | Federal Hill's slope down to the promenade; a Belgian-block rattle run |
| A hidden route | The buried stream under downtown |
| The roommate at home here | Michael (`docs/design/04-cast.md` lists Baltimore among his regions) |

## 8. Art hooks

All within the fixed 36-color palette (`tools/art/palette.json`); props through
`tools/art/gen_props.py` then `python3 tools/art/build.py <sheet>`.

### Tiles (`gen_tiles.py`)

- **Brick** (`q`) already exists, in weathered brown-red on dark mortar. It is right for rows and
  canneries.
- **Belgian block:** a new tile, or a variant of stone (`m`). Rounded grey setts in uneven rows,
  `concrete2` and `concrete3` on `night2` joints.
- **Formstone front:** a wall variant made of fake "stones" in `concrete2` and `concrete3` with thin
  `night2` joints. It should look a little too regular.
- **Shallow flood:** water over pavers, with the paving pattern showing through (`screen0` over
  `concrete1`). It is how the promenade looks at high tide.
- **Quay edge:** concrete with a line of bollards and a fender strip (the existing `obj.tires` can
  stand in).
- **Code rot hood:** no new tiles. Swap palette entries and offset existing tiles, per DIRECTION
  rule 3.

### Props

| Prop | Sheet | Notes |
|---|---|---|
| Marble stoop | `props` | Three `bone` steps with a `concrete3` shadow; one with a scrub bucket |
| Painted screen window | `props` | A tiny cottage-and-lake scene in `warm2`, `warm3`, `screen1` and the concrete greens. No roommate greens |
| Refinery sign | multi-tile scenery | Our own word in tall letters (for example SUGAR, so the flickering S still works). Never the real brand |
| Clock face | `big` | Twelve letters of our own instead of numbers. If they spell a word, its board text needs Spanish |
| Ship-to-shore crane | multi-tile | Portal legs you walk between and a boom over the water. `steel` and `bone`, with red obstruction lights at night |
| Container | `wide` | Rust (`warm1`, `warm2`), `steel`, `bone` and `concrete`. Continuity-owned boxes are `bone` with `signal` marks. Sealed Sovereign Stack boxes are `night3` with a `screen2` status light. No roommate colors, no orange |
| Straddle carrier | `big` | A tall frame on wheels; a dockhand shell in the cab |
| Silo, conveyor, unloader | `big`, `wide` | Refinery set |
| Sugar bank | tile or scenery | `bone` with `warm4` highlights |
| Tug, water taxi | `wide` | Water-taxi landings get a painted route board |
| Trash wheel | `big` | A water wheel at a stream mouth with two painted eyes. Our own design: never the real mascot's name or look |
| High-water wall | `props` | Painted lines with years, oldest lowest |
| Sandbags, flood gate | `props`, `wide` | Promenade and Fells Point |
| Mural wall | `big` | The atlas's Pork murals "slightly wrong": wrong number of fingers (crowds.js already has this), the plaid in the wrong colors |

### Palette notes

- **Warm/cold reading:** rowhouses, sugar, brick and tugboats are warm. The terminal system, the
  five-sided tower, cranes at night and the Peninsula's glass are cold. The player should feel the
  code rot hood go cold before seeing anything rot.
- **Street light:** `warm4` amber, as DIRECTION says. Neon is amber, never orange.
- **The red sign is a palette question.** `signal` is reserved for Continuity's hardware and marks,
  and the sign belongs to the people. Options are under Open questions.

### Signage

- In-world names are descriptive, the way the atlas writes "a sugar refinery sign" and "the Meade":
  the sugar refinery, the five-sided tower, the clock tower, the star fort.
- Water-taxi route boards, hand-corrected tide tables, and union notices are all analog, so they're
  warm.
- Bus benches painted with a civic slogan, each new slogan painted over the last with the older
  ones showing through. Use our own slogans.

## 9. Cautions

Follows the flags table in `docs/lore/meme-research.md` §7, extended for Baltimore.

| Flag | Why | What to do |
|---|---|---|
| **Real private people** | Residents, shop owners, muralists, screen painters, the trash wheel's makers: all real, mostly private | Never name or draw them. Every NPC is invented. Check that invented names (doc 04) don't match real local public figures (**not checked here**) |
| **Real heads of government** | Coverage of the Red Line, the Key Bridge rebuild, the incinerator and the harbor is full of governors and mayors | Don't reference any of them, or slogans tied to a named administration (meme-research §7) |
| **Places named after people** | The fort, the bridge, the hospital, the library, the column and a planned park all carry real people's names | Name them by what they are, as the atlas does with "the Meade": the star fort, the column, the reading room |
| **The Key Bridge collapse** | A ship strike on 26 March 2024 killed six workers. It is recent, and local players will know it | Never show a collapsed Key Bridge or use a ship strike as spectacle. In 2098 the replacement stands. Review whether the Annapolis entry's "long bridge with a missing span" reads as this (Open questions) |
| **Neighborhood stereotypes** | Real neighborhoods carry real reputations, and pixel-art rot on a real block is a statement about the people who live there | Pick the code rot hood on wiring and geography (section 4). Never use real vacant rowhouses as code rot scenery: the city had 12,349 vacant-building notices in October 2025 *(gov)* |
| **Drug-use imagery** | Baltimore had the highest overdose death rate of any large US county in 2024, about 116 per 100,000 *(news, gov)* | Code rotters must never read as addiction: no needles, no nodding off on a corner, no "fiend" language. They loop and stagger because of firmware. Keep it visibly digital (rendering errors, 1901) |
| **Policing and 2015** | A death in police custody in 2015 and the unrest that followed are recent and painful | No riot set pieces modeled on it. Abatement and Continuity enforcers stay fictional and are never styled after the city's real police |
| **TV crime drama** | The best-known picture of Baltimore in fiction is a crime series | Don't build the city's look, talk or NPC types from TV. No corner-crew NPCs, no quotes |
| **Displacement history** | A 1970s expressway demolished 971 homes and 62 businesses in a middle-class Black neighborhood and displaced 1,500 or more people *(gov, news)* | If that ditch appears, treat it straight. It is never a gag or a code rot origin |
| **Environmental-justice sites** | Curtis Bay (coal dust on homes and schools after the 2021 explosion) and Westport (the incinerator, under a civil-rights complaint) are live fights *(news)* | Never a punchline or a code rot source. The lettered stack can stand on the skyline, but its story stays out unless the story owners choose to handle it with care |
| **Brands and mascots** | The refinery's brand, the clock tower's original product, beer and seasoning brands, team names and logos, the harbor trash wheel's character, the spice company | Describe them, and invent our own words and designs. No logos |
| **Accent and caricature** | Regional "hon" humor and phonetic accents flatten people | No phonetic dialect. Write people per `docs/lore/WRITING.md` |
| **Religion** | The Callers are fictional zealots | Their hall is never a real church, synagogue or mosque, and never a real congregation's building |
| **Immigration history** | The Locust Point piers are a memorial site for families today | Warm and straight, never a pun |
| **Pigtown** | The name is livestock history residents chose to keep | One small nod at most, such as a sign. No Callers' shrine that makes residents the joke |
| **Facts in player text** | Heights, dates and counts here vary by source | Keep them out of player-facing text unless the story owners want a real number. 2098 is fiction anyway |

## 10. Open questions

1. **Which candidate becomes the code rot hood?** It's the story owners' call (LoreKeeper,
   BagelMeister). My pick is the Peninsula.
2. **The red sign's color.** `signal` red is reserved for Continuity. Options: (a) use `signal` and
   accept the overlap, (b) outline it in `warm4` so it reads warm, (c) add a neon-red pair to the
   palette, which is a palette change for the art owner to decide.
3. **Annapolis's missing span.** After 2024, a broken bridge near Baltimore reads as the Key Bridge.
   Should the atlas's Annapolis bridge keep its missing span? (Story owners, and the world section
   for the map.)
4. **Arrival by rail.** The atlas says Route 1 and the rail line. Should the Camden Line arrival be
   built, and does it change when the party first sees the harbor?
5. **Tide states.** Is the promenade's flooding a fixed look, or does it come and go like the
   Annapolis tide? Tide-driven tiles would need engine support (trevor).

## Sources

**Harbor and port**
- Maryland Port Administration: [Seagirt Marine Terminal](https://mpa.maryland.gov/Pages/seagirt-marine-terminal.aspx), [South Locust Point](https://mpa.maryland.gov/Pages/south-locust-point.aspx), [divisions and address](https://mpa.maryland.gov/Pages/mpa-divisions.aspx)
- Maryland Manual, [the port](https://2025mdmanual.msa.maryland.gov/msa/mdmanual/01glance/html/port.html)
- AJOT, [four more cranes (2021)](https://ajot.com/news/port-of-baltimore-welcomes-four-additional-gigantic-cranes-to-service-container-ships)
- Visit Maryland, [Top of the World observation level](https://visitmaryland.org/listing/general-attractions/top-world-observation-level); Baltimore Banner, [deck closing reports](https://www.thebanner.com/community/local-news/top-world-observation-deck-closing-baltimore-WRBA3BBORZBE3ESHZUTD7XIPRM/)
- Maryland Transportation Authority, [Key Bridge estimates](https://mdta.maryland.gov/blog-category/mdta-news-releases/maryland-transportation-authority-releases-updated-estimates-cost); NBC News, [cost doubles](https://www.nbcnews.com/news/us-news/maryland-doubles-cost-estimate-rebuilding-collapsed-baltimore-bridge-rcna244558)
- MDTA, [Fort McHenry Tunnel](https://mdta.maryland.gov/Toll_Facilities/FMT.html), [Harbor Tunnel](https://mdta.maryland.gov/Historic_Properties/Baltimore_Harbor_Tunnel)
- Historical Marker Database, [Locust Point immigration](https://www.hmdb.org/m.asp?m=131174); Baltimore Heritage, [Locust Point Immigrant House](https://explore.baltimoreheritage.org/items/show/559); Baltimore Histories, [the B&O and immigration](https://baltimorehistories.substack.com/p/how-the-baltimore-and-ohio-railroad) (secondary)
- Harborplace: Baltimore Banner, [building timeline](https://www.thebaltimorebanner.com/economy/growth-development/harborplace-building-timeline-JV3EZTIYXRGGBFKJNDCGK26I2E/); Daily Record, [plans face challenges (Oct 2026)](https://thedailyrecord.com/2026/10/02/harborplace-redevelopment-plans-face-challenges-baltimore/)

**Industry**
- Refinery and sign: Baltimore Magazine, [the sign's history](https://www.baltimoremagazine.com/section/community/domino-sugar-sign-history-first-illuminated-1951), [the refinery at 100](https://www.baltimoremagazine.com/section/businessdevelopment/baltimore-domino-sugar-refinery-celebrates-100-years-on-the-harbor/); CBS Baltimore, [neon replaced](https://cbsnews.com/baltimore/news/domino-sugar-is-replacing-its-giant-neon-sign-in-baltimore-after-nearly-70-years); WTOP, [relit](https://wtop.com/baltimore/2021/07/iconic-domino-sugars-sign-to-be-relit-in-baltimore-july-4); Baltimore Heritage, [the refinery](https://explore.baltimoreheritage.org/items/show/682); Baltimore Banner, [new silos](https://www.thebaltimorebanner.com/economy/businesses/domino-sugar-plant-new-silos-QC6TTREN65APPC2S7HHCFZQRCE/)
- Sparrows Point: [Wikipedia](https://en.wikipedia.org/wiki/Sparrows_Point,_Maryland); PBS NewsHour, [the site now](https://www.pbs.org/newshour/show/this-former-steel-mill-used-to-employ-thousands-how-the-site-is-adapting-and-creating-jobs-now)
- Canning: Baltimore Heritage, [American Can Company](https://explore.baltimoreheritage.org/items/show/401); [Smithsonian, canning in Baltimore](https://americanhistory.si.edu/node/14089)
- Spice plant: Baltimore Museum of Industry, [McCormick exhibit](https://www.thebmi.org/exhibits/mccormick-company/)
- Mills: Baltimore Heritage, [Hampden-Woodberry tour](https://explore.baltimoreheritage.org/tours/show/8), [Mount Vernon Mill No. 1](https://explore.baltimoreheritage.org/items/show/39)
- Power plant: Maryland Historical Trust, [National Register entry](https://apps.mht.maryland.gov/nr/NRDetail.aspx?NRID=978); [Wikipedia](https://en.wikipedia.org/wiki/Pratt_Street_Power_Plant)
- Incinerator: Inside Climate News, [EPA complaint](https://insideclimatenews.org/news/31052024/baltimore-trash-incineration-epa-complaint/); WEAA, [landmark and controversy](https://www.weaa.org/news/2024-05-21/a-historic-city-landmark-and-its-controversy-on-environmental-justice-in-south-baltimore)
- Curtis Bay: Baltimore Brew, [explosion report](https://baltimorebrew.com/2022/08/27/csx-coal-explosion-impacted-a-large-swath-of-residential-curtis-bay-report-finds/); CBS Baltimore, [coal dust study](https://cbsnews.com/baltimore/news/curtis-bay-baltimore-coal-schools-csx)
- Roundhouse: B&O Railroad Museum, [roof collapse](https://www.borail.org/explore-learn/historic-site/roof-collapse/); Building Design + Construction, [roundhouse restored](https://www.bdcnetwork.com/bo-railroad-museum-roundhouse-comes-full-circle)

**Rowhouses and neighborhoods**
- Baltimore Heritage, [anatomy of a rowhouse](https://baltimoreheritage.org/resources/anatomy-of-a-rowhouse/); Baltimore Magazine, [marble step scrubbing](https://www.baltimoremagazine.com/section/historypolitics/baltimore-marble-step-scrubbing-highlandtown-history/); [Formstone (Wikipedia)](https://en.wikipedia.org/wiki/Formstone)
- Painted Screen Society, [history](https://paintedscreens.org/history-1/); [Screen painting (Wikipedia)](https://en.wikipedia.org/wiki/Screen_painting); Baltimore Magazine, [Q&A with a folklorist](https://www.baltimoremagazine.com/2013/12/12/q-a-elaine-eff)
- Fells Point: American Planning Association, [Great Places](https://planning.org/greatplaces/neighborhoods/2012/fellspoint.htm); [Wikipedia](https://en.wikipedia.org/wiki/Fells_Point)
- Port Covington: [Wikipedia](https://en.wikipedia.org/wiki/Port_Covington); Maryland Department of the Environment, [brownfield file](https://mde.maryland.gov/programs/LAND/MarylandBrownfieldVCP/Documents/www.mde.state.md.us/assets/document/brownfields/Port_Covington.pdf); NAIOP, [post-industrial waterfront](https://www.naiop.org/research-and-publications/magazine/2025/spring-2025/business-trends/reawakening-a-post-industrial-waterfront)
- Fort: National Park Service, [Fort McHenry](https://www.nps.gov/places/fort-mchenry.htm)
- Mount Vernon: Johns Hopkins Libraries, [the library hall](https://www.library.jhu.edu/library-departments/special-collections/historic-collection-at-george-peabody-library); [the column monument (Wikipedia)](https://en.wikipedia.org/wiki/Washington_Monument_(Baltimore))
- Parks: [Patterson Park (Wikipedia)](https://en.wikipedia.org/wiki/Patterson_Park); Baltimore Heritage, [the observatory](https://explore.baltimoreheritage.org/items/show/21); Rawlings Conservatory, [Palm House](https://rawlingsconservatory.org/explore/palm-house)
- Pigtown: [Wikipedia](https://en.wikipedia.org/wiki/Pigtown,_Baltimore); Baltimore CHAP, [historic district](https://chap.baltimorecity.gov/pigtown)
- Lexington Market: [Wikipedia](https://en.wikipedia.org/wiki/Lexington_Market)

**Transit and skyline**
- MARC: [Camden Line (Wikipedia)](https://en.wikipedia.org/wiki/Camden_Line); MTA, [Camden timetable](https://mta.maryland.gov/schedule/timetable/marc-camden)
- Railway Gazette, [MTA lines](https://www.railwaygazette.com/data/maryland-transit-administration-mta/52417.article); [Metro SubwayLink (Wikipedia)](https://en.wikipedia.org/wiki/Baltimore_Metro_SubwayLink)
- Red Line: Maryland Matters, [2024 announcement](https://marylandmatters.org/2024/06/26/red-line-announcement-expected-friday-advocates-say-theres-no-time-to-waste/); Planetizen, [federal review paused](https://www.planetizen.com/node/135880); [project site](https://redlinemaryland.com/project-delivery/)
- Baltimore City DOT, [Harbor Connector](https://transportation.baltimorecity.gov/harborconnector)
- Freight tunnel: [2001 fire (Wikipedia)](https://en.wikipedia.org/wiki/Howard_Street_Tunnel_fire); CBS Baltimore, [tunnel reopens](https://www.cbsnews.com/baltimore/news/howard-street-tunnel-reopens-baltimore-freight-capacity)
- Buried stream: Baltimore Heritage, [the Jones Falls](https://explore.baltimoreheritage.org/items/show/791); [Wikipedia](https://en.wikipedia.org/wiki/Jones_Falls); The Cultural Landscape Foundation, [Jones Falls](https://www.tclf.org/jones-falls)
- Trash wheel: [Wikipedia](https://en.wikipedia.org/wiki/Mr._Trash_Wheel); Abell Foundation, [profile](https://abell.org/?p=2632)
- Warehouse: [Wikipedia](https://en.wikipedia.org/wiki/Baltimore_%26_Ohio_Warehouse_at_Camden_Yards); Maryland Stadium Authority, [the Warehouse](https://mdstad.com/node/158)
- Skyline: [tallest buildings (Wikipedia)](https://en.wikipedia.org/wiki/List_of_tallest_buildings_in_Baltimore); SAH Archipedia, [the deco tower](https://sah-archipedia.org/node/14470), [the clock tower](https://sah-archipedia.org/node/85592); [clock tower (Wikipedia)](https://en.wikipedia.org/wiki/Emerson_Bromo-Seltzer_Tower); [shot tower (Wikipedia)](https://en.wikipedia.org/wiki/Phoenix_Shot_Tower)

**Water, climate and the city**
- University of Maryland Center for Environmental Science, [Maryland Sea-Level Rise Projections 2023](https://www.umces.edu/sites/default/files/Maryland%20Sea-Level%20Rise%20Projections%202023%20report.pdf) (Table 2)
- Route Fifty, [nuisance flooding (2018)](https://route-fifty.com/infrastructure/2018/10/baltimore-nuisance-flooding/151840); Union of Concerned Scientists, [tidal flooding in Baltimore](https://www.ucs.org/resources/sea-level-rise-and-tidal-flooding-baltimore-maryland)
- US Census, [QuickFacts, Baltimore city](https://www.census.gov/quickfacts/fact/table/baltimorecitycountymaryland,US/PST045224)
- [Great Baltimore Fire (Wikipedia)](https://en.wikipedia.org/wiki/Great_Baltimore_Fire)

**Cautions**
- Maryland DOT, [West Baltimore United narrative](https://www.mdot.maryland.gov/OPCP/Narrative_2024_West_Baltimore_United_Phase_1_RCP_Construction.pdf); Baltimore Magazine, [the expressway's history](https://www.baltimoremagazine.com/section/businessdevelopment/highway-to-nowhere-baltimore-expressway-demolished-black-neighborhoods/)
- Maryland DHCD, [vacants council annual report (Oct 2025)](https://news.maryland.gov/dhcd/2025/10/20/baltimore-vacants-reinvestment-council-publishes-annual-report/); Baltimore Heritage, [counting vacants](https://baltimoreheritage.github.io/vacant-buildings-101/guides/counting-vacants)
- Baltimore Banner, [overdose deaths in 2024](https://www.thebanner.com/community/public-health/baltimore-decline-drug-overdose-deaths-challenges-ZI7EYPYFTZD2VPLXJKBS4WASJI/); Maryland Department of Health, [2024 intoxication report](https://health.maryland.gov/vsa/Documents/Overdose/2024%20Intox%20Report.pdf)
