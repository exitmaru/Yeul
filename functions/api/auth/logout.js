// POST /api/auth/logout — 세션 삭제 + 쿠키 만료
import { json, needDB, readCookie, sha256b64, sessionCookie } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const gate = needDB(env); if (gate) return gate;
  const token = readCookie(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256b64(token)).run();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}
