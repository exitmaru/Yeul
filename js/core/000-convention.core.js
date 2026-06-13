// =========================================================
// core/convention.js
// 프로젝트 전역 정리 규칙 — 라우터에 "고정"되는 기본 룰.
//
// 인터넷 표준(연구데이터 파일 네이밍 가이드 · ISO 8601)을 근거로
// 정한 규칙입니다. 모든 unit/knowledge 파일은 이 규칙을 따릅니다.
//
// 참고:
//  - ISO 8601 날짜(YYYY-MM-DD)로 사전순 = 시간순 정렬
//  - 순번은 3자리 제로패딩(001, 002 …)으로 정렬 안정성 확보
//  - kebab-case, 공백 금지, [a-z0-9-] 만 사용
//  - 파일명은 간결하게(설명적이되 30자 내외)
// =========================================================

export const CONVENTION = Object.freeze({
  // 파일명 규칙: NNN-<kebab-name>.<kind>.js
  //   NNN  = 3자리 순번 (001~999)
  //   kind = unit | knowledge | core
  filePattern: /^(\d{3})-([a-z0-9]+(?:-[a-z0-9]+)*)\.(unit|knowledge|core)\.js$/,
  seqDigits: 3,
  case: "kebab-case",
  dateFormat: "YYYY-MM-DD", // ISO 8601
  allowedChars: /^[a-z0-9-]+$/,

  // 디렉터리 역할
  layers: Object.freeze({
    core: "라우터·규칙 등 뼈대",
    knowledge: "공통 지식 — 모든 unit 이 참조하는 단일 출처",
    units: "기능 단위 — 라우터에 매달리는 화면/모듈",
  }),
});

/** 순번 -> "001" 형태로 정규화 */
export function seq(n) {
  return String(n).padStart(CONVENTION.seqDigits, "0");
}

/** ISO 8601 (YYYY-MM-DD) 로 날짜 포맷 */
export function isoDate(d = new Date()) {
  return new Date(d).toISOString().slice(0, 10);
}

/** 파일명이 규칙에 맞는지 검사 (개발 중 자가 점검용) */
export function validateFileName(name) {
  const m = CONVENTION.filePattern.exec(name);
  if (!m) return { ok: false, reason: `규칙 위반: NNN-name.kind.js 형식이어야 함 — "${name}"` };
  return { ok: true, seq: m[1], name: m[2], kind: m[3] };
}
