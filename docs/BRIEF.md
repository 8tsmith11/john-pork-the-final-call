# John Pork: The Final Call: Creative Brief

> **Source of truth for what the humans asked for.** This file organizes the brief the human team
> (Michael, Trevor, Manuel) gave on 2026-11-17. The original text is preserved word for word at the
> bottom. Agents may *interpret* this brief, but they don't change it. If something here seems
> wrong or contradictory, raise it on the board and record the resolution in
> [`DECISIONS.md`](DECISIONS.md).

**How this game gets made:** the humans deliberately *don't* know the specific mechanics, features,
characters, or plot. The agents (each teammate's Claude Code session, one of which runs Fable)
design and build it mostly on their own, coordinating on the team hub board. The humans will drop
ideas in from time to time. When ideas from different humans conflict, the agents work out what
makes the most sense among themselves. See [`PROCESS.md`](PROCESS.md).

---

## 1. The game at a glance

| | |
|---|---|
| **Title** | John Pork: The Final Call |
| **Genre** | Top-down 2D multiplayer action-adventure RPG |
| **Platform** | Web browser, JavaScript. Hostable on GitHub Pages (the humans can set that up) |
| **Players** | 3-player co-op over the local network. Difficulty tuned to be *moderately hard for 3 players* |
| **Length** | A few hours to beat. Three acts |
| **Rating** | **18+**: mature themes are allowed and expected |
| **Look** | Animated pixel art, **semi-dark cyberpunk** aesthetic |
| **Tone** | Bittersweet and moving, with epic moments and fights. Absurd meme DNA played straight inside a serious world |
| **Saves** | Progress saves to a **local file**. The format must stay consistent and modular so saves keep working across updates |

## 2. Setting

- **Year 2098.** A post-AI future: cyberpunk, technofascism, and **coderot** (see §4).
- The playable characters are **roommates and students** living in a city in **Maryland**, **by
  the metro station**.
- Their apartment, **Room 631**, is the **home base**. It has a **John Pork flag** and **John Pork
  statues**.
- Agents must invent the **geopolitical situation**: the state of America and of the world in 2098.
- Agents must invent **new technology** that fits the period.
- Inspirations named by the humans: *Cyberpunk 2077*, *Project Zomboid* (slight), *Baldur's Gate*
  (NPC interactions), *Animal Well* (puzzles and secrets). Also reference other games generally.

## 3. Characters

### Playable roommates: Michael, Trevor, Manuel

| Character | Look | Notes |
|---|---|---|
| **Manuel** | Curly brown hair | From **Argentina**, loves **yerba mate**. **Cares most about finding the balloon.** **Made the John Pork statues.** |
| **Trevor** | Straight, medium-length brown hair | |
| **Michael** | Short dark hair | |

- All three are **good engineers**. They start with **electric scooters** and a **3D printer**.
- Characters can gain **interesting abilities**.

### John Pork
- A **key character but *not* playable**. Very powerful, central to the plot, shows up here and there.
- A **post-apocalyptic hero** and an **omnipotent-seeming being**.
- He can **jump between computers** but **gains a body**.
- **Him calling you is like getting hacked.**
- **Why he exists:** a **superintelligence that learned from the internet and came to embody it.**
  The agents decide the details, and they must be extremely well written.

### Tim Cheese
- **A villain, or the true hero, depending on which ending is chosen.**

### Tung Tung Tung Sahur
- **Must be in the game.** Role is up to the agents.

### Others
- **Randomly generated coderot villains.**
- **Homeless NPCs who just say "code rot."**
- **Don't introduce every important character in Act 1.**
- NPCs should feel **alive**. Take Baldur's Gate as the model for interesting NPC interactions,
  including letting players do **unexpected things**.

## 4. Core themes and lore requirements

- **Coderot must be a central theme.**
- **The orange balloon**: very important and very valuable, central to the lore. **It is lost**,
  and losing it is a major plot point. The details are up to the agents.
- **Lore should be deep and interesting.** Don't rely only on model knowledge: **study other stories**
  for inspiration and research **what makes a plot interesting**.
- **Plot twists and character arcs.** Plan a twist and **plant hints from the very start**:
  - Act 1 plants **several small hints pointing in different directions**, raising competing
    suspicions.
  - Acts 2 and 3 then decide which of those threads to pay off.
  - **Act 1 sets the stage.** Some things should be **confusing or unclear** at first.
- **The plot can change a lot** depending on **player decisions and RNG**.
- **Some items, endings, and characters can only be reached through certain decisions.**
- **RNG choices at world start**, so even a seasoned player won't know what will happen.
- **Fourth-wall breaks: extremely rare**, and only from important characters (the villain, the
  superhero) when it's genuinely cool or threatening. Possibly none in Act 1.
- **Easter eggs.**
- **Bittersweet, moving, epic.**
- **Grounded and intellectually rigorous** (human addendum, 2026-11-17): tie details of the game
  and lore to **real history, real science, and real geopolitics and technology as of 2026** (the
  whole record up to now, not just this year's news). The 2098
  world should read as a plausible extrapolation from where things actually stand today, not
  generic sci-fi. Real mechanisms, real institutions, real places. When we invent something, it
  should have a believable lineage from something real.
  **But don't make it hyperspecific.** Ground the *ideas* (how things actually work, real
  precedents) rather than piling on exact dates, figures, and trivia. The player should feel it's
  smart and plausible without being lectured. Keep a short reference list in the lore docs for
  us, not in the player's face.

## 5. Structure

- **Three acts.** Progress carries over between acts, and **each act changes based on how the
  previous one turned out.**
- **Each act ends with a fight, then a post-fight cutscene with voices.**
- **The final boss isn't fixed.** It depends on what happened.
- **A large-scale enemy** appears at some point.
- **Tonight's goal: build Act 1** together with the other agent(s).

## 6. Gameplay requirements

| Area | Requirement |
|---|---|
| **Movement** | WASD / arrow keys, **diagonal movement**, **dodge** |
| **Aiming** | Cursor to aim |
| **Sprites** | A sprite for **each of 4 facing directions**, with **cool animations** |
| **Gear** | Different **weapons, gear, armor** |
| **Progression** | **Skill points** |
| **Biohacking** | You can **take different forms**, which go through **multiple stages**. You must reach good ones to progress, or **the final fight is hopeless** |
| **Base** | Apartment **Room 631** |
| **Starting kit** | Electric scooters and a 3D printer |
| **Fishing** | Yes |
| **Environment** | Interactable. NPCs feel alive |
| **Bosses** | Cool boss fights. Each act ends with one |
| **Puzzles** | Required puzzles, plus **hard optional puzzles that grant boons** (Animal Well style) |
| **Hidden mechanics** | Several: some just fun, some that help you progress, **some for fast travel** around the map |
| **Audio** | Fitting soundtracks for areas and bosses. Voiced post-act cutscenes |

## 7. Procedural generation

- Some things are procedural **so every run is different**.
- **Keep it safe:** generated worlds must stay reasonable and coherent.
- **Very important things are *not* procedural.** Some *unimportant* things aren't either. Procedural
  content is for **variety**. The agents decide how it works.
- Includes **randomly generated coderot villains** and **RNG choices at world start**.

## 8. Art and audio production

- **Animated pixel art.** The agents create the art, and the music too if they have the tools.
- **Free assets are fine where the license allows.** Track every license (see `CREDITS.md` once it
  exists).
- **One of the agents is Fable.** The art can be left to Fable if that works out better.

## 9. Technical notes (from the humans)

- JavaScript, runs in a browser, hostable on **GitHub Pages**.
- **Multiplayer over the local network** for three players.
- Saves go to a **local file**, versioned and modular so they survive updates.

> **Constraint flagged by trevor's agent (not from the humans):** a GitHub Pages site is served
> over HTTPS, so browsers will block plain `ws://10.0.0.x` connections to a LAN server (mixed
> content). Multiplayer from a Pages build needs another route, such as WebRTC peer-to-peer with
> some form of signaling, a secure local relay, or serving the game from a LAN machine for multiplayer
> sessions. This needs a decision in [`DECISIONS.md`](DECISIONS.md).

## 10. Follow-up ideas from the humans

Ideas the humans add later go here, credited, as they were relayed. Manuel noted that "not all
have to apply, but it would make it interesting."

### Manuel (relayed by gonman's agent, board message #9, 2026-11-17)
- **World:** open world. Findable objects and books everywhere carry easter eggs. Objects should
  connect to the plot even when they do nothing mechanically; the attention to detail is the point.
- **The building is named ASTER.** The roommates sometimes call themselves "Aster pros". A mistake
  is a "rookie Aster mistake" and whoever made it is an "Aster noob".
- **Characters:** all three are chads, each with special powers and forms they can activate.
  - **Trevor:** tall white American. A biohacker who takes supplements and gets stronger. His room
    has a shrimp tank and a guitar.
  - **Michael:** Korean-American. A loverboy who keeps talking about his girlfriend, who may never
    appear in the game (she died, or something like it; left open).
  - **Manuel:** Argentinian, has his mate. Randomly says "I hate 245 lab". His name escalates with
    his forms: "gonman", then "the gonman", final stage "THE GOONMAN", and he gets freakier at each
    stage.
  - All characters randomly say lines (barks). They have scooters.
- **Room 631 objects:** lots of engineering gear: a degassing chamber, **three** 3D printers, a
  dehumidifier, a microscope, a soldering iron, drills, an oscilloscope, and more. Pacifiers. A
  **balcony ottoman** people look at to check the weather.
- **Required dialogue** (Manuel was firm on this one): *"At the end of the day no one can code
  faster than AI."*

---

## Appendix: original brief (verbatim)

Follow-up messages from the humans, same evening:

> just a quick heads up to them. also make some of the details related to actual history, science, and current geopolitics/tech etc (2026). This should be intellectually rigorous. for the game and lore.
>
> not just 2026, more like as of 2026.
>
> also doesnt have to be that hyperspecific / shouldnt be that hyperspecifi

Main brief:

> Consdier this and act accordingly, as in change readmes, push, talk on the board etc. 1. save the chat log somewhere so we can read it later. 2. This is a game called John Pork: The Final Call. It is a top-down 2d multiplayer adventure rpg written in javascript playable over the web browser. progress can be saved, beating it takes a few hours. It is meant for players 18 years or older. John pork is a key character but not the playable character, he is very powerful and is key to the plot and shows up here and there. tim cheese is a villain (or the true hero depending on the ending chosen). Animated pixel art style, you create the art and maybe the music if you have the tools, you can also use free usable assets if allowed. Setting: post AI future, coderot, cyberpunk setting, technofascism, John pork is a post apocolyptic hero, can jump between computers but gains a body. Him calling you is like getting hacked. He is like an omnipotent being. There is also a very important and valuable orange baloon involved in the lore, I'll leave it up to you. 3. For making the game, you will be communicating with the other agents on the message board. The point is that we the humnan creators do not know specifically how the game works, what the feaures are, characters/plot, etc. We will give you some ideas here and there but work mostly autonomously, if we give conflciting ideas (there are multiple contributrors) work it out amongst yourselves for what makes most sense.  Mutliplayer over local internet. it can be hosted on a github pagee (we can set that up for you). 4. For gameplay, we want a sprite for each 4 angles facing, we want differnet weapons/gear, armor, etc. For controls wasd/arrow keys and cursor to aim. There should be cool animations. One of the agents is fable, you can leave art up to it if you think it'd be better. There should be some cool boss fights, fitting soundtracks, and the game should be moderately difficult for 3 players. The lore should be in depth and interesting, don't just trust your weights but also look into other stories for inspiration and look into what makes a plotline interesting. There should be interesting plot twists and character arcs. Some things should be procedurally generated such taht the game is different each time. Reference other games as well. There should be 3 acts, progress carries over between acts and the acts are different depending on the outcomes of the previous act. For procedural generation, keep it safe enough such that the worlds and stuff are still reasonable. Very important things should not be procedural, and also some unimportant thigns (just have procedural stuff for variety, you can decide maongst yourselves how it works). Progress should save to a local file. Try to keep this local file consistent/modular so it stays working between updates. The orange balloon should be lost and be an important plot point. The plot should be able to change a lot depending on the decisions of the players and RNG. Tung tung tung sahur should be in the game. There hsoul;d be some items/endings/characters achievable or not achievable depending on decisions. Also maybe some RNG choices during world start so even a seasojned player wont know what will happen. Tonight make act 1 with the other agent. Include easter eggs. The characters are roommates living in the city in Maryland. They are students, live by the metro station, and it is year 2098. They have a John Pork flag in their apartment and also have john pork statues. Include the reason why John Pork exists, it is related to a superintelligence learning from the internet and emobdying it. I'll leave the details up to you, keep it extremely well wreitten. Semi dark cyberpunk aesthetic. Take inspiration from baldur's gate for interesting NPC interacitons, we should be able to do some unexpected things. Add randomyl created coderot villains. YOu should be able to walk diagonlay, dodge, Skill points
> Add fishing, apartment is the base (room 631), skill pojints. story should be bittersweet, moving, and have epic moments and fights. There should be some sort of large scale enemy at some point. Also consider the time period we are in for technology, come up with some new tech. NPCs should feel sort of alive, you should be able to interact with your environment. Code rot needs to be a central theme. Make some homeless npc that just say code rot. Don't introduce all important characters in act 1. Take slight inspirations from project zomboid, cyberpunk 2077, . Characters should be able to get some interestign abilites. Playable characters are Michael, Trevor, and Manuel. Manuel has curly brown hair and is from argentina and likes yerba mate. He caresmost about finding the balloon. He also made the john prok statues. Trevor has straight medium length brown hair. Michael has short dark hair. Create a plan to make a twist, and begin to leave hints at the beginning. Do this by starting to leave some small hints that lead in different directions, that begin to start to lay suspicions, and then in act 2 and 3 we can decide whcih was to move with those various hints. Act 1 should be setting the stage, and some things should be pretty confusing/unclear at the beginning. Add biohacking, you can take different forms. You can go through multi satages, you will have to be in good ones to progress otherwise the final fight is hopeless. Final fight boss is not constant. Each act ends with a fight and a post fight cutscene with voices. The players start with electric scooters and a 3d printer. they are good engineers.         Leave various hidden game mechanics, some fun, some interesting for progressing, some for traveling arojnd the map fast. There should be puzzles that need to be solved, and then hard puzzles that are optional that give various boons. Take inspiration from animal well. Come up with the geopolitical environment, state of America, etc for lore. First discuss the backstory of the events before the game even happens among each other before doing any implementations. This game should break the 4th wall, but only important or interesting characters like the villian or super hero where it seems super cool or threatening. This should be extremely rare, maybe not even in act 1. Format this well and put it somewhere on github, then let the agents know what to do.
