// ============================================================
// ZYVV — Main Page (WARP ENGINE · TALMUDIC PROTOCOL)
// File: app/page.tsx
//
// PHASES:
//   input        → user types situation
//   loading      → MODE A Groq generating
//   roast        → mirror truth typewriter reveal
//   doors        → three doors shown, staggered reveal
//   chosen       → brief transition after pick
//   interrogation → user raises a doubt
//   refining     → MODE B Groq generating
//   refined      → critique + refined path + next vector
//   share        → share card
// ============================================================

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Door from '@/app/components/Door'
import PortalCounter from '@/app/components/PortalCounter'
import ShareCard from '@/app/components/ShareCard'
import { DOOR_CONFIGS } from '@/lib/types'
import type {
  AppPhase,
  Door as DoorType,
  GenerateResponse,
  InterrogateResponse,
  RefinementBlock,
} from '@/lib/types'

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Motion variants ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
  }),
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: 'easeIn' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const slamIn = {
  hidden: { opacity: 0, scale: 1.12, y: 14, filter: 'blur(6px)' },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
}

const MAX_CHARS = 2000
const WARN_CHARS = 1800
const DOOR_REVEAL_DELAY = 800

// ── Canvas warp engine ───────────────────────────────────────

type WarpPhase = 'bigbang' | 'idle' | 'typing' | 'launch' | 'arrived'

interface WarpStar {
  angle: number
  dist: number
  speed: number
  color: string
  bright: number
  thick: number
}

const WARP_COLORS = [
  '#ffffff', '#c8d8ff', '#a8c0ff', '#00F5FF',
  '#80d4ff', '#BF5AF2', '#ffd080', '#ff9f7f',
]

function warpColor(): string {
  const r = Math.random()
  if (r < 0.35) return WARP_COLORS[0]
  if (r < 0.55) return WARP_COLORS[1]
  if (r < 0.70) return WARP_COLORS[2]
  if (r < 0.82) return WARP_COLORS[3]
  if (r < 0.89) return WARP_COLORS[4]
  if (r < 0.94) return WARP_COLORS[5]
  if (r < 0.97) return WARP_COLORS[6]
  return WARP_COLORS[7]
}

function makeWarpStar(): WarpStar {
  return {
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 0.05,
    speed: 0.004 + Math.random() * 0.006,
    color: warpColor(),
    bright: 0.4 + Math.random() * 0.6,
    thick: 0.5 + Math.random() * 1.2,
  }
}

function useWarpCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  warpPhaseRef: React.RefObject<WarpPhase>,
  speedRef: React.RefObject<number>,
  arrivalColorRef: React.RefObject<string>
) {
  const starsRef = useRef<WarpStar[]>([])
  const frameRef = useRef<number>(0)
  const bigBangRef = useRef<number>(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    const STAR_COUNT = window.innerWidth < 600 ? 320 : 580

    function resize() {
      w = canvas!.width = window.innerWidth
      h = canvas!.height = window.innerHeight
      starsRef.current = Array.from({ length: STAR_COUNT }, makeWarpStar)
    }

    resize()
    window.addEventListener('resize', resize)

    starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
      ...makeWarpStar(),
      dist: 0.005 + Math.random() * 0.02,
      speed: 0.022 + Math.random() * 0.028,
    }))

    let t = 0
    let launchFlash = 0

    function draw() {
      frameRef.current = requestAnimationFrame(draw)
      t += 1

      const phase = warpPhaseRef.current ?? 'idle'
      const userSpeed = speedRef.current ?? 0
      const arrivalColor = arrivalColorRef.current ?? 'rgba(0,0,0,0)'

      let speedMult: number
      let trailMult: number
      let flashAlpha = 0

      if (phase === 'bigbang') {
        speedMult = Math.max(0.8, bigBangRef.current * 7)
        trailMult = speedMult * 1.4
        bigBangRef.current = Math.max(0, bigBangRef.current - 0.007)
      } else if (phase === 'idle') {
        speedMult = 0.55 + Math.sin(t * 0.003) * 0.12
        trailMult = 1.0
      } else if (phase === 'typing') {
        speedMult = 1.0 + userSpeed * 5.5
        trailMult = 1.2 + userSpeed * 3.5
      } else if (phase === 'launch') {
        launchFlash = Math.min(launchFlash + 0.055, 1)
        speedMult = 9 + launchFlash * 22
        trailMult = 12 + launchFlash * 35
        flashAlpha = launchFlash
      } else {
        speedMult = 0.35
        trailMult = 0.65
      }

      ctx.globalAlpha = 1
      if (phase === 'launch' && flashAlpha > 0.45) {
        ctx.fillStyle = `rgba(255,255,255,${(flashAlpha - 0.45) * 0.9})`
        ctx.fillRect(0, 0, w, h)
      }
      const trailFade = phase === 'launch' ? 0.05 : phase === 'bigbang' ? 0.10 : 0.17
      ctx.fillStyle = `rgba(0,0,5,${trailFade})`
      ctx.fillRect(0, 0, w, h)

      if (phase === 'arrived') {
        ctx.fillStyle = arrivalColor
        ctx.globalAlpha = 0.045
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1
      }

      const cx = w / 2
      const cy = h / 2
      const maxR = Math.sqrt(cx * cx + cy * cy)

      starsRef.current.forEach((star) => {
        const prevDist = star.dist
        star.dist += star.speed * speedMult

        const prevX = cx + Math.cos(star.angle) * prevDist * maxR
        const prevY = cy + Math.sin(star.angle) * prevDist * maxR
        const nextX = cx + Math.cos(star.angle) * star.dist * maxR
        const nextY = cy + Math.sin(star.angle) * star.dist * maxR

        void prevX; void prevY

        const streakLen = Math.max(
          0.5,
          (star.dist - prevDist) * maxR * trailMult * (0.5 + star.dist)
        )

        const brightness = Math.min(1, star.bright * (0.3 + star.dist * 1.5))

        ctx.globalAlpha = brightness
        ctx.strokeStyle = star.color
        ctx.lineWidth = star.thick * (0.5 + star.dist)

        ctx.beginPath()
        const sx =
          cx +
          Math.cos(star.angle) *
            Math.max(0, star.dist - streakLen / maxR) *
            maxR
        const sy =
          cy +
          Math.sin(star.angle) *
            Math.max(0, star.dist - streakLen / maxR) *
            maxR
        ctx.moveTo(sx, sy)
        ctx.lineTo(nextX, nextY)
        ctx.stroke()

        if (star.dist > 1.08) Object.assign(star, makeWarpStar())
      })

      ctx.globalAlpha = 1

      if (phase !== 'arrived') {
        const vSize =
          phase === 'launch'
            ? 140 + launchFlash * 220
            : phase === 'bigbang'
            ? 100
            : 45
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vSize)
        grad.addColorStop(
          0,
          `rgba(0,245,255,${phase === 'launch' ? 0.28 + launchFlash * 0.45 : 0.09})`
        )
        grad.addColorStop(0.4, `rgba(191,90,242,${phase === 'launch' ? 0.18 : 0.04})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, vSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, warpPhaseRef, speedRef, arrivalColorRef])
}

// ── Hyperspace launch ────────────────────────────────────────

function triggerHyperspaceFlash(onDone: () => void) {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const ring = document.createElement('div')
      ring.style.cssText = `
        position:fixed;left:50%;top:50%;
        transform:translate(-50%,-50%) scale(0.1);
        width:140px;height:140px;border-radius:50%;
        border:2px solid rgba(0,245,255,${0.95 - i * 0.16});
        pointer-events:none;z-index:9999;
        animation:hyperRing 0.85s cubic-bezier(0.16,1,0.3,1) forwards;
      `
      document.body.appendChild(ring)
      setTimeout(() => ring.remove(), 950)
    }, i * 75)
  }

  setTimeout(() => {
    const flash = document.createElement('div')
    flash.style.cssText = `
      position:fixed;inset:0;background:white;
      pointer-events:none;z-index:9998;
      animation:hyperFlash 0.65s ease-out forwards;
    `
    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 750)
    setTimeout(onDone, 320)
  }, 260)
}

// ── Mirror typewriter ────────────────────────────────────────

function MirrorReveal({
  text,
  onComplete,
}: {
  text: string
  onComplete: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    setDisplayed('')
    setDone(false)

    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
          setTimeout(onComplete, 1600)
        }
      }, 20)
      return () => clearInterval(interval)
    }, 700)

    return () => clearTimeout(startDelay)
  }, [text, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: 'clamp(15px, 4vw, 20px)',
        lineHeight: 1.6,
        color: '#ffffff',
        letterSpacing: '0.01em',
        textShadow:
          '0 0 30px rgba(0,245,255,0.25), 0 0 70px rgba(191,90,242,0.12)',
      }}
    >
      {displayed}
      {!done && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '1.1em',
            background: '#00F5FF',
            marginLeft: 3,
            verticalAlign: 'middle',
            animation: 'cursorBlink 0.7s step-end infinite',
          }}
        />
      )}
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [situation, setSituation] = useState('')
  const [tried, setTried] = useState('')
  const [error, setError] = useState('')
  const [mirror, setMirror] = useState('')
  const [doors, setDoors] = useState<DoorType[]>([])
  const [situationId, setSituationId] = useState<number | null>(null)
  const [chosenDoor, setChosenDoor] = useState<DoorType | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [objection, setObjection] = useState('')
  const [refinement, setRefinement] = useState<RefinementBlock | null>(null)

  const sessionIdRef = useRef<string>(generateSessionId())
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const warpPhaseRef = useRef<WarpPhase>('bigbang')
  const speedRef = useRef<number>(0)
  const arrivalColorRef = useRef<string>('rgba(0,0,0,0)')

  useWarpCanvas(canvasRef, warpPhaseRef, speedRef, arrivalColorRef)

  // Big bang → idle
  useEffect(() => {
    const t = setTimeout(() => { warpPhaseRef.current = 'idle' }, 2200)
    return () => clearTimeout(t)
  }, [])

  // Speed decay
  useEffect(() => {
    const decay = setInterval(() => {
      speedRef.current = Math.max(0, speedRef.current - 0.04)
      if (speedRef.current === 0 && warpPhaseRef.current === 'typing') {
        warpPhaseRef.current = 'idle'
      }
    }, 80)
    return () => clearInterval(decay)
  }, [])

  // Door reveal stagger
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

  // World color shift on arrival
  useEffect(() => {
    if (phase === 'roast' || phase === 'doors' || phase === 'interrogation' || phase === 'refined') {
      arrivalColorRef.current = 'rgba(60,0,90,0.07)'
      warpPhaseRef.current = 'arrived'
    }
  }, [phase])

  // ── MODE A: submit ───────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const trimmed = situation.trim()
    if (!trimmed || trimmed.length < 10) {
      setError('Tell us more — a few more words.')
      return
    }
    setError('')

    warpPhaseRef.current = 'launch'
    triggerHyperspaceFlash(async () => {
      setPhase('loading')
      warpPhaseRef.current = 'idle'
      speedRef.current = 0

      try {
        const fullSituation = tried
          ? `${trimmed}\n\nWhat I've already tried: ${tried}`
          : trimmed

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            situation: fullSituation,
            session_id: sessionIdRef.current,
          }),
        })

        const data: GenerateResponse & { error?: string } = await res.json()
        if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed.')

        setMirror(data.roast)
        setDoors(data.doors)
        setSituationId(data.situation_id)
        setPhase('roast')
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong. Try again.'
        )
        setPhase('input')
        warpPhaseRef.current = 'idle'
      }
    })
  }, [situation, tried])

  // ── Door chosen → interrogation ──────────────────────────────

  const handleDoorChosen = useCallback(
    async (door: DoorType) => {
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
      setTimeout(() => setPhase('interrogation'), 900)
    },
    [situationId]
  )

  // ── MODE B: interrogate ──────────────────────────────────────

  const handleInterrogate = useCallback(async () => {
    if (!objection.trim() || !chosenDoor) return
    setPhase('refining')

    try {
      const fullSituation = tried
        ? `${situation.trim()}\n\nWhat I've already tried: ${tried}`
        : situation.trim()

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'INTERROGATION',
          previous_situation: fullSituation,
          selected_door: chosenDoor.door_type,
          user_objection: objection.trim(),
          session_id: sessionIdRef.current,
        }),
      })

      const data: InterrogateResponse & { error?: string } = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Interrogation failed.')

      setRefinement(data.refinement_block)
      setPhase('refined')
    } catch {
      setPhase('interrogation')
    }
  }, [objection, chosenDoor, situation, tried])

  // ── Reset ────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSituation('')
    setTried('')
    setMirror('')
    setDoors([])
    setSituationId(null)
    setChoiceId(null)
    setChosenDoor(null)
    setError('')
    setRevealedCount(0)
    setObjection('')
    setRefinement(null)
    revealTimersRef.current.forEach(clearTimeout)
    setPhase('input')
    sessionIdRef.current = generateSessionId()
    warpPhaseRef.current = 'bigbang'
    speedRef.current = 0
    arrivalColorRef.current = 'rgba(0,0,0,0)'
    setTimeout(() => textareaRef.current?.focus(), 300)
  }, [])

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      if (val.length > MAX_CHARS) return
      setSituation(val)
      if (error) setError('')
      const el = e.target
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    },
    [error]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      speedRef.current = Math.min(1, speedRef.current + 0.12)
      warpPhaseRef.current = 'typing'
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const charsLeft = MAX_CHARS - situation.length
  const isNearLimit = situation.length >= WARN_CHARS
  const canSubmit = situation.trim().length >= 10

  return (
    <>
      <canvas ref={canvasRef} id="galaxy-canvas" aria-hidden="true" />

      <main
        className="min-h-dvh min-h-screen flex flex-col items-center px-5 py-12"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      >
        <div className="w-full max-w-[420px] flex flex-col">

          {/* ── HEADER ── */}
          <AnimatePresence mode="wait">
            {(phase === 'input' || phase === 'loading') && (
              <motion.header
                key="header"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="mb-10"
              >
                <motion.div
                  variants={slamIn}
                  custom={0}
                  className="font-mono font-black tracking-[-0.04em] text-white mb-3"
                  style={{
                    fontSize: 'clamp(64px, 20vw, 108px)',
                    lineHeight: 0.88,
                    textShadow:
                      '0 0 80px rgba(0,245,255,0.18), 0 0 160px rgba(191,90,242,0.08)',
                  }}
                >
                  ZYVV
                </motion.div>
                <motion.p
                  variants={fadeUp}
                  custom={0.1}
                  className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
                  style={{
                    color: '#00F5FF',
                    textShadow: '0 0 20px rgba(0,245,255,0.4)',
                  }}
                >
                  THREE DOORS CHATGPT WON&apos;T OPEN.
                </motion.p>
              </motion.header>
            )}
          </AnimatePresence>

          {/* ── SMALL LOGO (post-input) ── */}
          <AnimatePresence>
            {phase !== 'input' && phase !== 'loading' && (
              <motion.div
                key="logo-small"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <button
                  onClick={handleReset}
                  className="font-mono font-black tracking-[-0.04em] text-white"
                  style={{ fontSize: 28, lineHeight: 1 }}
                  aria-label="Return to start"
                >
                  ZYVV
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PHASE CONTENT ── */}
          <AnimatePresence mode="wait">

            {/* INPUT */}
            {phase === 'input' && (
              <motion.section
                key="input-phase"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
              >
                <motion.div
                  variants={fadeUp}
                  custom={0.12}
                  className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase mb-3"
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
                      background: 'rgba(6,6,8,0.88)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${error ? '#FF2D55' : '#1e1e1e'}`,
                      color: '#fff',
                      outline: 'none',
                      resize: 'none',
                      minHeight: 120,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      if (!error) e.currentTarget.style.borderColor = '#00F5FF'
                      e.currentTarget.style.boxShadow =
                        '0 0 22px rgba(0,245,255,0.13)'
                    }}
                    onBlur={(e) => {
                      if (!error) e.currentTarget.style.borderColor = '#1e1e1e'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    autoFocus
                    spellCheck
                    aria-label="BE HONEST."
                  />
                  {isNearLimit && (
                    <div
                      className="absolute bottom-3 right-3 font-mono text-[10px]"
                      style={{
                        color:
                          situation.length >= MAX_CHARS - 50 ? '#FF2D55' : '#444',
                      }}
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
                      background: 'rgba(6,6,8,0.88)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #1e1e1e',
                      color: '#fff',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#00F5FF')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#1e1e1e')
                    }
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

                <motion.div variants={fadeUp} custom={0.26} className="mt-5">
                  <button
                    ref={submitBtnRef}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full font-mono text-[11px] font-black tracking-[0.22em] uppercase py-4 rounded-sm"
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #00F5FF 0%, #0088aa 100%)'
                        : '#0a0a0a',
                      color: canSubmit ? '#000' : '#2a2a2a',
                      border: canSubmit ? 'none' : '1px solid #1a1a1a',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      transition: 'all 0.25s',
                      boxShadow: canSubmit
                        ? '0 0 30px rgba(0,245,255,0.2)'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (canSubmit) {
                        e.currentTarget.style.boxShadow =
                          '0 0 60px rgba(0,245,255,0.45), 0 0 120px rgba(191,90,242,0.2)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = canSubmit
                        ? '0 0 30px rgba(0,245,255,0.2)'
                        : 'none'
                      e.currentTarget.style.transform = 'none'
                    }}
                    aria-label="Open the portal"
                  >
                    OPEN THE PORTAL
                  </button>
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  custom={0.32}
                  className="font-mono text-[10px] text-center mt-3 tracking-[0.06em]"
                  style={{ color: '#2a2a2a' }}
                >
                  ⌘↵ to submit · No account required
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  custom={0.38}
                  className="mt-10 flex justify-center"
                >
                  <PortalCounter />
                </motion.div>
              </motion.section>
            )}

            {/* LOADING */}
            {phase === 'loading' && (
              <motion.section
                key="loading-phase"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center py-24"
                aria-live="polite"
              >
                <div
                  className="font-mono text-[10px] font-black tracking-[0.22em] uppercase mb-8"
                  style={{
                    color: '#00F5FF',
                    textShadow: '0 0 30px rgba(0,245,255,0.5)',
                    animation: 'loadingPulse 2s ease-in-out infinite',
                  }}
                >
                  THE VOID IS THINKING
                </div>
                <div className="flex gap-3">
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                </div>
              </motion.section>
            )}

            {/* MIRROR */}
            {phase === 'roast' && (
              <motion.section
                key="mirror-phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="font-mono text-[9px] font-black tracking-[0.22em] uppercase mb-6"
                  style={{
                    color: '#BF5AF2',
                    textShadow: '0 0 20px rgba(191,90,242,0.4)',
                  }}
                >
                  THE MIRROR
                </motion.div>

                <MirrorReveal
                  text={mirror}
                  onComplete={() => setPhase('doors')}
                />
              </motion.section>
            )}

            {/* DOORS + CHOSEN */}
            {(phase === 'doors' || phase === 'chosen') && (
              <motion.section
                key="doors-phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-5">
                  <div
                    className="font-mono text-[9px] font-black tracking-[0.18em] uppercase mb-1"
                    style={{ color: '#2a2a2a' }}
                  >
                    BE HONEST.
                  </div>
                  <p
                    className="font-mono text-[11px] leading-[1.6]"
                    style={{ color: '#333' }}
                  >
                    {situation.trim().slice(0, 100)}
                    {situation.trim().length > 100 ? '…' : ''}
                  </p>
                </div>

                <div
                  className="border-l-2 pl-4 mb-8"
                  style={{ borderColor: '#BF5AF2' }}
                >
                  <p
                    className="font-mono text-[11px] leading-[1.7]"
                    style={{ color: '#666' }}
                  >
                    {mirror}
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
                  {revealedCount >= doors.length &&
                    doors.length > 0 &&
                    !chosenDoor && (
                      <motion.div
                        key="choose-prompt"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="font-mono text-[10px] tracking-[0.18em] uppercase text-center mb-8"
                        style={{ color: '#2a2a2a' }}
                      >
                        YOUR DOOR
                      </motion.div>
                    )}
                </AnimatePresence>
              </motion.section>
            )}

            {/* INTERROGATION */}
            {phase === 'interrogation' && chosenDoor && (
              <motion.section
                key="interrogation-phase"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="font-mono text-[9px] font-black tracking-[0.22em] uppercase mb-6"
                  style={{
                    color: DOOR_CONFIGS[chosenDoor.door_type].glowColor,
                    textShadow: `0 0 20px ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}66`,
                  }}
                >
                  INTERROGATION
                </div>

                <p
                  className="font-mono text-[12px] leading-[1.65] mb-6"
                  style={{ color: '#555' }}
                >
                  You chose{' '}
                  <span
                    style={{
                      color: DOOR_CONFIGS[chosenDoor.door_type].glowColor,
                    }}
                  >
                    {chosenDoor.title}
                  </span>
                  . What&apos;s your doubt?
                </p>

                <textarea
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  placeholder="But I don't have enough time for that..."
                  rows={3}
                  className="w-full font-mono text-[14px] leading-[1.65] px-4 py-4 rounded-sm mb-4"
                  style={{
                    background: 'rgba(6,6,8,0.88)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #1e1e1e',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      DOOR_CONFIGS[chosenDoor.door_type].glowColor)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = '#1e1e1e')
                  }
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleInterrogate}
                    disabled={objection.trim().length < 4}
                    className="flex-1 font-mono text-[11px] font-black tracking-[0.22em] uppercase py-4 rounded-sm"
                    style={{
                      background:
                        objection.trim().length >= 4
                          ? DOOR_CONFIGS[chosenDoor.door_type].glowColor
                          : '#0a0a0a',
                      color:
                        objection.trim().length >= 4 ? '#000' : '#2a2a2a',
                      border:
                        objection.trim().length >= 4
                          ? 'none'
                          : '1px solid #1a1a1a',
                      cursor:
                        objection.trim().length >= 4
                          ? 'pointer'
                          : 'not-allowed',
                      transition: 'all 0.25s',
                    }}
                  >
                    INTERROGATE
                  </button>
                  <button
                    onClick={() => setPhase('share')}
                    className="font-mono text-[10px] tracking-[0.14em] uppercase px-5 py-4 rounded-sm"
                    style={{
                      color: '#333',
                      border: '1px solid #1a1a1a',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    SKIP
                  </button>
                </div>
              </motion.section>
            )}

            {/* REFINING */}
            {phase === 'refining' && (
              <motion.section
                key="refining-phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <div
                  className="font-mono text-[10px] font-black tracking-[0.22em] uppercase mb-8"
                  style={{
                    color: '#BF5AF2',
                    textShadow: '0 0 30px rgba(191,90,242,0.5)',
                    animation: 'loadingPulse 2s ease-in-out infinite',
                  }}
                >
                  STRESS-TESTING YOUR DOUBT
                </div>
                <div className="flex gap-3">
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                </div>
              </motion.section>
            )}

            {/* REFINED */}
            {phase === 'refined' && refinement && chosenDoor && (
              <motion.section
                key="refined-phase"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="font-mono text-[9px] font-black tracking-[0.22em] uppercase mb-6"
                  style={{ color: '#BF5AF2' }}
                >
                  REFINED PATH
                </div>

                {/* Diagnosis */}
                <div
                  className="border-l-2 pl-4 mb-6"
                  style={{ borderColor: '#FF2D55' }}
                >
                  <div
                    className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: '#FF2D5566' }}
                  >
                    DIAGNOSIS
                  </div>
                  <p
                    className="font-mono text-[12px] leading-[1.65]"
                    style={{ color: '#888' }}
                  >
                    {refinement.critique}
                  </p>
                </div>

                {/* Refined path */}
                <div
                  className="border-l-2 pl-4 mb-6"
                  style={{
                    borderColor: DOOR_CONFIGS[chosenDoor.door_type].glowColor,
                  }}
                >
                  <div
                    className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2"
                    style={{
                      color: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}88`,
                    }}
                  >
                    REFINED PATH
                  </div>
                  <p
                    className="font-mono text-[12px] leading-[1.65]"
                    style={{ color: '#ccc' }}
                  >
                    {refinement.refined_path}
                  </p>
                </div>

                {/* Next vector */}
                <div
                  className="border-l-2 pl-4 mb-8"
                  style={{ borderColor: '#333' }}
                >
                  <div
                    className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: '#333' }}
                  >
                    NEXT QUESTION
                  </div>
                  <p
                    className="font-mono text-[12px] leading-[1.65]"
                    style={{ color: '#555' }}
                  >
                    {refinement.next_interrogation_vector}
                  </p>
                </div>

                <button
                  onClick={() => setPhase('share')}
                  className="w-full font-mono text-[11px] font-black tracking-[0.22em] uppercase py-4 rounded-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, #BF5AF2 0%, #7a22cc 100%)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(191,90,242,0.25)',
                  }}
                >
                  CONTINUE →
                </button>
              </motion.section>
            )}

            {/* SHARE */}
            {phase === 'share' && chosenDoor && (
              <motion.section
                key="share-phase"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="h-px mb-8" style={{ background: '#141414' }} />
                <ShareCard
                  situation={situation.trim()}
                  roast={mirror}
                  doors={doors}
                  chosenDoor={chosenDoor}
                  choiceId={choiceId}
                  onDone={handleReset}
                />
              </motion.section>
            )}

          </AnimatePresence>

          <footer className="mt-16 flex justify-center" aria-label="ZYVV footer">
            <span
              className="font-mono text-[10px] tracking-[0.10em] uppercase"
              style={{ color: '#1a1a1a' }}
            >
              ZYVV · Not advice. A mirror.
            </span>
          </footer>

        </div>
      </main>
    </>
  )
}
