// =========================================================
// knowledge/003-poems.knowledge.js
// 공통 지식 — 풍자 시 데이터의 단일 출처(스키마 + 샘플).
//   실제 운영에서는 변환 파이프라인(원문 수집 -> 지침 적용)이
//   이 배열을 채웁니다. 지금은 UI 시연용 샘플입니다.
//
// 스키마 (지침 002 의 meta 를 따름):
//   id        : "001" 형태 3자리 순번
//   date      : "YYYY-MM-DD" (ISO 8601)
//   category  : 분류 (지침 CATEGORIES)
//   type      : 풍자 유형 (지침 SATIRE_TYPES)
//   title     : 시 제목
//   poem      : 본문 (행 구분 \n) — 복사 대상
//   source    : { media, title, url }  원문 역추적
//   bias      : 0~10 | null
//   hashtags  : string[]
// =========================================================

/** @type {Array<object>} 최신순으로 두되, 조회는 getPoems 가 정렬 보장 */
const POEMS = [
  {
    id: "001",
    date: "2026-06-12",
    category: "정치",
    type: "구조비판",
    title: "다시 세는 밤",
    poem: [
      "숫자는 정직하다고 했다",
      "정직한 숫자를 옮기는 손이",
      "두 번 미끄러졌을 뿐이다",
      "",
      "표는 제자리에 있었는데",
      "자리만 바뀌었다는 말,",
      "그 말의 자리는 어디였나",
    ].join("\n"),
    source: { media: "YTN", title: "선관위 잇단 '개표 입력 오류'…전북·경기 교육감 선거서 표 뒤바뀌어", url: "https://www.ytn.co.kr/" },
    bias: 5,
    hashtags: ["#선관위", "#개표", "#재검표"],
  },
  {
    id: "002",
    date: "2026-06-12",
    category: "정치",
    type: "구조비판",
    title: "입력의 변명",
    poem: [
      "오류는 늘 단수다",
      "한 번의 실수, 한 줄의 오타",
      "그러나 같은 실수가",
      "줄을 서서 들어올 때",
      "",
      "우리는 그것을 제도라 부른다",
    ].join("\n"),
    source: { media: "YTN", title: "선관위, 이번엔 '입력 오류'…경쟁 후보 득표 뒤바뀌어", url: "https://www.ytn.co.kr/" },
    bias: 6,
    hashtags: ["#입력오류", "#반복", "#신뢰"],
  },
  {
    id: "003",
    date: "2026-06-11",
    category: "경제",
    type: "세태풍자",
    title: "전세라는 이름의 계절",
    poem: [
      "봄에 빌린 방은",
      "겨울에 값을 올린다",
      "계약서의 글씨는 작고",
      "보증금의 영(零)은 길다",
      "",
      "사람은 이사하고",
      "숫자는 눌러앉는다",
    ].join("\n"),
    source: { media: "한겨레", title: "전세보증 사고액 또 최고치…갱신 시장 '시한폭탄'", url: "https://www.hani.co.kr/" },
    bias: null,
    hashtags: ["#전세", "#보증금", "#주거"],
  },
  {
    id: "004",
    date: "2026-06-10",
    category: "국제",
    type: "구조비판",
    title: "회담 이후",
    poem: [
      "악수는 카메라를 향했고",
      "합의문은 여백을 향했다",
      "",
      "돌아가는 비행기 안에서",
      "통역만이 모든 것을 기억했다",
    ].join("\n"),
    source: { media: "연합뉴스", title: "정상회담 공동성명 채택…핵심 쟁점은 '추후 논의'로", url: "https://www.yna.co.kr/" },
    bias: 5,
    hashtags: ["#회담", "#성명", "#외교"],
  },
];

/** 최신순(날짜 내림차순, 동일자는 id 내림차순) 정렬해 반환 */
export function getPoems() {
  return [...POEMS].sort((a, b) =>
    a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date));
}

/** id 로 단건 조회 */
export function getPoem(id) {
  return POEMS.find((p) => p.id === id) || null;
}
