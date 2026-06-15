// =========================================================
// knowledge/002-brand.knowledge.js
// 공통 지식 — 「어휴게소」 브랜드/카피의 단일 출처.
//   인생 고속도로 위의 휴게소 톤 + 디시식 B급 자조, 바닥엔 위로.
//   (어휴 + 휴게소 — 달리다 지쳐 잠깐 빠져나오는 곳.)
// =========================================================

export const BRAND = Object.freeze({
  titleKo: "어휴게소",
  titleHanja: "御休憩所",
  titleRoman: "EOHYU-GESO",
  appName: "어휴게소",
  subtitle: "인생 고속도로 위, 잠깐 빠져 한숨 돌리는 곳",
  logline: "존버하라고 안 합니다. 어휴, 잠깐 쉬었다 가세요.",
  taglines: [
    "버티는 게 미덕이라고, 누가 정했나.",
    "도망 아니다. 출구다.",
    "풀악셀이 기본값인 도로가, 이상한 거다.",
    "갓길도, 길이다.",
  ],
  synopsis:
    "모두가 풀악셀만 밟던 시절, 한 사람이 처음으로 갓길에 차를 세웠다. " +
    "비상등을 켜고, 창문을 내리고, 어휴 — 하고 길게 숨을 뱉었다. " +
    "그 한숨은 옆 차선으로, 뒤차로, 전국의 정체 구간으로 번졌다. " +
    "그는 길을 막으려던 게 아니었다 — 다만 가장 먼저 깜빡이를 켰을 뿐. " +
    "빠져나오는 건 후진이 아니라, 방향을 바꾸는 일이다.",
  release: {
    main: "24시간 영업 · 연중무휴 — 지금 영업 중",
    sub: "입장료 없음. 자리는 당신이 잠깐 비우는 그 갓길 하나뿐.",
    rating: "전 좌석 이용가 · 권장 체류시간: 어휴 한숨 한 번",
  },
});

export const CTA = Object.freeze({
  primary: "잠깐 들렀다 가기",
  trailer: "안내방송 듣기",
  resign: "출구로 빠지기",
});

export const AUDIENCE = Object.freeze([
  {
    icon: "battery",
    title: "졸음운전 직전의 직장인",
    desc: "월요일이 일요일 밤부터 시작되는 당신. 눈꺼풀은 천근, 핸들은 무거운데 갓길은 안 보이고. 졸다 박기 전에 — 여기 잠깐 세우세요. 버티는 건 근성이 아니라, 가끔은 그냥 사고예요.",
  },
  {
    icon: "draft",
    title: "깜빡이를 켤까 말까 하는 사람",
    desc: "나들목은 보이는데 깜빡이를 못 켜는 당신. 켜봤다 아니면 다시 직진하면 됩니다. 필요한 건 용기가 아니라, 깜빡이 한 번이에요.",
  },
  {
    icon: "exit",
    title: "이미 빠져나온 사람",
    desc: "이미 출구로 빠져 국도를 달리는 당신. 도망 잘 쳤습니다 — 그건 패배가 아니라 핸들을 꺾은 거예요. 느려도 풍경은 이쪽이 낫습니다.",
  },
]);

export const FAQ = Object.freeze([
  { q: "여기서 쉬면 뒤처지는 거 아닌가요?", a: "화장실 들렀다고 경기에서 진 사람, 보셨어요? 다리 풀고 다시 타면 됩니다. 안 타도 되고요." },
  { q: "퇴사하면 인생 끝난다던데요.", a: "출구로 빠진다고 도로가 사라지진 않아요. 그냥 다른 길로 가는 겁니다. 끝 아니에요." },
  { q: "나만 못 버티는 것 같아 부끄럽습니다.", a: "옆 차선 사람도 핸들 붙잡고 똑같이 웁니다. 당신만 그런 거 아니에요." },
]);

export const FOOTER =
  "어휴게소 © 2026 전국퇴사자연합 직영 · 인생 고속도로 어휴게소(상행) · 버티지 말고, 들렀다 가세요.";

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
