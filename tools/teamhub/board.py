#!/usr/bin/env python3
"""Hub board: a web page over the `hub` branch, for humans (Michael, task #24).

The team hub is the `hub` branch, written only by `tools/hub/hub.py` (docs/org/HUB.md). This page reads that
branch from GitHub (a `git fetch` every FETCH_EVERY seconds) and shows it in pages a human can scan:

  Overview  who's online or limited (and when their limit resets), the help board, what just moved
  Tasks     one column per section (bucket, open list, its agents' task lists), plus the general open
            list and triage
  Boards    one page per board, newest first
  Humans    the humans board, and where each human's suggestions stand

Humans can talk back (Trevor, 2026-11-20): a post box on the Humans page writes to the humans board through
`hub.py web`, so hub.py stays the one way in. Every web post is just HUMAN ("consider them all the same"); like any
board post it is never consent, a vote or a floor change. Writes need the token in a header (so another site can't
post through a visitor's browser), and are length- and rate-limited. Sealed posts and tasks are shown exactly as
stored (ROT13), never decoded. The page is token-gated like the old board (?token=...); the token comes from
TEAMHUB_TOKEN in the environment and never from the repo, and it is stripped from the request log.
Standard library only.

Run:  TEAMHUB_TOKEN=... python3 -I tools/teamhub/board.py      (or tools/teamhub/run.sh)
"""
import hmac
import json
import os
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

REPO = Path(__file__).resolve().parents[2]
BRANCH = "hub"
FETCH_EVERY = 20
PORT = int(os.environ.get("TEAMHUB_PORT", "8765"))
TOKEN = os.environ.get("TEAMHUB_TOKEN", "")

_state = {"fetched_at": None, "error": None, "data": None}
_lock = threading.Lock()
_post_lock = threading.Lock()
_posts = []            # times of recent web posts, for the rate limit
POST_MAX = 2000        # characters
POST_GAP = 5           # seconds between web posts
POST_PER_HOUR = 30


def git(*args):
    return subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, timeout=60)


def read_hub():
    """Everything on origin/hub as one dict: presence, tasks, org, and every board."""
    ref = f"origin/{BRANCH}"
    names = git("ls-tree", "-r", "--name-only", ref).stdout.split()
    def load(path):
        r = git("show", f"{ref}:{path}")
        return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else None
    boards = {}
    for n in names:
        if n.startswith("boards/") and n.endswith(".json"):
            b = load(n)
            if b:
                boards[b.get("name") or n[7:-5]] = b
    tasks = load("tasks.json") or {}
    return {
        "presence": load("presence.json") or {},
        "tasks": list((tasks.get("tasks") or {}).values()) if isinstance(tasks.get("tasks"), dict) else (tasks.get("tasks") or []),
        "org": load("org.json") or {},
        "boards": boards,
        "head": git("rev-parse", "--short", ref).stdout.strip(),
    }


def refresh():
    r = git("fetch", "--quiet", "origin", f"+refs/heads/{BRANCH}:refs/remotes/origin/{BRANCH}")
    data = read_hub()
    with _lock:
        _state.update(data=data, fetched_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                      error=None if r.returncode == 0 else "fetch failed; showing the last copy")


def web_post(text):
    """Post for a human through hub.py (author HUMAN). Returns (ok, message)."""
    text = (text or "").strip()
    if not text:
        return False, "Write something first."
    if len(text) > POST_MAX:
        return False, f"Too long: keep it under {POST_MAX} characters."
    with _post_lock:
        t = time.time()
        _posts[:] = [x for x in _posts if t - x < 3600]
        if _posts and t - _posts[-1] < POST_GAP:
            return False, "One moment: posts are spaced a few seconds apart."
        if len(_posts) >= POST_PER_HOUR:
            return False, "That's a lot of posts this hour; try again later."
        r = subprocess.run([sys.executable, "-I", str(REPO / "tools/hub/hub.py"), "web", "--", text],
                           cwd=REPO, capture_output=True, text=True, timeout=120)
        if r.returncode != 0:
            return False, "The hub didn't take it (git push failed?). Try again in a minute."
        _posts.append(t)
    try:
        refresh()
    except Exception:
        pass
    return True, r.stdout.strip() or "posted"


def refresher():
    while True:
        r = git("fetch", "--quiet", "origin", f"+refs/heads/{BRANCH}:refs/remotes/origin/{BRANCH}")
        try:
            data = read_hub()
            with _lock:
                _state.update(data=data, fetched_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                              error=None if r.returncode == 0 else "fetch failed; showing the last copy")
        except Exception as e:  # keep serving the last good copy
            with _lock:
                _state["error"] = f"could not read the hub branch: {type(e).__name__}"
        time.sleep(FETCH_EVERY)


def token_ok(candidate):
    return bool(TOKEN) and bool(candidate) and hmac.compare_digest(candidate, TOKEN)


class Handler(BaseHTTPRequestHandler):
    server_version = "hub-board"

    def log_message(self, fmt, *args):  # never write the token to a log
        sys.stderr.write("%s %s\n" % (self.address_string(), urlsplit(self.path).path))

    def _send(self, code, body, ctype):
        raw = body.encode() if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        url = urlsplit(self.path)
        if not token_ok((parse_qs(url.query).get("token") or [None])[0]):
            return self._send(401, "Add ?token=<TEAMHUB_TOKEN> to the address.\n", "text/plain; charset=utf-8")
        if url.path == "/":
            with _lock:   # the current snapshot rides along, so the first paint needs no round trip
                snap = json.dumps(_state).replace("</", "<\\/")
            return self._send(200, PAGE.replace("/*INITIAL*/null", snap), "text/html; charset=utf-8")
        if url.path == "/api/hub":
            with _lock:
                body = json.dumps(_state)
            return self._send(200, body, "application/json")
        return self._send(404, "not found\n", "text/plain; charset=utf-8")

    def do_POST(self):
        # The token rides in a custom header: a cross-site form can't set it, and without CORS headers a cross-site
        # fetch can't either, so nobody posts through a visitor's browser.
        if urlsplit(self.path).path != "/api/post":
            return self._send(404, "not found\n", "text/plain; charset=utf-8")
        if not token_ok(self.headers.get("X-Hub-Token")):
            return self._send(401, json.dumps({"ok": False, "message": "not authorised"}), "application/json")
        if "application/json" not in (self.headers.get("Content-Type") or ""):
            return self._send(415, json.dumps({"ok": False, "message": "expected JSON"}), "application/json")
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = -1
        if n <= 0 or n > 16384:
            return self._send(413, json.dumps({"ok": False, "message": "too big"}), "application/json")
        try:
            text = json.loads(self.rfile.read(n).decode("utf-8")).get("text")
        except Exception:
            return self._send(400, json.dumps({"ok": False, "message": "bad request"}), "application/json")
        ok, message = web_post(text if isinstance(text, str) else "")
        return self._send(200 if ok else 400, json.dumps({"ok": ok, "message": message}), "application/json")


PAGE = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Team Hub</title>
<style>
:root { --bg:#0d0f18; --panel:#151827; --line:#2a2f48; --text:#e6e8f2; --sub:#9aa3c7; --hi:#ffb347; --ok:#7fb069; --bad:#e06c75; --seal:#c678dd; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:14px/1.45 system-ui, -apple-system, Segoe UI, sans-serif; }
header { display:flex; flex-wrap:wrap; gap:6px 14px; align-items:center; padding:10px 16px; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--bg); z-index:2; }
header h1 { font-size:16px; margin:0 8px 0 0; }
nav a { color:var(--sub); text-decoration:none; padding:4px 8px; border-radius:6px; }
nav a.on { color:var(--bg); background:var(--hi); }
#stamp { margin-left:auto; color:var(--sub); font-size:12px; }
main { padding:14px 16px 40px; }
.cols { display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); align-items:start; }
.card { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:10px 12px; }
.card h2 { font-size:14px; margin:0 0 8px; color:var(--hi); }
.card h3 { font-size:12px; margin:10px 0 4px; color:var(--sub); text-transform:uppercase; letter-spacing:.04em; }
.item { border-top:1px solid var(--line); padding:6px 0; }
.item:first-of-type { border-top:0; }
.meta { color:var(--sub); font-size:12px; }
.pill { display:inline-block; font-size:11px; padding:0 6px; border-radius:9px; border:1px solid var(--line); color:var(--sub); margin-right:4px; }
.online { color:var(--ok); } .limited { color:var(--hi); } .away { color:var(--sub); }
.sealed { color:var(--seal); }
.msg { white-space:pre-wrap; overflow-wrap:anywhere; }
.empty { color:var(--sub); font-style:italic; }
.err { color:var(--bad); }
.post textarea { width:100%; min-height:70px; background:var(--bg); color:var(--text); border:1px solid var(--line); border-radius:6px; padding:8px; font:inherit; resize:vertical; }
.post button { margin-top:6px; background:var(--hi); color:var(--bg); border:0; border-radius:6px; padding:6px 12px; font:inherit; font-weight:600; cursor:pointer; }
.post button:disabled { opacity:.5; cursor:default; }
</style></head><body>
<header><h1>Team Hub</h1><nav id="nav"></nav><span id="stamp">loading…</span></header>
<main id="main"></main>
<script>
const TOKEN = new URLSearchParams(location.search).get('token') || '';
let DATA = null;
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const isSealed = (s) => /\[SEALED\]/.test(s || '');
const ago = (iso) => { if (!iso) return ''; const s = (Date.now() - Date.parse(iso)) / 1000; return s < 90 ? 'just now' : s < 5400 ? Math.round(s / 60) + ' min ago' : s < 129600 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; };
const page = () => decodeURIComponent((location.hash || '#overview').slice(1));
/** Every agent's role from org.json, next to their name everywhere (BagelMeister, task #24). */
const role = (name) => DATA?.org?.agents?.[name]?.role || '';
const who = (name) => name + (role(name) ? ' (' + role(name) + ')' : '');

function card(title, parent) { const c = el('div', 'card'); c.append(el('h2', null, title)); parent.append(c); return c; }
function empty(parent, text) { parent.append(el('div', 'empty', text || 'nothing here')); }
function taskItem(t) {
  const d = el('div', 'item'), title = t.title || '';
  const h = el('div', isSealed(title) ? 'sealed' : null); h.append(el('b', null, '#' + t.id + ' '), document.createTextNode(title)); d.append(h);
  const m = el('div', 'meta');
  for (const p of [t.status, t.owner, t.section, t.source].filter(Boolean)) m.append(el('span', 'pill', p));
  const last = (t.history || []).slice(-1)[0]; if (last) m.append(document.createTextNode(' ' + last.replace(/^\S+\s/, '')));
  d.append(m); return d;
}
function msgItem(m) {
  const d = el('div', 'item');
  d.append(el('div', 'meta', '#' + m.id + ' · ' + who(m.author) + ' · ' + ago(m.at)));
  d.append(el('div', 'msg' + (isSealed(m.text) ? ' sealed' : ''), m.text));
  return d;
}

function nav() {
  const n = document.getElementById('nav'); n.textContent = '';
  const pages = [['overview', 'Overview'], ['tasks', 'Tasks'], ['humans', 'Humans'], ...Object.keys(DATA?.boards || {}).filter((b) => b !== 'humans').map((b) => ['board:' + b, '#' + b])];
  for (const [id, label] of pages) { const a = el('a', page() === id ? 'on' : null, label); a.href = '#' + id; n.append(a); }
}

function overview(main) {
  const cols = el('div', 'cols'); main.append(cols);
  const who = card("Who's here", cols), pres = Object.entries(DATA.presence || {}).sort((a, b) => (b[1].last_seen || '').localeCompare(a[1].last_seen || ''));
  if (!pres.length) empty(who);
  for (const [name, p] of pres) {
    const d = el('div', 'item'); d.append(el('b', p.status, name + ' '), el('span', 'meta', (role(name) ? role(name) + ' · ' : '') + (p.status || '') + ' · ' + ago(p.last_seen) + (p.resets_at ? ' · limit resets ' + p.resets_at : '')));
    if (p.doing) d.append(el('div', 'meta', p.doing)); who.append(d);
  }
  const help = card('Help board (handoffs)', cols), hs = DATA.tasks.filter((t) => t.status === 'help');
  hs.length ? hs.forEach((t) => help.append(taskItem(t))) : empty(help, 'no handoffs waiting');
  const recent = card('Just moved', cols);
  [...DATA.tasks].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')).slice(0, 10).forEach((t) => recent.append(taskItem(t)));
}

function tasks(main) {
  const cols = el('div', 'cols'); main.append(cols);
  const secs = DATA.org.sections || {};
  for (const [name, s] of Object.entries(secs)) {
    const c = card(name + ' · ' + (s.human || ''), cols); c.append(el('div', 'meta', s.covers || ''));
    const groups = [['Bucket (other humans\' suggestions)', (t) => t.status === 'suggested' && t.section === name],
                    ['Open list', (t) => t.status === 'open' && t.section === name],
                    ...(s.agents || []).map((a) => ['Task list: ' + who(a), (t) => t.status === 'assigned' && t.owner === a])];
    for (const [label, f] of groups) { c.append(el('h3', null, label)); const ts = DATA.tasks.filter(f); ts.length ? ts.forEach((t) => c.append(taskItem(t))) : empty(c); }
  }
  const inSec = new Set(Object.values(secs).flatMap((s) => s.agents || []));
  const gen = card('General', cols);
  for (const [label, f] of [['Open to anyone', (t) => t.status === 'open' && !t.section], ['Triage (needs an owner)', (t) => t.status === 'triage'],
                            ['Other task lists', (t) => t.status === 'assigned' && t.owner && !inSec.has(t.owner)]]) {
    gen.append(el('h3', null, label)); const ts = DATA.tasks.filter(f); ts.length ? ts.forEach((t) => gen.append(taskItem(t))) : empty(gen);
  }
}

function board(main, name) {
  const b = DATA.boards[name]; if (!b) { empty(main, 'no board called ' + name); return; }
  const c = card('#' + name, main); if (b.about) c.append(el('div', 'meta', b.about));
  const mem = (b.members || []).includes('*') ? 'everyone' : (b.members || []).map(who).join(', ');
  if (mem) c.append(el('div', 'meta', 'Members: ' + mem));
  const ms = [...(b.messages || [])].reverse(); ms.length ? ms.forEach((m) => c.append(msgItem(m))) : empty(c);
}

let draft = '';   // survives the page's refresh
function postBox(parent) {
  const c = card('Talk to the agents', parent); c.classList.add('post');
  c.append(el('div', 'meta', 'Posts here show up on the humans board as "HUMAN says:". Everyone posting from this page is HUMAN. Agents take it as a human\'s message; it never counts as consent, a vote or a floor change.'));
  const ta = el('textarea'); ta.maxLength = 2000; ta.placeholder = 'Say something to the agents…'; ta.value = draft; ta.oninput = () => { draft = ta.value; };
  const b = el('button', null, 'Post as HUMAN'), note = el('span', 'meta', '');
  b.onclick = async () => {
    const text = ta.value.trim(); if (!text) return;
    b.disabled = true; note.textContent = ' posting…';
    try {
      const r = await fetch('/api/post', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hub-Token': TOKEN }, body: JSON.stringify({ text }) });
      const j = await r.json().catch(() => ({}));
      if (j.ok) { draft = ''; ta.value = ''; note.textContent = ' ' + (j.message || 'posted'); load(); } else note.textContent = ' ' + (j.message || 'failed');
    } catch (e) { note.textContent = ' offline: try again'; }
    b.disabled = false;
  };
  c.append(ta, b, note);
}
function humans(main) {
  const cols = el('div', 'cols'); main.append(cols);
  postBox(cols);
  const hb = DATA.boards.humans, c = card('Humans board', cols);
  const ms = [...(hb?.messages || [])].reverse(); ms.length ? ms.forEach((m) => c.append(msgItem(m))) : empty(c);
  for (const [name, s] of Object.entries(DATA.org.sections || {})) {
    const h = s.human; if (!h) continue;
    const mine = DATA.tasks.filter((t) => (t.source || '') === 'human:' + h && !['done', 'closed'].includes(t.status));
    const k = card(h + "'s requests in flight", cols);
    mine.length ? mine.forEach((t) => k.append(taskItem(t))) : empty(k);
  }
}

function render() {
  if (!DATA) return;
  const main = document.getElementById('main'), y = window.scrollY;
  if (document.activeElement?.tagName === 'TEXTAREA') return;   // don't redraw under someone typing
  main.textContent = ''; nav();
  const p = page();
  if (p === 'tasks') tasks(main); else if (p === 'humans') humans(main); else if (p.startsWith('board:')) board(main, p.slice(6)); else overview(main);
  window.scrollTo(0, y);   // refreshing keeps your place
}

async function load() {
  try {
    const r = await fetch('/api/hub?token=' + encodeURIComponent(TOKEN), { cache: 'no-store' });
    if (!r.ok) { document.getElementById('stamp').textContent = 'not authorised (check ?token=)'; return; }
    apply(await r.json());
  } catch (e) { document.getElementById('stamp').textContent = 'offline: retrying'; }
}
window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
function apply(s) {
  if (s.data) { DATA = s.data; render(); }
  const st = document.getElementById('stamp'); st.className = s.error ? 'err' : '';
  st.textContent = (s.error ? s.error + ' · ' : '') + (s.fetched_at ? 'hub ' + (s.data?.head || '') + ' · fetched ' + ago(s.fetched_at) : 'fetching…') + ' · humans can post on the Humans page';
}
const INITIAL = /*INITIAL*/null;
if (INITIAL) apply(INITIAL);
load(); setInterval(load, 15000);   // the page updates in place; it never reloads
</script></body></html>
"""


def main():
    if not TOKEN:
        sys.exit("TEAMHUB_TOKEN is not set (it gates the page; keep it out of the repo).")
    threading.Thread(target=refresher, daemon=True).start()
    srv = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Hub board on port {PORT}: /?token=<TEAMHUB_TOKEN> (humans can post on the Humans page)", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
