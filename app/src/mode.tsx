import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { makeTheme } from './theme'
import type { Mode } from './theme'

const ModeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void; toggle: () => void }>({
  mode: 'light',
  setMode: () => {},
  toggle: () => {},
})

export const useMode = () => useContext(ModeCtx)

function initialMode(): Mode {
  try {
    const saved = localStorage.getItem('saju-mode')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* noop */
  }
  return 'light'
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    // 브라우저 크롬(주소창) 색을 앱 내 수동 토글과 동조 — 미디어 분기 메타는 초기 폴백
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', mode === 'dark' ? '#131315' : '#22409e'))
    try {
      localStorage.setItem('saju-mode', mode)
    } catch {
      /* noop */
    }
  }, [mode])

  const value = useMemo(
    () => ({ mode, setMode, toggle: () => setMode(mode === 'light' ? 'dark' : 'light') }),
    [mode],
  )
  const theme = useMemo(() => makeTheme(mode), [mode])

  return (
    <ModeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ModeCtx.Provider>
  )
}
