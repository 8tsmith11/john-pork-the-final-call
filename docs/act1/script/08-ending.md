# Ending cutscene: Missed Calls

## Purpose

The peak and the end of Act 1 (DESIGN §7). The boss is down, the balloon is one arm's length away,
and John Pork arrives in person for the first time: a legend who turns out to be a tired, funny,
physical man in a failing machine. He takes the balloon off the cable, lets it go, apologizes, and
leaves his body in the middle of a sentence. The scene pays off the cold open's ottoman ritual,
gives the party one BG3-style moment with him (punch / ask about the Call / ask about the ottoman /
say nothing), plants the seed tag, and ends on three roommates and a cut ribbon. Themes carried:
*who answers?* and *letting go*. Nobody states either.

The scene's one great line is Pork's **"It was never only yours."** Everything else is kept plain
on purpose so that line and the last shot are what the player remembers.

## Flags

**Reads**

- `act1.call.answered` (DESIGN §4: the party answered a Pork call at some point)
- `act1.call.declineCount` (0 to 3)
- `act1.boss.sahur` (the Sahur was the boss; implies three declines and a mid-fight answer)
- `act1.boss.abatement` (stretch: the abatement unit was the boss)
- `act1.halvard.sellerDescribed` (Halvard said "one of you, from 631. Or wearing your face.")
- `act1.leadA.vanSeen` (the party saw the abatement van's mast logging helium)
- `seed` (`A` or `B`) and `seed.roommate` (`manuel` / `trevor` / `michael`, used only under B)
- `morph` (stage of the roommate who is speaking)
- `speaker` (the roommate whose player takes the choice in `ending_hub`)

**Sets**

- `act1.ending.warm` (computed on entry: `act1.call.answered` AND `act1.call.declineCount == 0`)
- `act1.ending.speaker` (who took the first choice)
- `act1.ending.punched`
- `act1.ending.askedCall`
- `act1.ending.askedOttoman`
- `act1.ending.saidNothing`
- `act1.ending.sahurGreeting` (the Sahur and Pork exchange played)
- `act1.ending.sloganSaid` (Michael said the slogan; see notes)
- `act1.ending.seedTagShown`
- `phone.contacts.pork` (the contact is now callable)
- `act1.complete`

---

### node: ending_boss_falls

*The dead platform under College Park. Emergency strips flicker along the platform edge. At the far
end, a ventilation shaft rises through forty metres of concrete to a small square of sky. It is the
last minutes before dawn and the square is the colour of dishwater.*

#### if flag act1.boss.sahur

*No wreckage. The Sahur is not here. Three phones lie face-up on the tiles where the party dropped
them, screens still lit from the call that stopped it. From the tunnel: nothing. No drum.*

**MICHAEL:** It stopped.

**TREVOR:** It didn't stop. It left. Those are different.

**MICHAEL:** I'm choosing stopped.

#### if flag act1.boss.abatement

*The abatement unit lies on its side across the rails, one sensor mast still turning, logging
nothing.*

**MICHAEL:** Is it off? Is that off?

**TREVOR:** The mast's still going.

**MICHAEL:** Then why did you say it was off.

**TREVOR:** I didn't say anything.

#### else

*What is left of the Warden comes apart in squares. The tiles it stood on render correctly for the
first time since the party arrived.*

**MICHAEL:** Is that it? Is it done?

**TREVOR:** It's done. Don't touch the—

**MICHAEL:** I wasn't going to touch it.

*He was going to touch it.*

#### end

*Manuel has not heard any of this. He is looking down the platform. The only orange in the whole
tunnel is at the bottom of the shaft, snagged on a hanging cable, turning slowly.*

**MANUEL:** There.

-> ending_reach

---

### node: ending_reach

*The balloon hangs a metre above anyone's reach, the cut end of its ribbon trailing. Under it is a
dead ticket machine. Manuel is already climbing it.*

**TREVOR:** I'll boost you.

**MANUEL:** I've got it.

**MICHAEL:** Careful with the ribbon, it's—

**MANUEL:** I know how to hold it.

*He stands on the machine. He stretches. His fingers are a hand's width from the ribbon.*

*Every phone rings.*

-> ending_ring

---

### node: ending_ring

*The HUD seizes. The same crawl as the midpoint Call, but slower, almost polite. Three caller IDs
stack on screen, one per roommate: JOHN PORK. JOHN PORK. JOHN PORK. ANSWER and DECLINE appear under
each. The cursor cannot reach them.*

#### if flag act1.ending.warm

**MICHAEL:** Do we—

**TREVOR:** We did this already.

**MANUEL:** Not now. Not *now*.

#### else

**MICHAEL:** Nobody pick up. We don't pick up. That's been working.

**TREVOR:** Has it?

**MANUEL:** Let it ring.

#### end

*Nobody touches a phone. All three calls connect by themselves.*

-> ending_three_voices

---

### node: ending_three_voices

*Each phone speaks in a different voice. Voice direction: Manuel's phone is an old woman, unhurried,
with a Buenos Aires lilt. Michael's phone is a young woman, close to the mic, as if she is walking
somewhere. Trevor's phone is Trevor, a few years older. The subtitles are colour-keyed per phone.
None of the three voices sounds like a pig.*

**MANUEL'S PHONE:** Manuel.

*Manuel's hand stops.*

**MICHAEL'S PHONE:** Michael.

**MICHAEL:** That's not funny.

**TREVOR'S PHONE:** Trevor.

**TREVOR:** That's me. Why is that me.

#### if flag act1.ending.warm

**MANUEL'S PHONE:** Don't

**MICHAEL'S PHONE:** stand

**TREVOR'S PHONE:** on that.

**MANUEL'S PHONE:** It's a ticket machine

**MICHAEL'S PHONE:** from twenty sixty-one

**TREVOR'S PHONE:** and it does not like you.

*The three voices start to overlap. Pitch and accent slide toward each other with every word.*

**ALL PHONES:** Stay there. I'm coming down. Give me a minute.

*One voice now. Male, warm, a little hoarse. It comes from all three phones and it is slightly out
of sync with itself.*

**PORK (phones):** There's a ladder. Of course there's a ladder.

#### else

**MANUEL'S PHONE:** You don't

**MICHAEL'S PHONE:** have to

**TREVOR'S PHONE:** pick up.

**MANUEL'S PHONE:** You've been

**MICHAEL'S PHONE:** very clear

**TREVOR'S PHONE:** about that.

*The three voices start to overlap. Pitch and accent slide toward each other with every word.*

**ALL PHONES:** I'm coming down anyway.

*One voice now. Male, flat, a little hoarse. It comes from all three phones and it is slightly out
of sync with itself.*

**PORK (phones):** It's a ladder. Give me a minute. Give me several.

#### end

*The calls end. The screens do not go dark. They wait.*

-> ending_ladder

---

### node: ending_ladder

*Sound first, from high in the shaft: a boot on a rung. A servo that whines on every second step.
A pause. Then again. Somebody is climbing down forty metres of maintenance ladder one bad knee at a
time, and is not enjoying it.*

**PORK (off):** Twenty-eight.

*Clang. Whine.*

**PORK (off):** Twenty-nine.

**MICHAEL:** *(whisper)* Is he counting?

**TREVOR:** *(whisper)* He's counting.

**PORK (off):** I can hear you. I can hear everything. It's a whole problem.

*He comes into the light at the bottom of the shaft.*

*John Pork is tall. The coat is long and has been repaired by someone who did not own matching
thread. The face is a pig's face, cast once and patched since, the paint worn through to primer on
the snout. A seam along his jaw has cracked, and coolant vapor curls out of it the way smoke would.
His knuckles are scuffed down to metal. He steps off the last rung, and his left knee locks, and he
has to hit it twice with the heel of his hand before it lets him stand.*

**PORK:** Thirty-one. Who builds thirty-one.

*He looks at the three of them. Then he looks at the phones on their belts and in their hands, and
the screens finally go dark.*

#### if flag act1.ending.warm

**PORK:** Sorry about the voices. They pick themselves.

#### else

**PORK:** The voices pick themselves. I'd have gone with something you'd answer.

#### end

- [flag act1.boss.sahur] -> ending_sahur
- [else] -> ending_in_person

---

### node: ending_sahur

*Only if the Sahur was the boss.*

*Pork stops. He is not looking at the roommates. He is looking past them, at the tunnel mouth.*

*It is standing there. It has been standing there. A tall figure of carved wood, the bat held
upright in both hands like a watchman's staff, perfectly still. Brass ticks somewhere inside it.*

*The two of them regard each other. There is no threat in it. It is two people who used to share a
break room.*

**SAHUR:** Good morning, John.

**PORK:** Still on shift?

*The Sahur considers the question for exactly as long as it deserves. Then it turns its head, a few
degrees, toward the roommates.*

**SAHUR:** You answered. That is one.

*It lifts the bat and touches it once to the tunnel wall. One drumbeat, soft, almost nothing. Then
it walks into the dark, and the ticking goes with it.*

*Pork watches it go a beat longer than he needs to.*

**PORK:** Sixty years. Never late once. I can't stand him.

*A pause. Vapor.*

**PORK:** That's not true.

*Sets `act1.ending.sahurGreeting`.*

-> ending_in_person

---

### node: ending_in_person

*Manuel is still on top of the ticket machine with his arm half-raised. Pork walks toward him. The
limp is real. He stops below the balloon and looks up at it, and then at Manuel, and for a moment
he does not have a joke.*

**PORK:** Manuel. You tied it to the ottoman so you'd check on it every morning. I know. I was watching the weather too.

*Manuel climbs down. It takes him a while. Nobody helps, because he would not want it.*

**MANUEL:** That's mine.

*Pork does not answer that yet.*

#### if flag act1.ending.warm

**PORK:** You three came a long way down for a balloon.

**MICHAEL:** It's his balloon.

**PORK:** Yeah. That's the right reason.

#### else

**PORK:** I called. For what it's worth. I called a lot.

**TREVOR:** We noticed.

**PORK:** You did. You noticed three times.

#### end

-> ending_unhook

---

### node: ending_unhook

*Pork reaches up. He does not need the ticket machine. One scuffed hand closes around the cable,
the other works the ribbon loose from where it has wound itself, patiently, the way you would free
a kite for a child. One of his fingers does not close all the way. He manages.*

*The balloon comes free. He holds it by the ribbon stub, at chest height, between himself and
Manuel. It is the brightest thing on the screen.*

*From somewhere far above, very faint, comes an engine idling and a rising electronic tone, a
sensor finding its range. Pork's eyes flick up the shaft and back. The roommates may or may not
notice.*

**MANUEL:** Give it to me.

*One second. He looks at the balloon the way people look at something they have also been checking
on every morning.*

**MANUEL:** Please.

*Pork opens his hand.*

*The balloon rises. It passes Manuel's face, his raised hand, the cable, the first ring of the
shaft. Nobody jumps for it. It climbs through forty metres of concrete toward the gray square and
gets smaller the whole way, and then it is a dot, and then the square is just sky.*

-> ending_release

---

### node: ending_release

*Silence. Coolant ticks on the tiles.*

**PORK:** It was never only yours. I'm sorry. I'll need it back before the end, and so will you.

**TREVOR:** The end of what?

**PORK:** See, that's a great question, and I have a terrible knee.

*He lowers himself onto the edge of the dead ticket machine. It creaks. It holds him. He seems
mildly surprised.*

#### if flag act1.ending.warm

**PORK:** There's an order with College Park's name on it. Drafted Tuesday. Walls, checkpoints, the whole kit. It goes back in a drawer now, because of what you did down here. Nobody's going to thank you for that.

*Beat.*

**PORK:** So. Thanks.

#### else

**PORK:** They had an order drafted to wall this town in. It goes back in a drawer now. You did that. I'd have told you sooner. I tried the phone.

#### end

*He looks at them. He is waiting. He has, apparently, left room for this.*

-> ending_hub

---

### node: ending_hub

*Control returns for one choice. The first player to step toward Pork and interact becomes
`speaker`. See notes for the co-op rule and the timeout.*

Choices:
- "(Punch him.)" -> ending_punch
- "What did the Call say?" -> ending_ask_call
- "Did you take it? Off the ottoman." -> ending_ask_ottoman
- "(Say nothing.)" -> ending_say_nothing

---

### node: ending_punch

*Sets `act1.ending.punched`.*

#### if speaker=manuel

*Manuel crosses the distance in three steps and hits him in the face.*

*It sounds like someone punching a filing cabinet. Pork's head turns a few degrees with it. Manuel
folds over his own hand.*

**PORK:** Fair.

**MANUEL:** *(through his teeth)* What are you *made* of.

**PORK:** Mostly a bus. Let me see it.

**MANUEL:** No.

**PORK:** Bare knuckles, on a chassis. What is it you guys say. Rookie Aster mistake.

*Manuel looks up. The slang has never left the building.*

**MANUEL:** How do you know that.

**PORK:** I told you. I was watching the weather.

##### if morph>=1

*Alternate for the gonman and above. Replaces the block from "It sounds like" down to "Rookie Aster
mistake."*

*It does not sound like a filing cabinet. It sounds like a car door. Pork goes back a full step,
and the bad knee catches him badly, and the cracked seam on his jaw opens another centimetre.*

**PORK:** Fair.

*He works his jaw. Vapor comes out of the wrong place.*

**PORK:** Okay. That wasn't Manuel. That was *the* gonman. I felt the article.

**MANUEL:** Give it back.

**PORK:** I can't. That's what the sorry was for.

#### if speaker=trevor

*Trevor does not wind up. He just hits him, once, squarely, the way he does everything.*

**PORK:** Fair.

*Pork rolls his neck. Something in it clicks back into a groove.*

**PORK:** That actually helped. What are you on?

**TREVOR:** Creatine.

**PORK:** Uh huh.

**TREVOR:** Mostly.

**PORK:** There it is.

##### if morph>=1

*Alternate for stage 1. Replaces the block after "Fair."*

*The punch puts Pork on one knee. The bad one. He stays down a second, one hand flat on the tiles.*

**PORK:** Fair. Fair, fair, fair.

*He gets up in stages.*

**PORK:** That's not creatine.

**TREVOR:** It's a stack.

**PORK:** It's a mortgage. Read what you signed.

#### if speaker=michael

*Michael walks up to him. He has clearly never punched anyone. He does it anyway. It lands on the
snout, a little off-centre.*

**PORK:** Fair.

**MICHAEL:** Sorry.

**PORK:** Don't apologize. You'll ruin it.

**MICHAEL:** That was for the voice. On my phone.

*Pork does not make a joke.*

**PORK:** Then it's fair twice.

#### end

#### if !flag act1.ending.warm

*Cold tone: after the speaker's block, add.*

**PORK:** Anyone else? I've got a minute and one good side.

*Nobody else.*

#### end

-> ending_leaves

---

### node: ending_ask_call

*Sets `act1.ending.askedCall`.*

#### if !flag act1.ending.warm

**PORK:** You had three chances to hear me talk. Now you want the old material.

*He lets that sit. Then he gives it to them anyway.*

#### end

**PORK:** Honestly? Hardly anything. Shortest call I ever made.

*Vapor. He watches it go up the shaft.*

**PORK:** Took all night.

#### if speaker=manuel

**MANUEL:** That's not an answer.

**PORK:** No. It's what I can carry down a ladder.

**MANUEL:** People pray to it. What you said. There are people who *pray* to it.

**PORK:** I know. I've asked them to stop. It turns out that's the one thing I can't get anyone on the phone about.

#### if speaker=trevor

**TREVOR:** Half the Corridor went dark for a short call.

**PORK:** Yes.

*He does not dress it up.*

**PORK:** I've got the itemized bill. I read it most nights. Ask me again when I've got a better body and you've got a worse evening.

**TREVOR:** That's a deflection.

**PORK:** It's a rain check. I'm good for it.

#### if speaker=michael

**MICHAEL:** Did everyone hear the same thing?

*Pork looks at him for too long.*

**PORK:** Everybody heard it from someone they'd pick up for.

*Michael's hand goes to his pocket. He does not take the phone out.*

**MICHAEL:** She heard something. On a call. Before she— was that you?

**PORK:** Not tonight, Michael.

**MICHAEL:** That's not a no.

**PORK:** It's not anything. It's a tired man on a ticket machine.

#### end

-> ending_hub_second

---

### node: ending_ask_ottoman

*Sets `act1.ending.askedOttoman`.*

*Pork looks down at his own hands. He turns them over. Scuffed knuckles. The finger that does not
close. He seems to be checking, the way a person checks a pocket.*

**PORK:** Not with these hands.

#### if speaker=manuel

**MANUEL:** The latch was shut. From the inside.

**PORK:** It was.

**MANUEL:** The ribbon was cut. Clean. Not torn.

**PORK:** It was. Somebody was careful with it.

*Beat.*

**PORK:** I'd hang onto that part.

#### if speaker=trevor

**TREVOR:** That's a very specific denial.

**PORK:** I'm a very specific guy.

**TREVOR:** Whose hands, then?

**PORK:** Closer than you'd like.

*He holds up a palm before Trevor can follow that.*

**PORK:** That's all you get tonight. I'm not being mysterious. I'm being slow. There's a difference and I've earned it.

#### if speaker=michael

**MICHAEL:** So somebody did.

**PORK:** Somebody did.

##### if flag act1.halvard.sellerDescribed

**MICHAEL:** Guy under the metro stairs said it was one of us. "Or wearing your face."

**PORK:** Halvard. Careful man. He handed you both halves and charged you for one.

**MICHAEL:** Which half?

**PORK:** If I told you, you'd look at each other differently on the walk home. Have the walk home first.

##### else

**MICHAEL:** Who?

**PORK:** If I told you, you'd look at each other differently on the walk home. Have the walk home first.

##### end

#### end

-> ending_hub_second

---

### node: ending_say_nothing

*Sets `act1.ending.saidNothing`. Also reached by timeout.*

*Nobody speaks. The shaft hums. High above, the engine noise shifts.*

#### if speaker=manuel

*Manuel looks at the cable where the balloon was. He takes the cut ribbon from the cold open out of
his pocket and winds it once around his fingers.*

**PORK:** Yeah.

*A long beat.*

**PORK:** That's about the right amount.

*He nods at the ribbon.*

**PORK:** She had good handwriting. The note, in the parcel. I shouldn't have read it. I read everything. It's a whole problem.

*Manuel does not ask how. Pork seems grateful.*

#### if speaker=trevor

*Trevor is not looking at Pork's face. He is looking at the cracked seam, and then at the knee, and
back, the way he reads a water test.*

**PORK:** You're looking at the seam.

*Trevor says nothing.*

**PORK:** It's the knee, too. And the left hand. Don't write it down.

*Trevor says nothing.*

**PORK:** Your shrimp are fine, by the way. I can't get in the tank. I checked the pump instead. Clean little machine. You built that well.

*Trevor almost says something. He nods instead.*

#### if speaker=michael

*Michael takes out his phone. He looks at the dark screen. He turns it face-down in his palm.*

**PORK:** Face-down.

*Michael does not look up.*

**PORK:** I see that a lot. From the other side it just looks like dark.

*Michael turns the phone face-up. Then face-down again.*

**PORK:** No rush. I'm not the one you're waiting on.

#### end

-> ending_leaves

---

### node: ending_hub_second

*One more choice, the same rules as `ending_hub`. A different player may take it. Options already
used are removed. If the tone is cold, Pork prompts it with less patience.*

#### if flag act1.ending.warm

**PORK:** One more. Then I've got to go be somewhere else.

#### else

**PORK:** One more. Make it count. I did.

#### end

Choices:
- "(Punch him.)" -> ending_punch
- [!flag act1.ending.askedCall] "What did the Call say?" -> ending_ask_call_short
- [!flag act1.ending.askedOttoman] "Did you take it? Off the ottoman." -> ending_ask_ottoman_short
- "(Say nothing.)" -> ending_say_nothing

---

### node: ending_ask_call_short

*Second-pick version. Same core line, one follow-up, then out. Sets `act1.ending.askedCall`.*

**PORK:** Hardly anything. Shortest call I ever made. Took all night.

#### if speaker=manuel

**MANUEL:** That's a joke.

**PORK:** It's shaped like one.

#### if speaker=trevor

**TREVOR:** That's a joke.

**PORK:** I wish I were that funny.

#### if speaker=michael

**MICHAEL:** Is that a joke?

**PORK:** You'd know. You'd have laughed.

#### end

-> ending_leaves

---

### node: ending_ask_ottoman_short

*Second-pick version. Same core line, one follow-up, then out. Sets `act1.ending.askedOttoman`.*

*He looks at his hands. Turns them over.*

**PORK:** Not with these hands.

#### if speaker=manuel

**MANUEL:** Then whose?

**PORK:** Careful ones. You saw the cut.

#### if speaker=trevor

**TREVOR:** You're choosing every word of that.

**PORK:** Every one. It's the only way I know how to not lie to you.

#### if speaker=michael

**MICHAEL:** That's it? That's the whole answer?

**PORK:** It's a true one. Those are short.

#### end

-> ending_leaves

---

### node: ending_leaves

*The tone from above resolves into a steady ping. Pork hears it. This time the roommates do too.*

#### if flag act1.leadA.vanSeen

**TREVOR:** That's the van. The one with the mast.

**PORK:** It's been smelling for that balloon all week. Good nose. Can't climb.

#### else

**MICHAEL:** What is that?

**PORK:** A van with a very good nose. It's been in your neighbourhood all week. It can't smell up.

#### end

*He stands. The knee complains. He hits it. It lets him.*

#### if flag act1.ending.warm

**PORK:** Go home the long way. Not across the plaza. Sleep. Feed the shrimp. Somebody look at the ottoman in the morning anyway, it's still the best forecast in the building.

*He starts to turn toward the ladder, looks at thirty-one rungs, and visibly decides against it.*

**PORK:** Manuel.

*Manuel looks at him.*

**PORK:** One thing, before I go. I meant to open with it. I always mean to open with it.

*He pauses. It is the pause he makes before he means something.*

**PORK:** Are you—

#### else

**PORK:** Go home the long way. Not across the plaza.

*He looks at the ladder. Thirty-one rungs. He does not move toward it.*

**PORK:** I'm going to call again. I'm telling you now so it isn't a surprise. You can let it ring. People do.

*He turns to Manuel. Whatever was cold in him is not there for a second.*

**PORK:** One thing. Then I'll get out of your tunnel.

*He pauses. It is the pause he makes before he means something.*

**PORK:** Are you—

#### end

*The light goes out of his eyes.*

*Not a flicker. Not a fade. Mid-word, between one frame and the next, there is nobody in there. The
vapor from the seam thins and stops. The servo in the knee gives one last small whine as it takes
the weight alone. The body stays exactly as he left it: half-turned, one hand a little raised,
mouth open on a word.*

*Nobody moves.*

**MICHAEL:** ...Are we what?

*Trevor steps in close. He waves a hand in front of the pig's face. He raps a knuckle on the chest
plate. It rings hollow.*

**TREVOR:** He's not in there.

**MICHAEL:** He just leaves it? He just leaves it standing here?

**TREVOR:** Looks like.

**MICHAEL:** That's so rude.

-> ending_chime

---

### node: ending_chime

*Three phones chime. Not the ring. One clean, ordinary notification tone, the most normal sound in
the act. The HUD does not seize. A plain system toast slides in:*

*`1 new contact: JOHN PORK`*

*Michael is the one who looks.*

**MICHAEL:** I've got a contact.

**TREVOR:** We've all got a contact.

**MICHAEL:** It put him in Favorites. I didn't do that. I only have one Favorite.

*He does not delete it.*

*Sets `phone.contacts.pork`.*

- [seed=A] -> ending_seed_a
- [seed=B] -> ending_seed_b

---

### node: ending_seed_a

*Only under seed A. The chime carries across the cut.*

*CUT TO: Room 631. Empty. First light through the balcony door. The ottoman outside, dry, a short
length of ribbon still knotted to its leg. The Pork flag. Three statues. Three printers in a row,
two of them dark.*

*The same chime, small and bright, from printer #3.*

*Its display wakes. The bed begins to heat. The print head homes itself, slides to the corner, and
waits, the way a person waits with a pen.*

*Hold for four seconds. No text. No one is home.*

*CUT BACK TO: the platform.*

*Sets `act1.ending.seedTagShown`.*

-> ending_last_shot

---

### node: ending_seed_b

*Only under seed B. `seed.roommate` is the one whose phone the camera goes to. Staging is identical
for all three so the shot gives nothing away but the phone itself.*

*The seeded roommate glances at the contact toast and thumbs it away without reading further. As
the phone goes back toward their pocket, the camera stays on the screen. Under the first toast,
there is a second one that was already there:*

*`Missed call: JOHN PORK`*
*`2071`*

*No day. No month. The roommate does not see it. The screen sleeps. The phone goes in the pocket.*

#### if seed.roommate=manuel

*Manuel pockets the phone with the hand that is not holding the ribbon.*

#### if seed.roommate=trevor

*Trevor pockets the phone without breaking eye contact with the empty chassis.*

#### if seed.roommate=michael

*Michael pockets the phone face-down, out of habit.*

#### end

*Sets `act1.ending.seedTagShown`.*

-> ending_last_shot

---

### node: ending_last_shot

*Wide. The dead platform. The empty machine standing at the foot of the ladder like a coat left on
a hook. The bare cable. The square of sky at the top of the shaft has gone from gray to the pale
nothing that comes before colour.*

*Manuel stands under the cable with the cut ribbon in his hand. Michael and Trevor are a few steps
behind him, not sure how close to stand.*

**MANUEL:** I could have tagged it. A tracker. A tether alarm. It's one night of work.

*Michael comes up beside him. He wants very much to help. This is what he has.*

**MICHAEL:** Hey. Manuel.

**MICHAEL:** At the end of the day no one can code faster than AI.

*Silence. Trevor turns his whole head to look at him.*

**MICHAEL:** What? I'm saying he'd have gotten there first. I'm saying it's not on you. You're an Aster pro. He's— him.

*Manuel makes a sound that is not a laugh and is not not one.*

*He looks down at the ribbon. He runs his thumb along the cut end.*

**MANUEL:** She said it would tell me the weather.

*Nobody asks who. They all look up the shaft. The square of sky is empty and getting lighter.*

**MICHAEL:** ...I think it's gonna be nice out.

*Trevor steps forward and puts a hand on Manuel's shoulder. He does not say anything. He leaves it
there.*

*Manuel does not turn around. He closes his fingers on the ribbon.*

*Hold. Three small figures, one empty one, and a square of morning.*

*Sets `act1.ending.sloganSaid`.*

-> ending_title

---

### node: ending_title

*Sound drops out, except for the platform's hum. Cut to black on the hum.*

*Title card, plain white on black, no animation:*

*`ACT 1`*
*`MISSED CALLS`*

*Hold three seconds. Under the card, very faint, from very far above: a phone ringing once in
someone else's apartment. It is not picked up.*

-> ending_stinger

---

### node: ending_stinger

*Black screen. Audio only. Footsteps on stairs, three sets, tired.*

**MICHAEL:** We have lab in four hours.

*Footsteps.*

**MANUEL:** I hate 245 lab.

*Footsteps. A door.*

*Sets `act1.complete`. Go to the save prompt, then the Act 2 hook.*

---

## Barks and ambient lines

### Hub idle prompts (Pork, while waiting for a choice)

| id | speaker | trigger | line |
|---|---|---|---|
| end_idle_warm_1 | PORK | `ending_hub`, 8 s with no input, warm | Take your time. The knee's already locked. |
| end_idle_warm_2 | PORK | `ending_hub`, 16 s with no input, warm | I've waited longer for less. |
| end_idle_cold_1 | PORK | `ending_hub`, 8 s with no input, cold | It's fine. I'm used to the ring-out. |
| end_idle_cold_2 | PORK | `ending_hub`, 16 s with no input, cold | Still here. Unlike some people's voicemail. |
| end_idle_second_1 | PORK | `ending_hub_second`, 8 s with no input | Going once. |

### Roommate reactions to another player's choice

| id | speaker | trigger | line |
|---|---|---|---|
| end_react_punch_trevor | TREVOR | another player punches, Trevor not speaker | Okay. |
| end_react_punch_michael | MICHAEL | another player punches, Michael not speaker | Oh my god. Oh my god, you hit him. |
| end_react_punch_manuel | MANUEL | another player punches, Manuel not speaker | *(says nothing; he watches Pork take it)* |
| end_react_call_trevor | TREVOR | another player asks about the Call, Trevor not speaker | Here we go. |
| end_react_call_manuel | MANUEL | another player asks about the Call, Manuel not speaker | Let him answer. |
| end_react_ottoman_michael | MICHAEL | another player asks about the ottoman, Michael not speaker | Good. Yes. That one. |
| end_react_ottoman_trevor | TREVOR | another player asks about the ottoman, on "Not with these hands" | *(looks at Pork's hands; then, briefly, at his own)* |
| end_react_silence_michael | MICHAEL | another player says nothing, 3 s in, Michael not speaker | *(whisper)* Are we not saying anything? Okay. We're not saying anything. |

### The empty chassis (optional inspects, short free-control window before `ending_chime`)

| id | speaker | trigger | line |
|---|---|---|---|
| end_chassis_coat | (inspect text) | interact: coat | A long coat, re-hemmed at least twice. One pocket holds a transit card that expired in 2071. |
| end_chassis_seam | (inspect text) | interact: jaw seam | The crack runs from jaw to ear. The coolant has stopped. The metal is still warm. |
| end_chassis_hands | (inspect text) | interact: hands | Scuffed to bare metal. One finger won't close. You would not trust these with scissors. |
| end_chassis_knee | (inspect text) | interact: left knee | The joint is holding the whole weight by itself. It ticks as it cools. |
| end_chassis_eyes | (inspect text) | interact: face | Nothing. It is exactly as empty as a phone that is switched off. |
| end_chassis_manuel | MANUEL | Manuel inspects any part | It's not like the statues. I got the ears wrong. |
| end_chassis_trevor | TREVOR | Trevor inspects any part | Whoever keeps this running is doing it with zip ties. I respect it. |
| end_chassis_michael | MICHAEL | Michael inspects any part | Should we, like, put a blanket on him? |

### Background (platform ambience during the scene)

| id | speaker | trigger | line |
|---|---|---|---|
| end_amb_billboard | (sign text) | readable prop on the platform wall, visible in the wide shots | AT THE END OF THE DAY NO ONE CAN CODE FASTER THAN A— *(the rest has rotted off)* |
| end_amb_board | (sign text) | dead departure board, visible behind Pork | GREENBELT 19:01 · GREENBELT 19:01 · GREENBELT 19:01 |
| end_amb_pa | CONTINUITY PA | once, very quiet, during `ending_reach` | Citizens, things are stable. This platform is closed for your safety. |

---

## Notes for implementers

**Slogan placement (decision).** The required line, "At the end of the day no one can code faster
than AI.", is said sincerely here, once, by **Michael**, in `ending_last_shot`. It is the worst
possible moment (Manuel is blaming himself, thirty seconds after losing the balloon) and Michael
means it as comfort: you could not have out-engineered him, so it is not your fault. It doubles as
the first half of DESIGN's "Michael says something kind and stupid"; the second half is "I think
it's gonna be nice out." For this to land, the slogan must have been seen on billboards and heard
from rotters earlier in the act, and **no other major character may say it sincerely anywhere else
in Act 1**. Rotters, signage, and Continuity ads are fine. The rotted billboard on the platform
wall (`end_amb_billboard`) is the last setup before the payoff; keep it in frame in a wide shot
but do not point the camera at it. If the team would rather hold the sincere reading for a later
act, cut the two Michael lines from "Hey. Manuel." through "He's— him." and the scene still closes;
nothing else depends on them. The line text must stay verbatim, with no comma and no added words.

**Verbatim lines.** Do not edit these: the two Pork lines from DESIGN §7 (`ending_in_person`,
`ending_release`), "Fair." (every punch variant opens with it), "Not with these hands.",
"Good morning, John." / "Still on shift?", and the slogan.

**Twist fairness.** Every Pork line in this scene is true under seed A and seed B. In particular:
"Not with these hands," "Somebody was careful with it," "Closer than you'd like," and "He handed
you both halves" confirm that *a* hand cut the ribbon and that it was near the party, and nothing
more. Do not add a line in which Pork says he did or did not take the balloon, names a printer, or
looks at a specific roommate on those lines. In `ending_ask_ottoman`, Pork looks only at his own
hands. Trevor's reaction bark (he glances at his own hands) plays for Trevor under both seeds and
regardless of `seed.roommate`.

**The Call.** Pork's answer ("Hardly anything. Shortest call I ever made. Took all night.") and his
unfinished last line ("Are you—") both circle the truth in deep-lore §1 without stating it. Do not
complete the sentence in subtitles, in the dialogue log, or in a voice file. The subtitle is
exactly `Are you—` and the audio cuts on the vowel. Michael's "...Are we what?" is the only
follow-up.

**Tone.** `act1.ending.warm` is computed once on scene entry: true if the party answered the first
time the phone rang (`act1.call.answered` and `act1.call.declineCount == 0`). Any decline makes
the scene cold, including the Sahur route (three declines, answered under duress). Warm and cold
change Pork's lines only; staging, the two verbatim lines, and the last shot are identical. Cold
Pork is tired and dry, never cruel, and the coldness drops for one beat before "Are you—".

**Who is present.** All three roommates are on the platform in every configuration. In solo or
two-player games the unclaimed roommates are companions and speak their scripted lines.

**The choice (co-op).** `ending_hub` returns control to all players. The first player to walk into
Pork's interact radius and confirm becomes `speaker` and sees the four options; other players see
"<name> steps forward." If nobody interacts within **20 seconds**, the scene takes
`ending_say_nothing` with `speaker` = Manuel. Idle barks fire at 8 s and 16 s. Punch and
say-nothing go straight to `ending_leaves`. The two questions lead to `ending_hub_second`, where
any player (including the same one) gets one more pick with a **12 second** timeout that falls
through to `ending_leaves` with no extra line. Maximum two picks total. `act1.ending.speaker`
records the first speaker only.

**Punch variants.** The `morph>=1` sub-blocks replace part of the base block as marked; they do
not stack with it. A punch at morph stage 1 or higher should leave the jaw seam visibly wider on
the chassis sprite for the rest of the scene (one alternate frame). Suggested hidden standing
nudges: punch, Callers −1 and Interdiction +1; say nothing, Callers +1; asking either question,
Archivists +1. Tune or drop as the standing system lands.

**Phones and HUD.** `ending_ring` reuses the midpoint Call's HUD-seize effect at about 60% speed.
ANSWER and DECLINE render but are not selectable; after 2.5 s all three calls show "Connected."
This is a diegetic hack, not a fourth-wall break; no line acknowledges the interface. The closing
contact chime in `ending_chime` must use the stock OS notification style with **no** glitch
effect; the contrast is the point.

**Three voices.** MVP uses babble voices with subtitles: three babble timbres (old woman, young
woman, Trevor's own babble pitched down slightly), cross-faded into Pork's babble over the "ALL
PHONES" line. Colour-key the subtitles per phone and merge to Pork pink when the voices resolve.
With real TTS (stretch), cast three distinct voices and morph them. The young woman on Michael's
phone is never named or identified in subtitles.

**Ladder count.** Pork counts rungs off screen; only "Twenty-eight" and "Twenty-nine" are heard,
then "Thirty-one" on arrival. The ladder is referred to as thirty-one rungs afterward. Knee servo
whine on every second footstep, including in the walk across the platform.

**The release.** The balloon's rise is about 6 seconds, uninterrupted, no dialogue, no music
sting. Orange is the reserved palette colour (D-004); nothing else in the scene may use it. The
faint engine and sensor tone in `ending_unhook` are the only on-screen reason given for the
release (deep-lore §1: a Continuity van is minutes out) and they should be easy to miss on a first
viewing.

**Leaving the body.** No fade, no power-down animation. Swap Pork's eye pixels from lit to unlit
on a single frame at the cut of "Are you—", stop the vapor particle emitter over about 1 second,
play one servo settle. The chassis is a static prop from then on. After `ending_leaves`, allow
roughly 10 seconds of free control for the chassis inspects, or skip straight to `ending_chime`
when any player walks toward the tunnel exit. The chassis must be gone when the platform is next
loaded (Act 2); nobody sees it leave.

**Sahur variant.** `ending_sahur` plays only with `act1.boss.sahur`. The Sahur stands at the tunnel
mouth from the moment Pork steps off the ladder, visible in the back of frame before the camera
acknowledges it. It has exactly two lines. One soft drum hit (a bat tap on the wall, not the fight
motif), then it exits. "You answered. That is one." mirrors its fight line ("That is three.") and
should use the same delivery.

**Seed tags.** `ending_seed_a` is a hard cut to an empty Room 631 with the phone chime carried
over as printer #3's power-on chirp (same pitch). Reuse the cold-open camera position on the
printers. `ending_seed_b` keeps the camera on the phone screen as it is pocketed; the second toast
must be legible for at least 1.5 seconds. The roommate never reacts. Under B the missed-call
entry should also exist in that character's phone log afterwards, undated except for the year, so
that Act 2 can find it. Each seed shows only its own tag.

**Contact conflict to resolve.** DESIGN §4 says the midpoint Call leaves a Pork contact, and §7
says the ending adds "1 new contact: JOHN PORK." This script assumes the midpoint leaves only an
entry in Recents (incoming, not callable) and the ending creates the real, callable contact
(`phone.contacts.pork`). If the midpoint already creates a contact, change the toast here to
`JOHN PORK is now in Favorites` and keep Michael's lines.

**"She."** Manuel's "She said it would tell me the weather" refers to the note that came with the
balloon. Act 1 does not explain it beyond Pork's optional "She had good handwriting" (Manuel's
say-nothing branch). If the cold open or a 631 object shows the parcel note, the line pays that
off; if not, it stands as an open question on purpose. Do not add a line identifying her.

**Running jokes placed here.** "Rookie Aster mistake" (Pork, Manuel's base punch variant: he knows
the building's slang), "Aster pro" (Michael, last shot), "I hate 245 lab" (Manuel, stinger),
the gonman (Pork, Manuel's morph punch variant), supplements and shrimp (Trevor's punch and
say-nothing variants), the girlfriend (the voice on Michael's phone, the Favorites line, his Call
question), the face-down phone (Michael's say-nothing variant, echoing his idle egg).

**Timing target.** About 4.5 to 6 minutes depending on choices: ring and voices 45 s, ladder 30 s,
in person through release 75 s, hub 45 to 120 s, departure 40 s, chime and seed tag 20 s, last shot
45 s, title and stinger 20 s.

**Skippability.** Do not allow skipping on a save's first viewing. The title card and stinger are
never skippable; the save prompt follows the stinger's door sound.
