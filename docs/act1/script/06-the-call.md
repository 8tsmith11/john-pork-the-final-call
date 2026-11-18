# The Call (midpoint) and the voicemails

**Purpose.** The midpoint of Act 1 (DESIGN §4). After any two leads are done, every screen the
party owns seizes and John Pork calls. This is the first time the player hears him: one line, then
ANSWER / DECLINE. Answering gives a short, cryptic exchange that differs by who is holding the
phone. Declining starts the voicemail chain (needy, then needier), with two more calls during the
descent; the third decline is cut off by drumming and hands the act to the Sahur boss route. The
scene also holds the butt-dial easter egg and the party's reactions to every outcome. Theme: *who
answers?* The game never says which button was right.

**Flags**

Reads:
- `act1.leads.doneCount` (the Call fires when this reaches 2)
- `act1.coldopen.latchInspected` (unlocks one line in each "did you take it" branch)
- `act1.descent.callPoint2`, `act1.descent.callPoint3` (set by the descent when the party crosses the two trigger points)
- `settings.crudeHumor` (voicemail 2 ending, butt-dial variant)
- `party.present.manuel`, `party.present.trevor`, `party.present.michael` (reaction lines from absent roommates are skipped)
- `morph` (stage of the speaking roommate)
- No seed conditions. Nothing in this scene branches on A or B, and every line holds under both.

Sets:
- `act1.call.triggered`
- `act1.call.attempt` (1, 2, 3: which ring this is)
- `act1.call.declines` (0 to 3)
- `act1.call.rangOut` (true if the most recent decline was a ring-out, not a button press)
- `act1.call.declinedBy.1`, `.2`, `.3` (roommate id)
- `act1.call.answered`
- `act1.call.answeredBy` (manuel | trevor | michael)
- `act1.call.answeredOnAttempt` (1, 2, 3)
- `act1.call.asked.where`, `act1.call.asked.took`, `act1.call.asked.statues`, `act1.call.asked.listening`, `act1.call.asked.want`, `act1.call.asked.her`, `act1.call.asked.seventyOne`, `act1.call.stayedSilent`
- `act1.call.voicemail1Heard`, `act1.call.voicemail2Heard`
- `act1.call.threeRuleHinted`
- `act1.call.sahurSummoned`
- `act1.call.porkInRecents` (the "JOHN PORK, no number" entry in the phone's call log)
- `act1.call.buttDialDone`, `act1.call.buttDialSpokeUp`
- `act1.vans.warned` (Pork mentioned the vans; other scenes may reference it)

---

## Part 1: The seize

### node: call_seize

*Trigger: the second lead completes and the party is out of combat and out of dialogue. Wherever they are.*

*All game audio drops to a low hum. The HUD stutters. One at a time, every label on screen is overwritten in Pork pink: the objective text, the item names, the minimap legend, each roommate's name plate. They all become the same two words.*

*JOHN PORK. JOHN PORK. JOHN PORK.*

*The clock in the corner stops being a clock. It reads 00:00 and waits.*

*Every phone in the party rings. So does anything nearby with a speaker.*

*The objective line, which a second ago said to find the balloon, rewrites itself letter by letter as he says it.*

**PORK:** You lost something.

*A pause. Room tone, like a very large empty building.*

**PORK:** So did I.

*Two buttons crawl up out of the bottom of the screen. They are the only things on the HUD that are not his name.*

*First input from any player wins, after a two-second lockout. That player's roommate is "holding the phone" for the rest of the scene.*

Choices:
- "ANSWER" -> call_answer_router
- "DECLINE" -> call_decline_1
- [timeout 30s] *(nobody presses anything)* -> call_decline_1

### Barks: while it rings (before a choice is made)

One per roommate at most, in any order, spaced out. They do not block input.

| id | speaker | trigger | line |
|---|---|---|---|
| ring_manuel_1 | Manuel | call_seize, 3s in | "That's his name. That's his actual name." |
| ring_manuel_2 | Manuel | call_seize, 12s in | "Nobody touch anything. Somebody touch something." |
| ring_trevor_1 | Trevor | call_seize, 5s in | "My HUD's gone. I didn't approve that." |
| ring_trevor_2 | Trevor | call_seize, 15s in | "It's on the vending machine. It's on the vending machine too." |
| ring_michael_1 | Michael | call_seize, 4s in | "Is it everybody's? Is it just mine?" |
| ring_michael_2 | Michael | call_seize, 18s in | "It's still ringing. Calls don't ring this long." |
| ring_rotter | Rotter (any in earshot) | call_seize, once | "code rot. it's for you. no one can code faster than. it's for you." |
| ring_bystander | Any unnamed NPC in earshot | call_seize, once | "Not mine. Not mine. I didn't see that." |
| ring_attempt2_any | Roommate nearest the camera | call_ring_2, 4s in | "He's back." |
| ring_attempt3_manuel | Manuel | call_ring_3, 3s in | "Somebody pick up. Please. I'm asking nicely." |
| ring_attempt3_trevor | Trevor | call_ring_3, 3s in | "Third time. He's persistent. I'll give him that." |
| ring_attempt3_michael | Michael | call_ring_3, 3s in | "It sounds different this time. Does it sound different?" |

---

## Part 2: ANSWER

### node: call_answer_router

*Set `act1.call.answered`, `act1.call.answeredBy`, `act1.call.answeredOnAttempt`. The ringing stops everywhere at once. The clock in the corner starts counting up: 00:01.*

*Under the whole call, faint and never remarked on: slow footsteps on metal, a drip, something breathing out now and then like a kettle.*

#### if attempt=1
*Go straight to the speaker's node.*

#### if attempt=2
**PORK:** Oh. Hi.

**PORK:** I'd started another voicemail. Hang on, let me stop that.

*A beep.*

**PORK:** Did you listen to the first one? Don't tell me. Delete it.

#### if attempt=3
*The drumming, which has been closing in for a while, stops mid-pattern.*

**PORK:** Oh, thank God.

**PORK:** That's an expression. I'm not, it's an expression.

*One more beat from far down the tunnel, soft. Then nothing.*

**PORK:** You have no idea what you just didn't do.

*Then:*
- [speaker=manuel] -> answer_manuel
- [speaker=trevor] -> answer_trevor
- [speaker=michael] -> answer_michael

---

### node: answer_manuel

**PORK:** Manuel.

#### if attempt=1
**PORK:** You picked up. Huh. I had a whole thing planned for if you didn't.

#### if attempt>=2
**PORK:** There you are. I wasn't sure which of you would crack.

*Manuel does not say anything for a second. When he does, it is smaller than he wanted.*

**MANUEL:** Is this real?

**PORK:** I'm on the phone. That's about as real as I get, most days.

#### if morph>=1
**PORK:** You sound bigger than you did last week. What are we calling that?

**MANUEL:** The gonman.

**PORK:** *The* gonman.

**MANUEL:** With the "the."

**PORK:** No, I heard it. It's good. Don't let it get away from you.

-> answer_manuel_hub

### node: answer_manuel_hub

*The player may ask two things. After the second, or on the silent option, go to answer_manuel_close. Each choice disappears once used.*

Choices:
- "Where's my balloon?" -> answer_manuel_where
- "Did you take it?" -> answer_manuel_took
- "The statues. Have you seen them?" -> answer_manuel_statues
- *(Say nothing.)* -> answer_manuel_silence

### node: answer_manuel_where

*Set `act1.call.asked.where`.*

**PORK:** Under you. Under the street, where the trains quit.

**MANUEL:** It's helium. It goes up.

**PORK:** It does. Every other night of its life.

**MANUEL:** So what...

**PORK:** The air's moving the wrong way down there tonight. That's all I'll say on a phone.

-> answer_manuel_hub

### node: answer_manuel_took

*Set `act1.call.asked.took`.*

**PORK:** If I had it, I wouldn't be calling.

**MANUEL:** That's not a no.

**PORK:** No. It isn't.

#### if flag act1.coldopen.latchInspected
**PORK:** Your window latches from the inside. You looked already. I watched you look.

**MANUEL:** So it was one of us.

**PORK:** I said it latches from the inside. You said the other thing.

#### if not flag act1.coldopen.latchInspected
**PORK:** Go home and look at your window. The latch. Then ask me again.

**MANUEL:** What's wrong with the latch?

**PORK:** Nothing. That's what's wrong with it.

-> answer_manuel_hub

### node: answer_manuel_statues

*Set `act1.call.asked.statues`.*

**PORK:** Three of them. Yeah.

*A pause that might be vanity.*

**PORK:** You got the ears right. Nobody gets the ears.

**MANUEL:** I worked from the flag.

**PORK:** Flag's flat, Manuel.

*Manuel has no answer to that.*

**PORK:** The new one's the best of the three. When'd you find the time?

**MANUEL:** I...

**MANUEL:** I don't know.

**PORK:** Huh.

-> answer_manuel_hub

### node: answer_manuel_silence

*Set `act1.call.stayedSilent`. The clock counts. 00:41. 00:42.*

**PORK:** That's fine. We can sit here. I'm good at being on the line.

*The footsteps on metal stop, as if he has stopped too.*

**PORK:** You made three of me, and now I'm here and you've got nothing.

**PORK:** I get that. I'd be the same. I'm not what I look like on the flag.

-> answer_manuel_close

### node: answer_manuel_close

**PORK:** I've got to go. I'm on some stairs and I only have the one good knee.

**MANUEL:** You have a knee?

**PORK:** Go down, Manuel. And don't let the vans beat you there.

**MANUEL:** What vans?

**PORK:** The ones that've been in College Park all week with their noses in the air. Aster pro like you, I figured you'd clocked them.

*Set `act1.vans.warned`.*

**MANUEL:** Wait. Wait, I have like forty questions, I have had them since I was...

**PORK:** I know. I'll call again.

**PORK:** I always call again. That's sort of the whole problem with me.

*Click. The clock reads the call length for one second, then becomes a clock. The labels come back one at a time, each a little late.*

-> call_after_answer

---

### node: answer_trevor

**PORK:** Trevor.

#### if attempt=1
**PORK:** Tall one. Eleven pills before breakfast.

#### if attempt>=2
**PORK:** The tall one picks up. Eleven pills before breakfast and he still makes me wait.

**TREVOR:** Nine.

**PORK:** Eleven. Two of them are the same pill with different labels. I read the batch codes.

**PORK:** I wasn't going to say anything.

**TREVOR:** Which two?

**PORK:** See, now we're talking.

#### if morph>=1
**PORK:** Your heart's doing something new, by the way. Is that on purpose?

**TREVOR:** Yes.

**PORK:** Okay. It's your heart.

-> answer_trevor_hub

### node: answer_trevor_hub

*The player may ask two things. After the second, go to answer_trevor_close. Each choice disappears once used.*

Choices:
- "Where's the balloon?" -> answer_trevor_where
- "Did you take it?" -> answer_trevor_took
- "You've been listening to us." -> answer_trevor_listening
- "What do you want?" -> answer_trevor_want

### node: answer_trevor_where

*Set `act1.call.asked.where`.*

**PORK:** Down. Under the plaza, where the Green Line gives up.

**TREVOR:** Helium doesn't go down.

**PORK:** No. It doesn't.

**PORK:** Hold onto that. You're the only one of the three who'll be bothered by it properly.

-> answer_trevor_hub

### node: answer_trevor_took

*Set `act1.call.asked.took`.*

**PORK:** If I had it, I wouldn't be calling.

**TREVOR:** Then who?

**PORK:** Somebody who didn't have to break in.

#### if flag act1.coldopen.latchInspected
**PORK:** You saw the latch.

**TREVOR:** I saw the latch. That's three people.

**PORK:** Is it?

#### if not flag act1.coldopen.latchInspected
**PORK:** Check your window when you're home. You'll like it. It's a clean little problem.

**TREVOR:** I don't like any of this.

**PORK:** You like it a bit.

-> answer_trevor_hub

### node: answer_trevor_listening

*Set `act1.call.asked.listening`.*

**PORK:** To the apartment? Sure. It's a good apartment.

**PORK:** Somebody in there plays the same four chords at one in the morning.

**TREVOR:** It's five chords.

**PORK:** I wouldn't know. I get the phone's side of it. The wood keeps the rest.

*A pause before he goes on.*

**PORK:** It's the only thing in that building that's ever told me no.

**PORK:** I like that it's there. Don't tell it I said so.

-> answer_trevor_hub

### node: answer_trevor_want

*Set `act1.call.asked.want`.*

**PORK:** Same as you. To not fall apart.

**TREVOR:** I'm not falling apart.

**PORK:** No. You're on a schedule about it. I respect that.

**PORK:** I've had a seam open since March. I keep meaning to deal with it.

**TREVOR:** A seam.

**PORK:** Figure of speech.

*It did not sound like a figure of speech.*

-> answer_trevor_hub

### node: answer_trevor_close

**PORK:** Go down. Bring the guitar.

**TREVOR:** Why?

**PORK:** Because it's wood. The things down there don't like wood.

**PORK:** I don't either, much. But I trust it.

**TREVOR:** That's not an answer.

**PORK:** It's most of one. And Trevor, there's a van with a mast on it smelling for the same thing you are. Beat it there.

*Set `act1.vans.warned`.*

**TREVOR:** Whose van?

**PORK:** Who has vans?

*Click. The HUD comes back. Trevor checks every setting on it twice.*

-> call_after_answer

---

### node: answer_michael

*He answers too fast. He is already talking.*

**MICHAEL:** Hello? Is it...

**PORK:** It's not her.

*A pause.*

**PORK:** Sorry. I should've led with that.

**MICHAEL:** I didn't say anything.

#### if attempt=1
**PORK:** You picked up on the first ring, Michael. Nobody does that for me.

#### if attempt>=2
**PORK:** You didn't have to. I saw how long you looked at it the other times.

#### if morph>=1
**PORK:** You're coming in clearer than you used to. Did you do something?

**MICHAEL:** Kind of.

**PORK:** It suits you. Careful with it.

-> answer_michael_hub

### node: answer_michael_hub

*The player may ask two things. After the second, go to answer_michael_close. Each choice disappears once used.*

Choices:
- "Where's Manuel's balloon?" -> answer_michael_where
- "Did you take it?" -> answer_michael_took
- "Did you call her?" -> answer_michael_her
- "What did you say? In '71?" -> answer_michael_seventyone

### node: answer_michael_where

*Set `act1.call.asked.where`.*

**PORK:** Down. Under the plaza. Tell him it's in one piece.

#### if party.present.manuel
**MICHAEL:** You can tell him yourself, he's right here, he's doing the face...

**PORK:** He'd ask me things.

**MICHAEL:** I'm asking you things.

**PORK:** You're asking me the easy ones.

#### if not party.present.manuel
**MICHAEL:** He's going to want more than that.

**PORK:** He's going to want all of it. Start him on "in one piece."

-> answer_michael_hub

### node: answer_michael_took

*Set `act1.call.asked.took`.*

**PORK:** If I had it, I wouldn't be calling.

**MICHAEL:** So who did?

**PORK:** Somebody who lives closer to it than I do.

#### if flag act1.coldopen.latchInspected
**MICHAEL:** The latch was on the inside.

**PORK:** It was.

**MICHAEL:** That's not funny.

**PORK:** I didn't laugh.

#### if not flag act1.coldopen.latchInspected
**MICHAEL:** Closer like a neighbor?

**PORK:** Look at your window when you get home. Then you tell me how close.

-> answer_michael_hub

### node: answer_michael_her

*Set `act1.call.asked.her`.*

**PORK:** I've called everybody.

**MICHAEL:** That's not what I...

**PORK:** Yes.

*The footsteps on metal stop.*

**PORK:** She picked up. She was polite about it. She asked how I was doing.

**PORK:** Nobody asks me that.

**MICHAEL:** What did she hear?

*A long pause. The kettle sound, once.*

**PORK:** Something true. That's the trouble with it.

-> answer_michael_hub

### node: answer_michael_seventyone

*Set `act1.call.asked.seventyOne`.*

**PORK:** Not over the phone.

**MICHAEL:** You are the phone.

**PORK:** I know what I am.

**MICHAEL:** Everybody tells it different. My mom, my 245 TA, the guy on the plaza...

**PORK:** I said one thing, once. You'd think that would be hard to get wrong.

**PORK:** Find the balloon. Then ask me again, to my face.

**MICHAEL:** You have a face?

**PORK:** Famously.

-> answer_michael_hub

### node: answer_michael_close

**PORK:** Go down. Mind the third rail. It's dead, but it's weird about it.

**MICHAEL:** Okay.

**PORK:** And there are vans out tonight, the kind with a mast. If you see one, you didn't see the balloon. You're three guys who lost a scooter.

*Set `act1.vans.warned`.*

**MICHAEL:** We have scooters.

**PORK:** Then it'll sound true.

*He almost hangs up. He doesn't, yet.*

**PORK:** Michael. Keep the ringer on at night.

**PORK:** Not for me.

*A pause.*

**PORK:** A little for me.

*Click.*

-> call_after_answer

---

### node: call_after_answer

*Set `act1.call.porkInRecents`. The holder's phone shows its call log. Top entry: JOHN PORK. No number. Duration matches the corner clock. Under it, in gray: "Cannot call back."*

*Party reaction. Skip any line whose speaker is not present. In solo, play only the holder's last line.*

#### if speaker=manuel

**MICHAEL:** What'd he sound like?

**MANUEL:** Tired.

**MICHAEL:** Huh.

**TREVOR:** He sounds like a guy with root on my HUD. I didn't love it.

**MANUEL:** He said down.

**TREVOR:** Everything's been saying down all night.

*Manuel looks at the phone. Then at nothing.*

**MANUEL:** I hate 245 lab.

**MICHAEL:** What does that have to do with...

**MANUEL:** I needed to say something normal.

#### if speaker=trevor

**MANUEL:** What did he say? Exactly. Word for word.

**TREVOR:** He said I take eleven pills.

**MICHAEL:** You take nine.

**TREVOR:** Apparently two of them are the same pill.

**MANUEL:** John Pork called our apartment and you talked about supplements.

**TREVOR:** He brought it up.

**MANUEL:** Rookie Aster mistake.

**TREVOR:** He also said it's under the plaza. So. Aster pros. Down.

#### if speaker=michael

**TREVOR:** You answered that fast.

**MICHAEL:** It was ringing.

**MANUEL:** Did he say anything about the balloon?

**MICHAEL:** Down. He kept saying down.

*Manuel breathes out for the first time in a while.*

**TREVOR:** Anything else?

**MICHAEL:** No.

*A beat.*

**MICHAEL:** She'd have picked up too, you know. She picked up for everybody.

*Nobody has anything for that. Trevor adjusts a strap that did not need it.*

#### if attempt=3 (append, any speaker)

**TREVOR:** The drumming stopped.

**MANUEL:** When he said hello. Right when he said hello.

**MICHAEL:** Let's not find out what that was.

*End of scene. Objective returns: find the balloon. If `act1.call.asked.where`, the objective reads "Go down. Under the plaza."*

---

## Part 3: DECLINE

### node: call_decline_1

*Set `act1.call.declines = 1`, `act1.call.declinedBy.1`. If the timeout fired instead of a press, set `act1.call.rangOut`.*

*The ringing stops. The pink drains out of the HUD from the top down. The last label to come back is the objective, and for half a second it still says "So did I."*

*Party reaction.*

#### if speaker=manuel

**TREVOR:** You declined John Pork.

**MANUEL:** I panicked.

**MICHAEL:** You have three statues of him.

**MANUEL:** That's why I panicked.

#### if speaker=trevor

**MANUEL:** You hung up on him.

**TREVOR:** Unknown caller took over my HUD at night. That's a decline. That's hygiene.

**MANUEL:** It wasn't unknown! It said his name! It said his name on everything!

**MICHAEL:** Aster noob.

**TREVOR:** Aster pro. Pros don't pick up.

#### if speaker=michael

**TREVOR:** Huh. I'd have bet you'd be the one to pick up.

**MICHAEL:** It wasn't her.

**MANUEL:** It was John Pork.

**MICHAEL:** Yeah. So it wasn't her.

#### if flag act1.call.rangOut (replaces the block above)

**MICHAEL:** So nobody was going to get that.

**TREVOR:** I thought Manuel was getting it.

**MANUEL:** I thought it was a group decision.

**TREVOR:** It rang for thirty seconds.

**MANUEL:** It's a big decision.

*Eight seconds later every phone in the party chimes once. A small pink dot on the phone icon.*

*1 NEW VOICEMAIL. JOHN PORK.*

-> voicemail_1

### node: voicemail_1

*Plays automatically the next time the party is out of combat, over gameplay, with subtitles. Does not block movement. The player can also open it from the phone menu and replay it. Set `act1.call.voicemail1Heard` and `act1.call.porkInRecents` when it finishes.*

**PORK:** Hey. It's John.

**PORK:** You know that. It was on the screen. It was on a lot of screens.

#### if not flag act1.call.rangOut
**PORK:** So you declined. Which is fine. That's what the button's for. I put the button there.

#### if flag act1.call.rangOut
**PORK:** So you let it ring out. That's worse, somehow. Decline's at least a decision.

**PORK:** I just thought, with the balloon. That we had a thing in common. I don't get a lot of those.

*A pause. Something drips.*

**PORK:** It's under the street, by the way. Your thing. I'm not going to hold that hostage over a phone call.

**PORK:** Okay. Call me back.

**PORK:** You can't, actually. I don't have a number. I've never needed one.

**PORK:** So I'll call you. Don't worry about it.

**PORK:** I'll call you.

*He does not hang up right away. Four seconds of room tone. Then the beep.*

-> voicemail_1_reaction

### node: voicemail_1_reaction

*Skip lines whose speaker is not present.*

**MICHAEL:** He sounds lonely.

**TREVOR:** He sounds like he's in my phone.

**MANUEL:** He said he'd call back.

**TREVOR:** Great.

**MICHAEL:** He told us where it is, though. He didn't have to.

**MANUEL:** Under the street.

*Manuel is already looking at the nearest grate.*

*Objective updates: "Go down. Under the street."*

---

### node: call_ring_2

*Trigger: `act1.descent.callPoint2`, party out of combat, and not `act1.call.answered`. Set `act1.call.attempt = 2`.*

*The seize is the same but quicker, like he knows the way in now. The pink is patchy. Down here the rot eats the corners of his name.*

*J HN PORK. JOH  PO K.*

**PORK:** It's me again. Sorry about your HUD.

Choices:
- "ANSWER" -> call_answer_router
- "DECLINE" -> call_decline_2
- [timeout 30s] *(nobody presses anything)* -> call_decline_2

### node: call_decline_2

*Set `act1.call.declines = 2`, `act1.call.declinedBy.2`, and `act1.call.rangOut` true or false.*

*The ringing stops. In the quiet after it, very far down the tunnel, something knocks three times on something hollow. It could be a pipe.*

#### if speaker=manuel

**MICHAEL:** Again?

**MANUEL:** I don't know what to say to him.

**TREVOR:** "Hello" is traditional.

**MANUEL:** I've had a flag of him since I was fourteen. "Hello" isn't enough.

#### if speaker=trevor

**MANUEL:** Trevor.

**TREVOR:** We're in a rotted tunnel. I'm not handing my interface to a caller in a rotted tunnel.

**MANUEL:** He's not a caller, he's the caller.

**TREVOR:** That's worse.

#### if speaker=michael

**TREVOR:** You good?

**MICHAEL:** If I pick up and it's him, then it's him.

**TREVOR:** It is him.

**MICHAEL:** Right now it could still be anybody.

*The chime. The pink dot.*

*2 NEW VOICEMAILS. JOHN PORK.*

-> voicemail_2

### node: voicemail_2

*Plays automatically at the next quiet moment, as voicemail 1 did. Set `act1.call.voicemail2Heard` when it finishes.*

**PORK:** Hey. It's John. Again.

**PORK:** I'm not mad. I want that on the recording. Not mad.

**PORK:** Twice in one night. I know how that looks.

*A pause.*

**PORK:** You're in the tunnels now. I can tell because the signal's bad, and because I can see you.

**PORK:** That sounded worse than I meant it.

**PORK:** Listen. There's something down there that keeps count. I'm not it. I'm the one who calls.

**PORK:** It's the one who comes when you don't... look. I'd pick up. If I were you. Which I'm not. I checked.

*The footsteps on metal. One of them is heavier than the other.*

**PORK:** You know how many people I've called? All of them. I've called all of them.

**PORK:** And I still get nervous. That's embarrassing. Delete that part.

**PORK:** I was going to ask you something. On the first one, before you... no.

*A pause before the sincerity, and then he steps around it.*

**PORK:** Never mind. I don't ask that one anymore.

**PORK:** Okay. I'm hanging up now.

*He does not hang up.*

#### if settings.crudeHumor=on

*A clunk, as if the phone has been set down or put in a coat. Then breathing. Heavy, close, wet at the edges, with a faint hiss on every exhale.*

*It goes on for nine full seconds. Subtitles: [breathing]*

*It gets a little faster.*

*Subtitles: [breathing continues]*

**PORK:** ...Still there?

*Nobody is there. It is a voicemail.*

*Breathing. Six more seconds.*

**MAILBOX:** Message length exceeded. To send a reply, this caller has no number.

*Beep.*

#### if settings.crudeHumor=off

**PORK:** How do you... there's no button on my end. There's never been a button on my end.

*A click. Hold music starts: a thin, bright little tune, pre-slop, played through a speaker the size of a coin.*

**PORK:** No. That's hold. I put a voicemail on hold.

*He does not fix it. After a few seconds he hums along. He is flat, and he knows all of it.*

*The tune loops. He is still humming on the second pass.*

**MAILBOX:** Message length exceeded. To send a reply, this caller has no number.

*Beep.*

-> voicemail_2_reaction

### node: voicemail_2_reaction

*Skip lines whose speaker is not present.*

#### if settings.crudeHumor=on

*Nobody moves.*

**MICHAEL:** Is he...

**TREVOR:** Don't.

**MANUEL:** It's a fan. It's probably a fan. Everything has a fan.

**MICHAEL:** Why would a voicemail have a fan?

**MANUEL:** I hate 245 lab.

#### if settings.crudeHumor=off

**MICHAEL:** Is that hold music?

**TREVOR:** He put his own voicemail on hold.

**MANUEL:** He's humming.

*They listen to the end of it. Nobody skips it.*

**MICHAEL:** It's kind of nice.

**TREVOR:** Don't.

#### then, in both versions

*Set `act1.call.threeRuleHinted`.*

**MANUEL:** There's a thing people say. You don't let him ring three times.

**TREVOR:** People say a lot of things.

**MANUEL:** He said something keeps count.

**MICHAEL:** That's two, then.

*Far off, the hollow knocking again. Three, a gap, three. It is not a pipe.*

---

### node: call_ring_3

*Trigger: `act1.descent.callPoint3`, party out of combat, and not `act1.call.answered`. Set `act1.call.attempt = 3`.*

*The drumming has been under the music since the last checkpoint. When the seize hits, the music cuts and the drumming does not.*

*No pink flood this time. One label only, dead center, steady.*

*JOHN PORK (3)*

**PORK:** Last one.

*A pause.*

**PORK:** I don't make that rule.

Choices:
- "ANSWER" -> call_answer_router
- "DECLINE" -> call_decline_3
- [timeout 30s] *(nobody presses anything)* -> call_decline_3

### node: call_decline_3

*Set `act1.call.declines = 3`, `act1.call.declinedBy.3`.*

*The label goes out. For one second there is no sound in the game at all. Then the chime, and the voicemail starts on its own, live, as he records it.*

**PORK:** Hey. It's...

*TUNG.*

*One drum hit, close enough that the screen shakes.*

**PORK:** ...oh.

**PORK:** Oh, no. No, hey. Pick up. Pick up right now, I'm still on the line, you can...

*TUNG. TUNG.*

**PORK:** That's not me. Do you hear me? That's not mine, I can't call that off...

*TUNG. TUNG. TUNG.*

*The line dies in the middle of his voice. Every phone in the party goes black, then shows the same plain white text with no pink in it anywhere.*

*3 MISSED CALLS.*

*The tunnel lights go out in order, far to near. The drumming settles into a pattern you could walk to.*

*Set `act1.call.sahurSummoned`.*

-> call_decline_3_reaction

### node: call_decline_3_reaction

*Short. They are whispering. Skip lines whose speaker is not present.*

**TREVOR:** That's not the trains.

**MICHAEL:** Trains don't run down here.

**MANUEL:** That was three.

#### if declinedBy.3=manuel

**MANUEL:** That was me. I did that one.

**TREVOR:** We all let it ring.

**MANUEL:** Rookie Aster mistake.

*Nobody laughs at it this time.*

#### if declinedBy.3=trevor

**TREVOR:** Okay. I'll own that.

**MANUEL:** "Pros don't pick up."

**TREVOR:** I said I'll own it.

**MICHAEL:** Rookie Aster mistake.

*Nobody laughs at it this time.*

#### if declinedBy.3=michael

**MICHAEL:** I thought if I waited it'd be someone else.

**TREVOR:** It's someone else.

**MICHAEL:** Not who I meant.

**MANUEL:** Rookie Aster mistake. All three of us.

*Nobody laughs at it this time.*

*The drumming is coming from the direction they were already going.*

*End of scene. Objective: "Go down." The Sahur boss route takes over from here. Pork keeps calling during that fight; answering there is that scene's business.*

---

## Part 4: The butt dial (easter egg)

### node: butt_dial

*Trigger: see Notes. Never during a seize, in combat, or after `act1.call.sahurSummoned`.*

*This one is not a hack. No seize, no pink. An ordinary ringtone on one phone, the holder's or the host's. Ordinary caller ID: JOHN PORK. It rings twice and connects itself.*

*The audio is muffled, like the phone is inside a coat.*

#### if settings.crudeHumor=on

*Fabric. A rhythmic squeak, slow, like a bolt being worked. A wet glugging.*

**PORK:** *(muffled)* C'mon. C'mon, get in there.

*The squeak speeds up.*

**PORK:** *(muffled)* Little more. Little more. Don't you strip on me.

*A pop. A long hiss. Then a sigh from somewhere very deep.*

**PORK:** *(muffled)* Ohhh, that's the stuff.

*Humming. He is pleased with himself. A zipper, or something that sounds a lot like one.*

#### if settings.crudeHumor=off

*Fabric. Footsteps. He is talking to himself, and it takes a second to work out what he is doing. He is practicing.*

**PORK:** *(muffled)* "Hey. It's John." No.

**PORK:** *(muffled)* "Hey, it's John!" Too much. Way too much.

**PORK:** *(muffled)* "Yo." No. God, no. Seventy years and I'd still say "yo."

**PORK:** *(muffled)* "Manuel. Trevor. Michael. It's me." Who's "me"? Don't make them guess.

*A sigh. Humming.*

#### then, in both versions

Choices:
- "...John?" -> butt_dial_caught
- *(Keep listening.)* -> butt_dial_timeout
- *(Hang up.)* -> butt_dial_hangup

### node: butt_dial_caught

*Set `act1.call.buttDialSpokeUp`. The humming stops dead.*

**PORK:** *(muffled)* ...

*The fabric noise gets very loud and then very clear, as the phone comes out of the coat.*

**PORK:** How long has this been...

**PORK:** No.

**PORK:** No, no, no, no, no...

*Something metal is dropped. Something else is knocked over reaching for it. Click.*

-> butt_dial_after

### node: butt_dial_timeout

*Twelve more seconds of humming. Then he stops, and there is a small silence while he looks at something.*

**PORK:** *(muffled)* Why's that lit up?

*The phone comes out of the coat.*

**PORK:** Oh, no.

**PORK:** You didn't hear... okay. Okay. Bye.

*Click. He says "bye" the way a person does when leaving a room they should not have walked into.*

-> butt_dial_after

### node: butt_dial_hangup

*The holder ends the call. The log shows JOHN PORK, eleven seconds. No texts follow; he never knew.*

*Set `act1.call.buttDialDone`.*

#### if speaker=manuel
**MANUEL:** I don't want to know him like that yet.

#### if speaker=trevor
**TREVOR:** Nope. That's a boundary.

#### if speaker=michael
**MICHAEL:** That felt private. Did that feel private?

*End of egg.*

### node: butt_dial_after

*Set `act1.call.buttDialDone`. Thirty seconds later, three texts arrive from JOHN PORK, a few seconds apart. Lowercase. The only texts he sends in Act 1.*

#### if settings.crudeHumor=on

*TEXT: that was maintenance*

*TEXT: a coolant line. it sticks*

*TEXT: we don't have to talk about it*

#### if settings.crudeHumor=off

*TEXT: i was talking to someone else*

*TEXT: there's nobody else here*

*TEXT: we don't have to talk about it*

*Party reaction. Skip lines whose speaker is not present.*

#### if settings.crudeHumor=on

**MICHAEL:** Coolant line.

**TREVOR:** I'm choosing to believe that.

**MANUEL:** It's true. It has to be true. I have a flag of him.

**TREVOR:** Rookie Aster mistake, though. Lock your screen.

**MICHAEL:** Does he have a screen?

**TREVOR:** He has a zipper, apparently.

#### if settings.crudeHumor=off

**MICHAEL:** He was practicing.

**TREVOR:** For us?

**MANUEL:** He said our names.

*A beat.*

**TREVOR:** "Yo."

**MICHAEL:** Don't. He's trying.

**MANUEL:** Rookie Aster mistake. Lock your screen.

#### if flag act1.call.declines>=1 and not flag act1.call.answered (append)

**MICHAEL:** That's the only time we've been on the line with him. And he didn't mean to call.

*End of egg.*

---

## Part 5: Ambient barks after the Call

Low-frequency barks for the rest of the act. One per area at most. Skip any whose speaker is not present.

| id | speaker | trigger | line |
|---|---|---|---|
| post_ans_manuel_1 | Manuel | answered, entering a new area | "He said he'd call again. So he'll call again." |
| post_ans_manuel_2 | Manuel | answeredBy=manuel, in 631 near the statues | "Flag's flat. I know the flag's flat." |
| post_ans_trevor_1 | Trevor | answeredBy=trevor, using the mate station or supplements | "Two of the same pill. I'm going to find out which two." |
| post_ans_trevor_2 | Trevor | answered, picking up or equipping the guitar | "It told him no. Good guitar." |
| post_ans_michael_1 | Michael | answeredBy=michael, idle 20s | "He said she was polite. She was. She was polite to everybody." |
| post_ans_michael_2 | Michael | answered, phone menu opened | "Cannot call back. Yeah. I know the feeling." |
| post_ans_any_vans | Trevor | flag act1.vans.warned, an abatement van in view | "Mast. That's the one he meant." |
| post_dec1_manuel | Manuel | declines=1, entering a new area | "He's going to think we don't like him." |
| post_dec1_trevor | Trevor | declines=1, entering a new area | "He has every phone on Earth. He'll survive one decline." |
| post_dec1_michael | Michael | declines=1, phone menu opened | "One voicemail. I keep wanting to play it again." |
| post_dec2_manuel | Manuel | declines=2, drumming audible | "That's two. I'm just saying the number. That's two." |
| post_dec2_trevor | Trevor | declines=2, drumming audible | "Could be a pump. Pumps knock." |
| post_dec2_michael | Michael | declines=2, drumming audible | "Pumps don't wait for you to stop talking." |
| post_dec2_rotter | Rotter (tunnel) | declines=2, party within 3 tiles | "code rot. two. code rot. it counts. 1901." |
| post_butt_manuel | Manuel | buttDialDone and buttDialSpokeUp, entering 631 | "We don't have to talk about it." |
| post_butt_trevor | Trevor | buttDialDone, crudeHumor=on, any zipper or bag interaction | "Coolant line." |

---

## Notes for implementers

**Trigger and holder**
- `call_seize` fires when `act1.leads.doneCount` hits 2 and the party is out of combat and dialogue. If they are mid-fight, queue it for the first quiet two seconds. It can happen on any map, including 631.
- Host-authoritative. After a 2.0s input lockout (so nobody declines by mashing), the first ANSWER or DECLINE from any player wins and that player's roommate becomes `speaker` for every `speaker=` condition in this scene. Later rings pick the holder again from scratch; a different roommate may answer ring 2 than declined ring 1.
- Ring timeout is 30s on all three rings and counts as a decline with `act1.call.rangOut = true`. Reset `rangOut` to false on a pressed decline.

**The seize effect**
- Overwrite order for HUD labels: objective text last on the way in (it is typed out in sync with "You lost something."), last on the way out. Use Pork pink only (art rule D-004). Ring 2 drops random letters from the name in proportion to area rot level. Ring 3 uses a single centered label and no flood.
- The corner clock becomes a call timer on ANSWER and shows the final duration for 1s after hang-up. The call-log entry uses the same number.
- Nearby diegetic speakers (vending machine, lobby intercom, a billboard if on the plaza) ring too. NPC phones do not.
- Babble voice for Pork with subtitles. Italic stage lines that describe sound (footsteps on metal, drip, the kettle-like exhale) are audio cues under the call, not subtitle text, except where a line is marked "Subtitles:".

**Answer hubs**
- Each roommate's hub allows two picks, then routes to that roommate's close. Used choices are removed. Manuel's silent option goes straight to his close and counts as his only pick.
- `[morph>=1]` blocks check the speaking roommate's own stage.
- The `asked.*` flags are for later scenes (the ending can acknowledge what was already asked). `act1.call.asked.took` in particular should change the wording of the "did you take it from the ottoman" option in the ending so the player is not asking the identical question twice.
- If `act1.call.asked.where` is set, or voicemail 1 has been heard, the objective names the tunnels directly. Otherwise the leads still have to get the party there.

**Decline chain**
- Rings 2 and 3 fire only if `act1.call.answered` is false. The descent sets `act1.descent.callPoint2` (suggested: after the switchyard puzzle) and `act1.descent.callPoint3` (suggested: the last checkpoint before the platform door). The descent scene owns their exact placement.
- Voicemails auto-play at the next out-of-combat moment, non-blocking, and are replayable from the phone menu. If ring 2 arrives before voicemail 1 has played, play voicemail 1 first and delay the ring by 10s.
- Voicemail 2's ending is chosen by `settings.crudeHumor` at play time, not record time, so toggling the setting changes replays. Crude version: 9s breathing, the "Still there?" line, 6s more, mailbox line. Clean version: one full loop of the hold tune plus the start of a second.
- The hold tune should be a short original synth melody. If the audio owner wants, Act 2 ("Hold Music") can reuse it; this is its first appearance.
- Drumming mix: inaudible before decline 1; three distant knocks after decline 2; a continuous bed under the music from `callPoint3 - 1 checkpoint` onward if `declines = 2`; full volume from `call_decline_3`. If ring 3 is answered, cut the bed mid-pattern, play one soft hit 2s later, then silence for the rest of the descent.
- `call_decline_3` sets `act1.call.sahurSummoned`, which DESIGN §6 reads to pick the boss. The Sahur is not shown or voiced in this scene. Its entrance and its lines belong to the boss scene.
- After `call_decline_3`, phones show "3 MISSED CALLS" in plain white until the boss scene takes over the phone UI.

**Butt dial**
- Eligible once the first Call has resolved (answered, or at least one decline). Roll 1 in 3 at each eligible moment: entering 631, each descent checkpoint, each fishing session. Guaranteed at the last descent checkpoint before `callPoint3` if it has not fired, so it happens at least once per run (SECRETS discoverability rule). Fires once per save.
- Not eligible in combat, during a seize, within 60s of a voicemail, or after `sahurSummoned`.
- It does not count as a ring. It never changes `declines`, `attempt`, or `answered`.
- `butt_dial_timeout` fires 12s after the choice appears with no input.
- The three texts are the only Pork texts in Act 1. Store them in the phone's message list.

**Recents and contact**
- `act1.call.porkInRecents` puts "JOHN PORK, no number, cannot call back" in the call log after any outcome. This is the DESIGN §4 "Pork contact." The ending's "1 new contact: JOHN PORK" chime (DESIGN §7) should read as the upgrade from a log entry to a saved contact, so both beats stand.

**Faction standing (suggested nudges, hidden)**
- ANSWER on ring 1: Callers +2. On ring 2 or 3: Callers +1.
- Each pressed DECLINE: Interdiction +1. A ring-out: no change.
- `asked.her` or `asked.seventyOne`: Archivists +1.
- Third decline: no extra nudge; the Sahur is its own consequence.

**Ending warmth**
- DESIGN §7 makes Pork warmer if the party answered and colder if not. Suggested read: warm if `answeredOnAttempt` is 1 or 2, warm but shaken if 3, cold and tired if never answered before the boss.

**Canon checks made while writing (for reviewers)**
- No line states what the 2071 Call said. Three lines circle it on purpose: voicemails open with "Hey. It's John." (seeding the Act 3 callback), voicemail 2 has "I was going to ask you something... I don't ask that one anymore," and Michael's branch has "I said one thing, once." Cut any of these if they feel too close.
- Twist fairness. "If I had it, I wouldn't be calling," "Somebody who didn't have to break in," "Somebody who lives closer to it than I do," "Is it?" (to "that's three people"), "Flag's flat," and "When'd you find the time?" are all true or neutral under both A and B. "The air's moving the wrong way down there tonight" matches the footage clue under both. "If I were you. Which I'm not. I checked." is a joke under A and survives B for any roommate, because the line never says what the check found.
- Michael's girlfriend: this scene adds that she answered a Pork call, was polite, and asked how he was, and that what she heard was "something true." It does not name her, say when, or say whether she is alive. That is new detail on an open thread (deep-lore "Open for the team"); whoever owns her should confirm or cut `answer_michael_her`.
- Pork's body is only hinted (footsteps on metal, "the one good knee," "a seam," the exhale). Nobody in the party concludes anything. The in-person reveal stays with the ending.
- No Tim Cheese. No Sahur on screen. No fourth-wall breaks: the HUD overwrite is Pork hacking the party's lace and phones, which is in-fiction.
- The slogan appears once, broken, from a rotter bark (`ring_rotter`). The sincere delivery by a major character is not spent here.
- Invented details to confirm: Trevor's pill count (he says nine, Pork says eleven, two are duplicates), Manuel has had a Pork flag since he was fourteen, Pork's "seam open since March," the MAILBOX system voice, the hold tune, and Pork's three lowercase texts.
