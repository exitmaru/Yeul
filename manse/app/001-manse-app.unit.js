// 001-manse-app.unit.js — 글래스 만세력 앱 유닛 (paper-shaders 배경 + 모바일 앱 쉘)
// 지식·계산은 manse/js 모듈 재사용. 이 파일은 앱 쉘 상호작용 + 렌더만.

import { STEMS, BRANCHES, ELEMENTS } from '../js/knowledge/001-ganji.knowledge.js';
import { buildSaju, runSelfTest } from '../js/core/002-saju-engine.core.js';
import { SIPSIN_KEYWORDS } from '../js/knowledge/006-sipsin-keywords.knowledge.js';
import { CHEONGAN_ARCHETYPE } from '../js/knowledge/011-cheongan-archetype.knowledge.js';
import { JIJI_ARCHETYPE, JIJI_ROLE } from '../js/knowledge/012-jiji-archetype.knowledge.js';
import { UNSEONG_MEANING } from '../js/knowledge/013-unseong-meaning.knowledge.js';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const elVar = { 목: 'var(--el-mok)', 화: 'var(--el-hwa)', 토: 'var(--el-to)', 금: 'var(--el-geum)', 수: 'var(--el-su)' };

// 기둥(간지) → 60갑자 캐릭터 태그. 매핑·경로 로직은 전부 리졸버가 소유(여기선 배치만).
// 리졸버가 없는 배포(빌드 출력이 manse 폴더라 /assets가 안 실리는 경우)에서도 앱은 살아야 하므로
// 동적 임포트 + 실패 시 이미지 생략 폴백 — 글자·계산·가입은 전부 정상 동작.
let charTag = () => '';
try {
  const cm = await import('/assets/images/characters/character-map.js');
  charTag = (s, b, cls, size) => cm.imgTag(cm.ganji(s, b), { size, cls });
} catch { console.warn('character-map 미탑재 배포 — 마스코트 이미지 생략(폴백)'); }

// ── 셰이더 톤 프리셋 (grainGradient · 무채 기본 / 레드 대안) ──
const TONES = {
  mono: { colorBack: '#0b0b0d', colors: ['#26262c', '#4a4a52', '#141417'] },
  red:  { colorBack: '#120507', colors: ['#4a0d18', '#8c1f2f', '#200608'] },
};
const SHADER_BASE = { shape: 'blob', softness: 0.85, intensity: 0.5, noise: 0.3, speed: 0.5, scale: 1, fit: 'cover' };

const birth = { y: 1990, mo: 5, d: 15, h: 12, mi: 30, sex: 1, timeUnknown: false };
const OPTS = { trueSolar: true, eot: true, apply1954: true, lon: 126.98, jasiMode: '야자시', daeunRound: '반올림', sinsalBase: '년지', daeunCount: 8, seunCount: 12 };

// ── 서버 계정 (/api = Pages Functions + D1 · 미배포/미설정 환경은 자동 게스트 모드) ──
let me = null;          // 로그인 유저 {id, email, name}
let hasProfile = false; // 서버에 출생 정보 저장돼 있나
let apiReady = true;    // /api 자체가 없는 환경(로컬 정적 서버 등) = false
let customized = false; // 게스트가 직접 출생 정보를 입력했나(예시 라벨 제거용)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(path, opt = {}) {
  const r = await fetch('/api' + path, { headers: { 'content-type': 'application/json' }, ...opt });
  let d = null; try { d = await r.json(); } catch { /* JSON 아님(404 HTML 등) */ }
  if (!r.ok) throw Object.assign(new Error((d && d.error) || `HTTP ${r.status}`), { status: r.status, data: d });
  return d;
}

function applyProfile(p) {
  birth.y = p.y; birth.mo = p.mo; birth.d = p.d; birth.h = p.h; birth.mi = p.mi;
  birth.sex = p.sex; birth.timeUnknown = !!p.time_unknown;
  hasProfile = true;
}

async function initAuth() {
  try {
    const d = await api('/auth/me');
    me = d.user;
    if (d.profile) applyProfile(d.profile);
  } catch (e) {
    if (e.status === 401) me = null;   // 정상: 아직 미로그인
    else apiReady = false;             // 404·503·네트워크 = 서버 미준비 → 게스트 모드
  }
}

let bgCtl = null;

function setTone(tone) {
  document.body.dataset.tone = tone;
  if (bgCtl) bgCtl.set(TONES[tone]);
  $('#btnTone').textContent = tone === 'mono' ? '톤: 무채' : '톤: 레드';
}

function gl(idx, isStem, pos) {
  const g = isStem ? STEMS[idx] : BRANCHES[idx];
  return `<span class="gl" role="button" tabindex="0" data-pos="${pos}" data-t="${isStem ? 'stem' : 'branch'}" style="--el:${elVar[g.el]}">${g.han}<small>${g.kor}·${g.el}</small></span>`;
}

let last = null; // 최근 계산 결과(사전 카드가 참조)
let figNotes = null; // FigJam 해석 노트(본인 정리) — mount에서 로드

// 십신/글자에 맞는 해석 노트 추리기(참고용)
function notesFor(sipsin, han, kor) {
  if (!figNotes) return [];
  const pool = [...(figNotes.십신 || []), ...(figNotes.격국패턴 || []), ...(figNotes.천간론 || []), ...(figNotes.지지론 || [])];
  const keys = [sipsin, han, kor].filter(Boolean);
  const hit = pool.filter((it) => keys.some((k) => it.note.includes(k)));
  const uniq = [...new Map(hit.map((it) => [it.note, it])).values()];
  return uniq.slice(0, 5);
}

function render() {
  const r = buildSaju(birth, OPTS);
  last = r;
  const who = me ? `${me.name} · ` : (customized ? '' : '예시 · ');
  const hm = birth.timeUnknown ? '시간 미상' : `${String(birth.h).padStart(2, '0')}:${String(birth.mi).padStart(2, '0')}`;
  $('#whoLine').textContent = `${who}${birth.y}.${birth.mo}.${birth.d} ${hm} ${birth.sex === 1 ? '남' : '여'} · 서울`;

  $('#pillars').innerHTML = ['시주', '일주', '월주', '년주'].map((k) => {
    const p = r.pillars[k];
    const dim = k === '시주' && birth.timeUnknown ? ' dim' : '';
    return `<div class="pcell${dim}">
      <div class="lab">${k === '시주' && birth.timeUnknown ? '시주 · 미상' : k}</div>
      ${charTag(p.stem, p.branch, 'pchar', 44)}
      <div class="ss">${p.stemSipsin}</div>
      ${gl(p.stem, true, k)}${gl(p.branch, false, k)}
      <div class="ss">${p.branchSipsin}</div>
      <div class="jjg">${p.jijanggan.map((j) => j.stem).join('·')}</div>
      <div><span class="mini">${p.unseong}</span><span class="mini">${p.sinsal}</span></div>
    </div>`;
  }).join('');

  const corr = Math.round(r.ts.corrMin);
  const relChips = r.relations.flatMap((x) => x.rel.map((rr) =>
    `<span class="chip">${BRANCHES[x.a].han}${BRANCHES[x.b].han} <b>${rr.type}${rr.el ? '·' + rr.el : ''}</b></span>`));
  const patChips = r.patterns.map((p) => `<span class="chip acc" title="${p.gloss}">${p.key}</span>`);
  $('#meta').innerHTML = [
    `<span class="chip">보정 <b>${corr >= 0 ? '+' : ''}${corr}분</b></span>`,
    `<span class="chip">공망 <b>${r.gongmang.map((i) => BRANCHES[i].han).join('·')}</b></span>`,
    `<span class="chip acc">${r.yongsin.gyeokguk}</span>`,
    ...relChips, ...patChips,
  ].join('');

  const maxN = Math.max(...ELEMENTS.map((e) => r.counts[e]), 1);
  $('#bars').innerHTML = ELEMENTS.map((e) => `
    <div class="bar"><span>${e}</span>
      <div class="track"><div class="fill" style="width:${(r.counts[e] / maxN) * 100}%;background:${elVar[e]}"></div></div>
      <b>${r.counts[e]}</b></div>`).join('');

  $('#gauge').innerHTML = `<b>${r.strength}</b>
    <div class="track"><div class="fill" style="width:${Math.min(100, (r.score / 90) * 100)}%"></div></div>
    <span>${r.score}/90</span>`;
  $('#yongsin').innerHTML = [
    r.yongsin.eokbu ? `<span class="chip acc">억부 후보 <b>${r.yongsin.eokbu}</b></span>` : '<span class="chip">억부: 중화(보류)</span>',
    r.yongsin.johu ? `<span class="chip acc">조후 후보 <b>${r.yongsin.johu}</b></span>` : '<span class="chip">조후: 해당 없음</span>',
  ].join('');

  $('#daeunHint').textContent = `대운수 ${r.daeunSu} · ${r.forward ? '순행' : '역행'}`;
  $('#daeun').innerHTML = r.daeun.map((d) => `
    <div class="scell"><div class="age">${d.age}세</div>
      <div class="gj"><span style="color:${elVar[STEMS[d.stem].el]}">${STEMS[d.stem].han}</span><span style="color:${elVar[BRANCHES[d.branch].el]}">${BRANCHES[d.branch].han}</span></div>
      <div class="ss">${d.stemSipsin}</div></div>`).join('');

  const nowY = new Date().getFullYear();
  $('#seun').innerHTML = r.seun.map((s) => `
    <div class="scell${s.year === nowY ? ' now' : ''}"><div class="age">${s.year}</div>
      <div class="gj"><span style="color:${elVar[STEMS[s.stem].el]}">${STEMS[s.stem].han}</span><span style="color:${elVar[BRANCHES[s.branch].el]}">${BRANCHES[s.branch].han}</span></div>
      <div class="ss">${s.stemSipsin}</div></div>`).join('');

  const t = r.today;
  $('#today').innerHTML = [
    `<span class="chip">년운 <b>${STEMS[t.year.stem].han}${BRANCHES[t.year.branch].han}</b></span>`,
    `<span class="chip">월운 <b>${STEMS[t.month.stem].han}${BRANCHES[t.month.branch].han}</b></span>`,
    `<span class="chip acc">일운 <b>${STEMS[t.day.stem].han}${BRANCHES[t.day.branch].han}</b></span>`,
  ].join('');

  // 리빌 재생
  $$('.rv').forEach((el, i) => { el.classList.remove('in'); setTimeout(() => el.classList.add('in'), 40 + i * 90); });
}

function goTab(name) {
  $$('.tab').forEach((b) => b.classList.toggle('on', b.dataset.go === name));
  $$('main section').forEach((s) => { s.hidden = s.dataset.tab !== name; });
  $$('main section:not([hidden]) .rv').forEach((el, i) => {
    el.classList.remove('in'); setTimeout(() => el.classList.add('in'), 40 + i * 90);
  });
}

function sheet(open) {
  $('#sheet').classList.toggle('open', open);
  $('#scrim').classList.toggle('on', open);
}

// ── 계정 시트: 간단 가입 / 로그인 / 로그아웃 ──
let acctMode = 'signup';

function paintChrome() {
  $('#btnAcctOpen').textContent = me ? me.name.slice(0, 5) : '계정';
  $('#btnApply').textContent = me ? '저장하고 보기' : '원국 보기';
}
function acctMsgSet(t) { const el = $('#acctMsg'); el.hidden = !t; if (t) el.textContent = t; }

function openAcct(mode) {
  acctMode = mode || 'signup';
  paintAcct();
  sheet(false); closeDict();
  $('#acct').classList.add('open'); $('#scrim').classList.add('on');
}
function closeAcct() { $('#acct').classList.remove('open'); $('#scrim').classList.remove('on'); }

function paintAcct() {
  acctMsgSet('');
  const logged = !!me;
  $('#acctForm').hidden = logged;
  $('#acctWho').hidden = !logged;
  if (logged) {
    $('#acctTitle').innerHTML = `계정 <span class="hint">${esc(me.email)}</span>`;
    $('#acctWho').innerHTML = `<b>${esc(me.name)}</b>(으)로 로그인돼 있어 — 출생 정보는 계정에 저장돼.`;
    $('#btnAcct').textContent = '로그아웃';
    $('#acctSwap').hidden = true;
  } else {
    const su = acctMode === 'signup';
    $('#acctTitle').innerHTML = su
      ? '간단 가입 <span class="hint">서버 계정 · 폰 바꿔도 그대로</span>'
      : '로그인 <span class="hint">다시 온 걸 환영해</span>';
    $('#ac-nameL').hidden = !su;
    $('#ac-pw').setAttribute('autocomplete', su ? 'new-password' : 'current-password');
    $('#btnAcct').textContent = su ? '가입하고 시작' : '로그인';
    $('#acctSwap').hidden = false;
    $('#acctSwap').textContent = su ? '이미 계정 있어? 로그인' : '처음이야? 간단 가입';
    if (!apiReady) acctMsgSet('아직 서버 연결 전이야(D1 미설정) — 지금은 구경 모드로 볼 수 있어');
  }
}

async function submitAcct() {
  if (me) { // 로그인 상태의 버튼 = 로그아웃
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* 세션 만료여도 무시 */ }
    me = null; hasProfile = false;
    paintChrome(); paintAcct(); render();
    return;
  }
  const email = $('#ac-email').value, password = $('#ac-pw').value, name = $('#ac-name').value;
  const btn = $('#btnAcct'); btn.disabled = true;
  try {
    if (acctMode === 'signup') {
      me = (await api('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) })).user;
    } else {
      me = (await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })).user;
      try { const m = await api('/auth/me'); if (m.profile) applyProfile(m.profile); } catch { /* 프로필 아직 없음 */ }
    }
    paintChrome(); closeAcct(); render();
    if (!hasProfile) sheet(true); // 가입 직후 = 출생 정보부터
    else goTab('wonguk');
  } catch (e) {
    acctMsgSet(e.status === 503
      ? '서버 준비 전이야(D1 미연결) — docs/서버계정_설정.md 순서대로 연결하면 열려'
      : (e.data && e.data.error) || '잠깐 문제가 생겼어 — 다시 한번 해줘');
  } finally { btn.disabled = false; }
}

// ── 글자 사전 카드: 원국 글자 탭 → 물상·키워드·운성·십신·신살 (지식모듈 소비) ──
const tagRow = (label, arr) => arr && arr.length
  ? `<div class="d-row"><span class="d-k">${label}</span><span class="d-v">${arr.map((t) => `<span class="mini">${t}</span>`).join('')}</span></div>` : '';

function openDict(pos, t) {
  if (!last) return;
  const p = last.pillars[pos];
  const isStem = t === 'stem';
  const g = isStem ? STEMS[p.stem] : BRANCHES[p.branch];
  const sipsin = isStem ? p.stemSipsin : p.branchSipsin;
  const kw = SIPSIN_KEYWORDS[sipsin];
  let body = `
    <div class="d-head">
      ${charTag(p.stem, p.branch, 'dchar', 60)}
      <span class="gl" style="--el:${elVar[g.el]};font-size:44px;margin:0">${g.han}<small>${g.kor}·${g.el}${g.yang ? '·양' : '·음'}</small></span>
      <div><b>${pos} ${isStem ? '천간' : '지지'}</b><div class="hint">${sipsin === '일간(我)' ? '일간(나 자신)' : sipsin}</div></div>
    </div>`;
  if (isStem) {
    const a = CHEONGAN_ARCHETYPE[g.han];
    body += (a ? `<div class="d-row"><span class="d-k">물상</span><span class="d-v">${a.물상}</span></div>${tagRow('키워드', a.키워드)}${tagRow('주의', a.주의)}` : '');
  } else {
    const a = JIJI_ARCHETYPE[g.han];
    const role = a && JIJI_ROLE[a.자리];
    body += (a ? `<div class="d-row"><span class="d-k">물상</span><span class="d-v">${a.물상}</span></div>
      <div class="d-row"><span class="d-k">자리</span><span class="d-v">${a.자리} · ${role ? role.gloss : ''}</span></div>
      <div class="d-row"><span class="d-k">계절/월</span><span class="d-v">${a.계절} · ${a.월}월</span></div>
      ${tagRow('키워드', a.키워드)}` : '');
    body += `<div class="d-row"><span class="d-k">지장간</span><span class="d-v">${p.jijanggan.map((j) => j.stem).join(' · ')}</span></div>`;
    const um = UNSEONG_MEANING[p.unseong];
    body += `<div class="d-row"><span class="d-k">십이운성</span><span class="d-v"><b>${p.unseong}</b>${um ? ` <span class="hint">${um.phase}</span>` : ''}</span></div>`;
    if (um) body += tagRow('운성 의미', um.키워드);
    body += `<div class="d-row"><span class="d-k">신살</span><span class="d-v">${p.sinsal}</span></div>`;
  }
  if (kw) body += `${tagRow('십신 관계', kw.관계)}${tagRow('미약 경향', kw.미약)}${tagRow('과다 경향', kw.과다)}`;

  // FigJam 해석 노트(본인 정리) — 매칭되는 것만
  const notes = notesFor(sipsin, g.han, g.kor);
  if (notes.length) {
    body += `<h3 style="margin:14px 0 6px;font-size:12px;color:var(--sub)">해석 노트 <span class="hint">· 본인 정리</span></h3>` +
      notes.map((n) => `<div class="d-note">${n.note}${n.source ? `<span class="d-src">출처 ${n.source}</span>` : ''}</div>`).join('');
  }
  body += `<p class="statline sub" style="margin-top:10px">※ 물상·키워드·운성 의미는 공개 통설, 해석 노트는 본인 정리 — 전부 <b>참고용</b>. 맥락·강약 무시한 단정은 금물.</p>`;
  $('#dictBody').innerHTML = body;
  $('#dict').classList.add('open');
  $('#scrim').classList.add('on');
}
function closeDict() { $('#dict').classList.remove('open'); $('#scrim').classList.remove('on'); }

export async function mount() {
  // 배경 셰이더 마운트(실패해도 CSS 폴백 유지)
  try {
    if (window.PaperBG) bgCtl = window.PaperBG.mount($('#bg'), { ...SHADER_BASE, ...TONES.mono });
  } catch (e) { console.warn('shader fallback:', e); }

  // FigJam 해석 노트 로드(실패해도 앱은 동작)
  fetch('../db/figjam_notes.json').then((r) => r.ok ? r.json() : null)
    .then((j) => { figNotes = j && j.data; }).catch(() => {});

  // 서버 계정 확인(로그인 상태·저장된 출생 정보) — /api 없는 환경이면 게스트 모드
  await initAuth();
  paintChrome();

  // 입력 바인딩
  for (const [k, sel] of Object.entries({ y: '#in-y', mo: '#in-mo', d: '#in-d', h: '#in-h', mi: '#in-mi', sex: '#in-sex' })) {
    const el = $(sel); el.value = birth[k];
    el.addEventListener('change', () => { birth[k] = +el.value; });
  }
  // 시간 미상 체크 — 시·분 입력 잠금, 계산은 정오 고정 + 시주 참고 제외 표기
  const tu = $('#in-tu');
  const setTimeDisabled = () => { $('#in-h').disabled = $('#in-mi').disabled = birth.timeUnknown; };
  tu.checked = birth.timeUnknown;
  tu.addEventListener('change', () => { birth.timeUnknown = tu.checked; setTimeDisabled(); });
  setTimeDisabled();

  $('#btnApply').addEventListener('click', async () => {
    if (birth.timeUnknown) { birth.h = 12; birth.mi = 0; }
    customized = true;
    if (me && apiReady) { // 서버 계정에 저장(실패해도 보기는 계속)
      try {
        await api('/profile', { method: 'PUT', body: JSON.stringify({ ...birth, time_unknown: birth.timeUnknown ? 1 : 0 }) });
        hasProfile = true;
      } catch (e) { console.warn('프로필 저장 실패:', e.message); }
    }
    render(); sheet(false); goTab('wonguk');
  });
  $('#btnSheet').addEventListener('click', () => sheet(true));
  $('#btnAcctOpen').addEventListener('click', () => openAcct(me ? '' : acctMode));
  $('#btnAcct').addEventListener('click', submitAcct);
  $('#acctSwap').addEventListener('click', (e) => { e.preventDefault(); acctMode = acctMode === 'signup' ? 'login' : 'signup'; paintAcct(); });
  $('#acctLater').addEventListener('click', (e) => { e.preventDefault(); sessionStorage.setItem('manse:acctSkip', '1'); closeAcct(); });
  $('#scrim').addEventListener('click', () => { sheet(false); closeDict(); closeAcct(); });

  // 글자 탭 → 사전 카드 (이벤트 위임 — 원국은 매 렌더 재생성)
  $('#pillars').addEventListener('click', (e) => {
    const el = e.target.closest('.gl'); if (!el) return;
    openDict(el.dataset.pos, el.dataset.t);
  });
  $('#pillars').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('.gl'); if (!el) return;
    e.preventDefault(); openDict(el.dataset.pos, el.dataset.t);
  });
  $('#btnTone').addEventListener('click', () => setTone(document.body.dataset.tone === 'mono' ? 'red' : 'mono'));
  $$('.tab').forEach((b) => b.addEventListener('click', () => goTab(b.dataset.go)));

  // URL 파라미터(검증·시연): ?tone=red&tab=un&sheet=1
  const q = new URLSearchParams(location.search);
  setTone(q.get('tone') === 'red' ? 'red' : 'mono');
  render();
  if (q.get('tab')) goTab(q.get('tab'));
  if (q.get('sheet') === '1') sheet(true);

  // 첫 진입 = 간단 가입으로 안내 (로그인돼 있으면 그냥 통과 · '일단 구경만' 누르면 이 탭에선 다시 안 뜸)
  // ?acct=1|login = 강제 오픈(시연·검증) · ?guest=1 = 오픈 생략(스크린샷·디버그)
  if (q.get('acct')) openAcct(q.get('acct') === 'login' ? 'login' : 'signup');
  else if (!me && apiReady && q.get('guest') !== '1' && !sessionStorage.getItem('manse:acctSkip')) openAcct('signup');

  // 자기검증(엔진 앵커) — 헤드리스가 data-pass를 읽음
  const tests = runSelfTest();
  const bad = tests.filter((t) => !t.pass);
  const st = $('#selftest');
  st.dataset.pass = bad.length === 0 ? 'true' : 'false';
  st.innerHTML = bad.length === 0
    ? `<span class="ok">자기검증 ${tests.length}/${tests.length} 통과</span> — 일진 앵커·기두법·운성·신살·공망 일치`
    : `<span class="bad">자기검증 실패 ${bad.length}건</span>`;

  // 레이아웃 계측(?debug=1): 헤드리스 실측용 — innerWidth·프레임·그리드 폭을 DOM에 기록
  if (q.get('debug') === '1') {
    setTimeout(() => {
      const f = $('.frame').getBoundingClientRect(), pg = $('#pillars').getBoundingClientRect();
      const cell = $('#pillars .pcell')?.getBoundingClientRect();
      st.insertAdjacentHTML('afterend',
        `<p id="dbg" data-iw="${innerWidth}" data-frame="${Math.round(f.width)}" data-grid="${Math.round(pg.width)}" data-cell="${Math.round(cell?.width || 0)}" data-dpr="${devicePixelRatio}">DBG iw=${innerWidth} frame=${Math.round(f.width)} grid=${Math.round(pg.width)} cell=${Math.round(cell?.width || 0)} dpr=${devicePixelRatio}</p>`);
    }, 300);
  }
}
