// functions/api/_lib.js — 서버 계정 공용 헬퍼 (Cloudflare Pages Functions)
// 외부 의존 0: 해시(PBKDF2)·세션 토큰·쿠키 전부 웹 표준(Web Crypto)만 사용.
// D1 바인딩 이름 = DB (docs/서버계정_설정.md 참고).

const enc = new TextEncoder();

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

export const bad = (error, status = 400) => json({ ok: false, error }, status);

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// ── 비밀번호 해시: PBKDF2-SHA256 · 사용자별 랜덤 솔트 · 반복수는 해시 문자열에 기록(나중에 올려도 검증 호환)
const ITER = 60000;

async function pbkdf2(pw, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
}

export async function hashPassword(pw, iter = ITER) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const dk = await pbkdf2(pw, salt, iter);
  return `v1:${iter}:${b64(salt)}:${b64(dk)}`;
}

export async function verifyPassword(pw, stored) {
  try {
    const [v, iterS, saltS, dkS] = String(stored).split(':');
    if (v !== 'v1') return false;
    const dk = new Uint8Array(await pbkdf2(pw, unb64(saltS), +iterS));
    const ref = unb64(dkS);
    if (dk.length !== ref.length) return false;
    let diff = 0;
    for (let i = 0; i < dk.length; i++) diff |= dk[i] ^ ref[i]; // 상수 시간 비교
    return diff === 0;
  } catch { return false; }
}

// ── 세션: 토큰 원문은 쿠키에만, DB에는 SHA-256 해시만 저장(DB가 새어도 세션 위조 불가)
export const SESSION_DAYS = 30;

export async function sha256b64(s) {
  return b64(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

export async function createSession(db, userId) {
  const token = b64(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  await db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?,?,?,?)')
    .bind(await sha256b64(token), userId, now + SESSION_DAYS * 864e5, now).run();
  return token;
}

export function sessionCookie(token, maxAgeDays = SESSION_DAYS) {
  const base = `sid=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  return maxAgeDays > 0 ? `${base}; Max-Age=${maxAgeDays * 86400}` : `${base}; Max-Age=0`;
}

export function readCookie(request, name = 'sid') {
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

// 세션 쿠키 → 유저. 없거나 만료면 null.
export async function requireUser(request, env) {
  const token = readCookie(request);
  if (!token || !env.DB) return null;
  const row = await env.DB.prepare(
    'SELECT u.id AS id, u.email AS email, u.name AS name, s.expires_at AS expires_at ' +
    'FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?')
    .bind(await sha256b64(token)).first();
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name };
}

export const normEmail = (e) => String(e || '').trim().toLowerCase();

// D1 미연결(설정 전) 안내 — 클라이언트가 이 코드를 보고 "서버 준비 전" 모드로 전환
export const needDB = (env) => (env.DB ? null : bad('서버 준비 전 — D1 바인딩(DB)이 아직 없어. docs/서버계정_설정.md 순서대로 연결해줘.', 503));
