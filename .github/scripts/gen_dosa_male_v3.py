# 남신 도사 v3 — C안(밤 수채, face_c_night) 확정(Q.19) → 표정 5세트 확장.
# 기준 이미지 = app/public/reports/dosa-male-v2/face_c_night.png 를 edits 참조(캐릭터 일관성).
# GH Actions 러너 전용.
import base64
import os
import pathlib
import sys
import time

import requests

KEY = "".join(os.environ["OPENAI_API_KEY"].split())  # 시크릿 복붙 개행·공백 방어(2호 런 실측)
AUTH = {"Authorization": f"Bearer {KEY}"}
API = "https://api.openai.com/v1/images"

BASE = pathlib.Path("app/public/reports/dosa-male-v2/face_c_night.png")
OUT = pathlib.Path("app/public/reports/dosa-male-v3")
OUT.mkdir(parents=True, exist_ok=True)

SIZE = "1024x1536"
QUALITY = "high"

KEEP = ("이 이미지의 캐릭터를 그대로 유지해줘 — 같은 얼굴(흑발 웨이브 미디엄 헤어·앞머리 눈가에 걸림·날카로운 눈매·피어싱), "
        "같은 먹색 모던 로브, 같은 수채 질감, 같은 청보라 밤하늘 배경(별·초승달 수채 번짐), 같은 정면 상반신 구도와 세로 비율. "
        "표정과 포즈만 아래처럼 바꾼다: ")

CUTS = [
    ("cut1_arrogant", KEEP + "팔짱을 끼고 접힌 쥘부채로 어깨를 톡톡 치며, 턱을 살짝 치켜들고 한쪽 입꼬리만 올린 자신만만한 미소로 내려다본다. \"내 사주풀이는 틀린 적이 없거든\" 하는 거만하지만 밉지 않은 여유."),
    ("cut2_serious", KEEP + "접은 쥘부채 끝을 입가에 살짝 댄 채 시선을 아래로 내리깔고 깊게 생각에 잠긴 진지한 표정. 미소 없이 차분하고 깊은 눈빛, 별빛이 눈동자에 비쳐 반짝인다. 갑자기 멋있어지는 순간의 가라앉은 공기."),
    ("cut3_clumsy", KEEP + "눈을 동그랗게 뜨고 살짝 당황해 어색하게 헛웃음 짓는 표정. 한 손으로 뒤통수를 긁적이고 이마 옆에 작은 땀방울 하나, 쥘부채는 손에서 미끄러져 떨어뜨리기 직전. 방금 진지한 얼굴로 헛소리를 해버린 직후의 민망하고 귀여운 분위기."),
    ("cut4_consult", KEEP + "활짝 편 쥘부채를 입가에 살짝 대고 상대를 지그시 바라보는 확신에 찬 부드러운 미소. 다른 손에는 별자리가 그려진 오래된 두루마리(만세력)를 들고 있다. \"자, 그대 사주 한번 볼까\" 하는 능숙한 밤의 점술가 분위기."),
    ("cut5_wink", KEEP + "활짝 편 쥘부채로 얼굴 아래쪽 절반을 가리고, 눈으로만 장난스럽게 웃으며 한쪽 눈을 살짝 윙크. 능청스럽고 여유로운 분위기. 홈 화면 인사 배너용 컷."),
]


def save(name: str, b64: str) -> None:
    path = OUT / f"{name}.png"
    path.write_bytes(base64.b64decode(b64))
    print(f"saved {path} ({path.stat().st_size} bytes)", flush=True)


def edit_from_base(prompt: str, fidelity: bool = True) -> str:
    data = {"model": "gpt-image-1", "prompt": prompt, "size": SIZE, "quality": QUALITY}
    if fidelity:
        data["input_fidelity"] = "high"
    with open(BASE, "rb") as f:
        r = requests.post(
            f"{API}/edits", headers=AUTH, timeout=300, data=data,
            files={"image": ("face_c_night.png", f, "image/png")},
        )
    if fidelity and r.status_code == 400 and "input_fidelity" in r.text:
        return edit_from_base(prompt, fidelity=False)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    return r.json()["data"][0]["b64_json"]


def with_retry(fn, label: str) -> str:
    for attempt in range(4):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001 — 러너 1회성 스크립트, 원인 불문 재시도 후 중단
            print(f"retry {label} ({attempt + 1}/4): {type(e).__name__}: {e}", flush=True)
            time.sleep(20)
    print(f"::error::{label} 4회 실패", flush=True)
    sys.exit(1)


assert BASE.exists(), f"기준 이미지 없음: {BASE}"
for name, prompt in CUTS:
    save(name, with_retry(lambda p=prompt: edit_from_base(p), name))

print("all v3 cuts done", flush=True)
