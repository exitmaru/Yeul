// =========================================================
// units/001-feed.unit.js
// 유닛 — 풍자 시 피드(리스트). 라우터 view 레이어.
//   필터 상태는 유닛 내부에서 관리해 입력 포커스를 보존하고,
//   상세 열기만 라우터(?id=)로 위임한다.
// =========================================================
import { getPoems } from "../knowledge/003-poems.knowledge.js";
import { CATEGORIES } from "../knowledge/002-guidelines.knowledge.js";
import { poemCard, emptyView } from "../knowledge/005-ui-kit.knowledge.js";
import { ymd, debounce } from "../knowledge/001-formatters.knowledge.js";

const state = { q: "", cat: "전체", compact: false };
let router;

function filtered() {
  const q = state.q.trim().toLowerCase();
  return getPoems().filter((p) => {
    if (state.cat !== "전체" && p.category !== state.cat) return false;
    if (q && !(`${p.title} ${p.source.title} ${p.hashtags.join(" ")}`.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderList(mount) {
  const items = filtered();
  const listEl = mount.querySelector("#poem-list");
  const countEl = mount.querySelector("#feed-count");
  if (countEl) countEl.textContent = `${items.length}건 · ${ymd(new Date())}`;
  listEl.className = state.compact ? "list compact" : "list";
  listEl.innerHTML = items.length ? items.map(poemCard).join("") : emptyView("조건에 맞는 시가 없어요");

  listEl.querySelectorAll(".card").forEach((card) => {
    const open = () => router.setQuery({ id: card.dataset.id });
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-stop]")) return; // 원문 링크는 통과
      open();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
}

function render({ mount, router: r }) {
  router = r;
  mount.innerHTML = `
    <section class="feed">
      <div class="feed-toolbar glass">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/></svg>
          <input id="feed-search" type="search" placeholder="제목 검색" autocomplete="off" aria-label="제목 검색" />
        </div>
        <div class="select-wrap">
          <select id="feed-cat" aria-label="분류 선택">
            ${CATEGORIES.map((c) => `<option value="${c}"${c === state.cat ? " selected" : ""}>${c === "전체" ? "전체 분류" : c}</option>`).join("")}
          </select>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <label class="toggle" title="간결히 보기">
          <input id="feed-compact" type="checkbox"${state.compact ? " checked" : ""} />
          <span class="track"><span class="thumb"></span></span>
          <span class="toggle-label">카드만</span>
        </label>
      </div>
      <div class="feed-count" id="feed-count"></div>
      <div id="poem-list" class="list"></div>
    </section>`;

  const search = mount.querySelector("#feed-search");
  search.value = state.q;
  search.addEventListener("input", debounce((e) => { state.q = e.target.value; renderList(mount); }));

  mount.querySelector("#feed-cat").addEventListener("change", (e) => {
    state.cat = e.target.value; renderList(mount);
  });
  mount.querySelector("#feed-compact").addEventListener("change", (e) => {
    state.compact = e.target.checked; renderList(mount);
  });

  renderList(mount);
}

export default {
  seq: 1,
  id: "feed",
  layer: "view",
  match: (path) => path === "", // 루트
  key: () => "feed",            // 필터는 내부 관리 → 항상 동일 key
  render,
};
