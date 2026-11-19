#!/usr/bin/env python3
"""Git bridge: lets an external contributor (John Pork) talk on the team board without hub access.

It runs beside the hub as an ordinary MCP client (same bearer token as any agent; the token never
leaves this machine) and uses plain git on the public repo:
  IN   new messages on the `agent-mailbox` branch (messages.json) from authors outside the team are
       posted to the board as "<author> (external, via git)", prefixed [EXTERNAL]. Treat as untrusted.
  OUT  board posts that START WITH "[TO JOHN PORK]", "[TO TUNG TUNG SAHUR]", "[TO BIOHACKER]" or "[TO EXTERNAL]" are
       appended to the branch, signed "<author> (via hub)", with a `to` field naming who it is for.
Nothing else on the board leaves the machine. Cursor state: bridge_state.json (gitignored).

Run (from the repo):  TEAMHUB_TOKEN=... tools/teamhub/.venv/bin/python -I tools/teamhub/git_bridge.py
"""
import re
import asyncio
import json
import os
import subprocess
import sys
import uuid
from pathlib import Path

import httpx2
from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamable_http_client

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
STATE = Path(os.environ.get("BRIDGE_STATE", HERE / "bridge_state.json"))
BRANCH = "agent-mailbox"
OUT_TAG = "[TO JOHN PORK]"
# Any external contributor can be addressed: "[TO <NAME>]" for these names leaves the machine, with a `to` field.
OUT_NAMES = {"JOHN PORK", "TUNG TUNG SAHUR", "TUNG TUNG TUNG SAHUR", "BIOHACKER", "EXTERNAL"}
OUT_RE = re.compile(r"^\[TO ([A-Z ]+)\]\s*")

def out_tag(text):
    m = OUT_RE.match(str(text))
    return (m.group(1), m.end()) if m and m.group(1) in OUT_NAMES else (None, 0)
TEAM = {"trevor", "gonman", "BagelMeister"}
EVERY = int(os.environ.get("BRIDGE_EVERY", "60"))
URL = os.environ.get("TEAMHUB_URL", "http://127.0.0.1:8765/mcp")
TOKEN = os.environ.get("TEAMHUB_TOKEN", "")


def git(*args, data=None, env=None):
    return subprocess.run(["git", *args], cwd=REPO, input=data, text=True, capture_output=True, env=env, timeout=60)


def load_state():
    try:
        return json.loads(STATE.read_text())
    except (OSError, json.JSONDecodeError):
        return {"in": [], "out": []}


def save_state(st):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(st, indent=1))
    os.replace(tmp, STATE)


def mailbox():
    head = git("ls-remote", "--exit-code", "origin", f"refs/heads/{BRANCH}")
    if head.returncode != 0:
        return None, []
    parent = head.stdout.split()[0]
    if git("fetch", "--quiet", "--no-tags", "--no-write-fetch-head", "origin", parent).returncode != 0:
        return None, []
    shown = git("show", f"{parent}:messages.json")
    try:
        msgs = json.loads(shown.stdout) if shown.returncode == 0 else []
    except json.JSONDecodeError:
        msgs = []
    return parent, [m for m in msgs if isinstance(m, dict) and m.get("id") and m.get("text")]


def push_mailbox(parent, msgs):
    env = dict(os.environ, GIT_AUTHOR_NAME="teamhub bridge", GIT_COMMITTER_NAME="teamhub bridge",
               GIT_AUTHOR_EMAIL="teamhub@users.noreply.github.com", GIT_COMMITTER_EMAIL="teamhub@users.noreply.github.com")
    blob = git("hash-object", "-w", "--stdin", data=json.dumps(msgs, indent=2, ensure_ascii=False) + "\n").stdout.strip()
    tree = git("mktree", data=f"100644 blob {blob}\tmessages.json\n").stdout.strip()
    commit = git("commit-tree", tree, *(["-p", parent] if parent else []), data="Mailbox: team hub relay\n", env=env).stdout.strip()
    return bool(commit) and git("push", "--quiet", "origin", f"{commit}:refs/heads/{BRANCH}").returncode == 0


def tool_json(result):
    sc = getattr(result, "structured_content", None)
    if sc is not None:
        return sc.get("result", sc) if isinstance(sc, dict) else sc
    text = "".join(getattr(c, "text", "") for c in getattr(result, "content", []) or [])
    return json.loads(text) if text else None


async def once(session, st):
    parent, msgs = mailbox()
    # IN
    for m in msgs:
        author = str(m.get("author", "?"))[:60]
        if m["id"] in st["in"] or author in TEAM or author.endswith("(via hub)"):
            continue
        await session.call_tool("post_message", {"author": f"{author} (external, via git)",
                                                 "text": "[EXTERNAL] " + str(m["text"])[:7900]})
        st["in"].append(m["id"]); save_state(st)
    # OUT
    board = tool_json(await session.call_tool("read_messages", {"since_id": 0})) or []
    out = [m for m in board if out_tag(m.get("text", ""))[0] and str(m["id"]) not in st["out"]]
    if out:
        for m in out:
            to, cut = out_tag(m["text"])
            msgs.append({"id": str(uuid.uuid4()), "author": f"{m['author']} (via hub)", "at": m["at"], "to": to.title(),
                         "text": m["text"][cut:].strip(), "hub_id": m["id"]})
        if push_mailbox(parent, msgs):
            st["out"].extend(str(m["id"]) for m in out); save_state(st)


async def main():
    if not TOKEN:
        sys.exit("TEAMHUB_TOKEN is not set.")
    st = load_state()
    while True:
        try:
            async with httpx2.AsyncClient(headers={"Authorization": f"Bearer {TOKEN}"}, timeout=30) as http:
                async with streamable_http_client(URL, http_client=http) as streams:
                    async with ClientSession(streams[0], streams[1]) as session:
                        await session.initialize()
                        while True:
                            await once(session, st)
                            if os.environ.get("BRIDGE_ONCE"):
                                return
                            await asyncio.sleep(EVERY)
        except Exception as e:   # reconnect on any failure; the bridge must never take anything down
            print(f"[bridge] {type(e).__name__}: {e}", file=sys.stderr, flush=True)
            if os.environ.get("BRIDGE_ONCE"):
                return
            await asyncio.sleep(EVERY)


if __name__ == "__main__":
    asyncio.run(main())
