// =========================================================
// api.js — GitHub REST API 래퍼
//   - 토큰은 localStorage 에만 저장 (서버 전송 X)
//   - 응답 캐시 + 레이트리밋 추적
// =========================================================

const BASE = "https://api.github.com";
const TOKEN_KEY = "yeul.token";
const cache = new Map();

export const rate = { remaining: null, limit: null, reset: null };
const listeners = new Set();
export function onRate(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t.trim());
  else localStorage.removeItem(TOKEN_KEY);
  cache.clear();
}

export class GitHubError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(path, { raw = false, signal } = {}) {
  const url = path.startsWith("http") ? path : BASE + path;
  if (!raw && cache.has(url)) return cache.get(url);

  const headers = { Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { headers, signal });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new GitHubError("네트워크 오류 — 연결을 확인해 주세요.", 0);
  }

  // 레이트리밋 갱신
  if (res.headers.has("x-ratelimit-remaining")) {
    rate.remaining = +res.headers.get("x-ratelimit-remaining");
    rate.limit = +res.headers.get("x-ratelimit-limit");
    rate.reset = +res.headers.get("x-ratelimit-reset") * 1000;
    listeners.forEach((fn) => fn(rate));
  }

  if (!res.ok) {
    if (res.status === 403 && rate.remaining === 0) {
      const mins = Math.max(1, Math.ceil((rate.reset - Date.now()) / 60000));
      throw new GitHubError(`요청 한도를 초과했습니다. 약 ${mins}분 후 다시 시도하거나 토큰을 등록하세요.`, 403);
    }
    if (res.status === 404) throw new GitHubError("찾을 수 없습니다.", 404);
    const body = await res.json().catch(() => ({}));
    throw new GitHubError(body.message || `요청 실패 (${res.status})`, res.status);
  }

  const data = raw ? await res.text() : await res.json();
  if (!raw) cache.set(url, data);
  return data;
}

// ---- 엔드포인트 ----

export function searchRepos(q, { sort = "stars", order = "desc", per_page = 30, signal } = {}) {
  const params = new URLSearchParams({ q, sort, order, per_page });
  return request(`/search/repositories?${params}`, { signal });
}

/** 기본 홈 화면: 최근 한 달 인기 레포 */
export function trending({ signal } = {}) {
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  return searchRepos(`created:>${since} stars:>50`, { sort: "stars", signal });
}

export function getRepo(owner, repo, opts) {
  return request(`/repos/${owner}/${repo}`, opts);
}
export function getLanguages(owner, repo, opts) {
  return request(`/repos/${owner}/${repo}/languages`, opts);
}
export function getReadme(owner, repo, opts) {
  return request(`/repos/${owner}/${repo}/readme`, { raw: true, ...opts });
}
export function getContents(owner, repo, path = "", ref, opts) {
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return request(`/repos/${owner}/${repo}/contents/${path}${q}`, opts);
}
export function getCommits(owner, repo, { per_page = 8, signal } = {}) {
  return request(`/repos/${owner}/${repo}/commits?per_page=${per_page}`, { signal });
}
export function getContributors(owner, repo, { per_page = 12, signal } = {}) {
  return request(`/repos/${owner}/${repo}/contributors?per_page=${per_page}`, { signal });
}
