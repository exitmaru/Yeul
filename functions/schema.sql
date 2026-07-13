-- functions/schema.sql — 서버 계정 D1 스키마 (1회 실행)
-- 실행법 = docs/서버계정_설정.md 3단계 (대시보드 콘솔에 복붙이면 끝)

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,          -- UUID
  email      TEXT NOT NULL UNIQUE,      -- 소문자 정규화 저장
  pw_hash    TEXT NOT NULL,             -- v1:반복수:솔트:해시 (PBKDF2-SHA256)
  name       TEXT NOT NULL,             -- 부를 이름(닉네임) — 꼬미 호칭의 기반
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,          -- 토큰 원문은 쿠키에만, 여기엔 SHA-256만
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS profiles (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  y  INTEGER, mo INTEGER, d INTEGER, h INTEGER, mi INTEGER,
  sex INTEGER,                          -- 1=남 2=여
  time_unknown INTEGER DEFAULT 0,       -- 1=태어난 시간 모름(시주 의존 판정 보류)
  updated_at   INTEGER NOT NULL
);
