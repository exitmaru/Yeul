import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import StatusBar from '../components/StatusBar'
import BillyNav from '../components/BillyNav'
import SajuTable from '../components/SajuTable'
import { tokens } from '../theme'
import { useMode } from '../mode'
import { computeChartUI, type UiChart } from '../engine'
import { todayInfo, myTodayFortune, toReading, ohaengWithoutHour, type Reading, type OhaengStat } from '../data/saju'
import { activeProfile, profileToInput, profileToSearch } from '../data/profiles'

function CircleBtn({ children, label, onClick }: { children: ReactNode; label?: string; onClick?: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        aria-label={label}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: tokens.color.primarySoft,
          color: tokens.color.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform .12s var(--ease)',
          '&:active': onClick ? { transform: 'scale(0.98)' } : {},
        }}
      >
        {children}
      </Box>
      {label && (
        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: tokens.color.inkFaint, mt: 0.5, textAlign: 'center' }}>{label}</Typography>
      )}
    </Box>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <Typography sx={{ fontSize: 15, fontWeight: 800, color: tokens.color.ink, mb: 1.2, mt: 2.5 }}>{children}</Typography>
}

const OH_LABEL: Record<string, string> = {
  목: 'var(--oh-label-mok)', 화: 'var(--oh-label-hwa)', 토: 'var(--oh-label-to)', 금: 'var(--oh-label-geum)', 수: 'var(--oh-label-su)',
}

function OhaengMini({ ohaeng, total }: { ohaeng: OhaengStat[]; total: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.6, mt: 1.2 }}>
      {ohaeng.map((o) => (
        <Box key={o.key} sx={{ flex: 1, textAlign: 'center' }}>
          <Box sx={{ height: 5, borderRadius: 3, bgcolor: tokens.color.border, mb: 0.5, overflow: 'hidden' }}>
            <Box sx={{ width: `${Math.min(100, o.pct * 2)}%`, height: '100%', borderRadius: 3, bgcolor: tokens.ohaeng[o.key].bg }} />
          </Box>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: OH_LABEL[o.key], lineHeight: 1.1 }}>{o.key}</Typography>
          <Typography sx={{ fontSize: 10.5, color: tokens.color.inkSub, fontWeight: 700 }}>
            {Math.round((o.pct * total) / 100)}개
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default function Home() {
  const nav = useNavigate()
  const { mode } = useMode()
  const dark = mode === 'dark'
  const heroBg = dark
    ? 'linear-gradient(180deg,#2a2a31 0%, #232329 55%, var(--c-page) 100%)'
    : 'linear-gradient(180deg,#fce7db 0%, #fbeee7 55%, var(--c-page) 100%)'
  const meadow = dark ? 'radial-gradient(circle at 50% 40%, #33422f, #2a3329)' : 'radial-gradient(circle at 50% 40%, #d9ecc4, #c4e0ac)'

  const profile = activeProfile()
  const today = todayInfo()

  const data = useMemo(() => {
    if (!profile) return null
    try {
      const input = profileToInput(profile)
      const chart: UiChart = computeChartUI(input)
      const reading: Reading = toReading(input, { hourUnknown: profile.hourUnknown })
      const fortune = myTodayFortune(input)
      return { input, chart, reading, fortune }
    } catch {
      return null
    }
  }, [profile])

  const search = profile ? profileToSearch(profile) : ''
  const goReading = () => nav(profile ? `/loading?${search}` : '/input')

  // 오늘의 운세 공유 — 최고 공유 소재(점수+한줄), 죽어 있던 📮 슬롯의 실기능화
  const [sharedToday, setSharedToday] = useState(false)
  const onShareToday = async () => {
    const f = data?.fortune
    const url = `${location.origin}/result?${search}`
    const text = f ? `오늘의 운세 ${f.score}점 — ${f.oneLine}` : '내 사주 리포트'
    try {
      if (navigator.share) {
        await navigator.share({ title: '아이샤 · 오늘의 운세', text, url })
        return
      }
    } catch {
      /* 취소 → 폴백 생략 */
      return
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setSharedToday(true)
      setTimeout(() => setSharedToday(false), 2500)
    } catch {
      /* noop */
    }
  }

  // ── 온보딩(프로필 없음) — 목업·가짜 수치 없이 시작 안내만 ──
  if (!profile || !data) {
    return (
      <Screen>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ background: heroBg, px: 2.5, pb: 3, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <StatusBar />
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokens.color.primary, letterSpacing: 'var(--tracking)', pt: 0.5 }}>
              아이샤
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.2, mt: 2 }}>
              <Box sx={{ lineHeight: 1.05 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: tokens.color.inkFaint }}>{today.monthShort}</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: tokens.color.inkSub }}>{today.day}</Typography>
              </Box>
              <Typography sx={{ fontSize: 32, fontWeight: 800, color: tokens.color.ink, letterSpacing: 'var(--tracking)' }}>어서 오세요</Typography>
            </Box>

            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ position: 'relative', maxWidth: '78%', bgcolor: tokens.color.primary, color: tokens.color.onPrimary, px: 2, py: 1.3, borderRadius: '18px' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>
                  오늘은 <b>{today.dayName}</b>일. 생년월일시를 알려주면 그대 사주로 오늘을 읽어드리지.
                </Typography>
                <Box sx={{ position: 'absolute', bottom: -7, left: 30, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `9px solid ${tokens.color.primary}` }} />
              </Box>
            </Box>

            <Box sx={{ mt: 1, mx: 'auto', width: 210, height: 150, borderRadius: '50%', background: meadow, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ fontSize: 84, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.15))' }}>🐴</span>
              <span style={{ position: 'absolute', top: 18, right: 34, fontSize: 15 }}>✨</span>
            </Box>

            <Box sx={{ flex: 1 }} />
            <Button fullWidth variant="contained" onClick={() => nav('/input')} sx={{ mt: 2 }}>
              내 사주 시작하기
            </Button>
            <Typography sx={{ textAlign: 'center', fontSize: 11.5, color: tokens.color.inkFaint, mt: 1.2, lineHeight: 1.5 }}>
              입력한 정보는 이 기기에만 저장돼요 · 근거 문헌 2,504편 기반 풀이
            </Typography>
          </Box>
        </Box>
        <BillyNav active="home" onTab={(k) => (k === 'analysis' || k === 'today') && nav('/input')} />
      </Screen>
    )
  }

  // ── 내 사주 홈(프로필 있음) — 전부 실계산 ──
  const { chart, reading, fortune } = data
  const ohaeng = profile.hourUnknown ? ohaengWithoutHour(chart.pillars) : chart.ohaeng
  const traitLine = reading.dialogue.find((s) => s.label.includes('특성'))?.lines[0]
  const yearLine = reading.dialogue.find((s) => s.label.startsWith('올해'))?.lines[0]

  return (
    <Screen>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* 히어로 */}
        <Box sx={{ background: heroBg, px: 2.5, pb: 2 }}>
          <StatusBar />
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: tokens.color.primary, letterSpacing: 'var(--tracking)', pt: 0.5 }}>
            아이샤
          </Typography>

          {/* 이름 + 날짜 (오늘 실값) */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.2, mt: 2 }}>
            <Box sx={{ lineHeight: 1.05 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: tokens.color.inkFaint }}>{today.monthShort}</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: tokens.color.inkSub }}>{today.day}</Typography>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 800, color: tokens.color.ink, letterSpacing: 'var(--tracking)' }}>{profile.name}</Typography>
          </Box>

          {/* 말풍선 — 오늘 일진 실계산 */}
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ position: 'relative', maxWidth: '78%', bgcolor: tokens.color.primary, color: tokens.color.onPrimary, px: 2, py: 1.3, borderRadius: '18px' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>
                오늘 일진은 <b>{today.dayName}</b>일. {fortune?.oneLine ?? ''}
              </Typography>
              <Box sx={{ position: 'absolute', bottom: -7, left: 30, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `9px solid ${tokens.color.primary}` }} />
            </Box>
          </Box>

          {/* 캐릭터 */}
          <Box sx={{ mt: 1, mx: 'auto', width: 210, height: 150, borderRadius: '50%', background: meadow, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <span style={{ fontSize: 84, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.15))' }}>🐴</span>
            <span style={{ position: 'absolute', top: 18, right: 34, fontSize: 15 }}>✨</span>
          </Box>

          {/* 액션 + 오늘의 운세 점수(엔진 관계 기반 정책 점수) */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CircleBtn label="리포트" onClick={() => nav(`/result?${search}`)}>↗</CircleBtn>
              <CircleBtn label="공유" onClick={onShareToday}>{sharedToday ? '✓' : '📮'}</CircleBtn>
              <CircleBtn label="정보수정" onClick={() => nav('/input')}>✎</CircleBtn>
            </Box>
            {fortune && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: tokens.color.inkSub }}>
                  오늘의 운세{fortune.theme ? ` · ${fortune.theme}` : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.4, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: 'var(--c-ink)', lineHeight: 1, letterSpacing: 'var(--tracking)' }}>{fortune.score}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-ink-sub)', paddingBottom: 4 }}>점</span>
                </Box>
                {fortune.basis.length > 0 && (
                  <Typography sx={{ fontSize: 11.5, color: tokens.color.inkSub, fontWeight: 600 }}>{fortune.basis.slice(0, 2).join(' · ')}</Typography>
                )}
              </Box>
            )}
          </Box>

          {/* 분석 진입 — 단일 버튼 규격(outlined=보조 동작) */}
          <Button fullWidth variant="outlined" onClick={goReading} sx={{ mt: 1.5 }}>
            아이샤에게 자세히 물어볼까요?
          </Button>
        </Box>

        {/* 콘텐츠: 사주 원국 + 개요 */}
        <Box sx={{ px: 2.5, pb: 3 }}>
          <SectionTitle>나의 사주 원국</SectionTitle>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <SajuTable pillars={chart.pillars} unknownHour={profile.hourUnknown} />
          </Box>
          <OhaengMini ohaeng={ohaeng} total={profile.hourUnknown ? 6 : 8} />

          <SectionTitle>한눈에 보기</SectionTitle>
          <Box className="glass" sx={{ borderRadius: '18px', p: 2 }}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: tokens.color.primary, mb: 0.8 }}>{reading.headline}</Typography>
            {[traitLine, yearLine].filter(Boolean).map((l, i) => (
              <Typography key={i} sx={{ fontSize: 13.5, color: tokens.color.inkSub, lineHeight: 1.55, mb: 0.3 }}>· {l}</Typography>
            ))}
          </Box>

          {/* 리포트 진입 프로모 */}
          <Box
            className="glass"
            onClick={() => nav(`/result?${search}`)}
            role="button"
            sx={{
              mt: 1.5,
              borderRadius: '18px',
              p: 1.8,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'transform .12s var(--ease)',
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            <Box sx={{ fontSize: 28 }}>🎁</Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: tokens.color.solar }}>REPORT</Typography>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.color.ink }}>전체 리포트 보기 — 근거 문헌과 함께 ›</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 오늘 = 홈이 곧 오늘의 운세 화면(중복 목적지 제거) · 분석 = 리포트 직행 */}
      <BillyNav active="home" onTab={(k) => { if (k === 'analysis') nav(`/result?${search}`) }} />
    </Screen>
  )
}
