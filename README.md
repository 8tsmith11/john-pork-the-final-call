# john-pork-the-final-call
John Pork: The Final Call

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
