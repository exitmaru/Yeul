// GET /api/auth/me — 지금 로그인한 사람 + 저장된 출생 정보(프로필)
import { json, bad, needDB, requireUser } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const gate = needDB(env); if (gate) return gate;
  const user = await requireUser(request, env);
  if (!user) return bad('로그인이 필요해', 401);
  const profile = await env.DB.prepare(
    'SELECT y, mo, d, h, mi, sex, time_unknown FROM profiles WHERE user_id = ?').bind(user.id).first();
  return json({ ok: true, user, profile: profile || null });
}
