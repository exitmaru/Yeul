# 캐릭터 맵 API — UI 무관 사주 캐릭터 리졸버

> **목적:** 사주 UI/UX가 **어떻게 바뀌어도**(대화형·카드·페이지 어디든) 캐릭터를
> **갈아끼우기만** 하면 되게 만든 **안정 계약**. "사주 개념 → 캐릭터 데이터"만 돌려주고,
> **어디에 어떻게 배치할지는 UI가 결정.** UI가 바뀌면 **호출부만** 바뀌고 이 모듈은 불변.
>
> 정본 = `assets/images/characters/character-map.js` · 첫 소비자 = `manse/app/001-manse-app.unit.js`

---

## 왜 이렇게?

이미지 삽입 구간이 아직 안 정해졌으니 — **캐릭터를 특정 자리에 하드코딩하지 않는다.**
대신 "지지/간지/생년 → 캐릭터 객체"만 주는 함수 계층을 두고, UI는 그 `.src`·`.color`·`.animal`을
원하는 곳에 꽂는다. 대화형으로 바뀌어도 리졸버는 그대로, **말풍선/아바타/로딩에 꽂는 코드만** 새로 쓴다.

---

## import

```js
// 어느 트리(js/ · manse/ · 대화형 앱 등)에서든 루트 절대경로로
import { zodiac, ganji, byYear, imgTag, setBase } from '/assets/images/characters/character-map.js';
```
> 배포가 서브패스면 한 줄: `setBase('/서브/경로/characters')` (기본 `/assets/images/characters`).

---

## 반환 객체 (공통 모양)

```js
ganji(2, 6) // 丙午(병오) 기둥
// → { kind:'ganji', valid:true, num:43,
//     src:'/assets/images/characters/gapja/43-byeong-horse.webp',
//     animal:'말', en:'horse', hanja:'丙午', stemHan:'丙', branchHan:'午',
//     el:'화', color:'#ef6a5e', branchEl:'화' }
```
UI는 필요한 필드만 쓴다: **`.src`**(이미지) · **`.color`**(테마/보더) · **`.animal`·`.hanja`**(라벨).

---

## 함수

| 함수 | 입력 | 반환 | 언제 |
|---|---|---|---|
| `zodiac(branchIdx)` | 지지 0=子…11=亥 | 12지 캐릭터(계절색) | 지지/띠 하나만 |
| `ganji(stemIdx, branchIdx)` | 천간 0=甲…9=癸, 지지 | 60갑자 캐릭터(천간색) | **기둥=간지**(정확) |
| `byYear(year)` | 생년(양력) | 12지 캐릭터 | 생년 입력 → 띠 |
| `zodiacByHan(branchHan)` | '午' | 12지 | 엔진이 한자를 줄 때 |
| `ganjiByHan(stemHan, branchHan)` | '丙','午' | 60갑자 | 한자 간지 |
| `elementColor(el)` | '화' | `#ef6a5e` | 오행 → 테마색 |
| `ALL_ZODIAC` / `allGanji()` | — | 배열 | 카탈로그·프리로드 |
| `zodiacPaths()` / `ganjiPaths()` | — | 경로 배열 | 프리캐시(sw.js) |
| `imgTag(ch, opts)` | 캐릭터, `{size,round,shadow,cls}` | `<img>` 문자열 | 빠른 삽입(선택) |
| `setBase(path)` | 경로 | — | 배포 경로 변경 |

> `zodiac`(계절색) vs `ganji`(천간색): **띠/지지 단독 = zodiac**, **기둥/간지 = ganji**. 둘 다 같은 12동물, 색 체계만 다름.

---

## 레시피 (UI 패턴별 — 미래 대화형 UI가 골라 씀)

**① 대화형 말풍선 안에 인라인** (사주 언니가 "네 일지는 말이야" 하며 말 옆에 아이콘)
```js
const me = byYear(1990);                       // 내 띠
bubble.innerHTML = `${imgTag(me,{size:22})} ${me.animal}띠, 올해가 재밌어.`;
```

**② 아바타 / 프로필** (원형)
```js
avatar.innerHTML = imgTag(ganji(day.stem, day.branch), { size:96, round:true });
```

**③ 캐릭터 색으로 UI 테마 물들이기** (말풍선 보더·강조)
```js
const c = ganji(p.stem, p.branch);
box.style.setProperty('--accent', c.color);    // 이미지 없이 색만 써도 됨
```

**④ 로딩 연출** (스피너 대신 팔자 캐릭터가 하나씩)
```js
loading.innerHTML = pillars.map(p => imgTag(ganji(p.stem,p.branch),{size:40})).join('');
```

**⑤ 데이터만 받아 프레임워크로 직접 렌더** (React/Vue 등 — imgTag 안 씀)
```js
const c = zodiac(branchIdx);
return <img src={c.src} alt={c.animal} style={{width:48}} />;
```

**⑥ 프리로드/서비스워커 프리캐시**
```js
import { zodiacPaths } from '/assets/images/characters/character-map.js';
zodiacPaths().forEach(src => { const i=new Image(); i.src=src; });  // 12지만 미리
```

---

## 계약 규칙 (지켜주면 UI가 바뀌어도 안 깨짐)

1. **경로·인덱싱·파일명 규칙은 여기서만** 안다. UI는 절대 `gapja/NN-..webp`를 직접 조립하지 말 것 → 항상 `ganji()`.
2. **반환 필드 이름은 안정 계약** (`src·animal·hanja·color·el·kind`). 필드 추가는 OK, 이름 변경은 소비자 합의 후.
3. 자산 경로가 바뀌면 **`setBase()` 한 줄** — 소비자 코드 무변경.
4. 배치·크기·모션은 **UI 소관**(리졸버는 데이터·선택적 `imgTag`만).

> 요약: **"어디에 쓸지"는 나중에 정해도 된다. "무엇을 줄지"는 이 파일이 이미 확정했다.**
