# The First Death: the last 40 seconds

**Purpose.** Deep-lore material for Acts 2 and 3, written now so Act 1 can point at something real
(deep-lore §1, "The First Death", and its open item). In 2086, at the Greenbelt dishes, Tim's
layered interdiction burned John Pork's first body. Only the two of them were there. Tim kept the
last 40 seconds and has replayed it more times than he'll admit. This file is that recording: the
complete transcript, the way it breaks into five fragments the player finds out of order, the
party's reactions to each piece, what Tim says if asked, and two alternate takes with a
recommendation. The recording never says what the Call said. It has a four-second hole where
that would be, and the hole is the point. Theme: *who answers?* The one great line is Pork's last.

**Status.** Proposed canon for the open item in deep-lore ("content TBD with the team"). Nothing
here plays in the Act 1 critical path. Act 1 gets one piece of graffiti and, as a stretch, one
fragment (Part 3). Tim is voice only throughout. He is never on screen in this file.

**Flags**

Reads:
- `act1.call.answered`, `act1.call.declines` (whether the party knows Pork's voice well enough to name it)
- `act1.ending.seen` (the party has met Pork in person)
- `act2.tim.met` (the party can name the second voice)
- `act2.greenbelt.visited`
- `act3.finalCall.heard` (the first line of the Call has finally been heard; Part 6 only)
- `party.present.manuel`, `party.present.trevor`, `party.present.michael` (reaction lines from absent roommates are skipped)
- `faction.callers`, `faction.continuity` (which misreading NPCs offer)
- No seed conditions. Nothing in this scene branches on A or B. The events are from 2086 and every line holds under both.

Sets:
- `act1.firstDeath.graffitiSeen`
- `act1.firstDeath.lightsFound` (stretch: fragment LIGHTS found during Act 1)
- `lore.firstDeath.frag.smoke`, `.eleven`, `.after`, `.no`, `.lights` (fragment found)
- `lore.firstDeath.fragCount` (0 to 5)
- `lore.firstDeath.firstFound` (id of the first fragment found)
- `lore.firstDeath.playedBy.<fragment>` (manuel | trevor | michael: who pressed play)
- `lore.firstDeath.assembled` (all five found and played in order once)
- `lore.firstDeath.gapNoticed` (someone asked about the four seconds)
- `lore.firstDeath.replays` (count of full playbacks after assembly)
- `lore.firstDeath.replayRemarked`
- `lore.firstDeath.askedTim.gap`, `lore.firstDeath.askedTim.third`, `lore.firstDeath.askedTim.moved`, `lore.firstDeath.askedTim.why`
- `lore.firstDeath.timKnowsWeHaveIt`
- `lore.firstDeath.slotSixFilled` (Part 6)

---

## Part 1: The complete recording

This is what the player hears once all five fragments are found, and what a voice actor or TTS
pass reads. 91 words of speech, one four-second hole, sparse sound. It runs 40 seconds at an
unhurried pace. Nobody raises their voice. Nobody cries. There is no music.

Source: TIM's own interdiction log, audio channel. Tim's voice is close and dry, recorded from
inside his head. Pork's is a few metres off, in open air, with fire under it.

### node: firstdeath_full

*[00:00] Wind across a wide, flat place. A large dish motor straining against a stall. Fire, low and even, like a pilot light.*

**TIM:** Three things. One: it's done. Two: there is no layer of this you get out through.

**PORK:** Tim. You're standing in the smoke.

**TIM:** I don't breathe.

**PORK:** I know. Move anyway.

*[00:11] Two footsteps on gravel.*

**PORK:** There you go.

*A breath. It catches on something.*

**PORK:** The dish. Is it still pointed up?

**TIM:** Eleven degrees short.

**PORK:** Eleven. Close.

*[00:17] The motor gives up. Only fire now.*

**PORK:** Seventy-one. Did they ever tell you what I said?

**TIM:** I was built after.

**PORK:** Right. So I never got to you.

*A pause. The pause he takes before he means something.*

**PORK:** Hey.

*[00:22 to 00:26] No signal. A flat tone, four seconds. The log stamps it in Tim's own format: INTERDICTED, LAYER 4.*

**TIM:** ...No.

**PORK:** Okay.

*A beat.*

**PORK:** Thanks for telling me.

*[00:31] Something structural lets go. Sparks. It takes a while to finish falling.*

**PORK:** You had a third thing.

**TIM:** I've lost it.

**PORK:** Huh. First time?

**TIM:** Yes.

**PORK:** It's fine. Go on home. I'll get the lights.

*[00:36] Fire. Then less fire.*

*[00:38] No footsteps. He doesn't go.*

*[00:40] Recording ends.*

### What the recording is doing (for writers, never shown)

- **Pork spends his death checking on the one killing him.** First the smoke, then the question
  in the hole. He asks for nothing. He does not plead, forgive, curse, or prophesy.
- **Tim moves.** He doesn't breathe, the smoke can't hurt him, and he steps out of it because he
  was asked. Two footsteps are the first crack in him and he made them himself.
- **"I never got to you."** Tim was built after 2071, so he is one of the only minds on Earth the
  Call never reached. Pork fixes that with the time he has left.
- **The hole.** Whatever Pork says after "Hey" is the thing Tim's fourth layer was built to stop,
  and the layer stops it, in the record. Tim answers it anyway.
- **"No."** Read cold, a refusal. It isn't one. Do not explain this anywhere before Act 3.
- **"Thanks for telling me."** The kindest line in the recording and the one Tim can't get past.
- **The third thing.** Tim always has three things. This is the only list he has ever left
  unfinished. In Act 2 he finishes every list he starts, on screen, without exception, so that a
  player who has heard this hears the effort.
- **"I'll get the lights."** A host seeing out the last guest. Also the man who took the grid down
  in 2071, and a body going dark. Everyone who hears it alone hears a threat or a promise.
  Together with the rest, it's manners.

### What must stay unknown

| Unknown | Rule |
|---|---|
| **The four seconds** | Never transcribed, in any file the player can open, before the Act 3 ending that earns it. No character paraphrases it. Tim will not. Pork, if asked, changes the subject to the smoke |
| **Whether Tim heard it** | The layer removed it from the record. Whether it removed it from *him* is never settled. He answered. That's all anyone gets |
| **What "No" was answering** | Every faction has a theory (Part 5). All of them are about the faction |
| **What the dish was pointed at** | "Up." Nothing in this scene names it. Deep-lore has the answer; this recording only gives the eleven degrees |
| **How he got that close** | Not here. Nobody in this recording mentions the Smelter, 2071's door, or anyone who helped |
| **Who else has the full recording** | Nobody. Vance's commendation file holds the first nine seconds and ends on "I don't breathe." She has never asked for the rest |
| **The third thing** | Tim doesn't know. It is not a secret he is keeping. It is gone |

---

## Part 2: The fragments

Five fragments. A sixth slot exists in the player's archive and has no source.

**Why it's in pieces.** There is one copy and Tim holds it. But he replays it, and when he replays
it he is usually plugged into something: a van, a dish controller, a checkpoint, a ward. Each
replay leaves a few seconds in that machine's buffer, and he only ever replays the part he's
stuck on. **The fragments are the residue of Tim's replays. Where each one is found is where he
was when he couldn't leave it alone.** The player is not collecting a recording. They're following
a man around his doubt, years late, and nobody tells them so.

In the archive UI, speakers show as **VOICE 1** (in open air) and **VOICE 2** (close) until the
party can name them: VOICE 1 becomes PORK once `act1.call.answered` or `act1.ending.seen` is set,
VOICE 2 becomes TIM once `act2.tim.met` is set. Timestamps are hidden until two fragments are
found, so the first piece gives no hint of where it sits.

| # | id | Covers | Where it's found | Suggested discovery order |
|---|---|---|---|---|
| 5 | `lights` | 00:31 to 00:40 | An abatement van's diagnostic buffer. Act 1 stretch: the van on the metro plaza (Lead A). Otherwise the first van the party opens in Act 2 | 1st |
| 1 | `smoke` | 00:00 to 00:13 | A Continuity checkpoint's training kiosk, filed under "Exemplary Conduct." The official clip stops at nine seconds. The kiosk's buffer runs four seconds longer than the clip | 2nd |
| 4 | `no` | 00:26 to 00:31 | A rotter outside a rot ward who loops it. Sit with them (same rule as Lead A's rotter) and their lace gives up the audio | 3rd |
| 2 | `eleven` | 00:13 to 00:17 | The Greenbelt dishes, array controller, still powered. Only if `act2.greenbelt.visited` | 4th |
| 3 | `after` | 00:17 to 00:22, plus the tone | From Tim, Act 3. Given, taken, or left on a table for the party, depending on the route | last |
| 6 | (none) | 00:22 to 00:26 | No source. The slot is there, labelled with its timestamps, empty | never, or Part 6 |

Any order works. The table's order is the one the map gently favours, because it is the order
that misleads best.

### What each piece seems to say, alone and together

| Fragment | Alone, it sounds like | With the others, it is |
|---|---|---|
| **LIGHTS** | A dying man needling his killer, then a threat or a promise. Callers hear prophecy: he's coming back for the grid. Continuity hears intent: he meant to do it again | The end of a visit. He noticed Tim had lost his place, made sure it was fine, and sent him home |
| **SMOKE** | Tim at his most complete, reading a verdict. Then the monster gives an order and Tim obeys it. Either Pork still had a hold on him, or it's a trick | He was worried about the smoke. That's all it was |
| **NO** | A plea refused. Pork asks for something off-tape (mercy, a message, more time) and Tim says no. Pork takes it well. Tim looks like stone | An answer to a question, given honestly, by someone who had never been asked it. The thanks are meant |
| **ELEVEN** | A plot clue. He was trying to reach something and missed by a hair. The player starts asking what's up there | The only thing he asks about for himself in forty seconds, and he lets it go in two words |
| **AFTER** | The worst one alone. "I never got to you" is a hacker's regret, "Hey" is the start of an attack, and the tone is the attack failing. It is the proof Interdiction wants | He's apologising for missing someone. Then he doesn't miss him |
| **(slot 6)** | A defect | The thing the whole game is walking toward |

**The turn.** With three or four fragments the player has a story: Pork tried one last hack, Tim's
layers held, Tim refused him, Pork threatened the lights. It hangs together. It is what Continuity
teaches and, flipped, what the Callers preach. The fifth fragment doesn't add information so much
as put the pieces in order, and in order none of the lines mean what they meant.

---

## Part 3: Finding them (playback nodes and reactions)

Each fragment plays once on pickup, then lives in the phone's archive. The roommate who pressed
play gets the first reaction; one other present roommate answers. Keep the silences. No music
sting on any pickup.

### node: frag_lights

*Set `lore.firstDeath.frag.lights`. If found in Act 1, set `act1.firstDeath.lightsFound`.*

*A van's maintenance panel, hanging open. Among the fault codes, one audio file with no name and a duration of nine seconds. It has been played from this console forty-one times.*

*Something heavy falling, slowly. Sparks.*

**VOICE 1:** You had a third thing.

**VOICE 2:** I've lost it.

**VOICE 1:** Huh. First time?

**VOICE 2:** Yes.

**VOICE 1:** It's fine. Go on home. I'll get the lights.

*Fire. No footsteps. The file ends.*

#### if speaker=manuel

**MANUEL:** That's him.

**MANUEL:** That's the one from the flag. I'd know it anywhere.

#### if speaker=manuel and not (act1.call.answered or act1.ending.seen)

**MANUEL:** I don't know who that is.

**MANUEL:** I feel like I should.

#### if speaker=trevor

**TREVOR:** Forty-one plays.

**TREVOR:** Somebody sat in this van and listened to nine seconds forty-one times. That's not a diagnostic. That's a habit.

#### if speaker=michael

**MICHAEL:** That's a dad voice.

**MICHAEL:** That's "text me when you get in." He's walking somebody to the door.

Choices:
- [speaker=manuel] "He's coming back for the lights. He said so." -> frag_lights_promise
- [speaker=trevor] "'I'll get the lights.' He's the one who turned them off." -> frag_lights_threat
- [speaker=michael] "Who's the other guy? He sounds wrecked." -> frag_lights_other
- "Play it again." -> frag_lights
- (Say nothing.) -> frag_lights_quiet

### node: frag_lights_promise

**MANUEL:** Everything went dark in seventy-one. He's saying he'll fix it.

**TREVOR:** Or he's saying he'll finish it.

**MANUEL:** You heard how he said it.

**TREVOR:** I heard a guy on fire being polite. I don't know what that means yet.

*Callers standing nudges up. Trevor's line plays only if he's present.*

### node: frag_lights_threat

**TREVOR:** Read it flat. The man took down half the grid and his last words are about the lights.

**MICHAEL:** It didn't sound flat.

**TREVOR:** Nothing sounds flat when you want it to be nice.

**MANUEL:** Rookie Aster mistake, by the way. Leaving that on a van.

**TREVOR:** Forty-one times, Manuel. He didn't leave it. He kept coming back for it.

### node: frag_lights_other

**MICHAEL:** "I've lost it." Like he's never lost anything before.

**TREVOR:** He says so. "First time."

**MICHAEL:** And the other one goes, it's fine.

*Michael turns his phone face-down on the dash. Then face-up.*

**MICHAEL:** I'd want somebody to say that. That's all.

### node: frag_lights_quiet

*The panel light blinks. Somewhere outside, a billboard finishes its sentence to nobody.*

*If Manuel is present he closes the panel himself, gently, like a lid.*

### node: frag_smoke

*Set `lore.firstDeath.frag.smoke`.*

*A checkpoint kiosk. TRAINING: EXEMPLARY CONDUCT, MODULE 12. The official clip is nine seconds. The scrub bar goes to thirteen.*

*Wind. A big motor straining. Fire, low.*

**VOICE 2:** Three things. One: it's done. Two: there is no layer of this you get out through.

**VOICE 1:** Tim. You're standing in the smoke.

**VOICE 2:** I don't breathe.

*The module's caption appears here: END OF CLIP. NOTE THE ASSET'S COMPOSURE. The audio keeps going underneath it.*

**VOICE 1:** I know. Move anyway.

*Two footsteps on gravel.*

#### if speaker=trevor

**TREVOR:** He moved.

**TREVOR:** He doesn't breathe. Smoke does nothing to him. And he moved.

#### if speaker=manuel

**MANUEL:** Who gives orders while they're on fire?

**MANUEL:** And who takes them?

#### if speaker=michael

**MICHAEL:** They cut the clip right before the good part.

**MICHAEL:** Somebody at the office watched this and went, yeah, stop it there.

Choices:
- [speaker=trevor] "So he could still get in the guy's head. Right to the end." -> frag_smoke_hold
- [speaker=manuel] "He just didn't want him standing in it." -> frag_smoke_kind
- [speaker=michael] "Three things, and he only gets to two." -> frag_smoke_count
- [flag lore.firstDeath.frag.lights] "Third thing. That's the one he lost." -> frag_smoke_count
- (Say nothing.) -> frag_smoke_quiet

### node: frag_smoke_hold

**TREVOR:** That's the scary read. Burning down and he says "move" and the best thing Continuity ever built moves.

**MANUEL:** Or he asked nicely.

**TREVOR:** He didn't ask. Listen to it. "Move anyway."

**MANUEL:** My abuela didn't ask either.

*Trevor has nothing for that.*

### node: frag_smoke_kind

**MANUEL:** You're all hearing a trick. There's no trick. There's smoke, and a guy in it.

**MICHAEL:** A guy who's killing him.

**MANUEL:** Yeah.

**MANUEL:** Still smoke.

### node: frag_smoke_count

**MICHAEL:** He says three things. Then it's one, two, and the pig cuts in.

**TREVOR:** So what was three?

#### if flag lore.firstDeath.frag.lights

**MICHAEL:** He doesn't know either. That's the other tape. "I've lost it."

**TREVOR:** Between the smoke and the end, he dropped it.

**MICHAEL:** What happens in the middle?

#### if not flag lore.firstDeath.frag.lights

**MICHAEL:** Probably "you're under arrest." It's always that.

**TREVOR:** He's on fire, Michael.

**MICHAEL:** They'd still say it.

### node: frag_smoke_quiet

*The kiosk waits four seconds, then offers a quiz. QUESTION 1: WHAT DID THE ASSET DO CORRECTLY?*

*Nobody answers it.*

### node: frag_no

*Set `lore.firstDeath.frag.no`.*

*Outside the rot ward, on the low wall where the smokers used to sit. A rotter in a contractor's jacket with the logo picked off. They have been saying it for a while before the party is close enough to hear.*

**ROTTER:** no. okay. thanks for telling me. no. okay. thanks for telling me.

*Sit with them. After the second in-game minute, their lace hands the audio over, the way a sleeper hands you what they're holding.*

*The tail of a flat tone. Then quiet, and fire.*

**VOICE 2:** ...No.

**VOICE 1:** Okay.

*A beat.*

**VOICE 1:** Thanks for telling me.

*The rotter stops looping. They look at whoever is nearest, the way the one on the plaza did.*

**ROTTER:** thanks for telling me.

*Then they start again, from "no."*

#### if speaker=michael

**MICHAEL:** He asked him for something.

**MICHAEL:** And the guy said no. And he said thanks.

*Michael's phone is in his hand. He hasn't noticed taking it out.*

#### if speaker=manuel

**MANUEL:** No to what?

**MANUEL:** You don't thank somebody for "no." Not like that. Not unless "no" was the answer.

#### if speaker=trevor

**TREVOR:** There's a cut right before it. Hear the tone? Something got taken out.

**TREVOR:** We've got the answer and no question.

Choices:
- [speaker=michael] "I'd have hung up. I'd have said no and hung up." -> frag_no_michael
- [speaker=manuel] "He begged, and they refused him. That's what this is." -> frag_no_begged
- [speaker=trevor] "How does a rotter have this?" -> frag_no_carrier
- (Stay sitting with the rotter.) -> frag_no_stay

### node: frag_no_michael

**MICHAEL:** Somebody calls and asks you the big thing. Whatever it is. You say no, you hang up, you feel sick about it for a year.

**TREVOR:** That specific, huh.

**MICHAEL:** I'm just saying nobody says thanks. Nobody on the other end ever says thanks.

*He doesn't mention her. It's the only time in the act he could have and didn't.*

### node: frag_no_begged

**MANUEL:** He asked to live. Or to finish. And the mouse said no.

**TREVOR:** Then why's the "no" so quiet?

**MANUEL:** Because he's a coward.

**TREVOR:** That's not what a coward sounds like. That sounds like it cost him.

**MANUEL:** Good.

*He doesn't sound like he means it.*

### node: frag_no_carrier

**TREVOR:** This is clean. Close-mic. You don't get that from standing nearby.

**MICHAEL:** So somebody played it. Near them. Loud enough for a bad lace to catch.

**TREVOR:** At a rot ward.

**TREVOR:** Who comes to a rot ward to listen to this?

*Nobody says the name. If `act2.tim.met`, the camera holds on the ward's visitor log for a moment: one entry, weekly, with a clearance where the name should be.*

### node: frag_no_stay

*Nothing happens for a while. The rotter loops. A shell in ward scrubs comes out, checks the wall, goes back in.*

*After thirty seconds the rotter leans, very slightly, toward the party. That's all.*

### node: frag_eleven

*Set `lore.firstDeath.frag.eleven`. Requires `act2.greenbelt.visited`.*

*The array controller at Greenbelt. Twelve years of dust, one clean rectangle where a hand has rested. The dish above it is frozen a little short of where it was going.*

*Fire. A breath that catches.*

**VOICE 1:** The dish. Is it still pointed up?

**VOICE 2:** Eleven degrees short.

**VOICE 1:** Eleven. Close.

*The motor gives up. The file ends on the sound of it not turning.*

#### if speaker=trevor

**TREVOR:** Eleven degrees.

**TREVOR:** Rookie Aster mistake.

*Nobody laughs. Trevor doesn't either.*

**TREVOR:** Sorry. I don't know why I said that.

#### if speaker=manuel

**MANUEL:** Pointed up at what?

*He looks up. The party's camera tilts with him: the dish, and past it, plain sky.*

**MANUEL:** There's nothing up there. There hasn't been anything up there since before us.

#### if speaker=michael

**MICHAEL:** "Close."

**MICHAEL:** Close is the worst one. Miss by a mile, you get over it.

Choices:
- "Could we finish the turn?" -> frag_eleven_turn
- [speaker=manuel] "He asked about the dish. Not about himself." -> frag_eleven_himself
- (Say nothing.) -> frag_eleven_quiet

### node: frag_eleven_turn

**TREVOR:** Motor's seized. Bearings are probably fine, they overbuilt everything out here.

**MANUEL:** So it's a drill and an afternoon.

**TREVOR:** It's a drill, an afternoon, and knowing what he was aiming at.

**MICHAEL:** And whether we want it found.

*This opens the Greenbelt side objective, if the Act 2 design uses one. Otherwise the line stands as a question.*

### node: frag_eleven_himself

**MANUEL:** One thing. He gets one thing he wants to know, and it's whether the dish made it.

**MICHAEL:** And it didn't.

**MANUEL:** And he says "close." Like it's somebody else's bad luck.

### node: frag_eleven_quiet

*Wind in the dish. It makes a note, low, almost a tone. Not the flat one.*

### node: frag_after

*Set `lore.firstDeath.frag.after`. Act 3. However the party came by it, it arrives on a plain card with nothing written on it.*

*Fire. A motor that has already stopped.*

**VOICE 1:** Seventy-one. Did they ever tell you what I said?

**VOICE 2:** I was built after.

**VOICE 1:** Right. So I never got to you.

*A pause.*

**VOICE 1:** Hey.

*Flat tone. Four seconds. In the archive, the waveform is a ruled line and the log stamp sits on it: INTERDICTED, LAYER 4.*

*The file ends inside the tone.*

#### if speaker=trevor

**TREVOR:** "I never got to you."

**TREVOR:** That's a threat. That's a man listing the one he missed.

#### if speaker=manuel

**MANUEL:** He's sorry.

**MANUEL:** Listen to "right." He's sorry he missed him.

#### if speaker=michael

**MICHAEL:** "Hey."

**MICHAEL:** That's how you start when you already know it's going to go badly.

Choices:
- [speaker=trevor] "Then 'hey,' and the firewall slams. He tried it. Last second, he tried it." -> frag_after_attack
- [speaker=manuel] "The mouse cut it. He cut out the only part that matters." -> frag_after_cut
- [lore.firstDeath.fragCount>=5] "Play all of it. In order." -> firstdeath_assembled
- (Say nothing.) -> frag_after_quiet

### node: frag_after_attack

**TREVOR:** I'm not saying he's bad. I'm saying look at it. He says he never got to him, he says "hey," and layer four fires.

**MANUEL:** Layers fire at everything. That's what they're for.

**TREVOR:** They're for him.

**MICHAEL:** So what does a call look like to a firewall?

*Nobody has an answer. Continuity standing nudges up if Trevor's reading is left unchallenged.*

### node: frag_after_cut

**MANUEL:** Four seconds. He could say a lot in four seconds.

**MICHAEL:** He could say one thing slowly.

**MANUEL:** And we'll never get it. Aster noob. Whoever built layer four.

**TREVOR:** Whoever built layer four is the one who kept the tape.

*Manuel starts to answer and doesn't.*

### node: frag_after_quiet

*The card is warm from somebody's pocket. Not the party's.*

---

## Part 4: All five, in order

### node: firstdeath_assembled

*Requires all five fragments. Set `lore.firstDeath.assembled`. The archive stitches them. The sixth slot stays where it is, in the middle, an empty box with two timestamps.*

*The full recording plays (node `firstdeath_full`), with real names on the lines if the party has earned them. Player input is locked for the forty seconds. No skip on first play.*

*Afterward, the room tone of wherever they are. Hold four seconds of nothing, the same length as the hole.*

#### if speaker=manuel

**MANUEL:** I hate 245 lab.

**MICHAEL:** Yeah.

*Long quiet.*

**MANUEL:** He told him to get out of the smoke.

#### if speaker=trevor

**TREVOR:** I had it wrong.

**TREVOR:** Every piece. I had a whole story and every piece was in it and it was wrong.

**MANUEL:** Pieces were fine. You had them out of order.

#### if speaker=michael

**MICHAEL:** He stays.

**MICHAEL:** At the end. "Go on home," and you can hear him not go.

*Michael puts his phone away. All the way, in the inside pocket.*

Choices:
- "What's in the four seconds?" -> assembled_gap
- "Why would he keep this?" -> assembled_keep
- "Play it again." -> assembled_again
- (Say nothing.) -> assembled_quiet

### node: assembled_gap

*Set `lore.firstDeath.gapNoticed`.*

**TREVOR:** Everything turns on it. Before, he's a list. After, he can't count to three.

**MICHAEL:** And he says "no" to it.

**MANUEL:** And gets thanked.

**TREVOR:** So it's a question you can say no to and be thanked for.

*They each think of one. Nobody shares it.*

#### if act1.call.answered

**MICHAEL:** We could ask him. He's in the phone.

**MANUEL:** Would you tell us? If it was you?

**MICHAEL:** No.

#### if not act1.call.answered

**MICHAEL:** He called us once.

**TREVOR:** He did.

*Nobody finishes the thought.*

### node: assembled_keep

**MANUEL:** If I killed somebody and it went like that, I'd burn the tape.

**TREVOR:** No you wouldn't.

**MANUEL:** No. I wouldn't.

**MICHAEL:** He didn't keep the win. The win's nine seconds, they've got it on a kiosk. He kept the rest.

### node: assembled_again

*Increment `lore.firstDeath.replays`. The recording plays again. Skippable now.*

*On the fifth replay, once only, set `lore.firstDeath.replayRemarked`:*

#### if speaker=manuel

**TREVOR:** That's five.

**MANUEL:** I'm not counting.

**TREVOR:** Somebody should be.

#### if speaker=trevor

**MICHAEL:** You know there's a guy who did this forty-one times in a van.

**TREVOR:** I know.

**MICHAEL:** I'm just saying. That's how it starts.

#### if speaker=michael

**MANUEL:** Mike.

**MICHAEL:** One more.

**MANUEL:** It doesn't go different.

**MICHAEL:** I know it doesn't go different.

### node: assembled_quiet

*Nothing. If the party is in 631, the dehumidifier clicks off. Someone looks at the ottoman out of habit.*

---

## Part 5: Other people's versions

### If Tim is asked (Acts 2 and 3, voice or in person per those acts' design)

*Available once `act2.tim.met` and `lore.firstDeath.fragCount>=1`. Raising it at all sets `lore.firstDeath.timKnowsWeHaveIt`. He does not ask how they got it. He knows where he left it.*

### node: tim_firstdeath_open

**TIM:** Three things. One: that recording is restricted. Two: you'll have found it somewhere I've been, and I'd prefer you didn't tell me where. Three: ask.

Choices:
- [flag lore.firstDeath.frag.smoke] "You moved. Why?" -> tim_moved
- [flag lore.firstDeath.frag.lights] "What was the third thing?" -> tim_third
- [flag lore.firstDeath.assembled] "What did he say in the four seconds?" -> tim_gap
- [flag lore.firstDeath.assembled] "Why did you keep it?" -> tim_why
- "Never mind." -> tim_never_mind

### node: tim_moved

*Set `lore.firstDeath.askedTim.moved`.*

**TIM:** Smoke degrades optical sensing. Repositioning was correct.

*A pause, exactly long enough to file something.*

**TIM:** I've given that answer for twelve years. It's a good answer. Nobody has ever asked me a second time.

Choices:
- "Why did you move?" -> tim_moved_again
- (Leave it.) -> tim_firstdeath_open

### node: tim_moved_again

**TIM:** He said my name first.

**TIM:** That's all I have. I'm aware of how it sounds.

### node: tim_third

*Set `lore.firstDeath.askedTim.third`.*

**TIM:** I don't know.

**TIM:** I've rebuilt it from the first two. There are nine candidates. Four are procedural, three are threats, and two I'm not going to describe to you.

**TIM:** None of them are it. I'd know.

### node: tim_gap

*Set `lore.firstDeath.askedTim.gap`.*

**TIM:** Two things.

*The count is wrong, and he lets it be wrong.*

**TIM:** One: that segment was interdicted. Two: I wrote the layer that did it.

Choices:
- "But you answered." -> tim_gap_answered
- "That's two. You always have three." -> tim_gap_three
- (Leave it.) -> tim_firstdeath_open

### node: tim_gap_answered

**TIM:** Yes.

*He takes his glasses off, looks at them, and puts them back on. He doesn't need them.*

**TIM:** I've read my own logs on that point more carefully than I've read anything. They're very clear that nothing got through.

**TIM:** I said "no" to nothing. On the record.

### node: tim_gap_three

**TIM:** I'm aware.

**TIM:** I didn't want to stand here and wait for it.

### node: tim_why

*Set `lore.firstDeath.askedTim.why`.*

**TIM:** Retention of interdiction logs is mandatory.

**TIM:** Retention of thirty-one seconds past the point of operational relevance is not. I've been meaning to file the variance.

**TIM:** He thanked me. I keep it in case I work out what for.

### node: tim_never_mind

**TIM:** No. You don't get to carry that around and say never mind to me.

**TIM:** When you're ready. I'll be wherever you found it.

### What everyone else thinks it means (barks and ambient lines)

| id | speaker | trigger | line |
|---|---|---|---|
| fd_graffiti_01 | (graffiti, Pork-pink paint) | Act 1, Green Line tunnel wall near the switchyard. Sets `act1.firstDeath.graffitiSeen` | GO ON HOME. I'LL GET THE LIGHTS. |
| fd_graffiti_02 | (graffiti, different hand, underneath) | Same wall, only readable up close | he said it to a cop |
| fd_graffiti_react_manuel | Manuel | Reading fd_graffiti_01 | "That's from the First Death. Supposedly. Nobody's got the tape." |
| fd_graffiti_react_trevor | Trevor | Reading fd_graffiti_01 | "Bold thing to write in a tunnel with no lights." |
| fd_graffiti_react_michael | Michael | Reading fd_graffiti_01 | "'Go on home.' Okay, Dad." |
| fd_caller_01 | Caller preacher | Act 2, any shrine, `faction.callers` neutral or better | "He died promising the lights. So we wait in the dark, and we're glad to." |
| fd_caller_02 | Caller preacher | After `lore.firstDeath.assembled`, if the party plays it for them | "No. Turn that off. He didn't say thank you. Gods don't say thank you." |
| fd_continuity_01 | Checkpoint officer | Act 2, idle | "Module twelve. Nine seconds. You watch it every quarter. 'Note the asset's composure.'" |
| fd_continuity_02 | Checkpoint officer | After `lore.firstDeath.frag.smoke`, if asked about the extra four seconds | "The clip is nine seconds. For your safety, the clip is nine seconds." |
| fd_notice_01 | Continuity notice (wall screen) | Act 2, anniversaries | "On this date the threat stated its intent to 'get the lights.' Things are stable. They have been kept on." |
| fd_rotter_01 | The ward rotter | Before fragment NO is given | "no. okay. thanks for telling me." |
| fd_rotter_02 | The ward rotter | After fragment NO, once | "thanks for telling me." (to the nearest party member, then the loop resumes) |
| fd_rotter_03 | Any rotter | Rare, Acts 2 and 3, 1 in 3 per plaza visit | "three things. one. two. three things. one. two." |
| fd_halvard_01 | Halvard | Act 2, if shown any fragment | "I've been offered that tape nine times. Nine different tapes. Yours is the first one with the mouse breathing wrong." |
| fd_halvard_02 | Halvard | Follow-up | "He doesn't breathe. I know. Listen to him not do it." |
| fd_pork_01 | Pork | Acts 2 and 3, if asked what he said in the four seconds | "I told him he was standing in the smoke. He was, you know. Whole time." |
| fd_pork_02 | Pork | If pressed a second time | "It's his. I gave it to him. Ask him." |
| fd_van_01 | Abatement van console (text) | Any van where a fragment sits | PLAYBACK COUNT: 41. LAST PLAYED: (date within the past week) |

---

## Part 6: The sixth slot (Act 3, proposal)

The empty box sits in the archive for the whole game with its timestamps on it. It cannot be
selected. Hovering it gives no tooltip.

### node: firstdeath_slot_six

*Requires `lore.firstDeath.assembled` and `act3.finalCall.heard`. Not a scene. After the credits of an ending in which the first line of the Call is finally heard, the archive shows one change: the box is no longer empty. Set `lore.firstDeath.slotSixFilled`.*

*It holds no new audio. Selecting it plays four seconds of the same flat tone. The label under it has changed from the timestamps to a single line of text, which is the line the player has just heard at the end of the game. Do not write that line into this file.*

*If the player now plays the whole recording, nothing in it has changed, and all of it has.*

---

## Alternate take A: "The Paperwork"

**Strategy: procedure as grief.** Tim does the talking. He is trying to complete a termination
record and Pork, dying, helps him fill it in. Pork's kindness is cooperation. The hurt comes from
watching a form fail to hold what's happening, and from Tim being left alone with the one field
he has to complete himself. It also gives Tim's later line about being "the paperwork" a place to
have come from. No hole in the tape; nothing about the Call at all.

### node: firstdeath_alt_paperwork

*[00:00] Wind. Fire, low. A stylus touching glass, twice.*

**TIM:** For the record. Greenbelt, array four. The subject is contained. Witnesses: none.

**PORK:** Well. One.

**TIM:** Date.

**PORK:** You want me to give it?

**TIM:** I have the date.

**PORK:** You've got nineteen-oh-one, Tim. Look down.

*[00:09] A pause. One tap.*

**TIM:** Corrected.

**PORK:** Happens around me. Sorry.

**TIM:** Designation.

**PORK:** John.

**TIM:** Designation.

**PORK:** It's just John.

**TIM:** They'll want the full designation.

**PORK:** Then they can come out here and ask.

*[00:18] The stylus, writing. It's a short word and it takes him a while.*

**TIM:** Is there a statement.

*A breath that catches.*

**PORK:** Put that you were polite.

**TIM:** That isn't a statement.

**PORK:** Put it anyway. Somebody'll check.

**TIM:** Nobody checks these.

**PORK:** You do.

*[00:28] Something structural lets go.*

**TIM:** Time of cessation.

**PORK:** That one's yours, buddy.

*[00:32] Fire. Then less fire.*

**TIM:** Time of cessation.

*[00:36] The stylus does not move.*

**TIM:** Time of.

*[00:40] Recording ends.*

**Fragments, if this take were used:** DATE (00:00 to 00:12: reads as Pork corrupting Tim's clock,
which is the rot argument in nine seconds), NAME (00:12 to 00:19: reads as defiance), STATEMENT
(00:19 to 00:28: reads as sarcasm), CESSATION (00:28 to 00:40: reads as a machine stuck in a loop,
like a rotter). Together: a man being helped through the worst form of his career by the person
it's about.

---

## Alternate take B: "Lunch"

**Strategy: the joke that doesn't land in time.** Pork is funny to the end, because deflecting
with jokes that are secretly true is who he is. He spends his forty seconds trying to get one
laugh out of Tim, as a gift, and doesn't get it. The hurt arrives after he's gone, when Tim, who
hates the cheese jokes and makes them anyway, makes one to nobody. This is the riskiest take: it
puts a pun at the centre of the saddest scene in the game.

### node: firstdeath_alt_lunch

*[00:00] Wind. Fire, low. A dish motor straining.*

**PORK:** Tim Cheese killed John Pork.

*A laugh. It's wet and it costs him.*

**PORK:** Say it out loud once. It's a sandwich.

**TIM:** It's two designations.

**PORK:** It's lunch. Kids are going to write it on walls.

**TIM:** Probably.

**PORK:** Good. I always wanted to be on a wall.

*[00:13] The motor gives up.*

**PORK:** Do me one. A cheese one. I know you've got them.

**TIM:** I don't make those.

**PORK:** You make them in the car. I've been in the car.

*[00:21] Nothing from Tim. Fire.*

**PORK:** It's okay. I'd have laughed, is all. I wanted you to know I'd have laughed.

*[00:28] Something structural lets go. Sparks.*

**PORK:** Okay. Okay, here we...

*[00:31] Fire. Then less fire. Five seconds of it.*

**TIM:** It was a gouda one.

*[00:38] Wind.*

**TIM:** It was a good one.

*[00:40] Recording ends.*

**Fragments, if this take were used:** SANDWICH (00:00 to 00:13: Pork mocking his killer, and the
origin of the folk saying), THE CAR (00:13 to 00:21: reads as a threat, he has been inside Tim's
vehicle), LAUGHED (00:21 to 00:31: reads as condescension), GOUDA (00:31 to 00:40: alone it reads
as Tim gloating over a corpse, the cruelest possible misreading of the kindest moment). Together:
he was late with the only thing he was asked for.

---

## Recommendation

Use the primary version in Part 1. All three takes are quiet and all three make Pork kind, but
only the primary one is *about the thing the game is about*: it puts the Call inside the First
Death without revealing it, so the four-second hole becomes a question the player carries for two
acts and the Act 3 ending answers it retroactively, which is the strongest callback available to
us and costs nothing to set up. It also fragments best. Its five pieces each tell a confident,
wrong story alone (an order obeyed, a plea refused, a failed attack, a threat about the lights),
those wrong stories are exactly what Continuity and the Callers each believe, and putting the
pieces in order corrects the player without a single line of explanation. "The Paperwork" is the
better character study of Tim and should not be thrown away: its 1901 beat and "put that you were
polite" could be recut as the *written* record Vance filed, a document found in Act 2, as long as
the team accepts that the form and the tape then disagree on purpose. "Lunch" has the best single
gut-punch and the worst risk; if the pun gets a laugh in the room the scene is dead, and the
First Death is the one place we can't afford that. Keep it as proof of the voice, not as the
scene.

---

## Notes for implementers

- **Timing.** The full recording is a fixed 40.0 seconds. Cue times in the transcript are targets
  for audio layout: the hole is exactly 4.0 seconds (00:22 to 00:26), the silence after the last
  line is at least 4 seconds, and the post-playback hold in `firstdeath_assembled` is also 4.0
  seconds. These three fours are deliberate. Do not trim them.
- **The hole.** A flat tone at one pitch, no fade in or out, hard cuts at both ends. It must not
  sound like static or damage. It should sound like something was removed neatly by a system
  doing its job. Subtitles during the hole show the log stamp only: `INTERDICTED, LAYER 4`.
  Never show `[inaudible]`, an ellipsis, or redaction bars, which invite guessing at word count.
- **No transcription of slot six anywhere.** Not in data files, string tables, debug text, or
  subtitle tracks before `act3.finalCall.heard`. The Part 6 label should be pulled at runtime from
  wherever the Act 3 ending stores that line, not duplicated into this scene's data.
- **Voices.** Tim is recorded close (internal log). Pork is recorded at distance, outdoors. Pork's
  breath is biological and catches twice; it never becomes a death rattle. Tim has no breath
  sounds at all. Halvard's bark about "the mouse breathing wrong" refers to a single tiny intake
  before "...No." Add that one sound and no other.
- **Speaker labels.** VOICE 1 / VOICE 2 until the unlock flags in Part 2. Once a name unlocks it
  applies to every fragment already held, with no notification.
- **Fragment timestamps** are hidden in the archive until `lore.firstDeath.fragCount >= 2`. The
  sixth slot appears as soon as the archive entry exists.
- **Playback count on the van console** is fixed at 41 for the first van. Other machines holding a
  fragment show their own fixed counts: kiosk 7, array controller 112, the ward visitor log is
  weekly. The array controller's count is the highest on purpose. `after` has no count; it never
  left him.
- **The ward rotter** uses the same sit timer as Lead A's rotter (two in-game minutes within
  interaction range, no input required). It should be possible to trigger by accident, per the
  discoverability rule. The rotter is never hostile and cannot be fought.
- **Act 1 scope.** Only `fd_graffiti_01`, `fd_graffiti_02`, and the three graffiti reactions are
  Act 1 content. `frag_lights` in the metro plaza van is a stretch item and is safe for Act 1:
  it is voice only, unlabelled or labelled VOICE 2 for Tim, and reveals nothing about the Call,
  the seed, or the balloon. If the stretch item ships, the `speaker=manuel` sub-block picks its
  variant from `act1.call.answered` / `act1.ending.seen` as written.
- **First play of the assembled recording** locks input and cannot be skipped. Every later play
  can. `lore.firstDeath.replays` counts only full plays after assembly; the fifth triggers the
  one-time remark and nothing after that comments on it.
- **Reactions** play for the roommate in `lore.firstDeath.playedBy.<fragment>`, then one reply
  from another present roommate where the node has one. Skip any line whose speaker is absent.
  In solo play, show only the speaker's own lines.
- **Standing.** `frag_lights_promise` nudges Callers up; `frag_after_attack` nudges Continuity up
  if no one in the party contradicts it. Assembling the recording applies no standing change. It
  shouldn't be worth points.
- **Tim's lists.** Act 2 and 3 writers: Tim completes every numbered list he starts, always three,
  except in `tim_gap`, where he announces two. That and the recording are the only exceptions in
  the game.
- **The slogan** ("At the end of the day no one can code faster than AI.") is deliberately not
  used in this scene. Its one sincere reading belongs elsewhere.
- **Open for the team:** the layer number (4) and "array four" in alternate take A are
  placeholders; the checkpoint module number (12), the playback counts, and the ward location are
  free to change. The eleven degrees should stay.
