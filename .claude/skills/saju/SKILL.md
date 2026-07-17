---
name: saju
description: 생년월일시로 근거 기반 사주 리포트 생성 + L4 서술 표준으로 풀이. 사용 - /saju YYYY-MM-DD HH:MM M|F [출생지명 또는 경도]
---

# /saju — 근거 기반 사주풀이

1. 파생물 확인: `dosa-app/kb/unit_bodies.json` 없으면 먼저 `python3 dosa-app/kb-tools/extract_bodies.py`.
2. 출생지를 경도로 환산(서울 126.978, 부산 129.08, 순천 127.49, 광주 126.85, 대구 128.60, 인천 126.71, 대전 127.38 — 그 외는 아는 좌표 사용). 시간 모르면 시주 제외 옵션은 아직 없으니 사용자에게 확인.
3. 리포트 생성:
   `node dosa-app/cli/saju_report.mjs YYYY-MM-DD HH:MM M|F --lon <경도> --out <파일>.md`
4. 리포트를 근거로 **L4 서술 표준**(dosa-app/README.md)에 따라 채팅에 풀이 작성:
   일상어 본문 → 생활 장면 → 시기 구체화(유년→2029 기유년 식, `unse.js nextYearsWithBranch`) → 완충·대처 → 단락마다 ▸근거줄(출처).
   구조 판정(신강신약·조후·부재)을 먼저, 개별 요소는 그다음. 단정 금지("~하기 쉽습니다").
5. 리포트 파일도 함께 전달. 근거 없는 주장 금지 — 코퍼스에 없으면 "소장 문헌에 상세 없음"이라 말할 것.
