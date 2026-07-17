#!/usr/bin/env python3
"""check_refs 최소 스켈레톤 — CLAUDE.md가 언급한 레포 경로 실존 검사."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
def main():
    txt = (ROOT/"CLAUDE.md").read_text(encoding="utf-8")
    pats = {}
    for m in re.finditer(r"`([\w./가-힣_-]+/[\w./가-힣_-]+)`", txt):
        pats.setdefault(m.group(1), txt[max(0, m.start()-60):m.start()])
    bad = []
    for p, ctx in sorted(pats.items()):
        if any(ch in p for ch in "{}*<>"): continue
        if p.startswith("/"): continue  # 선행 / = URL·절대경로(레포 참조 아님) — 오탐 방지
        if re.search(r"[\w-]+/[\w-]+\s*$", ctx) or "nomute-editor" in ctx: continue  # 타 레포 소속 참조(문맥에 레포명) — 이 레포 실존 검사 대상 아님
        if not (ROOT/p).exists(): bad.append(p)
    if bad:
        print("❌ CLAUDE.md가 가리키는 경로 미실존:"); [print(" -", b) for b in bad]
        return 1
    print("✅ check_refs 통과 — 경로 참조 실존."); return 0
if __name__ == "__main__": sys.exit(main())
