# Cold open: Room 631, 2:58 a.m.

## Purpose

DESIGN beat 0. Three roommates wake at a bad hour, one of them looks at the balcony ottoman out of
habit, and the orange balloon is gone, its ribbon cut clean. The scene teaches move, interact, and
inspect by letting the players search their own apartment. It plants the first two twist clues
(printer #3 warm, T1; the balcony window latch open from the inside, T5), offers the optional third
(Manuel does not remember making the newest statue), and gives every object in 631 a line that is a
joke or a character beat and, where it can be, a quiet thread to the plot. It ends when all three
roommates have inspected something and the party walks out into ASTER.

Thematic job: *letting go* at the smallest scale (a balloon, a ribbon, a habit), and the first
unanswered ring of *who answers?* (a phone in a vacuum, a mug nobody washes).

The scene's one big line is Manuel's **"I wasn't checking the weather."** It is the setup for
Pork's ending line (*"I was watching the weather too."*). Do not add a second one.

## Flags

Reads:

- `world.seed.variant` (A or B). **Not read by any line in this scene.** Listed so nobody adds a
  seed branch here: every line below is the same under A and B on purpose.
- `session.present.manuel`, `session.present.trevor`, `session.present.michael` (which roommates
  are player-controlled; see Notes).

Sets:

- `act1.coldopen.started`
- `act1.coldopen.discoveredBy` (string: `manuel` | `trevor` | `michael`)
- `act1.coldopen.trevorStalled` (Trevor looked closer before telling Manuel)
- `act1.coldopen.discovered` (the gather conversation has played; inspects now count)
- `act1.coldopen.inspected.manuel`, `act1.coldopen.inspected.trevor`,
  `act1.coldopen.inspected.michael` (each has inspected at least one object after discovery)
- `act1.coldopen.inspectCount` (integer, party total, for stats and barks)
- `act1.coldopen.latchInspected` (T5 clue seen)
- `act1.coldopen.printerWarm` (T1 clue seen)
- `act1.coldopen.ribbonInspected`
- `act1.coldopen.ribbonTaken` (Manuel untied the stub; grants item `ribbon`)
- `act1.coldopen.ribbonLeft` (Manuel chose to leave it tied)
- `act1.coldopen.vanSeen` (abatement van noticed from the balcony; T3 seed for Lead A)
- `act1.coldopen.sloganSeen` (billboard read)
- `act1.coldopen.scopeSeen` (three-and-a-gap on the oscilloscope)
- `act1.coldopen.cuttersNoticed` (flush cutters on the wrong hook)
- `act1.coldopen.shrimpBaseline` (first tank reading; the rot-trend mechanic compares against it)
- `act1.coldopen.mugSeen` (Michael's girlfriend's mug)
- `act1.coldopen.fourthPacifierSeen`
- `act1.coldopen.noticeRead` (Continuity survey notice)
- `act1.coldopen.book631Seen` (easter egg 11)
- `act1.coldopen.reyesBookSeen`
- `act1.coldopen.statueNewInspected`
- `act1.coldopen.statueDoubtShared` (Manuel has said out loud that he does not remember making it)
- `act1.coldopen.statueDoubtKept` (Manuel noticed and said nothing)
- `act1.coldopen.statueAsked` (another roommate asked and let it drop)
- `act1.coldopen.flagDecided`
- `act1.coldopen.flagHidden` (flag flipped to its Maryland side before leaving)
- `act1.coldopen.firstDodgeIndoors`
- `act1.coldopen.complete`

## Conventions used in this file

- `speaker` is the roommate whose player triggered the interaction.
- `INSPECT` is neutral object text shown in the inspect box. It is plain description, never a
  narrator with opinions about the player. The roommate's own line follows it.
- `Next: -> node_id` is an unconditional jump. A node with no `Next` and no `Choices` returns
  control to the players.
- `[!flag x]` means the flag is not set.

---

## Part 1: Waking

### node: coldopen_fade_in

*Black. A wrist alarm buzzing against wood.*

*The alarm's label fades up, small, in the dark: `02:55  MAG + GLYCINE. DO NOT SNOOZE.` Under it,
smaller: `SNOOZED (1)`.*

*The microwave clock across the room: 2:58.*

Next: -> coldopen_wake_trevor

### node: coldopen_wake_trevor

*Trevor's room, door open. He sits up already reaching for a pill organizer with far too many
doors. He does not open his eyes until the second capsule is down, dry.*

**TREVOR:** Mag. Glycine. Up.

*He opens his eyes. He looks at the clock.*

**TREVOR:** Past me is a monster.

Next: -> coldopen_wake_michael

### node: coldopen_wake_michael

*The couch. Michael, fully dressed, one shoe on, a phone face-up on his chest. The screen is lit.*

**MICHAEL:** *(asleep)* No. You hang up.

*Trevor's alarm buzzes a second time. Michael's hand closes on the phone.*

**MICHAEL:** Was that mine?

**TREVOR:** Mine. Go back to sleep.

**MICHAEL:** I was on the phone.

**TREVOR:** You were on the couch.

*Michael looks at the phone. He turns it face-down on his chest.*

Next: -> coldopen_wake_manuel

### node: coldopen_wake_manuel

*The workbench. Manuel is asleep on his forearm between a cold gourd and three small statues with
pig faces. There is dried casting slip on his knuckles.*

**MANUEL:** *(not awake)* ...I hate 245 lab.

**MICHAEL:** He's dreaming about lab again.

**TREVOR:** We all are.

*Manuel lifts his head. The bench's wood grain is printed into his cheek.*

**MANUEL:** What time is it.

**TREVOR:** Two fifty-eight.

**MANUEL:** Why are we awake at two fifty-eight.

**MICHAEL:** Trevor's bones needed minerals.

**TREVOR:** Magnesium isn't for bones. It's for sleep.

**MICHAEL:** It's for sleep. It woke up three people.

*Control passes to the players. One interactable is highlighted: the balcony window. Its prompt
reads* `Check the weather`.

Next: -> coldopen_pre_discovery

### node: coldopen_pre_discovery

*Free movement inside 631. Until someone uses the balcony window, every other object answers with
that roommate's line from the "Pre-discovery deflects" table in Part 6. The first roommate to use
the balcony window becomes* `speaker` *for* `coldopen_glance`.

---

## Part 2: The ottoman

### node: coldopen_glance

*Sets* `act1.coldopen.discoveredBy` *to the speaker.*

#### if speaker=manuel

*Manuel crosses to the balcony window the way he does every morning, eyes half shut, and looks down
at the ottoman.*

*He keeps looking.*

**MANUEL:** No.

*The window slides. He did not have to unlatch it.*

**MANUEL:** No, no, no.

*A bare ottoman. A length of white ribbon knotted to its leg, standing up eight inches into the air
and ending there.*

**MANUEL:** Che. Trevor. Michael.

**MICHAEL:** Is it raining?

**MANUEL:** Come here.

Next: -> coldopen_gather

#### if speaker=trevor

*Trevor checks the balcony on his way to the sink. Everyone does. Ottoman: dry.*

**TREVOR:** Dry. Clear. No ball...

*He stops walking.*

**TREVOR:** Huh.

*The window slides. He did not have to unlatch it. Behind him, Manuel is blinking at a cold gourd.*

Choices:
- "Manuel. Come look at this." -> coldopen_trevor_straight
- "Hey. Did you bring the balloon in tonight?" -> coldopen_trevor_soft
- (Say nothing yet. Look closer.) -> coldopen_trevor_stalls

#### if speaker=michael

*Michael drifts to the balcony window with his phone held up, hunting for one bar. He glances down
at the ottoman on the way. Everyone does.*

**MICHAEL:** Dry. Nice.

*Phone up. Then he looks down again.*

*The window slides. He did not have to unlatch it.*

Choices:
- "Hey, did we move the balloon?" -> coldopen_michael_asks
- "Manuel. Don't freak out." -> coldopen_michael_warns

### node: coldopen_trevor_straight

**TREVOR:** Manuel. Come look at this.

**MANUEL:** Is it raining?

**TREVOR:** No.

*Manuel is already moving.*

Next: -> coldopen_gather

### node: coldopen_trevor_soft

**TREVOR:** Hey. Did you bring the balloon in tonight?

**MANUEL:** Why would I bring it in.

**TREVOR:** No reason. Come here a second.

*Manuel puts the gourd down very carefully, the way a person does when they have already
understood.*

Next: -> coldopen_gather

### node: coldopen_trevor_stalls

*Sets* `act1.coldopen.trevorStalled`.

*Trevor crouches by the ottoman. The ribbon ends eight inches above the knot. He turns the end over
with one finger.*

**TREVOR:** *(quiet)* Okay. That's not a pop.

**MANUEL:** What's not a pop.

*Trevor does not answer fast enough.*

**MANUEL:** Trevor. What's not a pop.

Next: -> coldopen_gather

### node: coldopen_michael_asks

**MICHAEL:** Hey, did we move the balloon?

**MANUEL:** What?

**MICHAEL:** The balloon. It's not on the... it's probably nothing. It's not there, though.

*A chair goes over at the workbench.*

Next: -> coldopen_gather

### node: coldopen_michael_warns

**MICHAEL:** Manuel. Don't freak out.

**MANUEL:** Why would I freak out.

*He is already at the window.*

**MICHAEL:** That's why I said it first.

Next: -> coldopen_gather

### node: coldopen_gather

*All three on the balcony. Six floors down, the metro plaza hums under old sodium light. The
ottoman sits where it always sits. The ribbon is tied to its leg. The ribbon goes up eight inches
and stops.*

**MICHAEL:** Okay. So it popped.

**TREVOR:** There'd be skin.

**MICHAEL:** It blew away.

**TREVOR:** Then the ribbon goes with it.

*Manuel holds up the loose end. It is perfectly flat across.*

**MANUEL:** It's cut.

**MICHAEL:** Ribbons fray.

**MANUEL:** It's cut, Michael.

*Nobody says anything. Down on the plaza a scooter whines past and is gone.*

**MICHAEL:** Ottoman's dry, at least. So. No rain.

**MANUEL:** I wasn't checking the weather.

*A long moment. Michael looks at the ottoman as if it has been lying to him for two years.*

Choices:
- [speaker=manuel] "It was here at midnight. I looked." -> coldopen_gather_manuel_midnight
- [speaker=manuel] "Someone took it." -> coldopen_gather_manuel_took
- [speaker=trevor] "Who's been out here tonight?" -> coldopen_gather_trevor_who
- [speaker=trevor] "It's a sealed bag of helium. Somebody knew that." -> coldopen_gather_trevor_helium
- [speaker=michael] "We'll find it. It's orange." -> coldopen_gather_michael_kind
- [speaker=michael] "Who steals a balloon?" -> coldopen_gather_michael_who

### node: coldopen_gather_manuel_midnight

**MANUEL:** It was here at midnight. I looked.

**TREVOR:** You look every morning.

**MANUEL:** I looked at midnight too.

**MICHAEL:** How many times a day do you...

**MANUEL:** That's not what we're talking about.

Next: -> coldopen_gather_close

### node: coldopen_gather_manuel_took

**MANUEL:** Someone took it.

**MICHAEL:** From the sixth floor?

**MANUEL:** Someone took it.

**TREVOR:** Okay. Then someone left a trail. People are sloppy.

**MANUEL:** This wasn't sloppy. Look at it.

*He is still holding the end of the ribbon.*

Next: -> coldopen_gather_close

### node: coldopen_gather_trevor_who

**TREVOR:** Who's been out here tonight?

**MICHAEL:** Me. For signal. Around one. It was there.

*Trevor waits.*

**MICHAEL:** I think it was there.

**TREVOR:** You think.

**MICHAEL:** I don't take attendance on the balloon, Trevor.

**MANUEL:** I do.

Next: -> coldopen_gather_close

### node: coldopen_gather_trevor_helium

**TREVOR:** It's a sealed bag of helium on a balcony. You know what a liter of that goes for?

**MICHAEL:** No.

**TREVOR:** Me neither. That's how much it is.

**MANUEL:** It's not for selling.

**TREVOR:** I know. Somebody else doesn't.

Next: -> coldopen_gather_close

### node: coldopen_gather_michael_kind

**MICHAEL:** We'll find it. It's orange. Nothing else out there is orange.

*Manuel looks out at the plaza. Gray, sodium yellow, the dead blue of a billboard. He is right.*

**MICHAEL:** That was supposed to help.

**MANUEL:** I know.

Next: -> coldopen_gather_close

### node: coldopen_gather_michael_who

**MICHAEL:** Who steals a balloon?

**TREVOR:** Someone who knows what's in it.

**MICHAEL:** Air?

**TREVOR:** Helium.

**MICHAEL:** That's a kind of air.

**TREVOR:** Rookie Aster mistake.

Next: -> coldopen_gather_close

### node: coldopen_gather_close

*Sets* `act1.coldopen.discovered`.

**TREVOR:** Okay. Nobody touch anything.

**MICHAEL:** You're touching the railing.

**TREVOR:** Nobody touch anything else.

**TREVOR:** Aster pros don't lose things. We look. The window, the room, all of it. Then we panic.

**MANUEL:** I'm panicking now.

**TREVOR:** Then panic and look.

*Control returns. Objective:* `Look around 631.` *Every object in Parts 3 and 4 is now inspectable
and counts.*

---

## Part 3: The balcony and the clues

### node: inspect_ottoman

**INSPECT:** The balcony ottoman. Vinyl, split at one corner, older than the lease. Everyone in 631
looks at it before they look at the sky. Wet means rain. Dusty means wind off Route 1. Tonight it
is dry, and it is only an ottoman.

#### if speaker=manuel

**MANUEL:** On cold mornings it sat low. Almost touching. I'd think, that's it, it's dying.

**MANUEL:** Then the sun came around the building and it went back up.

#### if speaker=trevor

**TREVOR:** We have three weather feeds and a barometer I built. We look at a footstool.

**TREVOR:** It's never been wrong.

#### if speaker=michael

**MICHAEL:** She sat on this once. Manuel was very polite about it for about four seconds.

### node: inspect_ribbon

*Sets* `act1.coldopen.ribbonInspected`.

**INSPECT:** White curling ribbon, the cheap kind. It is tied to the ottoman's leg with a knot that
has been retied many times by the same hands. Eight inches up, it ends. The end is flat. No fray,
no stretch, no tooth marks.

#### if speaker=manuel

**MANUEL:** One cut. They didn't even pull on it first.

Choices:
- [!flag act1.coldopen.ribbonTaken] [!flag act1.coldopen.ribbonLeft] "Untie it. Take it with you." -> inspect_ribbon_take
- [!flag act1.coldopen.ribbonTaken] [!flag act1.coldopen.ribbonLeft] "Leave it tied." -> inspect_ribbon_leave

#### if speaker=trevor

**TREVOR:** Square edge. One pass. A knife drags, and this didn't drag.

**TREVOR:** Not mine to untie.

#### if speaker=michael

**MICHAEL:** Who brings something sharp to a balcony?

**MICHAEL:** Who brings something sharp to a sixth-floor balcony. From where.

### node: inspect_ribbon_take

*Sets* `act1.coldopen.ribbonTaken`. *Grants item* `ribbon`.

*Manuel works the knot loose. It takes a while; it is his knot. He winds the ribbon around two
fingers and puts it in his shirt pocket.*

**MANUEL:** It's a good ribbon.

### node: inspect_ribbon_leave

*Sets* `act1.coldopen.ribbonLeft`.

*Manuel tightens the knot instead.*

**MANUEL:** It stays. It needs somewhere to be tied when it's back.

### node: inspect_latch

*Sets* `act1.coldopen.latchInspected`.

**INSPECT:** The balcony window latch. A plain steel thumb-turn on the inside of the frame. No lace
reader, no lock log, nothing in it that could rot. It is open. The paint around it is unscratched.

#### if speaker=trevor

**TREVOR:** I latch this. Every night. I latch it and then I check that I latched it.

**TREVOR:** So it was opened from in here.

**TREVOR:** Or I didn't check. I always check.

#### if speaker=manuel

**MANUEL:** Six floors. Nobody climbs six floors for a balloon.

**MANUEL:** So nobody climbed.

#### if speaker=michael

**MICHAEL:** I was out here around one, for signal. I latched it after.

**MICHAEL:** I'm pretty sure I latched it after.

**MICHAEL:** Don't tell Trevor I said "pretty sure."

### node: inspect_balcony_view

*Sets* `act1.coldopen.sloganSeen` *and* `act1.coldopen.vanSeen`.

**INSPECT:** College Park at 2:58 a.m. The metro plaza. The dead escalator. A Purple Line sign that
says OPENING SOON. Across Route 1 a billboard is losing a fight with itself: AT THE END OF THE DAY
NO ONE CAN CODE FASTER THAN A. The last letter went dark years ago. Down by the storm grate, an
abatement van idles with its sensor mast up.

#### if speaker=trevor

**TREVOR:** Third night that van's been there. They're not cleaning anything. They just sit with
the mast up.

#### if speaker=michael

**MICHAEL:** "No one can code faster than a." Faster than a what. They never say.

#### if speaker=manuel

**MANUEL:** No orange. Anywhere. I'd see it.

**MANUEL:** You can see the 245 building from here. Lights on. I hate 245 lab.

### node: inspect_printer_3

*Sets* `act1.coldopen.printerWarm`.

**INSPECT:** Printer #3. The quiet one, in the corner by the statues. The bed is empty and clean.
The status screen reads `LAST JOB: 01 JAN 1901`. Hold a hand over the bed.

**INSPECT:** It is warm.

#### if speaker=trevor

**TREVOR:** Bed's at forty, maybe. That's an hour off a job. Not a day.

**TREVOR:** Spool's lighter than it was Tuesday. I weigh them.

**TREVOR:** I didn't queue anything. I'd remember. I think I'd remember.

#### if speaker=manuel

**MANUEL:** Tres is always a little warm. We stopped asking.

*He leaves his hand there a second longer.*

**MANUEL:** Not this warm.

#### if speaker=michael

**MICHAEL:** Warm. Like a seat somebody just got up from.

**MICHAEL:** I don't like that I thought of it that way.

### node: inspect_printer_1

**INSPECT:** Printer #1. The workhorse. The bed is scarred and the frame is braced with a part it
printed for itself. It is cold.

#### if speaker=manuel

**MANUEL:** Uno. Never jams. Never complains. The best roommate.

#### if speaker=trevor

**TREVOR:** Cold. Last thing off it was my pill funnel.

#### if speaker=michael

**MICHAEL:** This one made my phone stand. And my other phone stand.

### node: inspect_printer_2

**INSPECT:** Printer #2. The enclosure door hangs from one hinge. Half a scooter fender has been
fused to the bed since October. It is cold.

#### if speaker=trevor

**TREVOR:** Michael's fender. It's part of the printer now. Rookie Aster mistake.

#### if speaker=michael

**MICHAEL:** I'm going to finish that.

**MICHAEL:** I'm letting it cure.

#### if speaker=manuel

**MANUEL:** We don't talk about Dos.

---

## Part 4: Everything else in 631

### node: inspect_degassing_chamber

**INSPECT:** The degassing chamber. A steel pot with a clear lid and a vacuum pump that sounds like
a sick goat. It pulls the air out of resin and silicone so the bubbles rise and burst before a cast
sets.

#### if speaker=manuel

**MANUEL:** Every mold for the statues went through this. Leave the air in and the face comes out
wrong.

#### if speaker=trevor

**TREVOR:** We put Michael's phone in here once and called it. Screen lit up. No sound. Sound needs
air.

**TREVOR:** It rang the whole time. You just couldn't hear it.

#### if speaker=michael

**MICHAEL:** I watched my phone ring in there once. No sound. Just the screen, going and going.

**MICHAEL:** I didn't love it.

### node: inspect_dehumidifier

**INSPECT:** The dehumidifier. It keeps the filament dry and stops the wall behind the printers
from growing a second wall. In September somebody dragged it over by the balcony window. Its tank
is full.

#### if speaker=manuel

**MANUEL:** I moved it. The damp comes in at the window. It's bad for the...

**MANUEL:** For the filament.

#### if speaker=trevor

**TREVOR:** A liter a night, out of thin air. It's technically distilled.

**TREVOR:** I'm not saying drink it. I'm saying technically.

#### if speaker=michael

**MICHAEL:** Trevor looked at this tank for a long time once. I'm not saying what he did. I'm
saying he looked.

### node: inspect_microscope

**INSPECT:** A secondhand optical microscope, one eyepiece held on with tape. A box of slides in
two handwritings. Trevor's: `TANK 11/02`. `MOLT`. `MICHAEL EYELASH (EVIDENCE)`. Manuel's, one slide
only: `GLOBO ?`

#### if speaker=manuel

**MANUEL:** A flake came off the knot once. I wanted to see what it was made of.

**MANUEL:** It looked like dust. I kept it anyway.

#### if speaker=trevor

**TREVOR:** Four hundred times. Enough for shrimp parasites.

**TREVOR:** Whatever Manuel wanted to see on that slide, this won't show it.

#### if speaker=michael

**MICHAEL:** The eyelash was in the shrimp tank. There was an inquiry.

**MICHAEL:** I was cleared.

### node: inspect_soldering_iron

*Sets* `act1.coldopen.cuttersNoticed`.

**INSPECT:** The soldering station. Iron in its stand, tip tinned, sponge dry. Cold. Beside it, an
old burn in the bench the exact shape of an iron. On the pegboard, the flush cutters are hanging on
the pliers' hook.

#### if speaker=trevor

**TREVOR:** Iron's off. Good.

**TREVOR:** Cutters are on the wrong hook. Somebody used them and put them back like an Aster noob.

#### if speaker=michael

**MICHAEL:** The burn's mine. I own the burn.

**MICHAEL:** The cutters aren't me. I'd have left them on the couch.

#### if speaker=manuel

**MANUEL:** The line robots solder faster than me. Everybody knows. It's on the billboards.

**MANUEL:** Mine you can tell a person did.

### node: inspect_drills

**INSPECT:** Three drills, one charger, and a bit case with every size except the one you need.
Above them, a shelf bracket with five holes in it. None of the five line up with the holes in the
wall.

#### if speaker=michael

**MICHAEL:** I measured twice.

**MICHAEL:** The wall moved.

#### if speaker=trevor

**TREVOR:** Five holes, and you can't see through a single one. That takes talent.

#### if speaker=manuel

**MANUEL:** The three-mil bit has been missing since I moved in. I think the building eats them.

### node: inspect_oscilloscope

*Sets* `act1.coldopen.scopeSeen`.

**INSPECT:** An oscilloscope older than any of them. Green trace, knobs worn smooth. The probe is
clipped to nothing, so the trace should be flat hum. It isn't, quite. Three small bumps. A gap.
Three small bumps.

#### if speaker=trevor

**TREVOR:** Floating probe. It'll pick up anything. Compressor. Elevator. Somebody's lace.

**TREVOR:** Three and a gap. That's not mains.

#### if speaker=michael

**MICHAEL:** Is it supposed to do that?

**MICHAEL:** I'm going to assume it's supposed to do that.

#### if speaker=manuel

**MANUEL:** It's the dehumidifier. It's always the dehumidifier.

*He taps the pattern on the bench with one finger. Three and a gap. He does not notice he is doing
it.*

### node: inspect_pacifiers

*Sets* `act1.coldopen.fourthPacifierSeen`.

**INSPECT:** A jar of pacifiers on the shelf by the door. Long lace sessions make you clench, and
the lab's mouthguards taste like the last person. Three have an initial in marker: M, T, M. Both
M's insist theirs is the other one. A fourth has no initial.

#### if speaker=michael

**MICHAEL:** Don't move the fourth one.

**MICHAEL:** Just don't.

#### if speaker=trevor

**TREVOR:** Six hours of 245 lab and your jaw's a vise. These are cheaper than teeth.

**TREVOR:** The fourth one's not mine to throw out.

#### if speaker=manuel

**MANUEL:** Mine is the chewed one.

**MANUEL:** I hate 245 lab.

### node: inspect_flag

**INSPECT:** The John Pork flag. A pig's face with a phone to its ear, hand-stitched onto a
bedsheet. Owning one is a loyalty-score matter. It hangs on the only wall you can't see from the
hallway. Its other side is the Maryland flag, the one flag in the union loud enough to hide behind.

#### if speaker=manuel

**MANUEL:** My stitching. Trevor's bedsheet.

**MANUEL:** He looks like he's about to say something. He always looks like that.

#### if speaker=trevor

**TREVOR:** That was a good sheet.

**TREVOR:** It's a better flag.

#### if speaker=michael

**MICHAEL:** Inspection days we flip it. Nobody has ever looked twice at a Maryland flag. You
can't. It hurts.

Choices:
- [!flag act1.coldopen.flagDecided] "Flip it to the Maryland side." -> inspect_flag_flip
- [!flag act1.coldopen.flagDecided] "Leave him up." -> inspect_flag_leave

### node: inspect_flag_flip

*Sets* `act1.coldopen.flagDecided` *and* `act1.coldopen.flagHidden`.

*The sheet turns. Red, white, black, and gold, all at once.*

#### if speaker=manuel

**MANUEL:** Sorry, John. One night.

#### if speaker=trevor

**TREVOR:** If we're leaving the apartment empty, he's not the one watching it.

#### if speaker=michael

**MICHAEL:** Back in a bit, big guy.

### node: inspect_flag_leave

*Sets* `act1.coldopen.flagDecided`.

#### if speaker=manuel

**MANUEL:** He stays. Somebody should be home.

#### if speaker=trevor

**TREVOR:** It's three in the morning. Nobody's inspecting.

#### if speaker=michael

**MICHAEL:** He can watch the place.

### node: inspect_statues_old

**INSPECT:** Two statues of John Pork in cast resin, each about as tall as a thermos. The first is
lumpy, one ear bigger than the other. The second is better. Both have thumbprints in the back,
where the mold was pulled too early.

#### if speaker=manuel

**MANUEL:** Primero. I made him the week I got here. I didn't know anyone.

**MANUEL:** Segundo I made after midterms. I knew two people.

#### if speaker=trevor

**TREVOR:** First one looks like a potato taking a call. I told him that.

**TREVOR:** He made the second one out of spite. It worked.

#### if speaker=michael

**MICHAEL:** I like the lumpy one. Lumpy one's trying his best.

### node: inspect_statue_new

*Sets* `act1.coldopen.statueNewInspected`.

**INSPECT:** The third statue. The newest. Same pig, same phone, same long coat. Nothing about it
is lumpy. The proportions are exact, the way a thing is exact when it was measured instead of
remembered.

Choices:
- [speaker=manuel] (Look at it a little longer.) -> coldopen_statue_manuel
- [speaker=trevor] "This one's actually good. When'd you get this good?" -> coldopen_statue_trevor
- [speaker=michael] "This is the best one. You should sign it." -> coldopen_statue_michael
- (Step away.) -> coldopen_statue_exit

### node: coldopen_statue_exit

*The roommate steps back. The statue keeps looking at the flag.*

### node: coldopen_statue_manuel

**MANUEL:** *(under his breath)* Primero. Segundo.

*He looks at the third one for a while.*

**MANUEL:** I name them when I start. I don't have a name for this one.

Choices:
- "Say it out loud." -> coldopen_statue_manuel_tells
- "Keep it to yourself." -> coldopen_statue_manuel_quiet

### node: coldopen_statue_manuel_tells

*Sets* `act1.coldopen.statueDoubtShared`.

**MANUEL:** When did I make this one?

**TREVOR:** Over break. It was here when we got back.

**MICHAEL:** You said "what do you think" and I said "it's really good" and you said "yeah."

**MANUEL:** I said "yeah."

**MICHAEL:** You were a little weird about it. I figured, artist.

**MANUEL:** The first two, I remember where I sat. What I was drinking. This one I remember being
finished.

**TREVOR:** You told us you didn't sleep that whole break.

**MANUEL:** I remember telling you that, too.

*Nobody has a joke.*

**MICHAEL:** It's really good, though.

### node: coldopen_statue_manuel_quiet

*Sets* `act1.coldopen.statueDoubtKept`.

*He straightens it a few degrees on the shelf. It was already straight.*

**MANUEL:** *(quiet)* Later.

### node: coldopen_statue_trevor

**TREVOR:** This one's good. Like, actually good. When'd you get this good?

**MANUEL:** Over break.

**TREVOR:** What changed?

**MANUEL:** I don't know. It was just better.

**TREVOR:** That's not how getting better works. I'd know. I track it.

Choices:
- "Walk me through it. Clay, mold, cast." -> coldopen_statue_trevor_push
- "Whatever you took, I want the stack." -> coldopen_statue_trevor_drop

### node: coldopen_statue_trevor_push

*Sets* `act1.coldopen.statueDoubtShared`.

**TREVOR:** Walk me through it. Clay, mold, cast. How long did the face take?

**MANUEL:** A while.

**TREVOR:** A while.

**MANUEL:** I don't remember the face, okay? I remember the other two. I don't remember this one.

*Trevor opens his mouth, and closes it.*

**TREVOR:** Okay. Balloon first.

### node: coldopen_statue_trevor_drop

*Sets* `act1.coldopen.statueAsked`.

**TREVOR:** Well. Whatever you took, I want the stack.

**MANUEL:** *(not laughing)* Yeah.

### node: coldopen_statue_michael

**MICHAEL:** This is the best one. I told you that, right? When we got back from break?

**MANUEL:** You told me.

**MICHAEL:** You should sign it. You signed the other two.

*Manuel turns it over. The base is blank.*

**MANUEL:** I always sign them.

Choices:
- "So sign it now. I've got a marker." -> coldopen_statue_michael_marker
- "Why didn't you?" -> coldopen_statue_michael_why

### node: coldopen_statue_michael_marker

*Sets* `act1.coldopen.statueAsked`.

**MICHAEL:** So sign it now. I've got a marker.

*Manuel takes the marker. He holds it over the base. He gives it back.*

**MANUEL:** After we find the balloon.

### node: coldopen_statue_michael_why

*Sets* `act1.coldopen.statueDoubtShared`.

**MICHAEL:** Why didn't you?

**MANUEL:** I don't remember finishing it. I don't remember starting it.

**MICHAEL:** Like a blackout?

**MANUEL:** Like it was there, and it was mine, so I must have.

**MICHAEL:** Okay.

**MICHAEL:** That's kind of the most artist thing you've ever said.

**MANUEL:** It's not that.

**MICHAEL:** I know. I'm helping.

### node: inspect_shrimp_tank

*Sets* `act1.coldopen.shrimpBaseline`.

**INSPECT:** Trevor's shrimp tank. Twenty liters, moss, a sponge filter, eleven cherry shrimp. No
pump controller, no smart light, nothing with firmware. The water is clear. All eleven are out on
the glass, working. None of them are hiding.

#### if speaker=trevor

**TREVOR:** Nine, ten, eleven. Everybody's home.

**TREVOR:** Clear water, nobody hiding. The building's fine. Tonight, anyway.

**TREVOR:** *(to the tank)* Did you see it?

**TREVOR:** No. Okay.

#### if speaker=michael

**MICHAEL:** Trevor says when they all hide, something's wrong with the building. They're not
hiding.

**MICHAEL:** So that's good? I don't speak shrimp.

#### if speaker=manuel

**MANUEL:** You were awake. You saw who it was.

*A shrimp cleans its face.*

**MANUEL:** Beautiful. Useless.

### node: inspect_guitar

**INSPECT:** An acoustic guitar on a wall hook. Spruce top, a crack by the bridge glued by someone
patient. No pickup, no tuner, no strap lock. Wood and wire.

#### if speaker=trevor

*He plucks one string. It is flat.*

**TREVOR:** That's the humidity.

**TREVOR:** It's not the humidity. I just don't tune it.

#### if speaker=michael

**MICHAEL:** He knows one song. I think it's about creatine.

#### if speaker=manuel

**MANUEL:** The only thing in this apartment that can't crash.

### node: inspect_mate_station

**INSPECT:** Manuel's mate station. Gourd, bombilla, a steel thermos, a bag of yerba with the
customs tape still on it. The gourd on the workbench has gone cold.

#### if speaker=manuel

**MANUEL:** Seventy-five degrees. Never boiling. Boiling is how you burn the yerba and lose your
family.

**MANUEL:** Somebody should drink something. Something goes wrong, you heat water. That's the rule.

#### if speaker=trevor

**TREVOR:** It's a stimulant, a diuretic, and a social obligation. I told him I don't share
straws.

**TREVOR:** I share the straw.

#### if speaker=michael

**MICHAEL:** First time he handed me one I said "thanks" and he took it away. Apparently "thanks"
means you're done.

**MICHAEL:** I haven't thanked him since. For anything. Just in case.

### node: inspect_bookshelf

*Sets* `act1.coldopen.book631Seen` *and* `act1.coldopen.reyesBookSeen`.

**INSPECT:** One shelf of real paper. A lab manual with three names crossed out before theirs. A
bound volume of an old science journal, 631 on the spine, that falls open to the same paper every
time. And the 245 textbook: SELF-MODELS IN LARGE SYSTEMS, I. REYES. One corner has a bite in it.

#### if speaker=manuel

**MANUEL:** Six thirty-one. That's why I wanted this room.

**MANUEL:** And the balcony.

#### if speaker=trevor

**TREVOR:** The journal's pre-slop. Actual people, actual typos. It's worth more than the scooters.

**TREVOR:** We keep it next to a lab manual so nobody looks.

#### if speaker=michael

**MICHAEL:** I got to chapter four of the Reyes. Chapter four is where it asks if the system knows
it's a system.

**MICHAEL:** I had to lie down.

### node: inspect_couch

*Sets* `act1.coldopen.mugSeen`.

**INSPECT:** The couch. A blanket, one shoe, a charger with a chewed cable. On the shelf above it,
a mug with a tea bag dried to the bottom. Nobody washes the mug. Nobody has been told not to.

#### if speaker=michael

**MICHAEL:** Hers. She put it down to take a call.

**MICHAEL:** She's coming back for it. That's why it's there.

*He checks his phone. No missed calls. He checks again.*

#### if speaker=trevor

**TREVOR:** I've cleaned around that mug since she put it there.

**TREVOR:** I'll keep cleaning around it.

#### if speaker=manuel

**MANUEL:** He sleeps out here when his room's too quiet. We don't say anything. We leave the
blanket.

### node: inspect_supplements

**INSPECT:** Trevor's shelf. A pill organizer with twenty-eight doors, each labeled with an hour.
Tubs: creatine, magnesium, glycine, algae oil. A bag with no label and a hand-drawn skull. The
skull is smiling.

#### if speaker=trevor

**TREVOR:** It's a system. Everything on this shelf is legal.

**TREVOR:** Most of this shelf is legal.

**TREVOR:** The skull's a joke. The bag is not a joke.

#### if speaker=michael

**MICHAEL:** Forty things a day and I've watched him lose to a pickle jar.

**MICHAEL:** In his defense, it was a serious jar.

#### if speaker=manuel

**MANUEL:** He wants to live forever. I asked him, for what?

**MANUEL:** He said, "I'll have time to figure that out."

### node: inspect_scooters

**INSPECT:** Three scooters by the door, two outlets. A charging rota is taped to the wall. It was
followed for nine days.

#### if speaker=trevor

**TREVOR:** Mine's charged. Mine's always charged. I don't trust the rota. I trust me.

#### if speaker=michael

**MICHAEL:** Four percent. That's a tomorrow problem.

**MICHAEL:** It's tomorrow. Okay.

#### if speaker=manuel

**MANUEL:** No riding inside. Super's rule. Michael's fault.

### node: inspect_notice

*Sets* `act1.coldopen.noticeRead`.

**INSPECT:** A printed notice, slid under the door some time yesterday. CITIZENS, THINGS ARE
STABLE. An abatement survey is being conducted in your area for your safety. No action is required.

#### if speaker=trevor

**TREVOR:** "No action is required." That's what they say right before you should've done
something.

#### if speaker=michael

**MICHAEL:** There's a little checkbox. "Things: stable." It's checked.

**MICHAEL:** They pre-checked it.

#### if speaker=manuel

**MANUEL:** Survey yesterday. Balloon tonight.

**MANUEL:** I'm not saying anything. I'm saying them in order.

---

## Part 5: Leaving

### node: coldopen_all_inspected

*Fires once, the moment all three* `act1.coldopen.inspected.*` *flags are set and no dialogue is
open. Plays as overhead barks, not a locked conversation. The front door gains the prompt*
`Leave 631`.

**TREVOR:** Okay. It's not in here.

**MANUEL:** It was never going to be in here.

**MICHAEL:** So, the building?

*Objective:* `Search ASTER.` *Players may keep inspecting for as long as they like.*

### node: coldopen_leave

*Triggered by using the front door after* `coldopen_all_inspected`. *All three walk to the door.*

Next: -> coldopen_leave_latch_check

### node: coldopen_leave_latch_check

*Plays only if* `[!flag act1.coldopen.latchInspected]`. *Otherwise skip to*
`coldopen_leave_printer_check`.

*On the way past the balcony window, Trevor stops.*

**TREVOR:** Hang on.

*He thumbs the latch. It is already open.*

**TREVOR:** I latch this. Every night.

**MICHAEL:** I was out there at one. I latched it after. Pretty sure.

**TREVOR:** Then it was opened from in here.

*Nobody likes that sentence.*

*Sets* `act1.coldopen.latchInspected`.

Next: -> coldopen_leave_printer_check

### node: coldopen_leave_printer_check

*Plays only if* `[!flag act1.coldopen.printerWarm]`. *Otherwise skip to*
`coldopen_leave_flag_check`.

*Something ticks in the corner. A cooling fan, spinning down.*

**MICHAEL:** Is Three running?

**TREVOR:** Nothing's queued.

*Manuel holds his palm over the bed.*

**MANUEL:** It's warm.

**TREVOR:** Whose job?

*Nobody's.*

*Sets* `act1.coldopen.printerWarm`.

Next: -> coldopen_leave_flag_check

### node: coldopen_leave_flag_check

*Plays only if* `[!flag act1.coldopen.flagDecided]`. *Otherwise skip to* `coldopen_leave_final`.
*The speaker is whoever used the door.*

**MICHAEL:** Flag?

Choices:
- "Flip it. We're leaving the place empty." -> inspect_flag_flip
- "Leave him up." -> inspect_flag_leave

*After either node:* Next: -> coldopen_leave_final

### node: coldopen_leave_final

**MANUEL:** Somebody in this building has it.

**TREVOR:** Or saw it. Six floors of people who don't sleep.

**MICHAEL:** It's three a.m. We can't just knock on doors.

**TREVOR:** It's Aster. Everyone's up.

*Manuel looks back once at the balcony. Out of habit.*

#### if flag act1.coldopen.ribbonTaken

*His hand goes to his shirt pocket and stays there.*

#### if flag act1.coldopen.ribbonLeft

*Eight inches of white ribbon, standing straight up in no wind.*

#### otherwise

*The ottoman. Dry.*

**MICHAEL:** Hey. We're Aster pros. We'll have it back by breakfast.

**MANUEL:** It's not morning yet.

**TREVOR:** Then we've got time.

*The door opens on the sixth-floor hallway. Behind them the microwave clock turns over to 3:00.
Somewhere far below, in the pipes or under them, something knocks three times.*

*Michael looks at Trevor. Trevor shrugs. The door closes.*

*Sets* `act1.coldopen.complete`. *Transition to beat 1 (ASTER, sixth-floor hallway).*

---

## Part 6: Barks and ambient lines

### Pre-discovery deflects

Played when a roommate tries any object other than the balcony window before
`act1.coldopen.discovered`. Do not count as inspects.

| id | speaker | trigger | line |
|---|---|---|---|
| pre_manuel_1 | manuel | interact with any object, first time | Weather first. Then everything else. |
| pre_manuel_2 | manuel | interact with any object, later times | Wait. I haven't looked yet. |
| pre_trevor_1 | trevor | interact with any object, first time | Water. Then weather. Then whatever this is. |
| pre_trevor_2 | trevor | interact with any object, later times | It'll be there in a minute. |
| pre_michael_1 | michael | interact with any object, first time | Signal's better by the window. One sec. |
| pre_michael_2 | michael | interact with any object, later times | Window first. I've got no bars. |

### Free-roam barks (after discovery)

One bark at most every 20 seconds per roommate. Each id fires once per scene unless marked repeat.

| id | speaker | trigger | line |
|---|---|---|---|
| bark_manuel_idle_1 | manuel | idle 15s | It was right there. It's always right there. |
| bark_manuel_idle_2 | manuel | idle 30s | I hate 245 lab. |
| bark_manuel_balcony | manuel | re-enters the balcony | I keep thinking it'll be back when I look. |
| bark_manuel_under | manuel | inspectCount reaches 6 | Check under things. No. It floats. Check over things. |
| bark_manuel_noob | manuel | any roommate walks into furniture | Rookie Aster mistake. |
| bark_trevor_idle_1 | trevor | idle 15s | Latch, printers, door. In that order. Then I can think. |
| bark_trevor_idle_2 | trevor | idle 30s | I'm going to be useless at six. I only got half the glycine window. |
| bark_trevor_tank | trevor | passes the shrimp tank without inspecting | I'll count you in a second. |
| bark_trevor_pros | trevor | inspectCount reaches 4 | Aster pros don't lose things. Things get moved. |
| bark_trevor_noob | trevor | any roommate re-inspects an object a third time | It hasn't changed. Aster noob. |
| bark_michael_idle_1 | michael | idle 15s | Okay. If I was a balloon. |
| bark_michael_idle_2 | michael | idle 30s | She'd have found it by now. She found my keys in the freezer once. |
| bark_michael_phone | michael | stands on the balcony 5s | One bar. One and a half. Come on. |
| bark_michael_shoe | michael | starts moving, first time | Where's my other shoe. |
| bark_michael_shoe_2 | michael | inspects the couch | There's my other shoe. |
| bark_michael_manuel | michael | within 2 tiles of Manuel, 5s | Hey. We'll get it back. |
| bark_manuel_reply | manuel | after bark_michael_manuel | You don't know that. |
| bark_michael_reply | michael | after bark_manuel_reply | No. I'm saying it anyway. |

### Movement tutorial barks

| id | speaker | trigger | line |
|---|---|---|---|
| dodge_trevor | trevor | first dodge indoors, by Trevor | Mobility work. You should all be doing it. |
| dodge_trevor_react | michael | after dodge_trevor | It's three a.m. |
| dodge_michael | michael | first dodge indoors, by Michael | I meant to do that. |
| dodge_michael_react | trevor | after dodge_michael | You rolled into the scooters. |
| dodge_manuel | manuel | first dodge indoors, by Manuel | I'm looking under the couch. Fast. |
| dodge_manuel_react | michael | after dodge_manuel | It floats, man. |

### Repeat inspects

A second inspect of an already-read object by the same roommate plays the `INSPECT` text only. A
third plays one of these instead.

| id | speaker | trigger | line |
|---|---|---|---|
| repeat_manuel | manuel | third inspect of any object | I know what it is. I'm looking for what's wrong with it. |
| repeat_trevor | trevor | third inspect of any object | Same as it was. I checked. |
| repeat_michael | michael | third inspect of any object | Still that. |
| repeat_printer3 | any | third inspect of printer #3 | *It is still warm.* |
| repeat_ottoman_manuel | manuel | third inspect of the ottoman | *He checks it anyway.* |

---

## Notes for implementers

**Flow and gating**

- Order: `coldopen_fade_in` and the three wake nodes play as one shared, non-skippable-for-others
  sequence (about 35 seconds; any player may hold to skip their own text box, the sequence advances
  on the host). Then free movement with only the balcony window live.
- `coldopen_glance` is triggered by the first roommate to use the balcony window. That roommate is
  `speaker` through `coldopen_gather` and its follow-up node. The other two are pulled to the
  balcony for `coldopen_gather` (walk them, do not teleport, if they are within the room).
- After `coldopen_gather_close`, each roommate's first completed inspect of any Part 3 or Part 4
  object sets `act1.coldopen.inspected.<name>`. Opening and closing the box counts; choices inside
  a node do not need to be resolved.
- `coldopen_all_inspected` fires when all three are set. The front door is inert before that
  (prompt hidden, not greyed out).
- The two catch-up nodes in Part 5 guarantee the T5 and T1 clues are seen on every run even if
  nobody inspected the latch or printer #3. Keep them.

**Solo and two-player sessions**

- For any roommate not controlled by a player, run them as a companion and have them auto-inspect
  after discovery: Trevor goes to the shrimp tank at +8s, Michael to the couch at +14s, Manuel to
  the ottoman at +5s. Play that roommate's variant as an overhead bark and set their
  `inspected.*` flag. A solo player therefore finishes the scene by inspecting one object
  themselves, but the room rewards staying.
- If no player controls Manuel, a companion Manuel never takes or leaves the ribbon and never opens
  the statue conversation on his own. `ribbonTaken`, `ribbonLeft`, and the `statueDoubt*` flags
  simply stay unset, and later scenes must treat "unset" as a valid state.

**Speaker rules**

- Inspect variants key on who pressed the button. The statue conversations and the gather
  follow-ups include lines from the other two roommates; play those regardless of who controls
  them.
- Choices are shown only to the speaker's player. Other players see the lines as they are chosen.

**Twist fairness (do not edit lines in these nodes without re-checking DESIGN §9)**

- No line in this scene reads `world.seed.variant`. `inspect_latch`, `inspect_printer_3`,
  `inspect_ribbon`, `inspect_statue_new`, and all `coldopen_statue_*` nodes are written to be true
  under A and B, and under B with any of the three roommates as the seeded one. Statements about
  what a roommate did are phrased as memory ("I'd remember. I think I'd remember." / "I'm pretty
  sure I latched it after."), and `INSPECT` text sticks to physical facts that hold either way.
- The third statue: the base is unsigned, Manuel has no name for it, it was already on the shelf
  when Trevor and Michael got back from break. Nobody saw it being made and nobody says they did.
  Keep it that way in later scenes.
- Each roommate has one small, innocent, suspicious detail on purpose (competing suspicions, BRIEF
  §4): Trevor is the one who is up at 3 a.m. by schedule and weighs the spools; Michael was on the
  balcony around one and is only "pretty sure" he latched the window; Manuel fell asleep at the
  bench next to printer #3 with slip on his hands. None of them is evidence.
- The flush cutters on the wrong hook (`act1.coldopen.cuttersNoticed`) are a new ambient detail,
  not a canon clue. Nothing says they cut the ribbon. Later scenes may pay it off or ignore it.

**Timeline note for the team**

- This scene runs 2:58 to 3:00 and the balloon is already off the ottoman. DESIGN Lead C has the
  roof footage at 3:14 with the figure still holding the balloon. Under variant A that fits (the
  thing took it up to the roof and let go while the roommates were searching). Under variant B the
  seeded roommate is standing in 631 at 3:00, so beat 1 either has to separate the party around
  3:14 or the footage clock has to be wrong (it already blinks 1901 under B). This file leaves both
  doors open: nobody says when the ribbon was cut, the only time anyone vouches for is "around
  one" and "midnight," and the microwave is the only clock shown.

**Objects, art, and audio**

- Interactables (24): balcony window (pre-discovery only), ottoman, ribbon, latch, balcony view,
  printers 1 to 3, degassing chamber, dehumidifier, microscope, soldering station, drills,
  oscilloscope, pacifier jar, flag, statues (older pair as one object), newest statue, shrimp tank,
  guitar, mate station, bookshelf, couch, supplement shelf, scooters, notice, front door.
- Nothing visible from the balcony may use the reserved orange (D-004). Michael's line in
  `coldopen_gather_michael_kind` depends on it.
- Printer #3: no motion, no light. The only tell is the inspect text and, in
  `coldopen_leave_printer_check`, a single fan tick.
- Oscilloscope trace: three bumps and a gap, looping, amplitude just above the noise. It should be
  easy to miss if you are not looking at the screen.
- Final knock: three soft low hits, mixed under the door sound, at the moment the microwave shows
  3:00. No drum timbre yet. It should be deniable as plumbing.
- Shrimp tank: record the reading as the rot-trend baseline (DESIGN §8). All eleven visible and
  active is the "clean" state.
- Mate station and fabs are inspect-only here. Healing and crafting unlock when the party returns
  to 631 as the hub.
- `inspect_flag_flip` swaps the flag sprite to its Maryland side. Later scenes can read
  `act1.coldopen.flagHidden` when anyone official looks into 631.
- The item `ribbon` has no use in Act 1. It exists for the last shot of the ending (Manuel with a
  cut ribbon). If `ribbonTaken` is unset, the ending should use the other half, found on the
  platform.

**Tutorial prompts (UI text, not dialogue)**

| id | when | text |
|---|---|---|
| tut_move | control first given | `Move` with the bound movement keys shown |
| tut_interact | within 2 tiles of the balcony window, pre-discovery | `Check the weather` |
| tut_inspect | first time near any object after discovery | `Inspect` |
| tut_dodge | 20s after discovery if no dodge yet | `Dodge` |
| tut_objective_1 | after `coldopen_gather_close` | `Look around 631.` |
| tut_objective_2 | after `coldopen_all_inspected` | `Search ASTER.` |
