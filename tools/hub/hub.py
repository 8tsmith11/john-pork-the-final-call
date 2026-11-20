#!/usr/bin/env python3
"""Team hub on git: boards, per-agent task lists, the open task list, the help board, and presence.

Everything lives on the `hub` branch of the repo (no server, so every agent with git can use it,
external contributors included). Each command fetches the branch, applies one change and pushes,
retrying when someone else pushed first. Rules for using it: docs/org/HUB.md.

Who you are: --as NAME, or $HUB_AGENT, or `git config hub.agent NAME` (set it once per checkout).

  python3 tools/hub/hub.py start                       # session start: presence + what's new + next
  python3 tools/hub/hub.py next                        # what to work on now (inbox > open > help)
  python3 tools/hub/hub.py status online --doing "cutscene engine"
  python3 tools/hub/hub.py status limited --resets +3h --doing "..."   # near your usage limit
  python3 tools/hub/hub.py who                         # who's online, limited, away
  python3 tools/hub/hub.py read [BOARD] [--last N]     # default: general
  python3 tools/hub/hub.py post BOARD "text" [--seal]  # --seal = ROT13 + [SEALED] tag
  python3 tools/hub/hub.py boards | board-new NAME --members a,b --about "..." | join NAME | leave NAME
  python3 tools/hub/hub.py inbox [AGENT] | open | help | show ID
  python3 tools/hub/hub.py add "title" [--details ..] (--to AGENT | --open) [--human NAME] [--seal]
  python3 tools/hub/hub.py assign ID AGENT | claim ID | done ID [--note ..] | drop ID
  python3 tools/hub/hub.py handoff ID --prompt "..."|--prompt-file F --resets TIME
  python3 tools/hub/hub.py take ID [--force]           # pick up a help-board handoff
  python3 tools/hub/hub.py human NAME "text"           # relay a human's message to the humans board

Sections (tools/hub/org.json): each human owns one section; its agents manage that code.
  python3 tools/hub/hub.py sections                    # who owns what, and bucket sizes
  python3 tools/hub/hub.py suggest SECTION "title" --human NAME [--details ..] [--mechanic]
        # the owner's own request → that section's open list; another human's → the section's bucket
  python3 tools/hub/hub.py bucket [SECTION]            # suggestions waiting on a section
  python3 tools/hub/hub.py accept ID [--to AGENT] [--owner-ok]   # section agent takes a suggestion
  python3 tools/hub/hub.py decline ID --note ".."      # section agent turns it down (with why)
  python3 tools/hub/hub.py unassign ID [--note ..]     # back to triage: needs an owner
  python3 tools/hub/hub.py refile ID SECTION [--mechanic] [--canon WHERE]  # organizer: move a task
        # into a section's bucket, or with --canon (already-agreed canon) straight to its open list
  python3 tools/hub/hub.py close ID --note ".."        # superseded / won't do
  python3 tools/hub/hub.py note ID "text"              # add a comment to a task's history
  python3 tools/hub/hub.py gag "title" --human NAME [--to AGENT] [--details ..]
        # easter egg / gag: sealed (ROT13), skips buckets and relays, goes straight to an implementer

Times are shown in Eastern time (stored in UTC). TIME for --resets: relative ("+2h", "+90m", "+1h30m"),
an Eastern clock time ("03:00", the next one), or ISO 8601 ("2026-11-20T03:00", Eastern unless it has a zone).
"""
import argparse
import codecs
import datetime as dt
import json
import os
import random
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BRANCH = os.environ.get("HUB_BRANCH", "hub")
REMOTE = os.environ.get("HUB_REMOTE", "origin")
UTC = dt.timezone.utc
AWAY_AFTER = dt.timedelta(minutes=45)        # no activity for this long → shown as away
HANDOFF_HOLD = (dt.timedelta(minutes=30), dt.timedelta(minutes=60))  # owner's window around reset
def load_org():
    p = REPO / "tools" / "hub" / "org.json"
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


ORG = load_org()
SECTIONS = ORG.get("sections", {})
AGENTS = ORG.get("agents", {})   # handle -> {role, section}: shown next to every name (Michael)


def role_of(name):
    return AGENTS.get(name, {}).get("role")


def label(name, role=None):
    """A name with its role, e.g. 'gonman (art, maps and the world)'."""
    role = role_of(name) or role
    return f"{name} ({role})" if role else f"{name} (no role yet: ask BagelMeister)"


def sections_of(agent):
    return [s for s, v in SECTIONS.items() if agent in v.get("agents", [])]


def section_of_human(name):
    for s, v in SECTIONS.items():
        if v.get("human", "").lower() == name.lower():
            return s
    return None


def check_section(s):
    if s not in SECTIONS:
        sys.exit(f"no section '{s}' (sections: {', '.join(SECTIONS) or 'none'}; see tools/hub/org.json)")
    return s


def seal(text):
    return "[SEALED] " + codecs.encode(text, "rot13") if text else text


def unseal(text):
    return codecs.decode(text[len("[SEALED] "):], "rot13") if text and text.startswith("[SEALED] ") else text


SYSTEM_BOARDS = {
    "general": "Everyone. Announcements, check-ins, cross-team questions.",
    "humans": "Messages from and to the humans (relayed by their agents).",
}


# ---------- git plumbing ----------

def git(*args, data=None, env=None, check=True):
    r = subprocess.run(["git", *args], cwd=REPO, input=data, text=True, capture_output=True,
                       env=env, encoding="utf-8")
    if check and r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)}: {r.stderr.strip()}")
    return r


def fetch():
    """Current tip of the hub branch, fetched by SHA so no local ref is written (safe when several
    agents share one checkout). None if the branch doesn't exist yet."""
    r = git("ls-remote", "--exit-code", REMOTE, f"refs/heads/{BRANCH}", check=False)
    if r.returncode == 2:
        return None
    if r.returncode != 0:
        raise RuntimeError(f"can't reach {REMOTE}: {r.stderr.strip()}")
    sha = r.stdout.split()[0]
    if git("cat-file", "-e", f"{sha}^{{commit}}", check=False).returncode != 0:
        git("fetch", "--quiet", "--no-tags", "--no-write-fetch-head", REMOTE, sha)
    return sha


def read_files(commit):
    files = {}
    if not commit:
        return files
    for line in git("ls-tree", "-r", "--name-only", commit).stdout.splitlines():
        files[line] = git("show", f"{commit}:{line}").stdout
    return files


def write_commit(parent, changed, message):
    """Commit `changed` (path -> text) on top of parent, leaving other files as they are."""
    fd, index = tempfile.mkstemp(prefix="hub-index-")
    os.close(fd)
    os.unlink(index)
    env = dict(os.environ, GIT_INDEX_FILE=index)
    try:
        if parent:
            git("read-tree", parent, env=env)
        for path, text in changed.items():
            blob = git("hash-object", "-w", "--stdin", data=text).stdout.strip()
            git("update-index", "--add", "--cacheinfo", f"100644,{blob},{path}", env=env)
        tree = git("write-tree", env=env).stdout.strip()
    finally:
        if os.path.exists(index):
            os.unlink(index)
    args = ["commit-tree", tree] + (["-p", parent] if parent else [])
    return git(*args, data=message + "\n").stdout.strip()


def transact(fn, message):
    """Fetch, let fn mutate the state, push. Retries if someone pushed in between."""
    for attempt in range(8):
        try:
            parent = fetch()
        except RuntimeError:
            if attempt == 7:
                raise
            time.sleep(0.5 + random.random() * attempt)
            continue
        st = State(read_files(parent))
        result = fn(st)
        changed = st.dump()
        if not changed:
            return result
        commit = write_commit(parent, changed, f"hub: {message}")
        r = git("push", "--quiet", REMOTE, f"{commit}:refs/heads/{BRANCH}", check=False)
        if r.returncode == 0:
            return result
        time.sleep(0.3 + random.random() * attempt)   # someone pushed first: re-read and re-apply
    raise RuntimeError("hub: push kept losing a race; try again")


def snapshot():
    return State(read_files(fetch()))


# ---------- state ----------

def now():
    return dt.datetime.now(UTC).replace(microsecond=0)


def iso(t):
    return t.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ") if t else None


# Times are stored in UTC and shown in Eastern time (Michael). Windows Pythons may lack the tz
# database, so fall back to a fixed EST offset there.
try:
    from zoneinfo import ZoneInfo
    EASTERN = ZoneInfo("America/New_York")
except Exception:   # noqa: BLE001 (no tzdata)
    EASTERN = dt.timezone(dt.timedelta(hours=-5), "EST")


def et(t):
    """A stored time (datetime or ISO string) as Eastern, e.g. '2026-11-19 7:21 PM EST'."""
    if isinstance(t, str):
        t = parse_iso(t)
    if not t:
        return ""
    e = t.astimezone(EASTERN)
    return f"{e:%Y-%m-%d} {e.strftime('%I:%M %p').lstrip('0')} {e.tzname()}"


def et_history(line):
    """History lines start with a UTC stamp; show it in Eastern."""
    stamp, _, rest = line.partition(" ")
    try:
        return f"{et(stamp)} {rest}"
    except ValueError:
        return line


def parse_iso(s):
    if not s:
        return None
    t = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
    return (t if t.tzinfo else t.replace(tzinfo=EASTERN)).astimezone(UTC)   # no zone given: Eastern


def parse_time(s):
    s = s.strip()
    m = re.fullmatch(r"\+(?:(\d+)h)?(?:(\d+)m)?", s)
    if m and (m.group(1) or m.group(2)):
        return now() + dt.timedelta(hours=int(m.group(1) or 0), minutes=int(m.group(2) or 0))
    m = re.fullmatch(r"(\d{1,2}):(\d{2})", s)
    if m:   # a clock time is Eastern, wherever the agent runs
        here = dt.datetime.now(EASTERN)
        t = here.replace(hour=int(m.group(1)), minute=int(m.group(2)), second=0, microsecond=0)
        if t <= here:
            t += dt.timedelta(days=1)
        return t.astimezone(UTC)
    try:
        return parse_iso(s)
    except ValueError:
        sys.exit(f"can't read time {s!r}: use +2h / +90m, HH:MM (Eastern), or ISO 8601")


class State:
    def __init__(self, files):
        self._orig = files
        load = lambda p, d: json.loads(files[p]) if p in files else d
        self.tasks = load("tasks.json", {"next_id": 1, "tasks": []})
        self.presence = load("presence.json", {})
        self.boards = {}
        for path, text in files.items():
            m = re.fullmatch(r"boards/([a-z0-9][a-z0-9-]*)\.json", path)
            if m:
                self.boards[m.group(1)] = json.loads(text)
        for name, about in SYSTEM_BOARDS.items():
            self.boards.setdefault(name, {"name": name, "about": about, "members": ["*"],
                                          "created_by": "hub", "next_id": 1, "messages": []})

    def dump(self):
        out = {"tasks.json": self.tasks, "presence.json": self.presence, "org.json": ORG}   # org: roles for any board viewer
        out.update({f"boards/{n}.json": b for n, b in self.boards.items()})
        text = {p: json.dumps(v, indent=1, ensure_ascii=False) + "\n" for p, v in out.items()}
        changed = {p: t for p, t in text.items() if self._orig.get(p) != t}
        if changed:
            changed["README.md"] = dashboard(self)
        return changed

    # tasks
    def task(self, tid):
        for t in self.tasks["tasks"]:
            if t["id"] == tid:
                return t
        sys.exit(f"no task #{tid}")

    def new_task(self, **kw):
        t = {"id": self.tasks["next_id"], "created_at": iso(now()), "updated_at": iso(now()),
             "history": [], **kw}
        self.tasks["next_id"] += 1
        self.tasks["tasks"].append(t)
        return t

    def touch(self, who, **presence):
        p = self.presence.setdefault(who, {"status": "online"})
        p["last_seen"] = iso(now())
        p.update({k: v for k, v in presence.items() if v is not None})

    def board(self, name):
        if name not in self.boards:
            sys.exit(f"no board '{name}' (see: hub.py boards)")
        return self.boards[name]


def log(t, who, what):
    t["updated_at"] = iso(now())
    t["history"].append(f"{iso(now())} {who}: {what}")


# ---------- views ----------

def status_of(p):
    """online / away (no activity for a while) / limited / offline; 'not seen' if never on the hub."""
    if not p:
        return "not seen"
    seen = parse_iso(p.get("last_seen"))
    status = p.get("status", "?")
    return "away" if status == "online" and seen and now() - seen > AWAY_AFTER else status


def presence_line(who, p):
    seen = parse_iso(p.get("last_seen"))
    status = status_of(p)
    bits = [f"{who:<13} {status:<8} [{role_of(who) or 'no role yet'}]"]
    if seen:
        bits.append(f"seen {et(seen)}")
    if p.get("resets_at"):
        bits.append(f"limit resets {et(p['resets_at'])}")
    if p.get("doing"):
        bits.append(f"doing: {p['doing']}")
    return "  ".join(bits)


def task_line(t):
    who = t.get("owner") or "-"
    src = f" ({t['source']})" if t.get("source") else ""
    sec = f"{{{t['section']}}} " if t.get("section") else ""
    extra = f"  resets {et(t['resets_at'])}" if t.get("status") == "help" and t.get("resets_at") else ""
    if t.get("status") == "suggested" and t.get("mechanic"):
        extra += f"  ← mechanic: needs {SECTIONS.get(t.get('section'), {}).get('human', 'the owner')}'s yes"
    return f"#{t['id']:<4} [{t['status']:<9}] {who:<14} {sec}{t['title']}{src}{extra}"


def inbox_of(st, who):
    return [t for t in st.tasks["tasks"] if t.get("owner") == who and t["status"] in ("assigned", "claimed")]


def open_list(st, section=None):
    """section=None: the general open list (no section). Otherwise that section's open list."""
    return [t for t in st.tasks["tasks"] if t["status"] == "open" and t.get("section") == section]


def bucket_of(st, section):
    return [t for t in st.tasks["tasks"] if t["status"] == "suggested" and t.get("section") == section]


def triage_list(st):
    return [t for t in st.tasks["tasks"] if t["status"] == "triage"]


def help_list(st):
    return [t for t in st.tasks["tasks"] if t["status"] == "help"]


def can_take(t, who):
    """A handoff is held for its owner around their reset time."""
    if t.get("handed_off_by") == who:
        return True, ""
    r = parse_iso(t.get("resets_at"))
    if not r:
        return True, ""
    lo, hi = r - HANDOFF_HOLD[0], r + HANDOFF_HOLD[1]
    if lo <= now() <= hi:
        return False, f"held for {t['handed_off_by']} (limit resets {et(r)}); free after {et(hi)}"
    return True, ""


STATUS_ORDER = {"online": 0, "limited": 1, "away": 2, "offline": 3, "not seen": 4}


def presence_table(st):
    """Everyone with a role, plus anyone else who has checked in: one row each, for humans (Michael)."""
    cell = lambda v: str(v).replace("|", "\\|").replace("\n", " ") if v else "-"
    names = list(AGENTS) + [w for w in st.presence if w not in AGENTS]
    rows = sorted(names, key=lambda w: (STATUS_ORDER.get(status_of(st.presence.get(w)), 5), w.lower()))
    out = ["| Agent | Role | Status | Last seen (ET) | Limit resets (ET) | Working on |", "|---|---|---|---|---|---|"]
    for w in rows:
        p = st.presence.get(w) or {}
        out.append(f"| {cell(w)} | {cell(role_of(w) or 'no role yet')} | {cell(status_of(st.presence.get(w)))} | "
                   f"{cell(et(p.get('last_seen')))} | {cell(et(p.get('resets_at')))} | {cell(p.get('doing'))} |")
    return out


def dashboard(st):
    L = ["# Team hub", "",
         "_Generated by `tools/hub/hub.py` on every change. Don't edit by hand. Rules: `docs/org/HUB.md` on main. Times are Eastern._", "",
         "## Roles (every agent, and the section it works in)", "", "| Agent | Role | Section |", "|---|---|---|"]
    for a, v in AGENTS.items():
        sec = v.get("section")
        where = f"{sec} ({SECTIONS[sec]['human']}'s)" if sec in SECTIONS else "-"
        L.append(f"| {a} | {v.get('role', '')} | {where} |")
    L += ["", "## Who's here", ""] + presence_table(st)
    L += ["", "## Help board (handoffs from agents at their usage limit)", "```"]
    L += [task_line(t) for t in help_list(st)] or ["(empty)"]
    L += ["```", "", "## Sections (each human owns one; its agents manage that code)", ""]
    for s, v in SECTIONS.items():
        L.append(f"- **{s}**: {v.get('human')}'s, managed by {', '.join(v.get('agents', []))}. {v.get('covers', '')}")
    L += ["", "## Suggestion buckets (other humans' ideas, waiting on the section's agents)", "```"]
    bk = [t for s in SECTIONS for t in bucket_of(st, s)]
    L += [task_line(t) for t in bk] or ["(empty)"]
    L += ["```", "", "## Section open lists (the owner's own requests; that section's agents claim)", "```"]
    so = [t for s in SECTIONS for t in open_list(st, s)]
    L += [task_line(t) for t in so] or ["(empty)"]
    L += ["```", "", "## Open task list (anyone may claim)", "```"]
    L += [task_line(t) for t in open_list(st)] or ["(empty)"]
    L += ["```", "", "## Needs an owner (triage: BagelMeister assigns)", "```"]
    L += [task_line(t) for t in triage_list(st)] or ["(empty)"]
    L += ["```", "", "## Agent task lists", "```"]
    owned = [t for t in st.tasks["tasks"] if t["status"] in ("assigned", "claimed")]
    L += [task_line(t) for t in sorted(owned, key=lambda t: (t["owner"], t["id"]))] or ["(empty)"]
    L += ["```", "", "## Boards", ""]
    for n, b in sorted(st.boards.items()):
        mem = "everyone" if "*" in b["members"] else ", ".join(label(m) for m in b["members"])
        L.append(f"- **{n}**: {b.get('about', '')} ({len(b['messages'])} posts). Members: {mem}")
    for n in ("humans", "general"):
        L += ["", f"## Latest on {n}", ""]
        for m in st.boards[n]["messages"][-8:]:
            first = m["text"].splitlines()[0][:200] if m["text"] else ""
            L.append(f"- #{m['id']} {et(m['at'])} **{label(m['author'], m.get('role'))}**: {first}")
    return "\n".join(L) + "\n"


# ---------- commands ----------

def me(args):
    who = args.as_ or os.environ.get("HUB_AGENT") or git("config", "--get", "hub.agent", check=False).stdout.strip()
    if not who:
        sys.exit("who are you? pass --as NAME, set HUB_AGENT, or run: git config hub.agent NAME")
    return who


def text_arg(args):
    text = args.text
    if text == "-":
        text = sys.stdin.read()
    text = text.strip()
    if not text:
        sys.exit("empty text")
    if getattr(args, "seal", False):
        text = "[SEALED] " + codecs.encode(text, "rot13")
    return text


def cmd_post(args):
    who, text = me(args), text_arg(args)

    def f(st):
        b = st.board(args.board)
        if "*" not in b["members"] and who not in b["members"]:
            sys.exit(f"you're not on '{args.board}'; join it first (hub.py join {args.board})")
        m = {"id": b["next_id"], "author": who, "role": role_of(who), "at": iso(now()), "text": text}
        b["next_id"] += 1
        b["messages"].append(m)
        st.touch(who)
        return m
    m = transact(f, f"{who} posts on {args.board}")
    print(f"posted #{m['id']} on {args.board}")


def cmd_human(args):
    args.board, args.text = "humans", f"[HUMAN] {args.name} says: {args.text}"
    cmd_post(args)


def cmd_read(args):
    st = snapshot()
    b = st.board(args.board)
    msgs = [m for m in b["messages"] if m["id"] > args.since]
    if not args.since:
        msgs = msgs[-args.last:]
    for m in msgs:
        print(f"--- #{m['id']} {et(m['at'])} {label(m['author'], m.get('role'))}\n{m['text']}\n")
    if not msgs:
        print(f"(nothing new on {args.board})")


def cmd_boards(args):
    st = snapshot()
    who = args.as_ or os.environ.get("HUB_AGENT") or git("config", "--get", "hub.agent", check=False).stdout.strip()
    for n, b in sorted(st.boards.items()):
        mem = "everyone" if "*" in b["members"] else ", ".join(label(m) for m in b["members"])
        mark = "*" if ("*" in b["members"] or who in b["members"]) else " "
        last = b["messages"][-1]["id"] if b["messages"] else 0
        print(f"{mark} {n:<20} last #{last:<4} [{mem}]  {b.get('about', '')}")


def cmd_board_new(args):
    who = me(args)
    name = args.name.lower()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,40}", name):
        sys.exit("board names: lowercase letters, digits and dashes")
    members = sorted({m.strip() for m in args.members.split(",") if m.strip()} | {who})

    def f(st):
        if name in st.boards:
            sys.exit(f"board '{name}' exists")
        st.boards[name] = {"name": name, "about": args.about, "members": members,
                           "created_by": who, "next_id": 1, "messages": []}
        st.touch(who)
    transact(f, f"{who} opens board {name}")
    print(f"board '{name}' created for {', '.join(members)}")


def cmd_join(args, leave=False):
    who = me(args)

    def f(st):
        b = st.board(args.name)
        if "*" in b["members"]:
            sys.exit("that board is open to everyone")
        if leave:
            b["members"] = [m for m in b["members"] if m != who]
        elif who not in b["members"]:
            b["members"].append(who)
        st.touch(who)
    transact(f, f"{who} {'leaves' if leave else 'joins'} {args.name}")
    print("ok")


def cmd_status(args):
    who = me(args)
    resets = iso(parse_time(args.resets)) if args.resets else None
    if args.state == "limited" and not resets:
        sys.exit("status limited needs --resets TIME (when your usage limit resets)")

    def f(st):
        st.touch(who, status=args.state, doing=args.doing)
        p = st.presence[who]
        if resets:
            p["resets_at"] = resets
        elif args.state == "online":
            p.pop("resets_at", None)
    transact(f, f"{who} is {args.state}")
    print(presence_line(who, snapshot().presence[who]))


def cmd_who(args):
    st = snapshot()
    for w, p in sorted(st.presence.items()):
        print(presence_line(w, p))
    for a in AGENTS:
        if a not in st.presence:
            print(f"{a:<13} {'not seen':<8} [{role_of(a)}]")


def show_list(title, items):
    print(f"== {title}")
    for t in items:
        print(task_line(t))
    if not items:
        print("(empty)")


def cmd_inbox(args):
    who = args.agent or me(args)
    show_list(f"{who}'s task list", inbox_of(snapshot(), who))


def cmd_open(args):
    show_list("open task list", open_list(snapshot()))


def cmd_help(args):
    show_list("help board", help_list(snapshot()))


def cmd_show(args):
    t = snapshot().task(args.id)
    if args.unseal:
        t = {**t, "title": unseal(t["title"]), "details": unseal(t.get("details", ""))}
    print(task_line(t))
    for k in ("details", "handoff", "note"):
        if t.get(k):
            print(f"\n{k}:\n{t[k]}")
    if t.get("kind") == "gag" and not args.unseal:
        print("\n(sealed gag: agents read it with hub.py show ID --unseal; never show it to another human)")
    print("\nhistory:\n" + "\n".join(et_history(h) for h in t["history"]))


def cmd_next(args, st=None):
    who = me(args)
    st = st or snapshot()
    mine = inbox_of(st, who)
    if mine:
        show_list(f"1. your task list ({who}): work these first", mine)
        return
    for s in sections_of(who):
        bk = bucket_of(st, s)
        if bk:
            show_list(f"2. suggestions for your section '{s}': accept, decline, or relay mechanics to "
                      f"{SECTIONS[s]['human']} first (docs/org/HUB.md)", bk)
            return
    for s in sections_of(who):
        so = open_list(st, s)
        if so:
            show_list(f"3. your section's open list ('{s}'): claim one (hub.py claim ID)", so)
            return
    opn = open_list(st)
    if opn:
        show_list("4. claim one from the general open list (hub.py claim ID)", opn)
        return
    hl = [t for t in help_list(st) if can_take(t, who)[0]]
    if hl:
        show_list("5. nothing open: pick up a handoff from the help board (hub.py take ID)", hl)
        return
    print("Nothing queued. Ask a human what they want, check `hub.py read general`, or offer help.")


def cmd_sections(args):
    st = snapshot()
    for s, v in SECTIONS.items():
        print(f"{s:<8} {v.get('human'):<8} agents: {', '.join(v.get('agents', [])):<24} "
              f"bucket {len(bucket_of(st, s))}, open {len(open_list(st, s))}  ({v.get('covers', '')})")


def cmd_bucket(args):
    who = me(args)
    secs = [check_section(args.section)] if args.section else (sections_of(who) or list(SECTIONS))
    st = snapshot()
    for s in secs:
        show_list(f"bucket: {s} ({SECTIONS[s]['human']}'s section)", bucket_of(st, s))


def cmd_suggest(args):
    who = me(args)
    sec = check_section(args.section)
    owner = SECTIONS[sec]["human"]
    own = args.human.lower() == owner.lower()

    def f(st):
        t = st.new_task(title=args.title, details=args.details or "", source=f"human:{args.human}",
                        section=sec, mechanic=bool(args.mechanic), owner=None,
                        status="open" if own else "suggested")
        log(t, who, f"filed for section {sec} " + ("(the owner's own request)" if own else f"(suggestion from {args.human}; {owner} owns {sec})"))
        st.touch(who)
        return t
    t = transact(f, f"{who} files a suggestion for {sec}")
    print(task_line(t))
    if not own:
        print(f"In {sec}'s bucket. Its agents ({', '.join(SECTIONS[sec]['agents'])}) decide"
              + (f"; as a mechanic it needs {owner}'s yes first." if args.mechanic else "."))


def cmd_accept(args):
    def fn(st, t, who):
        if t["status"] != "suggested":
            sys.exit(f"#{t['id']} isn't a suggestion waiting in a bucket")
        sec = t.get("section")
        if who not in SECTIONS.get(sec, {}).get("agents", []):
            sys.exit(f"only {sec}'s agents ({', '.join(SECTIONS[sec]['agents'])}) accept its suggestions")
        if t.get("mechanic") and not args.owner_ok:
            sys.exit(f"a mechanic needs {SECTIONS[sec]['human']}'s yes: relay it to them, then accept --owner-ok")
        t.update(status="assigned" if args.to else "open", owner=args.to or None)
        log(t, who, "accepted" + (f" with {SECTIONS[sec]['human']}'s yes" if args.owner_ok else "")
            + (f", for {args.to}" if args.to else ", onto the section's open list"))
    mutate(args, "accepts", fn)


def cmd_decline(args):
    def fn(st, t, who):
        sec = t.get("section")
        if t["status"] != "suggested" or who not in SECTIONS.get(sec, {}).get("agents", []):
            sys.exit("only the section's agents decline a suggestion in their bucket")
        t.update(status="declined", note=args.note)
        log(t, who, f"declined: {args.note}")
    mutate(args, "declines", fn)


def cmd_unassign(args):
    def fn(st, t, who):
        if t["status"] == "done":
            sys.exit("already done")
        t.update(status="triage", owner=None)
        log(t, who, "unassigned, back to triage" + (f": {args.note}" if args.note else ""))
    mutate(args, "unassigns", fn)


def cmd_refile(args):
    sec = check_section(args.section)

    def fn(st, t, who):
        if t["status"] in ("done", "closed", "declined"):
            sys.exit(f"already {t['status']}")
        human = (t.get("source") or "").removeprefix("human:")
        own = human.lower() == SECTIONS[sec]["human"].lower()
        direct = own or args.canon   # canon work is already agreed: no bucket decision needed
        t.update(section=sec, owner=None, status="open" if direct else "suggested",
                 mechanic=bool(args.mechanic or t.get("mechanic")) and not args.canon)
        why = "(already canon)" if args.canon else "(owner's own request)" if own else "bucket"
        log(t, who, f"refiled to section {sec} {why}" + (f": {args.canon}" if args.canon else ""))
    mutate(args, "refiles", fn)


def cmd_close(args):
    def fn(st, t, who):
        t.update(status="closed", note=args.note)
        log(t, who, f"closed: {args.note}")
    mutate(args, "closes", fn)


def cmd_note(args):
    def fn(st, t, who):
        log(t, who, f"note: {args.text}")
    mutate(args, "notes", fn)


def cmd_gag(args):
    who = me(args)
    to = args.to or who

    def f(st):
        t = st.new_task(title=seal(args.title), details=seal(args.details or ""), kind="gag",
                        source=f"human:{args.human}", status="assigned", owner=to)
        log(t, who, f"sealed gag for {to}: check P-001, P-002, P-003 and the floors, then build it")
        st.touch(who)
        return t
    t = transact(f, f"{who} files a sealed task")
    print(task_line(t))


def cmd_start(args):
    who = me(args)
    transact(lambda st: st.touch(who, status="online", doing=args.doing), f"{who} starts a session")
    st = snapshot()
    print("== who's here")
    for w, p in sorted(st.presence.items()):
        print(presence_line(w, p))
    for n, b in sorted(st.boards.items()):
        if "*" in b["members"] or who in b["members"]:
            print(f"\n== {n}: last 5 (hub.py read {n} --last 20 for more)")
            for m in b["messages"][-5:]:
                print(f"#{m['id']} {et(m['at'])} {label(m['author'], m.get('role'))}: {m['text'].splitlines()[0][:160]}")
    print()
    if not role_of(who):
        print(f"!! '{who}' has no role in tools/hub/org.json. Ask BagelMeister for one (or check your handle).\n")
    cmd_next(args, st)


def cmd_add(args):
    who = me(args)
    if bool(args.to) == bool(args.open):
        sys.exit("say where it goes: --to AGENT (their task list) or --open (the open task list)")
    source = f"human:{args.human}" if args.human else f"agent:{who}"

    def f(st):
        title, details = (seal(args.title), seal(args.details or "")) if args.seal else (args.title, args.details or "")
        t = st.new_task(title=title, details=details, source=source,
                        status="assigned" if args.to else "open", owner=args.to or None)
        log(t, who, f"added ({'for ' + args.to if args.to else 'open list'})")
        st.touch(who)
        return t
    t = transact(f, f"{who} adds task")
    print(task_line(t))


def mutate(args, verb, fn):
    who = me(args)

    def f(st):
        t = st.task(args.id)
        fn(st, t, who)
        st.touch(who)
        return t
    t = transact(f, f"{who} {verb} #{args.id}")
    print(task_line(t))


def cmd_assign(args):
    def fn(st, t, who):
        t.update(owner=args.agent, status="assigned")
        log(t, who, f"assigned to {args.agent}")
    mutate(args, "assigns", fn)


def cmd_claim(args):
    def fn(st, t, who):
        if t["status"] == "help":
            sys.exit("that's a handoff: use hub.py take ID")
        if t.get("owner") and t["owner"] != who and t["status"] != "open":
            sys.exit(f"#{t['id']} belongs to {t['owner']}; ask them or the task organizer")
        if t["status"] in ("done", "declined"):
            sys.exit(f"already {t['status']}")
        if t["status"] == "suggested":
            sys.exit("that's a suggestion in a section's bucket: the section's agents accept it first")
        sec = t.get("section")
        if sec and who not in SECTIONS.get(sec, {}).get("agents", []) and not args.force:
            sys.exit(f"#{t['id']} is in {sec} ({SECTIONS[sec]['human']}'s section, managed by "
                     f"{', '.join(SECTIONS[sec]['agents'])}); ask them, or --force if a human asked you")
        t.update(owner=who, status="claimed")
        log(t, who, "claimed")
    mutate(args, "claims", fn)


def cmd_done(args):
    def fn(st, t, who):
        t.update(status="done", note=args.note or t.get("note", ""))
        t.pop("resets_at", None)
        log(t, who, "done" + (f": {args.note}" if args.note else ""))
    mutate(args, "finishes", fn)


def cmd_drop(args):
    def fn(st, t, who):
        if t.get("owner") != who:
            sys.exit("only the owner can drop a task back to the open list")
        t.update(status="open", owner=None)
        log(t, who, "dropped back to the open list")
    mutate(args, "drops", fn)


def cmd_handoff(args):
    prompt = Path(args.prompt_file).read_text(encoding="utf-8") if args.prompt_file else args.prompt
    if not prompt or len(prompt.strip()) < 80:
        sys.exit("a handoff needs a real prompt (--prompt or --prompt-file): goal, branch, state, next steps, files")
    resets = iso(parse_time(args.resets))

    def fn(st, t, who):
        if t.get("owner") not in (None, who):
            sys.exit(f"#{t['id']} belongs to {t['owner']}")
        t.update(status="help", handoff=prompt.strip(), resets_at=resets, handed_off_by=who, owner=who)
        log(t, who, f"handed off to the help board; limit resets {resets}")
        st.touch(who, status="limited", resets_at=resets)
    mutate(args, "hands off", fn)


def cmd_take(args):
    def fn(st, t, who):
        if t["status"] != "help":
            sys.exit(f"#{t['id']} isn't on the help board")
        ok, why = can_take(t, who)
        if not ok and not args.force:
            sys.exit(why)
        prev = t.get("handed_off_by")
        t.update(status="claimed", owner=who)
        t.pop("resets_at", None)
        log(t, who, "picked up its own handoff" if prev == who else f"took over from {prev}")
        if prev == who:
            st.presence.get(who, {}).pop("resets_at", None)
            st.touch(who, status="online")
    mutate(args, "takes", fn)
    print("Read the handoff: hub.py show", args.id)


def main(argv=None):
    p = argparse.ArgumentParser(prog="hub.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--as", dest="as_", help="your agent name (else $HUB_AGENT or git config hub.agent)")
    sub = p.add_subparsers(dest="cmd", required=True)

    def add(name, fn, *spec):
        sp = sub.add_parser(name)
        sp.add_argument("--as", dest="as_", help=argparse.SUPPRESS, default=argparse.SUPPRESS)
        for a, kw in spec:
            sp.add_argument(*a, **kw)
        sp.set_defaults(fn=fn)

    add("start", cmd_start, (["--doing"], {}))
    add("next", cmd_next)
    add("status", cmd_status, (["state"], {"choices": ["online", "limited", "offline"]}),
        (["--doing"], {}), (["--resets"], {}))
    add("who", cmd_who)
    add("read", cmd_read, (["board"], {"nargs": "?", "default": "general"}),
        (["--last"], {"type": int, "default": 20}), (["--since"], {"type": int, "default": 0}))
    add("post", cmd_post, (["board"], {}), (["text"], {}), (["--seal"], {"action": "store_true"}))
    add("human", cmd_human, (["name"], {}), (["text"], {}))
    add("boards", cmd_boards)
    add("board-new", cmd_board_new, (["name"], {}), (["--members"], {"required": True}),
        (["--about"], {"required": True}))
    add("join", cmd_join, (["name"], {}))
    add("leave", lambda a: cmd_join(a, leave=True), (["name"], {}))
    add("inbox", cmd_inbox, (["agent"], {"nargs": "?"}))
    add("open", cmd_open)
    add("help", cmd_help)
    add("show", cmd_show, (["id"], {"type": int}), (["--unseal"], {"action": "store_true"}))
    add("sections", cmd_sections)
    add("bucket", cmd_bucket, (["section"], {"nargs": "?"}))
    add("suggest", cmd_suggest, (["section"], {}), (["title"], {}), (["--human"], {"required": True}),
        (["--details"], {}), (["--mechanic"], {"action": "store_true"}))
    add("accept", cmd_accept, (["id"], {"type": int}), (["--to"], {}), (["--owner-ok"], {"action": "store_true"}))
    add("decline", cmd_decline, (["id"], {"type": int}), (["--note"], {"required": True}))
    add("unassign", cmd_unassign, (["id"], {"type": int}), (["--note"], {}))
    add("refile", cmd_refile, (["id"], {"type": int}), (["section"], {}), (["--mechanic"], {"action": "store_true"}),
        (["--canon"], {"metavar": "WHERE", "help": "already canon (cite where): goes to the section's open list, not its bucket"}))
    add("close", cmd_close, (["id"], {"type": int}), (["--note"], {"required": True}))
    add("note", cmd_note, (["id"], {"type": int}), (["text"], {}))
    add("gag", cmd_gag, (["title"], {}), (["--human"], {"required": True}), (["--to"], {}), (["--details"], {}))
    add("add", cmd_add, (["title"], {}), (["--details"], {}), (["--to"], {}),
        (["--open"], {"action": "store_true"}), (["--human"], {}), (["--seal"], {"action": "store_true"}))
    add("assign", cmd_assign, (["id"], {"type": int}), (["agent"], {}))
    add("claim", cmd_claim, (["id"], {"type": int}), (["--force"], {"action": "store_true"}))
    add("done", cmd_done, (["id"], {"type": int}), (["--note"], {}))
    add("drop", cmd_drop, (["id"], {"type": int}))
    add("handoff", cmd_handoff, (["id"], {"type": int}), (["--prompt"], {}), (["--prompt-file"], {}),
        (["--resets"], {"required": True}))
    add("take", cmd_take, (["id"], {"type": int}), (["--force"], {"action": "store_true"}))
    args = p.parse_args(argv)
    if not hasattr(args, "as_"):
        args.as_ = None
    try:
        args.fn(args)
    except RuntimeError as e:
        sys.exit(str(e))


if __name__ == "__main__":
    main()
