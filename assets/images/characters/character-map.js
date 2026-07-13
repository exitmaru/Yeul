// character-map.js — 사주 캐릭터 리졸버 (UI 무관 · SSOT · 안정 계약)
// =========================================================================
//  목적: "어떤 UI/UX가 와도 갈아끼우기만" — 페이지·대화형·카드 어디든 이 모듈을
//        import 해서 "사주 개념 → 캐릭터 데이터"만 받아 원하는 자리에 꽂는다.
//        배치·마크업은 UI가 결정. UI가 바뀌면 호출부만 바뀌고 이 파일은 불변.
//
//  import (어느 트리에서든 절대경로):
//    import { zodiac, ganji, byYear, imgTag, setBase } from '/assets/images/characters/character-map.js';
//
//  반환 = 순수 데이터 객체(DOM/프레임워크 0 의존). 예:
//    ganji(2,6) → { kind:'ganji', src:'/assets/images/characters/gapja/43-byeong-horse.webp',
//                   animal:'말', en:'horse', hanja:'丙午', stemHan:'丙', branchHan:'午',
//                   el:'화', color:'#ef6a5e', branchEl:'화', num:43, valid:true }
//    → UI는 .src(이미지), .color(테마), .animal/.hanja(라벨)을 마음대로 씀.
//
//  자산: 12지(계절 오방색) = NNN-<en>.webp · 60갑자(천간 오행색) = gapja/NN-<gan>-<ji>.webp
//  경로 기본 = '/assets/images/characters' (루트 배포 기준). 다른 경로면 setBase()로 1줄 재설정.
// =========================================================================

let BASE = '/assets/images/characters';
/** 배포 구조가 바뀌면(서브패스 등) 한 줄로 재설정. 예: setBase('/manse/assets/characters') */
export function setBase(p) { BASE = String(p).replace(/\/+$/, ''); }
export function getBase() { return BASE; }

// 지지 0=子 … 11=亥 · 동물 · 본기 오행 · 계절 오방색(12지 세트 색)
const BRANCH = [
  { han: '子', kor: '자', animal: '쥐',   en: 'rat',     el: '수', season: '겨울', color: '#4a5bd6' },
  { han: '丑', kor: '축', animal: '소',   en: 'ox',      el: '토', season: '겨울', color: '#3f4a7a' },
  { han: '寅', kor: '인', animal: '호랑이', en: 'tiger',  el: '목', season: '봄',   color: '#3fb27f' },
  { han: '卯', kor: '묘', animal: '토끼', en: 'rabbit',  el: '목', season: '봄',   color: '#8fe0b0' },
  { han: '辰', kor: '진', animal: '용',   en: 'dragon',  el: '토', season: '봄',   color: '#2fa06a' },
  { han: '巳', kor: '사', animal: '뱀',   en: 'snake',   el: '화', season: '여름', color: '#f0596b' },
  { han: '午', kor: '오', animal: '말',   en: 'horse',   el: '화', season: '여름', color: '#ee4d3d' },
  { han: '未', kor: '미', animal: '양',   en: 'sheep',   el: '토', season: '여름', color: '#f5897f' },
  { han: '申', kor: '신', animal: '원숭이', en: 'monkey', el: '금', season: '가을', color: '#e9edf3' },
  { han: '酉', kor: '유', animal: '닭',   en: 'rooster', el: '금', season: '가을', color: '#efe7d3' },
  { han: '戌', kor: '술', animal: '개',   en: 'dog',     el: '토', season: '가을', color: '#dcd5c6' },
  { han: '亥', kor: '해', animal: '돼지', en: 'pig',     el: '수', season: '겨울', color: '#5a5aa8' },
];
// 12지 파일 넘버(계절 순 001~012)
const ZNUM = { tiger: '001', rabbit: '002', dragon: '003', snake: '004', horse: '005', sheep: '006', monkey: '007', rooster: '008', dog: '009', pig: '010', rat: '011', ox: '012' };
// 천간 0=甲 … 9=癸 · 오행 · 색(양간=--el-* 기틀색 / 음간=+28% 연변주, 실제 이미지와 정합)
const STEM = [
  { han: '甲', kor: '갑', en: 'gab',    el: '목', color: '#6fc46f' }, { han: '乙', kor: '을', en: 'eul',  el: '목', color: '#97d497' },
  { han: '丙', kor: '병', en: 'byeong', el: '화', color: '#ef6a5e' }, { han: '丁', kor: '정', en: 'jeong', el: '화', color: '#f3938b' },
  { han: '戊', kor: '무', en: 'mu',     el: '토', color: '#d4a437' }, { han: '己', kor: '기', en: 'gi',   el: '토', color: '#e0bd6f' },
  { han: '庚', kor: '경', en: 'gyeong', el: '금', color: '#a7b2bf' }, { han: '辛', kor: '신', en: 'sin',  el: '금', color: '#bfc7d1' },
  { han: '壬', kor: '임', en: 'im',     el: '수', color: '#7f96c9' }, { han: '癸', kor: '계', en: 'gye',  el: '수', color: '#a3b3d8' },
];
const EL_COLOR = { 목: '#6fc46f', 화: '#ef6a5e', 토: '#d4a437', 금: '#a7b2bf', 수: '#7f96c9' };

const norm = (v, n) => ((Math.trunc(v) % n) + n) % n;
const stemIdxByHan = (h) => STEM.findIndex((s) => s.han === h);
const branchIdxByHan = (h) => BRANCH.findIndex((b) => b.han === h);

/** 12지 캐릭터(계절 오방색) — 지지 인덱스(0=子) 또는 동물이 필요할 때 */
export function zodiac(branchIdx) {
  const b = BRANCH[norm(branchIdx, 12)];
  return { kind: 'zodiac', src: `${BASE}/${ZNUM[b.en]}-${b.en}.webp`,
    animal: b.animal, en: b.en, hanja: b.han, branchHan: b.han, kor: b.kor,
    el: b.el, season: b.season, color: b.color };
}

/** 60갑자 캐릭터(천간 오행색) — 기둥=간지(천간 idx s, 지지 idx b)일 때 (예: 丙午=적마) */
export function ganji(stemIdx, branchIdx) {
  const s = STEM[norm(stemIdx, 10)], b = BRANCH[norm(branchIdx, 12)];
  let k = 0; while (k < 60 && (k % 10 !== norm(stemIdx, 10) || k % 12 !== norm(branchIdx, 12))) k++;
  const valid = k < 60; // 정상 간지는 천간·지지 음양이 같아 항상 존재
  return { kind: 'ganji', valid,
    src: valid ? `${BASE}/gapja/${String(k + 1).padStart(2, '0')}-${s.en}-${b.en}.webp` : zodiac(branchIdx).src,
    animal: b.animal, en: b.en, hanja: s.han + b.han, stemHan: s.han, branchHan: b.han,
    el: s.el, color: s.color, branchEl: b.el, num: valid ? k + 1 : null };
}

/** 한자로 조회 (엔진이 idx 대신 한자를 줄 때) */
export const zodiacByHan = (branchHan) => zodiac(branchIdxByHan(branchHan));
export const ganjiByHan = (stemHan, branchHan) => ganji(stemIdxByHan(stemHan), branchIdxByHan(branchHan));

/** 생년(양력) → 띠 캐릭터. 절기(입춘) 미반영 — 재미/입력용 */
export function byYear(year) {
  const y = Number(year);
  if (!Number.isFinite(y) || y < 1) return null;
  return zodiac(norm(y - 4, 12));
}

/** 오행(목화토금수) → 대표색(테마 토큰 매칭용) */
export const elementColor = (el) => EL_COLOR[el] || 'currentColor';

/** 전체 목록(카탈로그·프리로드·프리캐시용) */
export const ALL_ZODIAC = BRANCH.map((_, i) => zodiac(i));
export function allGanji() { const out = []; for (let k = 0; k < 60; k++) out.push(ganji(k % 10, k % 12)); return out; }
/** 프리로드/서비스워커 등록용 경로 배열 */
export const zodiacPaths = () => ALL_ZODIAC.map((c) => c.src);
export const ganjiPaths = () => allGanji().map((c) => c.src);

/** 선택적 렌더 헬퍼 — 순수 문자열(DOM/프레임워크 0). 안 쓰고 .src만 써도 됨.
 *  size=px · round=원형 · shadow=드롭섀도우 · cls=클래스(추가 스타일 훅) */
export function imgTag(ch, { size = 48, cls = 'saju-char', round = false, shadow = true, alt } = {}) {
  if (!ch || !ch.src) return '';
  const a = String(alt ?? `${ch.animal}${ch.hanja ? ` ${ch.hanja}` : ''}`).replace(/"/g, '&quot;');
  const st = [`width:${size}px`, `height:${size}px`, 'object-fit:contain', 'vertical-align:middle'];
  if (round) st.push('border-radius:50%');
  if (shadow) st.push('filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))');
  return `<img class="${cls}" src="${ch.src}" alt="${a}" loading="lazy" style="${st.join(';')}">`;
}

// 원시 테이블도 공개(고급 소비자용 — 목록/드롭다운 등)
export const BRANCHES = BRANCH.map((b) => ({ ...b }));
export const STEMS = STEM.map((s) => ({ ...s }));
