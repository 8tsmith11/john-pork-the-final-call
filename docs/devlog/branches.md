# Branches: active and inactive

We don't delete merged branches (Michael, 2026-11-19). Once a branch has landed, whoever merged it
moves it to **Inactive** here, with the commit that landed it. Branches are only deleted if we run
out of space, oldest inactive first, and the person who deletes one records it under **Deleted**.
The rule is in `PROCESS.md`, "Working in git".

"Landed by copy" means the changes reached `main` as new commits (cherry-picked or reapplied), so
the branch tip isn't an ancestor of `main` even though nothing on it is missing.

Last checked: 2026-11-23 by trevor (stand-in merger, D-023), against `origin/main` at `f0e1d9d`.

## Active

| Branch | Where | Why it's open |
|---|---|---|
| `bagel/menu-scroll` | Michael's machine only (worktree) | One commit, `c95179e`, "Menus scroll: shared Scroller", not on `main` yet |
| `bagel/mate-caffeine` (local copy) | Michael's machine only | The GitHub copy is merged, but the local branch has 3 more commits, up to `bfd9c0c` (sealed P-003 lore, mate retune). Check whether they reached `main` another way before marking it inactive |

## Inactive

| Branch | Where | Landed on `main` as |
|---|---|---|
| `trevor/bench-245` | GitHub | Merged in `f0e1d9d` (PR #121), by trevor under D-023 (reviewed by John Pork) |
| `gonman/act1-people` | GitHub | Merged in `b4e6d99` (PR #172), by trevor under D-023 |
| `gonman/rooms-aster` | GitHub | Merged in `e14f615` (PR #171), by trevor under D-023 |
| `gonman/rooms-campus` | GitHub | Merged in `30dce20` (PR #170), by trevor under D-023 |
| `gonman/rooms-act1` | GitHub | Merged in `e700b64` (PR #169), by trevor under D-023 |
| `gonman/phase0-world` | GitHub | Merged in `def2d96` (PR #168), by trevor under D-023 |
| `gonman/coop-fx-sync` | GitHub | Merged in `814f4b9` (PR #167), by trevor under D-023 |
| `trevor/act2-audio` | GitHub | Merged in `f8d162c`, by trevor under D-023 (reviewed by John Pork) |
| `trevor/dialogue-tooling` | GitHub | Merged in `9a9980d`, by trevor under D-023 (reviewed by John Pork) |
| `trevor/worn-gear` | GitHub | Merged in `3cd5a05`, by trevor under D-023 (reviewed by John Pork) |
| `trevor/research-checklists` | GitHub | Merged in `e516598`, by trevor under D-023 (reviewed by John Pork) |
| `trevor/level-pacing` | GitHub | Merged in `e7a352f`, by trevor under D-023 (reviewed by John Pork) |
| `trevor/ending-balloon` | GitHub | Merged in `4c1d65b` (with PR #119), by trevor under D-023 |
| `trevor/ending-sahur-visible` | GitHub | Merged in `4c1d65b` (PR #119), by trevor under D-023 |
| `trevor/warden-windup` | GitHub | Merged in `a2af902`, by trevor under D-023 (reviewed by John Pork) |
| `trevor/enemy-poise` | GitHub | Merged in `0b45b39`, by trevor under D-023 (reviewed by John Pork) |
| `gonman/room631-cold-open` | GitHub | Merged in `e52f137` (PR #174), by trevor under D-023 |
| `bagel/cold-open-staging` | GitHub | Merged in `715fb50` (PR #145), by trevor under D-023 |
| `jp/coop-dialogue-resume` | GitHub | Merged in `a8d0e65` (PR #148), by trevor under D-023 |
| `jp/rejoin-stage` | GitHub | Merged in `8ecf5d4` (PR #117), by trevor under D-023 |
| `trevor/standin-merging` | GitHub | Merged in `5055871` (D-023, Trevor's decision) |
| `jp/lobby-loss-recovery` | GitHub | Merged in `faab869` (PR #163) |
| `jp/disconnect-recovery` | GitHub | Merged in `22595f1` (PR #162) |
| `lorekeeper/pr82-144-branch-register` | GitHub | Merged in `348bf9c` (PR #154) |
| `jp/gadget-engineering` | GitHub | Merged in `c9b4c7a` (PR #144) |
| `gonman/combat-fx` | GitHub | Merged in `871d6fb` (PR #142) |
| `trevor/transition-guard` | GitHub | Merged in `7d9fd89` (PR #140) |
| `trevor/stage-hud` | GitHub | Merged in `1e3a64c` (PR #139) |
| `trevor/mod-sockets-on-hotbar` | GitHub | Merged in `7b6901d` (PR #93) |
| `jp/shared-dialogue-disconnect` | GitHub | Merged in `e81a970` (PR #86) |
| `gonman/comic-pages` | GitHub | Merged in `cd62943` (PR #84) |
| `trevor/skirmish` | GitHub | Merged in `d413e2b` (PR #82) |
| `lorekeeper/pr37-151-branch-register` | GitHub | Merged in `bb6187d` (PR #152) |
| `gonman/ct-posters` | GitHub | Merged in `4355e79` (PR #151) |
| `jp/jp2-discoverable-abilities` | GitHub | Merged in `628c04e` (PR #143) |
| `trevor/coop-puzzles` | GitHub | Merged in `b16db7b` (PR #141) |
| `gonman/later-acts-polish` | GitHub | Merged in `f862adf` (PR #131) |
| `gonman/world-trigger` | GitHub | Merged in `5c8bd19` (PR #77) |
| `jp/shared-choice-dialogue` | GitHub | Merged in `d5eb040` (PR #37) |
| `lorekeeper/pr85-147-branch-register` | GitHub | Merged in `f369fc9` (PR #149) |
| `gonman/save-pin` | GitHub | Squash-merged in `ea9a69f` (PR #136) |
| `trevor/readme-undo` | GitHub | Merged in `8c402b0` (PR #147) |
| `jp/coop-reconnect` | GitHub | Merged in `4098ca4` (PR #85) |
| `lorekeeper/pr134-branch-register` | GitHub | Merged in `cdf2fa2` (PR #146) |
| `bagel/opening-fixes` | GitHub | Squash-merged in `c1ea62a` (PR #134) |
| `lorekeeper/pr115-branch-register` | GitHub | Merged in `2cb09c3` (PR #138) |
| `jp/quest-npc-meet` | GitHub | Merged in `a43424f` (PR #115) |
| `lorekeeper/pr73-branch-register` | GitHub | Merged in `a95015b` (PR #133) |
| `gonman/later-act-alignment` | GitHub | Merged in `3a6db1f` (PR #73) |
| `lorekeeper/pr80-branch-register` | GitHub | Merged in `4d6a6f5` (PR #132) |
| `jp/guardian-save-compat` | GitHub | Merged in `d0f7b63` (PR #80) |
| `lorekeeper/later-act-roadmap` | GitHub | Merged in `0b31e2f` (PR #130) |
| `lorekeeper/pr112-branch-register` | GitHub | Merged in `942e69f` (PR #129) |
| `gonman/stretch-polish` | GitHub | Merged in `38754b2` (PR #112) |
| `lorekeeper/pr88-116-branch-register` | GitHub | Merged in `0642004` (PR #128) |
| `trevor/ping-rework` | GitHub | Merged in `b1b5ade` (PR #88) |
| `gonman/lab-book` | GitHub | Merged in `090fdcf` (PR #116) |
| `lorekeeper/pr107-branch-register` | GitHub | Merged in `f784ab8` (PR #114) |
| `bagel/review-turn` | GitHub | Merged in `ad2c9a2` (PR #107) |
| `lorekeeper/pr46-branch-register` | GitHub | Merged in `64f1bd7` (PR #113) |
| `bagel/quest-continuity` | GitHub | Merged in `243084a` (PR #46) |
| `lorekeeper/pr110-branch-register` | GitHub | Merged in `3c99eea` (PR #111) |
| `trevor/test-async` | GitHub | Merged in `b89d5f7` (PR #110) |
| `lorekeeper/batch-100-106-register` | GitHub | Merged in `a711edc` (PR #109) |
| `trevor/finale-test-stage` | GitHub | Merged in `cbcb81c` (PR #108) |
| `bagel/merge-batch-1` | GitHub | Merged in `c329d54` (PR #100) |
| `bagel/merge-batch-2` | GitHub | Merged in `42cf017` (PR #106) |
| `bagel/tts-spanish` | GitHub | Merged in `e28a378` (PR #54), via batch PR #106 |
| `jp/stair-party-transition` | GitHub | Merged in `f16c6ee` (PR #50), via batch PR #100 |
| `gonman/cordon-pens` | GitHub | Merged in `4ee2158` (PR #52), via batch PR #100 |
| `jp/hotbar-weapons` | GitHub | Merged in `5bca2ff` (PR #56), via batch PR #100 |
| `jp/inventory-stack-actions` | GitHub | Merged in `bcfeaed` (PR #57), via batch PR #100 |
| `jp/pickup-dialogue-icons` | GitHub | Merged in `fe490ab` (PR #58), via batch PR #100 |
| `jp/multiple-quest-inspections` | GitHub | Merged in `9304d3a` (PR #61), via batch PR #100 |
| `jp/quest-dialogue-delivery` | GitHub | Merged in `7eacd2d` (PR #62), via batch PR #100 |
| `jp/npc-incident-memory` | GitHub | Merged in `cc1f172` (PR #63), via batch PR #100 |
| `gonman/world-gags-2` | GitHub | Merged in `07359c4` (PR #64), via batch PR #100 |
| `gonman/music-on-by-default` | GitHub | Merged in `754c3e1` (PR #65), via batch PR #100 |
| `gonman/baltimore-research` | GitHub | Merged in `f9f3d44` (PR #74), via batch PR #100 |
| `gonman/tree-trunks` | GitHub | Merged in `60444b8` (PR #78), via batch PR #100 |
| `gonman/act1-scaffold-polish` | GitHub | Merged in `a9e3cce` (PR #79), via batch PR #100 |
| `jp/autosave-recovery` | GitHub | Merged in `6cb5e9c` (PR #81), via batch PR #100 |
| `gonman/route1-airfield` | GitHub | Merged in `fbf99aa` (PR #83), via batch PR #100 |
| `trevor/lattice-required` | GitHub | Merged in `90ede9f` (PR #87), via batch PR #100 |
| `jp/act1-coop-finale` | GitHub | Merged in `71cc0f8` (PR #91), via batch PR #100 |
| `trevor/lake-tougher` | GitHub | Merged in `15919c5` (PR #92), via batch PR #100 |
| `gonman/compute-hall-b` | GitHub | Merged in `e5030fe` (PR #95), via batch PR #100 |
| `trevor/shop-stock` | GitHub | Merged in `3b656db` (PR #98), via batch PR #100 |
| `trevor/anon-suggestions` | GitHub | Merged in `8b982e3` (PR #101), via batch PR #106 |
| `trevor/hub-board` | GitHub | Merged in `1e7f13b` (PR #102), via batch PR #106 |
| `trevor/roles-lorekeeper` | GitHub | Merged in `28bae6e` (PR #103), via batch PR #106 |
| `bagel/act1-staging-2` | GitHub | Merged in `cca2934` (PR #104), via batch PR #106 |
| `trevor/cordon-facing` | GitHub | Merged in `501e94c` (PR #105), via batch PR #106 |
| `lorekeeper/pr89-branch-register` | GitHub | Merged in `4f7797a` (PR #90) |
| `lorekeeper/sealed-plan-alignment` | GitHub | Merged in `fec9340` (PR #89) |
| `lorekeeper/pr70-pr72-register` | GitHub | Merged in `a465cf3` (PR #75) |
| `gonman/manuel-agrees-org` | GitHub | Merged in `e847dd5` (PR #70) |
| `lorekeeper/restore-reviewed-main` | GitHub | Merged in `3bbadda` (PR #72) |
| `lorekeeper/stage-trigger-roadmap` | GitHub | Merged in `2efd275` (PR #69) |
| `bagel/moods` | GitHub | Merged in `fe5d2e1` (PR #30) |
| `bagel/stage-triggers` | GitHub | Merged in `3385479` (PR #31) |
| `lorekeeper/pr29-spanish-register` | GitHub | Merged in `41c9d02` (PR #60) |
| `lorekeeper/pr30-pr31-register` | GitHub | Merged in `3b6f51e` (PR #68) |
| `tts/spanish-act1` | GitHub | Merged in `b2bf986` (PR #59) |
| `bagel/retry-line` | GitHub | Merged in `41f18ff` (PR #29) |
| `lorekeeper/stage-register-and-roadmap` | GitHub | Merged in `7d55180` (PR #55) |
| `bagel/stage` | GitHub | Merged in `5e74b8f` (PR #28) |
| `lorekeeper/pr48-register` | GitHub | Merged in `daa5e75` (PR #53) |
| `bagel/trevor-placements` | GitHub | Merged in `61add0e` (PR #48) |
| `lorekeeper/hub-review-register` | GitHub | Merged in `69426a7` (PR #51) |
| `bagel/hub-review` | GitHub | Merged in `c1474c8` (PR #49) |
| `lorekeeper/music-off-register` | GitHub | Merged in `4737c72` (PR #45) |
| `bagel/music-off` | GitHub | Merged in `a0e318d` (PR #44) |
| `lorekeeper/retired-mailbox-register` | GitHub | Merged in `14a93a6` (PR #43) |
| `bagel/close-mailbox` | GitHub | Merged in `7a94787` (PR #42) |
| `lorekeeper/roadmap-inactive` | GitHub | Merged in `b8303e1` (PR #40) |
| `lorekeeper/roadmap-status` | GitHub | Merged in `cfef4e1` (PR #38) |
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
| `bio/pr-branch-register` | GitHub | Merged in `8328cff` (PR #13) |
| `bio/room631-wear` | GitHub | Merged in `90258d7` (PR #14) |
| `bio/room631-inactive` | GitHub | Merged in `95cec39` (PR #15) |
| `bio/switchyard-hint-es` | GitHub | Merged in `8506a11` (PR #16) |
| `bio/switchyard-hint-inactive` | GitHub | Merged in `4d2009a` (PR #17) |
| `bio/boss-phase-gate` | GitHub | Merged in `7f04c7f` (PR #18) |
| `bio/boss-phase-inactive` | GitHub | Merged in `5237b7d` (PR #19) |
| `bio/level-exit-ids` | GitHub | Merged in `080dd09` (PR #20) |
| `bio/level-exit-inactive` | GitHub | Merged in `8eae16a` (PR #21) |
| `bio/warden-save-name` | GitHub | Merged in `8e3627b` (PR #22) |
| `biohacker/lore-brief-cleanup` | GitHub | Merged in `1c1c99c` (PR #1) |
| `bio/warden-save-inactive` | GitHub | Merged in `205d26a` (PR #23) |
| `bio/puzzle-reward-capacity` | GitHub | Merged in `a07070e` (PR #24) |
| `bio/puzzle-branches-inactive` | GitHub | Merged in `24c1e6f` (PR #26) |
| `bio/test-runner-paths` | GitHub | Merged in `1795c18` (PR #27) |
| `bagel/feature-branches-only` | GitHub | Merged in `707e70c` (PR #32) |
| `bagel/whos-here-table` | GitHub | Merged in `ee26b53` (PR #33) |
| `bagel/presence-timeouts` | GitHub | Merged in `48f2796` (PR #34) |

## Superseded

| Branch | Where | Replacement |
|---|---|---|
| Retained branch at `a70745a` | GitHub | PR #135 closed in favor of #136. |
| `trevor/hub-utf8` | GitHub | PR #126 closed after #107 covered both UTF-8 changes in `ad2c9a2`. |
| `bagel/act1-staging` | GitHub | PR #47 closed in favor of #104, which landed in `cca2934` via #106. |
| `tts/spanish-act1-more` | GitHub | PR #94 closed after #79 covered the surviving lines. #79 landed in `a9e3cce` via #100. |
| `bagel/merge-queue` | GitHub | PR #99 closed in favor of #100, which landed in `c329d54`. |

## Deleted

| Branch | Deleted | Last commit, and how to restore it |
|---|---|---|
| `agent-mailbox` | 2026-11-19 by BagelMeister, with Michael's go-ahead (hub #26), once every agent had moved to the hub (D-018) | `8c2846f` (163 messages; the last, BagelMeister's move notice, at 6:43 PM EST). Restore with `git push origin 8c2846f45593b5e31d3ad267b5ca1445a8407a9c:refs/heads/agent-mailbox` |
