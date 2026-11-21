#!/usr/bin/env python3
"""Seal and open comic data (src/content/comics/<id>.js) for comics whose pages give a story away.

A sealed comic is a JS module whose default export is its JSON, ROT13'd (the same wrapper as the
sealed dialogue and src/content/crush.js); src/game/comic.js decodes it. Keep the plaintext OUTSIDE
the repo (a scratch folder or /tmp) and never commit it.

    python3 tools/art/comic_seal.py open src/content/comics/<id>.js > /tmp/<id>.json   # read / edit
    python3 tools/art/comic_seal.py seal /tmp/<id>.json src/content/comics/<id>.js     # write it back
"""
import codecs
import json
import re
import sys
from pathlib import Path

HEADER = ("// Sealed comic (docs/art/comic-pages.md): its pages are ROT13'd JSON so they don't spoil the story.\n"
          "// Decoded by src/game/comic.js. Edit: python3 tools/art/comic_seal.py open <this file> > /tmp/x.json,\n"
          "// change it there (outside the repo), then python3 tools/art/comic_seal.py seal /tmp/x.json <this file>.\n")


def seal(src: Path, out: Path) -> None:
    data = json.loads(src.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not data.get("id") or not data.get("pages"):
        sys.exit("a comic needs an id and pages")
    plain = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    sealed = codecs.encode(plain, "rot13")
    out.write_text(HEADER + "export default " + json.dumps(sealed, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"sealed {data['id']}: {len(data['pages'])} pages -> {out}")


def open_(path: Path) -> None:
    m = re.search(r"export default (\".*\");\s*$", path.read_text(encoding="utf-8"), re.S)
    if not m:
        sys.exit(f"{path}: not a sealed comic")
    data = json.loads(codecs.decode(json.loads(m.group(1)), "rot13"))
    print(json.dumps(data, ensure_ascii=False, indent=1))


def main() -> None:
    if len(sys.argv) == 4 and sys.argv[1] == "seal":
        seal(Path(sys.argv[2]), Path(sys.argv[3]))
    elif len(sys.argv) == 3 and sys.argv[1] == "open":
        open_(Path(sys.argv[2]))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
