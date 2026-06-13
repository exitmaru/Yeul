# ✦ Yeul · GitHub Explorer

코드의 우주를 탐험하는, **기깔나는 GitHub 레포지토리 탐색기**.
빌드 스텝 없는 순수 정적 SPA라 Cloudflare Pages에 그대로 올라갑니다.

![theme: dark/light](https://img.shields.io/badge/theme-dark%2Flight-7c9cff)
![build](https://img.shields.io/badge/build-none%20needed-5ce1c8)
![deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange)

## ✨ 기능

- 🔭 **레포 검색** — `facebook/react`, `language:rust stars:>1000`, `topic:ai` 같은 GitHub 검색 문법 그대로 지원
- 🔥 **트렌딩 홈** — 최근 한 달 떠오르는 인기 레포 추천
- 📊 **레포 상세** — 스타/포크/이슈 통계, 언어 비율 바, 토픽, 라이선스, 기여자
- 📁 **파일 브라우저** — 디렉터리 탐색 + 브레드크럼 (뒤로가기 지원)
- 📖 **README 렌더링** — 자체 마크다운 렌더러(상대 경로 이미지/링크 해석, HTML 이스케이프로 XSS 차단)
- 🕑 **최근 커밋** 타임라인
- 🌗 **다크/라이트 테마** + 오로라 배경
- 🔑 **PAT 지원** — 토큰은 브라우저(localStorage)에만 저장, 서버 전송 없음. 시간당 60 → 5,000회로 한도 상향
- ⌨️ **단축키** — `/` 로 검색 포커스, `Esc` 로 해제

## 🗂 구조

```
index.html        # 셸 + 상단바/다이얼로그
css/styles.css    # 글래스모피즘 다크/라이트 테마
js/
  app.js          # History API 라우터 + 뷰 렌더링 + 전역 UI
  api.js          # GitHub REST 래퍼 (캐시 · 레이트리밋 · 토큰)
  markdown.js     # 경량 마크다운 → HTML (escape-first)
  util.js         # 포맷터 · 언어 색상 · 헬퍼
_redirects        # Cloudflare Pages SPA fallback
```

## 🚀 로컬 실행

ES 모듈을 쓰므로 정적 서버가 필요합니다 (`file://` 직접 열기 X):

```bash
python3 -m http.server 8080
# 또는
npx serve .
```

→ http://localhost:8080

## ☁️ 배포 (Cloudflare Pages)

빌드 명령 없이 그대로 배포됩니다.

- **Build command:** *(비움)*
- **Build output directory:** `/` (저장소 루트)

`_redirects` 가 모든 경로를 `index.html` 로 보내 클라이언트 라우팅을 처리합니다.

## 🔌 데이터

순수 클라이언트에서 [GitHub REST API](https://docs.github.com/rest)를 직접 호출합니다.
백엔드·키 없이 동작하며, 한도가 부족하면 상단 🔒 버튼으로 읽기 전용 PAT을 등록하세요.
