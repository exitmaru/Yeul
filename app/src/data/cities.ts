/**
 * 출생지 → 동경(경도) 테이블 — 진태양시 보정용(경도×4분, 엔진 manseryeok가 계산).
 * 국내 주요 도시 시청 기준 경도(소수 3자리). 서울 126.978이 엔진 기본값과 동일 기준.
 * 해외 출생은 시간대까지 달라져 별도 축(로드맵) — 이 표는 한국(KST 출생) 한정.
 */
export interface City {
  name: string
  longitude: number
}

export const CITIES: City[] = [
  { name: '서울', longitude: 126.978 },
  { name: '부산', longitude: 129.075 },
  { name: '대구', longitude: 128.601 },
  { name: '인천', longitude: 126.705 },
  { name: '광주', longitude: 126.851 },
  { name: '대전', longitude: 127.385 },
  { name: '울산', longitude: 129.311 },
  { name: '세종', longitude: 127.289 },
  { name: '수원', longitude: 127.029 },
  { name: '고양', longitude: 126.836 },
  { name: '용인', longitude: 127.178 },
  { name: '성남', longitude: 127.126 },
  { name: '청주', longitude: 127.489 },
  { name: '천안', longitude: 127.114 },
  { name: '공주', longitude: 127.119 },
  { name: '전주', longitude: 127.148 },
  { name: '목포', longitude: 126.392 },
  { name: '여수', longitude: 127.662 },
  { name: '순천', longitude: 127.487 },
  { name: '포항', longitude: 129.343 },
  { name: '창원', longitude: 128.681 },
  { name: '진주', longitude: 128.108 },
  { name: '춘천', longitude: 127.730 },
  { name: '원주', longitude: 127.920 },
  { name: '강릉', longitude: 128.876 },
  { name: '제주', longitude: 126.531 },
]

export const DEFAULT_CITY = CITIES[0]

export function cityByName(name: string | undefined | null): City {
  return CITIES.find((c) => c.name === name) ?? DEFAULT_CITY
}
