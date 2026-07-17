import { useState } from 'react'
import { Box, Typography, OutlinedInput, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import StatusBar from '../components/StatusBar'
import { tokens } from '../theme'
import { useAuth } from '../auth'

export default function Auth() {
  const nav = useNavigate()
  const { user, login, signup, logout } = useAuth()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setErr('')
    setBusy(true)
    const res = mode === 'signup' ? await signup(email, password, name) : await login(email, password)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    nav('/')
  }

  const inputSx = { borderRadius: '12px', bgcolor: 'var(--c-card)', mb: 1.2 }

  // 이미 로그인 상태면 계정 요약
  if (user) {
    return (
      <Screen>
        <StatusBar time="9:41" />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 3 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 0.5 }}>내 계정</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.color.inkSub, mb: 3 }}>
            {user.name ? `${user.name}님 · ` : ''}
            {user.email}
          </Typography>
          <Box className="glass" sx={{ borderRadius: '18px', p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 13.5, color: tokens.color.ink, lineHeight: 1.6 }}>
              출생 정보가 계정에 저장돼요. 폰을 바꿔도 로그인만 하면 그대로 이어집니다.
            </Typography>
          </Box>
          <Button fullWidth variant="contained" onClick={() => nav('/')} sx={{ py: 1.6, borderRadius: '14px', mb: 1 }}>
            홈으로
          </Button>
          <Button
            fullWidth
            onClick={async () => {
              await logout()
            }}
            sx={{ py: 1.4, borderRadius: '14px', color: tokens.color.inkSub }}
          >
            로그아웃
          </Button>
        </Box>
      </Screen>
    )
  }

  return (
    <Screen>
      <StatusBar time="9:41" />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 3 }}>
        <Typography sx={{ fontSize: 25, fontWeight: 800, letterSpacing: 'var(--tracking)' }}>
          {mode === 'signup' ? '간단 가입' : '로그인'}
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: tokens.color.inkSub, mt: 0.6, mb: 2.5 }}>
          이메일 하나면 돼요. 출생 정보는 계정에 저장돼 어디서 열어도 이어져요.
        </Typography>

        <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.7 }}>이메일</Typography>
        <OutlinedInput
          fullWidth
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={inputSx}
        />
        <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.7, mt: 0.5 }}>비밀번호</Typography>
        <OutlinedInput
          fullWidth
          type="password"
          placeholder="8자 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={inputSx}
        />
        {mode === 'signup' && (
          <>
            <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.7, mt: 0.5 }}>부를 이름</Typography>
            <OutlinedInput
              fullWidth
              placeholder="뭐라고 부를까요?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputSx}
            />
          </>
        )}

        {err && <Typography sx={{ fontSize: 12.5, color: tokens.color.solar, mt: 0.5, mb: 0.5 }}>{err}</Typography>}

        <Button
          fullWidth
          variant="contained"
          disabled={busy}
          onClick={submit}
          sx={{ py: 1.7, fontSize: 17, borderRadius: '14px', mt: 1.5 }}
        >
          {busy ? '처리 중…' : mode === 'signup' ? '가입하고 시작' : '로그인'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2, fontSize: 13 }}>
          <Typography
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setErr('')
            }}
            sx={{ fontSize: 13, fontWeight: 700, color: tokens.color.primary, cursor: 'pointer' }}
          >
            {mode === 'signup' ? '이미 계정 있어요 · 로그인' : '계정 만들기 · 가입'}
          </Typography>
          <Typography sx={{ color: tokens.color.inkFaint }}>·</Typography>
          <Typography onClick={() => nav('/')} sx={{ fontSize: 13, fontWeight: 700, color: tokens.color.inkSub, cursor: 'pointer' }}>
            일단 구경만
          </Typography>
        </Box>
      </Box>
    </Screen>
  )
}
