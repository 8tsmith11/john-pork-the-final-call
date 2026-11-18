# Lead A: the helium trail

## Purpose

The engineering lead (DESIGN §3, Lead A). The roommates build a helium sniffer at the fabs in 631
(first crafting recipe, taught through banter), follow it across the metro plaza at night, pass an
abatement van whose sensor mast turns out to be logging helium too (**T3**), and end at a grate that
is breathing *in*. A second route skips the engineering entirely: a rotter on the plaza bench saw
orange go down the grate, and he will say so if someone sits with him. Sitting with him *after* he
has given you what you came for is easter egg #10 (SECRETS.md), and it is the one great line of this
scene. Themes served: *who answers?* (the bench), *makers* (the sniffer, the mast), *"opening soon"*
(the Purple Line, the man who was hired to drive it).

The scene never says who took the balloon, never says what the Call said, and every clue here reads
the same under seed variants A and B.

## Flags

**Reads**
- `act1.building.leadsFound` (assumed name, set by Beat 1: the party knows there is a trail to follow)
- `act1.coldopen.printer3Inspected`
- `act1.leadC.complete` (the roof footage has been seen)
- `act1.leadB.complete`
- `act1.call.answered`, `act1.call.happened`
- `party.morph.<roommate>` (0 or 1 in Act 1)
- `settings.crudeHumor`

**Sets**
- `act1.leadA.started`
- `act1.leadA.fab.mateFalseAlarm`
- `act1.leadA.fab.scopeTuned`
- `act1.leadA.snifferCrafted` (also grants item `sniffer`)
- `act1.leadA.snifferName` (`olfa` | `unit_one` | `truffle`)
- `act1.leadA.snifferMuted` (toggle)
- `act1.leadA.trailStep` (int, 0 to 5)
- `act1.leadA.van.met`
- `act1.leadA.van.outcome` (`honest` | `lied` | `lie_failed` | `avoided` | `caught`)
- `act1.leadA.van.logSeen`
- `act1.leadA.van.statueShown`
- `act1.leadA.van.warnedSix`
- `act1.leadA.van.loggedAs245`
- `act1.leadA.van.pointedAtDel`
- `act1.leadA.t3Seen` (the party knows Continuity is hunting helium; this is the clue flag)
- `act1.leadA.rotter.satStage` (int, 0 to 3)
- `act1.leadA.rotter.orangeHeard`
- `act1.leadA.rotter.eggHeard` (easter egg #10)
- `act1.leadA.rotter.mateLeft`
- `act1.leadA.grateReached`
- `act1.leadA.grate.drumHeard`
- `act1.leadA.complete`
- Standing nudges, written inline as *standing: faction ±n*

---

# Part 1: The fab (Room 631)

*Trigger: any roommate interacts with the fab bench while `act1.building.leadsFound` is set and
`act1.leadA.snifferCrafted` is not. The interacting player is the **speaker**.*

### node: a_fab_start

*Room 631. The three printers in a row. Printer #3's bed light is on. The balcony door is open a
hand's width and the ottoman is out there with a ribbon on it and nothing on the ribbon.*

*Sets `act1.leadA.started`.*

#### if speaker=trevor

**TREVOR:** Helium's a tiny atom. It pulls heat off a hot wire faster than air does.

**MICHAEL:** Okay.

**TREVOR:** So you heat a wire, you watch how fast it cools, and when it cools too fast you're standing in helium.

**MANUEL:** That's a katharometer.

**TREVOR:** That's a katharometer.

**MICHAEL:** You two said that like it's a normal word.

#### if speaker=manuel

**MANUEL:** We can smell it.

**MICHAEL:** Helium doesn't smell.

**MANUEL:** Not us. A wire. Hot wire in a bridge, helium cools it faster than air, the bridge goes out of balance.

**TREVOR:** Katharometer. Yeah. That works.

**MANUEL:** We did it in 245 lab. Week four.

**TREVOR:** You hated week four.

**MANUEL:** I hate 245 lab. Week four was fine.

#### if speaker=michael

**MICHAEL:** Can't we just build a thing that finds it?

**TREVOR:** "A thing."

**MICHAEL:** You have a whole wall of things. One of them has to find stuff.

*Manuel and Trevor look at each other.*

**MANUEL:** Hot wire.

**TREVOR:** Hot wire. Helium strips the heat off it. He's right.

**MICHAEL:** I'm right?

**TREVOR:** By accident. It still counts.

Choices:
- "Print the housing." -> a_fab_printer
- [flag act1.coldopen.printer3Inspected] "Is three still warm?" -> a_fab_printer3
- "Not yet." -> a_fab_leave

### node: a_fab_leave

**TREVOR:** It's not going to get less gone.

*End. The fab bench stays interactable.*

### node: a_fab_printer3

*The speaker holds a hand over printer #3's bed without touching it.*

#### if speaker=manuel

**MANUEL:** Still warm.

**TREVOR:** It's always warm.

**MANUEL:** Since when?

*Trevor thinks about it. He does not have an answer and it bothers him less than it should.*

**TREVOR:** Since a while.

#### if speaker=trevor

**TREVOR:** Bed's at forty.

**MICHAEL:** Is that bad?

**TREVOR:** It's just on. Somebody left it on.

*Nobody says "not me." Nobody says anything.*

#### if speaker=michael

**MICHAEL:** This one's warm. Like a laptop on a bed.

**MANUEL:** Three's always warm.

**MICHAEL:** That's a thing you just say? In this house?

**MANUEL:** It prints better warm.

-> a_fab_printer

### node: a_fab_printer

*The speaker reaches for the nearest printer. It is #3.*

**TREVOR:** Not three.

**MICHAEL:** Why not three?

**TREVOR:** Use one. One's clean.

*Printer #1 starts. The sound it makes is the sound this apartment makes instead of silence.*

**MANUEL:** Eleven minutes.

**MICHAEL:** For a box?

**MANUEL:** For a box with a flow channel. An Aster pro does not print a box.

*Crafting step 1 of 4: PRINT HOUSING. (Cost: scrap x2. No fail state.)*

*While it prints, the party can talk. Each option can be taken once. "Wait" skips ahead.*

Choices:
- "What's the wire?" -> a_fab_banter_wire
- "Where does the degassing chamber come in?" -> a_fab_banter_degas
- [speaker=michael] "Doesn't helium go up?" -> a_fab_banter_up
- [speaker!=michael] "Michael, you're quiet." -> a_fab_banter_up
- "Wait." -> a_fab_cell

### node: a_fab_banter_wire

**TREVOR:** Tungsten. Thinner than a hair. There's a spool in the drawer under the microscope.

**MICHAEL:** We own tungsten.

**MANUEL:** We own a lot of things.

**MICHAEL:** We own *pacifiers*, Manuel.

**MANUEL:** And tonight you will be glad.

*Michael waits for the rest of that sentence. It does not come.*

-> a_fab_printer (choices)

### node: a_fab_banter_degas

**MANUEL:** The wire sits in resin. If the resin has bubbles, each bubble is a little room of air right next to the sensor.

**TREVOR:** And then it's measuring its own bubbles.

**MANUEL:** So you pour it, you put it in the chamber, you pull the air out, the bubbles come up and die.

**MICHAEL:** That's kind of sad.

**MANUEL:** It's the best part. Watch. They all come up at once.

-> a_fab_printer (choices)

### node: a_fab_banter_up

#### if speaker=michael

**MICHAEL:** Doesn't helium go up?

**TREVOR:** Yes.

**MICHAEL:** So we're building a thing to follow something that went up. From the ground.

**TREVOR:** If it went up, this reads nothing, and we come home.

**MICHAEL:** And if it reads something?

*Trevor doesn't answer. Manuel is looking at the balcony.*

**MANUEL:** Then it didn't go up.

#### if speaker=trevor

**TREVOR:** Michael. You're quiet.

**MICHAEL:** I'm thinking.

**TREVOR:** Go ahead.

**MICHAEL:** Helium goes up. Balloons go up. That's the whole deal with them.

**TREVOR:** Yeah.

**MICHAEL:** So what are we going to be following? On the ground?

**TREVOR:** Hopefully nothing.

**MICHAEL:** That's the good outcome? Nothing?

**TREVOR:** It's the normal one.

#### if speaker=manuel

**MANUEL:** Michael. You're quiet.

**MICHAEL:** My girlfriend can smell rain before it rains. Like an hour before.

**MANUEL:** Okay.

**MICHAEL:** I was thinking we could've just asked her.

**TREVOR:** Call her.

*Michael turns his phone over on the bench. Face down.*

**MICHAEL:** She's bad with phones.

**MANUEL:** Since when?

**MICHAEL:** Is the box done?

*It is not done. Nine minutes.*

-> a_fab_printer (choices)

### node: a_fab_cell

*Printer #1 finishes. The housing is warm and smells like sugar.*

*Crafting step 2 of 4: SOLDER THE CELL. The soldering iron is already hot. It is always already hot.*

**TREVOR:** Hold on.

*He shakes two capsules out of an unlabeled bottle and swallows them dry.*

**MICHAEL:** What's that one?

**TREVOR:** Theanine. For the hands.

**MICHAEL:** And the other one?

**TREVOR:** Also for the hands.

#### if speaker=trevor

*Trevor solders. The wire is too thin to see. He does it by where the light bends.*

**MANUEL:** You're not breathing.

**TREVOR:** I'll breathe after.

*Two joints. He breathes.*

#### if speaker=manuel

*Manuel solders. He hums something under it, low, and stops humming at the exact moment of each joint.*

**TREVOR:** Check it under the scope.

*Manuel slides it under the microscope. Looks. Slides it back out.*

**MANUEL:** It's beautiful.

**TREVOR:** Is it connected?

**MANUEL:** Those are the same thing.

#### if speaker=michael

**MICHAEL:** Can I do one?

*Trevor and Manuel do the look again.*

**MANUEL:** One.

*Michael solders one joint. It is fine. It is, annoyingly, a little better than fine.*

**TREVOR:** Huh.

**MICHAEL:** My girlfriend makes jewelry. I used to hold the little parts.

**TREVOR:** You never said.

**MICHAEL:** You never gave me the iron.

-> a_fab_degas

### node: a_fab_degas

*Crafting step 3 of 4: POT AND DEGAS. Manuel pours resin over the cell. It goes cloudy with bubbles.*

**MANUEL:** In the chamber.

*The degassing chamber's pump starts. Through the lid, the resin swells, foams, rises like something breathing in.*

**MICHAEL:** It's going to overflow.

**MANUEL:** It won't.

**MICHAEL:** It's *going* to.

*It rises to the rim. It holds. Then every bubble lets go at once and the resin drops flat and clear as water.*

**MICHAEL:** Oh.

**MANUEL:** Every time.

*Nobody says anything for a second. The pump runs.*

**TREVOR:** It needs a soft seal on the intake. Silicone. Something that already has a hole in it.

*All three of them look at the jar of pacifiers.*

**MICHAEL:** No.

**MANUEL:** Yes.

**MICHAEL:** Is *this* why we have those?

**MANUEL:** Tonight it is.

*Manuel drills the intake. One hole, clean. He fits a pacifier over it, nipple out. The sniffer now has, unmistakably, a nose.*

-> a_fab_scope

### node: a_fab_scope

*Crafting step 4 of 4: TUNE ON THE OSCILLOSCOPE.*

*The oscilloscope wakes up. Its clock reads 19:01. Nobody has ever fixed it. The trace still works.*

**MANUEL:** Same scope as 245 lab.

**TREVOR:** Don't.

**MANUEL:** I hate 245 lab.

**TREVOR:** There it is.

*Minigame: two dials (BALANCE, GAIN). Bring the wobbling trace to a flat line on the center
graticule and hold it for three seconds. The trace drifts. See Notes.*

Choices:
- "Tune it." -> a_fab_scope_minigame
- [speaker=trevor][morph>=1] "I've got it. Hands are locked in." -> a_fab_scope_auto
- [speaker=manuel][morph>=1] "Let the gonman do it." -> a_fab_scope_gonman

### node: a_fab_scope_auto

*Trevor's hands do not shake. They do not do anything hands do. The trace lies down flat on the first try.*

**MICHAEL:** That was fast.

**TREVOR:** Yeah.

*He looks at his own fingers a little longer than he needs to.*

**MANUEL:** Your pupils are different sizes.

**TREVOR:** That's the stack. It evens out.

*Sets `act1.leadA.fab.scopeTuned`.*

-> a_fab_first_reading

### node: a_fab_scope_gonman

*Manuel rolls his shoulders. Something in his posture goes one notch past normal.*

**MICHAEL:** Who's "the gonman"?

**MANUEL:** I am the gonman.

**MICHAEL:** An hour ago you were just gonman.

**MANUEL:** An hour ago I had a balloon.

*He turns both dials at once, without looking, and the trace goes flat. He is staring at Michael the whole time.*

**TREVOR:** Please blink.

*Sets `act1.leadA.fab.scopeTuned`.*

-> a_fab_first_reading

### node: a_fab_scope_minigame

*On success: sets `act1.leadA.fab.scopeTuned`.* -> a_fab_first_reading

*On each failure (trace leaves the screen), one line from this pool, in order, then repeat the last:*

| id | speaker | trigger | line |
|---|---|---|---|
| a_scope_fail_1 | TREVOR | 1st fail | Less gain. You're amplifying the building. |
| a_scope_fail_2 | MANUEL | 2nd fail | Rookie Aster mistake. Balance first, then gain. |
| a_scope_fail_3 | MICHAEL | 3rd fail | It's doing the thing where it leaves. |
| a_scope_fail_4 | TREVOR | 4th fail and after | Breathe out. Then turn. |

*After the 4th failure, the BALANCE dial's drift is halved (silent assist).*

### node: a_fab_first_reading

*The sniffer clicks once. Then again. Then fast. Then it is screaming.*

**MICHAEL:** It found it!

**TREVOR:** We're in the kitchen.

**MICHAEL:** It found it in the kitchen!

*The pacifier nose is pointing at Manuel's mate. Steam is curling straight into it.*

**TREVOR:** It found the mate.

**MANUEL:** ...Water vapor. It changes the conductivity.

**TREVOR:** Rookie Aster mistake.

**MANUEL:** It's a good mate.

**TREVOR:** I'm not saying it isn't.

*Sets `act1.leadA.fab.mateFalseAlarm`.*

*Trevor pulls the desiccant cartridge out of the dehumidifier, snaps it in half, and packs one half behind the pacifier.*

**TREVOR:** Now it only gets dry air.

**MICHAEL:** Did you just break the dehumidifier?

**TREVOR:** I borrowed half of it.

*The sniffer goes quiet. One slow click every few seconds. Room air.*

-> a_fab_name

### node: a_fab_name

**MICHAEL:** It needs a name.

**TREVOR:** It doesn't.

**MICHAEL:** It has a *nose*, Trevor.

Choices:
- [speaker=manuel] "El Olfa." -> a_fab_name_olfa
- [speaker=trevor] "Unit One." -> a_fab_name_unit
- [speaker=michael] "Truffle." -> a_fab_name_truffle

### node: a_fab_name_olfa

**MANUEL:** El Olfa.

**MICHAEL:** What's that mean?

**MANUEL:** One who smells.

**TREVOR:** Is that all it means?

**MANUEL:** Also, at home, the kid who sucks up to the teacher.

**MICHAEL:** Why would you name it that?

**MANUEL:** Because it will tell us whatever we want to hear. Until we dry it out.

*Sets `act1.leadA.snifferName=olfa`.*

-> a_fab_done

### node: a_fab_name_unit

**TREVOR:** Unit One.

**MICHAEL:** That's not a name. That's a count.

**TREVOR:** It implies a Unit Two.

**MANUEL:** Is there a Unit Two?

**TREVOR:** There's half a dehumidifier left.

*Sets `act1.leadA.snifferName=unit_one`.*

-> a_fab_done

### node: a_fab_name_truffle

**MICHAEL:** Truffle.

**TREVOR:** Why?

**MICHAEL:** Like the pigs. That find the truffles. With their noses.

*Manuel looks at the flag on the wall. Then at the sniffer. Then at Michael.*

**MANUEL:** That's good.

**MICHAEL:** Yeah?

**MANUEL:** Don't make it weird. It's good.

*Sets `act1.leadA.snifferName=truffle`.*

-> a_fab_done

### node: a_fab_done

*Sets `act1.leadA.snifferCrafted`. Grants item `sniffer` (gadget slot). Recipe "Sniffer" is now
known at the fab.*

*The speaker carries it to the balcony door. Out of habit, all three of them glance at the ottoman
to see if it's raining. It's dry. The ribbon is lying across it like a line someone drew.*

*The sniffer clicks. Twice. Faster than room air.*

**TREVOR:** That's not the mate.

*Manuel is already putting his shoes on.*

*Tutorial card: "THE SNIFFER clicks faster near helium. Follow the clicks. [key] mutes it."*

*End. `act1.leadA.trailStep=0`.*

---

# Part 2: The plaza (the trail)

*The metro plaza, between three and four in the morning. Sodium lights, half of them rotted to a
flicker. The ticker wall over the station mouth. A billboard on the garage. An abatement van parked
on the pavers with its mast up. A bench facing the Purple Line entrance, with a man on it.*

*The trail is five waypoints. The sniffer's click rate rises toward the next one. Each waypoint
plays its node once, for whoever is carrying the sniffer (the **speaker** for Part 2).*

### node: a_trail_0_door

*Trail step 0: the ASTER lobby door. The clicks pick up the moment it opens.*

#### if speaker=manuel

**MANUEL:** It came this way.

**MICHAEL:** Or the lobby's leaking something.

**MANUEL:** It came this way.

#### if speaker=trevor

**TREVOR:** Reading's up. Low, but up.

**MANUEL:** How low?

**TREVOR:** Low enough that I'd normally call it noise.

**MANUEL:** And tonight?

**TREVOR:** Tonight I'm following the noise.

#### if speaker=michael

**MICHAEL:** It's clicking. Is clicking good?

**TREVOR:** Faster is closer.

**MICHAEL:** So it's like hot and cold.

**TREVOR:** It is exactly hot and cold.

*Sets `act1.leadA.trailStep=1`.*

### node: a_trail_1_purple

*Trail step 1: the Purple Line entrance. A transit sign, lit. PURPLE LINE. OPENING SOON. THANK YOU
FOR YOUR PATIENCE. The escalator behind it has never moved. The clicks are steady.*

**MICHAEL:** Do you think it'll open while we live here?

**TREVOR:** No.

**MICHAEL:** You didn't even think about it.

**TREVOR:** I thought about it freshman year.

*If inspected, see ambient table: `amb_purple_sign`.*

*Sets `act1.leadA.trailStep=2`.*

### node: a_trail_2_ticker

*Trail step 2: under the ticker wall. The text crawls right to left. See ticker table. The first
time the party stands here, the next ticker line is forced to `tick_gulf`.*

*The ticker: GULF TRANSIT LANE: HELIUM CONVOY INTERDICTED. SUPPLY IS STABLE.*

#### if speaker=manuel

**MANUEL:** A convoy.

**TREVOR:** With escorts, probably.

**MANUEL:** I had it tied to a footstool.

#### if speaker=trevor

**TREVOR:** They're shooting at each other over it.

**MICHAEL:** Over helium?

**TREVOR:** There isn't any more. What's in the ground is what there is.

**MANUEL:** And what's on our balcony.

**TREVOR:** Was.

*Manuel doesn't correct him.*

#### if speaker=michael

**MICHAEL:** "Supply is stable."

**TREVOR:** Then why's it news?

**MICHAEL:** That's what my girlfriend says. If they tell you it's fine, somebody asked.

*Sets `act1.leadA.trailStep=3`.*

### node: a_trail_3_van

*Trail step 3: the clicks bend. Not toward the station. Toward the van.*

*An Abatement Inc. van, white gone gray, Continuity mark on the door. A sensor mast is cranked up
from the roof, four meters, with a little anemometer spinning on top. The side door is open. A
woman sits in it with a cup of noodles and a tablet on her knee. She hasn't looked up yet.*

*Every forty seconds the mast makes a small sound, like someone clearing their throat. When it
does, the sniffer goes berserk for one second, then settles.*

#### if speaker=trevor

**TREVOR:** Stop. Listen to it.

*The mast coughs. The sniffer shrieks. Quiet again.*

**TREVOR:** That's a reference puff. It's checking itself against a known sample.

**MICHAEL:** A sample of what?

*Trevor holds up the sniffer.*

**MANUEL:** Nobody has helium.

**TREVOR:** They do. They've got enough to waste it every forty seconds.

#### if speaker=manuel

*The mast coughs. The sniffer shrieks.*

**MANUEL:** It's in the van.

**TREVOR:** No. Wait.

*Forty seconds. Cough. Shriek.*

**TREVOR:** It's too regular. That's a calibration shot. The mast is tuned for helium and it's reminding itself what helium is.

**MANUEL:** So they're looking for it.

**TREVOR:** Somebody is.

**MANUEL:** For *mine*?

*Nobody knows. That's the honest answer and nobody gives it.*

#### if speaker=michael

*The mast coughs. The sniffer shrieks. Michael nearly drops it.*

**MICHAEL:** It's the van! It's in the van!

**TREVOR:** Lower.

**MICHAEL:** *It's in the van.*

**TREVOR:** It's on a timer. See? Again. That's the mast testing itself.

**MANUEL:** For helium.

**MICHAEL:** Why would a rot van care about helium?

**TREVOR:** That's a better question than you think it is.

*Sets `act1.leadA.t3Seen`. Sets `act1.leadA.trailStep=4`.*

*The sniffer is now loud enough to be heard from the van door. A prompt appears: "[key] Mute".*

Choices:
- "Talk to her." -> a_van_approach
- "Go around. Quietly." -> a_van_sneak
- "Ignore the van. Follow the trail." -> a_trail_4_grate_approach

### node: a_trail_4_grate_approach

*Past the van the clicks thin out, then gather again, low to the ground, by the bench.*

*If the sniffer is not muted and the party walks within the van's hearing radius, go to
a_van_caught. Otherwise the party reaches the grate.* -> a_grate_arrive

---

# Part 3: The van

*NPC: **Corinne Addo**, Abatement Inc. field tech, night shift. Badge: ADDO, C. / FIELD TECH II /
VERIFIED HUMAN. Forties. Laced: a small port behind the left ear with a strip of medical tape over
it, the way people do when it itches. She is not Pruitt and she does not like Pruitt. She is tired
and decent and she believes the van does more good than harm, because she has seen it do good.*

### node: a_van_approach

*Sets `act1.leadA.van.met`.*

*She looks up when the party is three steps away. She does not put the noodles down.*

**ADDO:** Plaza's open. Van's not.

[if `act1.leadA.snifferMuted` is false]

*The mast coughs. The sniffer shrieks in the speaker's hand.*

**ADDO:** And what is *that*.

-> a_van_caught_choices

[else]

Choices:
- "We lost something. We think it came through here." -> a_van_honest
- "We're supposed to be here." (lie) -> a_van_lie
- "What's the mast for?" -> a_van_mast_ask
- [item statue] *Show her the statue.* -> a_van_statue
- "Sorry. Wrong van." -> a_van_leave

### node: a_van_leave

**ADDO:** There's a right van?

*She goes back to the tablet. End. She can be approached again.*

### node: a_van_mast_ask

**ADDO:** Air quality.

Choices:
- "Which part of the air?" -> a_van_mast_ask_2
- "Okay." -> a_van_approach (choices)

### node: a_van_mast_ask_2

**ADDO:** Particulates. Nitrogen oxides. Rot index. The usual.

*The mast coughs.*

**ADDO:** And that.

**ADDO:** Don't ask me about that. I got it Monday. No memo.

*She has said more than she meant to. She eats a noodle about it.*

*Sets `act1.leadA.t3Seen`.*

-> a_van_approach (choices)

### node: a_van_honest

*standing: continuity +1 (she is the face of it here, and you were straight with her)*

#### if speaker=manuel

**MANUEL:** I lost a balloon.

*Addo waits for the joke.*

**MANUEL:** It's orange.

**ADDO:** I haven't heard that sentence since I was six.

**MANUEL:** It had helium in it. From home.

*She stops chewing.*

**ADDO:** Real helium.

**MANUEL:** Yes.

**ADDO:** How big?

*Manuel shows her with his hands. He is careful about it. He gets the size exactly right.*

**ADDO:** Huh.

*She looks up at the mast. Then at the tablet. Then at nothing.*

**ADDO:** That'd about do it.

#### if speaker=trevor

**TREVOR:** We're tracking a helium source. Small. Point release, a little after three.

**ADDO:** Funny. So am I.

**TREVOR:** I know. Your mast is burning reference gas every forty seconds.

**ADDO:** ...You can hear that?

**TREVOR:** I built something that can.

*She looks at the thing in his hand. At the pacifier on the front of it.*

**ADDO:** With a binky.

**TREVOR:** It's food-grade silicone.

**ADDO:** Uh huh. What's the source?

**TREVOR:** A balloon.

**ADDO:** A what?

**MANUEL:** *(from behind)* It's mine.

#### if speaker=michael

**MICHAEL:** Hi. Sorry. My roommate lost a balloon and it's kind of a whole thing.

**ADDO:** A balloon.

**MICHAEL:** An orange one. With helium. He checks on it every morning. It's from his family.

**ADDO:** Which roommate?

*Michael points. Manuel raises one hand, small, like a kid who has been called on.*

**ADDO:** ...With helium. Actual.

**MICHAEL:** Is that weird?

**ADDO:** It's a little weird, honey.

-> a_van_honest_2

### node: a_van_honest_2

*Addo sets the noodles down on the van floor. First time.*

**ADDO:** Okay. I'm going to say some things and then I'm going to have not said them.

**ADDO:** Monday, region pushes a new channel to every mast in the county. Helium. No memo, no reason. I figure it's a calibration thing. There's no helium. You can't find helium.

**ADDO:** Three-sixteen this morning, it finds helium.

Choices:
- "Where?" -> a_van_honest_where
- "Who gets the log?" -> a_van_honest_who
- "Why are you telling us?" -> a_van_honest_why
- "That's enough. Thank you." -> a_van_honest_close

### node: a_van_honest_where

**ADDO:** Up. Your building. Roof, or near it.

*She points with her fork. Then the fork comes down, slowly, across the plaza, and stops.*

**ADDO:** Then there. Three minutes later. The grate by Del's bench.

**ADDO:** Gas doesn't do that. I ran the mast's self-test twice. Gas goes up and it thins out. This went *down* and it stayed together.

*Sets `act1.leadA.van.logSeen`. Sets `act1.leadA.van.pointedAtDel`.*

-> a_van_honest_2 (choices)

### node: a_van_honest_who

**ADDO:** My supervisor gets my hours. Pruitt. He gets my hours and my mileage and he gets on my ass.

**ADDO:** This channel doesn't go to Pruitt.

Choices:
- "Who does it go to?" -> a_van_honest_who_2
- "..." -> a_van_honest_2 (choices)

### node: a_van_honest_who_2

**ADDO:** Somewhere with a longer name.

*She taps the tablet. A destination field, mostly asterisks. It ends in the word INTERDICTION.*

**ADDO:** I do air. I don't know what that is, and I've worked very hard at not knowing.

*Sets `act1.leadA.van.logSeen`.*

-> a_van_honest_2 (choices)

### node: a_van_honest_why

*The ticker wall is behind the party. Addo's eyes go to it, over their shoulders, and stay for
exactly as long as one line takes to cross. The line is BALTIMORE.*

**ADDO:** My mother's inside the Baltimore line. Six weeks now.

**ADDO:** You know who brings her water? A van. Same van as this. Same mast.

**ADDO:** So I'm not going to stand here and tell you the van's the bad guy.

*She picks the noodles back up.*

**ADDO:** But nobody ever asked me to look for a kid's balloon before.

-> a_van_honest_2 (choices)

### node: a_van_honest_close

**ADDO:** I have to log contacts. So here's my log.

*She types with one thumb, reading it aloud as she goes.*

**ADDO:** "Three students. Asked when the Purple Line opens."

**MICHAEL:** When does it?

**ADDO:** Soon.

*She almost smiles.*

**ADDO:** Day crew's on at six. Day crew isn't me. Don't be standing on that grate with a helium meter at six.

*Sets `act1.leadA.van.outcome=honest`. Sets `act1.leadA.van.warnedSix`.*

[if not `act1.leadA.rotter.orangeHeard`]

**ADDO:** And if you want a second opinion, ask Del. On the bench. He's there all night. Sees everything, files none of it.

**ADDO:** He'll make room for you. He never does for me.

*She touches the tape behind her ear without noticing she does it.*

*Sets `act1.leadA.van.pointedAtDel`.*

*End.*

### node: a_van_lie

*The lie depends on who's telling it.*

#### if speaker=manuel

**MANUEL:** We're from the university. 245 lab. Air quality practicum.

**ADDO:** At three-thirty in the morning.

**MANUEL:** I hate 245 lab.

*It is the most sincere thing anyone has said to her all week.*

**ADDO:** ...Yeah. Okay. That, I believe.

-> a_van_lie_success

#### if speaker=michael

**MICHAEL:** We're filming a thing. For class. "The People Who Keep the Night On."

**ADDO:** The what?

**MICHAEL:** It's about essential workers. The ones nobody thanks. We've been all over the county and honestly? You're the first one who looked like she actually knew what her equipment did.

*Trevor is staring at Michael. Manuel is staring at Michael.*

**ADDO:** Where's the camera?

*Michael holds up the sniffer. Pacifier forward.*

**MICHAEL:** It's a prototype.

*A very long pause.*

**ADDO:** Is my hair in it?

**MICHAEL:** Your hair looks great.

**ADDO:** It does not. Fine. Two minutes.

-> a_van_lie_success

#### if speaker=trevor

**TREVOR:** Facilities. Your mast's on the plaza spur. You're drawing eleven amps on a ten-amp circuit.

**ADDO:** It's a twelve-amp circuit.

**TREVOR:** ...Then you're fine.

**ADDO:** Who are you with?

Choices:
- [morph>=1] *Don't blink.* -> a_van_lie_trevor_stare
- "Facilities." -> a_van_lie_fail
- "Okay, I'm not with anyone." -> a_van_honest

### node: a_van_lie_trevor_stare

*Trevor doesn't blink. It isn't a choice. On the stack, he sort of can't.*

*Five seconds. Ten. Addo looks away first, at his pupils, then away from those too.*

**ADDO:** ...What are you *on*?

**TREVOR:** Magnesium.

**ADDO:** That is not magnesium.

**TREVOR:** It's a lot of magnesium.

**ADDO:** Look at the breaker panel and go. I don't want to know your name.

-> a_van_lie_success

### node: a_van_lie_fail

**ADDO:** Facilities works days. And they wear the vest.

*She isn't angry. She's seen better attempts on worse nights.*

**ADDO:** Go home, Facilities.

*Sets `act1.leadA.van.outcome=lie_failed`. standing: continuity -1.*

**MANUEL:** *(walking away)* Rookie Aster mistake.

**TREVOR:** It *was* a twelve-amp circuit.

**MANUEL:** That's what made you an Aster noob.

*End. Addo will still answer `a_van_mast_ask`. The mast panel can still be read by sneaking
(a_van_sneak). The honest route is closed for this visit and reopens after the party leaves the
plaza and returns.*

### node: a_van_lie_success

*She tilts the tablet so they can see it. Not generous. Just too tired to guard it.*

*The log, as displayed:*

> `CH-07  He   NEW  [REGION: DO NOT DISABLE]`
> `03:16  He  +++   BRG 284  ELEV HIGH   (ASTER ROOFLINE)`
> `03:19  He  ++    BRG 131  ELEV LOW    (INLET P-4)`
> `03:20  He  +     BRG 131  ELEV LOW`
> `03:21  --`
> `UPLINK: ************ / INTERDICTION`

**TREVOR:** *(quiet)* High, then low.

**MANUEL:** *(quieter)* Three minutes.

**ADDO:** You two want to share with the class?

Choices:
- "What's channel seven?" -> a_van_lie_ch7
- "What's inlet P-4?" -> a_van_lie_p4
- "That's all we needed." -> a_van_lie_close

### node: a_van_lie_ch7

**ADDO:** New. Monday. It came down from region with a "do not disable" on it, and I've been doing this nine years and I've never had a channel I wasn't allowed to turn off.

**ADDO:** Write that in your whatever-it-is.

-> a_van_lie_success (choices)

### node: a_van_lie_p4

*She points with the fork, across the plaza, at the grate by the bench.*

**ADDO:** Storm inlet. Sits on top of an old relief shaft for the Green Line. It's been breathing funny all night.

**MICHAEL:** Funny how?

**ADDO:** In.

*Sets `act1.leadA.van.pointedAtDel`.*

-> a_van_lie_success (choices)

### node: a_van_lie_close

*Sets `act1.leadA.van.outcome=lied`. Sets `act1.leadA.van.logSeen`.*

#### if speaker=manuel

*Sets `act1.leadA.van.loggedAs245`.*

**ADDO:** I'm logging you as 245 lab. That's a real contact, so somebody might follow it up.

**MANUEL:** With the lab?

**ADDO:** With the lab.

*Manuel's face does several things.*

**MANUEL:** I hate 245 lab.

**ADDO:** I got that.

#### if speaker=michael

**ADDO:** When's it come out? Your thing.

**MICHAEL:** Soon.

*The Purple Line sign is right there over his shoulder. He hears himself.*

**MICHAEL:** ...I'll bring you a copy.

**ADDO:** Sure you will, honey.

*Walking away:*

**TREVOR:** Now you have to make a documentary.

**MICHAEL:** I know.

**TREVOR:** With a pacifier.

**MICHAEL:** I *know*.

#### if speaker=trevor

**ADDO:** Hey. Magnesium.

*Trevor turns.*

**ADDO:** My brother went that road. The stacks. It was great for about two years.

**TREVOR:** What happened at two years?

**ADDO:** He stopped needing sleep. Then he stopped being able to.

*Trevor nods like it's useful data. He will think about it at 4 a.m. for the rest of the act.*

*End.*

### node: a_van_statue

*The speaker takes out one of Manuel's statues. John Pork, hand-sized, in a long coat.*

*Sets `act1.leadA.van.statueShown`.*

*Addo looks at it. Then she looks up at the mast, at the little glass eye under the anemometer.*

**ADDO:** Put him away.

**ADDO:** Mast has eyes. They aren't mine.

*The speaker puts it away. Addo watches where it goes.*

**ADDO:** My dad had the flag. Folded. In the drawer under the good tablecloth.

#### if speaker=manuel

**MANUEL:** I made that one.

**ADDO:** By hand?

**MANUEL:** By hand.

**ADDO:** It shows. Put him somewhere deeper than your pocket.

#### if speaker=trevor

**TREVOR:** He made it. By hand.

**ADDO:** *(to Manuel)* You sell these?

**MANUEL:** No.

**ADDO:** Good. Don't start on this plaza.

#### if speaker=michael

**MICHAEL:** My roommate makes them. He's really good.

**ADDO:** He is. That's the problem with it.

**MICHAEL:** How's that a problem?

**ADDO:** A bad one, I could say I didn't recognize.

*standing: callers +1. standing: continuity ±0 (she did not see it).*

-> a_van_approach (choices)

### node: a_van_sneak

*Requires `act1.leadA.snifferMuted`. If the sniffer is not muted when the party enters the van's
hearing radius, go to a_van_caught.*

*The plaza side of the van is out of her sightline. The mast's service panel is at shoulder height,
door hanging on one hinge. Inside: a column of channel labels, printed. And one that's a strip of
masking tape, handwritten.*

> `CH-01  PM2.5`
> `CH-02  PM10`
> `CH-03  NOx`
> `CH-04  O3`
> `CH-05  ROT-IDX`
> `CH-06  (spare)`
> *(tape, marker)* `CH-07  He  NEW. DO NOT DISABLE. (REGION)`

#### if speaker=trevor

**TREVOR:** *(whisper)* "He."

**MICHAEL:** *(whisper)* Who?

**TREVOR:** *(whisper)* Helium. The symbol.

**MICHAEL:** *(whisper)* I thought it meant a guy.

*Trevor starts to answer. Stops. Looks at the tape again.*

**TREVOR:** *(whisper)* ...It might also mean a guy.

#### if speaker=manuel

**MANUEL:** *(whisper)* Somebody wrote this by hand.

**TREVOR:** *(whisper)* It got added in a hurry.

**MANUEL:** *(whisper)* How much of a hurry?

*The marker ink is still shiny at the edges.*

#### if speaker=michael

**MICHAEL:** *(whisper)* "Do not disable." Why would you write that?

**TREVOR:** *(whisper)* Because somebody tried.

**MICHAEL:** *(whisper)* Who'd try?

*Through the van wall: the sound of a woman eating noodles, alone, at 3 a.m.*

*Sets `act1.leadA.t3Seen`.*

Choices:
- [speaker=michael][morph>=1] *Listen to the uplink.* -> a_van_sneak_signal
- *Look in the back window.* -> a_van_sneak_window
- *Go.* -> a_van_sneak_exit

### node: a_van_sneak_signal

*Michael puts two fingers against the mast. His eyes unfocus. He goes very still, the way he does
when his phone buzzes and he decides not to look.*

**MICHAEL:** *(whisper)* It's talking to somebody.

**TREVOR:** *(whisper)* Who?

**MICHAEL:** *(whisper)* Long address. It's not the abatement yard. It ends in "interdiction."

**MANUEL:** *(whisper)* What's it saying?

**MICHAEL:** *(whisper)* Three-sixteen, high. Three-nineteen, low. Then it just says "lost."

*He takes his fingers off. He shakes his hand out like it fell asleep.*

**MICHAEL:** *(whisper)* It's cold in there.

*Sets `act1.leadA.van.logSeen`.*

-> a_van_sneak (choices)

### node: a_van_sneak_window

*The rear window. Inside, on a shelf: rolls of yellow barrier tape, still shrink-wrapped. A carton
of printed notices. The top one is face-up.*

> `CONTINUITY AUTHORITY: NOTICE OF ORDER`
> `DISTRICT: COLLEGE PARK (ALL)`
> `EFFECTIVE: ________`
> `FOR YOUR SAFETY`

*The date is blank. Everything else has been filled in.*

**MANUEL:** *(whisper)* "All."

*Nobody whispers anything back.*

-> a_van_sneak (choices)

### node: a_van_sneak_exit

*Sets `act1.leadA.van.outcome=avoided`.*

*The party backs off toward the bench. standing: no change.*

-> a_trail_4_grate_approach

### node: a_van_caught

*The mast coughs. The unmuted sniffer shrieks. Inside the van, a fork stops.*

**ADDO:** *(from inside)* That's not one of mine.

*She leans out of the side door. She sees three students and a box with a pacifier on it.*

**ADDO:** That thing is loud.

*Sets `act1.leadA.van.met`. Sets `act1.leadA.van.outcome=caught` (overwritten by what follows).*

| id | speaker | trigger | line |
|---|---|---|---|
| a_caught_bark_1 | TREVOR | on caught, if speaker!=trevor | Mute. There's a mute. I *built* a mute. |
| a_caught_bark_2 | MANUEL | on caught, if speaker=trevor | Rookie Aster mistake. |
| a_caught_bark_3 | MICHAEL | on caught, if speaker=michael | I thought it was muted! It has a nose, not a mouth! |

-> a_van_caught_choices

### node: a_van_caught_choices

**ADDO:** What's it sniffing?

Choices:
- "Helium. Same as yours." -> a_van_honest
- "Rot. It's a rot meter." (lie) -> a_van_caught_lie
- *Run.* -> a_van_caught_run

### node: a_van_caught_lie

**ADDO:** A rot meter.

*The mast coughs. The sniffer shrieks. Addo looks at the mast. Looks at the sniffer.*

**ADDO:** A rot meter that goes off every time my helium reference fires.

*Silence.*

**ADDO:** You want to try again, or you want me to write down the first one?

Choices:
- "Helium." -> a_van_honest
- "Write down the first one." -> a_van_lie_fail

### node: a_van_caught_run

*The party scatters across the plaza. Addo doesn't chase. She watches them go, and eats a noodle.*

**ADDO:** *(calling after)* Plaza's open! You don't have to *run*!

*Sets `act1.leadA.van.outcome=caught`. standing: continuity -1. She logs "three unattested, fled,
carrying instrument." This can matter to Pruitt later.*

| id | speaker | trigger | line |
|---|---|---|---|
| a_run_bark_1 | MICHAEL | after run, behind cover | Why did we run? She said we could be here! |
| a_run_bark_2 | MANUEL | after run | Aster pros do not run. We relocated. |
| a_run_bark_3 | TREVOR | after run | My heart rate didn't even change. That's probably bad. |

-> a_trail_4_grate_approach

---

# Part 4: The bench (alternate route, and easter egg #10)

*NPC: a rotter on the bench that faces the Purple Line entrance. He wears a transit operator's
jacket, purple piping, sun-faded to gray on the shoulders. A cloth name tape on the chest: three
letters, DEL, then loose threads where the rest was. The jacket was issued for a line that never
opened.*

***The tell.** There are three other rotters on the plaza (see barks). Their heads don't move. Their
eyes stay on whatever their loop is stuck to: a wall, a dead screen, the billboard. Del's eyes
follow the nearest player. When a player comes within two tiles, he shifts six inches to the left on
the bench. He has left room. He does this every time, for every player, and for no one else.*

*This route does not need the sniffer. It can be done before, after, or instead of Parts 1 to 3.*

### node: a_del_approach

*Sets `act1.leadA.rotter.satStage=0` if unset.*

**DEL:** code rot. opening soon. code rot.

*His eyes are on you. The rest of him is pointed at the sign.*

Choices:
- *Sit down.* -> a_del_sit
- "Did you see a balloon?" -> a_del_ask
- [item statue] *Show him the statue.* -> a_del_statue
- [item sniffer] *Hold the sniffer near him.* -> a_del_sniffer
- *Leave.* -> END

### node: a_del_ask

**DEL:** code rot. code rot. please stand clear.

#### if speaker=manuel

**MANUEL:** Orange. About this big.

**DEL:** code rot.

**MANUEL:** ...Okay.

#### if speaker=trevor

**TREVOR:** He can't answer a question. The loop eats the input.

**MICHAEL:** So how do you talk to him?

**TREVOR:** I don't think you do.

#### if speaker=michael

**MICHAEL:** Sir? Hi. Sorry. Did you see a balloon?

**DEL:** opening soon.

**MICHAEL:** That's okay. Take your time.

-> a_del_approach (choices)

### node: a_del_statue

*The speaker holds out the statue. Del's loop stutters.*

**DEL:** code r. code.

*His hand comes up. He does not take the statue. He touches the hem of its coat with one finger,
the way you'd check whether paint is dry.*

**DEL:** it rang.

*Then his hand goes back to his knee.*

**DEL:** code rot. code rot.

*This does not count toward the sit timer and does not unlock anything. It is true under both seeds
and it tells the party nothing they can use. It is here because he was alive in 2071.*

-> a_del_approach (choices)

### node: a_del_sniffer

*The sniffer ticks at room rate. Nothing.*

**TREVOR:** He's not helium.

**MICHAEL:** Did you think he was?

**TREVOR:** I'm ruling things out.

-> a_del_approach (choices)

### node: a_del_sit

*The speaker sits in the space he left. The bench is cold. From here you can see what he sees: the
sign, the dead escalator, and past them the grate.*

*A quiet timer starts. See Notes. Standing up or opening a menu pauses it. Walking away resets
stage progress to the last completed stage.*

*Stage 1 fires at 12 seconds.*

### node: a_del_stage1

*Sets `act1.leadA.rotter.satStage=1`.*

**DEL:** code rot. doors closing. please stand clear of the doors.

**DEL:** nineteen oh one. opening soon. code rot.

*He says "doors closing" the way the trains say it. The exact melody. He practiced it.*

*While waiting, the other two roommates bark. One per 8 seconds, in order:*

| id | speaker | trigger | line |
|---|---|---|---|
| a_del_wait_1 | TREVOR | sitting, stage 1, speaker!=trevor | He's looping. We could be at the grate. |
| a_del_wait_1b | MICHAEL | sitting, stage 1, speaker=trevor | Are we... is this the plan? Sitting? |
| a_del_wait_2 | MICHAEL | sitting, stage 1 | That's a Purple Line jacket. They made the jackets. |
| a_del_wait_3 | MANUEL | sitting, stage 1, speaker!=manuel | He moved over. Did you see? He moved over for you. |
| a_del_wait_3b | TREVOR | sitting, stage 1, speaker=manuel | He moved over for you. He didn't have to. |

*Stage 2 fires at 35 seconds total.*

### node: a_del_stage2

*Sets `act1.leadA.rotter.satStage=2`.*

*The loop slows. A gap opens in it.*

**DEL:** code rot. code.

**DEL:** orange.

*The speaker does not move.*

**DEL:** orange. going down.

*His arm lifts. He doesn't point at the sky. He points at the grate.*

**DEL:** they go up. it went down. they go up.

**DEL:** doors closing.

*His arm stays up a moment after he's finished, like he forgot it. Then it settles.*

*Sets `act1.leadA.rotter.orangeHeard`.*

#### if speaker=manuel

**MANUEL:** When?

**DEL:** code rot.

**MANUEL:** No. Please. When did it go down?

**DEL:** code rot. code rot.

*Manuel nods. He got more than he had.*

**MANUEL:** Gracias.

#### if speaker=trevor

**TREVOR:** He saw it.

**MICHAEL:** He could be saying anything.

**TREVOR:** "They go up. It went down." That's not a loop. That's a guy noticing something was wrong.

#### if speaker=michael

**MICHAEL:** The grate. He's pointing at the grate.

**MANUEL:** Ask him again.

**MICHAEL:** I don't think it's an asking thing. I think he just had to get there.

*Journal: "A man on the plaza bench saw orange go down the storm grate. Balloons go up. This one
didn't."*

*The other two roommates are already turning toward the grate.*

| id | speaker | trigger | line |
|---|---|---|---|
| a_del_go_1 | TREVOR | after stage 2, speaker!=trevor | That's it. That's the lead. Come on. |
| a_del_go_1b | MANUEL | after stage 2, speaker=trevor | The grate. Trevor. Come on. |

Choices:
- *Get up. Go to the grate.* -> a_grate_arrive
- *Stay.* -> a_del_stay

### node: a_del_stay

*The speaker stays on the bench. Nothing prompts this. The game does not suggest it.*

*The timer continues. If the player moves, it cancels, and the stage can be retried by sitting
again. Other players are free to walk off. Their barks:*

| id | speaker | trigger | line |
|---|---|---|---|
| a_del_stay_1 | TREVOR | stage 2, +10s, speaker!=trevor | ...Or we sit. Okay. |
| a_del_stay_1b | MICHAEL | stage 2, +10s, speaker=trevor | Trevor's sitting. Trevor never sits. |
| a_del_stay_2 | MANUEL | stage 2, +22s, speaker!=manuel | Leave it. It's fine. Five minutes. |
| a_del_stay_2b | MICHAEL | stage 2, +22s, speaker=manuel | Take your time, man. |

*At +30 seconds: the barks stop. The plaza audio ducks. The ticker completes one full pass with no
one reading it. The Purple Line sign flickers once, OPENING SOON, and steadies.*

*Del's loop has stopped. For the first time his text box opens and is empty.*

**DEL:** ...

*At +45 seconds:* -> a_del_egg

### node: a_del_egg

*Sets `act1.leadA.rotter.satStage=3`. Sets `act1.leadA.rotter.eggHeard`. Easter egg #10.*

*He isn't looking at the sign. He isn't looking at the speaker. He's looking at the empty space on
the bench on his other side.*

*The text renders clean. No jitter, no dropped letters. Normal case. It is the only line he will
ever have that looks like everyone else's.*

**DEL:** I used to be someone's favorite person.

*Hold. Four seconds. No music.*

*Then his eyes come back to the sign.*

**DEL:** opening soon.

**DEL:** code rot. code rot.

#### if speaker=michael

*Michael takes his phone out. Looks at it. Not at the screen. At the phone.*

*He puts it face down on the bench between them.*

**MICHAEL:** Yeah.

*That's all. After a while he picks the phone up again and stands.*

*If Trevor or Manuel is within earshot:*

**TREVOR:** What'd he say?

**MICHAEL:** Nothing. He's good. Let's go.

#### if speaker=manuel

*Manuel doesn't say anything. He unscrews the thermos. He fills the mate, the way you fill it for
the next person in the circle, and sets it on the bench by Del's hand.*

*Del doesn't take it.*

**MANUEL:** It's hot. Careful.

*He leaves it there. Sets `act1.leadA.rotter.mateLeft`. The gourd stays on the bench for the rest
of the act. If the party passes later, it has been moved six inches. It is never seen to be empty.*

*If Trevor or Michael is within earshot:*

**MICHAEL:** That's your good one.

**MANUEL:** I have another.

*He doesn't.*

#### if speaker=trevor

*Trevor turns his hand over and holds the back of it near the port behind Del's ear. Not
touching. The way you check a soldering iron.*

**TREVOR:** It's warm.

*He holds it there.*

**TREVOR:** It's still trying to run.

*He takes his hand back. Looks at it. Opens and closes it.*

*If Manuel or Michael is within earshot:*

**MICHAEL:** Can you fix it?

**TREVOR:** No.

**MICHAEL:** Could anybody?

**TREVOR:** I'm going to stop taking the blue ones.

*He isn't.*

*After this node, Del only says "code rot." and its variants. `a_del_sit` no longer advances. He
still moves over. The achievement/secret counter ticks: "The rotter who says something else."*

*standing: no faction. This one isn't for anybody.*

### node: a_del_return

*Any later interaction, after `act1.leadA.rotter.eggHeard`.*

**DEL:** code rot. opening soon.

*He moves over.*

[if `act1.leadA.rotter.mateLeft`]

*The gourd is by his hand. The straw is turned toward him now.*

---

# Part 5: The grate

### node: a_grate_arrive

*Trigger: the party reaches the storm grate, by the sniffer trail, by Del's pointing, or by Addo's.*

*Sets `act1.leadA.grateReached`. Sets `act1.leadA.trailStep=5`.*

*A storm inlet set in the pavers, a meter across, cast iron. A stencil on the curb: P-4. A newer
plate bolted over the old hinges, Continuity mark, tamper bolts. Somebody has dropped a noodle cup
lid nearby. It's lying flat against the bars. It isn't moving. It's being held there.*

[if item sniffer and not `act1.leadA.snifferMuted`]

*The sniffer's clicks run together into one tone as it comes over the bars. Then, when it's lowered
toward the dark, the tone climbs.*

[if item sniffer and `act1.leadA.snifferMuted`]

*The sniffer's little trace climbs off the top of its screen and stays there.*

[if not item sniffer]

*There's no instrument to check it with. There's the lid on the bars, and a man on a bench who
pointed here.*

#### if speaker=michael

**MICHAEL:** Feel that.

*He holds his hand over the grate.*

**MICHAEL:** It's pulling. Vents blow out, right? Trains push air out. This is going in.

**TREVOR:** ...Yeah. It is.

**MICHAEL:** So helium goes up, except tonight, and vents blow out, except this one.

**TREVOR:** Yeah.

**MICHAEL:** I don't love that I'm the one who noticed.

#### if speaker=trevor

*Trevor tears a strip off a receipt and lets go of it over the bars. It doesn't flutter. It snaps
flat against the iron.*

**TREVOR:** Negative pressure. Something down there's drawing air.

**MANUEL:** The trains?

**TREVOR:** Trains push. This is one direction, steady. Like a fan.

**MICHAEL:** Whose fan?

**TREVOR:** I don't know.

*He says it plainly. It costs him something.*

#### if speaker=manuel

*Manuel kneels. He puts his face close to the bars. There's nothing to see. He looks anyway.*

**MANUEL:** It's down there.

**TREVOR:** The reading says it went down there. That's not the same thing.

**MANUEL:** It didn't fall, Trevor. It doesn't fall. It doesn't know how.

*The lid trembles against the bars.*

**MANUEL:** Something took it down.

-> a_grate_crossref

### node: a_grate_crossref

[if flag act1.leadC.complete]

**TREVOR:** The footage. On the roof. It went down the shaft.

**MICHAEL:** And then it came out here?

**TREVOR:** No. It went down there and it went down here. Same direction twice.

**MANUEL:** Same thing pulling.

[if flag act1.leadA.van.logSeen]

**TREVOR:** Three-sixteen at the roof. Three-nineteen here. That's a straight line and it's fast.

**MICHAEL:** How fast does a balloon go?

**TREVOR:** Not that fast. Not on its own.

[if flag act1.leadA.rotter.orangeHeard and item sniffer]

**MANUEL:** He told us. "They go up. It went down."

**TREVOR:** And the box agrees with him.

**MANUEL:** We should have just sat down first.

[if flag act1.leadA.rotter.orangeHeard and not item sniffer]

**TREVOR:** One witness. No instrument.

**MANUEL:** He pointed.

**TREVOR:** I know. I'm saying I believe him. I'm also saying I'd like a number.

-> a_grate_open_attempt

### node: a_grate_open_attempt

Choices:
- *Try the grate.* -> a_grate_bolts
- *Listen.* -> a_grate_listen
- *Step back.* -> a_grate_done

### node: a_grate_bolts

*Tamper bolts. Five-lobed, with a pin in the middle. The plate is newer than anything else on the
plaza.*

#### if speaker=trevor

**TREVOR:** I don't have that bit.

**MICHAEL:** You have every bit.

**TREVOR:** I have every bit they sell.

#### if speaker=manuel

**MANUEL:** We drill them.

**TREVOR:** Forty meters from an abatement van.

**MANUEL:** ...We drill them later.

#### if speaker=michael

**MICHAEL:** Could we fit through the bars?

**TREVOR:** No.

**MICHAEL:** Could *one* of us fit through the bars?

*Trevor and Manuel both look at him.*

**MICHAEL:** I'm not volunteering. I'm asking in general.

*The grate does not open in Act 1. The way down is the Green Line maintenance access (Beat 4).*

**TREVOR:** It's a relief shaft. It has to come out somewhere a person can stand. Station side. Maintenance level.

-> a_grate_open_attempt (choices)

### node: a_grate_listen

*The speaker crouches. The draft hums in the bars. Under it, a long way down: water. A fan,
maybe. The building-sized quiet of a tunnel at night.*

[if not `act1.leadA.grate.drumHeard`]

*And then three knocks. Wood on something. Evenly spaced. Unhurried.*

*Then nothing.*

*Sets `act1.leadA.grate.drumHeard`.*

#### if speaker=manuel

**MANUEL:** Pipes.

**TREVOR:** Pipes don't keep time.

**MANUEL:** Pipes, Trevor.

#### if speaker=trevor

**TREVOR:** Did anybody else

**MICHAEL:** Yes.

**MANUEL:** No.

*They look at Manuel.*

**MANUEL:** ...Yes.

#### if speaker=michael

**MICHAEL:** Somebody's down there. Knocking.

**TREVOR:** On what?

**MICHAEL:** I don't know. It sounded polite.

[else]

*Water. The fan. Nothing else. It doesn't knock twice.*

-> a_grate_open_attempt (choices)

### node: a_grate_done

*Sets `act1.leadA.complete`. Counts toward "any 2 of 3 leads" (Beat 2).*

*The party stands around a hole in the ground at half past three in the morning.*

#### if speaker=manuel

**MANUEL:** So it's under the station.

**TREVOR:** Somewhere under.

**MANUEL:** Then that's where I'm going.

**MICHAEL:** That's where *we're* going.

**MANUEL:** That's what I said.

#### if speaker=trevor

**TREVOR:** Okay. What we know. It left the roof. It came down, against physics, in three minutes. It went in here. And somebody with a government van was watching for it before it ever left.

**MICHAEL:** Before?

**TREVOR:** The channel's been live since Monday.

*Manuel is quiet.*

**MANUEL:** I only checked on it. Every morning. That's all I did with it.

**TREVOR:** I know.

#### if speaker=michael

**MICHAEL:** Okay, so. Good news, we know where it went.

**TREVOR:** And the bad news?

**MICHAEL:** I didn't have bad news. I was just going to do the good news.

*Manuel laughs. Once, through his nose. It's the first time tonight.*

[if `act1.leadA.van.warnedSix`]

**TREVOR:** She said six. Day crew.

**MANUEL:** Then we're back before six.

[if flag act1.leadB.complete or flag act1.leadC.complete]

*This is the party's second lead. The plaza lights dip, all of them together, just for a moment.
(Hand-off to Beat 3, the Call. This scene does not play it.)*

*Journal: "LEAD A, the helium trail: complete. The balloon went down storm inlet P-4, into the
Green Line relief shaft. Balloons don't go down. And Continuity was listening for helium before
ours went missing."*

*End.*

---

# Plaza ambient

## Ticker wall

*Crawls right to left over the station mouth. Continuity house style: calm, passive, no one at
fault. Lines cycle in a shuffled order. `tick_gulf` is forced the first time at trail step 2.
`tick_stable` plays between every third line. One line in six renders with a rot artifact (a
dropped word, or the timestamp reading 19:01).*

| id | speaker | trigger | line |
|---|---|---|---|
| tick_stable | TICKER | every 3rd slot | CITIZENS, THINGS ARE STABLE. |
| tick_balt_1 | TICKER | cycle | BALTIMORE: ABATEMENT CONTINUES IN FOUR DISTRICTS. RESIDENTS ARE SAFE INDOORS. |
| tick_balt_2 | TICKER | cycle | BALTIMORE: WATER DELIVERY SCHEDULES HAVE BEEN ADJUSTED FOR YOUR SAFETY. |
| tick_norfolk_1 | TICKER | cycle | NORFOLK: HARBOR NETWORKS ISOLATED AS A PRECAUTION. NO CASUALTIES HAVE BEEN ATTESTED. |
| tick_norfolk_2 | TICKER | cycle | NORFOLK: ROT INDEX ELEVATED. THE TERM "OUTBREAK" IS NOT IN USE. |
| tick_union_1 | TICKER | cycle | ANALOG UNION CLOSES REMAINING LAND CROSSINGS. TRAVELERS ARE ADVISED TO HAVE BEEN ELSEWHERE. |
| tick_union_2 | TICKER | cycle | ANALOG UNION: PAPER DOCUMENTS ONLY AT ALL PORTS OF ENTRY. PATIENCE IS APPRECIATED. |
| tick_gulf | TICKER | cycle; forced at trail step 2 | GULF TRANSIT LANE: HELIUM CONVOY INTERDICTED. SUPPLY IS STABLE. |
| tick_gulf_2 | TICKER | cycle, after tick_gulf has played | GULF: RESPONSIBILITY HAS NOT BEEN ASSIGNED. MEDICAL IMAGING REMAINS AVAILABLE BY LOTTERY. |
| tick_stack | TICKER | cycle | SOVEREIGN STACK EXERCISES NOTED IN THE PACIFIC. THEY HAVE BEEN NOTED. |
| tick_green | TICKER | cycle | GREEN LINE: SERVICE IS NORMAL. PLEASE DISREGARD SOUNDS. |
| tick_purple | TICKER | cycle | PURPLE LINE: OPENING SOON. |
| tick_cp | TICKER | cycle, only after `act1.leadA.t3Seen` | PRINCE GEORGE'S COUNTY: AIR QUALITY MONITORING HAS BEEN EXPANDED. NO ACTION IS REQUIRED. |
| tick_slogan | TICKER | 1 in 6, rot artifact | AT THE END OF THE DAY NO ONE CAN CAN CAN |

## Inspectables

| id | speaker | trigger | line |
|---|---|---|---|
| amb_purple_sign | (inspect) | inspect Purple Line sign | PURPLE LINE. OPENING SOON. Underneath, a strip where the date goes. It's stickers on stickers, a little stack of them, each one covering the last. The top sticker is blank. |
| amb_purple_sign_2 | MICHAEL | inspect sign, 2nd time | My girlfriend says it's nicer down here at night. Fewer people to be late for. |
| amb_purple_escalator | (inspect) | inspect escalator | An escalator with the factory film still on the handrail. Someone has kept the steps swept. |
| amb_billboard | (inspect) | inspect billboard | A billboard on the garage wall, backlit, half the panels dead. A smiling person at a desk with no keyboard on it. AT THE END OF THE DAY, NO ONE CAN CODE FASTER THAN AI. The smile has rotted. The pixels have slid down the face and pooled in the jaw. |
| amb_billboard_manuel | MANUEL | inspect billboard, speaker=manuel | They never took it down. |
| amb_billboard_trevor | TREVOR | inspect billboard, speaker=trevor | It was true, though. That was the problem with it. |
| amb_billboard_michael | MICHAEL | inspect billboard, speaker=michael | What was he coding? There's nothing on the desk. |
| amb_van_side | (inspect) | inspect van exterior | ABATEMENT INC., under contract to the Continuity Authority. CLEAN AIR IS A SHARED DUTY. A phone number. Someone has keyed a small pig into the paint below it, and someone else has tried to buff it out, and not tried very hard. |
| amb_van_mast | (inspect) | inspect mast from a distance | A sensor mast. An anemometer, a row of intake ports, a glass eye. Every forty seconds it coughs. |
| amb_bench_plaque | (inspect) | inspect bench (not seated) | A small plate on the backrest: RESERVED FOR TRANSIT STAFF. |
| amb_grate_stencil | (inspect) | inspect curb | P-4. Under it, older paint: WMATA. Under that, older still, a child's chalk sun that the rain never quite got. |
| amb_scooter_rack | (inspect) | inspect scooter rack | Nine scooters. Two are rotted and display the year 1901 and a full battery. They will not unlock. |

## Barks

| id | speaker | trigger | line |
|---|---|---|---|
| bark_plaza_enter_1 | MANUEL | first entry to plaza with sniffer | Aster pros. In the field. |
| bark_plaza_enter_2 | TREVOR | reply to bark_plaza_enter_1 | We crossed a street. |
| bark_sniff_scooter | TREVOR | riding a scooter with sniffer equipped | Slow down. It can't smell at this speed. |
| bark_sniff_cold | MICHAEL | click rate falling for 6s | Colder. We're getting colder. |
| bark_sniff_cold_2 | TREVOR | reply, 1 in 2 | You don't have to narrate it. It narrates itself. |
| bark_sniff_hot | MICHAEL | click rate rising for 6s | Warmer! |
| bark_sniff_name_olfa | MANUEL | idle 20s with sniffer, name=olfa | Good Olfa. Tell me what I want to hear. |
| bark_sniff_name_unit | TREVOR | idle 20s with sniffer, name=unit_one | Unit One nominal. |
| bark_sniff_name_truffle | MICHAEL | idle 20s with sniffer, name=truffle | Who's a good Truffle. |
| bark_sniff_mate | TREVOR | Manuel drinks mate within 1 tile of the sniffer | Manuel. Downwind. |
| bark_245 | MANUEL | random, plaza, 1 per visit | I hate 245 lab. |
| bark_245_reply | MICHAEL | reply to bark_245, 1 in 3 | We're not even in it right now. |
| bark_245_reply_2 | MANUEL | reply to bark_245_reply | It's in me. |
| bark_gf_plaza | MICHAEL | random, near station mouth | She used to time the walk from here to our door. Four minutes ten. |
| bark_gf_plaza_2 | MICHAEL | random, after bark_gf_plaza, later visit | I've never beaten four ten. |
| bark_supp_cold | TREVOR | random, plaza | I can't feel the cold. That's the niacin. Or it's just not cold. |
| bark_shrimp | TREVOR | random, after `act1.leadA.t3Seen` | If they're sampling the air, somebody's sampling the water. I should check the tank. |
| bark_muted | MANUEL | sniffer muted for 60s | I liked it better when it talked. |
| bark_van_far | MICHAEL | looking at van from > 8 tiles, before `van.met` | She's just eating. She's got a whole dinner in there. |
| bark_del_far | MANUEL | within 5 tiles of Del, before `rotter.satStage>=1` | That one's watching us. The others don't watch. |
| bark_del_far_2 | TREVOR | reply to bark_del_far | He's not watching. He's just pointed this way. |
| bark_del_far_3 | MANUEL | reply to bark_del_far_2 | He moved over. |
| bark_after_egg | MICHAEL | first time leaving plaza after `rotter.eggHeard`, speaker!=michael | You were over there a while. |
| bark_after_egg_reply | (speaker) | reply to bark_after_egg | Yeah. |
| bark_six | TREVOR | in-game clock passes 5:30, `van.warnedSix`, party on plaza | Half an hour. She said six. |

## Other rotters on the plaza (not Del)

*Three, placed: one under the billboard, one at the ticker wall, one by the scooter rack. Heads
fixed. Eyes fixed. They do not track the player and do not move over. Interacting gives one line
from their pool. They are not hostile.*

| id | speaker | trigger | line |
|---|---|---|---|
| rot_bill_1 | ROTTER (billboard) | interact | at the end of the day. at the end of the day. no one can. |
| rot_bill_2 | ROTTER (billboard) | interact, 2nd | no one can code faster than. code rot. no one can code faster than. |
| rot_bill_3 | ROTTER (billboard) | interact, 3rd and after | at the end of the day no one can code faster than AI. code rot. at the end of the |
| rot_tick_1 | ROTTER (ticker) | interact | stable. things are stable. things are. code rot. |
| rot_tick_2 | ROTTER (ticker) | interact, 2nd and after | nineteen oh one. nineteen oh one. stable. |
| rot_scoot_1 | ROTTER (scooter rack) | interact | unlock. unlock. code rot. please attest. unlock. |
| rot_scoot_2 | ROTTER (scooter rack) | interact, 2nd and after | please attest. please attest. please. |
| rot_react_manuel | MANUEL | after any rot_bill line, once | He's got the whole slogan in there. That's all that's left and it's an ad. |
| rot_react_trevor | TREVOR | after any rot_scoot line, once | His lace is still asking for a license server that shut down before we were born. |
| rot_react_michael | MICHAEL | after any rot_tick line, once | Do you think they know we're here? ...Don't answer that. |

---

## Notes for implementers

**Speaker.** In Part 1 the speaker is whoever interacted with the fab. In Part 2 it is whoever
carries the `sniffer` item (it can be handed off; re-evaluate per waypoint). In Parts 3 to 5 it is
whoever started the dialogue. In solo play the two absent roommates are AI companions and still
deliver their lines. In two-player co-op the third roommate is a companion. Lines marked "if
within earshot" need the listener within 6 tiles.

**Fab crafting (Part 1).** Four steps: print (scrap x2, 11 "minutes" compressed to about 20 real
seconds, during which the banter choices are available), solder (no input, plays the speaker
variant), degas (a 6-second animation: the resin rises to the rim, holds for 1 second, collapses;
do not skip it, it is the tutorial's one beautiful thing), tune (oscilloscope minigame). Printer #3
cannot be selected. Its bed light is on in every visit to 631 for the whole act. Do not attach any
UI text to it beyond what the cold open already has.

**Oscilloscope minigame.** Two dials, BALANCE and GAIN. The trace is a sine with slow DC drift.
Win: amplitude under threshold and offset within the center graticule line for 3 continuous
seconds. Fail: trace leaves the screen. After 4 fails halve the drift. The scope's corner clock
always reads 19:01 (rotted; it is one of the clocks for the 1901 puzzle in DESIGN §8, so make it
settable later, but here it is display only). **MVP fallback:** if the minigame is not built, the
"Tune it" choice goes straight to `a_fab_first_reading` with a 2-second trace animation.

**Morph shortcuts.** `[morph>=1]` on a speaker-gated choice checks that speaker's own morph stage.
The Trevor and Manuel scope shortcuts and the Trevor stare each trigger that character's stage-1
"visible cost" bark budget (count them as one of the costs for the act). Michael's "signal" stage
is a placeholder; `a_van_sneak_signal` is written so it can be cut cleanly if that stage changes.

**The sniffer.** Gadget-slot item. Audio: a click whose rate maps to distance from the *next*
waypoint (1 click per 3 s at 20+ tiles, continuous tone at under 1 tile). HUD: a 24-pixel scope
trace by the item icon that rises with rate. Mute toggle sets `act1.leadA.snifferMuted`; muted, the
HUD trace still works. Riding a scooter at speed drops the reading to room rate (bark
`bark_sniff_scooter`). The sniffer false-alarms on steam: if Manuel uses the mate within 1 tile of
the carrier, it shrieks for 1 second (`bark_sniff_mate`). This is a joke, and it is also the reason
the mast's cough reads as a hit.

**Waypoints.** 0 ASTER lobby door, 1 Purple Line entrance sign, 2 under the ticker wall, 3 the van
(8-tile radius triggers `a_trail_3_van`), 4 the bench area, 5 the grate. Waypoint nodes fire once
each. They can be skipped: reaching the grate by any route sets `trailStep=5`.

**The mast.** Coughs every 40 seconds (small puff sprite, a throat-clearing sound). On each cough
any unmuted sniffer within 10 tiles shrieks for 1 second. The van's hearing radius is 5 tiles
around the open side door, blocked by the van body on the plaza side (that is the sneak lane to the
service panel and the rear window). An unmuted shriek inside the hearing radius fires
`a_van_caught` once.

**Addo.** She stays in the side door all night. Her eyes go to the ticker whenever a `tick_balt_*`
line is on screen, in or out of dialogue; this is an idle animation, not a line. If the in-game
clock reaches 6:00 the van is replaced by a day-crew van with the side door shut and no dialogue
(stretch; for MVP she simply stays). `van.outcome` values and their later uses: `honest` (she did
not log the party; Pruitt has nothing), `lied` (she logged a cover story; with `loggedAs245`,
Pruitt can turn up at 245 lab in a later scene), `lie_failed` and `caught` (she logged "three
unattested with an instrument"; Pruitt has a description). `avoided` leaves no log. The stretch
boss in DESIGN §6 (the abatement unit that tracked the helium) should read `act1.leadA.t3Seen` so
the party recognizes the mast on it.

**T3 clue.** `act1.leadA.t3Seen` is set by any of: the waypoint 3 node, asking about the mast, the
service panel. The stronger version (`van.logSeen`: the uplink ends in INTERDICTION, the helium
went high then low in three minutes) is optional and reachable three ways (honest, lie, Michael's
signal). Nothing in this scene says why Continuity wants helium. Do not add a line that does.

**Twist fairness check.** Every clue here holds under both seed variants: printer #3 is warm and
nobody accounts for it; helium was detected at the roofline and then at the grate three minutes
later; the grate is drawing air inward; Continuity's helium channel went live on Monday, before the
balloon went missing; Del's "it rang" refers to 2071. No line names a culprit, and no roommate
flatly denies anything. Keep it that way in edits: in `a_fab_printer3` nobody says "not me."

**Del's bench.**
- *Tell:* eye-tracking sprite (pupils follow the nearest player within 6 tiles; the three other
  rotters have fixed pupils) and a 6-pixel shift left when a player enters 2 tiles. He resets to
  center when no one is within 4 tiles.
- *Timers* (seated time, cumulative, paused by menus and by standing): stage 1 at 12 s, stage 2 at
  35 s. If the player chooses "Stay": barks at +10 s and +22 s, silence and audio duck at +30 s,
  the line at +45 s. Total from first sitting to the line is 80 seconds. That is inside the
  discoverability rule (SECRETS.md): low enough to hit by staying put, hinted by
  `bark_del_far`/`bark_del_far_3`, by Addo's "He'll make room for you," and by the bench itself.
- Any player movement input during "Stay" cancels the stage; sitting again restarts from +0 of
  that stage, not from the beginning.
- The egg line renders in the standard dialogue font with **no** rot shader. Every other rotter
  line, including Del's, uses the lowercase jitter style. That contrast is the effect. No music
  sting. Hold 4 seconds before the next line can be advanced.
- It fires once per save. After it, `a_del_return` only.
- In co-op, only the seated player needs to stay. The reaction variant is the seated player's. Other
  players see the line if they are within 6 tiles; otherwise they get `bark_after_egg` later.
- If `rotter.mateLeft`: place a gourd prop on the bench for the rest of Act 1. Each time the plaza
  loads, nudge its position or straw angle slightly. Manuel's mate heal at the 631 station still
  works (he has "another"; cosmetically his field gourd is gone until the act ends).
- The rotter route alone completes the lead (`orangeHeard` then reaching the grate). It does not
  set `t3Seen`. A party that only sits with Del finishes Lead A without the T3 clue unless they
  also look at the van; that is intended.

**The grate.** Does not open in Act 1. The noodle-cup lid is a prop held against the bars by the
draft (a 2-frame tremble). `a_grate_listen` plays the three knocks once per save, at any hour; this
is the only Sahur presence in the scene and it is sound only. `a_grate_done` sets
`act1.leadA.complete`; if it is the party's second completed lead, dip the plaza lights and hand
off to the Call scene. Do not start the Call from inside this dialogue tree.

**Ticker.** One line on screen at a time, about 9 seconds per pass. Shuffle with the scene RNG
stream, not the world seed. Force `tick_gulf` at waypoint 2. Force a `tick_balt_*` line during
`a_van_honest_why` so Addo's glance has something to land on.

**Standing.** Honest with Addo: continuity +1. Failed lie or running: continuity -1. Statue shown
and put away when asked: callers +1. Del: none.

**Assumed from other scenes.** `act1.building.leadsFound` (Beat 1), `act1.coldopen.printer3Inspected`
(cold open), the `statue` item (one of Manuel's three, carried from 631), and the Lead B/C
completion flags. Rename here if those scenes use different ids.

**New names in this file.** Corinne Addo (abatement field tech), Del (the bench rotter; name tape
only), inlet P-4, mast channel CH-07, sniffer names El Olfa / Unit One / Truffle, Michael's fake
documentary "The People Who Keep the Night On."
