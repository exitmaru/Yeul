// 운(運) 대입 프리미티브 — 임의 시점의 간지(년·월·일)와 원국의 상호작용 계산.
// 일진 다이어리의 심장: "오늘의 일진이 내 원국과 무슨 관계인가"를 결정론으로 산출한다.
// 대운·세운·월운 서술에도 같은 함수를 쓴다.
//
// 참고: 운명전쟁49 영상의 "오늘이 병진일" 발언 — 본 엔진 기준 병진일은 2026-04-12.
//   영상 업로드일(04-26, 경오일)과 다른 것은 녹화→업로드 지연(2주)으로 설명됨.
//   일진 공식의 확정 앵커는 포스텔러 대조(1990-01-01=병인일)를 따른다.

import {
  STEMS, BRANCHES, HIDDEN_STEMS, TEN_GODS, TWELVE_STAGES,
  tenGod, twelveStage, sexStem, sexBranch, sexName, sexIndex,
} from './tables.js';
import { jdn } from './manseryeok.js';
import { gongmang } from './sinsal.js';

/** 날짜(현지 달력) → 일진 60갑자 인덱스. (일주 경계 규칙은 원국과 동일하게 자정/23시 — 단순 조회는 달력일 기준) */
export function dayPillarIdx(y, m, d) {
  return ((jdn(y, m, d) + 49) % 60 + 60) % 60;
}

/** 연도 → 년지 인덱스 (입춘 이전은 전년 — 정밀 판정은 절기표 필요. 여기선 달력연도 근사 + 옵션) */
export function yearBranchOf(year) {
  return ((year - 1984) % 12 + 12) % 12;
}
export function yearPillarIdxApprox(year) {
  return ((year - 1984) % 60 + 60) % 60;
}

/** 특정 지지가 오는 다음 해들 (예: 유(9), 2026 → [2029, 2041, …]) — 서술 표준 3번(시기 구체화)용 */
export function nextYearsWithBranch(branch, fromYear, count = 3) {
  const out = [];
  let y = fromYear;
  while (out.length < count) {
    if (yearBranchOf(y) === branch) out.push(y);
    y++;
  }
  return out;
}

const YUKHAP_PAIR = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
const WONJIN_PAIRS = new Set(['0,7', '1,6', '2,9', '3,8', '4,11', '5,10']);
const PA_PAIRS = new Set(['0,9', '1,4', '2,11', '3,6', '5,8', '7,10']);
const HAE_PAIRS = new Set(['0,7', '1,6', '2,5', '3,4', '8,11', '9,10']);
const HYEONG_SETS = [['2', '5', '8'], ['1', '10', '7']];
const pk = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`);

/**
 * 들어오는 간지 1주(운 — 일진·세운·월운·대운 공용)와 원국의 관계 산출.
 * @returns { name, stemTenGod, branchTenGod, twelveStage, relations: [...], keys: [...], gongmangHit }
 */
export function pillarVsChart(chart, incomingIdx) {
  const p = chart.pillarsIdx;
  const day = sexStem(p.day);
  const inS = sexStem(incomingIdx), inB = sexBranch(incomingIdx);
  const POS_KR = { year: '년', month: '월', day: '일', hour: '시' };
  const relations = [];
  const keys = new Set();

  const inHidden = HIDDEN_STEMS[inB];
  const res = {
    name: sexName(incomingIdx),
    stemTenGod: TEN_GODS[tenGod(day, inS)],
    branchTenGod: TEN_GODS[tenGod(day, inHidden[inHidden.length - 1])],
    twelveStage: TWELVE_STAGES[twelveStage(day, inB)],
  };
  keys.add(`sipsin/${res.stemTenGod}`);

  for (const q of ['year', 'month', 'day', 'hour']) {
    const s = sexStem(p[q]), b = sexBranch(p[q]);
    // 천간합(갑기 을경 병신 정임 무계) / 천간충
    if ((s % 5) === (inS % 5) && s !== inS) {
      const pair = [STEMS[Math.min(s, inS) % 10], STEMS[Math.max(s, inS) % 10]];
      relations.push({ type: '천간합', name: `${STEMS[inS]}${STEMS[s]}합`, with: POS_KR[q] });
      keys.add(`hapchung/천간합/${pair.join('')}`);
    }
    if (Math.abs(s - inS) === 6 && Math.min(s, inS) <= 3) {
      relations.push({ type: '천간충', name: `${STEMS[Math.min(s, inS)]}${STEMS[Math.max(s, inS)]}충`, with: POS_KR[q] });
      keys.add(`hapchung/천간충/${STEMS[Math.min(s, inS)]}${STEMS[Math.max(s, inS)]}`);
    }
    // 지지 관계
    if ((b + 6) % 12 === inB) {
      const lo = Math.min(b, inB), hi = Math.max(b, inB);
      relations.push({ type: '충', name: `${BRANCHES[lo]}${BRANCHES[hi]}충`, with: POS_KR[q] });
      keys.add(`hapchung/충/${BRANCHES[lo]}${BRANCHES[hi]}`);
    }
    if (YUKHAP_PAIR[b] === inB) {
      const lo = Math.min(b, inB), hi = Math.max(b, inB);
      relations.push({ type: '육합', name: `${BRANCHES[lo]}${BRANCHES[hi]}합`, with: POS_KR[q] });
      keys.add(`hapchung/육합/${BRANCHES[lo]}${BRANCHES[hi]}`);
    }
    if (b % 4 === inB % 4 && b !== inB) {
      relations.push({ type: '삼합(반합)', name: `${BRANCHES[b]}${BRANCHES[inB]} 삼합 기운`, with: POS_KR[q] });
    }
    if (WONJIN_PAIRS.has(pk(b, inB))) relations.push({ type: '원진', name: `${BRANCHES[b]}${BRANCHES[inB]}원진`, with: POS_KR[q] });
    if (PA_PAIRS.has(pk(b, inB))) relations.push({ type: '파', name: `${BRANCHES[b]}${BRANCHES[inB]}파`, with: POS_KR[q] });
    if (HAE_PAIRS.has(pk(b, inB))) relations.push({ type: '해', name: `${BRANCHES[b]}${BRANCHES[inB]}해`, with: POS_KR[q] });
    if (b === inB && [4, 6, 9, 11].includes(b)) relations.push({ type: '자형', name: `${BRANCHES[b]}${BRANCHES[b]}자형`, with: POS_KR[q] });
  }

  // 공망 발동 (들어온 지지가 내 공망?)
  const [g1, g2] = gongmang(p.day);
  const gongmangHit = inB === g1 || inB === g2;
  if (gongmangHit) keys.add('sinsal/공망');

  // 왕지/생지/고지 성분 (broad — 도화·역마·화개 기운)
  if ([0, 3, 6, 9].includes(inB)) keys.add('sinsal/도화살');
  if ([2, 5, 8, 11].includes(inB)) keys.add('sinsal/역마살');
  if ([1, 4, 7, 10].includes(inB)) keys.add('sinsal/화개살');

  return { ...res, relations, gongmangHit, keys: [...keys] };
}

/** 일진 다이어리 한 날의 자동 태그: 날짜 → 일진 + 원국과의 관계 요약 */
export function diaryDayInfo(chart, y, m, d) {
  const idx = dayPillarIdx(y, m, d);
  const vs = pillarVsChart(chart, idx);
  return { date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, iljin: vs.name, ...vs };
}
