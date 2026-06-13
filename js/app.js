// =========================================================
// app.js — 라우터 + 뷰 렌더링 + 전역 UI
// =========================================================
import * as gh from "./api.js";
import { renderMarkdown } from "./markdown.js";
import { esc, compact, fileSize, timeAgo, langColor, debounce } from "./util.js";

const app = document.getElementById("app");
let reqToken = 0; // 라우트 경합 방지용 토큰

// ---------------- 아이콘 ----------------
const ICON = {
  star: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z"/></svg>`,
  fork: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M6 8.2v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-3M12 15.8v-1.6"/></svg>`,
  issue: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>`,
  dir: `<svg class="ic dir" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>`,
  file: `<svg class="ic" viewBox="0 0 24 24"><path d="M14 3v5h5M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`,
};

// ---------------- 라우터 ----------------
function navigate(path, replace = false) {
  if (path !== location.pathname + location.search) {
    history[replace ? "replaceState" : "pushState"]({}, "", path);
  }
  route();
}

window.addEventListener("popstate", route);

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-route]");
  if (a && a.origin === location.origin) {
    e.preventDefault();
    navigate(a.getAttribute("href"));
  }
});

function route() {
  const token = ++reqToken;
  const path = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, "");
  const params = new URLSearchParams(location.search);
  window.scrollTo(0, 0);

  if (!path) {
    const q = params.get("q");
    if (q) { searchInput.value = q; return viewSearch(q, token); }
    searchInput.value = "";
    return viewHome(token);
  }
  const [owner, repo] = path.split("/");
  if (owner && repo) return viewRepo(owner, repo, token, params.get("path") || "");
  return viewHome(token);
}

const fresh = (token) => token === reqToken;

// ---------------- 공용 렌더 조각 ----------------
function repoCard(r) {
  return `
    <a class="card" href="/${r.full_name}" data-route>
      <div class="card-head">
        <img class="card-avatar" src="${r.owner.avatar_url}&s=52" alt="" loading="lazy">
        <div class="card-name"><span class="owner">${esc(r.owner.login)}/</span>${esc(r.name)}</div>
      </div>
      <div class="card-desc">${esc(r.description || "설명이 없습니다.")}</div>
      <div class="card-meta">
        ${r.language ? `<span><i class="dot" style="background:${langColor(r.language)}"></i>${esc(r.language)}</span>` : ""}
        <span>${ICON.star}${compact(r.stargazers_count)}</span>
        <span>${ICON.fork}${compact(r.forks_count)}</span>
        <span>업데이트 ${timeAgo(r.pushed_at || r.updated_at)}</span>
      </div>
    </a>`;
}

const skeletons = (n = 9) =>
  `<div class="skeleton-grid">${Array.from({ length: n }, () => `<div class="skeleton"></div>`).join("")}</div>`;

function errorView(err, retry) {
  const is404 = err.status === 404;
  return `
    <div class="error">
      <div class="big">${is404 ? "🔍" : "⚠️"}</div>
      <h2>${is404 ? "찾을 수 없어요" : "문제가 발생했어요"}</h2>
      <p>${esc(err.message || "알 수 없는 오류")}</p>
      <div class="btn-row">
        ${retry ? `<button class="btn" id="retry-btn">다시 시도</button>` : ""}
        <a class="btn ghost" href="/" data-route>홈으로</a>
      </div>
    </div>`;
}
function bindRetry(fn) {
  const b = document.getElementById("retry-btn");
  if (b) b.onclick = fn;
}

// ---------------- 홈 ----------------
async function viewHome(token) {
  app.innerHTML = `
    <section class="hero">
      <h1>코드의 우주를 <span class="grad">탐험</span>하다</h1>
      <p>GitHub 레포지토리를 빠르고 아름답게 둘러보세요. 검색하거나, 아래 추천에서 시작하세요.</p>
      <div class="chips">
        ${["language:rust stars:>1000", "topic:ai", "language:typescript", "tetris", "awesome", "language:go"]
          .map((c) => `<button class="chip" data-q="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
    </section>
    <div class="section-title">🔥 이번 달 떠오르는 레포</div>
    <div id="trending">${skeletons()}</div>`;

  app.querySelectorAll(".chip").forEach((c) =>
    (c.onclick = () => navigate(`/?q=${encodeURIComponent(c.dataset.q)}`)));

  try {
    const data = await gh.trending();
    if (!fresh(token)) return;
    const grid = document.getElementById("trending");
    grid.className = "grid";
    grid.innerHTML = data.items.length
      ? data.items.map(repoCard).join("")
      : `<p class="empty">표시할 레포가 없습니다.</p>`;
  } catch (err) {
    if (!fresh(token)) return;
    document.getElementById("trending").innerHTML = errorView(err, () => viewHome(token));
    bindRetry(() => viewHome(token));
  }
}

// ---------------- 검색 ----------------
async function viewSearch(q, token) {
  app.innerHTML = `
    <div class="section-title">“${esc(q)}” 검색 결과</div>
    <div id="results">${skeletons()}</div>`;
  try {
    const data = await gh.searchRepos(q);
    if (!fresh(token)) return;
    const grid = document.getElementById("results");
    if (!data.items.length) {
      grid.innerHTML = `<div class="empty"><div class="big">🫥</div><h2>결과가 없어요</h2><p>다른 키워드로 검색해 보세요.</p></div>`;
      return;
    }
    document.querySelector(".section-title").innerHTML =
      `“${esc(q)}” · 약 ${compact(data.total_count)}개 결과`;
    grid.className = "grid";
    grid.innerHTML = data.items.map(repoCard).join("");
  } catch (err) {
    if (!fresh(token)) return;
    document.getElementById("results").innerHTML = errorView(err, () => viewSearch(q, token));
    bindRetry(() => viewSearch(q, token));
  }
}

// ---------------- 레포 상세 ----------------
async function viewRepo(owner, repo, token, browsePath) {
  app.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
  let data;
  try {
    data = await gh.getRepo(owner, repo);
  } catch (err) {
    if (!fresh(token)) return;
    app.innerHTML = errorView(err, () => viewRepo(owner, repo, token, browsePath));
    bindRetry(() => viewRepo(owner, repo, token, browsePath));
    return;
  }
  if (!fresh(token)) return;

  const r = data;
  app.innerHTML = `
    <button class="back" onclick="history.length>1?history.back():null">${ICON.back} 뒤로</button>
    <header class="repo-header">
      <div class="repo-id">
        <img src="${r.owner.avatar_url}&s=104" alt="">
        <div>
          <h1><a href="https://github.com/${r.full_name}" target="_blank" rel="noopener"><span class="owner">${esc(r.owner.login)}/</span>${esc(r.name)}</a></h1>
          <p>${esc(r.description || "")}</p>
        </div>
      </div>
      <div class="stats">
        <div class="stat"><b>${compact(r.stargazers_count)}</b><span>Stars</span></div>
        <div class="stat"><b>${compact(r.forks_count)}</b><span>Forks</span></div>
        <div class="stat"><b>${compact(r.open_issues_count)}</b><span>Issues</span></div>
        <div class="stat"><b>${compact(r.subscribers_count ?? r.watchers_count)}</b><span>Watch</span></div>
      </div>
    </header>
    ${r.topics?.length ? `<div class="topics">${r.topics.map((t) => `<span class="topic">${esc(t)}</span>`).join("")}</div>` : ""}
    <div id="langs"></div>
    <div class="detail-grid">
      <div>
        <div class="panel" style="margin-bottom:22px">
          <div class="panel-head"><span>📁 파일</span><span id="browse-path"></span></div>
          <div id="files"><div class="loader"><div class="spinner"></div></div></div>
        </div>
        <div class="panel">
          <div class="panel-head"><span>📖 README</span></div>
          <div id="readme" class="readme"><div class="loader"><div class="spinner"></div></div></div>
        </div>
      </div>
      <aside>
        <div class="panel">
          <div class="panel-head"><span>ℹ️ 정보</span></div>
          <div class="panel-body">
            <div class="sidebar-block">
              <div class="kv"><span>기본 브랜치</span><b>${esc(r.default_branch)}</b></div>
              <div class="kv"><span>라이선스</span><b>${esc(r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : "없음")}</b></div>
              <div class="kv"><span>크기</span><b>${fileSize(r.size)}</b></div>
              <div class="kv"><span>생성</span><b>${new Date(r.created_at).toLocaleDateString("ko-KR")}</b></div>
              <div class="kv"><span>최근 푸시</span><b>${timeAgo(r.pushed_at)}</b></div>
            </div>
            ${r.homepage ? `<a class="btn ghost" style="width:100%;justify-content:center;margin-top:6px" href="${esc(r.homepage)}" target="_blank" rel="noopener">🔗 홈페이지</a>` : ""}
          </div>
        </div>
        <div class="panel" style="margin-top:18px">
          <div class="panel-head"><span>🧑‍💻 기여자</span></div>
          <div class="panel-body" id="contributors"><div class="spinner" style="width:24px;height:24px"></div></div>
        </div>
        <div class="panel" style="margin-top:18px">
          <div class="panel-head"><span>🕑 최근 커밋</span></div>
          <div id="commits"><div class="loader"><div class="spinner" style="width:24px;height:24px"></div></div></div>
        </div>
      </aside>
    </div>`;

  // 병렬 로드
  loadLanguages(owner, repo, token);
  loadFiles(owner, repo, r.default_branch, browsePath, token);
  loadReadme(owner, repo, r.default_branch, token);
  loadCommits(owner, repo, token);
  loadContributors(owner, repo, token);
}

async function loadLanguages(owner, repo, token) {
  try {
    const langs = await gh.getLanguages(owner, repo);
    if (!fresh(token)) return;
    const el = document.getElementById("langs");
    const entries = Object.entries(langs);
    if (!entries.length) return;
    const total = entries.reduce((s, [, v]) => s + v, 0);
    el.innerHTML = `
      <div class="lang-bar">${entries.map(([n, v]) =>
        `<div class="lang-seg" style="width:${(v / total * 100).toFixed(2)}%;background:${langColor(n)}" title="${esc(n)} ${(v / total * 100).toFixed(1)}%"></div>`).join("")}</div>
      <div class="lang-legend">${entries.slice(0, 6).map(([n, v]) =>
        `<span><i class="dot" style="background:${langColor(n)}"></i>${esc(n)} <b>${(v / total * 100).toFixed(1)}%</b></span>`).join("")}</div>`;
  } catch { /* 무시 */ }
}

async function loadFiles(owner, repo, ref, path, token) {
  const el = document.getElementById("files");
  const pathEl = document.getElementById("browse-path");
  try {
    const items = await gh.getContents(owner, repo, path, ref);
    if (!fresh(token)) return;
    const list = Array.isArray(items) ? items : [items];
    list.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));

    if (pathEl) {
      const parts = path ? path.split("/") : [];
      let acc = "";
      pathEl.innerHTML = `<a class="crumb" href="#" data-path="" style="color:var(--accent);text-decoration:none">${esc(repo)}</a>` +
        parts.map((p) => { acc = acc ? acc + "/" + p : p; return ` / <a class="crumb" href="#" data-path="${esc(acc)}" style="color:var(--accent);text-decoration:none">${esc(p)}</a>`; }).join("");
      pathEl.querySelectorAll(".crumb").forEach((c) =>
        (c.onclick = (e) => { e.preventDefault(); openPath(owner, repo, ref, c.dataset.path, token); }));
    }

    el.innerHTML = list.map((it) => {
      const up = it.type === "dir";
      const meta = up ? "" : fileSize(it.size, true);
      return `<a class="list-row" data-type="${it.type}" data-path="${esc(it.path)}" href="${up ? "#" : it.html_url}" ${up ? "" : 'target="_blank" rel="noopener"'}>
        ${up ? ICON.dir : ICON.file}<span>${esc(it.name)}</span><span class="meta">${meta}</span></a>`;
    }).join("") || `<p class="panel-body">빈 디렉터리</p>`;

    el.querySelectorAll('.list-row[data-type="dir"]').forEach((row) =>
      (row.onclick = (e) => { e.preventDefault(); openPath(owner, repo, ref, row.dataset.path, token); }));
  } catch (err) {
    if (!fresh(token)) return;
    el.innerHTML = `<p class="panel-body" style="color:var(--text-faint)">${esc(err.message)}</p>`;
  }
}

function openPath(owner, repo, ref, path, token) {
  // URL 동기화 (뒤로가기 지원)
  const qs = path ? `?path=${encodeURIComponent(path)}` : "";
  history.replaceState({}, "", `/${owner}/${repo}${qs}`);
  document.getElementById("files").innerHTML = `<div class="loader"><div class="spinner" style="width:24px;height:24px"></div></div>`;
  loadFiles(owner, repo, ref, path, token);
}

async function loadReadme(owner, repo, ref, token) {
  const el = document.getElementById("readme");
  try {
    const md = await gh.getReadme(owner, repo);
    if (!fresh(token)) return;
    const baseRaw = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}`;
    const baseBlob = `https://github.com/${owner}/${repo}/blob/${ref}`;
    el.innerHTML = renderMarkdown(md, baseRaw, baseBlob);
  } catch (err) {
    if (!fresh(token)) return;
    el.innerHTML = `<p style="color:var(--text-faint)">${err.status === 404 ? "README 가 없습니다." : esc(err.message)}</p>`;
  }
}

async function loadCommits(owner, repo, token) {
  const el = document.getElementById("commits");
  try {
    const commits = await gh.getCommits(owner, repo);
    if (!fresh(token)) return;
    el.innerHTML = commits.map((c) => {
      const a = c.author || c.commit.author;
      const avatar = c.author?.avatar_url || `https://avatars.githubusercontent.com/u/0?v=4`;
      return `<div class="commit">
        <img src="${avatar}&s=64" alt="" loading="lazy">
        <div style="min-width:0;flex:1">
          <p class="msg">${esc(c.commit.message.split("\n")[0])}</p>
          <p class="sub">${esc(a?.name || a?.login || "unknown")} · ${timeAgo(c.commit.author.date)}</p>
        </div>
        <a class="sha" href="${c.html_url}" target="_blank" rel="noopener">${c.sha.slice(0, 7)}</a>
      </div>`;
    }).join("") || `<p class="panel-body">커밋 없음</p>`;
  } catch (err) {
    if (!fresh(token)) return;
    el.innerHTML = `<p class="panel-body" style="color:var(--text-faint)">${esc(err.message)}</p>`;
  }
}

async function loadContributors(owner, repo, token) {
  const el = document.getElementById("contributors");
  try {
    const people = await gh.getContributors(owner, repo);
    if (!fresh(token)) return;
    el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:7px">${people.map((p) =>
      `<a href="${p.html_url}" target="_blank" rel="noopener" title="${esc(p.login)} · ${compact(p.contributions)} commits">
        <img src="${p.avatar_url}&s=68" alt="${esc(p.login)}" style="width:34px;height:34px;border-radius:50%;border:1px solid var(--border)">
      </a>`).join("")}</div>`;
  } catch {
    if (!fresh(token)) return;
    el.innerHTML = `<p style="color:var(--text-faint)">정보 없음</p>`;
  }
}

// ---------------- 전역 UI: 검색 / 테마 / 토큰 / 레이트리밋 ----------------
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return navigate("/");
  // "owner/repo" 형태면 바로 상세로
  const m = q.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (m) return navigate(`/${m[1]}/${m[2]}`);
  navigate(`/?q=${encodeURIComponent(q)}`);
});

// 키보드 단축키: "/" 로 검색 포커스
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault(); searchInput.focus();
  }
  if (e.key === "Escape" && document.activeElement === searchInput) searchInput.blur();
});

// 테마
const themeBtn = document.getElementById("theme-btn");
const savedTheme = localStorage.getItem("yeul.theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
themeBtn.onclick = () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("yeul.theme", next);
};

// 토큰 다이얼로그
const dialog = document.getElementById("token-dialog");
const tokenInput = document.getElementById("token-input");
document.getElementById("token-btn").onclick = () => {
  tokenInput.value = gh.getToken();
  dialog.showModal();
};
document.getElementById("token-form").addEventListener("submit", (e) => {
  if (e.submitter?.value === "clear") { gh.setToken(""); tokenInput.value = ""; }
  else gh.setToken(tokenInput.value);
  updateRate();
});

// 레이트리밋 표시
const rlEl = document.getElementById("ratelimit");
function updateRate() {
  const { remaining, limit } = gh.rate;
  const authed = !!gh.getToken();
  if (remaining == null) { rlEl.textContent = authed ? "🔑 인증됨" : ""; return; }
  rlEl.textContent = `${authed ? "🔑 " : ""}API ${remaining}/${limit}`;
  rlEl.style.color = remaining < 5 ? "var(--danger)" : "";
}
gh.onRate(updateRate);
updateRate();

// 최초 진입
route();
