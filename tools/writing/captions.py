#!/usr/bin/env python3
"""Find narration captions that look like writer notes leaking into the game (since convert.py turns
italic stage directions into captions). Counts only by default (safe to share); --show prints the
suspicious lines (spoilers: they come from the sealed scenes).

  python3 tools/writing/captions.py          # counts per scene
  python3 tools/writing/captions.py --show   # the suspicious captions themselves
"""
import codecs, json, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SUSPECT = re.compile(r"\b(player|players|flag|seed|variant|node|scene|branch|beat|choice|trigger|speaker|party|engine|cutscene|camera pans|we see|fade|cut to|TODO|TBD|optional|if the|unless|otherwise|act ?[123]|lead [abc]|stage \d|npc)\b|\[|\]|=|\{|\}", re.I)


def main():
    show = "--show" in sys.argv
    total = 0
    for f in sorted((REPO / "src/content/dialogue/act1").glob("*.js")):
        s = f.read_text()
        data = json.loads(codecs.encode(json.loads(s[s.index("export default ") + 15:].rstrip().rstrip(";")), "rot_13"))
        hits = [(nid, l["text"]) for nid, n in data["nodes"].items() for l in n["lines"] if l.get("narr") and SUSPECT.search(l["text"])]
        total += len(hits)
        print(f"{f.stem:20s} suspicious captions: {len(hits)}")
        if show:
            for nid, t in hits:
                print(f"    [{nid}] {t}")
    print(f"total: {total}")


if __name__ == "__main__":
    main()
