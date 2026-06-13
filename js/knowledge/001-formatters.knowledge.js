// =========================================================
// knowledge/001-formatters.knowledge.js
// 공통 지식 — 포맷터 · 헬퍼. 모든 unit 이 공유하는 단일 출처.
// =========================================================

/** HTML 이스케이프 (XSS 방지) */
export function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** ISO 시각/날짜 -> "3일 전" 상대 시간 */
export function timeAgo(iso) {
  if (!iso) return "";
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "방금 전";
  const steps = [[60, "분"], [24, "시간"], [30, "일"], [12, "개월"], [Infinity, "년"]];
  let val = Math.floor(sec / 60), unit = "분";
  for (const [div, label] of steps) {
    if (val < div) { unit = label; break; }
    val = Math.floor(val / div);
    unit = label;
  }
  return `${val}${unit} 전`;
}

/** ISO 8601 (YYYY-MM-DD) */
export function ymd(iso) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "";
}

export function debounce(fn, ms = 220) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
