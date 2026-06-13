// =========================================================
// units/001-landing.unit.js
// 유닛 — 「탈예울」 영화 프로모션 원페이지. 라우터 view 레이어.
//   히어로 → 시놉시스 → 관객 → 장면(원문+시) → FAQ → 크레딧.
//   막(Act) 필터는 유닛 내부 상태로 관리(라우터 왕복 없음).
// =========================================================
import { BRAND, CREDITS, CTA, AUDIENCE, FAQ, FOOTER, ACTS } from "../knowledge/002-brand.knowledge.js";
import { getScenes } from "../knowledge/003-scenes.knowledge.js";
import { sceneCard, sectionHead, AUDIENCE_ICON, ICON } from "../knowledge/005-ui-kit.knowledge.js";
import { esc } from "../knowledge/001-formatters.knowledge.js";

const state = { act: "전체" };
let router;

function scenesFiltered() {
  return getScenes().filter((s) => state.act === "전체" || s.act === state.act);
}

function renderScenes(mount) {
  const grid = mount.querySelector("#scene-grid");
  const list = scenesFiltered();
  grid.innerHTML = list.map(sceneCard).join("");
  grid.querySelectorAll(".scene-card").forEach((card) => {
    const open = () => router.setQuery({ id: card.dataset.id });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
}

function render({ mount, router: r }) {
  router = r;
  mount.innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <span class="eyebrow center">전국퇴사자연합 presents</span>
      <h1 class="hero-title">
        <span class="ko">${esc(BRAND.titleKo)}</span>
        <span class="hanja">${esc(BRAND.titleHanja)}</span>
      </h1>
      <p class="hero-roman">${esc(BRAND.titleRoman)}</p>
      <p class="hero-sub">${esc(BRAND.subtitle)}</p>
      <p class="hero-logline">${esc(BRAND.logline)}</p>
      <div class="hero-cta">
        <button class="btn primary" data-scroll="#scenes">${CTA.primary} ${ICON.arrow}</button>
        <button class="btn ghost" data-open="001">${ICON.play} ${CTA.trailer}</button>
      </div>
      <p class="hero-release">${esc(BRAND.release.main)}</p>
      <!-- 이미지 자리: 메인 포스터 (사용자 생성 예정) -->
      <figure class="poster" role="img" aria-label="메인 포스터 자리">
        <div class="poster-inner">
          <span class="poster-tag">KEY ART</span>
          <p class="poster-quote gungseo">“${esc(BRAND.taglines[0])}”</p>
          <span class="poster-note">메인 포스터 이미지 자리</span>
        </div>
      </figure>
    </section>

    <!-- SYNOPSIS -->
    <section class="band">
      ${sectionHead("SYNOPSIS", "시놉시스", "")}
      <p class="synopsis">${esc(BRAND.synopsis)}</p>
      <div class="taglines">
        ${BRAND.taglines.map((t) => `<p class="tagline gungseo">${esc(t)}</p>`).join("")}
      </div>
    </section>

    <!-- WHO'S IT FOR -->
    <section class="band">
      ${sectionHead("WHO'S IT FOR", "이런 당신에게", "")}
      <div class="aud-grid">
        ${AUDIENCE.map((a) => `
          <article class="aud-card">
            <span class="aud-ico">${AUDIENCE_ICON[a.icon] || ""}</span>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.desc)}</p>
          </article>`).join("")}
      </div>
    </section>

    <!-- SCENES -->
    <section class="band" id="scenes">
      ${sectionHead("SCENES", "원문과 시, 여섯 개의 장면", "직장의 한 컷이 원문이 되고, 그 옆에 시가 선다. 한 장면을 열어 전문을 읽고, 복사하세요.")}
      <div class="act-tabs" role="tablist">
        ${ACTS.map((a) => `<button class="act-tab${a === state.act ? " on" : ""}" data-act="${esc(a)}" role="tab">${esc(a)}</button>`).join("")}
      </div>
      <div id="scene-grid" class="scene-grid"></div>
    </section>

    <!-- FAQ -->
    <section class="band">
      ${sectionHead("FAQ", "자주 묻는 질문", "")}
      <div class="faq">
        ${FAQ.map((f) => `
          <details class="faq-item">
            <summary>${esc(f.q)}</summary>
            <p>${esc(f.a)}</p>
          </details>`).join("")}
      </div>
    </section>

    <!-- CREDITS -->
    <section class="band credits-band">
      ${sectionHead("CREDITS", "엔딩 크레딧", "")}
      <ul class="credits">
        ${CREDITS.map((c) => `<li>${esc(c)}</li>`).join("")}
      </ul>
      <p class="rating">${esc(BRAND.release.rating)}</p>
      <p class="rating sub">${esc(BRAND.release.sub)}</p>
    </section>

    <footer class="site-footer">${esc(FOOTER)}</footer>`;

  // 부드러운 스크롤 CTA
  mount.querySelectorAll("[data-scroll]").forEach((b) =>
    (b.onclick = () => mount.querySelector(b.dataset.scroll)?.scrollIntoView({ behavior: "smooth" })));
  // 예고편 = 장면 열기
  mount.querySelectorAll("[data-open]").forEach((b) =>
    (b.onclick = () => router.setQuery({ id: b.dataset.open })));
  // 막 필터
  mount.querySelectorAll(".act-tab").forEach((tab) =>
    (tab.onclick = () => {
      state.act = tab.dataset.act;
      mount.querySelectorAll(".act-tab").forEach((t) => t.classList.toggle("on", t === tab));
      renderScenes(mount);
    }));

  renderScenes(mount);
}

export default {
  seq: 1,
  id: "landing",
  layer: "view",
  match: (path) => path === "",
  key: () => "landing",
  render,
};
