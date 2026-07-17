#!/usr/bin/env python3
"""check_refs 최소 스켈레톤 — CLAUDE.md가 언급한 레포 경로 실존 검사."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
def main():
    txt = (ROOT/"CLAUDE.md").read_text(encoding="utf-8")
    pats = re.findall(r"`([\w./가-힣_-]+/[\w./가-힣_-]+)`", txt)
    bad = []
    for p in sorted(set(pats)):
        if any(ch in p for ch in "{}*<>"): continue
        if p.startswith("/"): continue  # 선행 / = URL·절대경로(레포 참조 아님) — 오탐 방지
        if not (ROOT/p).exists(): bad.append(p)
    if bad:
        print("❌ CLAUDE.md가 가리키는 경로 미실존:"); [print(" -", b) for b in bad]
        return 1
    print("✅ check_refs 통과 — 경로 참조 실존."); return 0
if __name__ == "__main__": sys.exit(main())
