// =========================================================
// units/002-detail.unit.js
// 유닛 — 풍자 시 상세 모달. 라우터 overlay 레이어(?id=).
//   헤더: 원문↗ · 복사 · 닫기 / 본문: 행 단위 시 + 복사 가능.
// =========================================================
import { getPoem } from "../knowledge/003-poems.knowledge.js";
import { ICON, biasBar } from "../knowledge/005-ui-kit.knowledge.js";
import { esc, ymd } from "../knowledge/001-formatters.knowledge.js";
import { copyWithToast } from "../knowledge/004-clipboard.knowledge.js";

let mountedId = null;
let keyHandler = null;

function close(router) {
  router.setQuery({ id: null });
}

function bodyLines(poem) {
  return toLinesWithGaps(poem)
    .map((l) => (l === "" ? `<div class="poem-gap"></div>` : `<p class="poem-line">${esc(l)}</p>`))
    .join("");
}
// 빈 줄(연 구분)을 보존하기 위해 toLines 대신 직접 분해
function toLinesWithGaps(poem = "") {
  return poem.split("\n").map((l) => l.trim());
}

function render({ mount, params, router }) {
  const id = params.get("id");
  const p = id && getPoem(id);

  if (!p) {                       // 잘못된 id → 닫기
    mount.innerHTML = "";
    mountedId = null;
    detachKeys();
    if (id) router.setQuery({ id: null, replace: true });
    return;
  }
  if (mountedId === id) return;   // 동일 모달 재렌더 방지
  mountedId = id;

  const copyTarget = `${p.title}\n\n${p.poem}\n\n— 원문: ${p.source.media} · ${p.source.url}`;

  mount.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal glass" role="dialog" aria-modal="true" aria-label="${esc(p.title)}">
      <header class="modal-head">
        <a class="pill-btn outline" href="${esc(p.source.url)}" target="_blank" rel="noopener">원문 ${ICON.arrow}</a>
        <div class="modal-head-right">
          <button class="pill-btn" id="copy-btn">${ICON.copy} 복사</button>
          <button class="icon-btn" id="close-btn" aria-label="닫기">${ICON.close}</button>
        </div>
      </header>

      <div class="modal-body">
        <span class="card-tag cat-${esc(p.category)}">${esc(p.category)}</span>
        <h1 class="modal-title">${esc(p.title)}</h1>

        <div class="modal-meta">
          <div class="kv"><span>매체</span><b>${esc(p.source.media)}</b></div>
          <div class="kv"><span>유형</span><b>${esc(p.type)}</b></div>
          <div class="kv bias"><span>편향</span><div class="bias-wrap">${biasBar(p.bias)}</div></div>
          <div class="kv"><span>일자</span><b>${esc(ymd(p.date))}</b></div>
        </div>

        <article class="poem">${bodyLines(p.poem)}</article>

        <p class="modal-source">원문: <a href="${esc(p.source.url)}" target="_blank" rel="noopener">${esc(p.source.title)}</a></p>
        <div class="modal-tags">${(p.hashtags || []).map((h) => `<span class="chip tag">${esc(h)}</span>`).join("")}</div>
      </div>
    </div>`;

  mount.querySelector("#copy-btn").onclick = () => copyWithToast(copyTarget, "시를 복사했어요");
  mount.querySelector("#close-btn").onclick = () => close(router);
  mount.querySelector("[data-close]").onclick = () => close(router);

  detachKeys();
  keyHandler = (e) => { if (e.key === "Escape") close(router); };
  document.addEventListener("keydown", keyHandler);
  document.body.classList.add("modal-open");
}

function detachKeys() {
  if (keyHandler) document.removeEventListener("keydown", keyHandler);
  keyHandler = null;
  document.body.classList.remove("modal-open");
}

export default {
  seq: 2,
  id: "detail",
  layer: "overlay",
  match: () => true,   // 항상 평가받아 id 제거 시 정리(cleanup)까지 담당
  render,
};
