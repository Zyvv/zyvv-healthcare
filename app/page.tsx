// ============================================================
// ZYVV — Main Page
// File: app/page.tsx
// ============================================================
// Galaxy canvas layer runs behind everything:
//   - Ambient: deep-space stars drift slowly (blue-white, cyan, purple, gold)
//   - Typing: particles accelerate + converge toward textarea on each keystroke
//   - Submit: radial burst explosion before loading state
//
// Canvas is pure Canvas 2D — no dependencies, 60fps on mobile.
// ============================================================

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Door from '@/app/components/Door'
import PortalCounter from '@/app/components/PortalCounter'
import RoastReveal from '@/app/components/RoastReveal'
import ShareCard from '@/app/components/ShareCard'
import type { AppPhase, Door as DoorType, GenerateResponse } from '@/lib/types'

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const MAX_CHARS = 2000
const WARN_CHARS = 1800
const DOOR_REVEAL_DELAY = 900

// ── Star color palette — Milky Way feel ──────────────────────

const STAR_COLORS = [
  '#ffffff',
  '#c8d8ff',
  '#a0b8ff',
  '#00F5FF',
  '#8ab4ff',
  '#BF5AF2',
  '#FFD700',
  '#ff9f7f',
]

function randomColor(): string {
  const r = Math.random()
  if (r < 0.38) return STAR_COLORS[0]
  if (r < 0.60) return STAR_COLORS[1]
  if (r < 0.75) return STAR_COLORS[2]
  if (r < 0.84) return STAR_COLORS[3]
  if (r < 0.90) return STAR_COLORS[4]
  if (r < 0.95) return STAR_COLORS[5]
  if (r < 0.98) return STAR_COLORS[6]
  return STAR_COLORS[7]
}

interface Star {
  x: number; y: number
  vx: number; vy: number
  radius: number; opacity: number
  color: string
  twinkleSpeed: number; twinkleOffset: number
}

function drawNebula(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bands = [
    { x: w * 0.5,  y: h * 0.45, rx: w * 0.55, ry: h * 0.18, color: 'rgba(20,28,80,0.18)' },
    { x: w * 0.45, y: h * 0.5,  rx: w * 0.40, ry: h * 0.12, color: 'rgba(40,10,70,0.13)' },
    { x: w * 0.55, y: h * 0.42, rx: w * 0.30, ry: h * 0.08, color: 'rgba(10,40,90,0.10)' },
  ]
  bands.forEach(({ x, y, rx, ry, color }) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry))
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'transparent')
    ctx.save()
    ctx.scale(1, ry / rx)
    ctx.beginPath()
    ctx.arc(x, y * (rx / ry), rx, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.restore()
  })
}

function useGalaxyCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  textareaRef: React.RefObject<HTMLTextAreaElement>
) {
  const starsRef  = useRef<Star[]>([])
  const frameRef  = useRef<number>(0)
  const surgeRef  = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    const STAR_COUNT = window.innerWidth < 600 ? 280 : 500

    function createStar(w: number, h: number): Star {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        radius: Math.random() < 0.85 ? Math.random() * 0.9 + 0.2 : Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.6 + 0.2,
        color: randomColor(),
        twinkleSpeed: Math.random() * 0.012 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
      }
    }

    function resize() {
      w = canvas!.width  = window.innerWidth
      h = canvas!.height = window.innerHeight
      starsRef.current = Array.from({ length: STAR_COUNT }, () => createStar(w, h))
    }

    resize()
    window.addEventListener('resize', resize)

    const offscreen = document.createElement('canvas')
    offscreen.width  = window.innerWidth
    offscreen.height = window.innerHeight
    const offCtx = offscreen.getContext('2d')!
    drawNebula(offCtx, offscreen.width, offscreen.height)

    let t = 0

    function draw() {
      frameRef.current = requestAnimationFrame(draw)
      t += 1
      ctx!.clearRect(0, 0, w, h)

      ctx!.globalAlpha = 0.7
      ctx!.drawImage(offscreen, 0, 0)
      ctx!.globalAlpha = 1

      const surge = surgeRef.current
      surgeRef.current = Math.max(0, surgeRef.current - 0.018)

      const el = textareaRef.current
      const rect = el ? el.getBoundingClientRect() : null

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.3
        const alpha = Math.max(0.05, Math.min(1, star.opacity + twinkle))

        if (surge > 0 && rect) {
          const cx = rect.left + rect.width  / 2
          const cy = rect.top  + rect.height / 2
          const dx = cx - star.x
          const dy = cy - star.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 260 && dist > 0) {
            const force = (surge * 0.4) / (dist * 0.04 + 1)
            star.vx += (dx / dist) * force
            star.vy += (dy / dist) * force
          }
        }

        star.x += star.vx
        star.y += star.vy
        star.vx *= 0.97
        star.vy *= 0.97

        if (star.x < -2) star.x = w + 2
        if (star.x > w + 2) star.x = -2
        if (star.y < -2) star.y = h + 2
        if (star.y > h + 2) star.y = -2

        if (star.radius > 1.2) {
          const glow = ctx!.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4)
          glow.addColorStop(0, star.color)
          glow.addColorStop(1, 'transparent')
          ctx!.globalAlpha = alpha * 0.3
          ctx!.beginPath()
          ctx!.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2)
          ctx!.fillStyle = glow
          ctx!.fill()
        }

        ctx!.globalAlpha = alpha
        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx!.fillStyle = star.color
        ctx!.fill()
        ctx!.globalAlpha = 1
      })
    }

    draw()
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, textareaRef])

  const triggerSurge = useCallback(() => {
    surgeRef.current = Math.min(1, surgeRef.current + 0.4)
  }, [])

  return { triggerSurge }
}

function triggerPortalExplosion(buttonEl: HTMLElement) {
  const rect = buttonEl.getBoundingClientRect()
  const cx = rect.left + rect.width  / 2
  const cy = rect.top  + rect.height / 2
  const size = 60

  const burst = document.createElement('div')
  burst.className = 'portal-burst'
  burst.style.cssText = `left:${cx - size/2}px;top:${cy - size/2}px;width:${size}px;height:${size}px;background:radial-gradient(circle,#00F5FF 0%,rgba(191,90,242,0.6) 40%,transparent 70%);`
  document.body.appendChild(burst)

  const wave = document.createElement('div')
  wave.className = 'portal-shockwave'
  wave.style.cssText = `left:${cx - size/2}px;top:${cy - size/2}px;width:${size}px;height:${size}px;`
  document.body.appendChild(wave)

  setTimeout(() => {
    const wave2 = document.createElement('div')
    wave2.className = 'portal-shockwave'
    wave2.style.cssText = `left:${cx - size/2}px;top:${cy - size/2}px;width:${size}px;height:${size}px;border-color:rgba(191,90,242,0.5);`
    document.body.appendChild(wave2)
    setTimeout(() => wave2.remove(), 1200)
  }, 120)

  setTimeout(() => burst.remove(), 800)
  setTimeout(() => wave.remove(),  1000)
}

export default function HomePage() {
  const [phase, setPhase]           = useState<AppPhase>('input')
  const [situation, setSituation]   = useState('')
  const [tried, setTried]           = useState('')
  const [error, setError]           = useState('')
  const [roast, setRoast]           = useState('')
  const [doors, setDoors]           = useState<DoorType[]>([])
  const [situationId, setSituationId] = useState<number | null>(null)
  const [chosenDoor, setChosenDoor] = useState<DoorType | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)

  const sessionIdRef    = useRef<string>(generateSessionId())
  const textareaRef     = useRef<HTMLTextAreaElement>(null)
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const submitBtnRef    = useRef<HTMLButtonElement>(null)
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const { triggerSurge } = useGalaxyCanvas(canvasRef, textareaRef)

  useEffect(() => {
    if (phase === 'doors' && doors.length > 0) {
      setRevealedCount(0)
      revealTimersRef.current.forEach(clearTimeout)
      revealTimersRef.current = []
      doors.forEach((_, i) => {
        const t = setTimeout(
          () => setRevealedCount((prev) => Math.max(prev, i + 1)),
          i * DOOR_REVEAL_DELAY
        )
        revealTimersRef.current.push(t)
      })
    }
    return () => revealTimersRef.current.forEach(clearTimeout)
  }, [phase, doors])

  const handleSubmit = useCallback(async () => {
    const trimmed = situation.trim()
    if (!trimmed || trimmed.length < 10) {
      setError('Tell us a bit more — a few more words.')
      return
    }
    if (submitBtnRef.current) triggerPortalExplosion(submitBtnRef.current)
    setError('')
    await new Promise((r) => setTimeout(r, 220))
    setPhase('loading')

    try {
      const fullSituation = tried ? `${trimmed}\n\nWhat I've already tried: ${tried}` : trimmed
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: fullSituation, session_id: sessionIdRef.current }),
      })
      const data: GenerateResponse & { error?: string } = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed.')
      setRoast(data.roast)
      setDoors(data.doors)
      setSituationId(data.situation_id)
      setPhase('roast')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setPhase('input')
    }
  }, [situation, tried])

  const handleDoorChosen = useCallback(async (door: DoorType) => {
    setChosenDoor(door)
    setPhase('chosen')
    if (situationId && door.id) {
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ situation_id: situationId, door_id: door.id }),
        })
      } catch { /* silent */ }
    }
    setTimeout(() => setPhase('share'), 800)
  }, [situationId])

  const handleReset = useCallback(() => {
    setSituation(''); setTried(''); setRoast(''); setDoors([])
    setSituationId(null); setChosenDoor(null); setError(''); setRevealedCount(0)
    revealTimersRef.current.forEach(clearTimeout)
    setPhase('input')
    sessionIdRef.current = generateSessionId()
    setTimeout(() => textareaRef.current?.focus(), 300)
  }, [])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > MAX_CHARS) return
    setSituation(val)
    if (error) setError('')
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [error])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    triggerSurge()
    const el = e.currentTarget
    el.classList.remove('textarea-typing')
    void el.offsetWidth
    el.classList.add('textarea-typing')
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }, [triggerSurge, handleSubmit])

  const charsLeft   = MAX_CHARS - situation.length
  const isNearLimit = situation.length >= WARN_CHARS
  const canSubmit   = situation.trim().length >= 10

  return (
    <>
      <canvas ref={canvasRef} id="galaxy-canvas" aria-hidden="true" />

      <main
        className="min-h-dvh min-h-screen flex flex-col items-center px-5 py-12"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      >
        <div className="w-full max-w-[420px] flex flex-col">

          <AnimatePresence mode="wait">
            {(phase === 'input' || phase === 'loading') && (
              <motion.header
                key="header"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-10"
              >
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="font-mono font-bold tracking-[-0.03em] text-white mb-2"
                  style={{ fontSize: 'clamp(52px, 18vw, 92px)', lineHeight: 0.9 }}
                >
                  ZYVV
                </motion.div>
                <motion.p
                  variants={fadeUp}
                  custom={0.08}
                  className="font-mono text-[11px] tracking-[0.16em] uppercase"
                  style={{ color: '#00F5FF' }}
                >
                  THREE DOORS CHATGPT WON'T OPEN.
                </motion.p>
              </motion.header>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase !== 'input' && phase !== 'loading' && (
              <motion.div
                key="logo-small"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <button
                  onClick={handleReset}
                  className="font-mono font-bold tracking-[-0.03em] text-white"
                  style={{ fontSize: 28, lineHeight: 1 }}
                  aria-label="Return to start"
                >
                  ZYVV
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {phase === 'input' && (
              <motion.section
                key="input-phase"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  variants={fadeUp}
                  custom={0.12}
                  className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
                  style={{ color: '#555' }}
                >
                  BE HONEST.
                </motion.div>

                <motion.div variants={fadeUp} custom={0.18} className="relative">
                  <textarea
                    ref={textareaRef}
                    value={situation}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="I know what I need to do. I've known for months. I still haven't done it."
                    rows={4}
                    className="w-full font-mono text-[14px] leading-[1.65] px-4 py-4 rounded-sm"
                    style={{
                      background: 'rgba(8,8,8,0.85)',
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${error ? '#FF2D55' : '#1e1e1e'}`,
                      color: '#fff',
                      outline: 'none',
                      resize: 'none',
                      minHeight: 120,
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = '#00F5FF' }}
                    onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = '#1e1e1e' }}
                    autoFocus
                    spellCheck
                    aria-label="BE HONEST."
                  />
                  {isNearLimit && (
                    <div
                      className="absolute bottom-3 right-3 font-mono text-[10px]"
                      style={{ color: situation.length >= MAX_CHARS - 50 ? '#FF2D55' : '#444' }}
                    >
                      {charsLeft}
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeUp} custom={0.21} className="mt-2">
                  <input
                    type="text"
                    value={tried}
                    onChange={(e) => setTried(e.target.value)}
                    placeholder="What have you already tried? (optional)"
                    className="w-full font-mono text-[13px] px-4 py-3 rounded-sm"
                    style={{
                      background: 'rgba(8,8,8,0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #1e1e1e',
                      color: '#fff',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00F5FF')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-[10px] mt-2 tracking-[0.06em]"
                      style={{ color: '#FF2D55' }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.div variants={fadeUp} custom={0.24} className="mt-4">
                  <button
                    ref={submitBtnRef}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full font-mono text-[11px] font-bold tracking-[0.18em] uppercase py-4 rounded-sm transition-all duration-300"
                    style={{
                      background: canSubmit ? '#00F5FF' : '#111',
                      color:      canSubmit ? '#000'    : '#333',
                      border: 'none',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={(e) => {
                      if (canSubmit) e.currentTarget.style.boxShadow = '0 0 40px rgba(0,245,255,0.35),0 0 80px rgba(191,90,242,0.15)'
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                    aria-label="Open the portal"
                  >
                    OPEN THE PORTAL
                  </button>
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  custom={0.3}
                  className="font-mono text-[10px] text-center mt-3 tracking-[0.06em]"
                  style={{ color: '#333' }}
                >
                  ⌘↵ to submit · No account required
                </motion.p>

                <motion.div variants={fadeUp} custom={0.36} className="mt-10 flex justify-center">
                  <PortalCounter />
                </motion.div>
              </motion.section>
            )}

            {phase === 'loading' && (
              <motion.section
                key="loading-phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-20"
                aria-live="polite"
              >
                <div
                  className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase mb-6"
                  style={{ color: '#00F5FF' }}
                >
                  THE VOID IS THINKING
                </div>
                <div className="flex gap-3">
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                </div>
                <p
                  className="font-mono text-[11px] text-center mt-8 leading-[1.6] px-4"
                  style={{ color: '#2a2a2a', maxWidth: 300 }}
                >
                  {situation.trim().slice(0, 120)}
                  {situation.trim().length > 120 ? '…' : ''}
                </p>
              </motion.section>
            )}

            {phase === 'roast' && (
              <motion.section
                key="roast-phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-2"
                  style={{ color: '#333' }}
                >
                  BE HONEST.
                </div>
                <p className="font-mono text-[12px] leading-[1.6] mb-8" style={{ color: '#444' }}>
                  {situation.trim()}
                </p>
                <RoastReveal roast={roast} onComplete={() => setPhase('doors')} />
              </motion.section>
            )}

            {(phase === 'doors' || phase === 'chosen' || phase === 'share') && (
              <motion.section
                key="doors-phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6">
                  <div
                    className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-1"
                    style={{ color: '#333' }}
                  >
                    BE HONEST.
                  </div>
                  <p className="font-mono text-[11px] leading-[1.6]" style={{ color: '#3a3a3a' }}>
                    {situation.trim().slice(0, 100)}
                    {situation.trim().length > 100 ? '…' : ''}
                  </p>
                </div>

                <div className="border-l-2 pl-4 mb-8" style={{ borderColor: '#00F5FF' }}>
                  <p
                    className="font-mono text-[11px] leading-[1.65]"
                    style={{ color: '#555', fontFamily: 'Georgia, serif' }}
                  >
                    {roast}
                  </p>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  {doors.map((door, i) => (
                    <Door
                      key={door.id ?? i}
                      door={door}
                      index={i}
                      isRevealed={i < revealedCount}
                      isChosen={chosenDoor?.id === door.id}
                      isAnyChosen={chosenDoor !== null}
                      onChoose={handleDoorChosen}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {revealedCount >= doors.length && doors.length > 0 && !chosenDoor && (
                    <motion.div
                      key="choose-prompt"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="font-mono text-[10px] tracking-[0.14em] uppercase text-center mb-8"
                      style={{ color: '#333' }}
                    >
                      YOUR DOOR
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {phase === 'share' && chosenDoor && (
                    <motion.div
                      key="share-card"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="h-px mb-8" style={{ background: '#1a1a1a' }} />
                      <ShareCard
                        situation={situation.trim()}
                        roast={roast}
                        doors={doors}
                        chosenDoor={chosenDoor}
                        onDone={handleReset}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}

          </AnimatePresence>

          <footer className="mt-16 flex justify-center" aria-label="ZYVV footer">
            <span
              className="font-mono text-[10px] tracking-[0.10em] uppercase"
              style={{ color: '#222' }}
            >
              ZYVV · Not advice. A way out.
            </span>
          </footer>
        </div>
      </main>
    </>
  )
}
