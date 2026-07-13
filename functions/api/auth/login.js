// POST /api/auth/login — 이메일 + 비밀번호 로그인
import { json, bad, needDB, verifyPassword, createSession, sessionCookie, normEmail } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const gate = needDB(env); if (gate) return gate;

  let body; try { body = await request.json(); } catch { return bad('JSON 본문이 필요해'); }
  const email = normEmail(body.email);
  const pw = String(body.password || '');

  const user = await env.DB.prepare('SELECT id, email, pw_hash, name FROM users WHERE email = ?').bind(email).first();
  // 계정 존재 여부를 노출하지 않는 공통 문구(계정 털이 방지)
  if (!user || !(await verifyPassword(pw, user.pw_hash))) return bad('이메일 또는 비밀번호가 맞지 않아', 401);

  const token = await createSession(env.DB, user.id);
  return json({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, 200, { 'set-cookie': sessionCookie(token) });
}
