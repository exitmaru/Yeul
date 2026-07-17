# saju-app — AI 사주 상담 (아이샤)

미연시(비주얼노벨)풍 AI 사주 상담 웹앱. Vite + React + MUI + Emotion, Pretendard.
만세력 엔진(`dosa-app/engine`)을 벤더링해 **입력한 생년월일시로 실제 원국을 계산**한다.

## 화면
- **홈** — 오늘의 일진 점수 + 내 사주 원국 + 개요 (하단 5버튼 네비)
- **정보 입력** — 이름·성별 / 생년월일시 / 도시 / 혼인 / 보정값
- **로딩** — "아이샤가 만세력을 정리 중" + 오행 타일
- **결과** — 아이샤 캐릭터 + 원국표 + 오행 분포 + 대화박스 (엔진 실계산)

## 디자인
- 글래스모피즘(초투명·강블러, YETA UI킷 이식) · 라이트/다크 토글(PC)
- 강조색: 라이트 코발트(#22409E) / 다크 틸(#3AD9C0)
- 자간 -0.03em, 기본 굵기 Medium

## 개발
```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 생성
npm run preview  # 빌드 미리보기
```

## 배포 (Cloudflare Pages)
표준 Vite 앱 — 별도 Root 설정 불필요.
- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`
- Node: `.node-version`(22.17.0)
- SPA 라우팅: `public/_redirects` 내장

## 만세력 엔진
`src/engine/vendor/`는 `muteno/Saju`의 `dosa-app/engine`에서 벤더링한 사본.
원본 갱신 시 vendor/ 동기화 필요. `src/engine/index.js`가 UI용으로 매핑한다.

## 데이터/지식 (다음 단계)
결과 풀이 텍스트는 현재 플레이스홀더. 엔진 키셋 → `dosa-app/kb` 정제 유닛 조립(L3)
및 도사 대화층(L4)은 KB 증류가 채워지면 연결.
