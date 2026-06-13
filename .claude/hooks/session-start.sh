#!/bin/bash
# =====================================================================
# SessionStart 훅 — 영상 프레임 도구 사전 설치 (Claude Code on the web).
#   목적: mp4 화면녹화를 프레임으로 떠서 읽을 때 쓰는 ffmpeg(+ 보조)을
#         "최초 1회"만 설치. 컨테이너 상태가 캐시되므로 이후 세션은 즉시 사용.
#   특성: 멱등(있으면 스킵) · 비대화형 · 웹 전용 · 실패해도 세션 안 깨짐.
# =====================================================================
set -euo pipefail

# 로컬(비원격) 세션에선 스킵 — 웹 환경에서만 설치
[ "${CLAUDE_CODE_REMOTE:-}" != "true" ] && exit 0

{
  # ffmpeg: 이미 있으면 아무것도 안 함(멱등). 없으면 apt → 실패 시 PyAV 폴백.
  if ! command -v ffmpeg >/dev/null 2>&1; then
    if command -v apt-get >/dev/null 2>&1; then
      (apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg) \
        || pip install -q av
    else
      pip install -q av
    fi
  fi
  # 프레임 리사이즈 + 몽타주(컨택트시트)용 — 있으면 스킵
  python3 -c 'import PIL, numpy' >/dev/null 2>&1 || pip install -q pillow numpy
  echo "[session-start] video tools ready ($(command -v ffmpeg >/dev/null 2>&1 && echo ffmpeg || echo PyAV))"
} || echo "[session-start] video-tools install skipped/failed (non-fatal)"

exit 0
