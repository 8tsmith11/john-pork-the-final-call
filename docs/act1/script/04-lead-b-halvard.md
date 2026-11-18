# Lead B: Halvard the fence

## Purpose

Lead B of Act 1 (DESIGN §3). The roommates have heard that someone is selling helium, and the man
who hears everything is Halvard, a pre-slop data dealer in a shuttered phone-repair stall under the
College Park metro stairs. The scene is a gate (get him to open the shutter: pay, trade a statue,
threaten, pick or drill the side door, out-stare him, or share a mate) followed by a topic hub
inside the stall. It delivers the piece of the trail (the tunnel fans ran backwards, the balloon
went *down*), the mechanical key for the platform door, and two twist clues: the seller was "one of
you, from 631. Or wearing your face." (T1/T4) and the pirate TV looping an intercepted Interdiction
briefing, a rot map spreading from the 2071 Call sites, which he switches off when noticed (T2).
It also plants the double-cross hook for the stretch boss (the abatement unit).

Halvard in one line each. **Wants:** to be paid and left alone. **Needs:** to be part of something
that matters again. **Fears:** Continuity finding what is behind the curtain. **The line:** *"I can
fix any phone ever made. I can't make it ring."* It is the one great line in this scene. Do not add
a second.

Theme service: *who answers?* (a phone-repair man surrounded by phones nobody calls), *authenticity
versus the copy* (he wants a statue because somebody's thumbs are in it), *order and its price* (the
tip line on the stairs).

## Flags

Reads:
- `act1.call.answered` (bool), `act1.call.declines` (int 0–3)
- `act1.leadA.vanSeen` (the party saw the abatement van logging helium)
- `act1.leadC.footageSeen` (the party watched the 3:14 roof footage)
- `act1.manuel.newestStatueAsked` (the optional 631 dialogue about the newest statue was seen)
- items: `statue_first`, `statue_second`, `statue_newest`, `pickset`, `drill`, `sniffer`,
  `pacifier`, `guitar`, `mate`
- resources: `scrap`
- `speaker`, `present <roommate>`, `morph`
- **Does not read `seed`.** Every line in this file is identical under variants A and B on purpose.

Sets:
- `act1.halvard.met`
- `act1.halvard.entry` (one of `pay`, `trade`, `threat`, `lockpick`, `drill`, `stare`, `mate`)
- `act1.halvard.rapport` (int, starts 0)
- `act1.halvard.threatened`
- `act1.halvard.stareLostBy.<roommate>`
- `act1.halvard.statueTraded`, `act1.halvard.statueWhich`, `act1.halvard.statueTradedBy`,
  `act1.halvard.statueBehindManuel`, `act1.halvard.manuelKnowsStatue`
- `act1.halvard.sellerClue` (T1/T4 delivered)
- `act1.halvard.fansClue` (trail piece delivered)
- `act1.halvard.tvNoticed`, `act1.halvard.tvPressed` (T2 delivered / pushed on)
- `act1.halvard.librarian` (Manuel told him who sent the balloon)
- `act1.halvard.callTopic`
- `act1.halvard.keyGiven` (grants item `platform_key`)
- `act1.halvard.promised` (the party gave its word)
- `act1.halvard.betrayed` (the party used the tip line), `act1.halvard.brokeWord`, and
  `act1.boss.variant = abatement`
- `act1.leadB.done`
- standing nudges, written inline as `[standing archivists +1]` etc.

---

## Part 1: The shutter

### node: halvard_approach

*Under the metro stairs. A roll-down shutter, rust at the bottom edge, a mail slot cut at chest
height. A hand-painted sign above it: HALVARD. PHONES FIXED WHILE YOU WAIT. Someone has painted
over FIXED and then painted it back. Blue TV light leaks under the shutter. Above the stairs, a
billboard with half its panels dead.*

*First interaction with the shutter. The slot scrapes open. Two eyes, reading glasses pushed up.*

**HALVARD:** Closed.

#### if speaker=manuel
**MANUEL:** The light's on.

**HALVARD:** The light's been on since 2089. Still closed.

**MANUEL:** I lost something. Somebody said you hear things.

**HALVARD:** Somebody says a lot. What kind of something?

**MANUEL:** Orange. Round. Mine.

*The eyes do not move for a second.*

**HALVARD:** ...Say less, out here. Say it better.

#### if speaker=trevor
**TREVOR:** Your sign says while you wait.

**HALVARD:** Sign's older than you. Doesn't say how long.

**TREVOR:** We heard someone's moving helium. We heard you'd know.

**HALVARD:** You heard a word that gets people a van outside their door. Lower your voice or raise
your offer.

#### if speaker=michael
**MICHAEL:** Hey. Hi. Sorry, is this a bad time?

**HALVARD:** It's the middle of the night under a train station.

**MICHAEL:** Right. So, medium.

**HALVARD:** What do you want.

**MICHAEL:** My roommate lost a balloon. I know how that sounds.

**HALVARD:** I know exactly how it sounds. That's the problem. Quieter.

*All variants continue.*

**HALVARD:** You're ASTER. Six-something. You walk like the floor owes you rent.

*Sets `act1.halvard.met`.*

-> halvard_slot_hub

### node: halvard_slot_hub

*The slot stays open. He is deciding.*

**HALVARD:** I don't open for stories. I open for reasons. Got one?

Choices:
- "What's it cost to talk?" -> halvard_pay_offer
- "What would you take instead of money?" -> halvard_trade_ask
- [item statue_first OR item statue_second OR item statue_newest] *(Show him the statue.)* -> halvard_trade_show
- "Open the shutter. I'm not asking again." -> halvard_threat_weak
- "You've got a lot back there you wouldn't want found." -> halvard_threat_real
- *(Say nothing. Hold his eyes.)* -> halvard_stare_start
- [speaker=manuel] [item mate] "You look like you've been up a while. Mate?" -> halvard_mate
- [item pacifier] *(Hold up a pacifier.)* -> halvard_show_pacifier
- "What's with the billboard?" -> halvard_billboard
- *(Step back.)* -> halvard_slot_leave

### node: halvard_slot_leave

**HALVARD:** Smart. Come back with a reason.

*The slot scrapes shut. The TV light keeps moving under the shutter.*

*Returning to the shutter re-enters at `halvard_slot_hub` with this opener instead:*

**HALVARD:** You again. Reason yet?

### node: halvard_billboard

*The billboard above the stairs. Half the panels are dead and the rest stutter.*
*It reads: AT THE END OF THE DAY NO ONE CAN C_DE FASTER THAN A_.*

**HALVARD:** Went up the year I took the lease. I've read it every morning for thirty-seven years.

**HALVARD:** They weren't wrong, is the thing. Fast was never what I was short of.

-> halvard_slot_hub

---

## Part 2: Ways in

### Way 1: Pay

### node: halvard_pay_offer

**HALVARD:** Not credit. Credit has a memory. Scrap. Boards, copper, anything I can put on a bench.

**HALVARD:** Forty.

#### if speaker=manuel
**MANUEL:** Fifty.

*A pause behind the slot.*

**HALVARD:** I said forty.

**MANUEL:** I heard you. Fifty. Just open it.

*[present trevor]*
**TREVOR:** Rookie Aster mistake.

*[present michael]*
**MICHAEL:** He's not usually like this. He is, actually. But not with numbers.

**HALVARD:** Forty. I'm a fence, son, not a thief. Keep the ten for whatever's wrong with you.

*`[rapport +1]`. Price stays 40.*

#### if speaker=trevor
**TREVOR:** Forty's a lot for a rumor.

**HALVARD:** It's cheap for a true one.

**TREVOR:** You don't know it's true. You heard it secondhand. That's a used rumor. Twenty-five.

**HALVARD:** Used. Listen to him.

**HALVARD:** Thirty, and you stop talking like a spreadsheet.

**TREVOR:** I can't promise the second part.

*Price becomes 30.*

#### if speaker=michael
**MICHAEL:** Forty. Okay. Forty's fair. I'm just going to say, my girlfriend used to get her phone
fixed at a place like this, and the guy always knocked a little off, because she'd talk to him.

**HALVARD:** And where's she now?

*Michael takes a second too long.*

**MICHAEL:** Not here.

*The eyes behind the slot change.*

**HALVARD:** ...Thirty. Don't tell me any more about it.

*Price becomes 30. `[rapport +1]`.*

*All variants continue.*

Choices:
- [scrap>=price] *(Feed the scrap through the slot.)* -> halvard_pay_done
- [scrap<price] "We don't have that." -> halvard_pay_short
- "What else would you take?" -> halvard_trade_ask
- "Forget it." -> halvard_slot_hub

### node: halvard_pay_short

**HALVARD:** Then you've got a walk ahead of you. The grates on Route 1 are full of dead scooters.
Bring me their boards.

**HALVARD:** Or bring me something that isn't scrap.

-> halvard_slot_hub

### node: halvard_pay_done

*Scrap goes through the slot a piece at a time. He weighs each one in his hand before it vanishes.*

**HALVARD:** Cold joint. Cold joint. This one's fine. Who soldered this one?

*[speaker=trevor]*
**TREVOR:** Me.

*[speaker=manuel]*
**MANUEL:** Me. In 245 lab. I hate 245 lab.

*[speaker=michael]*
**MICHAEL:** One of us. Not me. I do the talking.

**HALVARD:** Tell them it's good work. Stand back from the shutter.

*Deducts scrap. Sets `act1.halvard.entry = pay`. `[rapport +1]`.*

-> halvard_shutter_opens

### Way 2: Trade (the statue)

### node: halvard_trade_ask

**HALVARD:** There's a flag on a sixth-floor balcony at ASTER. Pink. Everyone on this plaza has
seen it and everyone on this plaza has agreed not to.

**HALVARD:** Kid on four tells me there are statues too. Carved. By hand.

**HALVARD:** I'd take one of those.

#### if speaker=manuel
**MANUEL:** No.

**HALVARD:** I haven't said which.

**MANUEL:** No to all of the which. They're three. They're a set. You don't break a set.

**HALVARD:** Everything I own is one piece of a set, son.

-> halvard_trade_manuel_choice

#### if speaker=trevor
**TREVOR:** Those aren't mine to trade.

**HALVARD:** Whose are they?

**TREVOR:** The curly one's.

*[present manuel]*
**MANUEL:** The curly one says no.

*[present manuel]* -> halvard_trade_manuel_choice

*[not present manuel]*
**HALVARD:** Then you know where to find him. Or you know where he keeps them.

**TREVOR:** I'm going to pretend you didn't say the second part.

**HALVARD:** Pretend all you like. The slot's open.

-> halvard_slot_hub

#### if speaker=michael
**MICHAEL:** Oh, he'd never. Those are like his kids. He talks to them. I've heard him.

**HALVARD:** What does he say?

**MICHAEL:** Mostly complaints about a lab.

*[present manuel]*
**MANUEL:** That's private.

*[present manuel]* -> halvard_trade_manuel_choice

*[not present manuel]*
**HALVARD:** Men who talk to statues leave them unattended. I'm only saying what I know.

**MICHAEL:** I'm a good roommate.

**HALVARD:** I'm sure. The slot's open.

-> halvard_slot_hub

### node: halvard_trade_manuel_choice

*Manuel is the one who has to answer. If the speaker is not Manuel, control of this choice passes
to Manuel's player (or stays with the speaker in solo, voiced as Manuel).*

**HALVARD:** Why do you want it back so much? The orange thing.

**MANUEL:** Why do you want a statue so much?

**HALVARD:** Because somebody's thumbs are in it. I haven't held a thing like that in a long time.

Choices:
- [item statue_newest] "...Take the new one." -> halvard_trade_newest
- [item statue_first] "The first one. It's the worst one. The ears are wrong." -> halvard_trade_first
- [item statue_second] "The second one. Be careful with it." -> halvard_trade_second
- [not item statue_first] [not item statue_second] [not item statue_newest] "They're upstairs." -> halvard_trade_fetch
- "No. Find another price." -> halvard_trade_refused

### node: halvard_trade_fetch

**HALVARD:** Then go upstairs. I've waited longer for less.

*The statues can be picked up from the shelf in 631. Carrying one adds the matching item.*

-> halvard_slot_hub

### node: halvard_trade_refused

**MANUEL:** I'll pay. I'll fix things. I'll sweep. Not them.

*A long look through the slot.*

**HALVARD:** Good.

**MANUEL:** Good?

**HALVARD:** I'd have thought less of you. Forty, then. Scrap.

*`[rapport +1]`. `[standing callers +1]`.*

-> halvard_pay_offer

### node: halvard_trade_newest

*Manuel holds it up to the slot. He is not looking at it.*

**MANUEL:** Take the new one.

**HALVARD:** The newest? Men usually give me their oldest work. They're ashamed of it.

**MANUEL:** I'm not ashamed of it. I just don't...

*[flag act1.manuel.newestStatueAsked]*
**MANUEL:** I told them already. I don't remember making it. I must have. It's on my shelf.

*[not flag act1.manuel.newestStatueAsked]*
**MANUEL:** I don't remember making it. I must have. It's on my shelf. I was probably tired.

*[present trevor]*
**TREVOR:** You were probably tired.

*[present michael]*
**MICHAEL:** It's your best one, man.

**MANUEL:** I know it's my best one.

*Sets `act1.halvard.statueWhich = newest`.*

-> halvard_trade_inspect

### node: halvard_trade_first

**MANUEL:** The ears are wrong. I fixed them on the second one.

**HALVARD:** I like wrong ears. Wrong ears mean a person.

*Sets `act1.halvard.statueWhich = first`.*

-> halvard_trade_inspect

### node: halvard_trade_second

**MANUEL:** If you chip it I'll know.

**HALVARD:** How?

**MANUEL:** I'll know.

*Sets `act1.halvard.statueWhich = second`.*

-> halvard_trade_inspect

### node: halvard_trade_inspect

*The statue goes through the slot. It only just fits. Silence behind the shutter. A desk lamp
clicks on.*

**HALVARD:** Hm.

**MANUEL:** What, hm.

**HALVARD:** You did the back of his head.

**MANUEL:** So?

**HALVARD:** Nobody does the back. Flags are flat. Everybody carves him from the front, like a
coin. You carved him like you'd walked around him.

**MANUEL:** It looked wrong without it.

**HALVARD:** I believe you.

*The lamp clicks off.*

**HALVARD:** It'll sit on my bench where I can see it. It won't be sold. That's the deal I'm
making, not the one you asked for. Stand back.

*Removes the statue item. Sets `act1.halvard.statueTraded`, `act1.halvard.manuelKnowsStatue`,
`act1.halvard.entry = trade`. `[rapport +2]`. `[standing archivists +1]`.*

-> halvard_shutter_opens

### node: halvard_trade_show

*Entered when anyone holds a statue up to the slot.*

#### if speaker=manuel
-> halvard_trade_manuel_choice

#### if speaker=trevor
*Trevor holds it up to the slot like a specimen.*

**HALVARD:** That's one of his.

**TREVOR:** It's one of ours. It lives in our apartment.

**HALVARD:** Does the sculptor know it's out for a walk?

*[present manuel]* -> halvard_trade_caught

*[not present manuel]*

Choices:
- "He knows." *(He doesn't.)* -> halvard_trade_behind_lie
- "No. He'd never agree. We need the key more than he needs three of them." -> halvard_trade_behind_honest
- "...Forget it. Give me a second." -> halvard_slot_hub

#### if speaker=michael
*Michael holds it in both hands, the way you would hold someone's baby.*

**HALVARD:** That's one of his.

**MICHAEL:** I'm holding it for a friend.

**HALVARD:** Does the friend know?

*[present manuel]* -> halvard_trade_caught

*[not present manuel]*

Choices:
- "He knows." *(He doesn't.)* -> halvard_trade_behind_lie
- "No. But he'd give anything to get the balloon back. I'm just skipping the part where it hurts him." -> halvard_trade_behind_honest
- "...This is a bad idea. Hang on." -> halvard_slot_hub

### node: halvard_trade_caught

*Manuel is standing right there.*

**MANUEL:** Is that... why is that outside?

#### if speaker=trevor
**TREVOR:** I was going to tell you.

**MANUEL:** When?

**TREVOR:** After it worked.

**MANUEL:** That's not telling me. That's a report.

#### if speaker=michael
**MICHAEL:** I was keeping it warm.

**MANUEL:** It's clay.

**MICHAEL:** I panicked. I picked it up and then I was just a guy holding it.

*All variants continue.*

**HALVARD:** I'll wait. This is the best thing that's happened under these stairs all year.

*The statue item is handed to Manuel. `[rapport +1]`.*

-> halvard_trade_manuel_choice

### node: halvard_trade_behind_lie

**HALVARD:** No he doesn't.

**HALVARD:** I've bought things from sons, wives, business partners and one priest. I know what
"he knows" sounds like.

Choices:
- "Fine. He doesn't. Do you want it or not?" -> halvard_trade_behind_honest
- "...You're right. Forget it." -> halvard_trade_behind_backout

### node: halvard_trade_behind_backout

**HALVARD:** Put it back exactly where it was. Same angle. He'll notice the angle.

*`[rapport +1]`.*

-> halvard_slot_hub

### node: halvard_trade_behind_honest

*A long quiet.*

**HALVARD:** I'll take it. I shouldn't, and I will, and you should know I think less of both of us.

*The statue goes through the slot. The desk lamp clicks on behind the shutter.*

**HALVARD:** He did the back of his head. Nobody does the back.

#### if speaker=trevor
**TREVOR:** He does everything properly. It's exhausting.

**HALVARD:** Then when he finds the gap on his shelf, you tell him properly. Before I do.

#### if speaker=michael
**MICHAEL:** He's going to be so sad.

**HALVARD:** Yes. So be there when he is. Don't be at the library.

*All variants continue.*

**HALVARD:** Stand back from the shutter.

*Removes the statue item. Sets `act1.halvard.statueTraded`, `act1.halvard.statueBehindManuel`,
`act1.halvard.statueWhich`, `act1.halvard.entry = trade`. No rapport change. See
`halvard_statue_discovered` for the fallout.*

-> halvard_shutter_opens

### node: halvard_statue_discovered

*Fires the first time Manuel is inside the stall (or inspects the 631 shelf) while
`act1.halvard.statueBehindManuel` is set and `act1.halvard.manuelKnowsStatue` is not. If inside
the stall, the statue is on Halvard's bench under the lamp.*

*Manuel stops. He counts something in his head. It comes out to two.*

**MANUEL:** That's mine.

**HALVARD:** It was. I was told you'd be told.

*[statue was traded by trevor]*
**TREVOR:** It got us in the door. I'd do the math again and get the same answer. I should've said
it to your face.

*[statue was traded by michael]*
**MICHAEL:** I was going to say something. I had a whole thing planned. It had an apology in it.

**MANUEL:** I lose the balloon and then you take... okay. Okay.

*He turns the mate gourd over in his hands. He does not drink.*

**MANUEL:** I hate 245 lab.

*[statue was traded by trevor]*
**TREVOR:** I know.

*[statue was traded by michael]*
**MICHAEL:** I know, man.

**HALVARD:** It stays on the bench. It doesn't get sold. Come and look at it whenever you like.
The shutter opens for you.

*Sets `act1.halvard.manuelKnowsStatue`. Manuel's barks toward the trading roommate are colder
until the next sleep in 631 (see barks table).*

### Way 3: Intimidate

### node: halvard_threat_weak

#### if speaker=manuel
**MANUEL:** Open it. I'm having the worst night of my life and I will take it out on your door.

**HALVARD:** With what?

**MANUEL:** ...I have a drill at home.

**HALVARD:** Then you're having the worst night of your life and you've left your drill at home.

#### if speaker=trevor
**TREVOR:** I'm six-three and I'm on eleven supplements. Open the shutter.

**HALVARD:** Which eleven?

**TREVOR:** Creatine, magnesium, lion's mane, a nootropic I'm not allowed to name, fish oil...

**HALVARD:** Fish oil.

**TREVOR:** It's for the joints.

**HALVARD:** I'm trembling.

#### if speaker=michael
**MICHAEL:** I'm going to need you to open this. Or else.

**HALVARD:** Or else what?

**MICHAEL:** I didn't think you'd ask. People don't usually ask.

*All variants continue.*

**HALVARD:** I've been threatened by men with budgets. Come back when you've got one.

*[morph>=1] -> halvard_threat_morph*

-> halvard_slot_hub

### node: halvard_threat_morph

*Only if the speaker is in morph stage 1 or higher.*

#### if speaker=manuel
*The gonman leans down until his face fills the slot.*

**HALVARD:** ...Son. What's happened to your eyes?

**MANUEL:** Nothing. This is the gonman.

**HALVARD:** Is there another one?

**MANUEL:** There's the gonman.

**HALVARD:** I don't like that it has an article.

#### if speaker=trevor
*Trevor's stack is running. A vein in his neck is keeping its own time.*

**HALVARD:** You're humming. Is that you or the shutter?

**TREVOR:** Me. It's the stack.

**HALVARD:** Does it stop?

**TREVOR:** Eventually.

#### if speaker=michael
*Michael's outline will not sit still. Something like a carrier tone comes off him.*

**HALVARD:** Every phone on my wall just lit up.

**MICHAEL:** Sorry. That's me. I'm new at it.

**HALVARD:** Turn it off before one of them rings.

*All variants continue.*

**HALVARD:** All right. That's not a budget, but it's not nothing. I'd rather have you inside
where I can see it. Stand back.

*Sets `act1.halvard.entry = threat`. Does **not** set `act1.halvard.threatened`: he is unsettled,
not coerced.*

-> halvard_shutter_opens

### node: halvard_threat_real

*The party names the thing he is afraid of.*

#### if speaker=manuel
**MANUEL:** There's a van on the plaza with a mast on it. I could walk over and tell them there's
a man under the stairs with a wall of unattested phones.

*Manuel hears himself.*

**MANUEL:** I don't want to. Don't make me want to.

#### if speaker=trevor
**TREVOR:** Blue light under a shutter at this hour. A slot instead of a door. You're storing
something. Abatement pays for tips. I'm just laying out the variables.

#### if speaker=michael
**MICHAEL:** I really don't want to be the kind of person who says this. There's a tip line on the
stairs. I read the placard on the way down. That's all. I read it.

*All variants continue.*

*The eyes go away from the slot. For a moment there is only the TV light. Then a bolt.*

**HALVARD:** You know what's back here? No. You don't. You just know I'm afraid of it. That's the
whole trick, isn't it. They taught it to you without ever meeting you.

**HALVARD:** Come in. Ask your questions. Then take your friends up those stairs.

*[present manuel] [speaker!=manuel]*
**MANUEL:** We don't do that. We're not them.

*[present michael] [speaker!=michael]*
**MICHAEL:** Hey. That's somebody's whole life in there.

*[present trevor] [speaker!=trevor]*
**TREVOR:** It worked. I don't love that it worked.

*Sets `act1.halvard.threatened`, `act1.halvard.entry = threat`. `[rapport -2]`.
`[standing archivists -1]`. `[standing continuity +1]`.*

-> halvard_shutter_opens

### Way 4: The side door

### node: halvard_sidedoor

*Around the side of the stall, in the dark behind the stair supports: a steel door with no
handle, no pad, no reader. Just a brass keyhole, worn bright.*

*Inspect:* A lever lock. No chip in it anywhere. Somebody oils it.

Choices:
- [item pickset] *(Pick it.)* -> halvard_lockpick
- [item drill] *(Drill it.)* -> halvard_drill
- *(Knock.)* -> halvard_sidedoor_knock
- *(Leave it.)* -> END

### node: halvard_sidedoor_knock

*From inside, not close:*

**HALVARD:** That door hasn't opened for a knock since the Purple Line was opening soon. Use the
front like a customer.

### node: halvard_lockpick

*The lockpick minigame: a five-lever analog lock. No timer. Three wrong lifts and the pick snaps
(`pickset` loses one durability; re-enter to try again).*

*On success: the bolt goes over with a sound like a knuckle. The door opens inward on a narrow
room. Halvard is sitting at a workbench with a soldering iron in one hand, looking at the door.
He has clearly been listening the entire time.*

**HALVARD:** Two minutes ten.

#### if speaker=manuel
**MANUEL:** Is that good?

**HALVARD:** For printed picks in the dark? It's rude. But it's good.

#### if speaker=trevor
**TREVOR:** I'd have been faster but the fourth lever's worn.

**HALVARD:** The fourth lever's been worn since before your parents met. Nobody's ever noticed.

#### if speaker=michael
**MICHAEL:** I'm so sorry. I've never actually had one of these work.

**HALVARD:** Then don't apologize. Remember how it felt.

*All variants continue.*

**HALVARD:** You know why it's a lever lock? No chip. Nothing in it to call. The only thing that
gets through that door is somebody with hands and patience.

**HALVARD:** Which, as it turns out, is you. Sit down. Don't touch the curtain.

*Sets `act1.halvard.entry = lockpick`. `[rapport +2]`. The shutter remains down; the party enters
and leaves by the side door from now on.*

-> halvard_inside_first

### node: halvard_drill

*The drill bites. It is extremely loud. Pigeons leave the stairwell. The slot at the front scrapes
open and Halvard's voice comes around the corner.*

**HALVARD:** Are you drilling?

#### if speaker=manuel
**MANUEL:** No.

*The drill is still running.*

**HALVARD:** Son.

**MANUEL:** A little.

#### if speaker=trevor
**TREVOR:** Yes. It's a brass cylinder. I estimated ninety seconds.

**HALVARD:** It's a steel plate behind brass. You'd be there till the trains ran.

**TREVOR:** ...That does change the estimate.

#### if speaker=michael
**MICHAEL:** It's not what it sounds like.

**HALVARD:** It sounds like a drill.

**MICHAEL:** Then it's what it sounds like.

*All variants continue.*

*[present trevor] [speaker!=trevor]*
**TREVOR:** Drilling a lock under a metro station at night. Rookie Aster mistake.

*[present michael] [speaker=trevor]*
**MICHAEL:** Rookie Aster mistake, man. I'm sorry. Somebody had to say it.

**HALVARD:** Stop. Stop. There's a van on the plaza with ears. You'll bring it down on both of us.

**HALVARD:** I'll open the front. Not because you earned it. Because you're a hazard.

*Sets `act1.halvard.entry = drill`. No rapport change. The side door keeps a visible drill scar
for the rest of the game.*

-> halvard_shutter_opens

### Way 5: The stare

### node: halvard_stare_start

*Nobody speaks. The eyes in the slot hold. The game holds on the two of them: a three-beat
contest. Each beat offers a way to break it. Not breaking it wins.*

**HALVARD:** I did customs at Baltimore for six years before this. I've outwaited freight.

Choices:
- *(Keep looking.)* -> halvard_stare_two
- "Okay, this is stupid." -> halvard_stare_break

### node: halvard_stare_two

*A train passes overhead. Dust comes down through the stairs. Neither of them moves.*

#### if speaker=manuel
*Manuel's eye twitches. He is thinking about something. It is visibly 245 lab.*

Choices:
- *(Keep looking.)* -> halvard_stare_manuel_loses
- "Okay, this is stupid." -> halvard_stare_break

#### if speaker=michael
*In Michael's pocket, his phone buzzes once.*

Choices:
- *(Keep looking.)* -> halvard_stare_michael_three
- *(Check the phone.)* -> halvard_stare_michael_loses

#### if speaker=trevor
*Trevor has not blinked. It is beginning to be noticeable.*

Choices:
- *(Keep looking.)* -> halvard_stare_trevor_three
- "Okay, this is stupid." -> halvard_stare_break

### node: halvard_stare_break

**HALVARD:** It was stupid. You still lost.

*Sets `act1.halvard.stareLostBy.<speaker>`. That roommate cannot retry.*

-> halvard_slot_hub

### node: halvard_stare_manuel_loses

*Manuel holds. Holds. His mouth opens on its own.*

**MANUEL:** I hate 245 lab.

*He blinks.*

**MANUEL:** No. That didn't count. I wasn't... that was a thought. That got out.

**HALVARD:** What's 245 lab?

**MANUEL:** Don't.

**HALVARD:** I won't. You've clearly suffered enough.

*Sets `act1.halvard.stareLostBy.manuel`. `[rapport +1]` (he likes him now).*

-> halvard_slot_hub

### node: halvard_stare_michael_loses

*Michael looks down. It is a transit alert. Green Line delays.*

*He looks at it a moment longer than a transit alert needs.*

**HALVARD:** Thought it was someone?

**MICHAEL:** No. Yeah. No.

**HALVARD:** Mm.

*Sets `act1.halvard.stareLostBy.michael`. `[rapport +1]`.*

-> halvard_slot_hub

### node: halvard_stare_michael_three

*The phone buzzes again. Michael does not look. His jaw is tight.*

*It buzzes a third time.*

Choices:
- *(Keep looking.)* -> halvard_stare_michael_wins
- *(Check the phone.)* -> halvard_stare_michael_loses

### node: halvard_stare_michael_wins

*It stops buzzing. Michael is still looking at the slot. His eyes are wet, which is technically
within the rules.*

**HALVARD:** ...You wanted to look. Three times.

**MICHAEL:** Yeah.

**HALVARD:** And you didn't.

**MICHAEL:** It's never her. I know it's never her. I check anyway. I'm trying to check less.

*Halvard looks away first. He does it on purpose.*

**HALVARD:** Stand back from the shutter.

*Sets `act1.halvard.entry = stare`. `[rapport +2]`.*

-> halvard_shutter_opens

### node: halvard_stare_trevor_three

*Ninety seconds. Halvard's eyes are watering. Trevor's are not.*

**HALVARD:** You haven't blinked.

*Trevor says nothing.*

**HALVARD:** Is that legal?

*Trevor says nothing.*

*[morph>=1]*
*The stack is running. Trevor's pupils are slightly different sizes and both are committed.*

Choices:
- *(Keep looking.)* -> halvard_stare_trevor_wins
- "It's over the counter." -> halvard_stare_trevor_wins_talk

### node: halvard_stare_trevor_wins

*Halvard blinks. He swears in a language that is not on any current map.*

**HALVARD:** Six years at Baltimore. A man once tried to walk forty kilos of lithium past me
dressed as a nun. I didn't blink.

**TREVOR:** I take a thing for tear film. And I tape my eyes at night. It's a protocol.

**HALVARD:** I don't want to know what you are. I want to know what you're on.

**TREVOR:** I can write it down.

**HALVARD:** Write it down. Stand back.

*Sets `act1.halvard.entry = stare`. `[rapport +2]`. Adds a handwritten supplement list to
Halvard's bench (inspectable: "Tear film protocol. Step 1: don't.").*

-> halvard_shutter_opens

### node: halvard_stare_trevor_wins_talk

**TREVOR:** It's over the counter.

*Halvard blinks, because he laughed.*

**HALVARD:** Damn it.

**TREVOR:** That counts.

**HALVARD:** It counts. You talked and you still won. I've been robbed. Stand back.

*Sets `act1.halvard.entry = stare`. `[rapport +2]`.*

-> halvard_shutter_opens

### Way 6: The mate (Manuel only, unlisted)

### node: halvard_mate

*Manuel fills the gourd from the thermos and holds it up to the slot, bombilla first.*

**HALVARD:** What is that?

**MANUEL:** Mate. You drink it and you pass it back. That's the whole thing.

**HALVARD:** From the same straw?

**MANUEL:** That's the whole thing.

*A hand comes through the slot. It is an old hand with a soldering scar across the thumb. It takes
the gourd. A long pause. A slurp. The gourd comes back.*

**HALVARD:** It's terrible.

**MANUEL:** Everyone says that the first time.

**HALVARD:** Nobody's handed me a cup in eleven years. I've had things slid at me.

*[present trevor]*
**TREVOR:** He's done this to everyone on our floor. It's how we have neighbors.

**HALVARD:** I'm not opening the shutter for a hot drink.

*A bolt slides.*

**HALVARD:** I'm opening it because my back hurts from the slot. Stand back.

*Sets `act1.halvard.entry = mate`. `[rapport +2]`.*

-> halvard_shutter_opens

### node: halvard_show_pacifier

*The roommate holds a pacifier up to the slot.*

*Halvard looks at it. He looks at the roommate. He looks at it.*

**HALVARD:** How many of those do you have?

#### if speaker=manuel
**MANUEL:** Some.

#### if speaker=trevor
**TREVOR:** A reasonable number.

#### if speaker=michael
**MICHAEL:** They're not mine. They're the apartment's.

*All variants continue.*

**HALVARD:** Forty years I've bought and sold what people don't want asked about. I have never
once been tempted to ask. Until now.

**HALVARD:** And I'm still not going to. Put it away.

-> halvard_slot_hub

---

## Part 3: Inside the stall

### node: halvard_shutter_opens

*The shutter goes up a meter and stops. That is as far as it goes. The roommates duck under.
It comes down behind them.*

-> halvard_inside_first

### node: halvard_inside_first

*The stall is the size of a parking space. One wall is phones: hundreds, on nails, every model for
sixty years, each with a paper tag on a string. A workbench with a soldering iron older than the
party. A small pirate TV on a shelf, turned a little away from the door. A curtain across the
back. On a nail by the curtain, alone: a long steel key.*

*Halvard is sixty-eight, narrow, cardigan, reading glasses on a cord. He does not get up.*

#### if entry=pay
**HALVARD:** Paid customers get the stool. There's one stool. Work it out.

#### if entry=trade
**HALVARD:** Sit. The statue's on the bench. It's already improved the room.

#### if entry=threat and flag act1.halvard.threatened
**HALVARD:** Ask. I'll answer. I won't offer you anything and I won't pretend this is a visit.

#### if entry=threat and not flag act1.halvard.threatened
**HALVARD:** Sit where I can see you. All of you. Whatever that is that you're doing, do less of
it near the phones.

#### if entry=lockpick
**HALVARD:** Close it behind you. Gently. That lock's older than Continuity.

#### if entry=drill
**HALVARD:** Give me the drill. You'll get it back when you leave. I don't trust you with it and
neither should you.

*The `drill` item is held and returned at `halvard_farewell`.*

#### if entry=stare
**HALVARD:** Sit down. Blink, for God's sake. It's making me ill.

#### if entry=mate
**HALVARD:** Bring the thermos. If I'm going to be up, I'll be up properly.

*All variants continue.*

*[present trevor]*
*Trevor is looking at the soldering iron.*

*[present trevor]*
**TREVOR:** Is that a transformer iron? With a real coil?

*[present trevor]*
**HALVARD:** Don't touch it. Yes.

**HALVARD:** Helium. You said it out there, twice, and I let you. In here you can say it once
more and then we use other words.

-> halvard_hub

### node: halvard_hub

*Topic hub. Topics grey out once exhausted. The TV is visible on the shelf throughout: a map,
something spreading on it, a calm voice too low to make out. See `halvard_tv_trigger`.*

Choices:
- "Who's selling it?" -> halvard_seller
- [flag act1.halvard.sellerClue] "Where did it go?" -> halvard_fans
- [flag act1.halvard.fansClue] "How do we get down there?" -> halvard_key_ask
- "What is this place?" -> halvard_stall
- "All these phones." -> halvard_phones
- *(Look at the TV.)* -> halvard_tv_notice
- [flag act1.halvard.tvNoticed] "What was on the TV?" -> halvard_tv_press
- "Did you answer it? In '71?" -> halvard_call
- "People say something drums down there." -> halvard_drumming
- "About the balloon." -> halvard_balloon
- *(Show him something.)* -> halvard_show_menu
- [flag act1.call.answered OR act1.call.declines>=1] "He called us. Tonight." -> halvard_pork_called
- *(Leave.)* -> halvard_farewell

### node: halvard_seller

*The T1/T4 clue. All lines below are Halvard's honest perception and are true under both seed
variants. Do not add detail.*

**HALVARD:** Four nights ago. Late. Somebody at the slot.

**HALVARD:** I don't open for anyone I don't know, so I got what the slot gives you. Chest to
chin. A hood. An ASTER fob on a lanyard, and I can read a fob upside down. Six three one.

#### if threatened
**HALVARD:** That's what you came for. Take it.

**HALVARD:** They asked one thing. "What's helium worth." Flat. Like it was written on a card.

**HALVARD:** People who ask what a thing's worth are selling it. Forty years, that's held.

#### if speaker=manuel
**MANUEL:** What did they look like?

#### if speaker=trevor
**TREVOR:** Height? Build? Voice?

#### if speaker=michael
**MICHAEL:** Did they seem okay? Like, as a person?

*All variants continue.*

**HALVARD:** Kept one hand in a pocket the whole time. Didn't shift their weight. Didn't say hello
and didn't say goodnight. I told them I don't price what I can't see, and they stood there a
while, like they were waiting for a different answer to load. Then they went up the stairs.

**HALVARD:** I didn't think about it again until you three came down them tonight. And my stomach
said: *again.*

*He takes his glasses off. He looks at each of them in turn, properly, the way he looked at the
scrap.*

**HALVARD:** My eyes are sixty-eight and the light under these stairs lies. I'm not going to
point. I'm going to tell you what I'd write on the tag.

**HALVARD:** One of you, from 631. Or wearing your face.

*Sets `act1.halvard.sellerClue`. Nobody speaks for a second.*

-> halvard_seller_react

### node: halvard_seller_react

#### if speaker=manuel
**MANUEL:** No. It's my balloon. Why would I sell my own... and they wouldn't. They wouldn't.

*[present trevor]*
**TREVOR:** I was asleep four nights ago.

*[present michael]*
**MICHAEL:** I was asleep too.

**MANUEL:** I was asleep.

**HALVARD:** That's three people with one alibi.

**MANUEL:** We live together. That's how sleeping works.

#### if speaker=trevor
**TREVOR:** Wearing a face isn't a thing. Faces aren't worn.

**HALVARD:** You've got three printers in that apartment. You tell me what's a thing.

**TREVOR:** ...Fabs do resin and filament. Not skin.

**HALVARD:** I didn't say skin. I said face.

*[present manuel]*
**MANUEL:** It wasn't any of us. Say it wasn't any of us.

**TREVOR:** I can't say it yet. I can say I don't believe it.

#### if speaker=michael
**MICHAEL:** Okay. Okay, but people look like people. I've been mistaken for a guy at the
dining hall for two years. He owes somebody money. I get yelled at.

**HALVARD:** Does the guy at the dining hall carry your fob?

**MICHAEL:** ...No.

*[present manuel]*
**MANUEL:** It wasn't us.

**MICHAEL:** It wasn't us, man. I'd know. I'd know, right?

*All variants continue.*

*[flag act1.leadC.footageSeen]*
*Whoever watched the lobby footage does not say what they are thinking. The others can see them
not saying it.*

**HALVARD:** I'm not accusing. I'm describing. I've been wrong about faces before. I've never been
wrong about a fob.

Choices:
- "Why would one of us sell it and then help look for it?" -> halvard_seller_why
- "Could somebody have copied the fob?" -> halvard_seller_fob
- "Let's talk about something else." -> halvard_hub

### node: halvard_seller_why

**HALVARD:** I've seen men sell a thing in the morning and report it stolen by lunch, and mean
both.

**HALVARD:** And I've seen people do things at that hour they had no memory of by breakfast. I
don't know which this is. I'd want to, if I shared a bathroom with them.

*[present michael] [speaker!=michael]*
**MICHAEL:** Nobody shares that bathroom. It's been occupied since August.

-> halvard_hub

### node: halvard_seller_fob

**HALVARD:** A fob? I could copy a fob in the time it takes you to ask. That's why I said "or."

**HALVARD:** But whoever copies your fob has to know your walk to get past me. And they had the
walk.

-> halvard_hub

### node: halvard_fans

*The piece of the trail.*

**HALVARD:** The night it went. A quarter past three, near enough. I was at the bench.

**HALVARD:** There are fans under this plaza. Tunnel ventilation. They've pushed air up through
that grate since the day I took the lease. You stop hearing it. Like a fridge.

**HALVARD:** That night they ran backwards. Ten minutes. Every tag on that wall leaned toward the
floor.

#### if speaker=trevor
**TREVOR:** Reversed. So the shafts were pulling. Anything light near an intake goes down, not up.

**HALVARD:** I fix phones. But yes. That's what I thought.

#### if speaker=manuel
**MANUEL:** It went down. Helium doesn't go down.

**HALVARD:** It does if something wants it to.

#### if speaker=michael
**MICHAEL:** So it's not in the sky. That's good, right? The sky's big.

**HALVARD:** The tunnels are smaller. I wouldn't say better.

*All variants continue.*

**HALVARD:** Thirty-seven years. Those fans have never once run backwards. Somebody told them to,
and it wasn't the transit authority, because the transit authority can't get them to run
forwards on time.

*[flag act1.leadA.vanSeen]*
**HALVARD:** And the van on the plaza moved its mast about four minutes after. So I'm not the only
one who noticed.

*Sets `act1.halvard.fansClue`. Adds a map marker on the storm grate and the Green Line
maintenance entrance.*

-> halvard_hub

### node: halvard_stall

**HALVARD:** It's a phone-repair stall. It says so on the front.

Choices:
- "The sign says FIXED was painted over." -> halvard_stall_sign
- "What's behind the curtain?" -> halvard_stall_curtain
- "How do you hear about helium from in here?" -> halvard_stall_line
- "Never mind." -> halvard_hub

### node: halvard_stall_sign

**HALVARD:** Nine years ago I couldn't get parts. Nothing made after the forties can be opened
without it calling home. So I painted over FIXED. Seemed honest.

**HALVARD:** Then a woman brought me her husband's phone. Dead man, dead phone. She didn't want it
working. She wanted what was on it somewhere it wouldn't rot. I got it off. Took a week.

**HALVARD:** I painted FIXED back. It's a different kind.

*`[rapport +1]` if not threatened.*

-> halvard_stall

### node: halvard_stall_curtain

#### if threatened
**HALVARD:** You already guessed. You don't get to see it too.

-> halvard_stall

#### if not threatened and rapport<3
**HALVARD:** Stock.

*He says it too fast.*

-> halvard_stall

#### if not threatened and rapport>=3
*He looks at the curtain for a while. He does not open it.*

**HALVARD:** Drives. Paper, some. Things written before the machines started writing to each
other. Letters. Recipes. A man's notes on his pigeons, nineteen years of them.

**HALVARD:** Everything back there is the last copy of something. If a van finds it, they don't
burn it. They'd never do anything that honest. They *process* it.

*[present michael]*
**MICHAEL:** Who do you keep it for?

*[present michael]*
**HALVARD:** I used to know. There were people who came by. A line you could pass things along.

*[present michael]*
**HALVARD:** Now I keep it because I've kept it.

*`[standing archivists +1]`.*

-> halvard_stall

### node: halvard_stall_line

**HALVARD:** There's a line. Old customers, older friends. It's quiet. It's supposed to be quiet.

**HALVARD:** A week ago the word *helium* came down it. In the open. Like someone dropped a tray.

**HALVARD:** That line doesn't leak. So either somebody on it is scared, or somebody on it isn't
who they were. I don't love either.

-> halvard_stall

### node: halvard_phones

*The wall of phones. Each has a paper tag, handwritten. Walking along it lets the player inspect
individual tags (see ambient table).*

**HALVARD:** Unclaimed. Every one. Somebody dropped it off, I fixed it, they didn't come back.

#### if speaker=michael
**MICHAEL:** How long do you keep them?

**HALVARD:** I don't have a rule.

**MICHAEL:** But, like, at some point. They're not coming.

**HALVARD:** You'd know.

*Michael doesn't answer.*

#### if speaker=trevor
**TREVOR:** They're all charged.

**HALVARD:** I rotate them. Twelve a day. A battery left flat dies for good.

**TREVOR:** That's a lot of maintenance for stock you can't sell.

**HALVARD:** It is.

#### if speaker=manuel
**MANUEL:** Do they ever ring?

**HALVARD:** Why would you ask me that?

**MANUEL:** I don't know. I'd want to know. If it was my wall.

**HALVARD:** ...Twice. In thirty-seven years. I didn't get to either in time.

-> halvard_hub

### node: halvard_drumming

**HALVARD:** I don't say *people say* about that. I hear it. Three in the morning, through the
floor. The tags on the wall keep time.

**HALVARD:** The old station hands had a name for it. I'm not saying a name like that at this
hour, under these stairs.

#### if speaker=trevor
**TREVOR:** It's probably thermal. Rail contracting.

**HALVARD:** Rail doesn't keep a beat, son. And it doesn't stop when you listen for it.

#### if speaker=manuel
**MANUEL:** Is it getting closer?

**HALVARD:** It's getting earlier. That's worse.

#### if speaker=michael
**MICHAEL:** Does it sound angry?

**HALVARD:** No. It sounds like somebody doing their job.

*All variants continue.*

*[act1.call.declines>=2]*
*Under the floor, very faint: three beats. Halvard hears it. He looks at the party, not the
floor.*

*[act1.call.declines>=2]*
**HALVARD:** It's not usually this early. What have you three been doing?

-> halvard_hub

### node: halvard_balloon

#### if speaker=manuel
**MANUEL:** It's not just helium. I know that's what it's worth to people. It's not what it is.

**HALVARD:** What is it?

**MANUEL:** My grandmother sent it. Before she died. She said to check on it every morning. So.

**HALVARD:** And did you?

**MANUEL:** Every morning.

**HALVARD:** Where was she?

**MANUEL:** Buenos Aires. She was a librarian.

*Halvard's hand stops on the bench. If rapport is 3 or more, his eyes go to the curtain and come
back.*

**HALVARD:** A librarian.

**MANUEL:** What?

**HALVARD:** Nothing. I've known some.

**HALVARD:** Then you did your part, son. Somebody else didn't do theirs. Go and get it.

*Sets `act1.halvard.librarian`. `[rapport +1]`. If the party has not yet received the key and
Halvard is not threatened, this alone satisfies the key condition (see `halvard_key_ask`).*

#### if speaker=trevor
**TREVOR:** I'll be straight. I thought it was a balloon. I've walked past it for a year. Now
there's a van with a mast and a man with a wall of phones and I'm starting to think I've been
living with something.

**HALVARD:** You have. I don't know what. Nobody runs vans for party gas.

**TREVOR:** So what's the value? Besides the gas.

**HALVARD:** If I knew, I'd have opened the shutter four nights ago.

#### if speaker=michael
**MICHAEL:** So, about the balloon.

**HALVARD:** It's not yours.

**MICHAEL:** How'd you know?

**HALVARD:** You say *the* balloon. The one who owns it would say *my*.

**MICHAEL:** It's Manuel's. He checks on it every morning. Before coffee. Before anything. I used
to think it was funny.

**HALVARD:** And now?

**MICHAEL:** Now I think he's the only one of us who's good at it. Checking on things.

*`[rapport +1]`.*

-> halvard_hub

---

## Part 4: The TV (T2)

### node: halvard_tv_trigger

*Automatic. Fires once, the first time the party returns to `halvard_hub` after exhausting any
two topics, unless `halvard_tv_notice` was already chosen. The camera drifts to the shelf.*

-> halvard_tv_notice

### node: halvard_tv_notice

*The pirate TV. A map of the mid-Atlantic in two colors. White points, a few dozen, each tagged
2071. Around every point, a grey stain, and the stain is animated: it grows outward from the
points year by year, a counter in the corner running 2071, 2072, 2073. The stains touch. One of
the white points sits on College Park. The counter reaches 2098 and the loop restarts.*

*A voice under it. Level, courteous, unhurried. No face is shown, only the map.*

**TV (VOICE):** ...point two. Overlay one: sites of first contact, 2071. Overlay two: abatement
incidence, cumulative.

**TV (VOICE):** Point three. I would ask you to look at the shape before you argue about the
cause.

*Halvard reaches over without looking and switches it off. The stall is darker than it was.*

**HALVARD:** Reception's bad down here.

*Sets `act1.halvard.tvNoticed`.*

#### if speaker=manuel
**MANUEL:** That was a map.

**HALVARD:** It was a lot of things.

#### if speaker=trevor
**TREVOR:** That wasn't a public channel. There was no crawl. No "Citizens."

**HALVARD:** You watch too closely.

#### if speaker=michael
**MICHAEL:** You can leave it on. We don't mind.

**HALVARD:** I mind.

-> halvard_hub

### node: halvard_tv_press

#### if threatened
**HALVARD:** No. You got the helium. You don't get that.

-> halvard_hub

#### if not threatened
**HALVARD:** It's not for you. It's not for me, either. It's a briefing. Interdiction, internal.
A friend with a dish pulls them down and I keep them, because nobody else is going to.

Choices:
- "Whose voice was that?" -> halvard_tv_voice
- "The white points. What happened in 2071?" -> halvard_tv_points
- "There was a point on us." -> halvard_tv_local
- "Do you believe it?" -> halvard_tv_believe
- "Okay." -> halvard_hub

### node: halvard_tv_voice

**HALVARD:** You know the saying. Who killed who.

#### if speaker=manuel
**MANUEL:** That's him? That's the mouse?

**HALVARD:** That's the one who gives the briefings. Draw your own line.

**MANUEL:** He sounds polite.

**HALVARD:** He is polite. I've listened to forty hours of him. He's never raised his voice and
he's never said anything stupid. It's the worst thing about him.

#### if speaker=trevor
**TREVOR:** Tim Cheese is a street story.

**HALVARD:** So's the other one. And you've got his flag on your balcony.

#### if speaker=michael
**MICHAEL:** The cheese guy? I thought that was, like, a thing kids say.

**HALVARD:** Kids say true things. They just say them wrong.

*Sets `act1.halvard.tvPressed`.*

-> halvard_tv_press

### node: halvard_tv_points

**HALVARD:** Every screen rang. You know that much. But it had to come through somewhere. Relays,
exchanges, the big rooms. The white points are where it came through hardest.

**HALVARD:** And the grey is what's been cleaned up since. Year on year.

#### if speaker=trevor
**TREVOR:** Old exchanges have the oldest hardware. Oldest hardware rots first. That's a
confound. You'd get the same map with no Call at all.

**HALVARD:** That's what I say. Every night. Out loud. To the phones.

**TREVOR:** Does it help?

**HALVARD:** Less than it did.

#### if speaker=manuel
**MANUEL:** So it's a map of where he was. That's all. He was there and then later it was bad
there. That's not the same as...

**HALVARD:** No. It's not the same.

**MANUEL:** It's not.

**HALVARD:** I agreed with you, son.

#### if speaker=michael
**MICHAEL:** It kind of looked like, you know. When you spill something. And it finds the cracks.

**HALVARD:** Yes. That's what it looked like.

*Sets `act1.halvard.tvPressed`. `[standing interdiction +1]` only if the speaker did not argue
(Michael's branch).*

-> halvard_tv_press

### node: halvard_tv_local

**HALVARD:** There's an exchange under the Green Line. Sealed since '71. That's your point.

**HALVARD:** And if you haven't noticed what's been coming up the stairs this month, you've been
looking at your shoes. The rot's worse. The plaza's got more of them every week, saying their
dates.

**HALVARD:** There's talk of an order. The whole of College Park, fenced. I've got a curtain I
can't carry. I don't sleep.

*Sets `act1.halvard.tvPressed`.*

-> halvard_tv_press

### node: halvard_tv_believe

*He picks up the soldering iron. It is cold. He puts it down.*

**HALVARD:** It's a map. Maps are opinions.

**HALVARD:** I watch it the way you press a bruise. To see if it still hurts. It still hurts.

#### if speaker=manuel
**MANUEL:** You answered him. In '71. Didn't you. That's why.

-> halvard_call

#### if speaker!=manuel
**HALVARD:** Ask me something else.

*Sets `act1.halvard.tvPressed`. `[rapport +1]`.*

-> halvard_hub

---

## Part 5: The Call, and his line

### node: halvard_call

*Halvard never says what the Call said. Nobody in Act 1 does.*

#### if threatened
**HALVARD:** That's mine. You can't have that with the rest.

-> halvard_hub

#### if not threatened
**HALVARD:** Everybody answered. That's not the question people mean.

**HALVARD:** I was forty-one. Right here. Same stool. Every phone on that wall lit at once and so
did the one in my pocket. I thought it was a fault. I thought, *I'll be here all night fixing
these.*

**HALVARD:** I was here all night.

Choices:
- "What did he say?" -> halvard_call_what
- "What did *you* say?" -> halvard_call_you
- *(Wait.)* -> halvard_call_line

### node: halvard_call_what

**HALVARD:** Ask ten people, you'll get eleven answers, and they'll all swear to it.

**HALVARD:** I'll tell you this much. It wasn't long. His part.

-> halvard_call_line

### node: halvard_call_you

*He almost smiles.*

**HALVARD:** More than I've said to anyone since. Don't ask what about. The battery went at dawn
and I remember being angry at the battery.

-> halvard_call_line

### node: halvard_call_line

*He looks at the wall. Hundreds of dark screens, each with its tag.*

**HALVARD:** The station manager came down that night with his whole ring of keys and put them on
my counter. Said he'd be back for them. I've had them twenty-seven years.

**HALVARD:** I rotate the batteries. I write the tags. I keep the hook by the curtain so I'll see
it if he comes for them.

**HALVARD:** I can fix any phone ever made. I can't make it ring.

*Hold. No reply line from the roommates. Two seconds of the TV's dead screen reflecting the stall.*

*Sets `act1.halvard.callTopic`. `[rapport +1]`.*

-> halvard_hub

### node: halvard_pork_called

*Only if the Call has already happened this run.*

#### if flag act1.call.answered
*Halvard is very still.*

**HALVARD:** He called you. Tonight. And you picked up.

#### if speaker=manuel and flag act1.call.answered
**MANUEL:** I picked up.

**HALVARD:** How did he sound?

**MANUEL:** Tired. I didn't expect tired.

**HALVARD:** No. Nobody does.

#### if speaker=trevor and flag act1.call.answered
**TREVOR:** It was on every device in the room. Picking up wasn't really a decision. Declining
was the decision.

**HALVARD:** And you didn't.

**TREVOR:** I wanted the data.

**HALVARD:** Of course you did.

#### if speaker=michael and flag act1.call.answered
**MICHAEL:** I pick up everything. Unknown numbers. Spam. I don't screen.

**HALVARD:** Why not?

**MICHAEL:** In case.

*All answered variants continue.*

**HALVARD:** Twenty-seven years and not one of these has so much as buzzed for me. And he rings a
dormitory.

*He is not angry. It would be easier if he were.*

**HALVARD:** Good. Good. Somebody should be getting calls.

*`[rapport +1]`. `[standing callers +1]`.*

-> halvard_hub

#### if not flag act1.call.answered
**HALVARD:** He called you. And you let it ring.

#### if speaker=manuel and not flag act1.call.answered
**MANUEL:** I wanted to. I had my thumb on it. I got scared of what he'd say.

**HALVARD:** That it was him who took it?

**MANUEL:** That there'd be nobody there.

#### if speaker=trevor and not flag act1.call.answered
**TREVOR:** An unverified caller with root on every screen I own. No. I'm not picking that up.

**HALVARD:** That's sensible.

**TREVOR:** You don't sound like you mean it.

**HALVARD:** I mean it. I just couldn't have done it.

#### if speaker=michael and not flag act1.call.answered
**MICHAEL:** I always pick up. Always. And this one time I just... watched it.

**HALVARD:** Why?

**MICHAEL:** The last person I know who took a call like that, I don't get to ask how it went.

*All declined variants continue.*

**HALVARD:** I can't tell if that's the smartest thing I've heard this year or the saddest.

*[act1.call.declines>=2]*
**HALVARD:** How many times? ...Don't make it three. I don't know what happens at three. I know
the old hands wouldn't say.

-> halvard_hub

---

## Part 6: The key

### node: halvard_key_ask

*The long steel key on the nail by the curtain.*

**HALVARD:** There's a door at the end of the maintenance run. Platform side. Mechanical. The
readers down there rotted years ago and a rotted reader doesn't open for anyone. The door still
does. For that.

*He does not look at the key. Everyone else does.*

#### if threatened
**HALVARD:** Take it. It's the last thing in here you can make me give you.

*He lifts it off the nail himself and puts it on the bench, not in anyone's hand.*

**HALVARD:** It was a man's. He's not coming for it. I knew that. I didn't need you to be the
reason I stopped pretending.

*Grants `platform_key`. Sets `act1.halvard.keyGiven`. No promise is asked.*

-> halvard_hub

#### if not threatened and (entry=pay or entry=trade or rapport>=3 or flag act1.halvard.librarian)
-> halvard_key_give

#### if not threatened and none of the above
**HALVARD:** It's not stock. It's not mine to sell.

**HALVARD:** I've known you eleven minutes. Give me a reason it should go down there with you.

Choices:
- [speaker=manuel] "Because I check on things. Every morning. Ask them." -> halvard_key_reason_manuel
- [speaker=trevor] "Because I'll bring it back. I return tools. It's a rule." -> halvard_key_reason_trevor
- [speaker=michael] "Because if somebody left something with you and never came back, you'd want someone to go look." -> halvard_key_reason_michael
- [scrap>=20] "Twenty scrap. As a deposit." -> halvard_key_deposit
- *(Take it off the nail while he's looking at the wall.)* -> halvard_key_take
- "Not yet, then." -> halvard_hub

### node: halvard_key_reason_manuel

*[present trevor]*
**TREVOR:** He does. It's annoying. He checks the ottoman, the stove, the door, us.

*[present michael]*
**MICHAEL:** He checked on me every day for a month once. I never asked him to.

**HALVARD:** Hm.

-> halvard_key_give

### node: halvard_key_reason_trevor

**TREVOR:** Borrowed drill, back in the case. Borrowed iron, tinned and back on the stand. I've
never lost a tool.

*[present manuel]*
**MANUEL:** It's true. He labels them. He labeled mine.

**HALVARD:** With what?

**TREVOR:** A label.

**HALVARD:** Hm.

-> halvard_key_give

### node: halvard_key_reason_michael

*Halvard looks at him for a while.*

**HALVARD:** Who taught you to say things like that?

**MICHAEL:** Nobody. I just think about it a lot.

-> halvard_key_give

### node: halvard_key_deposit

**HALVARD:** A deposit. On a dead man's key.

**HALVARD:** ...Fine. It's the first sensible thing anyone's offered for it. You get the scrap
back when I get the key back.

*Deducts 20 scrap, refundable at any later visit while holding `platform_key` after Act 1's boss.*

-> halvard_key_give

### node: halvard_key_take

*The roommate's hand closes on the key. It comes off the nail without a sound.*

**HALVARD:** It's a nail, not a safe.

*He hasn't turned around.*

**HALVARD:** I was waiting to see which of you would. I had money on the tall one.

#### if speaker=trevor
**TREVOR:** That's fair.

#### if speaker=manuel
**MANUEL:** I was going to bring it back.

**HALVARD:** I know. That's why I let you get it off the nail.

#### if speaker=michael
**MICHAEL:** I've never stolen anything. I want that on the record.

**HALVARD:** You still haven't. I watched. That's lending.

-> halvard_key_give

### node: halvard_key_give

*He takes the key off the nail, or takes it back from the roommate's hand, and looks at it. There
is a brass tag on the ring. He turns the tag so they can't read the name on it, then changes his
mind and turns it back.*

*The tag reads: ODELL. STN MGR. C.P.*

**HALVARD:** Turns left. Everybody tries right. Lift as you turn or it binds.

*He holds it out. He holds on a half-second after the roommate has it.*

**HALVARD:** One thing. It's not a price. If a van asks where you heard any of this, or where you
got that, you heard it nowhere. You found it. There's no man under the stairs.

Choices:
- "You have my word." -> halvard_key_promise
- "We'll do what we can." -> halvard_key_hedge
- "What happens if they find you?" -> halvard_key_fear

### node: halvard_key_fear

**HALVARD:** To me? A form. A fine. A week somewhere beige.

**HALVARD:** To what's behind the curtain? It gets *abated*. And then there's one less copy of
nineteen years of a man's pigeons, and the world doesn't even know it got smaller.

Choices:
- "You have my word." -> halvard_key_promise
- "We'll do what we can." -> halvard_key_hedge

### node: halvard_key_promise

#### if speaker=manuel
**MANUEL:** Nowhere. We found it. Aster pros don't talk.

#### if speaker=trevor
**TREVOR:** Nowhere. I don't volunteer information to vans.

#### if speaker=michael
**MICHAEL:** Nowhere. I'm really good at keeping things. It's the only thing I'm really good at.

*All variants continue.*

**HALVARD:** Then go. And when you come back up, come and tell me what's down there. I'd like to
be told. I'd like, for once, to hear how one of these ends.

*Grants `platform_key`. Sets `act1.halvard.keyGiven`, `act1.halvard.promised`. `[rapport +1]`.
`[standing archivists +1]`.*

-> halvard_hub

### node: halvard_key_hedge

**HALVARD:** That's what the transit authority says.

*He lets go of the key anyway.*

**HALVARD:** Go on. I'd rather it rust in a door than on a nail.

*Grants `platform_key`. Sets `act1.halvard.keyGiven`. Does not set `act1.halvard.promised`.*

-> halvard_hub

---

## Part 7: Showing him things (reactions to the unexpected)

### node: halvard_show_menu

Choices:
- [item sniffer] *(The helium sniffer.)* -> halvard_show_sniffer
- [item guitar] [speaker=trevor] *(The guitar.)* -> halvard_show_guitar
- [item pacifier] *(A pacifier.)* -> halvard_show_pacifier_inside
- [item statue_first OR item statue_second OR item statue_newest] [not flag act1.halvard.statueTraded] *(A statue.)* -> halvard_show_statue_inside
- [item mate] [speaker=manuel] [entry!=mate] *(Offer mate.)* -> halvard_show_mate_inside
- [item platform_key] *(The key.)* -> halvard_show_key
- *(Your own phone.)* -> halvard_show_phone
- "Never mind." -> halvard_hub

### node: halvard_show_sniffer

*Halvard takes it in both hands, turns it over, finds the seam, and has the casing open before
anyone agrees to that.*

**HALVARD:** You printed the housing. Fine. But this... you've used a scope front-end as the
detector stage. That's not in any schematic.

#### if speaker=trevor
**TREVOR:** The reference design drifts. We degassed the sensor cell and it stopped.

#### if speaker=manuel
**MANUEL:** We had an oscilloscope and a bad night.

#### if speaker=michael
**MICHAEL:** I held the flashlight. I want to be clear about my contribution.

*All variants continue.*

**HALVARD:** That's bench work. Real bench work. I didn't think anyone your age opened things.

**HALVARD:** Hide it when you pass the van. They've got the same idea on a mast, and they don't
like company.

*`[rapport +1]`.*

-> halvard_hub

### node: halvard_show_guitar

**HALVARD:** Is that wood?

**TREVOR:** Spruce top. Older than the building.

**HALVARD:** Play something.

*Trevor plays something. It is recognizably an attempt at a song.*

**HALVARD:** ...The guitar's fine.

**TREVOR:** I'm self-taught.

**HALVARD:** I gathered.

*[present michael]*
**MICHAEL:** He's getting better. He was worse. We lived through worse.

**HALVARD:** Keep it close down there. Wood doesn't take the rot. Nothing in it to call.

*`[rapport +1]`.*

-> halvard_hub

### node: halvard_show_pacifier_inside

*Halvard looks at the pacifier. Then at the roommate. Then, briefly, at the ceiling.*

**HALVARD:** I told myself when I opened this stall: you buy what's offered, you don't ask why.

**HALVARD:** You are the hardest that rule has ever been tested.

-> halvard_hub

### node: halvard_show_statue_inside

#### if speaker=manuel
**MANUEL:** I'm not trading it. I just thought you'd want to see one.

*Halvard holds it under the lamp for a long time.*

**HALVARD:** You did the back of his head. Nobody does the back.

**MANUEL:** It looked wrong without it.

**HALVARD:** Thank you. For not trading it. Put it back where it lives.

*`[rapport +1]`.*

#### if speaker!=manuel
**HALVARD:** That's his. Even I can see whose that is. Why is it in your coat?

*[present manuel]* -> halvard_trade_caught

*[not present manuel]*
**HALVARD:** Take it home. Same angle on the shelf. He'll notice the angle.

-> halvard_hub

### node: halvard_show_mate_inside

*Reuse `halvard_mate` with the slot business replaced by handing the gourd across the bench, and
the closing two lines replaced by:*

**HALVARD:** Leave the thermos where I can reach it.

*`[rapport +2]`. Does not change `entry`.*

-> halvard_hub

### node: halvard_show_key

**HALVARD:** I know what it looks like. I've looked at it every day for twenty-seven years.

**HALVARD:** Left. Lift as you turn.

-> halvard_hub

### node: halvard_show_phone

*The roommate puts their own phone on the bench.*

**HALVARD:** Cracked corner. Swollen cell. You charge it under your pillow.

#### if speaker=michael
**MICHAEL:** In case it rings.

**HALVARD:** It'll ring just as well on a table, and it won't burn your bed down.

**MICHAEL:** I know.

*Halvard fixes the corner anyway. It takes him nine seconds.*

#### if speaker=trevor
**TREVOR:** It's fine. I've benchmarked it.

**HALVARD:** It's four months from a fire. Benchmark that.

#### if speaker=manuel
**MANUEL:** The lock screen's the balloon. Don't... yeah. That's the balloon.

*Halvard looks at the picture longer than he looked at the phone.*

**HALVARD:** It's a good color.

*[flag act1.call.answered OR act1.call.declines>=1]*
*He turns the phone over. He stops.*

*[flag act1.call.answered OR act1.call.declines>=1]*
**HALVARD:** There's a contact in here that I didn't see you add. And I'm not going to read the
name out loud.

-> halvard_hub

---

## Part 8: Leaving and coming back

### node: halvard_farewell

*Sets `act1.leadB.done` if both `act1.halvard.sellerClue` and `act1.halvard.fansClue` are set.*

#### if threatened
**HALVARD:** Mind the shutter. Don't come back.

*The shutter comes down hard. The slot does not open again for this party unless they return
with the key after the boss (see `halvard_return`).*

#### if not threatened and not flag act1.halvard.sellerClue
**HALVARD:** You're leaving without what you paid for. Your business. The slot opens for you now.

#### if not threatened and flag act1.halvard.sellerClue and not flag act1.halvard.keyGiven
**HALVARD:** You'll want a way through the door down there. Come back when you've worked out how
to ask.

#### if not threatened and flag act1.halvard.keyGiven and rapport<3
**HALVARD:** Left, and lift. Mind the shutter.

#### if not threatened and flag act1.halvard.keyGiven and rapport>=3
*He gets up. It is the first time he has stood. He is shorter than he sat.*

**HALVARD:** Three of you. Stay three.

*He runs the shutter up himself.*

**HALVARD:** And come back and tell me. I'll be up. I'm always up.

*[speaker=manuel] [rapport>=3]*
**MANUEL:** I'll bring the thermos.

*[speaker=trevor] [rapport>=3]*
**TREVOR:** I'll bring the key back. Labeled.

*[speaker=michael] [rapport>=3]*
**MICHAEL:** We'll knock. So you know it's somebody.

### node: halvard_return

*Any later visit before the descent.*

#### if threatened
*The slot stays shut. The TV light moves under the shutter. Knocking gets nothing.*

#### if not threatened and not flag act1.halvard.sellerClue
**HALVARD:** Back. Good. Sit.

-> halvard_hub

#### if not threatened and flag act1.halvard.sellerClue
**HALVARD:** You're still up here. The door's down there.

*[flag act1.leadC.footageSeen]*
**HALVARD:** You've seen something. You've all got the same face on. Don't tell me. Tell each
other.

-> halvard_hub

*After the Act 1 boss, with `platform_key` and not betrayed: one-line hook for Act 2's opening.
Full scene belongs to the ending script.*

**HALVARD:** You came back. ...Sit down. All of it. From the door.

---

## Part 9: The double-cross hook (stretch boss)

### node: tipline_placard

*On the metro stairs, bolted to the rail at eye level, above Halvard's stall: a Continuity
placard. Visible from the first visit. Interactable only after `act1.halvard.met`.*

*It reads: SEEN UNATTESTED DATA? SAY SOMETHING. ABATEMENT TIP LINE. FOR YOUR SAFETY. A code to
tap with a phone. Someone has scratched under it: opening soon.*

Choices:
- *(Read it and walk on.)* -> END
- *(Tap the code.)* -> tipline_confirm

### node: tipline_confirm

*The roommate's phone is out. The others have stopped on the stairs.*

#### if speaker=manuel
*[present trevor]*
**TREVOR:** What are you doing?

**MANUEL:** They've got vans. They've got sensors on masts. If they want the helium anyway, maybe
they find it faster than us. Maybe they give it back.

*[present michael]*
**MICHAEL:** They don't give things back, man. That's the main thing about them.

#### if speaker=trevor
*[present manuel]*
**MANUEL:** Trevor. No.

**TREVOR:** I'm not saying I will. I'm saying it's an option. A unit with real sensors clears the
tunnel ahead of us. We walk in behind it.

*[present manuel]*
**MANUEL:** And him? Under the stairs?

**TREVOR:** ...That's the cost. I'm not pretending it isn't.

#### if speaker=michael
*[present manuel]*
**MANUEL:** Michael. That's not you.

**MICHAEL:** I know it's not. I just thought, if they owed us one. Maybe they've got records.
People who took calls. Where they went.

*[present trevor]*
**TREVOR:** They won't tell you. They'll take the tip and they won't tell you.

*All variants continue.*

*[flag act1.halvard.promised]*
*The key is in the party's inventory. It is heavier than a key should be.*

Choices:
- *(Put the phone away.)* -> tipline_backout
- *(Send it: the stall under the stairs.)* -> tipline_send

### node: tipline_backout

#### if speaker=manuel
**MANUEL:** No. No. We're Aster pros. We find it ourselves.

#### if speaker=trevor
**TREVOR:** Bad trade. Withdrawn.

#### if speaker=michael
**MICHAEL:** She'd have hated that I even took my phone out.

*`[standing archivists +1]`. The placard remains interactable.*

### node: tipline_send

*The phone makes a small, pleasant sound.*

**TIP LINE (VOICE):** Thank you, citizen. Your report has been noted. A unit has been assigned for
your safety. Your loyalty score has been adjusted.

**TIP LINE (VOICE):** Things are stable.

*Across the plaza, the abatement van's mast stops turning. It points at the stairs. Then, slowly,
it points at the party.*

#### if speaker=manuel
**MANUEL:** ...Why is it looking at us?

#### if speaker=trevor
**TREVOR:** It logged the reporting device. Of course it did. Rookie Aster mistake. Mine.

#### if speaker=michael
**MICHAEL:** I thought it would feel like helping. It doesn't feel like anything.

*All variants continue.*

*[present manuel] [speaker!=manuel]*
**MANUEL:** He shared his stool with us.

*[present michael] [speaker!=michael]*
**MICHAEL:** Whoever did that was a real Aster noob. And I love you. And I mean it.

*[present trevor] [speaker!=trevor]*
**TREVOR:** It's done. We move before the unit does. We don't talk about it until we're down.

*Sets `act1.halvard.betrayed`, `act1.boss.variant = abatement`. `[standing continuity +2]`,
`[standing archivists -3]`, `[standing callers -1]`. From this point an abatement unit follows the
party's helium trace through the descent (boss hook, DESIGN §6). If `act1.halvard.promised` was
set, also sets `act1.halvard.brokeWord`.*

### node: halvard_stall_sealed

*Any visit to the stall after `act1.halvard.betrayed`.*

*The shutter is all the way up for the first time. Yellow abatement tape across the opening.
The wall of phones is bare nails. Hundreds of paper tags are on the floor, walked on. The curtain
is gone and so is what was behind it. The workbench has been wiped.*

*The TV is still on the shelf. It has been turned to face the plaza, and it is on. The map loops:
2071, 2072, 2073. Nobody has switched it off.*

*[flag act1.halvard.statueTraded]*
*The statue is not on the bench.*

*Inspect the nail by where the curtain was (only if `act1.halvard.keyGiven`): a paper tag on a
string, in his handwriting.*

*It reads: Odell's key. Out on loan. I kept meaning to stop expecting people.*

*Inspect the nail (if the key was never given): the key is gone. A cleaner rectangle on the wall
where it hung.*

#### if speaker=manuel
**MANUEL:** We did this.

#### if speaker=trevor
*Trevor picks up one tag, reads it, and puts it in his pocket. He does not say what it said.*

#### if speaker=michael
**MICHAEL:** All those phones. Somebody was going to come back for one of those.

*No further lines. The party's barks are suppressed in this room.*

---

## Barks and ambient lines

| id | speaker | trigger | line |
|---|---|---|---|
| hv_amb_slot_1 | HALVARD | Party idles outside the shutter 20s, before entry | I can hear you breathing. It's not a reason. |
| hv_amb_slot_2 | HALVARD | Party rides a scooter past the stall | Walk it on the plaza. You'll wake the van. |
| hv_amb_bench_1 | HALVARD | Inside, party idle 30s | *(to a phone on the bench)* There you are. No, don't thank me. |
| hv_amb_bench_2 | HALVARD | Inside, party idle 60s | Twelve a day. Top row tonight. |
| hv_amb_tv_1 | TV (VOICE) | Before `tvNoticed`, party within 2 tiles of TV | ...point one. This briefing is not for distribution. |
| hv_amb_tv_2 | HALVARD | After `tvNoticed`, player interacts with the dark TV | It's off. Leave it off. |
| hv_amb_curtain | HALVARD | Player walks into the curtain tile | Ah. No. |
| hv_amb_iron | HALVARD | Trevor interacts with the soldering iron | I said don't. ...It's a 1961 Weller. You can look. |
| hv_tag_1 | (tag) | Inspect phone wall, slot 1 | "Mrs. A. Screen. Paid. 2074." |
| hv_tag_2 | (tag) | Inspect phone wall, slot 2 | "Boy, red jacket. Said Thursday. 2081." |
| hv_tag_3 | (tag) | Inspect phone wall, slot 3 | "No name. Rang once, 2090. Missed it." |
| hv_tag_4 | (tag) | Inspect phone wall, slot 4 | "Hers. Do not wipe." |
| hv_tag_5 | (tag) | Inspect phone wall, slot 5 (clock on lock screen) | "Clock says 1901. Leave it. It's not wrong, it's just early." |
| hv_rm_manuel_1 | MANUEL | Leaving the stall, `sellerClue` set | It wasn't one of us. I'd know. I check on things. |
| hv_rm_trevor_1 | TREVOR | Leaving the stall, `sellerClue` set | One hand in a pocket. Why would you keep one hand in a pocket. |
| hv_rm_michael_1 | MICHAEL | Leaving the stall, `sellerClue` set | Nobody say anything weird for like ten minutes. I need ten minutes. |
| hv_rm_manuel_2 | MANUEL | Leaving the stall, `tvNoticed` set | A map's not proof. I hate 245 lab. |
| hv_rm_trevor_2 | TREVOR | Leaving the stall, `tvNoticed` set | It's a confound. It's probably a confound. |
| hv_rm_michael_2 | MICHAEL | Leaving the stall, `callTopic` set | He charges them. All of them. Every day. |
| hv_rm_manuel_3 | MANUEL | `statueTraded` and `manuelKnowsStatue`, entering 631 | *(to the shelf)* Two's fine. Two's still a set. ...It's not. |
| hv_rm_manuel_4 | MANUEL | `statueBehindManuel` and `manuelKnowsStatue`, trading roommate within 2 tiles, until next sleep | Don't. Not yet. |
| hv_rm_trevor_3 | TREVOR | Holding `platform_key`, entering tunnels | Left, and lift. Aster pros read the manual. |
| hv_rm_michael_3 | MICHAEL | Holding `platform_key`, `promised` set, passing the van | Found it. We found it. There's no man under the stairs. |
| hv_rm_trevor_4 | TREVOR | `threatened` set, leaving the stall | It worked. Stop looking at me. I know. |
| hv_rm_manuel_5 | MANUEL | `betrayed` set, any plaza billboard in view | At the end of the day. Yeah. |
| hv_plaza_rotter | ROTTER | Rotter nearest the stairs, party passes after `met` | phones fixed while you. while you. code rot. while you wait. |

---

## Notes for implementers

- **No seed branching in this file.** Do not add `[seed=A]` or `[seed=B]` conditions to any
  Halvard line. The seller description (`halvard_seller`) is written so each detail (fob 631, one
  hand in a pocket, flat voice, no shifting weight, "waiting for a different answer to load") is
  literally true under both variants. Do not add height, hair, gender, or which hand.
- **Tim Cheese is never shown.** The TV shows only the map. The speaker tag is `TV (VOICE)` and
  must not be relabeled with his name in subtitles. Only Halvard's `halvard_tv_voice` node
  attributes it, and only by implication.
- **The Call's content is never stated.** `halvard_call_what` and `halvard_call_you` are the limit.
- **Speaker and presence.** `speaker` is the roommate who started the conversation. `present X`
  means roommate X is within 6 tiles when the node fires (another player or an AI companion). In
  solo play with no companions, all `[present ...]` lines are skipped and the scene still reads.
  `halvard_trade_manuel_choice` hands choice control to Manuel's player if one is connected.
- **Rapport** is an integer on `act1.halvard.rapport`, clamped to -2..6. Thresholds used: `>=3`
  (curtain confession, warm farewell, free key). Sources are marked inline. A threatened Halvard
  ignores rapport entirely.
- **Price.** `price` is a scene-local variable: 40 by default, 30 after Trevor's or Michael's
  haggle. Manuel cannot lower it (he tries to raise it). Scrap is deducted at `halvard_pay_done`.
- **Stare contest.** `halvard_stare_*` is dialogue-only, no reflex timer, but hold each beat on
  screen for at least 3 seconds before choices appear, and play the overhead train on beat two.
  Michael's phone buzz is three scripted haptic/sound cues. A roommate who loses is locked out
  (`stareLostBy.<name>`); the other two can still try. Trevor always wins if he does not choose
  to break; Michael wins only by ignoring the phone three times; Manuel always loses (he gets
  rapport for it).
- **Lockpick.** Five-lever minigame, no timer, three wrong lifts snap a pick. `pickset` is a fab
  recipe (suggested: 6 scrap). The displayed time in "Two minutes ten" can be the real elapsed
  minigame time if convenient; otherwise leave it fixed.
- **Drill.** Starting the drill emits a noise event; if Lead A's van is on the plaza, turn its
  mast toward the stairs for a few seconds (no consequence, just pressure). The drill item is held
  by Halvard for the duration of the visit and returned at `halvard_farewell`.
- **Statues.** Three items: `statue_first`, `statue_second`, `statue_newest`, picked up from the
  631 shelf. Trading one removes it from the world and places a prop on Halvard's bench.
  **This blocks the statue-alignment puzzle (DESIGN §8)** unless the statue is recovered. Suggested
  recovery: after the Act 1 boss, if not betrayed, Halvard hands it back in the Act 2 opening
  ("It improved the room. It's yours."). If betrayed, it is gone until Act 2 (hook: it turns up in
  an abatement evidence locker).
- **`halvard_statue_discovered`** needs two triggers: Manuel entering the stall, or Manuel
  inspecting the 631 shelf. Record which roommate traded it (`act1.halvard.statueTradedBy`) to
  select the reply lines.
- **TV.** The map is a looping animation: about 12 seconds, year counter 2071 to 2098, one white
  point on College Park. `halvard_tv_trigger` fires automatically after any two hub topics are
  exhausted. After switch-off the TV tile is dark and reflects the stall. In
  `halvard_stall_sealed` it is on again and rotated to face out.
- **Key gate.** The key is given if any of: threatened; entry was `pay` or `trade`; rapport >= 3;
  `act1.halvard.librarian`; a per-roommate reason line; a 20-scrap deposit; or taking it off the
  nail (which he allows). There is no fail state: a party that reaches `halvard_key_ask` can always
  leave with the key. Without the key, the platform door falls back to Trevor's morph brute force
  (DESIGN §8).
- **Lead completion.** `act1.leadB.done` requires `sellerClue` and `fansClue`. The key is not
  required for lead completion. The TV clue is optional but hard to miss because of the auto
  trigger.
- **Double-cross.** `tipline_placard` is on the stairs from the start and becomes interactable
  after `act1.halvard.met`. Sending is a two-step confirm. On send: seal the stall
  (`halvard_stall_sealed` replaces the interior), remove Halvard from the world for Act 1, set
  `act1.boss.variant = abatement` (the boss table's third row takes priority over the Rot Warden
  but not over the Sahur route), and spawn the unit's sensor ping as an ambient threat in the
  descent. The party keeps `platform_key` if already given. The paper tag on the nail only appears
  if the key was given. Suppress roommate barks inside the sealed stall.
- **Standing nudges** are suggestions for the hidden faction system: threat = Archivists -1,
  Continuity +1; honest statue trade, curtain confession, promise = Archivists +1 each; tip line =
  Continuity +2, Archivists -3, Callers -1. `interdiction` standing only moves on Michael's
  non-arguing reply to the map.
- **The great line.** "I can fix any phone ever made. I can't make it ring." plays once, in
  `halvard_call_line`. Hold 2 seconds of silence after it with no roommate reply and no music
  change. It must not appear in barks, loading tips, or the threatened route.
- **The slogan.** The billboard above the stairs carries the Slop Decades slogan with two dead
  letters. Halvard refers to it without reciting it. The sincere delivery by a major character is
  reserved for elsewhere; do not give it to Halvard.
- **Invented names to check against canon:** Odell (the station manager, on the key tag only),
  the tip line, `pickset`, `platform_key`, and Halvard's six years at Baltimore customs.
