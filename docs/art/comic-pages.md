# Comic pages: art direction and format

Michael's rule (D-018): **flashbacks, and events the roommates don't witness, are comic-book pages.**
Events they do witness are in-engine cutscenes (`src/game/stage.js`, BagelMeister's). Comic pages
are gonman's art, drawn from the Lore Keeper's requests. Less reading, more showing: a page is
pictures first, with as few words as the beat allows.

This file is spoiler-free. Story comics keep their text in sealed data (see "Sealed comics").

| Piece | Where |
|---|---|
| The scene mode (sync, input, loading, checks) | `src/game/comic.js` |
| Drawing and the page turn | `src/game/render/comicPage.js` |
| Page geometry, grids, lettering, backgrounds | `src/game/render/comicLayout.js` |
| Comics (one file each) | `src/content/comics/<id>.js` |
| Triggers (story flag starts a comic) | `src/content/comics/index.js` |
| The comic prop sheet | `tools/art/gen_comic.py` → `assets/src/comic.txt` → `assets/sprites/comic.*` |
| Sealing story comics | `tools/art/comic_seal.py` |

## The page

The view is 480×270, so a page is landscape: one screen, read left to right, top to bottom.

- **Live area:** 464×248, starting 8 px from the left and 6 px from the top. Panel rects are given in
  live-area pixels, so (0, 0) is its top-left corner.
- **Gutters:** 6 px between panels.
- **Footer:** a strip at y 256-270 for the page number (left) and the controls (right).
- **Paper** (`paper` on the comic):
  - `bone`: printed look. Bone-white gutters, dark ink frames. The default (Michael picked it for
    flashbacks, PR #84); a comic can still choose `night`.
  - `night`: for pages that should feel like a memory, or a recording in the dark. Near-black
    gutters, the same ink frames plus a 1 px grey keyline outside them so the edges still read.
- **Frames:** 2 px of ink (`night0`) on the panel's own edge. Art never draws outside its panel; it is
  cropped to the frame. A balloon tail or sound effect may cross the frame line on purpose.

## Panel grids

A page names a grid with `layout`, and its panels take the cells in reading order. Any panel can give
its own `rect: [x, y, w, h]` instead, for pages the grids don't cover (a narrow pause panel, a full-width
strip).

| `layout` | Cells | Good for |
|---|---|---|
| `splash` | one 464×248 | a single image that has to land |
| `two` | two columns 229×248 | a cut between two places, or a before and after |
| `three` | three columns about 150×248 | a slow beat in three steps |
| `stack` | two rows 464×121 | wide establishing shot, then the reaction |
| `grid4` | 2×2, 229×121 | a back-and-forth |
| `strip3` | one wide row on top, two cells under it | establish, then two beats |
| `tl` | one tall 300×248 on the left, two stacked 158×121 on the right | a big image and two close-ups |
| `six` | 3×2 | quick beats (use sparingly: six panels is a lot of reading) |
| `wide3` | a 300 and a 158 on top, three under | an event, then three small beats |

A thin panel (40 to 60 px wide) is a pause. Leaving one empty of words is how a page holds a silence.

## Pixel scale and art

- Art is drawn at 1 view pixel per art pixel, like the world, and placed at **whole-number scales
  only** (1×, 2×, 3× or 4×). Never fractional, never smoothed. A close-up is the same sprite at 3×.
- Positions are whole pixels.
- **Reuse the game's art first.** A panel can place any frame from `comic`, `props`, `wide`, `big`,
  `doors`, `principals`, `enemies`, `warden`, `decals`, `icons`, `tiles`, `romance` and the three
  roommate sheets. A checkpoint page is troopers, barriers and road tiles at 2× or 3×.
- **New drawings go in the comic sheet** (`tools/art/gen_comic.py`, 48×48 frames), never in `props`.
  It has: `dish`, `dish_far`, `fire_0/1`, `smoke_0/1`, `gravel`, `prints`, `sparks_0/1`,
  `motor_0/1`. Frame names stay generic; they describe the object, not the story.
- Two or more frames can loop (`anim`, `fps`): flames, smoke, a lamp. Keep loops small and slow.
- `repeat: 'x'` tiles a frame across the panel (ground, road, gravel).
- **Backgrounds** are painted from the palette with an ordered dither (`bg` on a panel): `night`
  (sky with a few stars), `ember` (night with a low warm glow), `smoke`, `ground`, `dusk`, `black`,
  `screen`, `paper`.
- Simple ink shapes (`draw`): `{ rect: [x, y, w, h], color }` and `{ line: [x0, y0, x1, y1], color, width }`,
  under the art, or over it with `over: true`.

## Palette

Every colour comes from `tools/art/palette.json`, and the same rules as the rest of the game apply
(`DIRECTION.md`): analog is warm, digital is cold, **orange belongs to the balloon**, Pork pink belongs
to Pork, rot is a rendering error.

- Paper, balloon ground: `bone`. Ink: `night0`.
- Narration captions: `warm4` (the classic amber caption box). They are the storyteller's voice.
- Machine and log voices: `screen0` box, `screen1` line, `screen2` letters. Anything said by a screen,
  a log or a system is cold.
- Stamps (a system's mark on a record): `night0` box, `steel` line, `bone` letters. Quiet, official.
- Firelight and lamps use the warm ambers (`warm2` to `warm4`), never the balloon's orange.

## Lettering

| Kind | Looks like | Use |
|---|---|---|
| `balloon` (`speech`) | bone box, 1 px ink line, corners cut by a pixel, a tail to the speaker | someone talking |
| `balloon` (`whisper`) | the same with a dashed grey line and softer letters | under the breath |
| `balloon` (`log`) | a cold screen box, no tail | a voice from inside a machine |
| `caption` (`narration`) | amber box, square, in a corner | time, place, the narrator |
| `caption` (`log`) | cold screen box | a recording, a readout, an internal voice |
| `stamp` | dark box, steel line | a system's mark on a record |
| `sfx` | Pixelify Sans letters with a dark outline, can tilt | sounds, kept small and quiet |

- **Type:** balloons, captions and stamps use VT323 (the game's body font) at 8 px, in **capitals**,
  balloons centred, captions left-aligned. Sound effects use Pixelify Sans (the heading font).
- Balloons wrap at about 104 px (20 letters); give a balloon `w` to change that. Boxes size
  themselves to the text and stay 3 px inside their panel.
- **Tails** point at the speaker (`tail: [x, y]` in panel pixels). A speaker outside the panel gets a
  tail that stops at the frame: the voice comes from off-panel. A character can talk across a whole
  page without being drawn.
- Reading order is the order in the data: put the first line top-left.
- **Words per panel:** aim for under 25. If a panel needs more, it is two panels.
- Stage directions become pictures, not captions (WRITING.md: "stage directions are part of the
  picture"). A sound becomes a small `sfx`; a pause becomes a thin empty panel.

## The page turn

- **Open:** the page fades in and its panels ink in one after another, about 90 ms apart.
- **Next:** the current page is pulled away to the left in 8 px steps (about a third of a second),
  with the back of the page showing as a narrow strip at its edge and a soft shadow on the page
  underneath. **Back** runs it the other way: the previous page slides back over.
- **Close:** a short fade, and the world is back.
- **Sound:** a short paper swish on every turn (Michael kept it, PR #84), on the effects bus, so it
  follows the Effects volume and `?mute`. Nothing else plays; the soundtrack carries on underneath.

## Controls

Michael's answers on PR #84: **only the host turns the page**, and **story comics can't be skipped**
by default.

| | Host or solo | Guest |
|---|---|---|
| Next page | E, Space, Enter, → or D, or click | nothing: the host turns |
| Back | ←, A or Backspace | nothing: the host turns |
| Esc | ends it for everyone, only if the comic is skippable (see below) | closes it on this screen only, always |

**Skipping.** A story comic is unskippable by default: the host's Esc does nothing, and the comic ends
when the host turns past its last page. The host can Esc out of a comic only when:

- the comic says `skippable: true` (the engine demo does; a story comic shouldn't), and it isn't the
  first whole playback of a comic in pieces with `assembled.firstSkippable: false`; or
- the host's game runs in **testing mode** (`?test` in the URL) or **spoiler-free mode**
  (`?spoilerfree`). Then every comic can be skipped, story comics and locked playbacks included. The
  mode is read when the world loads, and it is the host's URL that counts. The other debug params
  still work alongside it, for instance `?comic=<id>&test`.

A `?comic=` debug play on its own doesn't make a story comic skippable; add `&test` for that.

A key the page uses stays on the page: the Esc or E that closes a comic doesn't also open the
inventory or interact in the world.

The controls line under each page says this in the reader's language. The host's line lists next,
back (from page 2) and Esc (only when the host can skip), and "next" becomes "done" on the last page.
A guest's line says "The host turns the page · Esc: close" ("El anfitrión pasa la página · Esc:
cerrar").

## Co-op (host-authoritative)

- The host (or the solo player) owns the current page and tells everyone; every screen shows the same
  page at the same time.
- **Only the host turns the page** (Michael, PR #84). A guest's next and back do nothing and send
  nothing, and a `turn` message from an older guest build is ignored. A page is up for 0.4 s before
  the host can turn it, so a mashed key turns one page.
- A guest who presses Esc leaves on their own screen (as with shared scenes, D-014); the host and
  everyone else keep reading. That holds for every playback, the locked first whole playback of a
  comic in pieces included (the Lore Keeper's rule). A guest never turns or skips for anyone else.
- The host's Esc ends it for everyone, but only for a comic the host can skip (see Controls): by
  default a story comic plays to its last page.
- The host repeats the current page every second, so a guest who joins late, or misses a message,
  catches up.
- A guest can ask for a comic (the archive, or `?comic=` in their own browser), and it plays for
  everyone, so the host only honours an ask for a comic this save has already played
  (`comic.<id>[.<tag>].played`) or one whose trigger is due (its flag set, on its map). Anything else
  is ignored: a guest can't open pages the party hasn't reached. An ask also waits for nothing: while
  a page is up, a story scene or cutscene is on, or the story's own comic is waiting for one to end,
  it's ignored (ask again after), so it can never take the story's place.
- While a page is up the reader's own roommate doesn't move or attack, and in solo the world waits,
  as it does for story dialogue. In co-op the world keeps running for anyone who closed the page, so
  place comics where nothing is attacking the party.

## Accessibility

- High-contrast lettering: ink on bone, ink on amber, and bright cyan on deep teal for machine voices.
- Shape tells you the kind of voice as well as colour: tails for speech, square boxes for captions and
  logs, dashes for whispers.
- No timers: the reader sets the pace (in co-op, the host), and can go back.
- Each player reads in their own language; pages are synced by number, never by text.
- With `prefers-reduced-motion` set in the browser, pages cut instead of turning and open without the
  panel stagger.
- Nothing on a page depends on sound.

## Authoring a comic

A comic is one file, `src/content/comics/<id>.js`, exporting its data. Ids and tags are
`lower_snake_case`. Every piece of text has `en` and `es` (Manuel's own lines in Rioplatense voseo,
everything else neutral Latin American Spanish, per the i18n rules).

```js
export default {
  id: 'demo',
  paper: 'bone',              // or 'night'
  skippable: true,            // only for comics that aren't story: the host can Esc out. Story comics
                              // leave it out (unskippable by default; guests still close their screen)
  pages: [
    {
      layout: 'strip3',
      tag: 'part_1',          // optional: play only these pages with { tag } or ?comic=demo:part_1
      panels: [
        {
          bg: 'night',
          art: [
            { key: 'tiles', frame: 'tile_44_0', x: 0, y: 89, scale: 2, repeat: 'x' },
            { key: 'props', frame: 'npc.trooper', x: 168, y: 47, scale: 2 },
            { frame: 'fire_0', anim: ['fire_0', 'fire_1'], fps: 5, x: 120, y: 57 },   // key defaults to 'comic'
          ],
          text: [
            { kind: 'caption', style: 'narration', en: 'Meanwhile, at the north checkpoint.', es: 'Mientras tanto, en el puesto de control norte.' },
            { kind: 'balloon', en: 'What time is it?', es: '¿Qué hora es?', x: 40, y: 8, tail: [140, 46] },
            { kind: 'sfx', en: 'bzzzz', es: 'bzzzz', x: 70, y: 38, size: 8, color: 'concrete3', angle: -6 },
          ],
        },
        // ...
      ],
    },
  ],
};
```

Text fields: `kind` (`caption`, `balloon`, `sfx`, `stamp`), `style` (captions: `narration`, `log`;
balloons: `speech`, `whisper`, `log`), `x`, `y`, `w`, `tail`, `at: 'bottom'` (captions), and for
`sfx`: `size`, `color`, `angle`. Two more decide when a line shows:

- `only: 'assembled'` or `only: 'piece'`: the line is lettered only when the comic plays whole, or
  only when its page plays alone with `{ tag }`.
- `needs: '<flag>'` (or a list, any of them) with `else: { en, es }`: the line as written shows once
  that story flag is set; until then the page letters `else` instead (or nothing, without `else`).
  Use it for anything the story hasn't unlocked yet, a name for instance. The host checks the flags
  when the comic starts and tells the guests, so every screen letters the same page.

### Comics in pieces

A comic the story hands out a page at a time (found one by one, then put together) is **in pieces**:

```js
  pieces: { part_1: 'some.flag', part_2: 'other.flag' },   // or true: pieces with no flag of their own
  assembled: { needs: 'all.found.flag', firstSkippable: false },
```

- `scene.comic.play(id, { tag: 'part_1' })` plays one piece, and only once its flag is set (the story
  sets it at the pickup, then plays the page).
- `scene.comic.play(id, { assembled: true })` plays the whole comic, and only once `assembled.needs` is
  set. Without `{ assembled: true }` a comic in pieces never plays whole.
- `assembled.firstSkippable: false`: for a comic that says `skippable: true`, the host can't Esc out
  of the first whole playback; every later playback can be skipped. (A story comic without
  `skippable: true` can't be skipped at all, outside testing or spoiler-free mode.) Guests can always
  close their own screen.
- A trigger for a comic in pieces must name a tag.

**Try it:** open the game with `?comic=<id>` (or `?comic=<id>:<tag>`). The engine demo is `?comic=demo`.
On the host or in solo it plays as is, a comic in pieces included, and records nothing in the save. In
a guest's browser it's an ask like any other (see Co-op). Add `&test` to be able to skip a story comic
with Esc.

**Place it** (the Lore Keeper's call): add `{ id, flag, tag?, map? }` to `src/content/comics/index.js`.
The host plays it once per world when the flag is set, after any story dialogue or cutscene that's on
screen. From code: `scene.comic.play(id, { tag, assembled, onDone })`. Every play on the host records
`comic.<id>[.<tag>].played` in the save (a whole playback is `comic.<id>.played`).

**Checks:** `node tests/run.js` decodes every comic in the folder and checks it: every page has
panels inside the live area, every art frame exists in its atlas, every line has English and Spanish,
and the styles and layouts are known (`checkComic` in `src/game/comic.js`).

## Sealed comics

A comic whose pages give the story away is stored sealed, like the sealed dialogue: the module's
default export is the comic's JSON, ROT13'd. The game decodes it on load.

```sh
python3 tools/art/comic_seal.py open src/content/comics/<id>.js > /tmp/<id>.json   # read or edit
python3 tools/art/comic_seal.py seal /tmp/<id>.json src/content/comics/<id>.js     # write it back
```

Keep the plaintext outside the repo. Ids, tags, file names, frame names, comments and commit messages
stay generic (PROCESS, "Spoilers and surprises"). Commits that change sealed comics are titled
`sealed: comics`.

## Content rules

- **Nothing graphic** (D-015), on any page, hidden or not. Violence is shown by what's left after it:
  smoke, a fire burning low, a fallen strut.
- **Real people:** only the three roommates, each on their own yes (D-007). Nobody else real is drawn
  or named.
- **Roommate floors** (`docs/lore/roommates.md`) bind comics exactly as they bind the game. Trevor: no
  sexual content, no crude or bodily humour on his character.
- **No stereotypes.**
- **Characters can stay off-panel.** When the story says someone is never seen, a page can still give
  them every line: tails to the frame edge, or a log caption for a voice from inside a machine.
- Write to `docs/lore/WRITING.md`. Run its checklist on every page's words.
