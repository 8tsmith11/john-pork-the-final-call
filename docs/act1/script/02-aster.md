# The building: ASTER

## Purpose

DESIGN beat 1. The roommates leave Room 631 and ask around the tower. The player learns ASTER as a
place (who lives here, what is breaking, what everybody quietly knew about the orange balloon),
learns that the rot is getting worse and that Continuity is one bad reading away from fencing the
block, hears the first rumor of drumming under the street, sees the lights on the northern horizon,
and leaves with **three leads**: the helium trail (A), the fence under the metro stairs (B), and
the rotted camera recorder (C). The beat is free-roam: every area can be visited in any order, and
it ends the moment all three lead flags are set.

Thematic job: a small, silly loss turns out to have been shared. Half the east side checked that
ottoman every morning.

## Flags

**Reads**

- `act1.coldopen.done` (scene is locked until the cold open ends; name assumed, see notes)
- `act1.coldopen.latchInspected`, `act1.coldopen.printerWarmSeen` (optional colour only; names assumed)
- conditions used: `speaker=`, `item statue`, `item roof_key`, `item closet_key`, `morph>=1`, `flag`, `once`, `count`

**Sets**

- `act1.aster.entered`
- `act1.aster.clocksSeen` (count, 0–5), `act1.aster.clock.<id>Seen`
- `act1.aster.elevatorRidden`, `act1.aster.elevatorSaidLorna`
- `act1.aster.vargaMet`, `act1.aster.vargaHeardPrinter`, `act1.aster.vargaStatueShown`, `act1.aster.vargaCallAsked`
- `act1.aster.dezMet`, `act1.aster.drummingHeard`, `act1.aster.dezStatueShown`, `act1.aster.dezMentionedStatueBuyer`
- `act1.aster.rotter409Met`, `act1.aster.rotter409StatueShown`, `act1.aster.rotter409Helped`
- `act1.aster.directoryRead`
- `act1.aster.vendingKicks` (count), `act1.aster.vendingPayouts` (count), `act1.aster.vendingOldCan`
- `act1.aster.bathroomKnocks` (count, 0–10), `act1.aster.bathroomOpened`
- `act1.aster.noticeRead`, `act1.aster.quarantineKnown`
- `act1.pruitt.met`, `act1.pruitt.knowsHelium`, `act1.pruitt.liedTo`, `act1.pruitt.sawStatue`, `act1.pruitt.statueDefied`
- `act1.aster.kessMet`, `act1.aster.kess409Told`, `act1.aster.kessStatueShown`, `act1.aster.breakerLecture`
- `act1.aster.roofKeyGiven`, `act1.aster.roofDoorForced`, `act1.aster.roofReached`
- `act1.aster.roofLightsSeen`, `act1.aster.ventDrawSeen`, `act1.aster.ziplineFound`
- `act1.leads.heliumKnown` (Lead A), `act1.leads.halvardKnown` (Lead B), `act1.leads.footageKnown` (Lead C)
- `act1.aster.leadsSurfaced` (ends the beat)
- standing nudges: `standing.continuity`, `standing.callers`, `standing.analogists`

## Cast

| Who | Where | Canon? | One line |
|---|---|---|---|
| **Supervisor Dale Pruitt** | Lobby | Canon (bible §8, §9) | Local abatement boss. Laced. Wants to make quota and be one of the good guys |
| **Kess** (Lorna Kessel) | Super's office, off the lobby | **Invented** | The building super. Baseline, hand tools, a paper logbook. Eleven years in ASTER |
| **Mrs. Varga** | 633, next door to 631 | **Invented** | Oldest tenant on six. Baseline. Remembers the night of the Call and does not discuss it |
| **Dez** | 214 | **Invented** | Night courier, laced, just off shift. Sleeps on the floor. Hears the street |
| **Four-oh-nine** | Stairwell landing between 4 and 5 | **Invented** (unnamed on purpose) | A resident who is rotting. Kess brings him soup |
| **The occupant** | Lobby bathroom | Canon egg (SECRETS #2) | A voice. Never seen |
| **The elevator** | Shaft | Invented texture | Rotted. Apologizes |

Convention used in this file: **speaker** is the roommate whose player started the interaction.
Lines given to the other two roommates are **party interjections** (see notes): they play only if
that roommate is in the scene, and every exchange still reads correctly if they are skipped.

Effects are written as italic lines beginning `set`, `give`, or `standing`.

---

## Area 1: Sixth floor

### node: aster.hall6.enter

*Trigger: first time any roommate steps out of 631 after the cold open. Sixth-floor hallway. One
ceiling strip in three is lit. Near the far end the carpet pattern repeats wrong: one tile of it is
drawn twice, slightly offset.*

**MICHAEL:** Okay. Who steals a balloon.

**TREVOR:** Nobody. It's a balloon.

**MANUEL:** It's *the* balloon.

**TREVOR:** ...Somebody, then.

**MICHAEL:** So we ask around. Somebody's up. Somebody's always up in this building.

**MANUEL:** Aster pros don't sleep.

**TREVOR:** Aster pros have lab at eight.

**MANUEL:** I hate 245 lab.

*set act1.aster.entered*
*Objective: ASK AROUND ASTER.*

### node: aster.clock.hall6

*A wall clock, Continuity issue, bolted above the fire extinguisher. The date strip reads
01 JAN 1901. The seconds climb to 59 and start again without telling the minutes.*

#### if speaker=manuel
**MANUEL:** It's been midnight for my whole lease.

#### if speaker=trevor
**TREVOR:** Rollover clock. Sixty years, and nobody's taken it down.

**TREVOR:** Probably load-bearing by now.

#### if speaker=michael
**MICHAEL:** I set my watch by this once. Missed a date.

**TREVOR:** You missed it by a hundred and ninety-seven years.

**MICHAEL:** She waited, though.

*set act1.aster.clock.hall6Seen; act1.aster.clocksSeen +1*

Choices:
- "Leave it." -> end
- [flag act1.puzzle.clocksUnlocked] *Open the back and set the time.* -> puzzle.clock1901.set (stretch, owned elsewhere)

### node: aster.elevator.call

*The call button is warm. The display above the doors shows 1901. The doors open a hand's width,
think about it, and open the rest of the way.*

**ELEVATOR:** Welcome to. ASTER. Floor. Nineteen. Oh. One.

Choices:
- *Ride it.* -> aster.elevator.ride
- *Take the stairs.* -> end

### node: aster.elevator.ride

*The car moves. It is not obvious in which direction.*

**ELEVATOR:** Going. Up. Down. Going.

**ELEVATOR:** I'm sorry, Lorna.

*set act1.aster.elevatorRidden; act1.aster.elevatorSaidLorna*

#### if speaker=michael
**MICHAEL:** Who's Lorna?

**ELEVATOR:** I'm sorry.

**MICHAEL:** No, it's — you're fine. You're doing great.

#### if speaker=trevor
**TREVOR:** It's reading a name off somebody's lace. Whoever rode it most.

**TREVOR:** Or it's guessing.

#### if speaker=manuel
**MANUEL:** I'm not Lorna.

**ELEVATOR:** I'm sorry.

**MANUEL:** Okay. Me too.

*The doors open. Roll per notes: the requested floor, or (1 in 3) one floor off.*

#### if wrong floor
**ELEVATOR:** Floor. Nineteen. Oh. One. This is your floor.

**TREVOR:** It is not.

**MANUEL:** Rookie Aster mistake. We took the elevator.

### node: aster.varga.knock

*Door 633. A chain slides. One eye, then the door opens exactly as far as the chain allows.
Behind her: a paper calendar, a radio with a dial, a lamp with a cloth shade.*

**MRS. VARGA:** It's the middle of the night.

#### if speaker=manuel
**MANUEL:** Sorry, Mrs. Varga. It's Manuel. From next door.

**MRS. VARGA:** I know who you are. You're the one who waters a balloon.

**MANUEL:** I don't water it.

**MRS. VARGA:** You stand there like you're watering it.

#### if speaker=trevor
**TREVOR:** Mrs. Varga. Trevor. Six thirty-one.

**MRS. VARGA:** The tall one. With the pills.

**TREVOR:** Supplements.

**MRS. VARGA:** That's what I said.

#### if speaker=michael
**MICHAEL:** Hi, Mrs. Varga. Sorry, I know it's late —

**MRS. VARGA:** The one on the phone.

**MICHAEL:** That's — yeah. That's me.

*set act1.aster.vargaMet*
-> aster.varga.hub

### node: aster.varga.hub

Choices:
- "The balloon's gone. Did you see anything?" -> aster.varga.balloon
- "Did you hear anything tonight?" -> aster.varga.heard
- "Is the building getting worse?" -> aster.varga.rot
- [item statue] *Show her the statue.* -> aster.varga.statue
- [morph>=1] [once] *Let her get a look at you.* -> aster.varga.morph
- [speaker=trevor] [once] "Can you hear the guitar through the wall?" -> aster.varga.guitar
- [flag act1.aster.vargaHeardPrinter] [once] "You were here for the Call." -> aster.varga.call
- "Good night, Mrs. Varga." -> aster.varga.bye

### node: aster.varga.balloon

#### if speaker=manuel
**MANUEL:** The balloon's gone. From the ottoman.

**MRS. VARGA:** I know.

**MANUEL:** You know?

**MRS. VARGA:** I look at your ottoman every morning. Half the east side does. Dry, damp, dust.

**MRS. VARGA:** The orange was nice. You could see it from the street.

**MANUEL:** Did you see who —

**MRS. VARGA:** I couldn't sleep. I went out on my balcony and looked over, same as always, and it wasn't there.

**MRS. VARGA:** That's all a person sees at my age. What isn't there.

#### if speaker=trevor
**TREVOR:** Orange balloon. Helium fill. About so big, on a ribbon. Missing as of tonight.

**MRS. VARGA:** You say it like a police report.

**TREVOR:** I'm being precise.

**MRS. VARGA:** Your friend isn't being precise. I can hear him through the wall.

**MRS. VARGA:** Be nicer than precise.

**TREVOR:** ...Did you see anything?

**MRS. VARGA:** I went out on my balcony and looked at your ottoman, same as every day. It wasn't there. That's what I saw.

#### if speaker=michael
**MICHAEL:** So, weird question. You haven't seen a balloon?

**MRS. VARGA:** The orange one.

**MICHAEL:** You know it?

**MRS. VARGA:** Everybody knows it. It's the only thing on this side of the building with a color.

**MICHAEL:** My girlfriend said that. Almost the exact same thing. First time she came over.

**MRS. VARGA:** I've never seen her.

**MICHAEL:** She's — yeah. She's not around right now.

**MRS. VARGA:** Hm.

**MRS. VARGA:** I looked over tonight and it wasn't there. I'm sorry. I'd gotten used to it.

-> aster.varga.hub

### node: aster.varga.heard

**MRS. VARGA:** One of your machines was going. The whining one.

#### if speaker=manuel
**MANUEL:** The printers.

#### if speaker=trevor
**TREVOR:** The fabs. Which one?

#### if speaker=michael
**MICHAEL:** Oh — the printers. Sorry. They're loud.

**MRS. VARGA:** I don't know what they are. It comes through the wall. It comes through my teeth.

**MANUEL:** Wasn't me.

**TREVOR:** Wasn't me.

**MICHAEL:** ...Wasn't me.

**MRS. VARGA:** Well. It wasn't me.

*Nobody says anything for a second.*

**MRS. VARGA:** If you want to know what else is making noise, ask the boy on two. The one with the helmet. He's closer to the ground than I am.

*set act1.aster.vargaHeardPrinter*
-> aster.varga.hub

### node: aster.varga.rot

**MRS. VARGA:** My door asked me who I was last week.

**MRS. VARGA:** Forty years in this apartment. I told it. It didn't believe me.

**MRS. VARGA:** Kess came up and put the chain on. The chain believes me.

Choices:
- "And the clock in the hall?" -> aster.varga.rot.clock
- "Sorry. That's awful." -> aster.varga.hub

### node: aster.varga.rot.clock

**MRS. VARGA:** That clock was wrong before your parents were born.

**MRS. VARGA:** I like it. It's the only thing in this building that doesn't pretend.

-> aster.varga.hub

### node: aster.varga.statue

*She looks at it through the gap for a long time. Then the chain comes off.*

#### if speaker=manuel
**MRS. VARGA:** You made that.

**MANUEL:** By hand. No printer.

**MRS. VARGA:** I can tell. A machine would have made him look friendlier.

**MANUEL:** Is that good?

**MRS. VARGA:** It's a compliment. Take it and stop talking.

#### if speaker=trevor
**TREVOR:** It's Manuel's. He makes them.

**MRS. VARGA:** And you carry them around at night.

**TREVOR:** Tonight I do.

**MRS. VARGA:** Then you're a better friend than you sound like.

#### if speaker=michael
**MICHAEL:** Manuel made it. He's really good.

**MRS. VARGA:** He is. Don't tell him I said so.

**MICHAEL:** I'm absolutely telling him.

*She doesn't touch it. She almost does.*

**MRS. VARGA:** I never pictured a face. Just the phone.

**MRS. VARGA:** Put that under your coat downstairs. There's a man with a clipboard.

*set act1.aster.vargaStatueShown*
*standing callers +1*
-> aster.varga.hub

### node: aster.varga.morph

#### if speaker=manuel
**MRS. VARGA:** You've done something to yourself.

**MANUEL:** The gonman.

**MRS. VARGA:** I don't know what that is.

**MANUEL:** It's me. With a "the."

**MRS. VARGA:** You were fine without a "the."

#### if speaker=trevor
**MRS. VARGA:** You're taller.

**TREVOR:** I'm the same height. It's posture. And density.

**MRS. VARGA:** People aren't supposed to get denser.

**TREVOR:** That's what they want you to think.

#### if speaker=michael
**MRS. VARGA:** You're humming.

**MICHAEL:** I'm not humming.

**MRS. VARGA:** Something on you is humming. My radio's picking you up.

**MICHAEL:** Oh. Yeah. That's new. Sorry.

-> aster.varga.hub

### node: aster.varga.guitar

**TREVOR:** Can you hear the guitar? Through the wall.

**MRS. VARGA:** Yes.

**TREVOR:** ...

**MRS. VARGA:** Hm.

**TREVOR:** Is that a good hm?

**MRS. VARGA:** It's a hm.

**MRS. VARGA:** Keep the guitar. It's the one thing over there that sounds like somebody's home.

-> aster.varga.hub

### node: aster.varga.call

*She doesn't answer right away. The radio behind her is tuned to nothing, and she's left it on.*

**MRS. VARGA:** Everybody my age was somewhere for it.

Choices:
- "What did it say?" -> aster.varga.call.said
- "Never mind. Sorry." -> aster.varga.hub

### node: aster.varga.call.said

**MRS. VARGA:** Ask fifty people in this building and they'll tell you fifty things. They fight about it at the mailboxes.

**MRS. VARGA:** Everybody argues about what it said. Nobody ever asks what you said back.

#### if speaker=manuel
**MANUEL:** What did you say back?

**MRS. VARGA:** Good night, Manuel.

#### if speaker=trevor
**TREVOR:** Somebody must have recorded —

**MRS. VARGA:** Good night, tall one.

#### if speaker=michael
*Michael doesn't ask. He looks at the phone in his hand, and then he puts it in his pocket.*

**MRS. VARGA:** Good night.

*The chain goes back on. This choice does not come back.*

*set act1.aster.vargaCallAsked*
-> end

### node: aster.varga.bye

**MRS. VARGA:** If you find it, put it back where it was. I'd like to know what the weather's doing.

*The chain. The lamp stays on under the door.*

-> end

---

## Area 2: The stairwell

### node: aster.clock.stairs

*Third-floor landing. A cracked clock behind a wire cage. It blinks 1901, goes dark, blinks 1901.*

#### if speaker=manuel
**MANUEL:** Happy new year.

#### if speaker=trevor
**TREVOR:** Somebody caged it. Like it was going to get out.

#### if speaker=michael
**MICHAEL:** I think it's doing its best.

*set act1.aster.clock.stairsSeen; act1.aster.clocksSeen +1*

### node: aster.rotter409.approach

*The landing between four and five. A man in a cardigan sits against the wall with a blanket over
his knees. Beside him: a thermos, a spoon, a folded paper napkin. He is looking at the door to the
fourth floor. He doesn't stop talking when the roommates arrive.*

**FOUR-OH-NINE:** code rot. code rot. nineteen. oh one.

*set act1.aster.rotter409Met*

Choices:
- "Did you see a balloon? Orange?" -> aster.rotter409.balloon
- *Listen for a while.* -> aster.rotter409.listen
- [item statue] *Show him the statue.* -> aster.rotter409.statue
- *Leave him be.* -> end

### node: aster.rotter409.listen

*Each use plays the next line in the table, then loops.*

| id | speaker | trigger | line |
|---|---|---|---|
| r409.loop.1 | FOUR-OH-NINE | listen #1 | code rot. code rot. |
| r409.loop.2 | FOUR-OH-NINE | listen #2 | at the end of the day. at the end of the day. no one can. |
| r409.loop.3 | FOUR-OH-NINE | listen #3 | four oh nine. four oh nine. is my. four oh nine. |
| r409.loop.4 | FOUR-OH-NINE | listen #4 | happy new year. happy new. nineteen oh one. code rot. |
| r409.loop.5 | FOUR-OH-NINE | listen #5 | no one can code faster than. no one can. code rot. |
| r409.loop.6 | FOUR-OH-NINE | listen #6 | carry the one. carry the one. code rot. |

-> aster.rotter409.approach

### node: aster.rotter409.balloon

#### if speaker=manuel
**MANUEL:** Señor. Did you see a balloon? Orange. Tonight.

**FOUR-OH-NINE:** orange. orange. code rot.

**MANUEL:** ...Yeah. Okay.

*Manuel pulls the blanket back up over the man's knees and moves the thermos to where his hand can find it.*

**MANUEL:** Thank you anyway.

*set act1.aster.rotter409Helped*

#### if speaker=trevor
**TREVOR:** Sir. Orange balloon. Did it come down this stairwell?

**FOUR-OH-NINE:** no one can code faster. code rot.

*Trevor crouches. He looks at the man's eyes, one and then the other, the way he'd read a gauge.*

**TREVOR:** It's the lace. The vendor's gone. There's nothing left to patch it against.

**MICHAEL:** Can you do anything?

**TREVOR:** No.

*He stands up faster than he needed to.*

**TREVOR:** Let's keep moving.

#### if speaker=michael
**MICHAEL:** Hey, man. You haven't seen a balloon, have you?

**FOUR-OH-NINE:** four oh nine.

**MICHAEL:** That's your door, right? Right there. You want me to walk you?

**FOUR-OH-NINE:** four oh nine. is my.

**MICHAEL:** ...Yeah. It is.

*Michael sits down on the step next to him for a moment. Then he gets up.*

*set act1.aster.rotter409Helped*

-> end

### node: aster.rotter409.statue

*He stops.*

*It is the first silence on this landing in a long time. He looks at the statue. Then he looks at
whoever is holding it. His mouth moves. Nothing comes.*

#### if speaker=manuel
**MANUEL:** You know him?

#### if speaker=trevor
**TREVOR:** ...He's tracking it. Look at his eyes.

#### if speaker=michael
**MICHAEL:** Hey. Hey, it's okay.

*A breath.*

**FOUR-OH-NINE:** ...code rot.

*Quieter than before. The loop picks back up.*

*set act1.aster.rotter409StatueShown*
-> end

---

## Area 3: Second floor

### node: aster.dez.knock

*Door 214 is already open. A young man sits in the doorway on an upturned crate with a scooter
helmet still on, eating noodles out of the pot. The apartment behind him has a mattress leaned
against the wall and a blanket flat on the bare floor.*

**DEZ:** Yo. Six thirty-one. All three of you. Is the building on fire?

#### if speaker=manuel
**MANUEL:** No fire.

**DEZ:** gonman! Then why do you look like that?

#### if speaker=trevor
**TREVOR:** No fire. A question.

**DEZ:** Shrimp guy has a question. Okay. I'm sitting down for this. I'm already sitting down.

#### if speaker=michael
**MICHAEL:** No fire. Hey, Dez.

**DEZ:** Mike. How's the —

**MICHAEL:** She's good.

**DEZ:** I was gonna say scooter.

**MICHAEL:** ...Scooter's good too.

*set act1.aster.dezMet*
-> aster.dez.hub

### node: aster.dez.hub

Choices:
- "The balloon's gone." -> aster.dez.balloon
- "Heard anything weird at night?" -> aster.dez.drumming
- "How's the building treating you?" -> aster.dez.rot
- [item statue] *Show him the statue.* -> aster.dez.statue
- [morph>=1] [once] *Let him get a look at you.* -> aster.dez.morph
- "Go to bed, Dez." -> aster.dez.bye

### node: aster.dez.balloon

#### if speaker=manuel
**MANUEL:** Dez. My balloon's gone.

**DEZ:** The orange one? Off the ottoman?

**MANUEL:** You know it too?

**DEZ:** Bro, I navigate by it. "Left at the balloon."

**DEZ:** Damn. Sorry, gonman.

#### if speaker=trevor
**TREVOR:** Did you see an orange balloon come down the east face tonight?

**DEZ:** Come down? They go up, shrimp guy.

**TREVOR:** If it lost lift —

**DEZ:** Rookie Aster mistake.

**TREVOR:** It's not a mistake. It's a hypothesis.

**DEZ:** Sounds like a mistake with a degree.

#### if speaker=michael
**MICHAEL:** You haven't seen Manuel's balloon, have you?

**DEZ:** Why isn't gonman asking?

**MICHAEL:** He's asking everybody. I'm also asking everybody. We're being thorough.

**DEZ:** He okay?

**MICHAEL:** No.

**MICHAEL:** He will be.

*Dez puts the pot down.*

**DEZ:** Wait. Was that real helium? Like, real?

Choices:
- "It floats, doesn't it?" -> aster.dez.helium
- "Why?" -> aster.dez.helium

### node: aster.dez.helium

**DEZ:** Okay, so you had, like, a car up there. On a string. On a balcony.

#### if speaker=manuel
**MANUEL:** It's not about the money.

**DEZ:** I know it's not. I'm saying maybe somebody else thinks it is.

#### if speaker=trevor
**TREVOR:** More than a car, at spot price.

**DEZ:** See, you say that like it helps.

#### if speaker=michael
**MICHAEL:** It wasn't like that. It was just — his.

**DEZ:** To you guys. I'm talking about everybody who isn't you guys.

**DEZ:** There's a guy. Under the metro stairs, the dead phone-repair stall. Halvard. Old-drive guy.

**DEZ:** I run packages for him sometimes. Don't ask what's in them. I don't.

**DEZ:** He's been asking around. Who wants helium. Like he heard somebody's selling.

**DEZ:** I didn't put it together till right now. I thought he meant, like, a tank.

*set act1.leads.halvardKnown*
*Journal: LEAD — THE FENCE. Halvard, phone-repair stall under the metro stairs, has heard somebody is selling helium.*
-> aster.dez.hub

### node: aster.dez.drumming

**DEZ:** You're gonna think I'm rotting.

**DEZ:** I get in off shift, right, I lie down. I sleep on the floor, the floor's cold, it's good for my back. And it's under me. Under the street.

**DEZ:** Three hits. Then nothing. Then three.

#### if speaker=trevor
**TREVOR:** Water hammer. Kess says the mains —

**DEZ:** I know what a pipe sounds like. A pipe doesn't wait for you to breathe out.

#### if speaker=manuel
**MANUEL:** The trains?

**DEZ:** Trains don't count to three, man.

#### if speaker=michael
**MICHAEL:** Like somebody knocking?

**DEZ:** Like somebody knocking who's got all night.

**DEZ:** It's around three. Three-ish. I checked the clock on the landing but the clock said nineteen-oh-one, so.

**DEZ:** My cousin's on track crew. Green Line. She says they don't go past the College Park switchyard after midnight anymore. Won't say why.

**DEZ:** She said somebody left a coat rack at the end of the dead platform.

**DEZ:** Then she said it wasn't there the next night.

#### if speaker=michael
**MICHAEL:** A coat rack.

#### if speaker=trevor
**TREVOR:** A coat rack.

#### if speaker=manuel
**MANUEL:** A coat rack.

**DEZ:** Tall. Wood. That's what she said. I'm just the messenger. Literally. It's my job.

*set act1.aster.drummingHeard*
-> aster.dez.hub

### node: aster.dez.rot

**DEZ:** Elevator took me somewhere on Tuesday.

**DEZ:** Doors open, it's a hallway. Our hallway. But, like, cheaper. Like somebody described this hallway to somebody.

**DEZ:** I didn't get out. I take the stairs now.

**DEZ:** Don't tell the clipboard guy. He'll write it down, and then it's a thing.

-> aster.dez.hub

### node: aster.dez.statue

**DEZ:** Whoa, whoa. Coat. Put it in your coat. There's a Continuity suit in the lobby.

*He looks both ways down the hall. Then he leans in.*

**DEZ:** ...Can I hold it?

#### if speaker=manuel
**MANUEL:** Two hands.

**DEZ:** Two hands. Wow. It's heavy. Why's it heavy?

**MANUEL:** Because it's real.

#### if speaker=trevor
**TREVOR:** It's not mine to lend.

**DEZ:** You're literally holding it.

**TREVOR:** ...Two hands.

#### if speaker=michael
**MICHAEL:** Sure. Careful, though. He'll know. He always knows.

**DEZ:** The guy under the stairs would pay stupid money for this. He keeps asking me if the 631 guy sells.

**MANUEL:** They're not for sale.

**DEZ:** I told him that. He said everything's for sale, some of it just hasn't been asked right.

*set act1.aster.dezStatueShown; act1.aster.dezMentionedStatueBuyer*
-> aster.dez.hub

### node: aster.dez.morph

#### if speaker=manuel
**DEZ:** You look... more.

**MANUEL:** The gonman.

**DEZ:** You were already gonman.

**MANUEL:** *The* gonman.

**DEZ:** Is that covered by the lease?

#### if speaker=trevor
**DEZ:** Shrimp guy, your neck is doing a thing.

**TREVOR:** Creatine. And some other things.

**DEZ:** How many other things?

**TREVOR:** It's a stack. You don't count a stack.

#### if speaker=michael
**DEZ:** Mike, your phone's not even out and I can hear it.

**MICHAEL:** Yeah. It's new.

**DEZ:** Is it supposed to do that?

**MICHAEL:** I'll let you know.

-> aster.dez.hub

### node: aster.dez.bye

**DEZ:** Hey. If you find it, tie it back up. I'm gonna miss my turn every day.

-> end

---

## Area 4: The lobby

*Layout: front doors (an abatement van is parked outside, visible through the glass, sensor mast
folded), the building directory, mailboxes, a vending machine, the bathroom door with a
queue-number sign, the super's office, a locked closet behind the mailboxes, and a large clock over
the stairwell door. Pruitt stands near the front doors with a paper clipboard. Two techs in gray
coveralls run a wand along the baseboards and do not speak.*

### node: aster.lobby.directory

*A glass case of white push-in letters on black felt. Some letters have fallen and lie in a drift
along the bottom of the case.*

```
AS ER  RESIDEN E  DIRECTORY

B-01   SUPER ............ KESSEL, L.
B-02   M ILROOM
B-03    AUNDRY
B-04   SCOOTER  AY

214    DEZ
409
604    HA  OWAY
633    V RGA
631    MANUEL · TREVOR · MI HAEL

ROOF   DEC  CLOSED
```

*The strip for 409 is not missing letters. It has no letters.*

#### if speaker=michael
**MICHAEL:** They spelled me wrong.

**TREVOR:** They spelled you right. Part of you fell off.

**MICHAEL:** That's worse.

#### if speaker=trevor
**TREVOR:** "Kessel, L."

*[flag act1.aster.elevatorSaidLorna]*

**TREVOR:** L. Lorna. The elevator knows the super's first name.

**MICHAEL:** Does the super know that?

#### if speaker=manuel
**MANUEL:** We're still on the board. That's something.

**MANUEL:** Aster pros. In felt.

*set act1.aster.directoryRead*

Choices:
- *Look at the fallen letters.* -> aster.lobby.directory.letters
- *Step back.* -> end

### node: aster.lobby.directory.letters

*The case is locked. The letters in the bottom are out of reach: a T, a C, an A, two Ls, a B,
another A, another C, a K, an L, a W. More than the board is missing, or the board used to say
more.*

-> end

### node: aster.lobby.clock

*The big clock over the stairwell door. Its hands were replaced with a display decades ago. The
display reads 1901 in the year field. The hour and minute fields are blank and lit.*

#### if speaker=manuel
**MANUEL:** It's waiting for somebody to tell it.

#### if speaker=trevor
**TREVOR:** Blank's honest, at least. It knows it doesn't know.

#### if speaker=michael
**MICHAEL:** What time is it, actually?

**TREVOR:** Late.

**MICHAEL:** That's not a time.

**TREVOR:** In this building it is.

*set act1.aster.clock.lobbySeen; act1.aster.clocksSeen +1*

### node: aster.lobby.notice

*Taped inside the front doors, fresh, corners still flat.*

```
CONTINUITY AUTHORITY · ABATEMENT SERVICES
ROT ADVISORY · LEVEL 2 · ASTER (BLOCK 14-C)

Citizens, things are stable.

Elevated readings have been noted in this structure for your safety.
Residents are asked to remain attested, to report looping devices,
and to avoid unlisted maintenance spaces.

A Level 3 determination may require temporary perimeter measures.

Abatement is underway. Abatement is always underway.
```

*Underneath, in marker, a different hand:*

```
ELEVATOR LIES. USE STAIRS.  — K
```

*set act1.aster.noticeRead*

### node: aster.vending.approach

*A vending machine. The brand panel has rotted to a gray rectangle. The ad screen above the coin
slot still runs: a smiling engineer at a desk, upscaled so many times his face is a suggestion.
Text crawls under him, with gaps where the panel has died.*

```
AT THE END OF THE DAY
NO ONE CAN C DE FA TER THAN AI
```

**VENDING MACHINE:** Thirsty? Thirsty? Thirst —

Choices:
- *Buy something.* -> aster.vending.buy
- *Kick it.* -> aster.vending.kick
- *Read the screen.* -> aster.vending.screen
- *Walk away.* -> end

### node: aster.vending.screen

#### if speaker=manuel
**MANUEL:** That ad's older than the building.

**MANUEL:** He looks so happy about it.

#### if speaker=trevor
**TREVOR:** They never took these down. They just stopped paying for them.

#### if speaker=michael
**MICHAEL:** Does he have a face? I can't tell if he has a face.

**TREVOR:** He has the idea of one.

-> aster.vending.approach

### node: aster.vending.buy

Choices:
- "CAN OF MATE (carbonated)" -> aster.vending.buy.mate
- "ELECTRO+ (blue)" -> aster.vending.buy.electro
- "PEACH RINGS" -> aster.vending.buy.rings
- *Never mind.* -> aster.vending.approach

### node: aster.vending.buy.mate

*give item canned_mate*

#### if speaker=manuel
**MANUEL:** Canned. Carbonated. "Natural mate flavor."

*He drinks it.*

**MANUEL:** This is a crime.

**MICHAEL:** Then why'd you buy it?

**MANUEL:** Because I'm sad.

#### if speaker=trevor
**TREVOR:** Manuel, I got you a —

**MANUEL:** Don't.

**TREVOR:** It's mate.

**MANUEL:** It's a can that has heard of mate.

#### if speaker=michael
**MICHAEL:** Manuel! They have your thing!

**MANUEL:** That is not my thing.

**MICHAEL:** It says it right on the can.

**MANUEL:** Rookie Aster mistake.

-> aster.vending.approach

### node: aster.vending.buy.electro

*give item electro_plus*

#### if speaker=trevor
*Trevor reads the label for a while.*

**TREVOR:** Sodium's low. Potassium's a joke. Magnesium oxide. That's the cheap one, you absorb maybe four percent.

**MANUEL:** So don't buy it.

*He has already bought it.*

#### if speaker=manuel
**MANUEL:** Trevor. What's in this?

**TREVOR:** Blue.

#### if speaker=michael
**MICHAEL:** Is this one of your supplement things?

**TREVOR:** That's a soft drink with ambitions.

-> aster.vending.approach

### node: aster.vending.buy.rings

*give item peach_rings*

#### if speaker=michael
**MICHAEL:** She loved these.

**MICHAEL:** Loves.

*Nobody says anything. He eats one.*

#### if speaker=manuel
**MANUEL:** Michael. You want these?

**MICHAEL:** ...Yeah. Thanks.

#### if speaker=trevor
**TREVOR:** Forty grams of sugar.

**TREVOR:** Michael, catch.

-> aster.vending.approach

### node: aster.vending.kick

*Roll per notes (luck). One of the outcomes below. Counts act1.aster.vendingKicks.*

#### if outcome=nothing
*Thunk.*

**VENDING MACHINE:** Thirsty?

#### if outcome=item
*Thunk. Something falls.*

*give item (random: canned_mate, electro_plus, peach_rings)*
*act1.aster.vendingPayouts +1*

#### if outcome=coins
*Thunk. Coins. Real ones, metal, from before.*

*give credits (small)*
*act1.aster.vendingPayouts +1*

#### if outcome=oldcan
*Thunk. A can rolls out with no label. The date stamped on the bottom reads BEST BEFORE 01 JAN 1901.*

*give item old_can; set act1.aster.vendingOldCan (first time only; afterwards reroll as item)*

#### if speaker=trevor
**TREVOR:** I'm not drinking that. I'm keeping it. But I'm not drinking it.

#### if speaker=manuel
**MANUEL:** It's still cold.

#### if speaker=michael
**MICHAEL:** That's the oldest thing I've ever held.

#### if act1.aster.vendingKicks = 3
**KESS:** *(from the office)* I can hear that!

#### if first kick while Pruitt is in the lobby
**PRUITT:** That's licensed equipment.

*He looks at the gray rectangle where the brand used to be.*

**PRUITT:** ...It was. Go ahead.

-> aster.vending.approach

---

### node: aster.bathroom.door

*A door by the mailroom. The lock plate shows red: OCCUPIED. Above it, a queue-number sign, the
kind with flip cards. NOW SERVING: 44. Light under the door. Water running.*

Choices:
- *Knock.* -> aster.bathroom.knock
- "Hello? Have you seen a balloon?" -> aster.bathroom.balloon
- *Look at the sign.* -> aster.bathroom.sign
- *Leave.* -> end

### node: aster.bathroom.sign

#### if speaker=manuel
**MANUEL:** It said forty-four when I moved in.

#### if speaker=trevor
**TREVOR:** Forty-four. Dust on the forty-four.

#### if speaker=michael
**MICHAEL:** What number are we?

**TREVOR:** Nobody gave us a number.

**MICHAEL:** Then how do we know when it's us?

-> aster.bathroom.door

### node: aster.bathroom.balloon

#### if speaker=manuel
**MANUEL:** Hello? Sorry. Did you see a balloon? Orange?

**OCCUPANT:** In here?

**MANUEL:** No. In general.

**OCCUPANT:** I've been in here.

#### if speaker=trevor
**TREVOR:** Did anyone come through the lobby tonight with a balloon?

**OCCUPANT:** I can't see the lobby.

**TREVOR:** Did you hear —

**OCCUPANT:** Occupied.

#### if speaker=michael
**MICHAEL:** Hey! Sorry to bother you. You good in there?

**OCCUPANT:** ...

**OCCUPANT:** Nobody's asked that before.

**MICHAEL:** Okay. Well. Are you?

**OCCUPANT:** One minute.

-> aster.bathroom.door

### node: aster.bathroom.knock

*Increments act1.aster.bathroomKnocks (shared by the whole party, persists for the save). Play the
row matching the new count, then return to aster.bathroom.door. At 10, go to aster.bathroom.open.*

| id | speaker | trigger | line |
|---|---|---|---|
| bath.knock.1 | — | knock 1 | *(The water keeps running.)* |
| bath.knock.2 | — | knock 2 | *(The water stops.)* |
| bath.knock.3 | OCCUPANT | knock 3 | Occupied. |
| bath.knock.4 | OCCUPANT | knock 4 | Still occupied. |
| bath.knock.5 | OCCUPANT | knock 5 | One minute! |
| bath.knock.6 | OCCUPANT | knock 6 | I said one minute. |
| bath.knock.7 | OCCUPANT | knock 7 | It has not been a minute. |
| bath.knock.8 | OCCUPANT | knock 8 | ...Okay, it's been a minute. One *more* minute. |
| bath.knock.9 | OCCUPANT | knock 9 | *(A long quiet.)* Is it still you? |
| bath.knock.10 | — | knock 10 | -> aster.bathroom.open |

*Roommate reactions, played once each, after the row:*

| id | speaker | trigger | line |
|---|---|---|---|
| bath.react.5.manuel | MANUEL | after knock 5, speaker=manuel | It's alive in there. |
| bath.react.5.trevor | TREVOR | after knock 5, speaker=trevor | So it's a person. That's new information. |
| bath.react.5.michael | MICHAEL | after knock 5, speaker=michael | Take your time! |
| bath.react.7.any | TREVOR | after knock 7 | It's counting. Whoever that is has a clock that works. |
| bath.react.9.manuel | MANUEL | after knock 9, speaker=manuel | ...Yes. It's still me. |
| bath.react.9.trevor | TREVOR | after knock 9, speaker=trevor | Define "you." |
| bath.react.9.michael | MICHAEL | after knock 9, speaker=michael | Yeah. Still us. We're not mad. |

### node: aster.bathroom.open

*The lock plate turns from red to green. It takes a long time, like it has never done it before.*

*The door opens inward. The camera does not go in. It stays on the roommates. Warm light from the
doorway falls across all three of them.*

*They look.*

*They keep looking.*

#### if speaker=manuel
**MANUEL:** ...Okay.

#### if speaker=trevor
**TREVOR:** Huh.

#### if speaker=michael
**MICHAEL:** Oh. Hi.

*A pause. Somewhere inside, something is set down gently.*

**MICHAEL:** Should we —

**TREVOR:** No.

**MANUEL:** No.

*The door closes. The lock plate turns red. The flip card on the sign drops: NOW SERVING: 45.*

**OCCUPANT:** Thank you for your patience.

*set act1.aster.bathroomOpened*
*The door no longer responds to knocking. See notes.*

#### if any roommate interacts with the door afterwards
**MANUEL:** We don't knock on that one anymore.

-> end

---

### node: aster.pruitt.approach

*A man in an Authority windbreaker over a civilian shirt. He holds a paper clipboard and a pencil.
There is a slate on his belt, dark. He sees the roommates coming and puts on the face.*

**PRUITT:** Evening, residents. Supervisor Pruitt, Abatement Services. Nothing to worry about.

**PRUITT:** Routine survey. Readings in this block are elevated, for your safety.

#### if speaker=trevor
**TREVOR:** They're elevated for our safety?

**PRUITT:** The survey is for your safety. The readings are just elevated.

**TREVOR:** That's a dangling modifier.

**PRUITT:** It's late, son.

#### if speaker=manuel
**MANUEL:** Paper?

**PRUITT:** Regulation, in a rot zone. The slate goes funny in here.

**MANUEL:** So this is a rot zone.

**PRUITT:** ...It's a zone where I use paper.

#### if speaker=michael
**MICHAEL:** Long night, huh?

**PRUITT:** *(off guard)* Yeah. It — yes. Routine.

**MICHAEL:** You want anything from the machine? It takes kicks.

**PRUITT:** I'm fine. Thank you.

**PRUITT:** You three students?

**MANUEL:** I hate 245 lab.

**PRUITT:** I'll take that as a yes.

*set act1.pruitt.met*
-> aster.pruitt.hub

### node: aster.pruitt.hub

Choices:
- "How bad is it?" -> aster.pruitt.howbad
- "We're looking for a balloon." -> aster.pruitt.balloon
- [flag act1.aster.drummingHeard] "Is there something under the street?" -> aster.pruitt.drumming
- [flag act1.aster.rotter409Met] [once] "There's a man on the stairs." -> aster.pruitt.409
- [item statue] *Show him the statue.* -> aster.pruitt.statue
- [morph>=1] [once] *Let him get a look at you.* -> aster.pruitt.morph
- "Good luck with the survey." -> end

### node: aster.pruitt.howbad

**PRUITT:** Level two. Two is fine. Two is a notice and a follow-up.

#### if speaker=manuel
**MANUEL:** And three?

#### if speaker=trevor
**TREVOR:** What's the threshold for three?

#### if speaker=michael
**MICHAEL:** What happens at three?

**PRUITT:** Three's a perimeter.

**MICHAEL:** Like a fence?

**PRUITT:** Like a determination that a fence would be for your safety.

Choices:
- "Around ASTER?" -> aster.pruitt.howbad.where
- "How long until three?" -> aster.pruitt.howbad.when

### node: aster.pruitt.howbad.where

**PRUITT:** Around the block number. This building, the plaza, the station. Out to Route 1, give or take.

**PRUITT:** I don't draw the line. I report the numbers and somebody draws the line.

-> aster.pruitt.howbad.when

### node: aster.pruitt.howbad.when

**PRUITT:** If the numbers hold? Days.

**PRUITT:** I don't want to write a three. I live in Hyattsville. I take this train.

*He taps the clipboard with the pencil, twice.*

**PRUITT:** For what it's worth, it isn't you people. It's coming up from under the station. I put that in the report.

**PRUITT:** Whether anybody reads the report.

*set act1.aster.quarantineKnown*
-> aster.pruitt.hub

### node: aster.pruitt.balloon

#### if speaker=manuel
**MANUEL:** Did your people see a balloon? Orange. It was on our balcony.

**PRUITT:** A balloon.

**MANUEL:** Yes.

#### if speaker=trevor
**TREVOR:** Your wands. Do they log anything besides rot? We've lost a balloon.

**PRUITT:** A balloon.

**TREVOR:** Orange. About so big.

#### if speaker=michael
**MICHAEL:** This is going to sound dumb. We lost a balloon.

**PRUITT:** A balloon.

**MICHAEL:** It matters to him. So it matters.

*Pruitt flips a page on the clipboard. Flips back. His pencil stops on a line.*

**PRUITT:** What's in it?

Choices:
- "Helium." -> aster.pruitt.balloon.truth
- "Air. It's a balloon." -> aster.pruitt.balloon.lie
- "Why is that on your form?" -> aster.pruitt.balloon.form

### node: aster.pruitt.balloon.form

**PRUITT:** New line on the survey this week. "Compressed or lifting gases on premises."

**PRUITT:** I don't write the form.

**PRUITT:** I'd ask why. But the people who know why don't take questions, and the people who take questions don't know why.

**PRUITT:** So. What's in it?

Choices:
- "Helium." -> aster.pruitt.balloon.truth
- "Air. It's a balloon." -> aster.pruitt.balloon.lie

### node: aster.pruitt.balloon.truth

#### if speaker=manuel
**MANUEL:** Helium.

**PRUITT:** Real helium. In a student tower.

**MANUEL:** It was a gift.

#### if speaker=trevor
**TREVOR:** Helium. Obviously. Air doesn't float.

**MICHAEL:** Rookie Aster mistake.

**TREVOR:** It's the truth.

**MICHAEL:** That's the mistake.

#### if speaker=michael
**MICHAEL:** Helium. I think. It floats. Floated.

**PRUITT:** Real helium. In a student tower.

*Pruitt starts to write. He stops. He looks at what he's written and then at the three of them.*

**PRUITT:** I'm going to put "none observed." Because I didn't observe it.

**PRUITT:** If I were you, I'd find it before somebody who writes forms does.

*set act1.pruitt.knowsHelium*
*standing continuity +1*
-> aster.pruitt.hub

### node: aster.pruitt.balloon.lie

#### if speaker=manuel
**MANUEL:** Air. It's a balloon.

#### if speaker=trevor
**TREVOR:** Air.

*It visibly costs him.*

#### if speaker=michael
**MICHAEL:** Air. And love.

**PRUITT:** Son.

*Pruitt looks up at the ceiling, about where the sixth floor would be.*

**PRUITT:** Kids on the plaza say you can see it from the street. Floating.

#### if speaker=manuel
**MANUEL:** It's very good air.

#### if speaker=trevor
**TREVOR:** Thermal. Warm day.

**PRUITT:** It's November.

#### if speaker=michael
**MICHAEL:** People see what they want to see.

**PRUITT:** ...I'll put "none observed."

**PRUITT:** And your unit number in the margin. In pencil.

*set act1.pruitt.liedTo*
*standing continuity -1*
-> aster.pruitt.hub

### node: aster.pruitt.drumming

**PRUITT:** Under the street is Transit's. Transit says pumps.

#### if speaker=manuel
**MANUEL:** Do you say pumps?

#### if speaker=trevor
**TREVOR:** Pumps don't have a rest in the bar.

#### if speaker=michael
**MICHAEL:** You don't sound sure.

**PRUITT:** I say what Transit says. In the report.

*He glances at the two techs. They are both, carefully, working the far wall.*

**PRUITT:** My people won't take the wand past the station stairs after two. I didn't order that. They just stopped.

-> aster.pruitt.hub

### node: aster.pruitt.409

*Pruitt doesn't look toward the stairwell.*

**PRUITT:** I walked the stairs an hour ago.

**PRUITT:** I counted clocks. I counted exit signs. That's what the survey counts.

#### if speaker=michael
**MICHAEL:** ...Thanks.

**PRUITT:** I don't know what for.

#### if speaker=trevor
**TREVOR:** There's a number you're supposed to call.

**PRUITT:** There is. It's a good number. It works every time.

#### if speaker=manuel
**MANUEL:** He's not hurting anybody.

**PRUITT:** I didn't see anybody.

*standing continuity -1 (he is off-book and now the party knows it); set act1.pruitt.sparedRotter*
-> aster.pruitt.hub

### node: aster.pruitt.statue

*Pruitt sees it. The two techs see it. One of the wands stops beeping.*

**PRUITT:** That's a likeness.

#### if speaker=manuel
**MANUEL:** It's a sculpture.

**PRUITT:** It's a prohibited likeness.

#### if speaker=trevor
**TREVOR:** It's a pig in a coat. Legally.

**MANUEL:** Why would you show him that.

#### if speaker=michael
**MICHAEL:** It's art. My roommate made it. Isn't it good?

**MANUEL:** Michael. Why.

**PRUITT:** I'm going to look at this clipboard for ten seconds. When I look up, I'm going to see three students and no likeness.

*He looks at the clipboard. He counts under his breath. He's a slow counter.*

*set act1.pruitt.sawStatue*

Choices:
- *Put it away.* -> aster.pruitt.statue.away
- *Keep holding it.* -> aster.pruitt.statue.defy
- [speaker=manuel] "Do you like it?" -> aster.pruitt.statue.like

### node: aster.pruitt.statue.like

**PRUITT:** Six. Seven.

**MANUEL:** The coat took me two weeks.

**PRUITT:** Eight.

**PRUITT:** It's a good coat. Nine.

Choices:
- *Put it away.* -> aster.pruitt.statue.away
- *Keep holding it.* -> aster.pruitt.statue.defy

### node: aster.pruitt.statue.away

**PRUITT:** Ten.

*He looks up. Three students.*

**PRUITT:** Have a safe night, residents.

-> aster.pruitt.hub

### node: aster.pruitt.statue.defy

**PRUITT:** Ten.

*He looks up. It's still there. He looks at it for longer than ten seconds.*

**PRUITT:** My daughter draws him. Inside her closet door, where the inspection doesn't open.

**PRUITT:** I paint over it every spring. She draws it back.

**PRUITT:** Put it away. Please.

*The statue goes away on its own after this line. Whoever is holding it does that much for him.*

*set act1.pruitt.statueDefied*
*standing continuity -1; standing callers +1*
-> aster.pruitt.hub

### node: aster.pruitt.morph

#### if speaker=manuel
**PRUITT:** Are you registered for that?

**MANUEL:** For what?

**PRUITT:** For whatever you're in the middle of.

**MANUEL:** It's called the gonman.

**PRUITT:** There's no box for that.

#### if speaker=trevor
**PRUITT:** Edits need a declaration.

**TREVOR:** It's over the counter. Every bit of it.

**PRUITT:** Which counter?

**TREVOR:** Several counters.

#### if speaker=michael
**PRUITT:** My slate just woke up. It hasn't done that all night.

**MICHAEL:** Sorry. I think that's me.

**PRUITT:** ...Stand over there, would you?

-> aster.pruitt.hub

---

### node: aster.kess.approach

*The super's office, door half open. A woman at a workbench under a clip lamp, rewiring a door
buzzer with hand tools. A wall of keys on hooks, each hook labeled in marker. A paper logbook, open.
A wind-up clock on the shelf, ticking. It is the only clock in ASTER that ticks.*

**KESS:** If it's the elevator, I know. If it's the hot water, I know. If it's the man with the clipboard, I know, and I didn't let him in. He has a thing that lets him in.

#### if speaker=manuel
**MANUEL:** Kess. Somebody took my balloon.

**KESS:** The orange one.

*She puts the screwdriver down.*

**KESS:** Sit. You look like the boiler.

#### if speaker=trevor
**KESS:** Shrimp. How are they?

**TREVOR:** Hiding. Since yesterday.

*She writes that in the logbook.*

**KESS:** I flushed the risers Tuesday. That should've helped.

**TREVOR:** It didn't.

**KESS:** No. Then it isn't the risers.

#### if speaker=michael
**KESS:** Stairwell. You're the one in the stairwell, on the phone.

**MICHAEL:** The reception's better.

**KESS:** Reception's the same everywhere, kid.

**KESS:** It's fine. The stairwell's quiet. Whoever she is, she's a good listener.

**MICHAEL:** ...Yeah.

*set act1.aster.kessMet*
-> aster.kess.hub

### node: aster.kess.hub

Choices:
- "Did anyone leave with a balloon tonight?" -> aster.kess.balloon
- [flag act1.aster.kessBalloonAsked] "What about the cameras?" -> aster.kess.cameras
- "Can we get on the roof?" -> aster.kess.roof
- "How bad is the building, really?" -> aster.kess.rot
- "What's the deal with the lobby bathroom?" -> aster.kess.bathroom
- [flag act1.aster.rotter409Met] "Who's the man on the stairs?" -> aster.kess.409
- [flag act1.aster.elevatorSaidLorna] [once] "The elevator said 'Lorna.'" -> aster.kess.lorna
- [flag act1.aster.roofDoorForced] [once] "About the roof door." -> aster.kess.roofForced
- [item statue] *Show her the statue.* -> aster.kess.statue
- [morph>=1] [once] *Let her get a look at you.* -> aster.kess.morph
- "Thanks, Kess." -> aster.kess.bye

### node: aster.kess.balloon

**KESS:** Nobody came through my lobby with a balloon. I'd have it in the book.

*She taps the logbook.*

**KESS:** Front door, back door, dock. The book's got everybody. The clipboard and his two ghosts. The boy from two, coming off shift. That's the night.

#### if speaker=manuel
**MANUEL:** So it's still in the building.

#### if speaker=trevor
**TREVOR:** So it didn't leave through the lobby.

#### if speaker=michael
**MICHAEL:** So nobody walked out with it. That's good, right?

**KESS:** I said nobody carried it through. I don't speak for what a balloon does on its own.

*set act1.aster.kessBalloonAsked*
-> aster.kess.hub

### node: aster.kess.cameras

**KESS:** Four cameras. Lobby, dock, back stair, roof. One recorder.

**KESS:** It still records. It just won't play. Rot's in the board. I open the playback and it shows me the lobby in nineteen-oh-one.

**KESS:** There wasn't a lobby in nineteen-oh-one.

#### if speaker=manuel
**MANUEL:** Can we look at it?

#### if speaker=trevor
**TREVOR:** If it's still writing, the data's fine. It's the read path. That's fixable.

#### if speaker=michael
**MICHAEL:** These two can fix anything. I've seen it. I hold the flashlight.

**KESS:** It's certified equipment. I'm not allowed to open it.

**KESS:** I'm also not allowed to notice if three engineering students open it.

*She takes a brass key off a hook and puts it on the bench, not in anyone's hand.*

**KESS:** Closet behind the mailboxes. Bring your own iron. Mine's gas, and it's older than you.

**TREVOR:** We have an iron.

**MANUEL:** And a scope.

**KESS:** On the 6-C breaker. I know.

*give item closet_key*
*set act1.leads.footageKnown*
*Journal: LEAD — THE FOOTAGE. The recorder in the lobby closet still writes but can't play back. Fix it and see what the roof camera saw.*

*[if not act1.aster.breakerLecture] -> aster.kess.breaker*
-> aster.kess.hub

### node: aster.kess.breaker

**KESS:** While you're standing here. 6-C. You tripped it twice this month.

**KESS:** I went up and counted. Three printers. A vacuum pot —

**TREVOR:** Degassing chamber.

**KESS:** — a dehumidifier, a microscope, an oscilloscope, drills on charge, a soldering station, and a fish tank.

**TREVOR:** Shrimp.

**KESS:** On one circuit.

**MANUEL:** It's the dehumidifier. It kicks on when the printers are —

**KESS:** I don't care which one it is. Stagger them.

**MICHAEL:** Rookie Aster mistake.

**KESS:** And I pulled a pacifier out of the sixth-floor drain stack.

*All three roommates find something else in the room to look at.*

**KESS:** I'm not asking. I'm telling you I'm not asking.

*set act1.aster.breakerLecture*
-> aster.kess.hub

### node: aster.kess.roof

**KESS:** Roof's closed.

#### if speaker=manuel
**MANUEL:** Why?

**KESS:** Because the sign says so, and I wrote the sign. Why do you want the roof?

**MANUEL:** To look.

**KESS:** For a balloon. In the dark.

**MANUEL:** It's orange.

#### if speaker=trevor
**TREVOR:** Line of sight. If it's snagged on the east face, we'd see it from above.

**KESS:** That's a reason.

#### if speaker=michael
**MICHAEL:** Honestly? He needs to look at the sky for a minute or he's going to come apart.

**KESS:** That's a better reason.

*She takes a key off its hook.*

**KESS:** Plain lock. Doesn't keep a diary. Bring it back.

*give item roof_key; set act1.aster.roofKeyGiven*
-> aster.kess.hub

### node: aster.kess.rot

**KESS:** Eleven years I've had this building. First ten, things broke. This year they break wrong.

Choices:
- "What's the difference?" -> aster.kess.rot.wrong
- "Can you fix it?" -> aster.kess.rot.fix

### node: aster.kess.rot.wrong

**KESS:** Broke is a pipe.

**KESS:** Broke wrong is the elevator apologizing to me by name. I never told it my name.

-> aster.kess.rot.fix

### node: aster.kess.rot.fix

**KESS:** I fix what I can reach with a wrench. Anything with a chip in it, I pull the chip and put in something stupid.

**KESS:** Stupid holds.

#### if speaker=trevor
**TREVOR:** That's not a long-term plan.

**KESS:** Kid, show me one.

#### if speaker=manuel
**MANUEL:** And when you run out of stupid parts?

**KESS:** Then I come find the three of you and your printers. Don't make that face.

#### if speaker=michael
**MICHAEL:** You're kind of holding this whole place together.

**KESS:** Don't say that out loud. The building'll hear you.

*standing analogists +1*
-> aster.kess.hub

### node: aster.kess.bathroom

**KESS:** Occupied.

#### if speaker=manuel
**MANUEL:** Since when?

#### if speaker=trevor
**TREVOR:** For how long?

#### if speaker=michael
**MICHAEL:** Are they okay in there?

**KESS:** Since I took the job.

**TREVOR:** That's eleven years.

**KESS:** It's a slow building.

**KESS:** I slid a work order under the door once. It came back signed.

*She points with the screwdriver at the wall of keys. One hook, labeled LOBBY WC, is empty. The
marker on the label has faded more than the others.*

**KESS:** There's a hook for it. There's always been a hook for it.

-> aster.kess.hub

### node: aster.kess.409

**KESS:** Mister —

*She stops.*

**KESS:** Four-oh-nine. He had a lace from a company that isn't one anymore. Nobody left to push the update.

**KESS:** He was a tax accountant. He did mine.

Choices:
- "Shouldn't somebody report it?" -> aster.kess.409.report
- "His name's off the directory." -> aster.kess.409.name

### node: aster.kess.409.report

**KESS:** There's a number. They come with a van.

*She looks through the office window, toward the lobby.*

**KESS:** He likes the landing. He can hear the whole building from there. I bring him soup.

*set act1.aster.kess409Told*
-> aster.kess.hub

### node: aster.kess.409.name

**KESS:** The letters fell.

**KESS:** I haven't put them back. He doesn't answer to it, and I can't —

**KESS:** I'll get to it.

*set act1.aster.kess409Told*
-> aster.kess.hub

### node: aster.kess.lorna

**KESS:** It says that to you too?

#### if speaker=michael
**MICHAEL:** It sounded really sorry.

**KESS:** It always sounds sorry. It never says what for.

#### if speaker=trevor
**TREVOR:** It's on the directory. "Kessel, L." It could have read it off the board.

**KESS:** The board's felt and plastic, kid. Nothing reads felt.

**TREVOR:** ...No. It doesn't.

#### if speaker=manuel
**MANUEL:** Maybe it likes you.

**KESS:** Then it can stop at the right floor.

-> aster.kess.hub

### node: aster.kess.roofForced

**KESS:** I heard it. I heard it from down here.

#### if speaker=trevor
**TREVOR:** I'll fix the frame.

**KESS:** You'll fix the frame, and you'll fix it with wood, and you'll show me before you paint it.

#### if speaker=manuel
**MANUEL:** We can print a new strike plate.

**KESS:** You'll cut one. Out of steel. Like a person.

#### if speaker=michael
**MICHAEL:** That was Trevor.

**TREVOR:** It was.

**KESS:** There was a key. On a hook. With a label.

**MICHAEL:** Rookie Aster mistake.

-> aster.kess.hub

### node: aster.kess.statue

*She wipes her hands on her trousers before she takes it.*

#### if speaker=manuel
**KESS:** Hand-carved?

**MANUEL:** Hand everything.

**KESS:** It's good. It's too good. You work off a picture?

**MANUEL:** There aren't any pictures. They're banned.

**KESS:** Then off what?

**MANUEL:** ...I just know what he looks like.

*She turns it once in the lamp light and hands it back with both hands.*

**KESS:** Huh.

#### if speaker=trevor
**KESS:** This his?

**TREVOR:** All three are his.

**KESS:** Three.

**TREVOR:** There's a flag, too.

**KESS:** I didn't hear that. I'm the super. I don't hear flags.

#### if speaker=michael
**MICHAEL:** It's Manuel's. Don't tell him I borrowed it.

**KESS:** Why'd you borrow it?

**MICHAEL:** People talk different when you show them something.

**KESS:** You're smarter than the stairwell makes you look.

**KESS:** Don't walk that past the clipboard.

*set act1.aster.kessStatueShown*
-> aster.kess.hub

### node: aster.kess.morph

#### if speaker=manuel
**KESS:** You look different.

**MANUEL:** The gonman.

**KESS:** Is the gonman going to pay the gonman's share of the breaker panel?

#### if speaker=trevor
**KESS:** Your veins are doing something.

**TREVOR:** Magnesium.

**KESS:** Magnesium doesn't do that.

**TREVOR:** It's a lot of magnesium.

#### if speaker=michael
**KESS:** My buzzer just went off. It isn't wired to anything.

**MICHAEL:** That might be me.

**KESS:** Then take it outside.

-> aster.kess.hub

### node: aster.kess.bye

**KESS:** Hey.

**KESS:** I looked at that ottoman every morning too. From the dock. Told me whether to salt the steps.

**KESS:** Go find it.

-> end

---

## Area 5: The roof

### node: aster.clock.roofstair

*Top of the stairwell. Where a clock should be, a sheet of paper taped over a display. Through the
paper, faintly, backlit: 1901. On the paper, in marker:*

```
IT'S LATE. GO TO BED.  — K
```

#### if speaker=manuel
**MANUEL:** She's not wrong.

#### if speaker=trevor
**TREVOR:** Most accurate clock in the building.

#### if speaker=michael
**MICHAEL:** I like this one.

*set act1.aster.clock.roofstairSeen; act1.aster.clocksSeen +1*

### node: aster.roof.door

*A steel door. ROOF DECK CLOSED, in marker, on cardboard. A plain keyed deadbolt. No reader, no
light, no chip.*

Choices:
- [item roof_key] *Unlock it.* -> aster.roof.arrive
- [speaker=michael] *Lift and pull.* -> aster.roof.door.michael
- [speaker=manuel] *Pop the hinge pins.* -> aster.roof.door.manuel
- [speaker=trevor] *Shoulder it.* -> aster.roof.door.trevor
- *Go back down.* -> end

### node: aster.roof.door.michael

*Michael takes the handle, lifts the whole door a centimeter on its hinges, and pulls. The bolt
slides past the strike plate. It opens.*

**TREVOR:** How did you know that?

**MICHAEL:** It's always done that.

**MANUEL:** You come up here?

**MICHAEL:** We used to. She liked the roof.

-> aster.roof.arrive

### node: aster.roof.door.manuel

*Manuel produces a drill from somewhere in his jacket.*

**MICHAEL:** You brought a drill?

**MANUEL:** Aster pros carry.

*He doesn't use it as a drill. He taps the hinge pins up and out with the chuck, one, two, three,
and lifts the door off like a lid.*

**TREVOR:** Put those back after.

**MANUEL:** Obviously. I'm not an Aster noob.

-> aster.roof.arrive

### node: aster.roof.door.trevor

#### if morph>=1
*Trevor rolls one shoulder and leans on the door. The frame gives up before he's done leaning.*

**TREVOR:** Huh. That was less than I expected to need.

**MICHAEL:** Should it be that easy?

**TREVOR:** No.

*He looks at his own hand for a second.*

#### if morph<1
*Trevor backs up three steps and hits the door. The door hits back.*

**TREVOR:** Okay.

*He hits it again. The frame splits.*

**TREVOR:** It's open.

**MANUEL:** Is your shoulder open?

**TREVOR:** It's fine. I take collagen.

*set act1.aster.roofDoorForced*
-> aster.roof.arrive

### node: aster.roof.arrive

*Wind. Gravel, dead satellite dishes, an antenna mast with cables running off toward the metro
garage. A hooded ventilation stack. East and below: the metro plaza, and over it a billboard with
half its panels out.*

```
AT THE END OF THE DAY
NO ONE CAN C DE FA TER THAN A
```

*North: dark.*

*Manuel goes to the east parapet. He looks down at the sixth-floor balconies. Then he looks up.*

**MANUEL:** You'd see it. Orange. Even at night you'd see it.

**TREVOR:** If it went up, it's gone. That's just lift.

**MICHAEL:** Trev.

**TREVOR:** I'm not being — I'm telling him where not to look.

**MANUEL:** I'm going to look anyway.

*set act1.aster.roofReached*

*Free roam. Interactables: north parapet (aster.roof.lights), vent stack (aster.roof.vent),
antenna (aster.roof.antenna), east parapet (aster.roof.east). Lead A surfaces at aster.roof.leadA
once any two of them have been used, or on trying to leave.*

### node: aster.roof.east

*Six floors down and one balcony over: the ottoman. From up here it is a small pale square.*

#### if speaker=manuel
**MANUEL:** It's damp. The ottoman.

**MANUEL:** It's going to rain.

#### if speaker=trevor
**TREVOR:** You can read it from here. Dark on the windward side. Humidity's up.

**TREVOR:** We don't need the balloon to check the weather.

*He hears it as he says it.*

**TREVOR:** That's not what I meant.

#### if speaker=michael
**MICHAEL:** It looks so small from up here.

**MICHAEL:** Everything of ours does.

-> end

### node: aster.roof.lights

*North, past the dark where Beltsville used to keep its lights on: a row of white points, low on
the horizon. Evenly spaced. Moving left to right. Slowly. All together.*

#### if speaker=trevor
**TREVOR:** Not aircraft. No strobes. Same spacing the whole way across.

**MICHAEL:** Trucks?

**TREVOR:** On what road? There's nothing straight out there.

**TREVOR:** Those aren't a line of things. Those are all on one thing.

#### if speaker=manuel
**MANUEL:** What is that?

**TREVOR:** I don't know.

**MANUEL:** It's big.

**MICHAEL:** How big?

**MANUEL:** I don't want to do the math.

#### if speaker=michael
**MICHAEL:** Huh. That's kind of pretty.

**TREVOR:** It's really not.

**MICHAEL:** From here it is.

*They watch it. It doesn't get closer. It doesn't stop.*

**MANUEL:** ...Balloon.

**TREVOR:** Balloon.

*set act1.aster.roofLightsSeen*
-> end

### node: aster.roof.vent

*The ventilation stack. It runs the height of the building and keeps going down. A strip of old
caution tape tied to the grille is pulled flat against it.*

#### if speaker=trevor
**TREVOR:** This is an exhaust. It should be blowing.

*He holds his palm to the grille.*

**TREVOR:** It's pulling.

**MANUEL:** Fans reversed?

**TREVOR:** Somebody's fans. Not the building's. This ties into the station's.

#### if speaker=manuel
*Manuel holds the end of the caution tape out and lets go. It snaps back against the grille.*

**MANUEL:** It's breathing in.

**TREVOR:** It's an exhaust.

**MANUEL:** Then it's breathing in wrong.

#### if speaker=michael
**MICHAEL:** Why's it sucking? Isn't this where the laundry smell comes out?

**TREVOR:** ...It is.

**MICHAEL:** So is that bad?

**TREVOR:** It's weird.

**MICHAEL:** Is weird bad?

**TREVOR:** Tonight? Probably.

*set act1.aster.ventDrawSeen*
-> end

### node: aster.roof.antenna

*The antenna mast. Two steel guy cables run off the roof at a shallow angle, down to the top deck
of the metro garage. A pulley trolley is clipped to one of them. It has been there long enough to
rust to the cable, and somebody has oiled it since.*

#### if speaker=manuel
**MANUEL:** Somebody's been using this.

**MICHAEL:** For what?

**MANUEL:** For not taking the elevator.

#### if speaker=trevor
**TREVOR:** Quarter-inch steel, shallow grade. That's rated.

**MICHAEL:** By who?

**TREVOR:** It has a rating.

#### if speaker=michael
**MICHAEL:** No.

**TREVOR:** Nobody said anything.

**MICHAEL:** I can see you both thinking it. No.

*set act1.aster.ziplineFound (stretch: unlocks the ASTER–garage zipline)*
-> end

### node: aster.roof.leadA

*Trigger: two roof interactables used, or the party tries to leave the roof, whichever is first.
Plays once.*

#### if speaker=trevor
**TREVOR:** We're doing this wrong. Looking.

**TREVOR:** Helium goes through everything. That balloon's been leaking since the day it was sealed. It's leaking right now, wherever it is.

**MANUEL:** So?

**TREVOR:** So nobody's put helium in this town's air in fifty years. Anything over background is ours.

**MANUEL:** A sniffer.

**TREVOR:** Chamber to calibrate it. Scope on the sensor. One print.

#### if speaker=manuel
**MANUEL:** The degassing chamber.

**TREVOR:** What about it?

**MANUEL:** The leak sensor. The one we check the seals with. It finds the smallest gas there is.

**TREVOR:** ...It's tuned for the wrong one.

**MANUEL:** So we tune it for the right one. It's leaking. Balloons leak. It's leaving a line in the air and we're up here using our eyes like Aster noobs.

**TREVOR:** Scope on the sensor. One print for the housing.

#### if speaker=michael
**MICHAEL:** Too bad we can't just, like, smell it.

*Trevor and Manuel look at each other.*

**MICHAEL:** What?

**TREVOR:** Helium permeates. It's been leaking the whole time.

**MANUEL:** The leak sensor on the chamber. Retune it.

**TREVOR:** Scope on the output. One print.

**MICHAEL:** What did I say?

**MANUEL:** Something smart.

**MICHAEL:** On purpose?

**MICHAEL:** How long?

**TREVOR:** An hour.

**MANUEL:** Two.

**MICHAEL:** So three.

*set act1.leads.heliumKnown*
*Journal: LEAD — THE HELIUM TRAIL. Build a sniffer at the fab in 631 (degassing chamber + oscilloscope) and follow what the balloon is leaking.*
-> end

---

## Closing

### node: aster.leads.wrap

*Trigger: `act1.leads.heliumKnown`, `act1.leads.halvardKnown`, and `act1.leads.footageKnown` are
all set and no dialogue is open. The party is pulled into a short huddle wherever they are. If they
are split up, it plays over their phones (voice only, no Pork UI).*

**MICHAEL:** Okay. So. What do we actually have?

**TREVOR:** A trail. Print the sniffer, follow the helium.

**MANUEL:** A name. Halvard, under the metro stairs. Somebody's selling.

**MICHAEL:** And a recorder that saw the roof and can't say what it saw.

**TREVOR:** Sniffer first. A sensor doesn't have an angle.

**MICHAEL:** People first. People know things they don't know they know.

**TREVOR:** That's not a method.

**MICHAEL:** It got us two out of three.

*They both look at Manuel.*

**MICHAEL:** Your call, man. It's your balloon.

**MANUEL:** Any order. All of them.

**MANUEL:** I don't care which. Just tonight.

**MICHAEL:** Aster pros.

**MANUEL:** Aster pros.

**TREVOR:** ...Aster pros.

#### if flag act1.aster.drummingHeard
*Under the floor, almost too low to hear: three beats. Then nothing.*

*Nobody mentions it.*

#### if not flag act1.aster.drummingHeard
*Somewhere below them a pipe knocks three times. Probably a pipe.*

*set act1.aster.leadsSurfaced*
*Objective: THREE LEADS. The sniffer (631). Halvard (metro plaza). The recorder (lobby closet). Any order.*
*Beat 2 opens. The front doors of ASTER unlock for free travel.*

---

## Barks and ambient lines

*Roommate barks fire at most once per 90 seconds per character, never during dialogue, and each id
at most once per visit to ASTER unless marked repeat.*

| id | speaker | trigger | line |
|---|---|---|---|
| aster.bark.manuel.245 | MANUEL | random, any area (repeat, max 2 per beat) | I hate 245 lab. |
| aster.bark.manuel.stairs | MANUEL | climbing 3+ flights | Aster pros take the stairs. |
| aster.bark.manuel.sky | MANUEL | idle 20s on the roof | It's the wrong color up there without it. |
| aster.bark.manuel.mate | MANUEL | idle 30s in the lobby | I left the kettle on. I didn't. I want to have left the kettle on. |
| aster.bark.manuel.noob | MANUEL | another roommate rides the elevator to a wrong floor | Aster noob. |
| aster.bark.manuel.hall | MANUEL | passing 631's door without entering | Don't look at the balcony. Just walk. |
| aster.bark.trevor.stairs | TREVOR | climbing 3+ flights | Zone two. This is good for us. |
| aster.bark.trevor.light | TREVOR | under a flickering hall strip | That's a rendering error. On a ceiling. |
| aster.bark.trevor.shrimp | TREVOR | idle 30s on any floor | They were hiding this morning. All of them. Shrimp don't all hide. |
| aster.bark.trevor.stack | TREVOR | idle 30s in the lobby | I'm due for the magnesium. And the other magnesium. |
| aster.bark.trevor.carpet | TREVOR | walking over the doubled carpet tile on six | Don't step on that one. I don't know why. Don't. |
| aster.bark.trevor.roofcold | TREVOR | first 10s on the roof | Cold exposure. It's fine. It's good, actually. |
| aster.bark.michael.stairs | MICHAEL | climbing 3+ flights | She used to race me up these. She cheated. |
| aster.bark.michael.lobby | MICHAEL | first time in the lobby | She'd have liked this place. |
| aster.bark.michael.phone | MICHAEL | idle 30s in the stairwell | *(He checks his phone. He puts it away.)* |
| aster.bark.michael.call | MICHAEL | idle 30s on the roof (once per save) | She told me she heard something on a call once. Wouldn't say what. I figured I'd ask her later. |
| aster.bark.michael.manuel | MICHAEL | standing next to Manuel, idle 15s | We'll get it back, man. Or we'll get you a — no. We'll get it back. |
| aster.bark.michael.pro | MICHAEL | any roommate picks a lock, pops a hinge, or opens the camera closet | Aster pros. |
| aster.bark.any.mistake | nearest other roommate | a roommate knocks on 631's own door | Rookie Aster mistake. We live there. |
| aster.amb.elevator.1 | ELEVATOR | party passes the doors, any floor (1 in 3) | Floor. Nineteen. Oh. One. |
| aster.amb.elevator.2 | ELEVATOR | party passes the doors, lobby (1 in 3) | Going. Going. I'm sorry. |
| aster.amb.vending.1 | VENDING MACHINE | party within 3 tiles (repeat, 40s) | Thirsty? Thirsty? Thirst — |
| aster.amb.vending.2 | VENDING MACHINE | party within 3 tiles (1 in 3 instead of amb.vending.1) | At the end of the day. At the end of the day. Thirsty? |
| aster.amb.tech.1 | ABATEMENT TECH | party walks between a tech and the wall | *(The wand ticks faster, then slower. The tech steps around you without a word.)* |
| aster.amb.tech.2 | ABATEMENT TECH | wand passes the vending machine | *(The wand screams once. The tech writes a number down and moves on.)* |
| aster.amb.pruitt.1 | PRUITT | idle, party in lobby but not talking to him | *(to the clipboard)* Two. It's a two. It's a solid two. |
| aster.amb.pruitt.2 | PRUITT | a roommate with morph>=1 crosses the lobby | *(He starts to write something. He erases it.)* |
| aster.amb.kess.1 | KESS | party in lobby, office door open (repeat, 60s) | *(A ratchet. A pause. A ratchet.)* |
| aster.amb.kess.2 | KESS | party uses the elevator call button in the lobby | *(from the office)* Stairs! |
| aster.amb.409.1 | FOUR-OH-NINE | party within earshot on the stairs (repeat) | code rot. code rot. |
| aster.amb.409.2 | FOUR-OH-NINE | party passes without stopping | four oh nine. is my. |
| aster.amb.varga.radio | — | standing outside 633 | *(A radio tuned between stations. Someone has left it there on purpose.)* |
| aster.amb.dez.floor | DEZ | party returns to 214 after `act1.aster.drummingHeard` | *(Dez is lying on the floor with his ear to it. He holds up one finger: wait.)* |
| aster.amb.bath.water | — | standing outside the lobby bathroom, knocks < 2 | *(Water running. It has the sound of water that has been running for a while.)* |
| aster.amb.bath.after | OCCUPANT | standing outside the lobby bathroom after `act1.aster.bathroomOpened` (1 in 3) | *(Humming. Content.)* |

---

## Notes for implementers

**Scene boundaries**
- Unlocks when the cold open ends. I assumed the flag name `act1.coldopen.done`; rename to match
  `01` when that file lands. `act1.coldopen.printerWarmSeen` is likewise an assumed name and is not
  required by anything here.
- Ends when `act1.aster.leadsSurfaced` is set by `aster.leads.wrap`. Each lead has exactly one
  source so the beat always visits three places: **A = roof** (`aster.roof.leadA`),
  **B = Dez in 214** (`aster.dez.helium`), **C = Kess** (`aster.kess.cameras`).
- Soft guidance if the party stalls (suggest 4 minutes without a new `act1.aster.*` flag): Varga
  points to Dez (`aster.varga.heard`), Dez's balloon answer points at the plaza, Kess's balloon
  answer opens the camera question. If still stalled, fire the nearest roommate bark toward an
  unvisited area ("We haven't tried the roof." / "Kess is up. Kess is always up." / "Somebody on
  two had a light on."). Those three fallback lines are not in the bark table because they are
  navigation hints, not character barks; add them to whatever hint system exists.

**Speaker and party interjections**
- `speaker` is the roommate whose player opened the interaction. Sub-blocks `#### if speaker=…`
  are mutually exclusive.
- Lines attributed to a roommate outside a speaker sub-block (and lines by a roommate who is not
  the speaker inside one) are **party interjections**. Play them only if that roommate is within
  about 8 tiles and not in another dialogue. Every node has been written so that dropping all
  interjections leaves a coherent exchange. In solo play with no AI companions, they are simply
  skipped. The four group moments that want all three voices (`aster.hall6.enter`,
  `aster.varga.heard`, `aster.kess.breaker`, `aster.leads.wrap`) should gather the party if
  possible, and in solo fall back to the speaker's line alone.
- `[once]` choices disappear after use. Hubs otherwise repeat.
- `[morph>=1]` and `[morph<1]` test the **speaker's** morph stage.

**Counts, timers, rolls**
- **Bathroom:** `act1.aster.bathroomKnocks` is one shared counter for the party, saved, never
  resets. Knock 5 = "One minute!" and knock 10 = open, exactly as SECRETS #2. Minimum 0.6 s between
  counted knocks so a held key does not burn through the table. During `aster.bathroom.open` the
  camera must **not** enter or show the interior; hold on the three roommates with a warm light
  spill, about 4 seconds on "They keep looking." The sign changes from 44 to 45 and stays 45 for
  the rest of the save. After opening, the door is inert except for Manuel's one line and the
  1-in-3 humming ambient.
- **Vending machine kick:** per kick, roll on the luck stat. Suggested base table: nothing 55%,
  item 25%, coins 15%, old can 5%. Guarantee a payout by the 3rd kick of a visit so the mechanic is
  discoverable (SECRETS rule: nothing rarer than 1 in 3 across the opportunities given). Cap
  payouts at 3 per in-game day. `old_can` drops at most once per save; force it on the 6th lifetime
  kick if it has not dropped. Kess's shout fires on exactly the 3rd kick. Pruitt's line fires on
  the first kick made while he is in the lobby.
- **Elevator:** usable as floor travel. 1 in 3 rides open one floor off (never the roof, never a
  nonexistent floor; Dez's "cheaper hallway" is a rumor in Act 1, not a place). The "I'm sorry,
  Lorna" line plays on the first ride only, then 1 in 3.
- **Clocks:** five in this scene (`hall6`, `stairs`, `lobby`, `roofstair`, plus Kess's wind-up
  clock, which is analog, works, and is **not** counted). `act1.aster.clocksSeen` counts the four
  rotted ones. The "set the time" choice is a stub gated on `act1.puzzle.clocksUnlocked` for the
  1901 puzzle (DESIGN §8, stretch); this file does not script the puzzle. Rotted clocks show 1901
  in the **date/year** field so that setting the **time** to 19:01 remains a separate action.
- **Roof lead trigger:** `aster.roof.leadA` fires after any two of
  {`aster.roof.lights`, `aster.roof.vent`, `aster.roof.antenna`, `aster.roof.east`}, or when the
  party touches the roof door to leave, whichever is first. Its speaker is whoever triggered it.
- **Pruitt's ten-count:** in `aster.pruitt.statue` the choices stay up while he counts; if the
  player picks nothing for about 12 seconds, resolve as `aster.pruitt.statue.defy`.
- **Statue item:** `[item statue]` means any roommate is carrying one of Manuel's three statues out
  of 631. If the newest statue is tracked separately, nothing here depends on which one it is.

**The current time is never stated in this scene.** Every rotted clock reads 1901, Kess's working
clock is never shown face-on, and Pruitt and Trevor both stop short of saying it. This is
deliberate: the cold open is at 2:58 a.m. and Lead C's footage is stamped 3:14 a.m. showing the
figure on the roof *with* the balloon, which does not obviously line up with the balloon already
being gone at 2:58. Somebody who owns the timeline should decide how that resolves (a rotted
timestamp is the cheap answer). Until then, please do not add a visible clock time to this beat.

**Twist fairness (checked against DESIGN §9 and deep-lore §1, 3:14 a.m.)**
- "One of your machines was going" + three sincere "wasn't me"s: A = printer #3 printing; B = the
  seeded roommate was up and does not know it.
- "Nobody carried it through my lobby": true under both, since the balloon went roof → shaft.
- "Plain lock, doesn't keep a diary" and Michael's lift-and-pull: the roof was reachable without a
  key by anyone or anything. True under both.
- The vent stack drawing air **in**: true under both (the tunnel fans were reversed either way).
- Manuel's "I just know what he looks like": A = the likeness is being fed to him; B = edited
  memory. It deliberately sits beside the optional 631 clue about the newest statue.
- Pruitt's "lifting gases" survey line is T3 foreshadowing only. It does not replace the Lead A
  van clue; it sets it up.
- Nothing here names the Sweeper, shows the Sahur (rumor and three faint beats only), or puts Tim
  on screen.

**The Call:** Mrs. Varga's `aster.varga.call.said` is the scene's one deliberate "great line"
(quotes.md: one per scene). It circles what the Call was without giving any of its words. If the
lore owners think "what you said back" tips too much toward the Act 3 reveal, cut the node; nothing
else depends on `act1.aster.vargaCallAsked`.

**Faction nudges** are all ±1 and small: Pruitt truth (+continuity), Pruitt lie (−continuity),
defying his ten-count (−continuity, +callers), learning he walked past Four-oh-nine (−continuity,
because the party now holds something over him; later scenes can read `act1.pruitt.sparedRotter`),
showing Varga the statue (+callers), Kess's "stupid holds" (+analogists).
`act1.pruitt.knowsHelium` / `act1.pruitt.liedTo` are meant to be read by Lead A and the stretch
abatement-unit boss: he either covered for 631 or pencilled their unit number in the margin.

**Not the easter-egg rotter.** Four-oh-nine going silent at the statue is a reaction, not SECRETS
#10. He never says a coherent sentence. Keep the one coherent rotter line for the plaza.

**Proposed additions that need a SECRETS.md entry by whoever integrates this** (I was told not to
edit other files):
- The directory's missing letters, read top to bottom, spell **C-A-L-L-B-A-C-K** (RESIDEN**C**E,
  M**A**ILROOM, **L**AUNDRY, HA**LL**OWAY (two), SCOOTER **B**AY, V**A**RGA, MI**C**HAEL,
  DEC**K**). Board order in the node is the display order; if the acrostic matters, reorder rows to
  C, A, L, L, B, A, C, K (the HALLOWAY row then needs to lose only one L and LAUNDRY supplies the
  other). The extra T from "AS ER" and the stray W in the drift are noise on purpose. Cut freely if
  this is one egg too many.
- The vending machine's `old_can` (BEST BEFORE 01 JAN 1901). Flavor item; no mechanic assigned.
- The zipline trolley on the antenna is the DESIGN §8 fast-travel hint, not new.

**Invented names in this file:** Kess / Lorna Kessel (super), Mrs. Varga (633), Dez (214), the
unnamed resident "Four-oh-nine", the directory-only surname Halloway (604), ASTER's block number
14-C, and the item ids `canned_mate`, `electro_plus`, `peach_rings`, `old_can`, `roof_key`,
`closet_key`. Dale Pruitt, Halvard, and everything else are canon.
