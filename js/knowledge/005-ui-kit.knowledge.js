// =========================================================
// knowledge/005-ui-kit.knowledge.js
// 공통 지식 — 아이콘 · 카드 · 편향바 · 상태 뷰.
//   참조 UI(ute-editor) 계승: 얇은 라운드 글래스 카드 +
//   카테고리 태그 + 우상단 화살표(원문) + 메타(매체/유형/편향).
// =========================================================
import { esc, timeAgo, ymd, bias } from "./001-formatters.knowledge.js";

export const ICON = {
  arrow: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  up: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
  paper: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h6"/></svg>`,
};

/** 편향 막대 (none 이면 빗금) */
export function biasBar(score) {
  const b = bias(score);
  if (b.na) return `<span class="bias-na">${esc(b.label)}</span>
    <div class="bias-bar na"></div>`;
  return `<span class="bias-label" style="color:${b.color}">${esc(b.label)}</span>
    <div class="bias-bar"><i style="width:${b.pct}%;background:${b.color}"></i></div>`;
}

/** 풍자 시 카드 (얇은 글래스, 참조 UI 계승) */
export function poemCard(p) {
  return `
    <article class="card" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.title)} 상세 보기">
      <a class="card-open" href="${esc(p.source.url)}" target="_blank" rel="noopener"
         title="원문 보기" aria-label="원문 보기" data-stop>${ICON.arrow}</a>
      <span class="card-tag cat-${esc(p.category)}">${esc(p.category)}</span>
      <h3 class="card-title">${esc(p.title)}</h3>
      <div class="card-grid">
        <div class="kv"><span>매체</span><b>${ICON.paper} ${esc(p.source.media)}</b></div>
        <div class="kv"><span>유형</span><b>${esc(p.type)}</b></div>
        <div class="kv bias"><span>편향</span><div class="bias-wrap">${biasBar(p.bias)}</div></div>
      </div>
      <div class="card-foot">
        <span class="chip date">${esc(ymd(p.date))}</span>
        ${(p.hashtags || []).slice(0, 3).map((h) => `<span class="chip tag">${esc(h)}</span>`).join("")}
        <span class="ago">${esc(timeAgo(p.date))}</span>
      </div>
    </article>`;
}

export function emptyView(msg = "표시할 시가 없어요") {
  return `<div class="empty"><div class="big">🪶</div><p>${esc(msg)}</p></div>`;
}
