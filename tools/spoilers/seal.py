#!/usr/bin/env python3
"""Spoiler seal: ROT13 (a Caesar cipher, shift 13) for key plot twists, so the humans don't spoil
themselves by browsing GitHub. It's deliberately weak: anyone can open it when they want to.

  python3 tools/spoilers/seal.py open  docs/sealed/<file>.md      # print decrypted to the terminal
  python3 tools/spoilers/seal.py seal  <plain.md> <docs/sealed/out.md>  # encrypt a plaintext file
  python3 tools/spoilers/seal.py text  "some text"                # ROT13 a string (posts, notes)

Agents: never commit decrypted plaintext of a sealed file. Decrypt to stdout or a scratch path
outside the repo, edit, and re-seal. See docs/sealed/README.md.
"""
import codecs
import sys
from pathlib import Path

HEADER = ("<!-- SEALED SPOILERS (ROT13 Caesar cipher). Humans: reading this spoils key plot twists.\n"
          "     To open on purpose: python3 tools/spoilers/seal.py open {path} -->\n")


def rot13(text: str) -> str:
    return codecs.encode(text, "rot_13")


def rot47(text: str) -> str:
    """ROT47 over printable ASCII. Devlog transcripts use it: they quote ROT13 text, and ROT13 on top of
    ROT13 would turn it back into plaintext."""
    return "".join(chr(33 + (ord(c) - 33 + 47) % 94) if 33 <= ord(c) <= 126 else c for c in text)


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cmd = sys.argv[1]
    if cmd == "open":
        body = Path(sys.argv[2]).read_text()
        header = ""
        if body.startswith("<!-- SEALED"):
            header, body = body.split("-->\n", 1)
        sys.stdout.write(rot47(body) if "ROT47" in header else rot13(body))
    elif cmd == "seal":
        src, dst = Path(sys.argv[2]), Path(sys.argv[3])
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(HEADER.format(path=dst.as_posix()) + rot13(src.read_text()))
        print(dst)
    elif cmd == "text":
        print(rot13(" ".join(sys.argv[2:])))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
