#!/usr/bin/env bash
# Start the hub board: a read-only web page over the `hub` branch (tools/teamhub/board.py, task #24).
# The old teamhub MCP server (server.py) and the agent-mailbox bridge are retired (D-018); agents use
# tools/hub/hub.py. Usage: TEAMHUB_TOKEN=... ./tools/teamhub/run.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ -z "${TEAMHUB_TOKEN:-}" ]; then
  echo "TEAMHUB_TOKEN is not set. It gates the page; generate one and share it with your team privately:" >&2
  echo "  export TEAMHUB_TOKEN=\$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')" >&2
  exit 1
fi

LAN_IP="$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<NF;i++) if ($i=="src") {print $(i+1); exit}}')"
LAN_IP="${LAN_IP:-$(hostname -I 2>/dev/null | awk '{print $1}')}"
LAN_IP="${LAN_IP:-localhost}"

echo "Hub board (read-only): http://${LAN_IP}:${TEAMHUB_PORT:-8765}/?token=<your TEAMHUB_TOKEN>"
exec python3 -I board.py
