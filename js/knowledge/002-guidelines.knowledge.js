// =========================================================
// knowledge/002-guidelines.knowledge.js
// 공통 지식 — 변환 "지침". 글(원문) -> 풍자 시 변환 규칙의 단일 출처.
//   실제 변환 파이프라인(외부/LLM)이 참조할 스펙이며,
//   unit 들은 분류 라벨·메타 정의를 여기서 끌어 씁니다.
// =========================================================

/** 분류(카테고리) — 카드 태그와 필터에 공통 사용 */
export const CATEGORIES = Object.freeze(["전체", "정치", "사회", "경제", "문화", "국제"]);

/** 풍자 유형 */
export const SATIRE_TYPES = Object.freeze(["구조비판", "사건비판", "인물풍자", "세태풍자"]);

/**
 * 변환 지침 — 원문을 풍자 시로 바꿀 때의 고정 규칙.
 * (파이프라인이 프롬프트/룰로 사용)
 */
export const TRANSFORM_GUIDELINES = Object.freeze({
  voice: "관조적이고 절제된 풍자. 조롱이 아니라 구조를 드러내는 어조.",
  form: "행 구분이 분명한 자유시. 4~10행 권장.",
  rules: [
    "특정 개인을 모욕하지 않는다 — 사건의 구조와 세태를 겨눈다.",
    "원문의 사실관계를 왜곡하지 않는다.",
    "은유와 대비로 비틀되, 혐오·선동 표현은 배제한다.",
    "각 시는 원문(source)으로 역추적 가능해야 한다.",
  ],
  meta: ["category", "type", "bias", "hashtags"], // 시마다 부여하는 메타
});

/** 시 본문을 행 배열로 정규화 */
export function toLines(body = "") {
  return body.split("\n").map((l) => l.trim()).filter(Boolean);
}
