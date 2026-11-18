# Lead C: the footage

**Purpose.** The puzzle lead (DESIGN §3, Lead C). The party repairs ASTER's rotted lobby camera with
the soldering iron from 631 (a signal-routing puzzle with banter and three levels of hints), then
watches what the roof feed recorded at 3:14 a.m.: a figure on the roof holding the orange balloon,
letting it go, and the balloon drifting *down* a ventilation stack. The scene gives the party a
piece of the trail (it went down, under the building) and plants the seeded roof-footage clue
(DESIGN §9). Nothing here says which variant is true. Under seed A the figure is too smooth to be a
person and nobody can say what it is. Under seed B the figure is one roommate's silhouette, the clock
blinks 1901, and nobody, including that roommate, can say how.

**Flags**

Reads:
- `world.seed.variant` (A or B), written in conditions as `[seed=A]` / `[seed=B]`
- `world.seed.subject` (manuel, trevor, or michael; only meaningful under B), written as `[subject=manuel]` etc.
- `[speaker=...]`: the roommate who is interacting. `[speaker=subject]` / `[speaker!=subject]` compare the two
- `[item soldering_iron]` (picked up from the bench in 631)
- `[morph>=1]` (the speaker's morph stage)
- `act1.coldopen.latchInspected`, `act1.coldopen.printerInspected` (optional callbacks)
- `act1.call.happened` (optional bark)
- `act1.halvard.sellerDescribed` (optional bark: "one of you, or wearing your face")

Sets:
- `act1.leadC.cameraInspected`: the party has looked at the dead camera
- `act1.leadC.needIron`: they looked without the iron (adds a marker on the 631 bench)
- `act1.leadC.housingOpen`: puzzle unlocked
- `act1.leadC.hintLevel`: 0–3, highest hint shown
- `act1.leadC.clockMisrouted`: the player saw 1901 on the preview during the puzzle at least once
- `act1.leadC.usedGuitarString`: Trevor's high E went into the board
- `act1.leadC.bodged`: solved by the brute-force route (one viewing only)
- `act1.leadC.repaired`: the camera works
- `act1.leadC.footageWatched`: the 3:14 clip has played through once
- `act1.leadC.figure`: `smooth`, `manuel`, `trevor`, or `michael` (what the party saw)
- `act1.leadC.stance`: `pressed`, `defended`, `dropped` (B only: how the other two handled it) or `owned`, `joked`, `quiet` (B only: how the figure's player handled it)
- `act1.leadC.replays`: count of replays
- `act1.clue.roofFootage`: the DESIGN §9 clue is in the journal
- `act1.trail.shaft`: the party knows the balloon went down the roof vent stack
- `act1.leadC.done`: lead complete (counts toward "any 2 of 3")

---

## Part 1: the lobby

### node: leadc_lobby_approach

*ASTER lobby. Mailboxes with half the doors missing. Above them, a dome camera with a dead status
light and a ring of rot around its mount: the wall tiles there render a half-second late. A monitor
bolted beside it shows gray. Taped under the dome, a laminated note in marker.*

**SYSTEM:** *(the note)* CAMERA IS FINE. DO NOT TOUCH. — MGMT

#### if speaker=manuel
**MANUEL:** The camera is fine.

**TREVOR:** The camera's been dead since October.

**MANUEL:** The note says it's fine.

**MICHAEL:** The note's laminated. Somebody laminated a lie.

#### if speaker=trevor
**TREVOR:** Dead since October. I reported it twice.

**MICHAEL:** To who?

**TREVOR:** There's a form.

**MANUEL:** There is no form. I looked for the form.

#### if speaker=michael
**MICHAEL:** This thing sees the whole lobby, right? Front door, stairs, elevator.

**TREVOR:** It sees nothing. Look at the light.

**MICHAEL:** My girlfriend used to wave at it. Every time. In case somebody was bored up there.

**MANUEL:** Nobody was up there.

**MICHAEL:** She knew that.

*Beat. The monitor's gray flickers, shows one frame of a rooftop, and goes gray again.*

**TREVOR:** That wasn't the lobby.

**MANUEL:** That was the roof. It has the roof feed.

**MICHAEL:** So it's all one box. Lobby, roof, everything. And the box is rotted.

Choices:
- [item soldering_iron] "Open it up." -> leadc_open_housing
- [!item soldering_iron] "Open it up." -> leadc_no_iron
- "Read the note again." -> leadc_note_again
- "Leave it." -> END

### node: leadc_note_again

*Sets nothing. Repeatable.*

**SYSTEM:** *(the note, smaller, underneath)* tampering = lease violation. cameras are for your safety.

**MANUEL:** "For your safety."

**TREVOR:** They all say that.

Choices:
- [item soldering_iron] "Open it up." -> leadc_open_housing
- [!item soldering_iron] "Open it up." -> leadc_no_iron
- "Leave it." -> END

### node: leadc_no_iron

*Sets `act1.leadC.cameraInspected`, `act1.leadC.needIron`.*

*The speaker gets the dome off with a thumbnail. Inside: a small green board, furred gray in
patches, like frost that glitches.*

#### if speaker=manuel
**MANUEL:** Traces are eaten. Here, here, here. I can go around them.

**TREVOR:** With what?

**MANUEL:** ...With the iron that is on the bench. Upstairs.

**MICHAEL:** Rookie Aster mistake.

**MANUEL:** I did not make a mistake. I made a plan with a step missing.

#### if speaker=trevor
**TREVOR:** Board's rotted through in three places. It's routable. I'd need the iron.

**MANUEL:** The iron is on the bench.

**TREVOR:** I know where the iron is.

**MICHAEL:** Do you have it?

**TREVOR:** I know where it is.

#### if speaker=michael
**MICHAEL:** Okay. That's bad, right? The fuzzy part?

**TREVOR:** That's rot. You don't fix rot. You solder around it.

**MICHAEL:** So we need the—

**MANUEL:** The iron. On the bench. Six floors up.

**MICHAEL:** I'm gonna say it before you do. Aster noob. Me. Fine.

*The dome clicks back on. A marker appears on the bench in 631.*

-> END

### node: leadc_open_housing

*Sets `act1.leadC.cameraInspected`, `act1.leadC.housingOpen`. The dome comes off. The board
underneath fills the screen: the puzzle view. Rotted cells crawl. The preview monitor sits in the
corner of the view, gray.*

#### if speaker=manuel
*Manuel licks his thumb, tests the iron's tip with it, and regrets it.*

**MANUEL:** Hot.

**TREVOR:** That's how it works.

**MANUEL:** Three lines. Power, clock, video. All three have to get from this side to that side, and
the rot is in the way.

**MICHAEL:** That's it?

**MANUEL:** That's it. This is 245 lab. I hate 245 lab.

#### if speaker=manuel and morph>=1
*The gonman holds the iron like a pen. His hand does not move at all. It is a little too still.*

**TREVOR:** You're not breathing.

**MANUEL:** The gonman breathes later.

**MICHAEL:** I don't love that.

#### if speaker=trevor
*Trevor shakes two capsules out of an unlabeled bottle, dry-swallows them, and picks up the iron.*

**MICHAEL:** What were those?

**TREVOR:** Theanine. For the hands.

**MANUEL:** Your hands are shaking.

**TREVOR:** That's the caffeine. The theanine is for the caffeine.

**TREVOR:** Three lines. Power, clock, video. Get them across without touching the gray.

#### if speaker=trevor and morph>=1
*Trevor's pupils are very wide. He can see the grain in the solder.*

**TREVOR:** I can hear the board.

**MANUEL:** No you can't.

**TREVOR:** It's sixty hertz. It's flat.

#### if speaker=michael
*Michael holds the iron by the right end, which seems to surprise the other two.*

**MICHAEL:** What? I've soldered.

**TREVOR:** When?

**MICHAEL:** My girlfriend had this radio kit. She did the joints, I held the board. She had really
steady hands.

*Beat.*

**MICHAEL:** Has. Has steady hands.

**MANUEL:** Three lines, Michael. Power, clock, video. Left side to right side. Do not touch the gray.

#### if speaker=michael and morph>=1
*Michael's eyes track something across the board that isn't lit yet.*

**MICHAEL:** It wants to go this way.

**TREVOR:** Boards don't want.

**MICHAEL:** This one's pretty clear about it.

-> leadc_puzzle

---

## Part 2: the repair

### node: leadc_puzzle

*The signal-routing puzzle (see Notes for implementers for the rules and the reference layout).
While it is open, the bark tables below fire. Three exits: solve it, bodge it, or step away.*

Choices:
- [puzzle solved] -> leadc_repaired
- [puzzle failed>=3 or hintLevel=3] "Forget routing. Bridge everything." -> leadc_bodge
- "Ask for a hint." -> leadc_hint
- "Step away." -> leadc_step_away

### node: leadc_hint

*Each request raises `act1.leadC.hintLevel` by one, up to 3, and plays the matching row from the
hint table. The hint is spoken by a roommate who is not soldering. In solo play with no companion
nearby, use the `self` row. Returns to the puzzle.*

**Hint lines**

| id | level | soldering | speaker | line |
|---|---|---|---|---|
| hint.1.manuel | 1 (nudge) | manuel | trevor | They're not the same kind of line. Stop treating them the same. |
| hint.1.trevor | 1 (nudge) | trevor | michael | Do they all care about the gray stuff the same amount? Genuine question. |
| hint.1.michael | 1 (nudge) | michael | manuel | Michael. Which of those three is the stupid one? Start with the stupid one. |
| hint.1.self | 1 (nudge) | any | self | Three lines. They can't all be this fussy. |
| hint.2.manuel | 2 (direct) | manuel | michael | Power's just power, right? It can't get confused. Run it right along the rot. Save the clean cells for video. |
| hint.2.trevor | 2 (direct) | trevor | manuel | Power doesn't care. Hug the rot with it. Video can't sit next to gray at all. And the clock only crosses video on the bridge pad. |
| hint.2.michael | 2 (direct) | michael | trevor | Power's dumb, it can touch the edge of the rot. Video can't even be next to it. Clock and video cross once, on the gold pad, nowhere else. |
| hint.2.self | 2 (direct) | any | self | Power can run beside the rot. Video can't. The clock crosses video on the bridge pad and only there. |
| hint.3.manuel | 3 (explicit) | manuel | trevor | Power along the bottom edge, right past the rot. Clock up and over the top rail. Video straight through the middle, across the gold pad. Done. |
| hint.3.trevor | 3 (explicit) | trevor | manuel | I will say it slowly. Power: bottom row, all the way. Clock: top rail, then down the right side. Video: the middle, over the gold pad. Now you say it. |
| hint.3.michael | 3 (explicit) | michael | trevor | Bottom row is power. Top rail is clock, bring it down the right side. Video goes through the middle over the gold pad. I'll point. |
| hint.3.self | 3 (explicit) | any | self | Power: bottom row. Clock: top rail, down the right. Video: the middle, over the gold pad. |

**After-hint tags** (one plays after the hint, by level)

| id | speaker | trigger | line |
|---|---|---|---|
| hint.tag.1 | soldering roommate | after level 1 | I had that. |
| hint.tag.2.manuel | manuel | after level 2, Manuel soldering | I was about to do that. |
| hint.tag.2.trevor | trevor | after level 2, Trevor soldering | That's what I was doing. That's what this is. |
| hint.tag.2.michael | michael | after level 2, Michael soldering | Okay. Okay, yeah. |
| hint.tag.3.any | hint giver | after level 3 | We tell no one about this. |
| hint.tag.3.reply | soldering roommate | after hint.tag.3.any | Aster pros don't ask twice. |
| hint.tag.3.reply2 | third roommate | after hint.tag.3.reply | You asked three times. |

**Puzzle barks**

| id | speaker | trigger | line |
|---|---|---|---|
| pz.start.1 | manuel | puzzle open 10 s, no move | The rot does not get bored. We do. Go. |
| pz.start.2 | trevor | puzzle open 10 s, no move | It's a board. It's not going to bite. It might bite. |
| pz.start.3 | michael | puzzle open 10 s, no move | Take your time. Not, like, all of it. |
| pz.firstjoint.manuel | manuel | first good joint, Manuel soldering | Shiny. A shiny joint is a true joint. |
| pz.firstjoint.trevor | trevor | first good joint, Trevor soldering | Clean. |
| pz.firstjoint.michael | michael | first good joint, Michael soldering | Oh, that's satisfying. She was right about that. |
| pz.rot.touch.1 | trevor | any trace laid into a rotted cell | No. Off the gray. It eats whatever you give it. |
| pz.rot.touch.2 | manuel | any trace laid into a rotted cell (2nd time) | Rookie Aster mistake. |
| pz.rot.touch.3 | michael | any trace laid into a rotted cell (3rd time) | I'm not saying Aster noob. I'm thinking it really loud. |
| pz.video.noise.1 | michael | video trace adjacent to rot (preview shows snow) | Is it supposed to look like a blizzard? |
| pz.video.noise.2 | trevor | video trace adjacent to rot (2nd time) | Video's picking it up from next door. It can't even be near it. |
| pz.power.ok | manuel | power trace adjacent to rot, first time | See? Power does not care. Power is like me in the morning. |
| pz.cross.bad | trevor | clock and video crossed off the bridge pad | You just shorted time into the picture. Lift it. |
| pz.clock.1901.sys | SYSTEM | clock trace adjacent to rot (preview timestamp) | 01-01-1901 00:00 |
| pz.clock.1901.a | michael | first time pz.clock.1901.sys shows; sets `act1.leadC.clockMisrouted` | It says nineteen-oh-one. |
| pz.clock.1901.b | trevor | follows pz.clock.1901.a | Clock line's too close to the rot. That's what it does to a clock. Sends it home. |
| pz.clock.1901.c | manuel | follows pz.clock.1901.b | Move it. I do not like that number in my lobby. |
| pz.clock.fixed | soldering roommate | clock rerouted clean after a 1901 | There. Today again. |
| pz.solder.low | soldering roommate | 3 joints of solder left | I'm almost out. |
| pz.solder.out.1 | trevor | solder runs out (first time); sets `act1.leadC.usedGuitarString` | Hold on. |
| pz.solder.out.2 | DESCRIPTION | follows pz.solder.out.1 | *Trevor takes a coiled guitar string out of his jacket. It was already in his jacket.* |
| pz.solder.out.3 | trevor | follows pz.solder.out.2 | High E. I never play up there anyway. |
| pz.solder.out.4 | manuel | follows pz.solder.out.3 | You carry strings? |
| pz.solder.out.5 | trevor | follows pz.solder.out.4 | You carry mate. |
| pz.idle.manuel | manuel | 60 s in puzzle, any state | I hate 245 lab. |
| pz.idle.manuel.reply | michael | follows pz.idle.manuel | This isn't 245 lab. |
| pz.idle.manuel.reply2 | manuel | follows pz.idle.manuel.reply | Everything is 245 lab. |
| pz.idle.trevor | trevor | 90 s in puzzle | The shrimp have been under the rock since yesterday. All of them. |
| pz.idle.trevor.reply | michael | follows pz.idle.trevor | Is that bad? |
| pz.idle.trevor.reply2 | trevor | follows pz.idle.trevor.reply | It's not good. |
| pz.idle.michael | michael | 120 s in puzzle | She'd have had this done already. She'd be making fun of us by now. |
| pz.lobby.ad | SYSTEM | ambient, lobby ad panel behind the party, every ~45 s, half the letters dead | AT THE END OF THE D   NO ONE CAN C DE FAS ER THAN A |
| pz.lobby.ad.reply | manuel | first time pz.lobby.ad is on screen while a rot-touch error is showing | And look how that went. |
| pz.neighbor | NEIGHBOR (passing) | once, a resident crosses the lobby during the puzzle | You fixing that? ...Don't tell me if you're fixing that. |
| pz.call.after | michael | [flag act1.call.happened] once, during puzzle | Nobody's phone is ringing. I keep checking. Nobody's is. |

### node: leadc_step_away

*The board state is kept. The dome is left hanging by its cable.*

#### if speaker=manuel
**MANUEL:** I am not quitting. I am letting it think about what it did.

#### if speaker=trevor
**TREVOR:** I need to eat something. Then I'll be good at this.

#### if speaker=michael
**MICHAEL:** I'm gonna walk around the lobby once. That's how I think.

-> END

### node: leadc_bodge

*The second way through. Sets `act1.leadC.bodged`. The speaker stops routing and floods the board:
every clean pad bridged to every other clean pad in one ugly silver blob.*

#### if speaker=manuel
**MANUEL:** Fine. No more elegance. Everybody is connected to everybody.

**TREVOR:** That'll cook the recorder.

**MANUEL:** How fast?

**TREVOR:** One play. Maybe.

**MANUEL:** Then we watch carefully.

#### if speaker=trevor
**TREVOR:** I'm bridging all of it.

**MANUEL:** That is not a repair. That is an insult.

**TREVOR:** It'll boot. It'll run hot. We get one look before it cooks itself.

**MICHAEL:** One look at what?

**TREVOR:** Whatever it kept.

#### if speaker=michael
**MICHAEL:** What if I just connect everything to everything?

**TREVOR:** Then it works for about a minute and dies.

**MICHAEL:** A minute's a long time.

**MANUEL:** A minute is one viewing. Nobody blinks.

*The status light comes on amber, not green. Something inside the dome starts to tick with heat.*

-> leadc_repaired

### node: leadc_repaired

*Sets `act1.leadC.repaired`. The status light comes on. The monitor goes from gray to black to a
boot splash, the logo half-eaten.*

**SYSTEM:** SAFEHALL v9 — RESIDENT ASSURANCE

**SYSTEM:** firmware: auto-generated. do not edit by hand.

**SYSTEM:** *"At the end of the day no one can code faster than AI."*

**SYSTEM:** recovering index . . . 1 of 4 feeds . . . ROOF

#### if act1.leadC.bodged
**TREVOR:** It's hot already. Don't touch the dome.

**MICHAEL:** One feed out of four.

**MANUEL:** One is a number.

#### if not act1.leadC.bodged, speaker=manuel
**MANUEL:** Aster pros.

**MICHAEL:** One feed out of four.

**MANUEL:** Aster pros, one out of four.

#### if not act1.leadC.bodged, speaker=trevor
**TREVOR:** Green light.

**MANUEL:** I would like it noted that the note was wrong and I was right.

**TREVOR:** You said the camera was fine.

**MANUEL:** I read the note. That is different.

#### if not act1.leadC.bodged, speaker=michael
**MICHAEL:** I did that. That was me.

**TREVOR:** It was.

**MICHAEL:** Somebody write it down. Somebody tell—

*He stops. Checks his phone, face-down, face-up. Puts it away.*

**MICHAEL:** Roof feed. Let's see the roof.

-> leadc_scrub

---

## Part 3: the footage

### node: leadc_scrub

*The monitor shows a scrub bar and a thumbnail strip, mostly gray blocks. The date field in the
corner is a row of boxes. Only the time-of-day digits survive.*

**TREVOR:** Date's gone. It kept the hours and lost the days.

**MICHAEL:** So we don't know which night.

**TREVOR:** We know what time of night.

*The speaker drags the bar. Gray. Gray. Then one thumbnail with a small orange dot in it. It is the
only orange on the screen.*

**MANUEL:** Stop. Go back. There.

**SYSTEM:** ROOF — 03:14:07

Choices:
- "Play it." -> leadc_footage_open
- [act1.leadC.bodged] "Play it. Nobody blink." -> leadc_footage_open

### node: leadc_footage_open

*Full-screen footage view: low frame rate, the edges of the image crawling with rot. Common to both
seeds.*

**DESCRIPTION:** The ASTER roof, from high on the stairwell wall. Gravel. The antenna mast. The big
ventilation stack with its bent grate. Far to the north, past the edge of the frame's good pixels,
a few lights that are not stars move slowly left to right.

**DESCRIPTION:** The stairwell door is already open. Nobody is seen opening it.

**MICHAEL:** What are those? Up top.

**TREVOR:** Planes.

**MICHAEL:** There aren't planes.

**TREVOR:** Then I don't know.

**MANUEL:** Shh.

- [seed=A] -> leadc_figure_A
- [seed=B, subject=manuel] -> leadc_figure_B_manuel
- [seed=B, subject=trevor] -> leadc_figure_B_trevor
- [seed=B, subject=michael] -> leadc_figure_B_michael

---

### node: leadc_figure_A

*Seed A. Sets `act1.leadC.figure = smooth`.*

**SYSTEM:** ROOF — 03:14:19

**DESCRIPTION:** A figure walks into frame from the stairwell. Tall. It holds the orange balloon
close to its chest by a hand's length of ribbon. The clock in the corner counts steadily.

**DESCRIPTION:** The rot at the edges of the picture is noisy. The figure is not. Its outline is
too even, like something traced. Where a jacket should wrinkle, it doesn't. Faint level lines run
across it, shoulder to shoulder, and they stay on the figure when it moves.

**DESCRIPTION:** It walks like someone crossing a room they have only been told about. The left hand
does everything. The right arm hangs.

**MICHAEL:** Who is that?

**TREVOR:** Wait.

**MICHAEL:** Is that a guy in a suit? Like a rain suit?

**TREVOR:** Look at the lines on him. That's banding.

**MANUEL:** It is a bad camera. Bad cameras band.

**TREVOR:** Then the gravel would have it too. It's only on him.

*The figure turns a quarter toward the camera. The near side of its head has the shape of a face
and nothing on it. The far side is in the dark.*

**MICHAEL:** Dude. It looks like one of your statues.

**MANUEL:** My statues have faces.

-> leadc_release

### node: leadc_figure_B_manuel

*Seed B, subject Manuel. Sets `act1.leadC.figure = manuel`.*

**SYSTEM:** ROOF — 03:14:19

**DESCRIPTION:** A figure walks into frame from the stairwell, backlit by the door, a cutout with no
face. It holds the orange balloon close to its chest by a hand's length of ribbon.

**DESCRIPTION:** The cutout has curly hair. It has a way of standing with its weight on one hip
while it thinks. Everyone in the lobby has seen that stance at the bench in 631, waiting on a print.

**SYSTEM:** ROOF — 03:14:23

**SYSTEM:** ROOF — 01-01-1901

**SYSTEM:** ROOF — 03:14:24

**DESCRIPTION:** The clock in the corner blinks between the two, like it can't decide.

**MICHAEL:** That's—

**TREVOR:** Don't.

**MICHAEL:** I'm just saying the hair.

*Manuel has not moved. He is standing with his weight on one hip.*

**MANUEL:** It is dark. That is a shape. A lot of people are a shape.

-> leadc_release

### node: leadc_figure_B_trevor

*Seed B, subject Trevor. Sets `act1.leadC.figure = trevor`.*

**SYSTEM:** ROOF — 03:14:19

**DESCRIPTION:** A figure walks into frame from the stairwell, backlit by the door, a cutout with no
face. It holds the orange balloon close to its chest by a hand's length of ribbon.

**DESCRIPTION:** The cutout is tall and has to duck the stairwell lintel, and ducks it without
looking, the way you only do with a doorway you've hit before. Straight hair to the jaw. Its
shoulders are pulled back and down, on purpose, like someone corrected them once.

**SYSTEM:** ROOF — 03:14:23

**SYSTEM:** ROOF — 01-01-1901

**SYSTEM:** ROOF — 03:14:24

**DESCRIPTION:** The clock in the corner blinks between the two, like it can't decide.

**MANUEL:** Trevor.

**TREVOR:** I see it.

**MICHAEL:** That's the posture thing. You do the posture thing.

**TREVOR:** Lots of people have posture.

**MANUEL:** No. They do not.

-> leadc_release

### node: leadc_figure_B_michael

*Seed B, subject Michael. Sets `act1.leadC.figure = michael`.*

**SYSTEM:** ROOF — 03:14:19

**DESCRIPTION:** A figure walks into frame from the stairwell, backlit by the door, a cutout with no
face. It holds the orange balloon close to its chest by a hand's length of ribbon.

**DESCRIPTION:** The cutout has short dark hair and a jacket with the collar turned up on one side
only. Halfway across the gravel its free hand goes to its pocket, touches something flat there, and
comes away again without taking it out.

**SYSTEM:** ROOF — 03:14:23

**SYSTEM:** ROOF — 01-01-1901

**SYSTEM:** ROOF — 03:14:24

**DESCRIPTION:** The clock in the corner blinks between the two, like it can't decide.

**TREVOR:** Michael.

**MICHAEL:** Yeah.

**MANUEL:** That is your jacket.

**MICHAEL:** It's a popular jacket.

**MANUEL:** It is not a popular jacket.

*Michael's hand has gone to his pocket. He notices and takes it away.*

-> leadc_release

---

### node: leadc_release

*Common to both seeds, with small conditional inserts. The description never names the figure.*

**SYSTEM:** ROOF — 03:14:41

**DESCRIPTION:** The figure stops beside the ventilation stack. It looks at the balloon for a while.
Nine seconds, by the clock.

#### if seed=A or subject!=manuel
**MANUEL:** Look how it's holding it.

**MICHAEL:** Careful?

**MANUEL:** Like it's theirs.

#### if seed=B and subject=manuel
**TREVOR:** He's holding it like it's his.

**MICHAEL:** It is his.

*Manuel says nothing.*

*(All variants continue.)*

**DESCRIPTION:** The hand opens. It isn't a drop and it isn't a throw. The fingers come apart one
at a time and the ribbon slides out.

**DESCRIPTION:** The balloon goes up about a foot. Then it stops, the way nothing with helium in it
stops. It tips. It slides sideways across the roof, steady, to the mouth of the ventilation stack,
bumps the bent grate once, and goes in.

**DESCRIPTION:** Down. The orange dot gets smaller inside the stack and then there is no orange on
the screen.

**DESCRIPTION:** On the lip of the stack, a strip of caution tape that has hung limp all through the
clip is pointing straight in.

**TREVOR:** No.

**MICHAEL:** It went down.

**TREVOR:** It doesn't go down. That's the whole thing about it. It's the one gas that leaves.

**MANUEL:** Look at the tape.

**TREVOR:** ...That stack's supposed to blow out. It's exhaust.

**MICHAEL:** So it's blowing in.

**TREVOR:** So something's pulling.

**SYSTEM:** ROOF — 03:15:02

**DESCRIPTION:** The figure stands at the stack a little longer, looking down it. Then it turns and
walks back toward the stairwell, unhurried, and out of frame. The door stays open.

*The clip ends. The monitor holds the last frame: an empty roof, the tape pointing in.*

- [seed=A] -> leadc_react_A
- [seed=B, subject=manuel] -> leadc_react_B_manuel
- [seed=B, subject=trevor] -> leadc_react_B_trevor
- [seed=B, subject=michael] -> leadc_react_B_michael

---

### node: leadc_react_A

*Seed A. Sets `act1.leadC.footageWatched`, `act1.clue.roofFootage`, `act1.trail.shaft`.*

*Nobody says anything for a moment. The dome ticks.*

**MICHAEL:** Okay. Who was that?

**TREVOR:** I don't think "who" is where I'd start.

**MANUEL:** It came up our stairs.

**MICHAEL:** In a mask. Right? Some guy from four in a mask.

**TREVOR:** A mask has a face on it. That's the point of a mask.

**MANUEL:** It knew which stack.

**TREVOR:** What?

**MANUEL:** There are three vents on the roof. It walked to that one. It did not look at the others.

Choices:
- [not act1.leadC.bodged] "Run it again." -> leadc_replay_A
- [speaker=manuel] "It didn't steal it. It carried it." -> leadc_react_A_manuel
- [speaker=trevor] "The clock never slipped. Not once." -> leadc_react_A_trevor
- [speaker=michael] "It only used the one hand." -> leadc_react_A_michael
- "Say nothing." -> leadc_after

### node: leadc_react_A_manuel

**MANUEL:** It didn't steal it. You steal something, you run. It carried it. All the way up, against
its chest.

**MICHAEL:** That's worse, kind of.

**MANUEL:** Yes.

**TREVOR:** It still let go.

**MANUEL:** I know it let go. I watched it let go.

-> leadc_after

### node: leadc_react_A_trevor

**TREVOR:** The clock never slipped. Everything else in that frame is garbage and the clock held the
whole time.

#### if act1.leadC.clockMisrouted
**MICHAEL:** That's good, right? That's your joint.

**TREVOR:** That's my joint. That part I trust.

#### if not act1.leadC.clockMisrouted
**MICHAEL:** That's good, right?

**TREVOR:** It means that's really when. 3:14. That part I trust.

**MANUEL:** And the rest?

**TREVOR:** The rest I saw. That's different from trusting it.

-> leadc_after

### node: leadc_react_A_michael

**MICHAEL:** It only used the one hand. The other one just hung there.

**TREVOR:** Injury.

**MICHAEL:** Maybe. It didn't move like hurt, though. It moved like... you know when you get a new
phone and your thumb keeps going where the button used to be?

**MANUEL:** No.

**MICHAEL:** Like that. Like it was still finding out where everything was.

*Beat.*

**MICHAEL:** My girlfriend would've said something smart here. I got the phone thing.

-> leadc_after

### node: leadc_replay_A

*Increments `act1.leadC.replays`. The clip plays again from 03:14:19 (skippable). One new line per
replay, in order, then the last repeats.*

| id | speaker | trigger | line |
|---|---|---|---|
| replayA.1 | trevor | replay 1, as the figure enters | The lines stay on him when he turns. A camera can't do that. |
| replayA.2 | michael | replay 2, at the quarter turn | Half. It's got half of one. Pause it. No, don't. |
| replayA.3 | manuel | replay 3, at the nine seconds | Nine seconds. What do you look at for nine seconds? |
| replayA.4 | trevor | replay 4+ | It's the same. It's going to keep being the same. |

-> leadc_react_A

---

### node: leadc_react_B_manuel

*Seed B, subject Manuel. Sets `act1.leadC.footageWatched`, `act1.clue.roofFootage`,
`act1.trail.shaft`.*

*Nobody looks at Manuel. That is how he knows.*

**MICHAEL:** So.

**TREVOR:** Michael.

**MICHAEL:** I'm not saying anything. I'm saying "so."

**MANUEL:** I check that knot every morning. Every morning. I am the one who checks.

**TREVOR:** Nobody's saying you did anything.

**MICHAEL:** The video's kind of saying it.

**MANUEL:** I don't remember that. Any of that. The stairs, the roof. I would remember the stairs.
It is six floors.

**TREVOR:** The clock's wrong on it. 1901. I can't call that clean footage.

#### if act1.leadC.clockMisrouted
**MICHAEL:** You fixed the clock. I watched you fix the clock.

**TREVOR:** I did. The line's clean. So I don't know what that is.

#### if not act1.leadC.clockMisrouted
**MICHAEL:** The clock line's fine, though. It booted fine.

**TREVOR:** The line's clean. So I don't know what that is.

Choices:
- [speaker=manuel] "I don't remember it. I'm not saying it isn't me." -> leadc_B_manuel_owned
- [speaker=manuel] "Maybe I sleep-check the weather now. Very dedicated." -> leadc_B_manuel_joked
- [speaker=manuel] "Say nothing." -> leadc_B_manuel_quiet
- [speaker!=manuel] "Manuel. Were you up there?" -> leadc_B_manuel_pressed
- [speaker!=manuel] "It's a shape in the dark. That's all it is." -> leadc_B_manuel_defended
- [speaker!=manuel] "Let it go for now." -> leadc_B_manuel_dropped
- [not act1.leadC.bodged] "Run it again." -> leadc_replay_B

### node: leadc_B_manuel_owned

*Sets `act1.leadC.stance = owned`.*

**MANUEL:** I don't remember it. I am not saying it isn't me. I am saying I was not there for it.

**MICHAEL:** That's a weird sentence, man.

**MANUEL:** It is a weird video.

**TREVOR:** Okay. Then we find out. Together. Not here.

**MANUEL:** If that is me, I held it for nine seconds first. Somebody write that down.

-> leadc_after

### node: leadc_B_manuel_joked

*Sets `act1.leadC.stance = joked`.*

**MANUEL:** Maybe I sleep-check the weather now. Very dedicated. Very professional.

**MICHAEL:** Ha.

*Nobody else laughs. Manuel doesn't either.*

**TREVOR:** You good?

**MANUEL:** I hate 245 lab.

**TREVOR:** Yeah.

-> leadc_after

### node: leadc_B_manuel_quiet

*Sets `act1.leadC.stance = quiet`.*

*Manuel reaches out and touches the monitor where the orange dot was. The glass is warm.*

**MICHAEL:** Hey. It's a bad camera.

**TREVOR:** It's a very bad camera.

*He takes his hand back.*

-> leadc_after

### node: leadc_B_manuel_pressed

*Sets `act1.leadC.stance = pressed`.*

#### if speaker=trevor
**TREVOR:** Manuel. Were you up there?

#### if speaker=michael
**MICHAEL:** Manuel. Just, were you up there? It's fine if you were.

*(Both continue.)*

**MANUEL:** You think I would cut it? Me?

#### if speaker=trevor
**TREVOR:** I think I'm asking.

#### if speaker=michael
**MICHAEL:** I think I'm asking. That's all. I'm asking.

*(Both continue.)*

**MANUEL:** I went to bed. I woke up in my bed. In between I don't have anything. Nobody has anything
in between. That is what a bed is.

**MANUEL:** So no. I don't know. Ask me something I can answer.

-> leadc_after

### node: leadc_B_manuel_defended

*Sets `act1.leadC.stance = defended`.*

#### if speaker=trevor
**TREVOR:** It's a shape in the dark with a broken clock on it. That's all we've got.

**MICHAEL:** It's a shape with his hair.

**TREVOR:** Then it's a shape with his hair.

#### if speaker=michael
**MICHAEL:** It's a shape in the dark. That's all it is. I've been a shape in the dark.

**TREVOR:** It's a shape with his hair.

**MICHAEL:** Then somebody's got his hair. That's on them.

*(Both continue.)*

**MANUEL:** ...Thank you.

*He doesn't sound sure he should be thanking anyone.*

-> leadc_after

### node: leadc_B_manuel_dropped

*Sets `act1.leadC.stance = dropped`.*

**TREVOR:** We've got where it went. That's what we came for.

**MICHAEL:** Yeah. The rest can sit.

**MANUEL:** It is not going to sit.

**TREVOR:** No. But it can wait.

-> leadc_after

---

### node: leadc_react_B_trevor

*Seed B, subject Trevor. Sets `act1.leadC.footageWatched`, `act1.clue.roofFootage`,
`act1.trail.shaft`.*

*Trevor is standing very straight. Then he notices, and stands differently, which is worse.*

**MANUEL:** Trevor.

**TREVOR:** The clock's wrong on it.

**MANUEL:** Trevor, that is you.

**TREVOR:** That's somebody tall. With a 1901 stamp. I wouldn't sign off on that footage in lab and
neither would you.

**MICHAEL:** He ducked the door, man. The roof door. You're the only one of us who has to.

**TREVOR:** I don't remember going up there. I'd remember. I log everything. Sleep, heart rate, what
I ate. There's no roof in the log.

**MANUEL:** What is in the log?

**TREVOR:** Sleep.

#### if act1.leadC.clockMisrouted
**MICHAEL:** And the 1901. You fixed that. I watched you.

**TREVOR:** The clock line's clean. I'd bet the tank on it. So I don't know what that is.

#### if not act1.leadC.clockMisrouted
**MICHAEL:** And the 1901?

**TREVOR:** The clock line's clean. I'd bet the tank on it. So I don't know what that is.

Choices:
- [speaker=trevor] "I don't remember it. That's all I can tell you that's true." -> leadc_B_trevor_owned
- [speaker=trevor] "If I sleepwalk six flights, that's cardio. I'm logging it." -> leadc_B_trevor_joked
- [speaker=trevor] "Say nothing." -> leadc_B_trevor_quiet
- [speaker!=trevor] "Trevor. What are you taking?" -> leadc_B_trevor_pressed
- [speaker!=trevor] "It's a tall shape. The building's full of tall shapes." -> leadc_B_trevor_defended
- [speaker!=trevor] "Let it go for now." -> leadc_B_trevor_dropped
- [not act1.leadC.bodged] "Run it again." -> leadc_replay_B

### node: leadc_B_trevor_owned

*Sets `act1.leadC.stance = owned`.*

**TREVOR:** I don't remember it. That's the only thing I can tell you that's true. Everything past
that I'd be making up.

**MANUEL:** Okay.

**TREVOR:** I'm not saying it isn't me.

**MANUEL:** I heard you. Okay.

**MICHAEL:** For what it's worth, you looked really calm up there.

**TREVOR:** That's the part I don't like.

-> leadc_after

### node: leadc_B_trevor_joked

*Sets `act1.leadC.stance = joked`.*

**TREVOR:** If I'm sleepwalking six flights, that's cardio. I'm logging it.

**MICHAEL:** Zone two.

**TREVOR:** Zone two.

*Manuel doesn't laugh. Trevor looks at his own hands, turns them over once, and puts them in his
pockets.*

**TREVOR:** I'll pull the tracker data tonight.

-> leadc_after

### node: leadc_B_trevor_quiet

*Sets `act1.leadC.stance = quiet`.*

*Trevor takes his own pulse, two fingers on his neck, watching the last frame. He counts. Whatever
the number is, he doesn't share it.*

**MICHAEL:** You okay?

**TREVOR:** Sixty-one.

**MANUEL:** Is that good?

**TREVOR:** It's what it always is.

-> leadc_after

### node: leadc_B_trevor_pressed

*Sets `act1.leadC.stance = pressed`.*

#### if speaker=manuel
**MANUEL:** Trevor. What are you taking? All of it. The whole list.

#### if speaker=michael
**MICHAEL:** Trevor, I gotta ask. What's in the stack right now? Like actually.

*(Both continue.)*

**TREVOR:** Nothing that does that.

#### if speaker=manuel
**MANUEL:** You don't know what does that. You buy it from a man in a parking garage.

#### if speaker=michael
**MICHAEL:** You get it from a guy in a parking garage.

*(Both continue.)*

**TREVOR:** He's got a table.

**TREVOR:** ...I read every label. I'd know if something in there walks you up a staircase. There's
no label for that.

*Beat.*

**TREVOR:** I'll write down the list.

-> leadc_after

### node: leadc_B_trevor_defended

*Sets `act1.leadC.stance = defended`.*

#### if speaker=manuel
**MANUEL:** It is a tall shape. This building is full of tall shapes. The man on five is taller.

**MICHAEL:** The man on five has a beard.

**MANUEL:** In the dark, who has a beard? Nobody has anything in the dark.

#### if speaker=michael
**MICHAEL:** It's a tall shape. There's like six tall guys in this building. There's the guy on five.

**MANUEL:** The man on five has a beard.

**MICHAEL:** It's a silhouette, man. Everybody's clean-shaven in a silhouette.

*(Both continue.)*

**TREVOR:** You don't have to do that.

*He lets them do it anyway.*

-> leadc_after

### node: leadc_B_trevor_dropped

*Sets `act1.leadC.stance = dropped`.*

**MANUEL:** We know where it went. Down. That is what we came for.

**MICHAEL:** Yeah. One thing at a time.

**TREVOR:** That's two things and you both know it.

**MANUEL:** One thing at a time, Trevor.

-> leadc_after

---

### node: leadc_react_B_michael

*Seed B, subject Michael. Sets `act1.leadC.footageWatched`, `act1.clue.roofFootage`,
`act1.trail.shaft`.*

*Michael laughs once, the way you do when you see yourself in a photo you didn't know was taken.
Then it stops being that.*

**MICHAEL:** That's not— okay. That's a guy in my jacket.

**TREVOR:** With your hair.

**MICHAEL:** With hair. Everybody's got my hair. It's the default hair.

**MANUEL:** He touched his pocket. Halfway. You do that.

**MICHAEL:** Everybody checks their phone.

**MANUEL:** He did not check it. He touched it. You do *that*.

*Michael doesn't have an answer for that one.*

**MICHAEL:** I don't remember being up there. I swear to God. I fell asleep with my phone on my
chest and I woke up with my phone on my chest.

**TREVOR:** The clock's off on it, for what it's worth. 1901.

#### if act1.leadC.clockMisrouted
**MANUEL:** You fixed that.

**TREVOR:** The clock line's clean. So I don't know what that is.

#### if not act1.leadC.clockMisrouted
**MANUEL:** The camera booted clean.

**TREVOR:** The clock line's clean. So I don't know what that is.

Choices:
- [speaker=michael] "I don't remember it. I'm not gonna tell you it's not me." -> leadc_B_michael_owned
- [speaker=michael] "Honestly? Guy looks good. Great jacket." -> leadc_B_michael_joked
- [speaker=michael] "Say nothing." -> leadc_B_michael_quiet
- [speaker!=michael] "Michael. Who were you on the phone with that night?" -> leadc_B_michael_pressed
- [speaker!=michael] "It's a jacket. Somebody else can own a jacket." -> leadc_B_michael_defended
- [speaker!=michael] "Let it go for now." -> leadc_B_michael_dropped
- [not act1.leadC.bodged] "Run it again." -> leadc_replay_B

### node: leadc_B_michael_owned

*Sets `act1.leadC.stance = owned`.*

**MICHAEL:** I don't remember it. I'm not gonna stand here and tell you it's not me, because look at
it. But I wasn't there. Whatever that means.

**TREVOR:** That's fair.

**MICHAEL:** Manuel. If that's me, I'm sorry. I mean it. I'd never— I know what that thing is to you.

**MANUEL:** I know you do.

**MANUEL:** That is why it is strange.

-> leadc_after

### node: leadc_B_michael_joked

*Sets `act1.leadC.stance = joked`.*

**MICHAEL:** Honestly? Guy looks good. Great jacket. Great silhouette.

**TREVOR:** Michael.

**MICHAEL:** I'm coping. Let me cope.

**MANUEL:** Cope faster.

**MICHAEL:** ...She used to say I walk like I'm late for something. He doesn't walk like that. Look
at him. He's got all night.

-> leadc_after

### node: leadc_B_michael_quiet

*Sets `act1.leadC.stance = quiet`.*

*Michael takes out his phone. Face-down in his palm. Face-up. No notifications. Face-down.*

**TREVOR:** Nobody's calling.

**MICHAEL:** I know.

*He keeps it in his hand anyway.*

-> leadc_after

### node: leadc_B_michael_pressed

*Sets `act1.leadC.stance = pressed`.*

#### if speaker=manuel
**MANUEL:** Michael. Who were you on the phone with? That night.

#### if speaker=trevor
**TREVOR:** Michael. You fell asleep with the phone on you. Who were you talking to?

*(Both continue.)*

**MICHAEL:** Nobody.

#### if speaker=manuel
**MANUEL:** You are always on the phone with somebody.

#### if speaker=trevor
**TREVOR:** You're always talking to somebody.

*(Both continue.)*

**MICHAEL:** I'm always on the phone. That's not the same thing.

*Beat.*

**MICHAEL:** I listen to her old messages, okay? To fall asleep. That's who. That's the whole
answer. Can we look at the tape again instead of me?

-> leadc_after

### node: leadc_B_michael_defended

*Sets `act1.leadC.stance = defended`.*

#### if speaker=manuel
**MANUEL:** It is a jacket. Another person can own a jacket. Even that jacket.

**TREVOR:** You said it wasn't a popular jacket.

**MANUEL:** I have changed my position on the jacket.

#### if speaker=trevor
**TREVOR:** It's a jacket and a haircut. Two data points. You can't fit anything to two points.

**MANUEL:** And the pocket.

**TREVOR:** Three. Still wouldn't publish it.

*(Both continue.)*

**MICHAEL:** Thanks. Seriously.

*He zips the jacket up. Then, a second later, unzips it.*

-> leadc_after

### node: leadc_B_michael_dropped

*Sets `act1.leadC.stance = dropped`.*

**TREVOR:** We know where it went. Start there.

**MANUEL:** Yes. Down first. Then the rest.

**MICHAEL:** You guys are being really nice about this.

**MANUEL:** We are being efficient. It looks similar.

-> leadc_after

---

### node: leadc_replay_B

*Seed B. Increments `act1.leadC.replays`. The clip plays again from 03:14:19 (skippable). One new
line per replay, in order, then the last repeats. `{subject}` is the seeded roommate; the two
`other` slots are the remaining roommates in the order manuel, trevor, michael. Returns to the
matching `leadc_react_B_*` node with the "Run it again" choice still open.*

| id | speaker | trigger | line |
|---|---|---|---|
| replayB.1 | other (first) | replay 1, at the 1901 blink | There. It only does that when you're— when he's in the shot. |
| replayB.1.reply | {subject} | follows replayB.1 | You can say "you." |
| replayB.2 | {subject} | replay 2, at the nine seconds | What am I looking at? For nine seconds. I'd like to know what I was thinking. |
| replayB.3 | other (second) | replay 3, at the release | Whoever that is, they weren't in a hurry. |
| replayB.4 | {subject} | replay 4+ | It's not going to turn around. I keep thinking it'll turn around. |

---

### node: leadc_after

*Common wrap. Sets `act1.leadC.done`. The monitor holds the last frame.*

#### if act1.leadC.bodged
*Inside the dome, something pops. The monitor goes gray, then black. A thread of smoke comes out of
the housing and the lobby smells like hot dust.*

**TREVOR:** That's it. That's the one play.

**MICHAEL:** We all saw the same thing, right? Somebody say what they saw.

**MANUEL:** It went down.

*(All variants continue.)*

**MANUEL:** Where does that stack go?

**TREVOR:** Down the core of the building. Past the basement.

**MICHAEL:** What's past the basement?

**TREVOR:** I don't know. It's an exhaust stack for something. This building doesn't make that much
exhaust.

**MANUEL:** So it is somebody else's exhaust.

**MICHAEL:** And it's running backwards.

*From the floor of the lobby, faintly, through the soles: a low knock. Then two more. It could be
pipes.*

**MICHAEL:** Pipes.

**TREVOR:** Sure.

#### if speaker=manuel
**MANUEL:** Then we go down. It went down, I go down. This is not complicated.

#### if speaker=trevor
**TREVOR:** So we find out what's under us. I've lived here two years and I never asked.

#### if speaker=michael
**MICHAEL:** Okay. Down. I hate down. Let's go down.

**SYSTEM:** Lead updated: *The footage.* The balloon went into the roof ventilation stack at 3:14 a.m. It went down.

-> END

---

## Ambient and follow-up barks

**Lobby, after the lead is done**

| id | speaker | trigger | line |
|---|---|---|---|
| after.monitor.A | DESCRIPTION | [seed=A] inspect the monitor again (not bodged) | The last frame. An empty roof. The clock in the corner reads 03:15:02 and holds. |
| after.monitor.B | DESCRIPTION | [seed=B] inspect the monitor again (not bodged) | The last frame. An empty roof. Nobody is in the shot, and the clock reads 03:15:02 and holds. |
| after.monitor.dead | DESCRIPTION | inspect the monitor again (bodged) | Black glass. A fingerprint where somebody touched the orange. |
| after.note | SYSTEM | inspect the laminated note after repair (not bodged) | CAMERA IS FINE. DO NOT TOUCH. — MGMT |
| after.note.reply | manuel | follows after.note, once | Now it is true. They should thank us. |
| after.note.bodged | michael | inspect the note after repair (bodged), once | Okay, now the note's really wrong. |
| after.slogan | trevor | inspect the lobby ad panel after repair, once | That camera's firmware had that line on the boot screen. Like a signature. |
| after.slogan.reply | manuel | follows after.slogan | Fast. Nobody said good. |
| after.halvard.A | michael | [seed=A] [flag act1.halvard.sellerDescribed] once, leaving the lobby | "Or wearing your face." It didn't have one to wear. Not a whole one. |
| after.halvard.B | other (first) | [seed=B] [flag act1.halvard.sellerDescribed] once, leaving the lobby | "One of you." That's what the guy under the stairs said. I didn't love it then either. |
| after.latch | trevor | [flag act1.coldopen.latchInspected] once, in the elevator or stairwell | The latch was on the inside. And whoever that was came up our stairs, not over a wall. |
| after.printer | manuel | [flag act1.coldopen.printerInspected] once, back in 631, near the fabs | Three was warm that night. I keep coming back to it. I don't know why I keep coming back to it. |

**Roof, after the lead is done** (optional visit)

| id | speaker | trigger | line |
|---|---|---|---|
| roof.stack.desc | DESCRIPTION | inspect the ventilation stack | The grate is bent inward. The caution tape on the lip stands straight in, humming. Air is going down, and it is cold. |
| roof.stack.manuel | manuel | inspect the stack, speaker=manuel | *(He holds his hand over it. The air pulls at his sleeve.)* It is still pulling. |
| roof.stack.trevor | trevor | inspect the stack, speaker=trevor | Negative pressure. A lot of it. Somebody's running a very big fan the wrong way. |
| roof.stack.michael | michael | inspect the stack, speaker=michael | *(He drops a receipt in. It doesn't flutter. It just goes.)* Yeah. Okay. |
| roof.gravel.A | DESCRIPTION | [seed=A] inspect the gravel by the stack | Footprints in the grit, the left one clear, the right one dragged. No tread pattern in either. |
| roof.gravel.B | DESCRIPTION | [seed=B] inspect the gravel by the stack | Footprints in the grit. Bare feet. They go to the stack and come back, and they don't wander. |
| roof.gravel.B.reply | {subject} | [seed=B] follows roof.gravel.B, once | *(Looks at the prints. Looks at their own shoes. Does not put a foot next to one.)* |
| roof.camera | DESCRIPTION | inspect the roof camera on the stairwell wall | A small dome like the one in the lobby. Its light is green now. It is looking at you looking at it. |
| roof.horizon | michael | night only, looking north, once | Those lights again. They were in the video too. |
| roof.horizon.reply | trevor | follows roof.horizon | They've moved. |

---

## Notes for implementers

**Seed and subject.** `world.seed.variant` and `world.seed.subject` come from the save and are never
re-rolled. Under A, `subject` is unused here. Under B, exactly one `leadc_figure_B_*` /
`leadc_react_B_*` pair plays. Every roommate line in the B nodes is written to be true whether or
not the footage means what it seems to: the seeded roommate only ever says what they remember and
don't remember, and the other two only describe what is on screen or ask. Please don't add lines
like "I was never up there" or "it's obviously X" when extending this.

**Description text.** `DESCRIPTION` lines are the footage caption track, shown under the full-screen
clip, one at a time, advancing with the clip (not on a button press, except when paused). `SYSTEM`
lines starting `ROOF —` are the burned-in camera clock and should be drawn in the footage, top
right, not in the dialogue box.

**The 1901 blink (B only).** Between 03:14:23 and 03:14:24 the burned-in clock is replaced for
about 8 frames by `01-01-1901`, then returns. In replays it blinks again each time the figure is in
frame after that point (roughly every 4 s, same 8 frames), and never while the roof is empty. Under
A the clock never blinks during the clip. This is deliberate: under B the camera repair is correct
and the clock still slips.

**Clip timing.** About 45 seconds of footage at a rendered 6 fps. Beats: door already open
(03:14:07), figure enters (:19), [B: blink at :23], stops at the stack (:41), holds 9 s, releases
(:50), balloon enters the stack (:56), figure leaves (03:15:02). The balloon is the only orange
on screen (art rule D-004), including in the thumbnail strip in `leadc_scrub`.

**The release animation.** The balloon must visibly rise first (about one tile), stop, then travel
horizontally to the stack and descend. The caution tape on the stack lip is limp for the whole clip
until the hand opens, then snaps to point inward. That is the "something pulled it" tell and it is
identical under both seeds.

**Figure art.** A: a tall figure with a uniform outline (no cloth wrinkle frames), faint horizontal
banding that moves with the sprite rather than the screen, the right arm static, and a quarter-turn
frame where the near half of the head is blank and the far half is unlit. Never show a full face or
anything pink. B: a pure black cutout of the seeded roommate (reuse their walk cycle as a
silhouette, slowed), plus one tell each: Manuel stands hip-shot at the stack, Trevor ducks the
stairwell lintel, Michael touches his pocket halfway across.

**Puzzle rules (proposal; the hint lines depend on it).** A 7×5 grid on the camera's controller
board. Three sources on the left edge (POWER, CLOCK, VIDEO) and three matching sinks on the right.
The player lays trace segments cell to cell with the iron.
1. No trace may enter a rotted cell.
2. POWER may run orthogonally adjacent to rotted cells with no penalty.
3. VIDEO adjacent to a rotted cell is corrupted: the preview monitor shows snow, the puzzle isn't solved.
4. CLOCK adjacent to a rotted cell is corrupted: the preview timestamp reads `01-01-1901 00:00`, the puzzle isn't solved.
5. Traces may not share a cell, except CLOCK and VIDEO may cross on the single gold bridge pad in the center.
6. Solder is limited (reference layout: 22 joints, the intended solution uses 20). Running out once
   triggers `pz.solder.out.*` and grants 6 more joints (the guitar string). Running out again counts as a fail and resets the board.
7. A "fail" for the bodge unlock is any board reset, forced or chosen.

**Reference layout** (the level 3 hints describe this solution; if the layout changes, rewrite
`hint.3.*`). Rot clusters sit low-center and upper-middle. Intended solution: POWER along the bottom
row, passing beside the low rot cluster. CLOCK up to the top rail, along it, and down the right
side to its sink. VIDEO through the middle row, over the gold pad, with clean cells on both sides.
The level 1 and level 2 hints only depend on rules 2 through 5 and survive a layout change.

**Hints.** `leadc_hint` is always available from the puzzle. No cooldown. Level 3 also unlocks the
bodge choice. The hint giver is a roommate who is not soldering: use the `soldering` column to pick
the row. In solo play with no companion in range, use the `self` rows and skip the `hint.tag.*`
lines.

**The bodge.** The second route through the lead. It always works. Cost: the clip plays once, with
no pause, no replay, and no later re-inspection (`after.monitor.dead`), and the lobby camera is
permanently dead after `leadc_after`. If the 1901 clock puzzle (DESIGN §8) counts the lobby camera
clock among "every rotted clock in ASTER," a bodged camera should count as already satisfied or be
excluded, so the bodge can't soft-lock that puzzle.

**Barks.** Puzzle barks: one at a time, minimum 6 s apart, each id once per puzzle session unless
its trigger says otherwise. Rows with "follows" are chained and must not be interrupted by another
bark. `pz.lobby.ad` is a world text flicker on the lobby ad panel, not a dialogue box.

**Speaker.** "Speaker" is the roommate whose player started the interaction. In co-op the footage
and reactions play for everyone, and the choice list belongs to the speaker. Under B, if the speaker
is the subject they get the `owned / joked / quiet` choices and otherwise the `pressed / defended /
dropped` choices. `act1.leadC.stance` is read later by party-friction barks and, under B, by the
subject's lines in the descent.

**The knock in `leadc_after`.** Three low hits on the tunnel-drum sample, low-passed, at about 30
percent volume, with a light controller rumble if available. It should be deniable. Do not play it
if the Sahur route is already active (use silence instead).

**Counts.** `leadc_after` sets `act1.leadC.done` and should increment whatever counter gates "any 2
of 3 leads." If this is the second lead completed, the Call (DESIGN §4) may trigger on leaving the
lobby, not inside this scene.

**Open questions for the team (not decided here).**
- Which night the clip is from. The cold open is at 2:58 a.m. with all three roommates awake, and
  the footage is stamped 3:14. I wrote the date field as rotted ("it kept the hours and lost the
  days") and kept every alibi line to "I don't remember being up there," so the script works whether
  3:14 is the same night or an earlier one. Someone should decide and check the cold open against it.
- How the roof stack connects to the Green Line platform shaft. The script only says it goes "past
  the basement" and is "somebody else's exhaust."
- `SAFEHALL v9` (the camera firmware name), the bare footprints under B, and the dragged right
  footprint under A are my inventions. Cut or rename freely.
