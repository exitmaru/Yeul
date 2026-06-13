// =========================================================
// core/001-router.core.js
// 단일 라우터 — 모든 unit 이 여기에 "매달린다".
//   · 규칙(000-convention)을 고정 참조
//   · 2개 레이어: view(본문) + overlay(모달)
//   · view 는 key 가 바뀔 때만 다시 그려 스크롤/상태 보존
// =========================================================
import { CONVENTION } from "./000-convention.core.js";

const clean = (p) => decodeURIComponent(p).replace(/^\/+|\/+$/g, "");

export class Router {
  /** @param {{view:HTMLElement, overlay:HTMLElement}} slots */
  constructor(slots) {
    this.slots = slots;
    this.units = [];
    this._tok = 0;
    this._vkey = Symbol("init");
    this.convention = CONVENTION; // 규칙을 라우터에 고정
  }

  /** unit 등록 — { seq, id, layer:'view'|'overlay', match, render, key? } */
  register(unit) {
    if (!unit || !unit.id || !unit.layer) throw new Error("unit 형식 오류");
    this.units.push(unit);
    this.units.sort((a, b) => (a.seq || 999) - (b.seq || 999));
    return this;
  }

  start() {
    window.addEventListener("popstate", () => this.resolve());
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-route]");
      if (a && a.origin === location.origin) {
        e.preventDefault();
        this.navigate(a.getAttribute("href"));
      }
    });
    this.resolve();
    return this;
  }

  /** 경로 이동 */
  navigate(to, { replace = false } = {}) {
    if (to !== location.pathname + location.search) {
      history[replace ? "replaceState" : "pushState"]({}, "", to);
    }
    this.resolve();
  }

  /** 쿼리 파라미터만 갱신 (필터/모달 토글에 사용) */
  setQuery(patch, { replace = false } = {}) {
    const params = new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    this.navigate(location.pathname + (qs ? `?${qs}` : ""), { replace });
  }

  fresh(token) { return token === this._tok; }

  resolve() {
    const token = ++this._tok;
    const path = clean(location.pathname);
    const params = new URLSearchParams(location.search);
    const base = { path, params, token, router: this, fresh: (t) => this.fresh(t) };

    // --- view 레이어: key 가 바뀔 때만 재렌더 ---
    const view = this.units.find((u) => u.layer === "view" && u.match(path, params));
    const vkey = view ? `${view.id}|${view.key ? view.key(path, params) : path}` : null;
    if (vkey !== this._vkey) {
      this._vkey = vkey;
      window.scrollTo(0, 0);
      if (view) view.render({ ...base, mount: this.slots.view });
      else this.slots.view.innerHTML = "";
    }

    // --- overlay 레이어: 매번 평가 ---
    const overlay = this.units.find((u) => u.layer === "overlay" && u.match(path, params));
    if (overlay) overlay.render({ ...base, mount: this.slots.overlay });
    else this.slots.overlay.innerHTML = "";
  }
}
