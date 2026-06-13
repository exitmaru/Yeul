// =========================================================
// knowledge/004-clipboard.knowledge.js
// 공통 지식 — 복사 기능 + 토스트 알림.
// =========================================================

/** 텍스트를 클립보드로 복사. 실패 시 폴백(execCommand). */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* 폴백으로 진행 */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

let toastEl;
/** 화면 하단 중앙 토스트 */
export function toast(message, ok = true) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.toggle("err", !ok);
  toastEl.classList.add("show");
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

/** 복사 + 토스트를 한 번에 */
export async function copyWithToast(text, label = "복사했어요") {
  const ok = await copyText(text);
  toast(ok ? `${label} ✓` : "복사에 실패했어요", ok);
  return ok;
}
