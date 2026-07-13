// POST /api/auth/signup — 간단 가입: 이메일 + 비밀번호(8자+) + 부를 이름
import { json, bad, needDB, hashPassword, createSession, sessionCookie, normEmail } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const gate = needDB(env); if (gate) return gate;

  let body; try { body = await request.json(); } catch { return bad('JSON 본문이 필요해'); }
  const email = normEmail(body.email);
  const pw = String(body.password || '');
  const name = String(body.name || '').trim().slice(0, 20);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('이메일 형식을 확인해줘');
  if (pw.length < 8) return bad('비밀번호는 8자 이상이면 돼');
  if (!name) return bad('부를 이름(닉네임)을 알려줘');

  const dup = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (dup) return bad('이미 가입된 이메일이야 — 로그인으로 들어와', 409);

  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO users (id, email, pw_hash, name, created_at) VALUES (?,?,?,?,?)')
    .bind(id, email, await hashPassword(pw), name, Date.now()).run();

  const token = await createSession(env.DB, id);
  return json({ ok: true, user: { id, email, name } }, 201, { 'set-cookie': sessionCookie(token) });
}
