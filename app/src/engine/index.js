// dosa-app L1 만세력 엔진(computeChart) → UI용 데이터로 매핑하는 얇은 어댑터.
// 엔진은 순수 ESM(브라우저 안전). 절기표는 정적 JSON을 주입.
// dosa-app/engine에서 벤더링한 사본(자립형 빌드용). 원본 갱신 시 vendor/도 동기화.
import { computeChart } from './vendor/manseryeok.js'
import { chartToKeys } from './vendor/keyset.js'
import { buildReport } from './vendor/report.js'
import { diaryDayInfo } from './vendor/unse.js'
import solarTerms from './vendor/data/solar_terms.json'
import kbRef from './vendor/kb_ref.json'

// KB 번들(1.4MB)은 JS에 인라인하지 않고 정적 파일(/kb.json)을 런타임 fetch — Q05 경량화.
// 렌더 전 loadKb() 완료가 보장되므로(main.tsx 게이트) 이하 동기 API는 그대로 유지된다.
let kb = null
let kbPromise = null
async function fetchKb() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000) // 스톨 → fail-soft (무한 빈 화면 방지)
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}${kbRef.file}`, { signal: ctrl.signal })
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json'))
      throw new Error(`KB 로드 실패: HTTP ${res.status} (${res.headers.get('content-type')})`) // SPA 폴백 HTML 위장 차단
    const data = await res.json()
    if (!data || !data.index || !data.meta) throw new Error('KB 스키마 불일치 — 새로고침 필요')
    kb = data
    kbCoverage.distilledKeys = kb.meta?.distilledKeys ?? 0
    kbCoverage.indexKeys = Object.keys(kb.index || {}).length
    return kb
  } finally { clearTimeout(timer) }
}
export function loadKb() {
  return (kbPromise ??= fetchKb().catch((e) => { kbPromise = null; throw e })) // 프로미스 메모(이중 fetch 방지) + 실패 시 재시도 가능
}

const terms = solarTerms.terms

// 천간 → [오행, 음양]
const STEM = {
  갑: ['목', '+'], 을: ['목', '-'], 병: ['화', '+'], 정: ['화', '-'], 무: ['토', '+'],
  기: ['토', '-'], 경: ['금', '+'], 신: ['금', '-'], 임: ['수', '+'], 계: ['수', '-'],
}
// 지지 → [오행, 음양(양지/음지)]
const BRANCH = {
  자: ['수', '+'], 축: ['토', '-'], 인: ['목', '+'], 묘: ['목', '-'], 진: ['토', '+'], 사: ['화', '-'],
  오: ['화', '+'], 미: ['토', '-'], 신: ['금', '+'], 유: ['금', '-'], 술: ['토', '+'], 해: ['수', '-'],
}

function pillarUI(title, p, isDay) {
  const [ganE, ganPolarity] = STEM[p.stem]
  const [jiE, jiPolarity] = BRANCH[p.branch]
  return {
    title,
    topStar: isDay ? '일원' : p.stemTenGod,
    gan: p.hanja[0], ganK: p.stem, ganE, ganPolarity,
    ji: p.hanja[1], jiK: p.branch, jiE, jiPolarity,
    botStar: p.branchTenGod, stage: p.twelveStage,
    isDayMaster: isDay || undefined,
  }
}

function ohaengDist(pillars) {
  const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  for (const p of pillars) {
    count[p.ganE]++
    count[p.jiE]++
  }
  return ['목', '화', '토', '금', '수'].map((key) => {
    const pct = (count[key] / 8) * 100
    let verdict = '적정'
    if (pct === 0) verdict = '부족'
    else if (pct <= 12.5) verdict = '적정'
    else if (pct <= 25) verdict = '발달'
    else verdict = '과다'
    return { key, pct: Math.round(pct * 10) / 10, verdict }
  })
}

export function computeChartUI(input) {
  const c = computeChart(input, terms)
  const s = c.saju
  const pillars = [
    pillarUI('시', s.hour, false),
    pillarUI('일', s.day, true),
    pillarUI('월', s.month, false),
    pillarUI('년', s.year, false),
  ]
  return {
    pillars,
    ohaeng: ohaengDist(pillars),
    daeun: c.daeun,
    dayMaster: { ganK: s.day.stem, gan: s.day.hanja[0], element: STEM[s.day.stem][0] },
    // 진태양시 보정 결과(포스텔러식 '지역시 -32분' 표기용)
    corrected: c.correctedLocal
      ? { hh: c.correctedLocal.hh, mm: c.correctedLocal.mm, minutes: c.correctedLocal.correctionMinutes }
      : null,
  }
}

/** 오늘(KST) 날짜 — 기기 시간대와 무관하게 한국시 기준(일진·세운 판정 축) */
export function todayKST() {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).split('-').map(Number)
  return { year: y, month: m, day: d }
}

/** 올해 세운 연도명(입춘 경계 = 엔진 연주 판정). KB 세운 키·리포트 기본값에 사용. */
export function currentUnseYearName() {
  const t = todayKST()
  return computeChart({ ...t, hour: 12, minute: 0, gender: 'F' }, terms).saju.year.name
}

// L3 근거 리포트 — computeChart → chartToKeys → buildReport(번들 KB). 절대 원칙: 검색 없이 키 결정론 조회.
// 반환 sections는 전부 코퍼스 근거(증류본/발췌+출처). 근거 없으면 empty(=소장 문헌 없음).
export function buildReading(input, unseYearName = currentUnseYearName()) {
  if (!kb) throw new Error('KB 미로드 — main.tsx가 loadKb() 완료 후 렌더해야 한다')
  const chart = computeChart(input, terms)
  const keyset = chartToKeys(chart, { unseYearName })
  return buildReport(chart, keyset, kb) // { input, sections: [...] }
}

// 증류 커버리지(진행 지표) — 화면에서 "정리 중" 표기 판단용 (loadKb()가 채운다)
export const kbCoverage = { distilledKeys: 0, indexKeys: 0 }

export function todayIljin(year, month, day) {
  const c = computeChart({ year, month, day, hour: 12, minute: 0, gender: 'F' }, terms)
  return {
    yearName: c.saju.year.name,
    monthName: c.saju.month.name,
    dayName: c.saju.day.name,
    dayHanja: c.saju.day.hanja,
  }
}

// ── 오늘의 운세(일진 vs 내 원국) — 엔진 diaryDayInfo(십신·합충·공망 발동) 기반 ──
// 점수 = 관계 사건의 결정론 매핑(서비스 정책값 — 문헌 근거가 아니라 엔진 산출의 요약 지표.
// UI는 반드시 근거 관계를 병기한다). 같은 날 같은 원국 = 항상 같은 점수(재현성 = 신뢰).
const REL_SCORE = { 천간합: 4, 육합: 5, '삼합(반합)': 4, 천간충: -6, 충: -7, 원진: -4, 파: -3, 해: -3, 자형: -3 }
const REL_PHRASE = {
  충: '부딪히는 기운이 있는 날 — 무리한 강행보다 한 템포 쉬어가요',
  천간충: '생각이 흔들리기 쉬운 날 — 결정은 한 번 더 검토해요',
  원진: '괜히 신경이 곤두설 수 있는 날 — 말은 부드럽게',
  파: '계획이 어긋나기 쉬운 날 — 여유 시간을 두세요',
  해: '오해가 생기기 쉬운 날 — 확인하고 움직여요',
  자형: '스스로를 괴롭히기 쉬운 날 — 완벽주의를 내려놔요',
  육합: '인연이 맺어지는 날 — 만남과 협력에 좋아요',
  천간합: '뜻이 모이는 날 — 제안과 합의가 잘 풀려요',
  '삼합(반합)': '흐름이 모이는 날 — 함께 하는 일이 잘 굴러가요',
}
const SIPSIN_THEME = {
  비견: '나를 세우는 날', 겁재: '경쟁심이 커지는 날',
  식신: '표현·활동의 날', 상관: '아이디어가 튀는 날',
  편재: '기회·활동 재물의 날', 정재: '실속·관리의 날',
  편관: '도전과 압박의 날', 정관: '책임·평가의 날',
  편인: '직감·배움의 날', 정인: '안정·문서의 날',
}

export function todayFortune(input) {
  const t = todayKST()
  const chart = computeChart(input, terms)
  const info = diaryDayInfo(chart, t.year, t.month, t.day)
  let score = 75
  for (const r of info.relations) score += REL_SCORE[r.type] ?? 0
  if (info.gongmangHit) score -= 5
  score = Math.max(45, Math.min(95, score))
  // 대표 사건 1개(부정 우선 — 주의가 정보가치 높음) → 문안. 없으면 십신 테마.
  const order = ['충', '천간충', '원진', '파', '해', '자형', '육합', '천간합', '삼합(반합)']
  const main = order.map((ty) => info.relations.find((r) => r.type === ty)).find(Boolean)
  const oneLine = main
    ? REL_PHRASE[main.type]
    : info.gongmangHit
      ? '비어 있는 기운의 날 — 채우기보다 정리에 좋아요'
      : '큰 요동 없는 날 — 하던 일을 담담히 이어가요'
  return {
    date: info.date,
    iljin: info.iljin,
    stemTenGod: info.stemTenGod,
    theme: SIPSIN_THEME[info.stemTenGod] ?? null,
    relations: info.relations,
    gongmangHit: info.gongmangHit,
    score,
    oneLine,
    // 근거줄용: "내 일주와 자오충" 식 요약
    basis: [
      ...info.relations.map((r) => `내 ${r.with}주와 ${r.name}`),
      ...(info.gongmangHit ? ['공망 발동'] : []),
    ],
  }
}
