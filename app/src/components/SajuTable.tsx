import { Box, Typography } from '@mui/material'
import { tokens } from '../theme'
import type { Pillar } from '../data/saju'
import OhaengTile from './OhaengTile'

/** 시간 모름 자리 표시 타일 — 값을 날조하지 않고 '모름'을 그대로 보여준다 */
function UnknownTile({ size = 46 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.5,
        bgcolor: 'var(--c-card)',
        border: `1.5px dashed ${tokens.color.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tokens.color.inkFaint,
        fontSize: size * 0.4,
        fontWeight: 800,
      }}
    >
      ?
    </Box>
  )
}

/** 사주 원국표 카드 — 열=시/일/월/년, 행=십성·천간·지지·십성. unknownHour=시주 미상(값 미표시) */
export default function SajuTable({ pillars, unknownHour = false }: { pillars: Pillar[]; unknownHour?: boolean }) {
  const star = (t: string) => (
    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: tokens.color.inkSub, textAlign: 'center', letterSpacing: 'var(--tracking)' }}>
      {t}
    </Typography>
  )
  return (
    <Box
      className="glass"
      sx={{
        borderRadius: '18px',
        p: 1.5,
        display: 'inline-block',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        {pillars.map((p, i) =>
          unknownHour && p.title === '시' ? (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.7 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: tokens.color.inkFaint }}>시</Typography>
              {star('모름')}
              <UnknownTile />
              <UnknownTile />
              {star('─')}
              <Typography sx={{ fontSize: 10.5, color: tokens.color.inkFaint, textAlign: 'center', fontWeight: 500 }}>─</Typography>
            </Box>
          ) : (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.7 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: p.isDayMaster ? tokens.color.primary : tokens.color.inkFaint }}>
                {p.title}
              </Typography>
              {star(p.topStar)}
              <OhaengTile main={p.ganK} hanja={p.gan} polarity={p.ganPolarity} element={p.ganE} highlight={p.isDayMaster} />
              <OhaengTile main={p.jiK} hanja={p.ji} polarity={p.jiPolarity} element={p.jiE} />
              {star(p.botStar)}
              <Typography sx={{ fontSize: 10.5, color: tokens.color.inkFaint, textAlign: 'center', fontWeight: 500 }}>{p.stage}</Typography>
            </Box>
          ),
        )}
      </Box>
    </Box>
  )
}
