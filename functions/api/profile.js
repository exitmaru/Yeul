// /api/profile — 출생 정보 저장·조회 (계정 귀속 · 시간 미상 허용)
// GET = 조회, PUT = 저장(업서트). 계산은 전부 클라이언트 manse 엔진이 함 — 서버는 보관만.
import { json, bad, needDB, requireUser } from './_lib.js';

export async function onRequestGet({ request, env }) {
  const gate = needDB(env); if (gate) return gate;
  const user = await requireUser(request, env);
  if (!user) return bad('로그인이 필요해', 401);
  const profile = await env.DB.prepare(
    'SELECT y, mo, d, h, mi, sex, time_unknown FROM profiles WHERE user_id = ?').bind(user.id).first();
  return json({ ok: true, profile: profile || null });
}

export async function onRequestPut({ request, env }) {
  const gate = needDB(env); if (gate) return gate;
  const user = await requireUser(request, env);
  if (!user) return bad('로그인이 필요해', 401);

  let b; try { b = await request.json(); } catch { return bad('JSON 본문이 필요해'); }
  const p = {
    y: +b.y, mo: +b.mo, d: +b.d, h: +b.h, mi: +b.mi,
    sex: +b.sex, time_unknown: b.time_unknown ? 1 : 0,
  };
  if (!(p.y >= 1900 && p.y <= 2050)) return bad('년도는 1900~2050 사이로');
  if (!(p.mo >= 1 && p.mo <= 12) || !(p.d >= 1 && p.d <= 31)) return bad('월·일을 확인해줘');
  if (p.time_unknown) { p.h = 12; p.mi = 0; } // 미상 = 정오 고정(시주 의존 판정은 클라이언트가 보류 처리)
  else if (!(p.h >= 0 && p.h <= 23) || !(p.mi >= 0 && p.mi <= 59)) return bad('시·분을 확인해줘');
  if (p.sex !== 1 && p.sex !== 2) return bad('성별을 골라줘');

  await env.DB.prepare(
    'INSERT INTO profiles (user_id, y, mo, d, h, mi, sex, time_unknown, updated_at) VALUES (?,?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(user_id) DO UPDATE SET y=excluded.y, mo=excluded.mo, d=excluded.d, h=excluded.h, mi=excluded.mi, ' +
    'sex=excluded.sex, time_unknown=excluded.time_unknown, updated_at=excluded.updated_at')
    .bind(user.id, p.y, p.mo, p.d, p.h, p.mi, p.sex, p.time_unknown, Date.now()).run();

  return json({ ok: true, profile: p });
}
