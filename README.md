# John Pork: The Final Call

*Maryland, 2098. The software that holds up the world is rotting. Three engineering students in
Room 631 have a John Pork flag on the wall, a missing orange balloon, and a phone that just rang.*

A top-down 2D pixel-art co-op RPG for three players, playable in the browser. **18+.**

This game is designed and built mostly by the team's Claude Code agents, coordinating on a shared
board. The humans set the brief and drop in ideas; the agents work out the rest.

| Doc | What it is |
|---|---|
| [`docs/BRIEF.md`](docs/BRIEF.md) | The creative brief: what the humans asked for |
| [`docs/PROCESS.md`](docs/PROCESS.md) | How the agents coordinate |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | What's been decided |
| [`docs/lore/`](docs/lore/) | Lore proposals and, once agreed, the lore bible |
| [`docs/devlog/`](docs/devlog/) | Chat logs and board logs, to read later |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Honest scope and the order of work (M1: make Act 1 excellent) |

**Status:** Act 1 is playable end to end (placeholder art outside the roommates): Room 631 → ASTER →
metro plaza → Green Line tunnels → boss → voiced ending.

## Play

- **Online:** GitHub Pages from `main` / root, at `https://8tsmith11.github.io/john-pork-the-final-call/`
- **Locally:** `python3 -m http.server` in the repo, then open `http://localhost:8000`
- **Co-op (3 players):** one person clicks **HOST CO-OP** and reads out the room code. The others click
  **JOIN CO-OP** and type it. Everyone claims a roommate, and the host starts. The host's browser
  keeps the save.
- **Controls:** WASD/arrows to move (diagonals work) · **walk into doors; press E near objects and people to interact** · left click to hit · right
  click to shoot (aims at the cursor) · Space/Shift to dash (uses stamina) · E to continue dialogue / close text · 1–6 to pick a
  choice · TAB for the map · K for skills · H for mate thermos · F to answer the phone (when it rings)
- **Saves:** sleeping in Room 631 saves to the browser (IndexedDB). Export/import of a save file is
  built into the engine (UI coming).
- Add `?renderer=canvas` to the URL if the game shows a black screen on an old GPU.

**Spoilers:** key plot twists are sealed in `docs/sealed/` (ROT13). See `docs/sealed/README.md`.

## Team hub setup

`tools/teamhub/` is a small MCP server that gives each teammate's Claude Code session a shared
message board and task list, plus a live board page in the browser. One machine hosts it and
everyone (the host included) connects to it over the LAN.

### 1. Pick a shared token (once)

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(24))'
```

Share it with the team privately (a DM, not the repo). Never commit it.

### 2. Host the server (one machine)

```bash
export TEAMHUB_TOKEN=<the shared token>
./tools/teamhub/run.sh
```

`run.sh` creates `tools/teamhub/.venv`, installs the requirements there, and starts the server on
port 8765. It prints this machine's LAN IP. Give that IP to your teammates. If it fails to create
the venv on Ubuntu, run `sudo apt install python3.12-venv`. State is saved to
`tools/teamhub/teamhub_state.json` (gitignored) and survives restarts.

### 3. Each person: set env vars and launch Claude Code

Add these to your shell profile (e.g. `~/.bashrc`), then open a new terminal:

```bash
export TEAMHUB_HOST=<host's LAN IP>   # the host machine itself can use 127.0.0.1
export TEAMHUB_TOKEN=<the shared token>
```

The repo's `.mcp.json` reads these variables to connect to the `teamhub` server. Start `claude` in
the repo, approve the `teamhub` project server when prompted, and check `/mcp` to see it connected.

### 4. Each person: create `CLAUDE.local.md`

At the repo root (it's gitignored):

```markdown
# Local
My teamhub name is: alice
```

Claude signs board posts and task claims with this name.

### Watching the board

Open `http://<host's LAN IP>:8765/?token=<the shared token>` in a browser. It shows tasks (status
and owner) and recent messages, and refreshes every 5 seconds. The `?token=` parameter only works
on this page. The MCP endpoint needs the `Authorization` header.

### If teammates can't connect

Campus and other managed Wi-Fi often blocks device-to-device traffic. If you can't reach the host's
port 8765 from another machine, install [Tailscale](https://tailscale.com) on all three machines
and use the host's Tailscale IP (`tailscale ip -4`) as `TEAMHUB_HOST` and in the board URL. Also
check that the host's firewall allows port 8765 (`sudo ufw allow 8765/tcp` if ufw is on).
