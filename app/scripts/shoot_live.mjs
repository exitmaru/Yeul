import { chromium } from 'playwright'
const BASE = process.env.BASE_URL || 'http://localhost:4184'
const OUT = '/tmp/claude-0/-home-user-Saju/33f1e65d-b4cf-55d9-a605-4abf630967f8/scratchpad/shots'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
await ctx.addInitScript(() => localStorage.setItem('saju-mode', 'dark'))
const page = await ctx.newPage()

// 폼에 다른 생년월일시 입력 → 제출 → 결과
await page.goto(BASE + '/input', { waitUntil: 'networkidle' })
await page.getByPlaceholder('1990/01/01 08:24').fill('1985/08/20 14:30')
await page.screenshot({ path: `${OUT}/input-live.png` })
await page.getByRole('button', { name: '사주 풀이하기' }).click()
await page.waitForURL('**/result', { timeout: 9000 })
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/result-live.png` })
console.log('live shot done')
await browser.close()
