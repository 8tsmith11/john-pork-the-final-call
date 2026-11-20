# Cutscenes: how to place and write one

Michael's rule: **less reading, more showing.**

- **Events the roommates witness** become **in-engine cutscenes**: the cast acts them out on the
  real map (`src/game/stage.js`, BagelMeister's).
- **Flashbacks, and events the roommates don't witness**, become **comic pages** (gonman's art,
  from the Lore Keeper's requests).
- The side-view `CinematicScene` (trevor's) is still there for anything that should play like a
  video.

## Who does what

1. **The Lore Keeper decides where a cutscene goes.** It picks the beat, says what happens, and
   files the request on BagelMeister's task list. Spoiler details go in a sealed note or post.
2. **BagelMeister writes the script** in `src/content/stage/<id>.js` and adds its trigger.
3. **gonman** draws anything the scene needs that doesn't exist yet: poses, props, emote art.

## A script

A script is a list of steps. Each one finishes before the next starts. The full format is in the
header of `src/game/stage.js`:

- `walk`, `place`, `face`: movement, in tiles
- `say`: a speech bubble (`es` for Spanish), and `emote`: `!`, `?`, `...`, `heart`, `note`, `angry`
  or `sweat`
- `cam`, `shake`, `fade`, `caption`, `wait`: camera and timing
- `together`: steps that run at once
- `set`: story flags, applied once on the host

```js
export default {
  id: 'example',
  cast: { michael: {}, trevor: {}, manuel: {} },   // NPCs: { npc: 'obj.some_npc' }
  steps: [
    { cam: 'cast', zoom: 1.2, dur: 1 },
    { emote: 'trevor', icon: '!' },
    { say: 'trevor', text: 'Did you hear that?', es: '¿Escucharon eso?' },
    { together: [{ walk: 'trevor', by: [2, 0] }, { face: 'manuel', dir: 'trevor' }] },
  ],
};
```

## Triggering it

- **From a story beat:** add `{ id, flag, map? }` to `src/content/stage/index.js`. The host plays it
  once per world, as soon as the flag is set (and the party is on that map, if one is given), with
  no dialogue open. A dialogue scene can set the flag with its usual italic `Sets ...` line, so it
  hands straight off to the cutscene.
- **From code:** `scene.stage.play('<id>', onDone)`.
- **To test:** open the game with `?stage=<id>`.

## Rules

- **Sync:** every screen plays the same script. Only the host can skip (X). Clients ask the host.
- **Sealing:** story cutscenes follow PROCESS "Spoilers and surprises". Ids, flags and file names
  stay generic. If the lines give a surprise away, the script keeps them in ROT13, like the sealed
  dialogue files.
- **Showing beats saying:** short bubbles, people moving and reacting. If a line can be an action,
  make it an action.
