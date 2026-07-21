# 남신 도사 시안 v2 — "새끈" 방향 전환 (Q.18): 정통 신선상 기각 → 아이돌급 조각 미남 + 시크 무드.
# 기준 얼굴 후보 3안(톤 변주: 다크 시크 / 아이샤 파스텔 호환 / 밤 수채)을 독립 생성해 픽을 받는다.
# GH Actions 러너 전용. 실존 인물 참조 없음 — 텍스트 묘사만.
import base64
import os
import pathlib
import sys
import time

import requests

KEY = "".join(os.environ["OPENAI_API_KEY"].split())  # 시크릿 복붙 개행·공백 방어(2호 런 실측)
AUTH = {"Authorization": f"Bearer {KEY}"}
API = "https://api.openai.com/v1/images"

OUT = pathlib.Path("app/public/reports/dosa-male-v2")
OUT.mkdir(parents=True, exist_ok=True)

SIZE = "1024x1536"
QUALITY = "high"

FACE = """[얼굴·공통]
20대 초중반의 K-pop 아이돌급 조각 미남 캐릭터(실사 아님, 일러스트). 살짝 웨이브 진 흑발 미디엄 헤어, 앞머리 몇 가닥이 눈썹과 눈가에 흘러내려 걸려 있다. 날카로운 아치형 눈썹, 가늘고 깊은 눈매에 나른하고 시크한 눈빛, 오똑한 콧대, 또렷한 입술, 창백할 만큼 맑은 피부, 날렵한 턱선. 한쪽 귀에 은색 피어싱 여러 개와 가는 체인 귀걸이. 표정은 살짝 내려보는 듯한 도도한 여유 — 잘생긴 걸 본인이 아는 얼굴."""

CUTS = [
    ("face_a_dark", FACE + """

[스타일·무드 A — 다크 시크]
세련된 다크 애니메이션 일러스트. 어두운 라운지 분위기의 배경에 보라·블루 네온 빛이 은은하게 감돈다. 검은 셔츠 위에 먹색의 모던한 로브(두루마기를 재해석한 오버핏 실루엣)를 걸치고, 목에는 검은 염주 체인. 한 손가락 사이에 접힌 쥘부채를 가볍게 끼워 돌리는 중. 시크하고 퇴폐적인 여유, 반쯤 뜬 눈으로 정면을 내려보는 시선.

[구도]
정면 상반신(가슴 위) 프로필 구도, 인물 중앙, 머리 위 여백 넉넉. 세로 초상."""),
    ("face_b_pastel", FACE + """

[스타일·무드 B — 파스텔 새끈]
부드러운 수채 파스텔 애니메이션 일러스트(밝고 깨끗한 톤). 배경은 연한 하늘색 수채 하늘과 옅은 구름. 흰 오버핏 셔츠를 단추 한두 개 풀어 입고 그 위에 연청·먹색 그라데이션의 가벼운 모던 로브, 은목걸이. 한 손에 접힌 쥘부채. 한쪽 입꼬리만 올린 시크한 미소, 앞머리 사이로 보이는 나른한 눈. 청량한데 도도한 분위기.

[구도]
정면 상반신(가슴 위) 프로필 구도, 인물 중앙, 머리 위 여백 넉넉. 세로 초상."""),
    ("face_c_night", FACE + """

[스타일·무드 C — 밤 수채]
수채 질감의 애니메이션 일러스트, 어스름한 청보라 밤하늘 배경에 별과 초승달이 수채 번짐으로 떠 있다. 먹색 모던 로브에 은은한 별자리 문양, 귀의 은 피어싱이 달빛에 반짝인다. 쥘부채를 반쯤 펼쳐 어깨에 걸치듯 들고, 고개를 살짝 기울여 나른하게 응시. 신비롭고 시크한 밤의 점술가 무드.

[구도]
정면 상반신(가슴 위) 프로필 구도, 인물 중앙, 머리 위 여백 넉넉. 세로 초상."""),
]


def save(name: str, b64: str) -> None:
    path = OUT / f"{name}.png"
    path.write_bytes(base64.b64decode(b64))
    print(f"saved {path} ({path.stat().st_size} bytes)", flush=True)


def gen(prompt: str) -> str:
    r = requests.post(
        f"{API}/generations", headers=AUTH, timeout=300,
        json={"model": "gpt-image-1", "prompt": prompt, "size": SIZE, "quality": QUALITY},
    )
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


for name, prompt in CUTS:
    save(name, with_retry(lambda p=prompt: gen(p), name))

print("all v2 faces done", flush=True)
