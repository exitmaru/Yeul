// 003-saju.unit.js — 사주 원국 뷰 (입력 흐름 → 만세력 엔진 → 원론 순서 결과)
// 계산은 전부 manse 엔진(원 소스)에 위임한다. 이 파일은 "진행 흐름 + 정확한 표시"만 맡는다.
// 연출·컨셉 없음(정확도 우선). 시간(時)을 모르면 시주에 의존하는 판정은 정직하게 보류한다.

import { buildSaju } from '../../manse/js/core/002-saju-engine.core.js';
import { STEMS, BRANCHES, ELEMENTS } from '../../manse/js/knowledge/001-ganji.knowledge.js';
import { JIJI_ARCHETYPE, JIJI_ROLE } from '../../manse/js/knowledge/012-jiji-archetype.knowledge.js';

// 계산 옵션 — 서울 기준·진태양시 보정(만세뷰 기본값 계승). 출생지 선택은 후속.
const OPTS = {
  trueSolar: true, eot: true, apply1954: true, lon: 126.98,
  jasiMode: '야자시', daeunRound: '반올림', sinsalBase: '년지',
  daeunCount: 8, seunCount: 12,
};

const elVar = { 목: 'var(--el-mok)', 화: 'var(--el-hwa)', 토: 'var(--el-to)', 금: 'var(--el-geum)', 수: 'var(--el-su)' };

let data;        // {y,mo,d,h,mi,timeUnknown,sex}
let timers = [];
let box;         // 흐름 컨테이너

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

// 지지 → 생왕고 자리 + 역마/도화/화개 라벨 (JIJI_ARCHETYPE.자리 직접 조회 · 신살법 아님)
function jijiRole(branchIdx) {
  const arch = JIJI_ARCHETYPE[BRANCHES[branchIdx].han];
  const role = JIJI_ROLE[arch.자리];
  return { 자리: arch.자리, sinsal: role.sinsal, gloss: role.gloss };
}

// 오행 분포 — 시간 미상이면 시주 제외 3기둥으로 재집계(엔진 counts는 시주 포함이라 못 씀)
function ohaengCounts(r, includeHour) {
  const c = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const keys = includeHour ? ['년주', '월주', '일주', '시주'] : ['년주', '월주', '일주'];
  for (const k of keys) {
    const p = r.pillars[k];
    c[STEMS[p.stem].el]++;      // 천간 오행
    c[BRANCHES[p.branch].el]++; // 지지 본기 오행(= 지지 자체 오행, 통설상 일치)
  }
  return c;
}

// ── 흐름 진입 ──
function render({ mount }) {
  clearTimers();
  data = { y: null, mo: null, d: null, h: null, mi: null, timeUnknown: false, sex: null };
  mount.innerHTML = `
    <main class="saju-app" data-theme="light">
      <div class="saju-wrap" id="saju-flow"></div>
      <p class="saju-foot">양력 기준 · 서울 표준시 · 절기 근사 ±수 분 · 신강약·용신은 참고용 간이 판정</p>
    </main>`;
  box = mount.querySelector('#saju-flow');
  stepBirth();
}

function swap(html) {
  box.innerHTML = `<section class="saju-step">${html}</section>`;
  const sec = box.querySelector('.saju-step');
  after(20, () => sec.classList.add('in'));
  return sec;
}

function restart() { stepBirth(); }

// ── 1) 생년월일 ──
function stepBirth() {
  const sec = swap(`
    <p class="saju-eyebrow">사주 원국</p>
    <h1 class="saju-h">생년월일을 알려줘</h1>
    <p class="saju-sub">양력 기준이야.</p>
    <input type="date" id="f-birth" class="saju-input" min="1900-01-01" max="2100-12-31" value="${data.y ? `${data.y}-${String(data.mo).padStart(2, '0')}-${String(data.d).padStart(2, '0')}` : ''}">
    <button class="saju-btn" id="f-next" ${data.y ? '' : 'disabled'}>다음</button>
  `);
  const inp = sec.querySelector('#f-birth');
  const next = sec.querySelector('#f-next');
  inp.addEventListener('input', () => { next.disabled = !inp.value; });
  next.addEventListener('click', () => {
    if (!inp.value) return;
    const [y, mo, d] = inp.value.split('-').map(Number);
    if (!y || !mo || !d) return;
    data.y = y; data.mo = mo; data.d = d;
    stepTime();
  });
}

// ── 2) 태어난 시간 (모르면 3기둥) ──
function stepTime() {
  const sec = swap(`
    <p class="saju-eyebrow">${data.y}년 ${data.mo}월 ${data.d}일</p>
    <h1 class="saju-h">태어난 시간은?</h1>
    <p class="saju-sub">모르면 아래 <b>시간 몰라</b>를 눌러 — 시(時)를 빼고 세 기둥으로만 정확히 봐줄게.</p>
    <input type="time" id="f-time" class="saju-input">
    <button class="saju-btn" id="f-next" disabled>다음</button>
    <button class="saju-link" id="f-unknown">시간 몰라</button>
  `);
  const inp = sec.querySelector('#f-time');
  const next = sec.querySelector('#f-next');
  inp.addEventListener('input', () => { next.disabled = !inp.value; });
  next.addEventListener('click', () => {
    if (!inp.value) return;
    const [h, mi] = inp.value.split(':').map(Number);
    data.h = h; data.mi = mi; data.timeUnknown = false;
    stepSex();
  });
  sec.querySelector('#f-unknown').addEventListener('click', () => {
    data.h = 12; data.mi = 0; data.timeUnknown = true;
    stepSex();
  });
}

// ── 3) 성별 (대운 방향에 필수) ──
function stepSex() {
  const sec = swap(`
    <p class="saju-eyebrow">${data.timeUnknown ? '시간 미상' : `${data.h}시 ${String(data.mi).padStart(2, '0')}분`}</p>
    <h1 class="saju-h">성별을 골라줘</h1>
    <p class="saju-sub">대운(10년 단위 큰 흐름)의 방향을 정하는 데 꼭 필요해.</p>
    <div class="saju-pick">
      <button class="saju-btn ghost" data-sex="1">남자</button>
      <button class="saju-btn ghost" data-sex="2">여자</button>
    </div>
  `);
  sec.querySelectorAll('[data-sex]').forEach((b) => b.addEventListener('click', () => {
    data.sex = +b.dataset.sex;
    stepResult();
  }));
}

// ── 4) 결과 (원론 순서로 공개) ──
function stepResult() {
  let r;
  try {
    r = buildSaju({ y: data.y, mo: data.mo, d: data.d, h: data.h, mi: data.mi, sex: data.sex }, OPTS);
  } catch (e) {
    swap(`<h1 class="saju-h">계산 중 문제가 생겼어</h1><p class="saju-sub">${esc(e.message || e)}</p><button class="saju-btn" id="f-restart">처음부터</button>`)
      .querySelector('#f-restart').addEventListener('click', restart);
    return;
  }

  const known = !data.timeUnknown;
  const day = r.pillars.일주;
  const dayStem = STEMS[day.stem];
  const counts = ohaengCounts(r, known);
  const maxN = Math.max(...ELEMENTS.map((e) => counts[e]), 1);
  const zero = ELEMENTS.filter((e) => counts[e] === 0);

  // (a) 팔자 4기둥(시간 미상이면 시주는 ?)
  const keys = ['년주', '월주', '일주', '시주'];
  const pillarsHtml = keys.map((k) => {
    if (k === '시주' && !known) {
      return `<div class="saju-pil unknown"><div class="pl">시주</div><div class="q">?</div><div class="pn">시간 미상</div></div>`;
    }
    const p = r.pillars[k];
    const s = STEMS[p.stem], b = BRANCHES[p.branch];
    const me = k === '일주';
    const role = jijiRole(p.branch);
    return `<div class="saju-pil${me ? ' me' : ''}">
      <div class="pl">${k}${me ? ' · 나' : ''}</div>
      <div class="gz">
        <span class="gch" style="color:${elVar[s.el]}">${s.han}</span>
        <span class="gch" style="color:${elVar[b.el]}">${b.han}</span>
      </div>
      <div class="pn">${s.kor}${b.kor} · ${s.el}${b.el}</div>
      <div class="pss">${me ? '일간(나)' : esc(p.stemSipsin)} · ${esc(p.branchSipsin)}</div>
      <div class="prole">${role.sinsal}</div>
    </div>`;
  }).join('');

  // (b) 오행 균형
  const barsHtml = ELEMENTS.map((e) => `
    <div class="saju-bar"><span class="bl">${e}</span>
      <div class="btrack"><div class="bfill" style="width:${(counts[e] / maxN) * 100}%;background:${elVar[e]}"></div></div>
      <b class="bn">${counts[e]}</b></div>`).join('');

  // (c~e) 시간을 알 때만 — 시주 의존 판정
  let deepHtml = '';
  if (known) {
    const sipsin = Object.entries(r.sipsinCounts).sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `<span class="saju-chip">${esc(k)} <b>${v}</b></span>`).join('');
    const daeun = r.daeun.map((d) => `
      <div class="saju-tl"><div class="ta">${d.age}세</div>
        <div class="tg"><span style="color:${elVar[STEMS[d.stem].el]}">${STEMS[d.stem].han}</span><span style="color:${elVar[BRANCHES[d.branch].el]}">${BRANCHES[d.branch].han}</span></div>
        <div class="ts">${esc(d.stemSipsin)}·${esc(d.branchSipsin)}</div></div>`).join('');
    deepHtml = `
      <div class="saju-sec">
        <h2>십신 <small>나를 둘러싼 역할·관계</small></h2>
        <div class="saju-chips">${sipsin}</div>
      </div>
      <div class="saju-sec">
        <h2>기운의 세기 <small>참고 · 간이 판정</small></h2>
        <div class="saju-chips">
          <span class="saju-chip">${r.strength} <b>${r.score}/90</b></span>
          <span class="saju-chip">억부 ${r.yongsin.eokbu ? `<b>${esc(r.yongsin.eokbu)}</b>` : '중화(보류)'}</span>
          <span class="saju-chip">조후 ${r.yongsin.johu ? `<b>${esc(r.yongsin.johu)}</b>` : '해당 없음'}</span>
        </div>
      </div>
      <div class="saju-sec">
        <h2>대운 <small>10년 단위 흐름 · ${r.forward ? '순행' : '역행'}</small></h2>
        <div class="saju-tls">${daeun}</div>
      </div>`;
  } else {
    deepHtml = `
      <div class="saju-sec note">
        <h2>여기서 잠깐</h2>
        <p class="saju-sub">십신·기운의 세기·대운은 <b>태어난 시(時)</b>가 있어야 정확해. 시를 알게 되면 다시 와서 넣어줘 — 그때 전부 봐줄게.</p>
      </div>`;
  }

  const zeroNote = zero.length ? `<p class="saju-note">비어 있는 기운: <b>${zero.join('·')}</b> — 그 기운이 약하다는 뜻이야.</p>` : '';

  const sec = swap(`
    <p class="saju-eyebrow">${data.y}.${String(data.mo).padStart(2, '0')}.${String(data.d).padStart(2, '0')} · ${data.sex === 1 ? '남' : '여'}${known ? '' : ' · 시간 미상'}</p>
    <h1 class="saju-h">나는 <span style="color:${elVar[dayStem.el]}">${dayStem.han}${dayStem.kor}</span> <span class="saju-day">일간</span></h1>
    <p class="saju-sub">사주의 중심, 나 자신을 뜻하는 글자야.</p>

    <div class="saju-sec">
      <h2>내 팔자 <small>네 기둥 · 여덟 글자</small></h2>
      <div class="saju-pillars">${pillarsHtml}</div>
    </div>

    <div class="saju-sec">
      <h2>오행 균형 <small>${known ? '네 기둥' : '세 기둥'} 기준</small></h2>
      <div class="saju-bars">${barsHtml}</div>
      ${zeroNote}
    </div>

    ${deepHtml}

    <button class="saju-btn" id="f-restart">다시 보기</button>
  `);
  sec.querySelector('#f-restart').addEventListener('click', restart);
}

// 라우터 계약: '/' 를 차지하는 view 유닛. 내부 흐름은 자체 상태로 관리(상수 key로 재렌더 억제).
export default {
  seq: 3,
  id: 'saju',
  layer: 'view',
  match: (path) => path === '',
  key: () => 'saju',
  render,
};
