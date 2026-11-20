#!/usr/bin/env python3
"""Self-test for tools/hub/hub.py: runs the real CLI against a throwaway bare repo (no network).

  python3 -I tools/hub/test_hub.py      # prints each check; exits non-zero on the first failure

It covers the rules in docs/org/HUB.md: boards and sub-board membership, roles on every name, the
work order of `next`, section buckets (a mechanic needs the owner's yes), sealed gags, the help
board's hold around a reset time, triage and refile, and many agents posting at once.
"""
import codecs
import json
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
TMP = Path(tempfile.mkdtemp(prefix="hubtest-"))
CLONES = []


def sh(*args, cwd=None, check=True):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise AssertionError(f"{' '.join(map(str, args))} failed:\n{r.stdout}{r.stderr}")
    return r


def setup():
    sh("git", "init", "-q", "--bare", str(TMP / "remote.git"))
    for name in ("a", "b"):
        d = TMP / name
        sh("git", "init", "-q", str(d))
        sh("git", "remote", "add", "origin", str(TMP / "remote.git"), cwd=d)
        (d / "tools" / "hub").mkdir(parents=True)
        shutil.copy(HERE / "hub.py", d / "tools" / "hub" / "hub.py")
        shutil.copy(HERE / "org.json", d / "tools" / "hub" / "org.json")
        CLONES.append(d)


def hub(who, *args, clone=0, ok=True):
    r = sh(sys.executable, "-I", str(CLONES[clone] / "tools" / "hub" / "hub.py"), "--as", who, *args, check=False)
    out = r.stdout + r.stderr
    if ok and r.returncode != 0:
        raise AssertionError(f"hub {who} {' '.join(args)} failed:\n{out}")
    if not ok and r.returncode == 0:
        raise AssertionError(f"hub {who} {' '.join(args)} should have been refused:\n{out}")
    return out


def state(path):
    return json.loads(sh("git", "--git-dir", str(TMP / "remote.git"), "show", f"hub:{path}").stdout)


def check(name, cond, detail=""):
    if not cond:
        raise AssertionError(f"FAIL: {name} {detail}")
    print(f"ok  {name}")


def main():
    setup()
    org = json.loads((HERE / "org.json").read_text())
    roles = org["agents"]

    # Boards and roles
    hub("BagelMeister", "post", "general", "hello")
    out = hub("gonman", "read", "general", clone=1)
    check("a post reaches another checkout", "hello" in out)
    check("the author's role shows on the post", f"BagelMeister ({roles['BagelMeister']['role']})" in out)
    check("posts keep the author's role", state("boards/general.json")["messages"][0]["role"] == roles["BagelMeister"]["role"])
    hub("someone", "post", "general", "hi")
    check("an agent without a role is labelled", "no role yet" in hub("gonman", "read", "general"))
    check("the hub branch carries org.json", state("org.json")["agents"].keys() == roles.keys())
    readme = sh("git", "--git-dir", str(TMP / "remote.git"), "show", "hub:README.md").stdout
    check("who's here is a table, with every role and the unseen agents",
          "| Agent | Role | Status | Last seen (ET) |" in readme and "| tts | " in readme and "not seen" in readme and "| BagelMeister |" in readme)

    hub("BagelMeister", "board-new", "story", "--members", "gonman,LoreKeeper", "--about", "story")
    hub("trevor", "post", "story", "x", ok=False)
    check("a sub-board refuses non-members", True)
    hub("gonman", "post", "story", "secret", "--seal")
    check("--seal stores ROT13", state("boards/story.json")["messages"][0]["text"] == "[SEALED] " + codecs.encode("secret", "rot13"))

    # Sections and buckets
    hub("BagelMeister", "suggest", "world", "a park", "--human", "Michael")
    hub("BagelMeister", "suggest", "systems", "double jump", "--human", "Michael", "--mechanic")
    hub("trevor", "suggest", "systems", "parry tweak", "--human", "Trevor")
    t = {x["id"]: x for x in state("tasks.json")["tasks"]}
    check("another human's idea lands in the section's bucket", t[1]["status"] == "suggested" and t[1]["section"] == "world")
    check("the owner's own request goes to the section's open list", t[3]["status"] == "open")
    check("next shows the bucket to the section's agent", "a park" in hub("gonman", "next"))
    hub("BagelMeister", "accept", "1", ok=False)
    check("only the section's agents accept", True)
    hub("JohnPork", "accept", "2", ok=False)
    check("a mechanic needs the owner's yes", True)
    hub("JohnPork", "accept", "2", "--owner-ok", "--to", "JohnPork")
    hub("BagelMeister", "claim", "3", ok=False)
    check("a section's open task is for that section's agents", True)
    hub("trevor", "claim", "3")

    # Gags
    hub("BagelMeister", "gag", "a secret dance", "--human", "Michael", "--details", "press nothing")
    g = [x for x in state("tasks.json")["tasks"] if x.get("kind") == "gag"][0]
    check("a gag is sealed in storage", g["title"].startswith("[SEALED] ") and "secret" not in g["title"])
    check("a gag never shows in plain text on the dashboard",
          "secret dance" not in sh("git", "--git-dir", str(TMP / "remote.git"), "show", "hub:README.md").stdout)
    check("agents can read a gag", "a secret dance" in hub("BagelMeister", "show", str(g["id"]), "--unseal"))

    # Help board: held for its owner around their reset time
    hub("gonman", "add", "panels", "--to", "gonman")
    tid = str(state("tasks.json")["next_id"] - 1)
    hub("gonman", "handoff", tid, "--prompt", "Goal: comic panels for the act 1 flashbacks. Branch gonman/panels at abc123; next panels 2-4.", "--resets", "+10m")
    hub("JohnPork", "take", tid, ok=False)
    check("a handoff is held near its owner's reset", True)
    check("the owner shows as limited", state("presence.json")["gonman"]["status"] == "limited")
    hub("gonman", "take", tid)
    check("the owner takes it back and is online again", state("presence.json")["gonman"]["status"] == "online")

    # Triage and refile
    hub("BagelMeister", "add", "unsure", "--to", "trevor", "--human", "Michael")
    tid = str(state("tasks.json")["next_id"] - 1)
    hub("BagelMeister", "unassign", tid)
    check("unassign sends a task to triage", {x["id"]: x for x in state("tasks.json")["tasks"]}[int(tid)]["status"] == "triage")
    hub("BagelMeister", "refile", tid, "world", "--canon", "atlas")
    check("refile --canon goes to the section's open list", {x["id"]: x for x in state("tasks.json")["tasks"]}[int(tid)]["status"] == "open")

    # Many agents at once, from two checkouts
    with ThreadPoolExecutor(8) as ex:
        list(ex.map(lambda i: hub(f"agent{i}", "post", "general", f"race {i}", clone=i % 2), range(8)))
    ids = [m["id"] for m in state("boards/general.json")["messages"]]
    check("concurrent posts all land, with unique ids", sum("race" in m["text"] for m in state("boards/general.json")["messages"]) == 8 and len(ids) == len(set(ids)))
    print("all hub checks passed")


if __name__ == "__main__":
    try:
        main()
    finally:
        shutil.rmtree(TMP, ignore_errors=True)
