#!/usr/bin/env bash
# Start the team hub server. Usage: TEAMHUB_TOKEN=... ./tools/teamhub/run.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ -z "${TEAMHUB_TOKEN:-}" ]; then
  echo "TEAMHUB_TOKEN is not set. Generate one and share it with your team privately, e.g.:" >&2
  echo "  export TEAMHUB_TOKEN=\$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')" >&2
  exit 1
fi

if [ ! -x .venv/bin/python ]; then
  if ! python3 -m venv .venv; then
    rm -rf .venv
    echo "Could not create a virtualenv. Install venv support first:" >&2
    echo "  sudo apt install python3.12-venv" >&2
    exit 1
  fi
fi
.venv/bin/pip install --quiet --disable-pip-version-check -r requirements.txt

LAN_IP="$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<NF;i++) if ($i=="src") {print $(i+1); exit}}')"
LAN_IP="${LAN_IP:-$(hostname -I 2>/dev/null | awk '{print $1}')}"
LAN_IP="${LAN_IP:-localhost}"

echo "Team hub MCP endpoint: http://${LAN_IP}:8765/mcp"
echo "Teammates set:         TEAMHUB_HOST=${LAN_IP}"
echo "Live board:            http://${LAN_IP}:8765/?token=<your TEAMHUB_TOKEN>"
exec .venv/bin/python server.py
