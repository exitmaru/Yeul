// =========================================================
// knowledge/002-brand.knowledge.js
// 공통 지식 — 「어휴게소」 브랜드/카피의 단일 출처.
//   인생 고속도로 위의 휴게소 톤. 모든 unit 이 참조.
//   (어휴 + 휴게소 — 달리다 지쳐 잠깐 빠져나오는 곳. 바닥엔 위로.)
// =========================================================

export const BRAND = Object.freeze({
  titleKo: "어휴게소",
  titleHanja: "御休憩所",
  titleRoman: "EOHYU-GESO",
  appName: "어휴게소",
  subtitle: "인생 고속도로 위, 어휴 한숨 한 번 쉬었다 가는 곳",
  logline: "버티라고 안 합니다. 어휴, 잠깐 쉬었다 가세요.",
  taglines: [
    "여기선 아무도 ‘더 달리라’고 하지 않는다.",
    "졸리면 졸음쉼터, 지치면 어휴게소.",
    "출구(IC)는 늘 오른쪽에 있다 — 빠져나가도 괜찮다.",
    "한숨도 휴식이다. 어휴, 하고 크게 한 번.",
  ],
  synopsis:
    "모두가 액셀만 밟던 시절, 한 사람이 처음으로 갓길에 차를 세웠다. " +
    "비상등을 켜고, 창문을 내리고, 어휴 — 하고 길게 숨을 뱉었다. " +
    "그 한숨은 곧 옆 차선으로, 뒤차로, 전국의 정체 구간으로 번졌다. " +
    "그는 길을 막으려던 게 아니었다 — 다만 가장 먼저 깜빡이를 켰을 뿐. " +
    "어휴게소, 그건 게으름이 아니라 정비(整備)다.",
  release: {
    main: "24시간 영업 · 연중무휴 — 지금 영업 중",
    sub: "입장료 없음. 자리는 당신이 잠깐 비우는 그 갓길 하나뿐.",
    rating: "전 좌석 이용가 · 권장 체류시간: 어휴 한숨 한 번",
  },
});

export const CTA = Object.freeze({
  primary: "잠깐 들렀다 가기",
  trailer: "안내방송 듣기",
  resign: "출구 미리보기",
});

export const AUDIENCE = Object.freeze([
  {
    icon: "battery",
    title: "졸음운전 직전의 직장인",
    desc: "월요일이 일요일 밤부터 시작되는 당신. 눈꺼풀은 천근, 핸들은 무겁고, 갓길은 안 보이고. 사고 나기 전에 — 여기, 어휴게소에 한 번 들르세요.",
  },
  {
    icon: "draft",
    title: "깜빡이를 켤까 말까 하는 사람",
    desc: "나들목은 보이는데 깜빡이를 못 켜는 당신. 빠져나가도 길은 또 있습니다. 필요한 건 용기가 아니라, 깜빡이 한 번입니다.",
  },
  {
    icon: "exit",
    title: "이미 빠져나온 사람",
    desc: "이미 출구로 빠져 국도를 달리는 당신. 잘했습니다, 정말로. 느려도 풍경은 이쪽이 낫습니다. 천천히 가세요.",
  },
]);

export const FAQ = Object.freeze([
  { q: "여기 진짜 휴게소예요?", a: "전국 어디에나 있고, 매일 누군가 들릅니다. 다만 파는 건 호두과자가 아니라, 한숨 한 번 돌릴 여유입니다." },
  { q: "이용료가 있나요?", a: "공짜입니다. 자리는 당신이 잠깐 차를 세우는 그 갓길 하나뿐이고요." },
  { q: "다시 고속도로로 돌아가야 하나요?", a: "그건 당신이 정합니다. 다만 하나는 약속해요 — 출구(IC)는, 언제나 오른쪽에 있습니다." },
]);

export const FOOTER =
  "어휴게소 © 2026 전국퇴사자연합 · 인생 고속도로 어휴게소(상행) · 어휴, 쉬었다 가세요.";

// 사용자가 직접 생성할 이미지용 프롬프트 (영어, 시네마틱)
export const IMAGE_PROMPTS = Object.freeze([
  {
    use: "히어로 메인 — 밤의 휴게소",
    prompt:
      "Cinematic wide shot of a lone highway rest area glowing warm amber at night beside a dark empty expressway, a big retro illuminated '휴게소' style sign, one tired traveler standing alone under the canopy lights with a paper coffee cup, deep cobalt-blue night sky, warm sodium-vapor glow versus cold blue shadows, 35mm film grain, anamorphic lens flare, melancholic yet comforting mood, teal-and-orange contrast, vertical poster composition with empty space at top for title, photorealistic, nostalgic Korean roadside aesthetic.",
  },
  {
    use: "스크롤 배경 — 텅 빈 고속도로",
    prompt:
      "Atmospheric ultra-wide night shot of an empty Korean expressway stretching into darkness, faint red tail-lights bokeh trailing away, a distant rest-area sign glowing warm on the horizon, deep cobalt and midnight tones, light fog and drizzle, melancholic cinematic stillness, 35mm film texture, muted desaturated palette, moody noir lighting.",
  },
  {
    use: "메뉴 카드 — 자판기 커피",
    prompt:
      "Extreme close-up of a paper cup of vending-machine coffee steaming on a worn stainless rest-area table under cold fluorescent light, blurred neon snack signs in the background, dust and steam catching the light, deep cobalt shadows with a warm highlight, 35mm macro film photography, lonely but cozy late-night mood, shallow depth of field, cinematic color grading, nostalgic Korean rest stop.",
  },
  {
    use: "엔딩 / CTA — 출구로 빠지는 순간",
    prompt:
      "A single car taking the exit ramp off a dark highway into blinding warm morning light, seen from behind, the cold grey expressway fading behind while a bright open country road opens ahead, lens flare and golden hour glow, sense of release and relief and a fresh start, 35mm cinematic film still, emotional, cobalt-blue highway fading into warm exterior light, vertical composition, photorealistic.",
  },
]);

// 막(구간) 필터에 사용
export const ACTS = Object.freeze(["전체", "1막", "2막", "3막"]);
