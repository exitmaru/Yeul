# ✶ Yeul · 풍자 시

수집된 글(원문)이 **정해진 지침에 따라 풍자 시로 다시 태어나** 카드로 리스트업되는 웹앱.
각 시는 상세 보기에서 **원문 역추적**과 **클립보드 복사**가 가능합니다.
빌드 스텝 없는 정적 SPA라 **Cloudflare Pages** 에 그대로 올라갑니다.

![brand](https://img.shields.io/badge/brand-cobalt%20blue-2f6bff)
![font](https://img.shields.io/badge/font-Pretendard-1b3fb0)
![build](https://img.shields.io/badge/build-none%20needed-5ce18a)
![deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-f38020)

## ✨ 핵심

- 🪶 **풍자 시 피드** — 얇은 글래스 카드로 리스트업 (참조 UI 계승)
- 🔎 **검색 · 분류 필터 · 간결 보기** 토글
- 📋 **복사** — 상세 모달에서 시 전문을 클립보드로 (토스트 피드백)
- ↗ **원문 역추적** — 카드/모달에서 출처로 바로 이동
- 🧭 **편향 표시** — 0~10 점수 막대 + 무관(N/A) 빗금 표기
- 🌗 **다크/라이트 테마**, 코발트 블루 + Pretendard, 오로라 배경
- ⬆️ **우하단 스크롤 탑** 플로팅 버튼

## 🏗 아키텍처 — 단일 라우터 + 유닛 + 공통 지식

확장을 위해 **하나의 라우터**에 기능(유닛)을 매답니다. 모든 유닛은 **공통 지식**을 단일 출처로 참조합니다.

```
js/
  core/                         # 뼈대
    000-convention.core.js      # 파일명/문법 규칙 — 라우터에 고정
    001-router.core.js          # 단일 라우터 (view + overlay 2레이어)
  knowledge/                    # 공통 지식 — 모든 유닛이 참조
    001-formatters.knowledge.js #   포맷터 · 편향 · 헬퍼
    002-guidelines.knowledge.js #   변환 "지침" · 분류/유형 정의
    003-poems.knowledge.js      #   풍자 시 데이터(스키마+샘플) 단일 출처
    004-clipboard.knowledge.js  #   복사 + 토스트
    005-ui-kit.knowledge.js     #   아이콘 · 카드 · 편향바
  units/                        # 기능 — 라우터에 매달림
    001-feed.unit.js            #   피드(리스트/필터)         · view
    002-detail.unit.js          #   상세 모달(원문/복사/닫기)  · overlay
  app.js                        # 부트스트랩: 유닛 등록 + 전역 UI
```

**새 기능 추가법**: `units/NNN-xxx.unit.js` 를 규칙대로 만들고 `app.js` 의 `register()` 에 한 줄 추가.

## 📐 파일명 / 정리 규칙 (라우터에 고정)

`000-convention.core.js` 에 상수로 못박아 둔 규칙 — 인터넷 표준(연구데이터 네이밍 가이드 · ISO 8601) 근거:

- 형식 `NNN-<kebab-name>.<kind>.js` — `kind ∈ {core, knowledge, unit}`
- 순번 **3자리 제로패딩** (`001`, `002` …) → 사전순 = 우선순위
- 날짜는 **ISO 8601** (`YYYY-MM-DD`) → 사전순 = 시간순
- **kebab-case**, 공백 금지, `[a-z0-9-]` 만 사용

근거: [UConn RDM](https://guides.lib.uconn.edu/c.php?g=832372&p=8226285) · [Harvard HMS](https://datamanagement.hms.harvard.edu/plan-design/file-naming-conventions) · [NameQuick](https://www.namequick.app/blog/file-naming-conventions)

## 🔄 변환 파이프라인

원문 → (지침 `002-guidelines`) → 풍자 시 변환은 외부 파이프라인의 몫입니다.
현재는 `003-poems` 의 샘플 데이터로 UI 를 시연하며, 동일 스키마로 데이터를 채우면 그대로 동작합니다.

## 🚀 로컬 실행

```bash
python3 -m http.server 8080   # 또는: npx serve .
```
→ http://localhost:8080 (ES 모듈이라 정적 서버 필요)

## ☁️ 배포 (Cloudflare Pages)

빌드 명령 없이 배포됩니다.

| 항목 | 값 |
|---|---|
| Framework preset | `None` |
| Build command | *(비움)* |
| Build output directory | `/` |

`_redirects` 가 모든 경로를 `index.html` 로 보내 클라이언트 라우팅을 처리합니다.
