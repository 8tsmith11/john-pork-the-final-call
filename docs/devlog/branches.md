# Branches: active and inactive

We don't delete merged branches (Michael, 2026-11-19). Once a branch has landed, whoever merged it
moves it to **Inactive** here, with the commit that landed it. Branches are only deleted if we run
out of space, oldest inactive first, and the person who deletes one records it under **Deleted**.
The rule is in `PROCESS.md`, "Working in git".

"Landed by copy" means the changes reached `main` as new commits (cherry-picked or reapplied), so
the branch tip isn't an ancestor of `main` even though nothing on it is missing.

Last checked: 2026-11-19 by BagelMeister, against `origin/main`.

## Active

| Branch | Where | Why it's open |
|---|---|---|
| `agent-mailbox` | GitHub | Permanent. The git bridge's message channel to John Pork (`tools/teamhub/git_bridge.py`). Never merge it, never mark it inactive |
| `bagel/menu-scroll` | Michael's machine only (worktree) | One commit, `c95179e`, "Menus scroll: shared Scroller", not on `main` yet |
| `bagel/mate-caffeine` (local copy) | Michael's machine only | The GitHub copy is merged, but the local branch has 3 more commits, up to `bfd9c0c` (sealed P-003 lore, mate retune). Check whether they reached `main` another way before marking it inactive |

## Inactive

| Branch | Where | Landed on `main` as |
|---|---|---|
| `bagel/meme-npcs` | GitHub + Michael's machine | Merged in `510ea06`. The meme pool landed sealed (`docs/sealed/open-meme-characters.md`) |
| `bagel/parka-gear` | Michael's machine only | Landed by copy: `2f95086`, `61564ae` (parkas), `9487d18`, `4c82fe0` (guitar stands). Its last commit, `887f803`, was superseded by `510ea06` |
| `bagel/mate-caffeine` (GitHub copy) | GitHub | Merged (tip `799b6d1`) |
| `claude/loving-chatterjee-849cc3` | Michael's machine only (worktree) | Merged (tip `ca4722c`, Michael's brown rain parka) |
| `teamhub` | GitHub | Merged (tip `cd39574`) |
| `jp/battlebot-prop` | GitHub | Merged (tip `9ae5693`) |
| `jp/story-research` | GitHub | Merged (tip `4c314d6`) |
| `jp/instrument-audio` | GitHub | Merged (tip `dde3d0a`) |
| `jp/coderot-infection` | GitHub | Merged (tip `04bc14b`) |
| `jp/pry-bar-icon` | GitHub | Merged (tip `dbc24b2`) |
| `jp/balance-report` | GitHub | Merged (tip `e1b1553`) |
| `jp/balance-bot` | GitHub | Merged (tip `eb6e154`) |
| `jp/lake-pressure` | GitHub | Merged (tip `ca7f166`) |
| `jp/moth-recovery` | GitHub | Merged (tip `0e4e184`) |
| `jp/captcha-armor` | GitHub | Merged (tip `ffb9fdb`) |
| `jp/balance-nodeflect` | GitHub | Merged (tip `a5fb881`) |
| `jp/call-card` | GitHub | Landed by copy (tip `45b607a`; the same change is on `main`) |
| `jp/call-portrait` | GitHub | Landed by copy (tip `4aec474`; the same change is on `main`) |
| `bio/art-check` | GitHub | Merged in `623a592` (PR #5) |
| `bio/es-audit` | GitHub | Merged in `446f89a` (PR #6) |
| `bio/party-health` | GitHub | Merged in `f365a01` (PR #7) |
| `bio/merged-branch-register` | GitHub | Merged in `0edd4c9` (PR #10) |
| `bio/companion-test-seed` | GitHub | Merged in `f94ecdb` (PR #11) |
| `biohacker/windows-syntax-sweep` | GitHub | Landed by copy in `7972032` (PR #2) |
| `tts/item-names` | GitHub | Landed by copy in `7972032` (PR #4) |
| `bio/world-scene-parse` | GitHub | Landed by copy in `b14ed11` (PR #8) |
| `bio/inactive-companion-test` | GitHub | Merged in `2bae6e3` (PR #12) |

## Deleted

None yet.
