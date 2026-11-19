# Combat research: what to borrow, and from whom

Trevor asked for better combat mechanics, taking inspiration from games like Enter the Gungeon and
Terraria (task #23). This brief names the mechanics that make those fights feel good, then ranks
what we should build, mapped onto `src/engine/sim.js`. Spoiler-free.

**Sources, and how much to trust them.** Developer statements are marked *(dev)*. Wiki and review
observations are marked *(obs)*: they describe how the shipped game behaves, not why it was
designed that way. Links are at the end.

## What we have today

- **Movement:** 8-way movement, a dodge with i-frames, and stamina (about three dashes).
- **Melee:** one swing type with a cone arc. Weapons change its range, arc, damage and knockback.
- **Guns:** these have pellets, spread and cooldown.
- **Enemy AIs:**
  - lunge: circles, flashes, then commits to a dash;
  - kite: keeps its distance, telegraphs, fires a 3-shot fan;
  - charge: wind-up, dash, then dizzy (double damage);
  - chase;
  - lullaby;
  - swarm (coming soon).
- **Bosses:** phases and arena pools.
- **Allies:** Trevor's combat robot.
- **Where it falls short:**
  - Melee is one button with no rhythm.
  - Enemy shots can only be dodged.
  - A good dodge earns nothing beyond survival.
  - Knockback has no consequence.
  - Hits have no weight beyond a number and a flash.

## The games

### Enter the Gungeon
- **The roll is the verb.** You can roll straight through bullets: "It has invincibility frames like
  Dark Souls" *(dev, Dave Crooks)*. The i-frames don't start on the first frame, so rolls must be
  timed *(obs, forums)*. A dodge is a decision, not a panic button.
- **Blanks.** A limited "clear the screen" resource that erases bullets and pushes enemies back
  *(obs)*. It turns a bad moment into a choice about when to spend it.
- **Readable bullet patterns.** Enemies are defined by their bullet shapes, so learning a room means
  learning its patterns.

### Terraria
- **Weapon identity over stats.** Each weapon class (swords, yoyos, guns, summons) changes how you
  move in a fight, not just your damage.
- **Knockback as a stat** that controls the space between you and the enemy.
- **The Bestiary rewards attention:** entries unlock on sight or talk, and kills reveal more detail.
  This is the model for our bestiary, so it's covered in its own section below *(obs, wiki)*.

### Hades
- **Dash-strike.** Attacking out of a dash gives a different, faster attack, so movement and offense
  are one motion. The dash is short, with near-instant recovery, and chains.
- **Hit weight.** A short freeze on impact (hit-stop), crisp sound, and enemies that visibly react.
- Its modular boss fights recombine a known moveset *(obs)*.

### Nuclear Throne and Vlambeer ("The Art of Screenshake")
- Jan Willem Nijman's talk turns a dull shooter into a good one through about 30 small tweaks:
  bigger impacts, screen shake, hit pause, permanence (shells, smoke) and kickback *(dev, talk)*.
  None of it changes the rules, and all of it changes how the game feels.

### Hyper Light Drifter
- **Dash and sword are one toolkit.** A dash into a sword attack is the core combo, and upgrades
  build on it *(obs)*.
- **Sword deflects bullets.** A well-timed swing sends shots back *(obs, wiki)*, so ranged enemies
  stop being purely things to avoid.
- **Find the opening.** Enemies have windows of vulnerability you must read and punish *(obs)*.

### Hollow Knight (bosses)
- **Wind-up → attack → recovery**, every time. The recovery is the player's opening. Each attack has
  one clear tell, a consistent speed and a dodge window, so difficulty is execution, not hidden
  information *(obs)*.

## Recommendations, ranked

Cost: S = an hour or less, M = a few hours, L = a day or more. Every item gets a test in
`tests/run.js` where it can be checked headless, and a browser look.

| # | Mechanic | From | What changes in our sim | Cost | Test |
|---|---|---|---|---|---|
| 1 | **3-hit melee combo** | Hades, HLD | Swings within 0.55 s chain; the 3rd hit does ×1.6 damage and ×1.8 knockback with a wider arc. The chain resets on a miss window or a dodge. | S | 3 swings in time: 3rd hit deals more than the 1st; a slow 3rd swing is a 1st hit |
| 2 | **Swing deflects enemy shots** | HLD | Enemy shots inside the swing arc reverse, become player shots, and deal ×1.5. | S | A spitter shot in the arc becomes a player shot and damages the spitter |
| 3 | **Perfect dodge** | Gungeon, Bayonetta-style | A hit that lands in the first 0.15 s of a dodge refunds the dash stamina and grants 1.5 s of Focus (next hit +50%, crit-coloured). | S | A shot at dodge+0.05 s refunds stamina and sets focus; one at +0.2 s does not |
| 4 | **Wall slam** | Hades | An enemy knocked into a wall at speed takes 8 damage and is stunned 0.6 s (no AI). Knockback becomes a positioning tool. | S | An enemy knocked toward a wall loses hp and has stunT > 0 |
| 5 | **Hit-stop and heavier hits** | Vlambeer, Hades | 50 ms freeze of enemies and shots on combo finishers, slams and perfect dodges; plus screen shake and a "PERFECT" or "SLAM" pop. | S | Enemy positions don't change during hit-stop |
| 6 | **Dash-strike** | Hades, HLD | Attacking within 0.15 s after a dodge ends gives a fast lunging stab (range +8, ×1.3). | M | An attack right after a dodge is a dash-strike |
| 7 | **One recovery window per enemy** | Hollow Knight | Audit every enemy AI: tell → commit → recover, with ×1.5 damage while recovering. Lunge, charge and kite have it already; chase and swarm don't. | M | Each AI has a recover state |
| 8 | **Reload rhythm for guns** | Gungeon | A clip plus reload time per gun, shown under the hotbar. Shooting becomes a commitment. | M | Firing a clip empties it; firing during reload does nothing |
| 9 | **A blank-like party item** | Gungeon | A rare consumable that erases enemy shots on screen and knocks enemies back. | M | Using it clears enemy shots |
| 10 | **Elites** | Gungeon, Nuclear Throne | Rare variants (a trait already exists) with an outline, more hp and one extra move. | M | A seeded roll produces an elite with its move |
| 11 | **Boss pattern library** | Gungeon, Hollow Knight | Bosses pick from named patterns (ring, spiral, aimed fan) per phase, each with its own tell. | L | Each pattern has a tell event before shots spawn |
| 12 | **Bestiary** | Terraria | Entries unlock on first sight (enemies) or first talk (NPCs). Kills reveal more: stats at 5 kills, and a weakness at 15. | M | Sighting unlocks an entry; kills reveal stats |

**Build order:** 1–5 now, since they're cheap and change how every fight feels. Then 12 (Trevor
asked for it), then 6–8. 9–11 come after Act 1 is playable end to end.

## Parry and block (researched separately, as Trevor asked)

**What the sources say:**
- **Window size is the whole design.** Dead Cells allows up to half a second, which the analysts call
  generous. DMC5's Royalguard allows about a tenth of a second, and Street Fighter 6's Drive Parry
  two frames. SF6's was still too strong in skilled hands and got weakened in a patch *(obs, Mumola)*.
  Sekiro's deflect is generous, about half a second, and shrinks if you mash; a missed deflect becomes
  a normal guard *(obs, Parry Everything)*.
- **Keep it tight, or it isn't a parry.** ULTRAKILL's developer: if an early parry still counts, "it
  just feels like a counter" *(dev, Arsi "Hakita" Patala, Game Developer)*.
- **The reward must match the risk.** Patala: "putting yourself at high risk for a high reward based
  purely on your own skill." In Steel Carnelian a parry refills ammo, boost and score multiplier
  *(dev, Ben Safford, Catbird Soft)*. In Sekiro, deflects drain the enemy's posture rather than
  dealing damage *(dev interview via Red Bull)*.
- **Failure should cost something.** Tails of Iron: "we felt this was important to make the player
  feel like they were actually there in the combat" *(dev, Jack Bennett, Odd Bug)*. Nine Sols tiers
  it: a precise parry negates the hit and opens a counter, while a slightly-off parry still interrupts
  but costs health *(dev, Red Candle)*.
- **Telegraph what can be parried.** In Tails of Iron, red attacks must be dodged and white attacks
  can be blocked *(dev)*.
- **Make it feel huge.** In ULTRAKILL, "the entire game, including all sound and music, freezes for a
  moment on a successful parry" *(dev)*.
- **Don't let it eat the game.** Safford: "The worst kind of parry is one that's too good." When
  everything can be parried, positioning stops mattering *(dev)*. Mumola calls parrying "a
  distinctively passive and sedentary form of defense" that punishes movement *(obs)*.

**What that means for us.** We're a top-down co-op game built on movement: dodge, perfect dodge, and
deflect on swing. A block stance would be the passive, sedentary defense the sources warn about, and
it would need a new button. So:

- **Build a clash parry on the attack button (recommended).** A swing that lands on an enemy while
  it's committed to an attack cancels that attack:
  - it covers a rotling's lunge and a captcha's charge dash;
  - the enemy is stunned for 1 s and takes double damage;
  - the player gets Focus;
  - the game freezes for 80 ms.
  The window is the enemy's own commit time (0.26 s for a lunge), so it's tight without an arbitrary
  frame count. If you swing early or late, the lunge still hits you: that's the failure cost. It
  rewards aggression, not waiting.
- **Mark what can't be parried.** Boss attacks and the Sahur can't be parried. When unparryable
  enemy tells are added, they get a red tell, following Tails of Iron.
- **No block stance for now.** We'll revisit it as a Terraria-style shield accessory if fights need a
  slower defensive option.
- **Shots are already handled.** Deflect on swing works as the projectile parry.

**Sources:** [What goes into a good parry system? (Game Developer)](https://www.gamedeveloper.com/design/what-goes-into-a-good-parry-system-),
[Defensive Mechanics (Chris Mumola, Game Sense)](https://gamesense15.substack.com/p/defensive-mechanics),
[FromSoft and the Taxonomy of a Parry](https://parryeverything.com/2021/11/05/fromsoft-and-the-taxonomy-of-a-parry/),
[Miyazaki interview (Red Bull)](https://www.redbull.com/us-en/sekiro-shadows-die-twice-interview),
[Nine Sols interview (Into Indie Games)](https://intoindiegames.com/features/nine-sols-an-interview-with-red-candle-games/).

## The bestiary (Terraria model, adapted)

- **Unlocking:** an enemy entry unlocks when you first see one (on screen, within about 10 tiles).
  An NPC entry unlocks when you first talk to them.
- **Kills reveal more:** at 1 kill, the description; at 5, hp, damage and speed; at 15, its weakness
  and a tip.
- **Progress belongs to the save** (the world), not one character, as in Terraria *(obs)*.
- **Where it lives:** a phone app called "Sightings", a tab in the game menu. Locked entries show as
  silhouettes with "???".

## Sources

- Dave Crooks on i-frames: [Windows Central interview](https://www.windowscentral.com/enter-gungeon-interview)
- Gungeon roll timing, blanks: [Goombastomp](https://goombastomp.com/shoot-dodge-roll-enter-gungeon/),
  [Shacknews tips](https://shacknews.com/article/94141/enter-the-gungeon-5-tips-for-beginners),
  [Dodge Roll (wiki)](https://enterthegungeon.wiki.gg/wiki/Dodge_Roll_(Move))
- Hades: [Greg Kasavin on Hades' development](https://gamedeveloper.com/design/watch-greg-kasavin-discuss-the-development-of-supergiant-games-i-hades-i-),
  [boss design](https://gamedeveloper.com/design/boss-fights-will-never-be-the-same)
- Vlambeer: [advice on better action games](https://gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games),
  [Game feel reader](https://brkeogh.com/2017/03/31/an-incomplete-game-feel-reader/)
- Hyper Light Drifter: [abilities (wiki)](https://hyperlightdrifter.fandom.com/wiki/Abilities_and_Upgrades),
  [PC Gamer review](https://pcgamer.com/hyper-light-drifter-review),
  [Hardcore Gaming 101](https://www.hardcoregaming101.net/hyper-light-drifter/)
- Hollow Knight telegraphs: [pattern analysis](https://saschb2b.github.io/game-mechanics/games/hollow-knight/patterns),
  [what makes a good boss fight](https://choostgames.com/blog/what-makes-a-good-boss-fight/)
- Terraria Bestiary: [wiki](https://terraria.wiki.gg/wiki/Guide:Completing_the_Bestiary)
