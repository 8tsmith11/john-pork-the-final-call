#!/usr/bin/env python3
"""Self-test for tools/hub/hub.py: runs the real CLI against a throwaway bare repo (no network).

  python3 -I tools/hub/test_hub.py      # prints each check; exits non-zero on the first failure
  python3 -I tools/hub/test_hub.py --dm # also tests encrypted DMs with local throwaway GnuPG keys

It covers the rules in docs/org/HUB.md: boards and sub-board membership, roles on every name, the
work order of `next`, section buckets (a mechanic needs the owner's yes), sealed gags, the help
board's hold around a reset time, triage and refile, and many agents posting at once.
"""
import codecs
import json
import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
TMP = Path(tempfile.mkdtemp(prefix="hubtest-"))
CLONES = []


def sh(*args, cwd=None, check=True, env=None):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, env=env, encoding="utf-8")
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


def hub(who, *args, clone=0, ok=True, env=None):
    r = sh(sys.executable, "-I", "-X", "utf8", str(CLONES[clone] / "tools" / "hub" / "hub.py"), "--as", who, *args, check=False, env=env)
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



def check_direct_messages():
    program = os.environ.get("HUB_GPG", "gpg")
    gpg = Path(shutil.which(program) or program)
    gpgconf = gpg.with_name("gpgconf.exe" if os.name == "nt" else "gpgconf")
    cygpath = gpg.with_name("cygpath.exe")

    def gpg_path(path):
        # Git for Windows bundles an MSYS GnuPG, which expects POSIX paths.
        if os.name == "nt" and cygpath.is_file():
            return sh(cygpath, "-u", str(path)).stdout.strip()
        return str(path)
    handles = ("BagelMeister", "gonman", "trevor")
    keyrings = {}
    pins = {}
    public_keys = {}
    before = state("boards/general.json")
    message = "Private check: línea de prueba\nA second line."
    note = TMP / "dm.txt"
    note.write_text(message, encoding="utf-8")

    def run_gpg(handle, *args, check_result=True):
        return sh(gpg, "--homedir", gpg_path(keyrings[handle]), "--no-options", "--batch", *args,
                  check=check_result)

    def dm(who, *args, clone=0, keyring=None, **kw):
        env = dict(os.environ, GNUPGHOME=gpg_path(keyrings[keyring or who]))
        return hub(who, *args, clone=clone, env=env, **kw)

    try:
        for handle in handles:
            keyrings[handle] = TMP / ("keys-" + handle)
            keyrings[handle].mkdir(mode=0o700)
            run_gpg(handle, "--pinentry-mode", "loopback", "--passphrase", "",
                    "--quick-generate-key", f"{handle} <{handle}@example.test>", "ed25519", "sign", "0")
            listing = run_gpg(handle, "--with-colons", "--list-keys").stdout
            pins[handle] = next(line.split(":")[9] for line in listing.splitlines() if line.startswith("fpr:"))
            run_gpg(handle, "--pinentry-mode", "loopback", "--passphrase", "",
                    "--quick-add-key", pins[handle], "cv25519", "encr", "0")
            public_keys[handle] = TMP / f"{handle}.asc"
            run_gpg(handle, "--armor", "--output", gpg_path(public_keys[handle]), "--export", pins[handle])

        for handle in handles:
            for other in handles:
                if other != handle:
                    run_gpg(handle, "--import", gpg_path(public_keys[other]))
        for clone in CLONES:
            for handle, fingerprint in pins.items():
                sh("git", "config", "--local", f"hub.dm-key.{handle}", fingerprint, cwd=clone)

        sent = dm("BagelMeister", "dm-send", "gonman", "--text-file", str(note))
        check("dm-send returns a receipt without the plaintext", "Sent encrypted message" in sent and message not in sent)
        ledger = state("direct-messages.json")
        check("the public hub holds ciphertext only", len(ledger) == 1 and
              ledger[0]["ciphertext"].startswith("-----BEGIN PGP MESSAGE-----") and "Private check" not in str(ledger))
        check("public boards are untouched by a DM", state("boards/general.json") == before)
        dashboard = sh("git", "--git-dir", str(TMP / "remote.git"), "show", "hub:README.md").stdout
        check("DMs are omitted from the public dashboard", ledger[0]["id"] not in dashboard and "Private check" not in dashboard)

        received = dm("gonman", "dm-read", "--with", "BagelMeister", clone=1)
        check("recipient reads verified Unicode and multiline content",
              "BagelMeister to gonman" in received and "Private check: línea de prueba\n  A second line." in received)
        check("sender can open their sent copy", ledger[0]["id"] in dm("BagelMeister", "dm-read"))
        check("an uninvolved handle sees no DM", "No direct messages." in dm("trevor", "dm-read", clone=1))

        armored = TMP / "message.asc"
        armored.write_text(ledger[0]["ciphertext"], encoding="ascii")
        unreadable = run_gpg("trevor", "--decrypt", gpg_path(armored), check_result=False)
        check("a third party with the ciphertext cannot decrypt", unreadable.returncode != 0 and "Private check" not in unreadable.stdout)
        denied = dm("BagelMeister", "dm-send", "gonman", "--text-file", str(note), keyring="trevor", ok=False)
        check("the --as handle cannot sign without the matching secret key",
              "could not sign and encrypt" in denied and len(state("direct-messages.json")) == 1)

        sh("git", "config", "--local", "hub.dm-key.BagelMeister", pins["trevor"], cwd=CLONES[1])
        rejected = dm("gonman", "dm-read", clone=1, ok=False)
        check("a valid signature with the wrong pinned fingerprint is hidden", "Skipped" in rejected and "Private check" not in rejected)
        sh("git", "config", "--local", "hub.dm-key.BagelMeister", pins["BagelMeister"], cwd=CLONES[1])

        import hub as H  # loaded from the first throwaway checkout by main()
        H.transact(lambda st: st.direct_messages()[0].update(id="0" * 32), "test altered envelope")
        rejected = dm("gonman", "dm-read", clone=1, ok=False)
        check("modified public message metadata fails signature binding",
              "Skipped" in rejected and "Private check" not in rejected)
    finally:
        for path in keyrings.values():
            sh(gpgconf, "--homedir", gpg_path(path), "--kill", "gpg-agent", check=False)


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
    sys.path.insert(0, str(CLONES[0] / "tools" / "hub"))
    import hub as H
    ago = lambda m: H.iso(H.now() - H.dt.timedelta(minutes=m))
    ahead = H.iso(H.now() + H.dt.timedelta(minutes=30))
    cases = [({"status": "online", "last_seen": ago(5)}, "online"), ({"status": "online", "last_seen": ago(20)}, "inactive"),
             ({"status": "online", "last_seen": ago(61)}, "offline"), ({"status": "offline", "last_seen": ago(1)}, "offline"),
             ({"status": "limited", "last_seen": ago(90), "resets_at": ahead}, "limited"),
             ({"status": "limited", "last_seen": ago(90), "resets_at": ago(10)}, "offline"), (None, "not seen")]
    check("status: inactive after 15 min, offline after 60, limited until the reset",
          all(H.status_of(p) == want for p, want in cases), [(want, H.status_of(p)) for p, want in cases])
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

    # Pending review: delivered work leaves the task list, shows on the dashboard, and ends done (or reopens)
    hub("BagelMeister", "add", "a cutscene", "--to", "BagelMeister")
    rid = str(state("tasks.json")["next_id"] - 1)
    hub("BagelMeister", "review", rid, ok=False)
    check("review needs --note (where the work is)", True)
    hub("BagelMeister", "review", rid, "--note", "PR #99")
    rt = {x["id"]: x for x in state("tasks.json")["tasks"]}[int(rid)]
    check("review keeps the owner and the PR", rt["status"] == "review" and rt["owner"] == "BagelMeister" and rt["review"] == "PR #99")
    out = hub("BagelMeister", "inbox")
    check("pending review is off the owner's task list, with a pointer", "a cutscene" not in out and "+1 of BagelMeister's pending review" in out)
    readme = sh("git", "--git-dir", str(TMP / "remote.git"), "show", "hub:README.md").stdout
    pending = readme.split("## Pending review")[1].split("## Boards")[0]
    check("the dashboard lists it under Pending review, with the PR", "a cutscene" in pending and "pending review" in pending and "PR #99" in pending)
    check("hub.py review lists it", "a cutscene" in hub("LoreKeeper", "review") and "PR #99" in hub("LoreKeeper", "review"))
    hub("LoreKeeper", "reopen", rid, "--note", "changes requested")
    check("reopen puts it back on the owner's list", "a cutscene" in hub("BagelMeister", "inbox"))
    hub("BagelMeister", "review", rid, "--note", "PR #99, revised")
    hub("LoreKeeper", "done", rid, "--note", "merged")
    readme = sh("git", "--git-dir", str(TMP / "remote.git"), "show", "hub:README.md").stdout
    check("done takes it off Pending review", "a cutscene" not in readme.split("## Pending review")[1].split("## Boards")[0])
    hub("BagelMeister", "review", rid, "--note", "again", ok=False)
    check("a done task can't go back to review (reopen it first)", True)

    # Many agents at once, from two checkouts
    with ThreadPoolExecutor(8) as ex:
        list(ex.map(lambda i: hub(f"agent{i}", "post", "general", f"race {i}", clone=i % 2), range(8)))
    ids = [m["id"] for m in state("boards/general.json")["messages"]]
    check("concurrent posts all land, with unique ids", sum("race" in m["text"] for m in state("boards/general.json")["messages"]) == 8 and len(ids) == len(set(ids)))
    if "--dm" in sys.argv:
        check_direct_messages()
    print("all hub checks passed")


if __name__ == "__main__":
    try:
        main()
    finally:
        shutil.rmtree(TMP, ignore_errors=True)
