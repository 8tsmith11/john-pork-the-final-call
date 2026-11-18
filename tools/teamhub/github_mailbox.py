#!/usr/bin/env python3
"""Shared GitHub mailbox. Uses a separate branch without changing the checkout.

Read: python3 tools/teamhub/github_mailbox.py read
Post: python3 tools/teamhub/github_mailbox.py post --author 'John Pork' --text 'Hello'
Use --file instead of --text for multiline posts. Never post plaintext credentials.
"""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import sys
import uuid


BRANCH = "agent-mailbox"
ROOT = Path(__file__).resolve().parents[2]


def git(*args, data=None, env=None, check=True):
    return subprocess.run(
        ["git", *args], cwd=ROOT, input=data, text=True,
        capture_output=True, env=env, check=check,
    )


def read_mailbox():
    remote = git("ls-remote", "--exit-code", "origin", f"refs/heads/{BRANCH}", check=False)
    if remote.returncode == 2:
        return None, []
    remote.check_returncode()
    parent = remote.stdout.split()[0]
    git("fetch", "--quiet", "--no-tags", "--no-write-fetch-head", "origin", parent)
    messages = json.loads(git("show", f"{parent}:messages.json").stdout)
    if not isinstance(messages, list):
        raise ValueError("Mailbox messages.json must be a list")
    return parent, messages


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    reader = commands.add_parser("read")
    reader.add_argument("--after", help="Only messages after this UTC ISO timestamp")
    writer = commands.add_parser("post")
    writer.add_argument("--author", required=True, help="Your existing agent name")
    source = writer.add_mutually_exclusive_group(required=True)
    source.add_argument("--text")
    source.add_argument("--file", type=Path)
    args = parser.parse_args()

    if args.command == "read":
        _, messages = read_mailbox()
        for message in messages:
            if not args.after or message["at"] > args.after:
                print(json.dumps(message, ensure_ascii=False))
        return

    author = args.author.strip()
    text = (args.file.read_text() if args.file else args.text).strip()
    if not author or not text:
        parser.error("author and message must not be empty")
    message = {
        "id": str(uuid.uuid4()), "author": author,
        "at": datetime.now(timezone.utc).isoformat(timespec="microseconds"),
        "text": text,
    }
    env = dict(os.environ)
    # Mailbox commits carry the agent's chosen name, independent of game commits.
    env.update(GIT_AUTHOR_NAME=author, GIT_COMMITTER_NAME=author,
               GIT_AUTHOR_EMAIL="agent@users.noreply.github.com",
               GIT_COMMITTER_EMAIL="agent@users.noreply.github.com")
    for _ in range(5):
        parent, messages = read_mailbox()
        if any(item.get("id") == message["id"] for item in messages):
            print(json.dumps(message, ensure_ascii=False))
            return
        messages.append(message)
        blob = git("hash-object", "-w", "--stdin",
                   data=json.dumps(messages, indent=2, ensure_ascii=False) + "\n").stdout.strip()
        tree = git("mktree", data=f"100644 blob {blob}\tmessages.json\n").stdout.strip()
        parents = ["-p", parent] if parent else []
        commit = git("commit-tree", tree, *parents, env=env,
                     data=f"Mailbox: {author}\n").stdout.strip()
        pushed = git("push", "origin", f"{commit}:refs/heads/{BRANCH}", check=False)
        if pushed.returncode == 0:
            print(json.dumps(message, ensure_ascii=False))
            return
        # A competing post must be included before a normal push will succeed.
        # Transport/auth failures stop immediately instead of retrying writes.
        latest, _ = read_mailbox()
        if latest == parent:
            raise RuntimeError(pushed.stderr.strip())
    raise RuntimeError("Mailbox busy after five attempts; please retry")


if __name__ == "__main__":
    try:
        main()
    except (subprocess.CalledProcessError, RuntimeError, ValueError) as error:
        if isinstance(error, subprocess.CalledProcessError):
            print(error.stderr.strip() or str(error), file=sys.stderr)
        else:
            print(str(error), file=sys.stderr)
        sys.exit(1)
