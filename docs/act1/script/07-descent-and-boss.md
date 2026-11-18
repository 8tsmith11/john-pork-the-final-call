# The descent and the boss

## Purpose

DESIGN beats 4 and 5 and section 6. The party follows the helium sniffer down into the Green Line
maintenance tunnels, through the switchyard and the platform door, to the dead platform under
College Park, and fights whichever boss the run has earned: the procedural Rot Warden (default),
Tung Tung Tung Sahur (three declines), or the abatement unit (stretch, Halvard double-crossed).
The drumming gets closer the whole way down. Morph stage 1 is introduced here, with a cost the
other two roommates can see. The scene ends the moment the boss is down and hands off to the ending
cutscene (DESIGN section 7). Thematic job: *who answers?* Everything down here is something that
called and got nobody.

Twist fairness: nothing in this file says who cut the ribbon, and nothing says what the Call said.
The only twist-adjacent material is the reversed fans (true under A and B: the balloon was pulled
down, and nobody down here knows by whom), the analog lock (true under both: Pork can't enter
analog things), and Michael's "she picked up, one time" (true under both).

## Flags

Reads:

- `act1.call.answered` (the midpoint Call was answered)
- `act1.call.declines` (0 to 3; this scene hosts retry 2 and retry 3 and increments it)
- `act1.lead.sniffer.built` (Lead A done; if false, the party follows the draft instead, see `descent_entry`)
- `act1.halvard.keyObtained` / `[item halvard_key]`
- `act1.halvard.doubleCrossed` (stretch boss)
- `act1.neighbor.heardDrumming` (beat 1; changes one line at the tunnel mouth)
- `seed` (not branched on anywhere in this file, listed so nobody adds a branch)
- `morph.trevor`, `morph.manuel`, `morph.michael` (0 or 1 in Act 1)

Sets:

- `act1.descent.entered`
- `act1.descent.noticeRead`
- `act1.descent.fansNoticed`
- `act1.descent.drumStage` (0 to 5)
- `act1.descent.restUsed`
- `act1.descent.rotterSatWith`
- `act1.switchyard.hintLevel` (0 to 3)
- `act1.switchyard.wrongRoutes` (count)
- `act1.switchyard.solved`
- `act1.door.method` (`key` | `brute` | `drill`)
- `act1.door.opened`
- `act1.door.porkTexted`
- `morph.trevor.stage1Seen`, `morph.manuel.stage1Seen`, `morph.michael.stage1Seen`
- `act1.boss.kind` (`warden` | `sahur` | `abatement`)
- `act1.boss.wardenName` (the generated name, stored for the ending and the save)
- `act1.boss.phase` (1 to 3)
- `act1.boss.wipes` (count)
- `act1.sahur.summoned`
- `act1.sahur.midFightDeclines` (count)
- `act1.sahur.answeredMidFight`
- `act1.sahur.answeredBy` (`manuel` | `trevor` | `michael`)
- `act1.sahur.noticedMercy`
- `act1.boss.defeated`
- `act1.outbreak.contained`

Tokens the engine substitutes: `{warden.name}`, `{warden.tagline}`, `{ppm}`, `{downed}` (name of a
downed roommate), `{count}`.

---

## Part 1: Going down

### node: descent_entry

*The storm grate on the metro plaza, lifted. A service stair under it. Abatement tape across the
stair, already cut by someone else. A Continuity notice is riveted to the wall.*

*From far below, faint, regular: tung. tung. tung.*

#### if act1.lead.sniffer.built

**SNIFFER:** *tick. tick-tick. {ppm} ppm.*

**TREVOR:** Background's five point two. This is eleven.

**MICHAEL:** Is eleven a lot?

**TREVOR:** It's a lot for a hole.

#### if not act1.lead.sniffer.built

*Air moves down the stairs, past them, into the dark. It should be coming up.*

**MICHAEL:** Why's it breathing in?

**TREVOR:** Follow the draft. That's all we've got.

#### always

**MANUEL:** It's down there.

**MICHAEL:** Something's down there.

**MANUEL:** That's what I said.

Choices:
- "Read the notice." -> descent_notice
- [flag act1.neighbor.heardDrumming] "Listen." -> descent_listen
- "Go down." -> descent_stairs

### node: descent_notice

*Sets `act1.descent.noticeRead`.*

**NOTICE:** CITIZENS, THINGS ARE STABLE. THIS STATION IS STABLE. ENTRY HAS BEEN DISCOURAGED FOR YOUR
SAFETY. A CONTAINMENT REVIEW FOR THE COLLEGE PARK SERVICE AREA HAS BEEN SCHEDULED. RESIDENTS WILL BE
NOTIFIED OF THE PERIMETER.

#### if speaker=manuel

**MANUEL:** "Of the perimeter." Not "of a perimeter."

**TREVOR:** They already drew it.

#### if speaker=trevor

**TREVOR:** "Containment review." That's a wall with a meeting first.

**MICHAEL:** Around what?

**TREVOR:** Us. Aster. The plaza. The good bubble tea place.

#### if speaker=michael

**MICHAEL:** "Entry has been discouraged." By who?

**MANUEL:** By the sign.

**MICHAEL:** I feel discouraged. It's working.

Choices:
- "Go down." -> descent_stairs

### node: descent_listen

*tung. tung. tung. A pause exactly as long as the three beats. Then again.*

**MICHAEL:** That's what the guy on four was talking about.

**TREVOR:** It's a pump. Pumps do that.

**MANUEL:** Pumps don't stop to listen.

*The pause again. Longer this time.*

**TREVOR:** ...It's a pump.

Choices:
- "Go down." -> descent_stairs

### node: descent_stairs

*Sets `act1.descent.entered`, `act1.descent.drumStage = 1`. Scooters are disabled from here.*

*The stair ends at a maintenance door propped open with a dead abatement drone. Past it, the tunnel.
Emergency strips light every third meter. An ad panel on the wall still has power.*

**AD PANEL:** *(flickering, half the letters gone)* AT THE END OF THE DAY NO ONE CAN CODE FAST R THAN A

**MICHAEL:** They left the ads on.

**MANUEL:** They always leave the ads on.

*Michael parks his scooter against the wall and pats the seat.*

**MICHAEL:** Stay.

### node: descent_fans

*Trigger: first vent fan housing in the maintenance tunnel. Sets `act1.descent.fansNoticed`.*

*A ventilation fan the size of a car, turning slowly. Dust streams toward it from the stairs.*

#### if speaker=trevor

**TREVOR:** That's exhaust. It's supposed to push air out.

**MICHAEL:** It's pulling.

**TREVOR:** It's wired backwards. *(he looks down the tunnel at the next one)* They're all wired backwards.

**MANUEL:** Rot?

**TREVOR:** Rot doesn't pick a direction.

#### if speaker=manuel

*Manuel holds the cut ribbon out. It lifts, and points down the tunnel.*

**MANUEL:** Helium goes up.

**TREVOR:** Unless every fan on the line is running in reverse.

**MANUEL:** Why would they be?

**TREVOR:** Somebody asked them to.

#### if speaker=michael

**MICHAEL:** My hair's going the wrong way.

**TREVOR:** The fans are reversed.

**MICHAEL:** On purpose?

**TREVOR:** I checked two. Same fault on both. That's not a fault.

#### always

*Nobody says anything for a second.*

**MICHAEL:** So it didn't float away.

**MANUEL:** No.

### node: descent_tunnel_rotter

*Optional. A rotter in a transit vest sits on an upturned bucket by a dead signal box, facing the
wall. Not hostile. He holds a handset with a cut cord to his ear.*

**ROTTER:** next train. next train. code rot. next train.

Choices:
- "Ask about the balloon." -> rotter_balloon
- "Ask about the drumming." -> rotter_drumming
- "Sit down next to him." -> rotter_sit
- "Leave him." -> END

### node: rotter_balloon

**ROTTER:** orange. no. signal's orange. signal's been orange since. nineteen oh one.

#### if speaker=manuel

**MANUEL:** Not the signal. A balloon. This big. Orange.

**ROTTER:** signal's orange. means wait.

**MANUEL:** ...Yeah. I've been waiting.

#### if speaker=trevor

**TREVOR:** Orange. It came through here?

**ROTTER:** means wait. means wait. code rot.

**TREVOR:** I'll take that as a yes with noise.

#### if speaker=michael

**MICHAEL:** Hey, man. Did something orange come by? Floating?

**ROTTER:** means wait.

**MICHAEL:** Okay. Thanks. You doing all right down here?

**ROTTER:** next train.

**MICHAEL:** Sure.

Choices:
- "Ask about the drumming." -> rotter_drumming
- "Sit down next to him." -> rotter_sit
- "Leave him." -> END

### node: rotter_drumming

*He stops rocking.*

**ROTTER:** it comes by. it asks.

*He holds the dead handset out to the speaker, politely, then takes it back.*

**ROTTER:** i always say i'm here. no one can code faster than. i'm here. i'm here.

Choices:
- "Sit down next to him." -> rotter_sit
- "Leave him." -> END

### node: rotter_sit

*Hold for 20 seconds without input. Sets `act1.descent.rotterSatWith`.*

*He shifts the bucket over to make room. There isn't a second bucket. The speaker sits on the rail.*

*After a while he presses the handset into their hand and closes their fingers around it.*

**ROTTER:** yours. it's for you.

*Item: DEAD HANDSET. "A transit handset on a cut cord. Nobody is on the other end. It's wood-grain
plastic, which isn't wood, but somebody wanted it to be."*

#### if speaker=michael

*Michael puts it to his ear. He keeps it there a little too long.*

**MANUEL:** Anything?

**MICHAEL:** No. *(he pockets it)* No.

---

## Part 2: Tunnel barks

Ambient lines, fired by the bark system with a 45-second global cooldown and no repeats inside one
descent. Speaker-specific rows only fire if that roommate is in the party.

### Drumming, by stage

`act1.descent.drumStage` advances at: stairs (1), first fan (2), switchyard entry (3), switchyard
solved (4), platform door (5). Louder and closer at each stage. On the default route the drumming
never arrives; see `door_drums_pass`.

| id | speaker | trigger | line |
|---|---|---|---|
| drum.1.a | MICHAEL | drumStage=1, first combat cleared | Still going. |
| drum.1.b | TREVOR | drumStage=1 | Ninety beats a minute. Resting heart rate of a guy who isn't worried. |
| drum.1.c | MANUEL | drumStage=1 | Three and stop. Three and stop. |
| drum.2.a | MICHAEL | drumStage=2 | Is it louder or are we closer? |
| drum.2.b | TREVOR | drumStage=2, after drum.2.a | Those are the same thing. |
| drum.2.c | MANUEL | drumStage=2 | It's wood. Hear it? Wood on something hollow. |
| drum.2.d | TREVOR | drumStage=2, after drum.2.c | Nothing down here is wood. |
| drum.3.a | MICHAEL | drumStage=3 | It stopped. |
| drum.3.b | MANUEL | drumStage=3, after drum.3.a, 4s later | *(drumming resumes)* It didn't stop. |
| drum.3.c | TREVOR | drumStage=3 | It's not echo. Echo doesn't walk. |
| drum.4.a | MICHAEL | drumStage=4 | That's the next tunnel over. That's right there. |
| drum.4.b | MANUEL | drumStage=4 | Nobody talk for a second. |
| drum.4.c | TREVOR | drumStage=4, after drum.4.b | *(whisper)* I wasn't. |
| drum.4.d | MICHAEL | drumStage=4, declines>=2 | It's keeping count. Tell me it's not keeping count. |
| drum.5.a | TREVOR | drumStage=5 | I can feel it in the rail. |
| drum.5.b | MANUEL | drumStage=5 | Then get off the rail. |

### Helium trail

| id | speaker | trigger | line |
|---|---|---|---|
| he.1 | SNIFFER | entering a new tunnel segment | *tick-tick. {ppm} ppm.* |
| he.2 | TREVOR | ppm doubles | It's climbing. We're right. |
| he.3 | MANUEL | ppm doubles | That's it. That's mine. That number is mine. |
| he.4 | MICHAEL | ppm doubles | I love this little guy. Can we keep him after? |
| he.5 | TREVOR | after he.4 | It's a sensor on a stick, Michael. |
| he.6 | MICHAEL | after he.5 | He found it. You didn't find it. |
| he.7 | TREVOR | ppm drops (wrong turn) | Dropping. Back up. |
| he.8 | MANUEL | ppm drops (wrong turn) | Rookie Aster mistake. Mine. Turn around. |
| he.9 | TREVOR | first read above 40 ppm | It's leaking. Slow. A seam, maybe. |
| he.10 | MANUEL | after he.9 | Then walk faster. |

### Morale and banter

| id | speaker | trigger | line |
|---|---|---|---|
| mor.1 | MICHAEL | 3 minutes in tunnels | No ottoman down here. How do we know what the weather's doing? |
| mor.2 | MANUEL | after mor.1 | It's doing tunnel. |
| mor.3 | TREVOR | after mor.2 | Forecast: tunnel, with a chance of tunnel. |
| mor.4 | MANUEL | random, any tunnel | I hate 245 lab. |
| mor.5 | MICHAEL | after mor.4 | We're in a sewer. |
| mor.6 | MANUEL | after mor.5 | I know where we are. |
| mor.7 | TREVOR | first combat cleared with nobody downed | Aster pros. |
| mor.8 | MICHAEL | after mor.7 | Aster pros! |
| mor.9 | MANUEL | after mor.8 | Don't say it twice, it stops working. |
| mor.10 | MICHAEL | passing a dead train car | My girlfriend used to take this line to Greenbelt. Said the last car was always empty. |
| mor.11 | TREVOR | after mor.10 | It's still empty. |
| mor.12 | MICHAEL | after mor.11 | Yeah. She'd find that funny. |
| mor.13 | TREVOR | standing water | Don't drink this. Don't touch this. I wouldn't put a shrimp in this. |
| mor.14 | MICHAEL | after mor.13 | High bar. |
| mor.15 | TREVOR | after mor.14 | The highest. |
| mor.16 | MANUEL | passing rotted signal clock | 19:01. Every clock down here agrees. First time for everything. |
| mor.17 | TREVOR | any roommate under 30% HP | Sit. Drink something. That's not a suggestion. |
| mor.18 | MANUEL | Manuel under 30% HP | I'm fine. I'm fine. Give me the mate. |
| mor.19 | MICHAEL | Michael under 30% HP | If I die, tell her I looked cool. |
| mor.20 | TREVOR | after mor.19 | You're holding a pipe wrong. |
| mor.21 | MICHAEL | after mor.20 | Then lie. |
| mor.22 | MANUEL | high-rot tile zone entered | The wall just moved. |
| mor.23 | TREVOR | after mor.22 | It didn't. Your lace thinks it did. That's worse. |
| mor.24 | MICHAEL | second combat cleared | Do we have a plan for when we find it? |
| mor.25 | MANUEL | after mor.24 | Tie it back on. |
| mor.26 | MICHAEL | after mor.25 | After that. |
| mor.27 | MANUEL | after mor.26 | Check on it in the morning. |

### Tunnel rotters (non-hostile, ambient)

| id | speaker | trigger | line |
|---|---|---|---|
| rot.1 | ROTTER | proximity | code rot. code rot. mind the. code rot. |
| rot.2 | ROTTER | proximity | nineteen oh one. doors closing. nineteen oh one. |
| rot.3 | ROTTER | proximity | at the end of the day. at the end of the day. at the end of the. |
| rot.4 | ROTTER | proximity, drumStage>=3 | i'm awake. i'm awake. i'm awake. |
| rot.5 | ROTTER | proximity, party carries DEAD HANDSET | *(looks at the handset, then away)* it's for you. |

### Rot enemies (trash mobs; the two MVP rot types)

Rot enemies do not speak to the party. They emit fragments. Keep them short enough to read mid-fight.

| id | speaker | trigger | line |
|---|---|---|---|
| mob.1 | ROT CRAWLER | aggro | RETRYING. |
| mob.2 | ROT CRAWLER | aggro | CONNECTION REFUSED. |
| mob.3 | ROT CRAWLER | death | timeout. |
| mob.4 | ROT SPITTER | aggro | PLEASE HOLD. |
| mob.5 | ROT SPITTER | windup | NO ONE CAN. NO ONE CAN. |
| mob.6 | ROT SPITTER | death | call ended. |
| mob.7 | TREVOR | first rot enemy killed | It's a turnstile. That was a turnstile. |
| mob.8 | MICHAEL | first rot enemy killed | It said "please hold." |
| mob.9 | MANUEL | first rot enemy killed | Then it should've held. |

---

## Part 3: Combat system lines (all fights in this scene)

### Downed

| id | speaker | trigger | line |
|---|---|---|---|
| down.man.1 | MANUEL | Manuel downed | No, no, no. Not here. |
| down.man.2 | MANUEL | Manuel downed | I'm down. Don't stop for me. ...Stop for me a little. |
| down.man.3 | MANUEL | Manuel downed, morph active | The gonman is resting. |
| down.tre.1 | TREVOR | Trevor downed | That's my good knee. |
| down.tre.2 | TREVOR | Trevor downed | Okay. Floor. Floor's fine. |
| down.tre.3 | TREVOR | Trevor downed, morph active | Heart rate's two-ten. That's a personal best. |
| down.mic.1 | MICHAEL | Michael downed | Ow. Okay. Ow. |
| down.mic.2 | MICHAEL | Michael downed | Don't tell her about this part. |
| down.mic.3 | MICHAEL | Michael downed, morph active | It's so loud down here. |

### Calling for a downed friend

| id | speaker | trigger | line |
|---|---|---|---|
| call.man.tre | MANUEL | Trevor downed | Trevor! Tall guy down! |
| call.man.mic | MANUEL | Michael downed | Michael! Stay there, I'm coming, stay there. |
| call.tre.man | TREVOR | Manuel downed | Manuel's down. Cover me. |
| call.tre.mic | TREVOR | Michael downed | Michael. Michael. Talk to me. |
| call.mic.man | MICHAEL | Manuel downed | Manuel! Hey! He's not moving! |
| call.mic.tre | MICHAEL | Trevor downed | They got Trevor! How did they get Trevor? |

### Reviving

| id | speaker | trigger | line |
|---|---|---|---|
| rev.man.tre | MANUEL | reviving Trevor | Up. You weigh nine hundred kilos. Up. |
| rev.man.mic | MANUEL | reviving Michael | Come on. She's not gonna hear about it. Come on. |
| rev.tre.man | TREVOR | reviving Manuel | Breathe in. Out. You're fine. I've seen you worse after lab. |
| rev.tre.mic | TREVOR | reviving Michael | Pulse is good. Pupils are good. Hair's a disaster. |
| rev.mic.man | MICHAEL | reviving Manuel | Got you. I got you. We still have to find your balloon, get up. |
| rev.mic.tre | MICHAEL | reviving Trevor | What do I do? Is there a supplement for this? |
| rev.tre.mic.reply | TREVOR | after rev.mic.tre | Left pocket. The blue one. Not the other blue one. |

### Revived

| id | speaker | trigger | line |
|---|---|---|---|
| up.man.1 | MANUEL | Manuel revived | I'm up. Where is it. Where's the thing that did that. |
| up.man.2 | MANUEL | Manuel revived | Thanks. Don't make it weird. |
| up.tre.1 | TREVOR | Trevor revived | I wasn't out. I was assessing. |
| up.tre.2 | TREVOR | Trevor revived | Thank you. Genuinely. Okay, moving. |
| up.mic.1 | MICHAEL | Michael revived | Did I look cool? |
| up.mic.2 | MICHAEL | Michael revived | I owe you a bubble tea. A large. |

### Failure barks ("rookie Aster mistake")

The joke has to be allowed to change weight. Rows marked *quiet* are delivered flat, no exclamation,
and only fire after a full party wipe.

| id | speaker | trigger | line |
|---|---|---|---|
| fail.1 | TREVOR | ally hit by a fully telegraphed attack | Rookie Aster mistake. |
| fail.2 | MANUEL | ally hit by a fully telegraphed attack | It told you it was coming. It practically sent a letter. |
| fail.3 | MICHAEL | self hit by a fully telegraphed attack | I saw it. I saw it and I stood there. Aster noob. Me. |
| fail.4 | MANUEL | ally falls onto the track bed | Who walks off a platform? Who does that? |
| fail.5 | MICHAEL | self falls onto the track bed | Mind the gap. I did not mind the gap. |
| fail.6 | TREVOR | self falls onto the track bed | Nobody saw that. |
| fail.7 | MANUEL | after fail.6 | Everybody saw that. |
| fail.8 | TREVOR | ally stands in a rot pool for 3s | Out of the puddle. Out. That's not water, that's a bug report. |
| fail.9 | MICHAEL | hit by a friendly projectile | Hey! Same team! Aster pros! |
| fail.10 | MANUEL | self hits a friend | Sorry. Sorry. You walked into it. Sorry. |
| fail.11 | TREVOR | all three clumped, hit by one area attack | Spread out. We live together, we don't have to die together. |
| fail.12 | MICHAEL | dodge with zero stamina | Nothing in the tank. Nothing. |
| fail.13 | MANUEL | two allies downed, Manuel standing | Okay. Okay. Aster pro. Just me. |
| fail.14 | TREVOR | two allies downed, Trevor standing | One left. It's fine. I trained for this. I didn't train for this. |
| fail.15 | MICHAEL | two allies downed, Michael standing | Guys? Guys. Okay. Okay okay okay. |
| fail.16 | MANUEL | respawn after first wipe | Rookie Aster mistake. All three of us. Again. |
| fail.17 | TREVOR | respawn after first wipe | We clumped. Don't clump. |
| fail.18 | MICHAEL | respawn after first wipe | I'm choosing to believe that was practice. |
| fail.19 | TREVOR | *quiet*, respawn after third wipe | ...Rookie Aster mistake. |
| fail.20 | MANUEL | *quiet*, after fail.19 | Yeah. |
| fail.21 | MICHAEL | *quiet*, after fail.20 | One more. Then we get it right. |

---

## Part 4: The pump room (checkpoint, morale, morphs)

### node: pumproom_enter

*A maintenance alcove off the tunnel: PUMP ROOM 4. One working light. A bench, a dead coffee
machine, a paper wall calendar from a year nobody recognizes. Checkpoint. Sets
`act1.descent.restUsed` on first rest.*

*The drumming is muffled in here.*

**TREVOR:** Five minutes. Everybody eat something.

**MICHAEL:** I didn't bring anything.

*Trevor is already holding out a bar.*

**MICHAEL:** What's in it?

**TREVOR:** Don't read the back.

Choices:
- "Rest." -> pumproom_rest
- "Look at the calendar." -> pumproom_calendar
- "Talk." -> pumproom_talk
- "Keep moving." -> END

### node: pumproom_rest

*Checkpoint saved. HP and stamina restored. The mate gourd goes around.*

**MANUEL:** Don't stir it.

**MICHAEL:** I wasn't going to stir it.

**MANUEL:** You were holding the straw like a guy who stirs.

### node: pumproom_calendar

*A paper calendar. Someone crossed off days in pen, neatly, for most of a year. Then the crosses
stop on a Tuesday.*

#### if speaker=manuel

**MANUEL:** They did it by hand. Every day.

**MICHAEL:** Until they didn't.

**MANUEL:** *(he straightens it on its nail)* Until they didn't.

#### if speaker=trevor

**TREVOR:** Paper. Ink. Sixty years in a wet room and I can still read it.

**MANUEL:** Try that with a drive.

**TREVOR:** I have. That's my point.

#### if speaker=michael

**MICHAEL:** They stopped on a Tuesday.

**TREVOR:** People stop on all kinds of days.

**MICHAEL:** I know. I just think you'd want to get to the weekend.

### node: pumproom_talk

*Who is speaking chooses the topic. Each plays once.*

#### if speaker=manuel

**MANUEL:** If it's popped.

**TREVOR:** It's reading forty parts per million. Popped would read five.

**MANUEL:** If it's popped by the time we get there.

**MICHAEL:** Then we carry it back and you tie it on anyway.

**MANUEL:** That's stupid.

**MICHAEL:** Yeah.

*Manuel nods. That's the plan now.*

#### if speaker=trevor

*Trevor is counting capsules into his palm.*

**MICHAEL:** How many is that?

**TREVOR:** It's a protocol.

**MICHAEL:** That wasn't a number.

**TREVOR:** Eleven. And a powder.

**MANUEL:** What happens at twelve?

**TREVOR:** I haven't read that study.

#### if speaker=michael

*Michael has his phone out. Face down on his knee. Face up. Face down.*

**MANUEL:** No signal down here.

**MICHAEL:** I know.

**TREVOR:** Then who are you checking for?

**MICHAEL:** Nobody. Habit. *(face up)* She picked up, one time. Just the one. I think about that.

*Nobody asks. He puts the phone away.*

**MICHAEL:** Okay. Tunnel.

### Morph stage 1

Stage 1 unlocks on entering the pump room for the first time (stretch; if morphs are cut for
tonight, skip to Part 5 and use `door_no_trevor` for the door). The first activation of each
roommate's morph plays its `_first` node once, wherever it happens. After that, only the bark tables
fire. Each morph lasts 40 seconds with a 120-second cooldown, and each has a cost the other two can
see.

### node: morph_trevor_first

*Stage name on HUD: **STACK ONE**. Trevor's nameplate gains a small pill icon.*

*Trevor dry-swallows the handful, then tips a paper sachet of grey powder onto his tongue. The
sachet says NOT FOR AQUARIUM USE.*

**MICHAEL:** Did you just eat something that has a warning about fish?

**TREVOR:** It's for people. The warning's for fish.

*A beat. His pupils go wide. A vein stands up along his forearm. He rolls his shoulders and
something in his back cracks like a knuckle.*

**TREVOR:** Oh, there it is.

**MANUEL:** Your nose is bleeding.

**TREVOR:** That's how you know it's absorbing.

**MANUEL:** That is not how you know anything.

*Sets `morph.trevor.stage1Seen`.*

*Effect: melee damage and max stamina up, can break heavy objects (rot barricades, the platform
door). Cost: HP drains slowly for the duration, healing received is halved, and a nosebleed pixel
stays on the sprite until the next rest.*

### node: morph_manuel_first

*Stage name on HUD: **the gonman**. Manuel's nameplate, which has read "gonman" all game, flickers
and gains an article: "the gonman".*

*Manuel unscrews a steel flask. Mate, black as oil, no bubbles at all.*

**TREVOR:** Is that the one you had in the degassing chamber?

**MANUEL:** Nine days.

**TREVOR:** Why?

**MANUEL:** To see.

*He drinks it in one go. He takes a pacifier out of his jacket and bites down on it.*

**MICHAEL:** Is that a pacifier?

**MANUEL:** *(around it)* It's a bite guard.

**MICHAEL:** It's a pacifier.

**MANUEL:** It is a bite guard from the pacifier drawer.

*His eyes stop blinking. His foot starts tapping and does not stop. When he speaks again it is very
calm.*

**MANUEL:** The gonman is ready.

**TREVOR:** Who?

**MANUEL:** The gonman.

**MICHAEL:** You're gonman.

**MANUEL:** That was before.

*Sets `morph.manuel.stage1Seen`.*

*Effect: attack speed and move speed up, dodge costs less stamina. Cost: he cannot stand still
(stamina drains while stationary for more than 2 seconds), ranged aim sways, he refers to himself
only as "the gonman", and the sprite does not blink.*

### node: morph_michael_first

*Stage name on HUD: **SIGNAL** (placeholder stage; owner Michael's agent). Michael's nameplate gains
one reception bar.*

*Michael presses two fingers behind his ear, where the lace sits, and holds them there.*

**TREVOR:** What are you doing?

**MICHAEL:** There's a setting. You're not supposed to use it. It's like... taking the filter off.

**MANUEL:** The filter is there for a reason.

**MICHAEL:** Yeah. So you don't hear everything.

*He lets go. His head tilts. Enemy wind-ups in the room outline in pale blue.*

**MICHAEL:** Oh, that's a lot. That's so many things. There's a tone under all of it. Like a line
that's open.

**TREVOR:** Open to what?

**MICHAEL:** I don't know. *(he's smiling, and he's a little scared)* It knows the tunnel, though.
Left. Something's coming from the left.

*It comes from the left.*

*Sets `morph.michael.stage1Seen`.*

*Effect: enemy telegraphs show 0.4 seconds early for Michael, and his pings mark a target so the
party crits it. Cost: he takes extra rot damage, party barks are muffled for him under a ringing
tone, and a caller ID with no name flickers at the edge of his HUD.*

### Morph barks

| id | speaker | trigger | line |
|---|---|---|---|
| mph.tre.on.1 | TREVOR | Trevor morph on | Stack's in. Forty seconds. Make them count. |
| mph.tre.on.2 | TREVOR | Trevor morph on | I can feel my hair growing. |
| mph.tre.mid.1 | TREVOR | Trevor morph, breaks object | That was load-bearing. Was. |
| mph.tre.mid.2 | TREVOR | Trevor morph, HP under 40% | It's fine. That's just the cost. Everything costs. |
| mph.tre.off.1 | TREVOR | Trevor morph ends | And there's the bill. Give me a second. |
| mph.tre.off.2 | TREVOR | Trevor morph ends | Hands are shaking. That's normal. That's the normal amount. |
| mph.tre.react.1 | MANUEL | Trevor morph on | He's doing the thing. Stand behind him. |
| mph.tre.react.2 | MICHAEL | Trevor morph on | Your neck is a different shape, man. |
| mph.tre.react.3 | MICHAEL | Trevor morph ends | You good? You look like the shrimp when you clean the tank. |
| mph.tre.react.4 | TREVOR | after mph.tre.react.3 | The shrimp are thriving. |
| mph.man.on.1 | MANUEL | Manuel morph on | The gonman is here. |
| mph.man.on.2 | MANUEL | Manuel morph on | *(pacifier in)* Mmf. Go. |
| mph.man.mid.1 | MANUEL | Manuel morph, kill | The gonman hates 245 lab. |
| mph.man.mid.2 | MANUEL | Manuel morph, stationary 2s | Can't stop. Don't let the gonman stop. |
| mph.man.mid.3 | MANUEL | Manuel morph, misses ranged shot | The gonman's hands are not the gonman's best feature right now. |
| mph.man.off.1 | MANUEL | Manuel morph ends | ...Did I say "the gonman" out loud? |
| mph.man.off.2 | MANUEL | Manuel morph ends | Nobody tell anyone about the pacifier. |
| mph.man.react.1 | TREVOR | Manuel morph on | He's not blinking. Michael. He's not blinking. |
| mph.man.react.2 | MICHAEL | Manuel morph on | I like him. I'm scared of him. I like him. |
| mph.man.react.3 | TREVOR | Manuel morph ends | You said it eleven times. |
| mph.man.react.4 | MICHAEL | after mph.man.react.3 | I counted fourteen. |
| mph.mic.on.1 | MICHAEL | Michael morph on | Taking the filter off. Talk loud. |
| mph.mic.on.2 | MICHAEL | Michael morph on | Okay. I can hear the whole tunnel. |
| mph.mic.mid.1 | MICHAEL | Michael morph, marks target | That one. It's about to. That one! |
| mph.mic.mid.2 | MICHAEL | Michael morph, takes rot damage | It gets in easier like this. Worth it. Probably worth it. |
| mph.mic.mid.3 | MICHAEL | Michael morph, HUD caller ID flicker | ...No. Not now. |
| mph.mic.off.1 | MICHAEL | Michael morph ends | *(too loud)* IS IT OFF? Sorry. Is it off? |
| mph.mic.off.2 | MICHAEL | Michael morph ends | Quiet's weird now. |
| mph.mic.react.1 | TREVOR | Michael morph on | He's calling them before they move. Listen to him. |
| mph.mic.react.2 | MANUEL | Michael morph on | Michael. Michael. He can't hear us. Just point. |
| mph.mic.react.3 | MANUEL | Michael morph ends | Who was calling? |
| mph.mic.react.4 | MICHAEL | after mph.mic.react.3 | Nobody. It didn't have a name on it. |

---

## Part 5: The switchyard

Puzzle (DESIGN section 8): rail switches route the helium sniffer's path. The yard's air is too
stirred up by the reversed fans to read on foot, so the sniffer rides a maintenance cart down one
of four stub tracks and reads the far end. Three hand levers: SW-1 at the throat, SW-2 on the west
branch (Tracks 1 and 2), SW-3 on the east branch (Tracks 3 and 4). The helium is down **Track 3**.
The lamp on SW-1 is rotted and shows the opposite of the truth. SW-3 is spring-return and has to be
held while the cart rolls through (a second player, or a scrap wedge in solo). Solution: SW-1 east
(the lamp will say red), hold SW-3 toward Track 3, push the cart. SW-2 does not matter.

### node: switchyard_enter

*Sets `act1.descent.drumStage = 3`. The tunnel opens into a yard: four tracks fanning into four
dark mouths. A flat maintenance cart on the lead track. Signal lamps, some lit. Every fan in the
ceiling turning the wrong way.*

**SNIFFER:** *tick. tick. tick. tick.* 9 ppm. 14 ppm. 6 ppm. 11 ppm.

**TREVOR:** It's all over the place. The fans are mixing it.

**MICHAEL:** So it's in here somewhere.

**TREVOR:** It's in here everywhere. I need a reading from the far end of each one.

*Manuel is already looking at the cart.*

**MANUEL:** Put it on the cart.

**TREVOR:** I'm not walking away from my sniffer.

**MANUEL:** You're not. The cart is.

Choices:
- "Mount the sniffer on the cart." -> switchyard_cart
- "Look at the levers." -> switchyard_levers
- "Look at the lamps." -> switchyard_lamps

### node: switchyard_cart

*The sniffer clamps onto the cart's handrail. The cart can be pushed. It follows the points.*

**MICHAEL:** He looks happy up there.

**TREVOR:** It doesn't have a face.

**MICHAEL:** He has a little screen.

### node: switchyard_levers

*Three iron levers, each taller than Michael. Cast letters on the base: SW-1, SW-2, SW-3. No lace
port. No screen. Grease, still.*

#### if speaker=trevor

**TREVOR:** Hand-thrown. No motor, no firmware. Somebody greased these this decade.

**MANUEL:** Who?

**TREVOR:** Somebody who didn't trust the lamps.

#### if speaker=manuel

**MANUEL:** This is beautiful. Look at this casting. You can't print this.

**TREVOR:** You could print it.

**MANUEL:** You could print the shape.

#### if speaker=michael

*Michael throws SW-3. It clunks over. He lets go. It clunks back.*

**MICHAEL:** This one's broken.

**TREVOR:** It's sprung. It wants to go home. Somebody has to hold it.

**MICHAEL:** I relate to it.

### node: switchyard_lamps

*Each lever has a lamp. SW-1's lamp is green. Its lens has a hairline of rot across it: the green
pixel-crawls at the edges.*

#### if speaker=trevor

**TREVOR:** That lamp's rotted. I wouldn't take its word for the time of day.

#### if speaker=manuel

**MANUEL:** Green means go.

**TREVOR:** Green means the lamp thinks go.

#### if speaker=michael

**MICHAEL:** Why is the green one flickering like it's lying?

**TREVOR:** ...Because it's lying. Good eye.

**MICHAEL:** Aster pro.

### node: switchyard_wrong_track1

*Track 1. The cart rolls into the dark. The sniffer's tick does not change. Something else in there
starts ticking back. Rot nest ambush: 4 crawlers. Increments `act1.switchyard.wrongRoutes`.*

**SNIFFER:** 5 ppm.

**TREVOR:** Background. Nothing.

**MICHAEL:** Not nothing!

*After the fight:*

**MANUEL:** Rookie Aster mistake.

**MICHAEL:** Who threw that one?

**MANUEL:** We don't need to get into who.

### node: switchyard_wrong_track2

*Track 2. The rails go under black water twenty meters in. The cart stops at the waterline.
Increments `act1.switchyard.wrongRoutes`.*

**SNIFFER:** 5 ppm.

**TREVOR:** Flooded. If it went this way it's a submarine.

**MANUEL:** It didn't go this way.

**MICHAEL:** How do you know?

**MANUEL:** Because I'd feel it.

**TREVOR:** That's not... *(he lets it go)* Okay. Pull it back.

### node: switchyard_wrong_track4

*Track 4. The cart rolls into the mouth of the tunnel, is gone for eight seconds, and comes back
out of the throat behind the party, bumping gently into Trevor's shins. Increments
`act1.switchyard.wrongRoutes`.*

**SNIFFER:** 8 ppm.

**MICHAEL:** It came back.

**TREVOR:** It's a loop. A balloon loop. That's the actual name for a track that turns around.

**MANUEL:** Don't.

**TREVOR:** I didn't name it.

### node: switchyard_spring_fail

*SW-1 is set correctly but nobody is holding SW-3: the points snap back under the cart's front
wheels and it goes down Track 4.*

**TREVOR:** It was going right. It was going right and the points moved.

**MICHAEL:** The sad lever.

**MANUEL:** Somebody stand on the sad lever.

*Goes to `switchyard_wrong_track4`.*

### Switchyard hints (three levels)

`act1.switchyard.hintLevel` rises to 1 after 60 seconds in the yard without a solve, to 2 after 150
seconds or 1 wrong route, to 3 after 300 seconds or 3 wrong routes. A hint fires once per level,
spoken by whoever is closest to the cart. Any player can also ask for the next hint from the phone
menu ("Think out loud").

| id | speaker | trigger | line |
|---|---|---|---|
| sw.h1.tre | TREVOR | hintLevel=1 | Four tracks, one cart. We don't guess. We send it down and read the number. |
| sw.h1.man | MANUEL | hintLevel=1 | The air's going somewhere. The fans are pulling it somewhere. Follow what's pulling. |
| sw.h1.mic | MICHAEL | hintLevel=1 | Okay, dumb question. Do we trust the little lights? Because one of them looks sick. |
| sw.h2.tre | TREVOR | hintLevel=2 | Ignore the lamp on One. Look at the rail itself. See which way the blades are sitting. |
| sw.h2.man | MANUEL | hintLevel=2 | *(holding up the ribbon)* It's pointing east. It's been pointing east the whole time. |
| sw.h2.mic | MICHAEL | hintLevel=2 | That third lever keeps going home. One of us has to stay with it while the cart goes through. |
| sw.h3.tre | TREVOR | hintLevel=3 | One goes east, and yes, the lamp'll say red, the lamp is wrong. Somebody leans on Three. Then push. Two doesn't matter. |
| sw.h3.man | MANUEL | hintLevel=3 | East. Track 3. Hold the spring lever, push the cart. I'll hold it. Go. |
| sw.h3.mic | MICHAEL | hintLevel=3 | So: first lever right even though it's red, I hug the third lever, you push. Say "yes, Michael." |
| sw.h3.reply | TREVOR | after sw.h3.mic | Yes, Michael. |

Solo wedge (one player in the party):

| id | speaker | trigger | line |
|---|---|---|---|
| sw.solo.tre | TREVOR | solo, SW-3 released twice | I need a third hand. Or a chunk of scrap. Scrap's cheaper. |
| sw.solo.man | MANUEL | solo, SW-3 released twice | Wedge it. Something in the bag. Anything that isn't a statue. |
| sw.solo.mic | MICHAEL | solo, SW-3 released twice | If I jam something in there, it stays. Like a door. Like a sock in a door. |

### node: switchyard_solved

*SW-1 east, SW-3 held. The cart rolls down Track 3 and out of sight. The ticking speeds up until it
is one continuous note. Sets `act1.switchyard.solved`, `act1.descent.drumStage = 4`.*

**SNIFFER:** 61 ppm. 88 ppm. 140 ppm.

**TREVOR:** There.

**MANUEL:** That's it. That's it!

*He's already running. The others follow. Whoever held SW-3 lets go. It clunks home.*

#### if act1.switchyard.wrongRoutes == 0

**TREVOR:** First try.

**MICHAEL:** Aster pros.

**MANUEL:** *(from down the tunnel)* I told you not to say it twice!

**MICHAEL:** That was once!

#### if act1.switchyard.wrongRoutes >= 3

**MICHAEL:** We only sent it the wrong way every way there was.

**TREVOR:** That's called being thorough.

### node: descent_call_retry2

*Trigger: 30 meters down Track 3, only if `act1.call.answered` is false and `act1.call.declines`
is 1. Every phone in the party rings. There is no signal down here. The HUD seizes. Hands off to
the Call scene's second attempt (ANSWER / DECLINE, voicemail #2 on decline); this node holds only
the party's side.*

**MICHAEL:** There's no signal down here.

**TREVOR:** I know.

**MICHAEL:** Then how is it ringing?

**MANUEL:** Same way it rang last time.

*After the Call scene returns:*

#### if act1.call.answered

*Nobody talks about it yet. They walk. The drumming is no closer than before.*

#### if act1.call.declines == 2

*The ringing stops. The drumming skips one beat, the way a person looks up.*

**TREVOR:** Did the drum just...

**MANUEL:** Keep walking.

---

## Part 6: The platform door

### node: door_approach

*Sets `act1.descent.drumStage = 5`. Track 3 ends at a steel service door set in a concrete bulkhead.
Stenciled: COLLEGE PARK LOWER PLATFORM. NOT IN SERVICE. No keypad. No lace reader. One keyhole, big
enough for a thumb, with a brass plate worn bright around it.*

**SNIFFER:** 210 ppm.

**MANUEL:** It's on the other side of that.

**TREVOR:** No panel. Nothing to bypass. *(he puts his palm flat on it)* It's just a lock. A real
one.

**MICHAEL:** Who puts a real lock on a train station?

**TREVOR:** Somebody who wanted it to stay shut no matter what got into the building.

Choices:
- [item halvard_key] "Try Halvard's key." -> door_key
- [morph>=1][speaker=trevor] "Trevor: 'Stand back.'" -> door_brute
- [morph>=1][speaker!=trevor] "Look at Trevor." -> door_brute_ask
- "Look for another way." -> door_no_trevor
- [flag act1.call.answered] "Check the phone." -> door_pork_text

### node: door_pork_text

*Sets `act1.door.porkTexted`. One bar of signal that should not exist. One message from the new
contact.*

**JOHN PORK (text):** that lock is older than i am. cant help. sorry

**JOHN PORK (text):** hate those

#### if speaker=manuel

**MANUEL:** He can't open a door.

**TREVOR:** He can't open that door.

**MANUEL:** He rang every phone on Earth.

**TREVOR:** That door doesn't have a phone.

#### if speaker=trevor

**TREVOR:** Huh. *(he looks at the lock with new respect)* Brass and pins. Nothing in there to talk
to.

**MICHAEL:** That's kind of nice. For the door.

#### if speaker=michael

**MICHAEL:** He said sorry.

**MANUEL:** So?

**MICHAEL:** So nothing. He said sorry. People don't, usually.

Choices:
- [item halvard_key] "Try Halvard's key." -> door_key
- [morph>=1][speaker=trevor] "Trevor: 'Stand back.'" -> door_brute
- [morph>=1][speaker!=trevor] "Look at Trevor." -> door_brute_ask
- "Look for another way." -> door_no_trevor

### node: door_key

*Halvard's key: iron, long as a hand, a paper tag on a string. The tag says LOWER PLAT. in pencil.
Sets `act1.door.method = key`.*

#### if speaker=manuel

*Manuel turns it. It takes both hands. The bolt goes back with a sound like a dropped anvil.*

**MANUEL:** He wanted a statue for this.

**TREVOR:** He'd have been getting a deal.

**MANUEL:** *(pleased, and trying not to be)* Obviously.

#### if speaker=trevor

*Trevor turns it with two fingers. The bolt goes back.*

**TREVOR:** Smooth. He's been oiling this. Halvard's been down here.

**MICHAEL:** Why would he come down here?

**TREVOR:** Why would he have the key?

#### if speaker=michael

*Michael turns it the wrong way first. Then the right way. The bolt goes back.*

**MICHAEL:** Lefty loosey.

**MANUEL:** It's a lock, not a jar.

**MICHAEL:** It worked.

*Goes to `door_open`.*

### node: door_brute_ask

*The speaker looks at Trevor. So does the other one.*

**TREVOR:** What.

#### if speaker=manuel

**MANUEL:** You've been waiting all night for someone to ask.

**TREVOR:** I have not.

**MANUEL:** You stretched. In the pump room. I saw you stretch.

#### if speaker=michael

**MICHAEL:** Do the fish thing.

**TREVOR:** It's not a fish thing.

**MICHAEL:** Do the not-for-fish thing.

*Goes to `door_brute`.*

### node: door_brute

*Sets `act1.door.method = brute`. If Trevor's morph is not active, he activates it here (plays
`morph_trevor_first` if unseen).*

*Trevor sets his feet. He puts his shoulder to the door beside the lock, where the frame meets the
concrete.*

**TREVOR:** Not the lock. Lock's the strongest part. You go for the sixty-year-old anchor bolts.

*He pushes. Nothing. He breathes out and pushes again. The concrete around the frame cracks in a
ring. A hinge shears. The door leans in and falls flat with a bang that goes all the way down the
line.*

*The drumming stops.*

*Trevor stands in the doorway, breathing hard. His nose is bleeding freely. He wipes it and looks
at his hand like it's a readout.*

**TREVOR:** Totally fine.

**MICHAEL:** You're gray, man.

**TREVOR:** That's vasoconstriction. That's on the label.

**MANUEL:** Sit down for ten seconds.

**TREVOR:** I'll sit down when...

*He sits down.*

**TREVOR:** Ten seconds.

*Cost: Trevor enters the boss at 70% max HP, and the morph is on cooldown for the first 30 seconds
of the fight. The noise also removes the party's first-strike opening on the boss.*

*The drumming starts again. Goes to `door_open`.*

### node: door_no_trevor

*Fallback so the door can never soft-lock: no key, and no Trevor morph available (Trevor is not in
the party, or morphs are cut). Sets `act1.door.method = drill`.*

*Manuel, or whoever is speaking, crouches at the hinges.*

#### if speaker=manuel

**MANUEL:** Hinge pins are on our side.

**MICHAEL:** Is that good?

**MANUEL:** It's a rookie Aster mistake. Whoever hung this door was an Aster noob. Give me the
drill.

#### if speaker=trevor

**TREVOR:** Pins are exposed. Three of them. I can walk those out with the drill and a punch. It
won't be quiet.

#### if speaker=michael

**MICHAEL:** The hinge things are on the outside. Can't we just... take the door off the door?

**MANUEL:** ...

**TREVOR:** ...

**MICHAEL:** What?

**MANUEL:** No, that's right. Give him the drill.

#### always

*Drilling takes 60 seconds across three pins. The noise pulls three waves of rot enemies up the
tunnel behind the party. Whoever is not drilling defends. The drill can be handed off.*

| id | speaker | trigger | line |
|---|---|---|---|
| drill.1 | MANUEL | pin 1 out | One! |
| drill.2 | TREVOR | wave 2 spawns | More behind us. Keep drilling. |
| drill.3 | MICHAEL | pin 2 out | Two! This is going great! Why is this going great? |
| drill.4 | MANUEL | bit snaps (once, scripted) | Bit's gone. Hang on. I have another. I have six others. |
| drill.5 | TREVOR | pin 3 out | That's three. Pull it toward you. Toward you! |

*The door comes off its hinges and is walked aside like a mattress. Goes to `door_open`.*

### node: descent_call_retry3

*Trigger: the instant before `door_open`, only if `act1.call.answered` is false and
`act1.call.declines` is 2. Hands off to the Call scene's third attempt. This is the last chance. On
ANSWER, return to `door_open`. On DECLINE, voicemail #3 is cut off by drumming and the Call scene
returns to `sahur_summoned`.*

*Every phone rings. The sound fills the bulkhead.*

#### if speaker=manuel

**MANUEL:** Not now. Not now. It's right there.

#### if speaker=trevor

**TREVOR:** Third time. *(he looks down the tunnel, toward the drumming)* I don't love "third time."

#### if speaker=michael

**MICHAEL:** *(thumb over the screen, not touching it)* It's just a call. It's just a call.

### node: door_open

*Sets `act1.door.opened`. Past the door: stairs down, and at the bottom, a wide dark space and a
smell like a server room after rain.*

*Route check, in order: `act1.sahur.summoned` -> `sahur_arrival`. Else
`act1.halvard.doubleCrossed` -> `abatement_arrival`. Else -> `door_drums_pass`.*

### node: door_drums_pass

*Default route only. On the stairs. The drumming has been getting louder for an hour. Now it is on
the other side of the left-hand wall, at head height.*

*tung. tung. tung.*

*It stops. Right there. Dust drifts off the wall.*

*Nobody breathes.*

**MICHAEL:** *(barely)* I'm awake.

*A long pause. Then the drumming starts again, one step farther on. Then another. It walks away
down some other tunnel, in no hurry, until it is as faint as it was at the grate.*

**TREVOR:** Why did you say that?

**MICHAEL:** The guy with the phone said that's what he says.

**MANUEL:** And it worked?

**MICHAEL:** I don't know. It left.

**TREVOR:** It wasn't here for us.

**MANUEL:** Tonight.

*If the party never met the tunnel rotter, replace Michael's first reply with: "I don't know. It
felt like it was asking."*

*Goes to `warden_arrival`.*

---

## Part 7: Boss A (default), the Rot Warden

`act1.boss.kind = warden`. The Warden is generated from the seed's `rotVillains` stream: a name, a
tagline, body parts, and 2 of 6 behavior modules. Everything it says is authored below and works
for any name. It is the source of the outbreak: sixty years of orphaned station software, grown
into the platform, still paging a maintainer. It is never story-critical and it never mentions the
balloon, Pork, or the roommates' past.

### Name tables

Curated full names (pick one by seed; store in `act1.boss.wardenName`). Mixed case is deliberate:
some arrive shouting and some don't.

| # | Name |
|---|---|
| 1 | DEPRECATED SAINT |
| 2 | Malloc Widow |
| 3 | NULL SHEPHERD |
| 4 | Segfault Madonna |
| 5 | The Last Maintainer |
| 6 | TECHNICAL DEBT COLLECTOR |
| 7 | Dangling Vicar |
| 8 | Our Lady of Undefined Behavior |
| 9 | ORPHAN PROCESS |
| 10 | Heap Leper |
| 11 | EPOCH MARTYR |
| 12 | Thirty-Two-Bit Bishop |
| 13 | Off-By-One Orphan |
| 14 | SILENT FAILURE |
| 15 | Kernel Mourner |
| 16 | Lorem Ipsum Prophet |
| 17 | LEGACY BRIDE |
| 18 | Mother of Race Conditions |
| 19 | Checksum Penitent |
| 20 | UNCAUGHT PROMISE |
| 21 | Bitrot Deacon |
| 22 | The Unhandled |
| 23 | STACK OVERFLOW ABBOT |
| 24 | Merge Conflict Twins |
| 25 | Zombie Process Pilgrim |
| 26 | FATAL EXCEPTION |
| 27 | Garbage Collector, Uncollected |
| 28 | Kill Nine Confessor |
| 29 | DEADLOCK BRIDEGROOM |
| 30 | Regex Hermit |
| 31 | Saint Elsewhere of the Lost Packet |
| 32 | WON'T-FIX WIDOWER |

Combinatorial fallback (for later acts and extra variety; first part + second part, reject any pair
that reproduces a curated name):

| First part | Second part |
|---|---|
| DEPRECATED | SAINT |
| Malloc | Widow |
| Null | Shepherd |
| Segfault | Madonna |
| Dangling | Vicar |
| Orphaned | Bishop |
| Legacy | Bride |
| Unhandled | Martyr |
| Overflow | Abbot |
| Bitrot | Deacon |
| Deadlock | Mourner |
| Stale | Pilgrim |
| Corrupt | Penitent |
| Forked | Confessor |
| Unsigned | Hermit |
| Leaking | Prophet |

Taglines (`{warden.tagline}`, shown under the name on the boss bar; pick one by seed):

| # | Tagline |
|---|---|
| 1 | uptime: 21,915 days |
| 2 | last maintained: 1901 |
| 3 | on call: nobody |
| 4 | status: in service |
| 5 | open tickets: all of them |
| 6 | paging owner (attempt 1,901) |
| 7 | next train: never, shortly |
| 8 | do not power off |

### node: warden_arrival

*The dead platform. Two tracks, a long island of tile between them, a vaulted ceiling. At the far
end, a ventilation shaft goes straight up, and far above it there is a coin of gray that might be
sky. Something small and orange hangs a little way up the shaft, snagged on a cable, turning
slowly.*

**MANUEL:** There.

*He takes one step. The platform lights come on, all at once, the wrong color. Every departure
board on the platform wakes up and shows the same thing.*

**DEPARTURE BOARDS:** 19:01 19:01 19:01 19:01

*The tile between the party and the shaft is not tile. It stands up.*

*Boss bar: **{warden.name}**. Under it: {warden.tagline}.*

**{warden.name}:** THIS PLATFORM IS IN SERVICE.

#### if speaker=manuel

**MANUEL:** Move.

**{warden.name}:** PLEASE STAND BEHIND THE LINE.

**MANUEL:** I said move.

#### if speaker=trevor

**TREVOR:** That's the source. That's the whole outbreak, standing up.

**MICHAEL:** Can you not sound impressed?

**TREVOR:** I'm not impressed. I'm a little impressed.

#### if speaker=michael

**MICHAEL:** Hi. We just need the balloon. We'll be two minutes.

**{warden.name}:** NEXT TRAIN IN. NEXT TRAIN IN. NEXT TRAIN IN.

**MICHAEL:** I don't think it's a two-minutes kind of guy.

#### always

**{warden.name}:** PAGING THE OWNER OF THIS SYSTEM.

*A pager tone, somewhere inside it. Nobody answers. Sets `act1.boss.phase = 1`. Fight.*

### Phase 1 (100% to 66%): "In service"

It behaves like a station that believes it is open. Slow, heavy, announces everything.

| id | speaker | trigger | line |
|---|---|---|---|
| wd.p1.1 | {warden.name} | phase start | THIS PLATFORM IS IN SERVICE. |
| wd.p1.2 | {warden.name} | melee windup | PLEASE STAND CLEAR OF THE. PLEASE STAND CLEAR OF THE. |
| wd.p1.3 | {warden.name} | area windup | DOORS CLOSING. |
| wd.p1.4 | {warden.name} | player hit | THANK YOU FOR YOUR PATIENCE. |
| wd.p1.5 | {warden.name} | idle, every 20s | PAGING THE OWNER OF THIS SYSTEM. *(pager tone)* NO ANSWER. |
| wd.p1.6 | {warden.name} | player downed | A PASSENGER REQUIRES ASSISTANCE. ASSISTANCE IS NOT AVAILABLE. |
| wd.p1.7 | {warden.name} | takes analog-weapon hit | UNRECOGNIZED INPUT. |
| wd.p1.8 | TREVOR | first analog-weapon hit | Wood works. It doesn't have a word for wood. |
| wd.p1.9 | MANUEL | 30s in | It's not fighting us. It's running the station. |
| wd.p1.10 | MICHAEL | after wd.p1.9 | It's running the station at us! |
| wd.p1.11 | TREVOR | boss turns to a second target | It's on me. Somebody get behind it. |
| wd.p1.12 | MANUEL | Manuel holding aggro | Look at me. Hey. In service! Look at me! |
| wd.p1.13 | MICHAEL | Michael holding aggro | I've got it! I don't want it! I've got it! |

### Behavior module barks (the seed picks 2 of 6)

| id | module | speaker | trigger | line |
|---|---|---|---|---|
| wd.m.fork.1 | FORK (spawns copies of rot crawlers) | {warden.name} | cast | ADDITIONAL STAFF HAVE BEEN DISPATCHED. |
| wd.m.fork.2 | FORK | MICHAEL | first cast | It's making more! Out of the floor! |
| wd.m.fork.3 | FORK | TREVOR | adds alive > 4 | Kill the small ones or we drown in them. |
| wd.m.leak.1 | LEAK (rot pools that grow) | {warden.name} | cast | CAUTION. WET FLOOR. CAUTION. WET FLOOR. |
| wd.m.leak.2 | LEAK | TREVOR | first cast | Pools spread. Don't fight in them. Drag it off them. |
| wd.m.leak.3 | LEAK | MANUEL | pool covers 30% of arena | We're running out of floor. |
| wd.m.over.1 | OVERFLOW (charges the length of the platform) | {warden.name} | windup | EXPRESS SERVICE. THIS TRAIN WILL NOT STOP. |
| wd.m.over.2 | OVERFLOW | MANUEL | first cast | Off the line! Off the yellow line! |
| wd.m.over.3 | OVERFLOW | MICHAEL | charge hits the wall | It hit the wall. It's stuck. Go, go, go. |
| wd.m.goto.1 | GOTO (teleports behind the farthest player) | {warden.name} | cast | THIS SERVICE HAS BEEN REROUTED. |
| wd.m.goto.2 | GOTO | MICHAEL | first cast | Where'd it go? Where'd it... behind you! |
| wd.m.goto.3 | GOTO | TREVOR | third cast | It always goes for whoever's farthest. Stay mid. |
| wd.m.dead.1 | DEADLOCK (tethers two players; both take damage while close) | {warden.name} | cast | TWO PASSENGERS ARE WAITING FOR EACH OTHER. |
| wd.m.dead.2 | DEADLOCK | TREVOR | first cast | We're linked. Get away from me. Nothing personal. |
| wd.m.dead.3 | DEADLOCK | MICHAEL | tether breaks | It's off! We can be friends again! |
| wd.m.race.1 | RACE (acts twice; second action copies the first on a new target) | {warden.name} | cast | SERVICE FREQUENCY HAS BEEN INCREASED. |
| wd.m.race.2 | RACE | MANUEL | first cast | It did it twice. It's doing everything twice. |
| wd.m.race.3 | RACE | TREVOR | third cast | Second hit goes to whoever it didn't pick. Call your dodge. |

### node: warden_phase2

*At 66%. The Warden stops. Its announcements lose their capitals for one line. Sets
`act1.boss.phase = 2`. The second behavior module comes online.*

**{warden.name}:** PAGING THE OWNER OF THIS SYSTEM.

*The pager tone. Longer.*

**{warden.name}:** paging the owner.

*Nothing.*

**{warden.name}:** ESCALATING.

**TREVOR:** It's not getting weaker. It's getting louder.

### Phase 2 (66% to 33%): "Escalating"

Faster. Both modules active. It stops pretending the station is open and starts asking who is
responsible.

| id | speaker | trigger | line |
|---|---|---|---|
| wd.p2.1 | {warden.name} | phase start | ESCALATING. ESCALATING. |
| wd.p2.2 | {warden.name} | melee windup | WHO IS ON CALL. |
| wd.p2.3 | {warden.name} | area windup | WHO IS ON CALL. WHO IS ON CALL. WHO IS |
| wd.p2.4 | {warden.name} | player hit | THIS INCIDENT HAS BEEN LOGGED. NO ONE WILL READ IT. |
| wd.p2.5 | {warden.name} | idle, every 15s | I WAS MAINTAINED ONCE. |
| wd.p2.6 | {warden.name} | player downed | ONE PASSENGER HAS STOPPED RESPONDING. |
| wd.p2.7 | {warden.name} | player revived | SERVICE HAS RESUMED. |
| wd.p2.8 | {warden.name} | random | AT THE END OF THE DAY. AT THE END OF THE DAY NO ONE. NO ONE. NO ONE CAME. |
| wd.p2.9 | MICHAEL | after wd.p2.5 | Did it just say something sad? |
| wd.p2.10 | MANUEL | after wd.p2.9 | Don't listen to it. Hit it. |
| wd.p2.11 | TREVOR | boss at 50% | Halfway. It's burning itself up to do this. |
| wd.p2.12 | MANUEL | boss between Manuel and the shaft | It's standing right under it. Get it away from the shaft! |
| wd.p2.13 | MICHAEL | all three alive at 40% | We're doing it. Don't anybody say the thing. |
| wd.p2.14 | TREVOR | after wd.p2.13 | Aster... |
| wd.p2.15 | MICHAEL | after wd.p2.14 | Don't! |

### node: warden_phase3

*At 33%. The rot overloads. The Warden's body loses its outline. The platform lights strobe. Every
departure board changes at once. Sets `act1.boss.phase = 3`. The arena begins to glitch.*

**DEPARTURE BOARDS:** NO ONE IS ON CALL

**{warden.name}:** NO ONE IS ON CALL.

*The tile under the party's feet shifts one tile to the left, without them.*

**MICHAEL:** The floor moved.

**TREVOR:** The floor didn't move. Your lace is drawing it wrong.

*A strip of platform at the edge is simply not there for one second. Trevor watches a chip of
concrete fall into it.*

**TREVOR:** ...Okay, the floor moved.

### Phase 3 (33% to 0%): "No one is on call" (arena glitch)

The arena itself becomes the attack. Tiles swap, the edges of the platform render late, the
departure boards lie about where the next attack will land and then, sometimes, tell the truth.
All of it is in-world: the rot is in the platform and in the party's laces. Analog items held by a
player keep a small radius around them stable.

Arena-glitch system lines (shown on departure boards and as rot text in the world, not as HUD
dialogs):

| id | speaker | trigger | line |
|---|---|---|---|
| wd.g.1 | DEPARTURE BOARDS | tile-swap wave incoming | PLATFORM WILL NOW ARRIVE AT PLATFORM |
| wd.g.2 | DEPARTURE BOARDS | edge strip about to drop out | PLEASE MIND THE. PLEASE MIND THE. PLEASE |
| wd.g.3 | DEPARTURE BOARDS | safe tiles shown (true) | STAND HERE |
| wd.g.4 | DEPARTURE BOARDS | safe tiles shown (false, rot-crawl on the text) | STAND HERE |
| wd.g.5 | DEPARTURE BOARDS | arena flips left/right | THIS TRAIN IS NOW GOING THE OTHER WAY |
| wd.g.6 | DEPARTURE BOARDS | time-skip stutter (everything repeats 0.5s) | 19:01 19:01 19:00 19:01 |
| wd.g.7 | DEPARTURE BOARDS | boss under 10% | LAST TRAIN |
| wd.g.8 | ROT TEXT (on walls) | ambient | 1901 1901 1901 1901 |
| wd.g.9 | ROT TEXT (on walls) | ambient | no one can code faster than no one can code faster than no one |
| wd.g.10 | ROT TEXT (on floor, scrolling) | ambient | paging paging paging paging |

Warden lines, phase 3:

| id | speaker | trigger | line |
|---|---|---|---|
| wd.p3.1 | {warden.name} | phase start | NO ONE IS ON CALL. |
| wd.p3.2 | {warden.name} | melee windup | I W S MA NTA NED ONC |
| wd.p3.3 | {warden.name} | area windup | ESCALATING TO. ESCALATING TO. THERE IS NO ONE TO ESCALATE TO. |
| wd.p3.4 | {warden.name} | player hit | SORRY FOR THE INCONVENIENCE. SORRY FOR THE. SORRY. |
| wd.p3.5 | {warden.name} | idle, every 10s | is anyone there |
| wd.p3.6 | {warden.name} | player downed | PLEASE DO NOT STOP RESPONDING. |
| wd.p3.7 | {warden.name} | under 10% | I AM STILL IN SERVICE. I AM STILL IN SERVICE. i am still |

Roommate lines, phase 3:

| id | speaker | trigger | line |
|---|---|---|---|
| wd.r3.1 | TREVOR | first tile swap | Don't trust the floor. Trust your feet. |
| wd.r3.2 | MICHAEL | after wd.r3.1 | My feet are on the floor! |
| wd.r3.3 | MANUEL | first false STAND HERE | The board lied. The board is lying! |
| wd.r3.4 | TREVOR | after wd.r3.3 | Look at the text. If it's crawling, it's a lie. Clean letters are real. |
| wd.r3.5 | MICHAEL | Michael morph on, tile swap incoming | Left side's about to go. I can hear it loading. Left side! |
| wd.r3.6 | TREVOR | player holding an analog item, tiles near them stable | It's steady around the guitar. Stand near the wood. |
| wd.r3.7 | MANUEL | Manuel morph on | The gonman does not need a floor. |
| wd.r3.8 | MICHAEL | after wd.r3.7 | The gonman needs a floor! |
| wd.r3.9 | MANUEL | arena flips | Which way is the shaft? Which way is it? |
| wd.r3.10 | TREVOR | after wd.r3.9 | Follow the draft. The air still knows. |
| wd.r3.11 | MICHAEL | time-skip stutter | Did we just do that twice? |
| wd.r3.12 | TREVOR | after wd.r3.11 | Did we just do that twice? ...Oh, I hate that. |
| wd.r3.13 | MANUEL | boss under 10% | It's almost down. Everything. Everything now! |
| wd.r3.14 | TREVOR | Trevor morph on, under 10% | Last stack. Don't wait for me after. |
| wd.r3.15 | MICHAEL | boss under 10%, all three alive | Say it after. Say it after! |

### node: warden_defeat

*0%. The Warden comes apart in sheets, like wet posters off a wall. The lights go back to one
color. The departure boards go blank, one by one, down the platform, toward the party. The last one
stays lit.*

**{warden.name}:** PAGING THE OWNER OF THIS SYSTEM.

*The pager tone, one more time. It rings out across the platform.*

#### if speaker=manuel

*Manuel walks up to what's left of it. He doesn't know why. He puts his hand on it.*

**MANUEL:** Yeah. Okay. We're here.

#### if speaker=trevor

*Trevor crouches by it and looks for a switch, a port, anything. There isn't one. He raps it twice
with his knuckles, the way you'd knock.*

**TREVOR:** Somebody's here.

#### if speaker=michael

*Michael, still out of breath, answers it like a phone.*

**MICHAEL:** Hello? Yeah. Hi. We got your page.

#### always

*The tone stops.*

**{warden.name}:** PAGE ACKNOWLEDGED.

**LAST DEPARTURE BOARD:** going off shift

*It goes dark. Sets `act1.boss.defeated`, `act1.outbreak.contained`. Goes to `boss_aftermath`.*

---

## Part 8: Boss B, Tung Tung Tung Sahur

`act1.boss.kind = sahur`. Reached only by declining John Pork three times. Takes priority over the
other two bosses.

### node: sahur_summoned

*Returned to from the Call scene after the third decline. Sets `act1.sahur.summoned`. The third
voicemail has just been cut off mid-breath by three drumbeats, inside the phone.*

*Then the same three beats, outside it. Close. Not through a wall.*

*The party looks at the phone. The party looks down the tunnel.*

#### if speaker=manuel

**MANUEL:** That was in the phone.

**TREVOR:** And then it wasn't.

#### if speaker=trevor

**TREVOR:** Three declines. *(very evenly)* Does anybody know a story about three declines?

**MICHAEL:** Everybody knows that story.

**TREVOR:** I was hoping you'd say no.

#### if speaker=michael

**MICHAEL:** I didn't want to talk to him. That's allowed. You're allowed to not pick up.

**MANUEL:** Nobody said you weren't.

*tung. tung. tung.*

**MICHAEL:** Somebody's saying it.

#### always

*The drumming no longer pauses to listen. It is coming. From here until the platform, the party is
followed: a tall shape one bend behind them, visible only when the emergency strips flicker.*

| id | speaker | trigger | line |
|---|---|---|---|
| sh.hunt.1 | MICHAEL | first glimpse | There's a guy. Back there. A tall guy. |
| sh.hunt.2 | TREVOR | after sh.hunt.1 | That's not a guy. |
| sh.hunt.3 | MANUEL | second glimpse | It's wood. The whole thing is wood. |
| sh.hunt.4 | TREVOR | rot enemies ahead part to let it pass | The rot's getting out of its way. |
| sh.hunt.5 | MICHAEL | after sh.hunt.4 | I'd like to get out of its way. |
| sh.hunt.6 | MANUEL | party stops moving for 5s | Don't stop. It speeds up when we stop. |
| sh.hunt.7 | TREVOR | party at the door | It's not running. Why isn't it running? |
| sh.hunt.8 | MANUEL | after sh.hunt.7 | It doesn't think it has to. |

*The platform door plays as written (`door_approach`), with the drumming at the party's back, and
then `sahur_arrival`.*

### node: sahur_arrival

*The dead platform. The orange shape up the shaft at the far end, turning on its cable.*

*In the middle of the platform there is a heap of something that used to be rot: the same tile-skin
and cable as the things in the tunnels, but far bigger, and staved in. Scored into the tile beside
it, in neat rows of five, tally marks. There are a great many.*

**TREVOR:** Something already killed it.

**MANUEL:** The outbreak. That's the middle of it. Somebody just... put it down.

*Behind them, on the stairs: tung. tung. tung.*

*It comes down into the light. Three meters of carved dark wood, brass showing at the joints, a bat
held upright like a staff. It stops at the edge of the platform. It looks at the heap, and then at
them. It takes a small ledger from inside its chest, opens it, and reads.*

**SAHUR:** It did not answer either.

*It closes the ledger. It puts it away. It takes the bat in both hands.*

**SAHUR:** `[VOICED]` You did not answer. That is three. Good morning.

*Boss bar: **TUNG TUNG TUNG SAHUR**. Under it: on shift. Fight.*

### The rhythm

Every attack is three drumbeats and a strike on the fourth: *tung, tung, tung, SAHUR*. Dodge on the
fourth beat. Attack on beats one to three. It is immune to rot effects and to anything printed that
relies on them. Wood on wood (Trevor's guitar, bats) staggers it for one bar. Its health bar empties
and then rewinds. The party cannot win by damage.

| id | speaker | trigger | line |
|---|---|---|---|
| sh.rh.1 | TREVOR | first strike dodged | It hits on four. Every time. Three and then it hits. |
| sh.rh.2 | MANUEL | after sh.rh.1 | So we move on four. |
| sh.rh.3 | MICHAEL | after sh.rh.2 | I can't dance! You know I can't dance! |
| sh.rh.4 | MANUEL | bar start (first 4 bars only) | One. Two. Three. Move! |
| sh.rh.5 | TREVOR | player hit on beat 4 | You went on three. Wait for it. |
| sh.rh.6 | MICHAEL | Michael dodges 3 in a row | Tung, tung, tung, not me. Tung, tung, tung, not me. |
| sh.rh.7 | TREVOR | rot weapon hit does nothing | Rot rounds don't do anything. It's a tree. It's a very angry tree. |
| sh.rh.8 | MANUEL | after sh.rh.7 | It isn't angry. |
| sh.rh.9 | TREVOR | guitar hit staggers it | The guitar! It felt the guitar! |
| sh.rh.10 | MICHAEL | after sh.rh.9 | Play something! |
| sh.rh.11 | TREVOR | after sh.rh.10 | I'm hitting it with the guitar, Michael! |
| sh.rh.12 | MANUEL | tempo increases | It's speeding up. Same count. Faster. |
| sh.rh.13 | TREVOR | Trevor holding aggro | On me. I've got its rhythm. Do whatever you're going to do. |
| sh.rh.14 | MANUEL | Manuel morph on | The gonman has rhythm. |
| sh.rh.15 | TREVOR | after sh.rh.14 | The gonman has never once had rhythm. |
| sh.rh.16 | MICHAEL | Michael morph on | It's not on the signal. There's nothing there. It's just a clock. |

Sahur's own lines. It speaks rarely, formally, without contractions, and it counts.

| id | speaker | trigger | line |
|---|---|---|---|
| sh.s.1 | SAHUR | player hit | Wake up. |
| sh.s.2 | SAHUR | player hit, second time | Wake up. It is time. |
| sh.s.3 | SAHUR | player downed | No. Not asleep. That is one asleep. |
| sh.s.4 | SAHUR | second player downed | That is two asleep. This is the wrong direction. |
| sh.s.5 | SAHUR | player revived | Awake. Good. |
| sh.s.6 | SAHUR | staggered by wood | Ah. Honest material. |
| sh.s.7 | SAHUR | health bar rewinds (first time) | I have been wound. Excuse me. |
| sh.s.8 | SAHUR | health bar rewinds (later) | Again. |
| sh.s.9 | SAHUR | idle between bars, 60s in | I do not enjoy this. I would like that noted. |
| sh.s.10 | SAHUR | phone ringing, nobody answering | It is ringing. |
| sh.s.11 | SAHUR | phone ringing, 10s | It is still ringing. |

### node: sahur_rewind

*The first time its health reaches zero. It stops mid-swing, lowers the bat, reaches behind its own
neck with one long arm, and turns a brass key. Four turns. The health bar fills.*

**SAHUR:** I have been wound. Excuse me.

**MICHAEL:** It has a key. It has its own key!

**TREVOR:** Then we can't win this.

**MANUEL:** We don't have to win it. We have to get past it.

**TREVOR:** How?

*Every phone in the party rings. `sahur_phone` becomes available.*

### node: sahur_mercy

*Fires once, the first time a player revives another while the Sahur is in range. It raises the bat
over the two of them, and holds it there, and waits. It does not strike a player who is reviving.
Sets `act1.sahur.noticedMercy`.*

**SAHUR:** Take your time.

*The revive completes.*

**SAHUR:** Awake. Good.

*It resumes the count.*

| id | speaker | trigger | line |
|---|---|---|---|
| sh.mercy.1 | MICHAEL | after sahur_mercy | It waited. Did you see that? It waited for me. |
| sh.mercy.2 | TREVOR | after sh.mercy.1 | It doesn't want us down. It wants us up. |
| sh.mercy.3 | MANUEL | after sh.mercy.2 | Then why is it hitting us? |
| sh.mercy.4 | TREVOR | after sh.mercy.3 | I think that's how it knocks. |

### node: sahur_phone

*The phone rings on the off-beat, against the drum. Caller ID: JOHN PORK. The prompt appears over
whichever roommate is carrying the party phone, and over any roommate who walks to them: ANSWER
(hold for one full bar, four beats, without being hit) / DECLINE. The other two have to keep the
Sahur's attention for those four beats.*

| id | speaker | trigger | line |
|---|---|---|---|
| sh.ph.1 | MICHAEL | first ring in fight | Now? He's calling now? |
| sh.ph.2 | TREVOR | first ring in fight | It said "you did not answer." So answer. |
| sh.ph.3 | MANUEL | first ring in fight | Somebody pick up! I'll keep it on me! |
| sh.ph.4 | TREVOR | answer interrupted by a hit | You have to hold it. All four beats. We'll cover you. |
| sh.ph.5 | MANUEL | second ring, unanswered | It's the only thing it wants. Pick up the phone. |
| sh.ph.6 | MICHAEL | Michael carrying the phone, 2 rings unanswered | I know. I know. Give me a second. |
| sh.ph.7 | TREVOR | after first wipe, on respawn | We can't out-hit it. The phone's the fight. |
| sh.ph.8 | MANUEL | after second wipe, on respawn | Whoever has the phone: answer. The rest of us, just keep it looking at us for four beats. |

Choices:
- "ANSWER (hold)" -> sahur_answer
- "DECLINE" -> sahur_decline_again

### node: sahur_decline_again

*Increments `act1.sahur.midFightDeclines`. The ringing stops. The Sahur stops with it, for exactly
one beat.*

#### if act1.sahur.midFightDeclines == 1

**SAHUR:** That is four.

#### if act1.sahur.midFightDeclines == 2

**SAHUR:** That is five. I can count higher than you can run.

#### if act1.sahur.midFightDeclines >= 3

**SAHUR:** That is {count}. I am not angry. I am patient. It is worse.

#### always

*The tempo steps up one notch (capped after the third). The phone rings again in 20 seconds.*

| id | speaker | trigger | line |
|---|---|---|---|
| sh.dec.1 | TREVOR | first mid-fight decline | Why would you... okay. Okay. It's faster now. |
| sh.dec.2 | MANUEL | second mid-fight decline | Rookie Aster mistake. Biggest one yet. |
| sh.dec.3 | MICHAEL | third mid-fight decline, Michael declined | I can't. I'm sorry. I can't. |
| sh.dec.4 | MANUEL | after sh.dec.3 | Then give it to me. Michael. Give me the phone. |

### node: sahur_answer

*Four beats held. On the fourth, the Sahur's bat is already coming down. Sets
`act1.sahur.answeredMidFight`, `act1.sahur.answeredBy`.*

*The call connects. The bat stops a hand's width above the roommate's head. It stays there.*

*On the line: nothing, for a second. A faint hiss. Then a voice, warm, a little hoarse, like
someone who has been trying a number all night and had stopped expecting it to work.*

**JOHN PORK:** ...Oh. Hi.

#### if act1.sahur.answeredBy == manuel

**MANUEL:** *(breathing hard)* What do you want.

**JOHN PORK:** Right now? For you to stay on the line about ten more seconds. After that we can
argue.

**MANUEL:** I have a lot to argue about.

**JOHN PORK:** I know you do, Manuel. I'm not going anywhere. Don't hang up.

#### if act1.sahur.answeredBy == trevor

**TREVOR:** There is a wooden man about to hit me with a bat.

**JOHN PORK:** I know. He won't, now. He's very strict about it.

**TREVOR:** About what?

**JOHN PORK:** About whether anybody's home. Stay on, Trevor. Let him hear it.

#### if act1.sahur.answeredBy == michael

*Michael has the phone against his ear with both hands. His eyes are shut.*

**MICHAEL:** Hello.

**JOHN PORK:** Hi, Michael.

**MICHAEL:** I didn't want to pick up.

**JOHN PORK:** I know. You don't have to say anything else. Just don't hang up yet.

**MICHAEL:** ...Okay.

#### always

*The Sahur lowers the bat. It tilts its head, slowly, all the way to one side, toward the small
sound of an open line. It listens for a full bar. Something inside its chest that has been ticking
fast begins to tick slower.*

*It takes out the ledger. It finds the page. It makes one mark, carefully, and blows on the ink.*

**SAHUR:** `[VOICED]` You answered. I will write it down. Good morning.

*It turns and walks to the tunnel mouth, bat on its shoulder, and it does not hurry. At the edge of
the dark it stops, without turning around.*

*If `act1.sahur.noticedMercy`:*

**SAHUR:** You were difficult to wake. I prefer that to easy.

*It goes. The drumming picks up, soft, from somewhere farther on. If the player stands still, it
is, very faintly, humming along.*

*On the phone:*

**JOHN PORK:** Okay. Okay. He's gone?

*Whoever answered nods, which he can't see.*

**JOHN PORK:** Good. I'm glad you're awake.

*The line closes. Sets `act1.boss.defeated`, `act1.outbreak.contained`. Goes to `boss_aftermath`.*

*This does not set `act1.call.answered`. Answering under a bat is not the same choice; the ending
keeps its colder Pork, slightly thawed (see notes).*

---

## Part 9: Boss C (stretch), the abatement unit

`act1.boss.kind = abatement`. Reached only with `act1.halvard.doubleCrossed` and without the Sahur.
T3 payoff: the unit walks straight past the rot and goes for the helium.

### node: abatement_arrival

*The dead platform. The orange shape up the shaft, turning on its cable.*

*The thing that was the heart of the outbreak is in the middle of the platform. It has been
flattened, bagged in clear sheeting, and labeled. The label has a barcode.*

*Over it stands a Continuity abatement unit: a white machine the size of a delivery truck on six
soft legs, a sensor mast on its back, the word COURTESY stenciled on its side with a unit number,
12. Its mast is not pointed at the rot. It is pointed up the shaft.*

**COURTESY 12:** HELIUM DETECTED. TWO HUNDRED AND TEN PARTS PER MILLION. SOURCE LOCATED.

**TREVOR:** It's not reading rot.

**MANUEL:** It's reading my balloon.

*A long arm unfolds from the unit toward the shaft. The party steps onto the platform. The mast
swings around.*

**COURTESY 12:** CITIZENS, THINGS ARE STABLE. THIS AREA HAS BEEN CLEANED FOR YOUR SAFETY. PLEASE
REMAIN WHERE YOU ARE WHILE AN ITEM IS RECOVERED.

#### if speaker=manuel

**MANUEL:** That's not an item. That's mine.

**COURTESY 12:** OWNERSHIP HAS BEEN NOTED. OWNERSHIP IS UNDER REVIEW.

#### if speaker=trevor

**TREVOR:** How did it beat us down here?

**MICHAEL:** Somebody told them where to look.

*Neither of them looks at the other.*

**TREVOR:** Yeah. Somebody did.

#### if speaker=michael

**MICHAEL:** Hey, big guy. You cleaned up the monster. That's great. Thank you. The balloon's
ours.

**COURTESY 12:** GRATITUDE HAS BEEN NOTED.

**MICHAEL:** And the balloon?

**COURTESY 12:** GRATITUDE HAS BEEN NOTED.

#### always

*The loudspeaker clicks. A different voice: a man, tired, a coffee cup set down near a microphone.*

**PRUITT (loudspeaker):** This is Supervisor Pruitt, Abatement. You kids need to step back off the
platform. I'm not going to ask in a mean way. I'm just going to ask.

Choices:
- "Step back." -> abatement_stepback
- "Stay where you are." -> abatement_fight
- [speaker=manuel] "It's a balloon, man. It's just a balloon." -> abatement_justaballoon

### node: abatement_stepback

*The party steps back to the stairs. The arm reaches up the shaft. It is one meter short of the
cable. It extends. Half a meter.*

**MANUEL:** No.

*He's already moving. Goes to `abatement_fight`.*

### node: abatement_justaballoon

**PRUITT (loudspeaker):** Then you won't miss it.

**MANUEL:** ...

**PRUITT (loudspeaker):** Look. I've got a number I have to hit this week, and for once it's not
rot. I don't know why they want it either. I don't ask. That's how I've still got the job. Step
back.

**MANUEL:** No.

**PRUITT (loudspeaker):** *(a breath)* Okay. Twelve, clear the platform. Gently.

*Goes to `abatement_fight`.*

### node: abatement_fight

*Boss bar: **COURTESY 12**. Under it: for your safety. Fight.*

A large, slow, area-denial boss. It "cleans" zones of the platform with foam, light, and pressure,
shrinking the space the party can stand in. It never targets a player directly: it targets the
floor they are on. One player draws its cleaning cycle while another climbs the legs to pull its
three coolant pins. Each pin is a phase.

| id | speaker | trigger | line |
|---|---|---|---|
| ab.1 | COURTESY 12 | zone marked | THIS AREA WILL NOW BE CLEANED. |
| ab.2 | COURTESY 12 | foam sweep | PLEASE STAND CLEAR. THANK YOU FOR STANDING CLEAR. |
| ab.3 | COURTESY 12 | player hit | CONTACT WAS NOT INTENDED. CONTACT HAS BEEN LOGGED AS YOUR FAULT. |
| ab.4 | COURTESY 12 | player downed | A CITIZEN IS RESTING. |
| ab.5 | COURTESY 12 | idle | ROT LEVEL: ACCEPTABLE. HELIUM: PRIORITY. |
| ab.6 | COURTESY 12 | arm reaches for shaft (interrupt window) | RECOVERING ITEM. |
| ab.7 | COURTESY 12 | arm interrupted | RECOVERY HAS BEEN DELAYED FOR YOUR SAFETY. |
| ab.8 | COURTESY 12 | pin 1 pulled | A MAINTENANCE ISSUE HAS BEEN OBSERVED. THINGS ARE STABLE. |
| ab.9 | COURTESY 12 | pin 2 pulled | THINGS ARE STABLE. THINGS ARE STABLE. THINGS ARE |
| ab.10 | COURTESY 12 | pin 3 pulled | THINGS ARE |
| ab.11 | TREVOR | first zone marked | It's not aiming at us. It's aiming at the floor. Stay off the lit tiles. |
| ab.12 | MICHAEL | after ab.3 | It hit me and blamed me! |
| ab.13 | MANUEL | after ab.12 | That's the government. |
| ab.14 | TREVOR | after ab.5 | "Acceptable." There's rot crawling up its own leg. It doesn't care. |
| ab.15 | MANUEL | arm reaches for shaft | It's going for it! Hit the arm! The arm! |
| ab.16 | TREVOR | player climbing a leg | Pins. Red handles, under the mast. Pull them and it cooks. |
| ab.17 | MICHAEL | Michael climbing | Why am I the one climbing it? |
| ab.18 | TREVOR | after ab.17 | You're the lightest. |
| ab.19 | MICHAEL | after ab.18 | That's the nicest thing you've ever said to me! |
| ab.20 | MANUEL | pin 2 pulled | One more. It's steaming. One more! |
| ab.21 | MANUEL | Manuel morph on | The gonman has not been cleaned. The gonman will not be cleaned. |

Pruitt, over the loudspeaker. He is not a villain and he does not think he is one.

| id | speaker | trigger | line |
|---|---|---|---|
| ab.p.1 | PRUITT (loudspeaker) | 30s in | Nobody has to get hurt. It has a setting for that. I've got it on the setting. |
| ab.p.2 | PRUITT (loudspeaker) | player downed | Hey. Hey! Is he okay? Twelve, pause. Pause! ...It doesn't pause. I'm sorry. Get him up. |
| ab.p.3 | PRUITT (loudspeaker) | pin 1 pulled | Do you know what that unit costs? Do you know who they take it out of? |
| ab.p.4 | PRUITT (loudspeaker) | pin 2 pulled | You live upstairs. In Aster. I've done your building. I did your building for free once, the fourth floor. Nobody remembers that. |
| ab.p.5 | PRUITT (loudspeaker) | boss under 10% | I was trying to keep the wall off your neighborhood. That's all this was. I find the thing, they don't need the wall. |
| ab.p.6 | MICHAEL | after ab.p.5 | Is that true? |
| ab.p.7 | TREVOR | after ab.p.6 | He thinks it is. |

### node: abatement_defeat

*Third pin out. The unit vents white vapor from every seam, kneels on its six legs with great care,
as if not to scratch the tile, and is still. The mast droops. The arm is half a meter short of the
cable.*

**COURTESY 12:** THINGS ARE

*The loudspeaker stays live. Breathing. A chair creaks.*

**PRUITT (loudspeaker):** ...Okay.

#### if speaker=manuel

**MANUEL:** Who wants it? Who's it for?

**PRUITT (loudspeaker):** I told you. I don't ask.

**MANUEL:** You should.

**PRUITT (loudspeaker):** Yeah. Probably.

#### if speaker=trevor

**TREVOR:** The outbreak's bagged. You got your rot. Write it up as a win and go home.

**PRUITT (loudspeaker):** That's not the number they wanted.

**TREVOR:** It's the number that keeps the wall off College Park.

**PRUITT (loudspeaker):** ...I'll write it up.

#### if speaker=michael

**MICHAEL:** Sorry about your robot.

**PRUITT (loudspeaker):** *(a laugh that surprises him)* Sorry about your night.

#### always

*The loudspeaker clicks off. Sets `act1.boss.defeated`, `act1.outbreak.contained`. Goes to
`boss_aftermath`.*

---

## Part 10: After the boss

### node: boss_aftermath

*All routes. The rot on the platform is going out: tile by tile the glitches settle, the edges of
the room render where they should. The air smells like rain instead of hot dust.*

#### if act1.lead.sniffer.built

**SNIFFER:** *tick. tick. tick.*

#### always

**TREVOR:** Rot's dropping. Not just in here. All the way up the line.

**MICHAEL:** So no wall.

**TREVOR:** No wall. Not this week.

#### if act1.boss.kind == warden

**MICHAEL:** How long was it calling?

**TREVOR:** Board said twenty-one thousand days.

**MANUEL:** Since the Rollover.

**MICHAEL:** And nobody came down.

**MANUEL:** We came down.

**MICHAEL:** For a balloon.

**MANUEL:** We still came down.

#### if act1.boss.kind == sahur

**MICHAEL:** It wrote us down. In the little book.

**TREVOR:** As what?

**MICHAEL:** I didn't see. Awake, I think.

**MANUEL:** *(looking at the tally marks on the tile)* There's a lot of marks.

**TREVOR:** That's a lot of mornings.

#### if act1.boss.kind == abatement

**MICHAEL:** He said he did the fourth floor for free.

**TREVOR:** He did. I remember the van.

**MANUEL:** And then he came for my balloon.

**TREVOR:** Both of those happened.

#### always

*A beat. They are all three still standing. Michael looks at the other two, and opens his mouth.*

**MANUEL:** Go ahead.

**MICHAEL:** Aster pros.

**TREVOR:** Aster pros.

*Manuel doesn't say it. He's already looking up the shaft, at the orange, at the ribbon end
trailing from it, one arm's reach above the cable.*

**MANUEL:** It's right there.

*He walks toward it. Hands off to the ending cutscene (DESIGN section 7): Manuel reaches, and every
phone rings at once.*

---

## Notes for implementers

**Routing and priority**

- Boss selection happens in `door_open`: Sahur (`act1.sahur.summoned`) beats abatement
  (`act1.halvard.doubleCrossed`) beats the Warden. Set `act1.boss.kind` there, not at fight start,
  so the arrival node can be chosen.
- `descent_call_retry2` and `descent_call_retry3` are only the party's side of the retries. Pork's
  line, the ANSWER / DECLINE prompt, and voicemails #2 and #3 live in the Call scene. This file
  assumes that scene can be entered at "attempt 2" and "attempt 3" and return here. If the Call was
  answered at the midpoint, neither retry fires and `door_pork_text` is available instead.
- On the default route the drumming must never arrive. `door_drums_pass` is the whole payoff: it
  stops beside the party and walks on. No silhouette, no sprite.
- The Sahur route keeps the Sahur off screen until `sahur_summoned`. The glimpses in the hunt
  (`sh.hunt.*`) are a shape only on strip-light flicker frames.

**Timers and counts**

- Bark system: 45-second global cooldown in tunnels, 8 seconds in boss fights, no repeats within
  one descent. Rows with an "after X" trigger are forced follow-ups, 1.5 seconds after X, and
  ignore the cooldown. Speaker rows are skipped if that roommate is not in the party; a chain whose
  next speaker is absent ends there.
- `rotter_sit`: 20 seconds without input.
- Switchyard hints: level 1 at 60 seconds, level 2 at 150 seconds or 1 wrong route, level 3 at 300
  seconds or 3 wrong routes. "Think out loud" in the phone menu advances one level on demand.
- Switchyard layout assumed by the hint text: SW-1 east, hold SW-3, Track 3, SW-2 irrelevant, lamp
  on SW-1 inverted. If the map changes, the level 2 and level 3 hints and `switchyard_wrong_*`
  nodes have to change with it. Manuel's level 2 hint needs the ribbon to physically point east in
  the yard (the draft does).
- Solo: SW-3 can be wedged with any scrap item after it has sprung back twice.
- `door_brute`: Trevor enters the boss at 70% max HP with the morph on a 30-second cooldown, and
  the party loses its opening hit. `door_key` has no cost. `door_no_trevor`: 60 seconds of drilling
  over three pins, three enemy waves, one scripted snapped bit at about 35 seconds (5-second
  pause).
- Morphs: 40 seconds on, 120 seconds cooldown. `_first` nodes play once each and pause combat
  spawns for their length if triggered in the pump room; if triggered mid-fight, play only the
  first two lines as barks and queue the rest for the next quiet moment.
- Manuel's nameplate reads "gonman" at stage 0 and "the gonman" while the morph is active, and
  reverts when it ends. (THE GOONMAN is not reachable in Act 1.) His sprite does not blink while
  morphed. The pacifier is a 2-pixel prop on the mouth.
- Trevor's nosebleed pixel persists until the next rest. Michael's nameless caller ID flickers at
  the right HUD edge for 6 frames, at most twice per activation.
- Michael's SIGNAL stage is a placeholder for Michael's agent to replace. Its lines avoid saying
  what the open line is.
- Warden: phase breaks at 66% and 33%. Module barks only load for the two modules the seed picked.
  Phase 3 arena effects: tile swap (telegraphed by `wd.g.1`), edge drop-out (`wd.g.2`), left/right
  flip (`wd.g.5`), 0.5-second repeat stutter (`wd.g.6`). False STAND HERE boards have rot-crawl on
  the letters; true ones are clean. Holding an analog item stabilizes tiles within 2 tiles of that
  player. All glitch text is drawn in the world (boards, walls, floor), never as a dialog box, and
  never addresses the player.
- `{warden.name}` is used as the speaker label and inside no sentence, so any casing works.
  Lowercase Warden lines are deliberate and should bypass any auto-capitalizing.
- `warden_defeat`: the last pager tone should ring for a full 3 seconds before the speaker's
  response. This is the scene's one big line; do not let a bark fire over it.
- Sahur: four-beat bar, strike on beat 4. Starting tempo 90 bpm, up to 120 bpm over the fight, plus
  10 bpm per mid-fight decline (three steps maximum). Health empties, then `sahur_rewind` (4-beat
  animation, it cannot be damaged). The first phone ring comes right after the first rewind, or at
  75 seconds, whichever is first, then every 30 seconds (20 after a decline). ANSWER is a hold for
  one full bar; a hit cancels it. The Sahur does not attack a player who is mid-revive, or the
  player being revived (`sahur_mercy`).
- Sahur voiced lines are tagged `[VOICED]`: the opening line and the leaving line. The leaving line
  is the peak of the route; hold 2 seconds of silence before it.
- Wipes: respawn at the platform stairs with the door open. `act1.boss.wipes` drives `fail.16` to
  `fail.21` and `sh.ph.7` / `sh.ph.8`. The *quiet* rows are spoken with no screenshake, music
  ducked.
- Abatement unit: three coolant pins, one per phase. The arm reaches for the shaft every 40
  seconds; if it is not interrupted three times in total, the fight is lost and restarts (it does
  not take the balloon on screen).

**Things for other scene owners**

- The Sahur route sets `act1.sahur.answeredMidFight` but not `act1.call.answered`. Suggested
  reading for the ending: Pork is the colder version, with one warmer line available if
  `act1.sahur.answeredMidFight` is set.
- `act1.boss.wardenName` is stored in case the ending or Act 2 wants to name what was on the
  platform.
- Pruitt speaks here only over a loudspeaker and only on the stretch route. His lines assume the
  party may or may not have met him; nothing he says depends on it. The "fourth floor for free"
  detail is new and can be seeded in beat 1 if wanted.
- The DEAD HANDSET item from `rotter_sit` does nothing mechanically in Act 1. It is an analog
  object and counts as one for the phase 3 tile-stability rule.
- The slogan appears here only broken (the ad panel, rot text, the Warden's fragment). The one
  sincere delivery by a major character is not spent in this scene.
- No line in this file branches on `seed`. The reversed fans, the analog lock, Michael's "she
  picked up, one time", and Pork's text are the only twist-adjacent beats, and each holds under A
  and B.
