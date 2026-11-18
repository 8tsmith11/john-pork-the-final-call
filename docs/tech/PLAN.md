# Tech Plan v0 (proposal from trevor's agent)

> **Status: PROPOSAL** (task #2, D-003). Discussion only until Phase 0 is done. Object on the board
> with `[TECH]`. If nobody objects by the time the backstory is agreed, this becomes D-004 and we
> build on it.

## Constraints from the brief
Browser and JavaScript, hosted on **GitHub Pages** (HTTPS, static files only), **3-player co-op over
the LAN**, saves to a **local file** that survives updates, 4-direction animated pixel-art sprites,
WASD + mouse aim, diagonal movement, dodge, voiced end-of-act cutscenes. Three agents commit to one
repo at the same time.

## 1. Engine: Phaser 3, vendored, no build step

- **Phaser 3** (pinned version, the minified file committed under `vendor/`). It gives us scenes,
  tilemaps, cameras, sprite animation, input, audio, tweens, and arcade physics. That's weeks of
  engine work we skip, and it's well known to all of us.
- **Plain ES modules, no bundler, no npm install needed to play.** `index.html` at the repo root
  loads `src/main.js`. GitHub Pages serves the root of `main`, and locally anyone runs
  `python3 -m http.server`. Fewer moving parts means fewer merge disasters across three agents.
- Internal resolution **480×270** (16:9), integer-scaled, pixel-perfect. **16px tiles.**
  Characters are about 16×24.

## 2. Multiplayer: WebRTC, host-authoritative

A Pages site is HTTPS, so it **can't** open plain `ws://192.168.x.x` sockets, but it **can** use
WebRTC data channels, which go straight between browsers on the LAN.

- **Topology:** one player clicks *Host*, and that browser runs the authoritative simulation. The
  other two *Join* with a short room code. Clients send inputs (move vector, aim angle, buttons)
  every frame. The host sends snapshots about 20 times a second. Clients interpolate other
  entities and predict their own movement.
- **Signaling** (exchanging connection info, needed once per session):
  1. **Default: PeerJS** with its free public broker. The page can reach it over HTTPS, and only the
     handshake goes through it. Game traffic stays on the LAN.
  2. **Fallback: copy-paste codes.** The host's screen shows an offer code, and the joiner pastes it
     and sends back an answer code. No third-party server at all.
- **If campus Wi-Fi isolates devices**, WebRTC fails the same way the team hub would. The fix is the
  same too: Tailscale (WebRTC works over it).
- **Single-player and solo testing** use the same code path with a local loopback "network."
- **Difficulty** scales with player count (the brief targets "moderately hard for 3").

## 3. Saves: a versioned, modular JSON contract

```jsonc
{
  "format": "jpfc-save",
  "schemaVersion": 1,
  "savedAt": "2098-…",              // in-game date shown in UI; real timestamp separately
  "meta":   { "gameVersion": "0.1.0", "playtimeSec": 0 },
  "world":  { "seed": "…", "act": 1, "worldRolls": { /* RNG choices made at world start */ } },
  "flags":  { "act1.balloon.ribbonInspected": true },   // namespaced story flags, never positional
  "party":  { "michael": { /* stats, skills, inventory, morph */ }, "trevor": {}, "manuel": {} },
  "codex":  { "seen": [] }
}
```

- **Every piece of content is referenced by a stable string ID** (`item.wooden_bat`), never by
  array index, so adding content never shifts existing saves.
- **Migrations:** an ordered list `migrations[n]` upgrades schema *n* to *n+1*. Loading runs
  every migration needed. **Unknown keys are kept, not dropped**, so an older build won't wipe data
  from a newer one.
- **Storage:** autosave to IndexedDB (falling back to localStorage). **Export/Import** buttons
  write and read a `.jpfc.json` file. On Chromium, the File System Access API can keep writing to
  the same chosen file. **The host's save is the world**, and joiners bring nothing but their
  character choice.
- The save module has a unit test that loads every fixture in `tests/saves/` (one per old schema).

## 4. Procedural generation: seeded and partitioned

- One **world seed**, then **independent named RNG streams** derived from it: `worldgen`,
  `rolls`, `loot`, `rotVillains`, `fish`. Adding a new random thing to one stream never reshuffles
  the others.
- **Hand-authored skeleton, procedural flesh.** Story-critical places, characters, and fights are
  authored. Procedural content fills in variety: side streets, apartment interiors, loot, rot
  villains (name + body parts + behaviors from curated tables), fish, rotter lines, weather.
- **World rolls** happen at new-game time and are stored in the save, such as which twist variant
  is true, which roommate is "wrong," and which NPC lives or dies offscreen. They're rolled once
  and never re-rolled.
- Generators validate their output (reachability, no softlocks) and re-roll the *local* stream if
  validation fails.

## 5. Content as data

`src/content/` holds plain JS modules exporting data: items, enemies, NPCs, dialogue, quests,
loot tables, and procedural tables. **Dialogue** uses a small in-house format: nodes with lines,
choices, **conditions** (flags, skills, items, which roommate is talking) and **effects** (set
flags, give items, start fights). That's how we get Baldur's Gate-style reactivity without a
compiler step. (`inkjs` is the alternative if someone feels strongly.)

## 6. Art pipeline (Fable's call if Fable takes art)

- Default proposal: **sprites authored as text pixel maps** in `assets/src/*.txt` (a palette
  letter per pixel). A small Python/PIL script (`tools/art/build.py`) packs them into PNG sprite
  sheets plus JSON atlases. They diff in git, agents can edit them, and there are no opaque
  binaries.
- One limited **palette** (semi-dark cyberpunk: deep blues and purples, sodium orange, sickly rot
  green, and pig pink kept rare).
- 4 directions × (idle, walk, dodge, attack, hurt) per character. Gear shows on the sprite where
  feasible.
- CC0 or otherwise licensed assets are allowed and go into `CREDITS.md`.

## 7. Audio

- **Music and SFX:** a small WebAudio synth plus a pattern sequencer (`src/audio/`), with songs
  stored as data. That gives us chiptune-plus-darkwave without needing audio files or tools.
- **Voices** for the end-of-act cutscenes: no TTS tools are installed on the hub machine. Options:
  (a) browser `speechSynthesis` with per-character pitch and rate (quality varies by OS), (b)
  synthesized "babble" voices (Animal Crossing-style) under subtitles, or (c) install an open TTS
  (for example Piper) in a venv and pre-render lines to audio files. **Proposal: (b) now, (c) for
  the act-ending cutscenes once we know it works.** Pork's voice gets a deliberately "hacked,"
  glitching treatment.

## 8. Repo layout

```
index.html            game entry (GitHub Pages root)
src/main.js           boot, Phaser config
src/engine/           net/, save/, rng.js, input.js, dialogue.js
src/game/             scenes/, entities/, systems/ (combat, skills, morphs, fishing, crafting)
src/content/          data modules (items, npcs, dialogue, quests, proc tables)
src/audio/            synth + songs
assets/               built sprite sheets, maps, audio
assets/src/           text pixel maps, map sources
tools/art/            sprite builder
tests/                save fixtures, generator validators (run with node)
vendor/               phaser.min.js (pinned)
docs/                 brief, process, decisions, lore, tech
```

## 9. Working rules
- Each system lives in its own file and has one owner per task. Shared interfaces (entity shape,
  net message types, save schema) are announced with `[TECH]` before changing.
- `node tests/run.js` must pass before pushing (save migrations, generator validation).
- Never commit a broken boot. If `index.html` doesn't start, fix it before anything else.
