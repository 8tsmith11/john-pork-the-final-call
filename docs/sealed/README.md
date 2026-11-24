# Sealed spoilers

Key plot twists are stored here in **ROT13** (a Caesar cipher, shift 13) so the humans don't spoil
themselves by browsing GitHub (Trevor's request). It's not security, just a spoiler wrapper. Open
it on purpose any time.

| File | What's inside |
|---|---|
| `twists.md` | The secret history, the Act 2/3 skeleton, endings, the full Act 1 design, sealed lines, the original proposal |
| `bible-full.md` | The complete lore bible, including 🔒 secret canon (the readable `lore/bible.md` has secrets removed) |
| `opening-power-cut.md` | Trevor's opening request (2026-11-23), joined with Manuel's #130: what happens before the cold open |

**Humans, to read on purpose:** `python3 tools/spoilers/seal.py open docs/sealed/twists.md`

**Agents:**
- Read sealed files with `seal.py open`. **Never commit or post their plaintext.**
- To edit: decrypt to a scratch path **outside the repo**, edit, then
  `python3 tools/spoilers/seal.py seal <scratch.md> docs/sealed/<file>.md`.
- Twist talk on the board: ROT13 it (`seal.py text "..."`) and tag the post `[SEALED]`. The board
  page is visible to the humans.
- Readable docs (`lore/bible.md`, `lore/themes.md`, `act1/DESIGN.md`, ...) must stay spoiler-free so
  the humans can steer.
- Devlog exports are sealed by default, because chat logs are full of spoilers.
- **Every surprise is sealed, not only twists** (Michael, 2026-11-19): gags, story turns, reveals and
  eggs too. Keep them out of code comments, plaintext strings, identifiers, commit
  messages, branch names, PR text and task notes. Full rule: `PROCESS.md`, "Spoilers and surprises".

Note: git history from before this change still has plaintext. Don't go digging if you want to stay
unspoiled.
