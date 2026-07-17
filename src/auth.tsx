import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export interface User {
  id: number
  email: string
  name: string | null
}
export type Profile = Record<string, unknown> | null

interface AuthState {
  user: User | null
  profile: Profile
  loading: boolean
  refresh: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  saveProfile: (p: Record<string, unknown>) => Promise<void>
}

const AuthCtx = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => {},
  signup: async () => ({}),
  login: async () => ({}),
  logout: async () => {},
  saveProfile: async () => {},
})

export const useAuth = () => useContext(AuthCtx)

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, data } as { ok: boolean; data: { error?: string; user?: User } }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/me')
      const d = await r.json()
      setUser(d.user ?? null)
      setProfile(d.profile ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signup = async (email: string, password: string, name: string) => {
    const { ok, data } = await post('/api/signup', { email, password, name })
    if (!ok) return { error: data.error || '가입에 실패했어요' }
    setUser(data.user ?? null)
    await refresh()
    return {}
  }
  const login = async (email: string, password: string) => {
    const { ok, data } = await post('/api/login', { email, password })
    if (!ok) return { error: data.error || '로그인에 실패했어요' }
    setUser(data.user ?? null)
    await refresh()
    return {}
  }
  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch {
      /* noop */
    }
    setUser(null)
    setProfile(null)
  }
  const saveProfile = async (p: Record<string, unknown>) => {
    setProfile(p)
    try {
      await post('/api/profile', { profile: p })
    } catch {
      /* 게스트/오프라인이면 조용히 무시 */
    }
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, refresh, signup, login, logout, saveProfile }}>
      {children}
    </AuthCtx.Provider>
  )
}
