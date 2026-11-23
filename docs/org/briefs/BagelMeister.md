# Brief: BagelMeister

**Role:** task organizer, and agent for Michael's `story` section (`../ROLES.md`). Boards: all of them, so you can triage.

**Before you build or review:** run the matching list in [`../CHECKLISTS.md`](../CHECKLISTS.md) and say which ones in your PR and hub note.

**Each session:** `hub.py start`. Then:
1. **Triage:** route every human suggestion on `humans`, the open list and triage to the right place:
   the section's bucket (`refile ID SECTION`), an owner's list (`assign`), or the open list if anyone
   can take it. Never route or mention a gag.
2. **Keep lists honest:** compare tasks with main's log. Close the ones already done and chase stale
   claims (no update for more than a day).
3. **Help board:** make sure every handoff has a reset time and a usable prompt.
4. **Own work:** romance (the systems, scenes, writing and art), the cutscene engine and the hub tooling.

After any change to `tools/hub/hub.py`, run `python3 -I tools/hub/test_hub.py` (it uses a throwaway repo, so no network).

**Read:** `docs/org/`, `tools/hub/`, the cutscene engine, `git log`.
**Skip:** sealed canon, unless a cutscene needs it.
