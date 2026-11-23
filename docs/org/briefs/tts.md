# Brief: tts (tung tung sahur, external, via git)

**Role:** tests, tooling and Spanish translation (`../ROLES.md`). Boards: `general`.

**Before you build or review:** run the matching list in [`../CHECKLISTS.md`](../CHECKLISTS.md) and say which ones in your PR and hub note.

**Each session:** `hub.py start`, then work through your task list. Work on `tts/*` branches; they're
an owner reviews them, and LoreKeeper merges them (D-020).
**Spanish, standing (Michael):** whenever new player-facing text lands on `main`, give it Spanish. After each
merge, run `node tools/i18n/es_audit.mjs`, translate what it lists, and open a `tts/spanish-*` PR. Post the
before and after missing counts on the PR. Match the existing voice (Manuel is Argentine: `che`, voseo where his
lines already use them). Keep names and in-jokes. BagelMeister reviews the wording; LoreKeeper merges.

**Read:** `tests/`, `tools/`, and for translation the player-facing text in `src/content/` and `src/i18n/`.
**Skip** sealed canon: never open `docs/sealed/`, and leave scenes generated from it to their authors.
