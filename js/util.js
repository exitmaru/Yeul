// =========================================================
// util.js — 공용 헬퍼
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

/** 1234567 -> "1.2m" */
export function compact(n) {
  if (n == null) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "") + "k";
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
}

/** 파일 크기 (KB 입력) -> 사람이 읽는 단위. bytes=true면 바이트 입력 */
export function fileSize(value, bytes = false) {
  let b = bytes ? value : value * 1024;
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(b < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

/** ISO 시각 -> "3일 전" 형태 상대 시간 */
export function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  const steps = [
    [60, "초"],
    [60, "분"],
    [24, "시간"],
    [30, "일"],
    [12, "개월"],
    [Infinity, "년"],
  ];
  let val = sec, unit = "초";
  for (const [div, label] of steps) {
    if (val < div) { unit = label; break; }
    val = Math.floor(val / div);
    unit = label;
  }
  if (sec < 60) return "방금 전";
  return `${val}${unit} 전`;
}

/** GitHub Linguist 색상 (자주 쓰는 언어 위주) */
export const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219",
  "C++": "#f34b7d", C: "#555555", "C#": "#178600", Go: "#00ADD8", Rust: "#dea584",
  Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
  HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Shell: "#89e051", Vue: "#41b883",
  Svelte: "#ff3e00", Elixir: "#6e4a7e", Scala: "#c22d40", Haskell: "#5e5086",
  Lua: "#000080", "Jupyter Notebook": "#DA5B0B", Dockerfile: "#384d54", MDX: "#fcb32c",
  Astro: "#ff5a03", Zig: "#ec915c", Nix: "#7e7eff", Objective: "#438eff", R: "#198CE7",
};

let _colorCache = {};
export function langColor(name) {
  if (!name) return "#8b8b8b";
  if (LANG_COLORS[name]) return LANG_COLORS[name];
  if (_colorCache[name]) return _colorCache[name];
  // 결정적 해시 -> HSL 색상
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return (_colorCache[name] = `hsl(${h} 65% 60%)`);
}

/** querystring 인코딩 헬퍼 */
export function debounce(fn, ms = 250) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
