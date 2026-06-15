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

const doorSlam = {
  hidden: (dir: 'top' | 'left' | 'right') => ({
    opacity: 0,
    scale: 1.15,
    filter: 'blur(8px)',
    y: dir === 'top' ? -60 : 0,
    x: dir === 'left' ? -80 : dir === 'right' ? 80 : 0,
  }),
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

const shockwaveRise = {
  hidden: { opacity: 0, y: 120 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
  },
}

const MAX_CHARS = 2000
const WARN_CHARS = 1800
const MIN_CHARS = 10
const DOOR_REVEAL_DELAY = 1600

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

        const nextX = cx + Math.cos(star.angle) * star.dist * maxR
        const nextY = cy + Math.sin(star.angle) * star.dist * maxR

        const streakLen = Math.max(
          0.5,
          (star.dist - prevDist) * maxR * trailMult * (0.5 + star.dist)
        )

        const brightness = Math.min(1, star.bright * (0.3 + star.dist * 1.5))

        ctx.globalAlpha = brightness
        ctx.strokeStyle = star.color
        ctx.lineWidth = star.thick * (0.5 + star.dist)

        ctx.beginPath()
        const sx = cx + Math.cos(star.angle) * Math.max(0, star.dist - streakLen / maxR) * maxR
        const sy = cy + Math.sin(star.angle) * Math.max(0, star.dist - streakLen / maxR) * maxR
        ctx.moveTo(sx, sy)
        ctx.lineTo(nextX, nextY)
        ctx.stroke()

        if (star.dist > 1.08) Object.assign(star, makeWarpStar())
      })

      ctx.globalAlpha = 1

      if (phase !== 'arrived') {
        const vSize = phase === 'launch' ? 140 + launchFlash * 220 : phase === 'bigbang' ? 100 : 45
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vSize)
        grad.addColorStop(0, `rgba(0,245,255,${phase === 'launch' ? 0.28 + launchFlash * 0.45 : 0.09})`)
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

function MirrorReveal({ text, onComplete }: { text: string; onComplete: () => void }) {
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
          setTimeout(onComplete, 2200)
        }
      }, 18)
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
        textShadow: '0 0 30px rgba(0,245,255,0.25), 0 0 70px rgba(191,90,242,0.12)',
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

// ── Min-length progress bar ──────────────────────────────────

function MinLengthBar({ current, min }: { current: number; min: number }) {
  const pct = Math.min(100, (current / min) * 100)
  const done = current >= min

  if (done) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-3"
    >
      <div
        style={{
          height: 2,
          background: '#111',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct > 60 ? '#00F5FF' : '#333',
            borderRadius: 1,
            transition: 'width 0.15s ease, background 0.3s ease',
          }}
        />
      </div>
      <p
        className="font-mono text-[10px] mt-1 tracking-[0.06em]"
        style={{ color: '#333' }}
      >
        {min - current} more character{min - current !== 1 ? 's' : ''} to unlock
      </p>
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────

const LOADING_LINES = [
  "Your situation is being read, not solved.",
  "Three perspectives that disagree with each other are being built.",
  "The obvious answer is being set aside.",
]

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
  const [isReturning, setIsReturning] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [breach, setBreach] = useState<{ assumption: string; signal: string } | null>(null)
  const [showPostMirror, setShowPostMirror] = useState(false)
  const [version, setVersion] = useState<'mana' | 'yuga'>('mana')
  const [contextSignal, setContextSignal] = useState<{ signal: string; query: string } | null>(null)
  const [choiceId, setChoiceId] = useState<number | null>(null)

  const sessionIdRef = useRef<string>(generateSessionId())
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const warpPhaseRef = useRef<WarpPhase>('bigbang')
  const speedRef = useRef<number>(0)
  const arrivalColorRef = useRef<string>('rgba(0,0,0,0)')

  useWarpCanvas(canvasRef, warpPhaseRef, speedRef, arrivalColorRef)

  // Return visit detection
  useEffect(() => {
    const visited = localStorage.getItem('zyvv_visited') === 'true'
    setIsReturning(visited)
    if (!visited) localStorage.setItem('zyvv_visited', 'true')
  }, [])

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
    if (!trimmed || trimmed.length < MIN_CHARS) {
      setError('Add a bit more context so ZYVV can challenge your decision properly.')
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
            version,
          }),
        })

        const data: GenerateResponse & { error?: string } = await res.json()
        if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed.')

        setMirror(data.roast)
        setDoors(data.doors)
        setSituationId(data.situation_id)
        setBreach(data.breach ?? null)
        setContextSignal(data.contextSignal ?? null)
        setShowPostMirror(false)
        setPhase('roast')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
        setPhase('input')
        warpPhaseRef.current = 'idle'
      }
    })
  }, [situation, tried, version])

  // ── Door chosen → interrogation ──────────────────────────────

  const handleDoorChosen = useCallback(async (door: DoorType) => {
    setChosenDoor(door)
    setPhase('chosen')
    if (situationId && door.id) {
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ situation_id: situationId, door_id: door.id }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.choice_id) {
          setChoiceId(data.choice_id)
        }
      } catch { /* silent */ }
    }
    setTimeout(() => setPhase('interrogation'), 900)
  }, [situationId])

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
    setChosenDoor(null)
    setError('')
    setRevealedCount(0)
    setObjection('')
    setRefinement(null)
    setBreach(null)
    setShowPostMirror(false)
    setContextSignal(null)
    setChoiceId(null)
    revealTimersRef.current.forEach(clearTimeout)
    setPhase('input')
    sessionIdRef.current = generateSessionId()
    warpPhaseRef.current = 'bigbang'
    speedRef.current = 0
    arrivalColorRef.current = 'rgba(0,0,0,0)'
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
    speedRef.current = Math.min(1, speedRef.current + 0.12)
    warpPhaseRef.current = 'typing'
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const charsLeft = MAX_CHARS - situation.length
  const isNearLimit = situation.length >= WARN_CHARS
  const canSubmit = situation.trim().length >= MIN_CHARS

  return (
    <>
      <style>{`
        @keyframes doorHeartbeat0 {
          0%,100% { box-shadow:0 0 8px rgba(0,245,255,0.15); border-color:rgba(0,245,255,0.3); }
          50%      { box-shadow:0 0 28px rgba(0,245,255,0.5); border-color:rgba(0,245,255,0.8); }
        }
        @keyframes doorHeartbeat1 {
          0%,100% { box-shadow:0 0 8px rgba(255,184,48,0.15); border-color:rgba(255,184,48,0.3); }
          50%      { box-shadow:0 0 28px rgba(255,184,48,0.5); border-color:rgba(255,184,48,0.8); }
        }
        @keyframes doorHeartbeat2 {
          0%,100% { box-shadow:0 0 8px rgba(191,90,242,0.15); border-color:rgba(191,90,242,0.3); }
          50%      { box-shadow:0 0 28px rgba(191,90,242,0.5); border-color:rgba(191,90,242,0.8); }
        }
      `}</style>
      <canvas ref={canvasRef} id="galaxy-canvas" aria-hidden="true" />
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />

      <main
        className="min-h-dvh min-h-screen flex flex-col items-center px-5 py-12"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      >
        <div className="w-full max-w-[420px] flex flex-col">

          {/* ── SMALL LOGO (post-input phases) ── */}
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
    initial="hidden"
    animate="visible"
    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
  >
    {/* ── TOP SYS-BAR — MGS PTT style ── */}
    <motion.div
      animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: 'hidden', marginBottom: 16 }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        background: 'var(--color-panel-raised)',
        border: '1px solid var(--color-border-dim)',
        borderRadius: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="readout-blink" style={{ fontSize: 7, fontFamily: 'var(--font-hud)', letterSpacing: '0.2em' }}>●</span>
          <span className="hud-label">PTT · DECISION PROTOCOL ONLINE</span>
        </div>
        <span className="hud-label" style={{ color: 'var(--color-text-dim)' }}>SYS v2.0.1</span>
      </div>
    </motion.div>

    {/* ── THREE LOCKED DOORS — codec panel style ── */}
    <motion.div
      animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden', marginBottom: 14 }}
    >
      {([
        { label: 'DOOR 01', sublabel: 'CONVENTIONAL', color: '#00F5FF', delay: 0 },
        { label: 'DOOR 02', sublabel: 'CONTRARIAN',   color: '#FFB830', delay: 0.1 },
        { label: 'DOOR 03', sublabel: 'ALIEN',        color: '#BF5AF2', delay: 0.2 },
      ] as const).map((d) => (
        <motion.div
          key={d.label}
          initial={isReturning ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d.delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            marginBottom: 4,
            background: 'var(--color-panel)',
            border: `1px solid ${d.color}1a`,
            borderLeft: `2px solid ${d.color}55`,
            borderRadius: 2,
          }}
        >
          {/* Corner brackets */}
          <span className="hud-corner hud-corner--tl" style={{ borderColor: `${d.color}33` }} />
          <span className="hud-corner hud-corner--br" style={{ borderColor: `${d.color}33` }} />

          <div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 8, letterSpacing: '0.2em', color: `${d.color}66`, marginBottom: 3 }}>
              {d.label} · {d.sublabel}
            </div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: '#666', letterSpacing: '0.06em' }}>
              {d.label === 'DOOR 01' ? 'Sharpest version of the obvious path'
               : d.label === 'DOOR 02' ? 'Through the friction you have been avoiding'
               : 'Built on the premise you are asking the wrong question'}
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: 8, letterSpacing: '0.2em', color: `${d.color}44`, fontWeight: 900 }}>
            LOCKED
          </span>
        </motion.div>
      ))}
    </motion.div>

    {/* ── ZYVV WORDMARK — massive, tight ── */}
    <motion.div
      animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden', marginBottom: 6 }}
    >
      {/* Radar ring behind wordmark */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '50%', left: -20,
          width: 200, height: 200,
          borderRadius: '50%',
          border: '1px solid rgba(0,245,255,0.04)',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }} />
        <div
          className="font-mono font-black"
          style={{
            fontSize: 'clamp(72px, 22vw, 110px)',
            lineHeight: 0.85,
            letterSpacing: '-0.05em',
            color: '#ffffff',
            textShadow: '0 0 60px rgba(0,245,255,0.12)',
          }}
        >
          ZYVV
        </div>
      </div>
    </motion.div>

    {/* ── SUBHEAD ── */}
    <motion.div
      animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden', marginBottom: 20 }}
    >
      <p style={{
        fontFamily: 'var(--font-hud)',
        fontSize: 10,
        lineHeight: 1.7,
        color: '#777',
        letterSpacing: '0.04em',
      }}>
        NOT ADVICE. NOT PREDICTION.<br />
        A DECISION PROTOCOL.<br />
        <span style={{ color: '#555' }}>
          THREE DIVERGENT PATHS. ZERO CONSENSUS THINKING.
        </span>
      </p>
    </motion.div>

    {/* ── INPUT AREA — codec mission briefing style ── */}
    <div>
      {/* Input panel header */}
      <div className="hud-panel__header" style={{ marginBottom: 0, borderBottom: '1px solid var(--color-border-dim)' }}>
        <span>SITUATION INPUT · MISSION BRIEFING</span>
        <span style={{ color: 'var(--color-text-dim)' }}>
          {situation.length}/{MAX_CHARS}
        </span>
      </div>

      <div style={{ position: 'relative', marginBottom: 8 }}>
        {/* Corner brackets on textarea */}
        <span className="hud-corner hud-corner--tl" />
        <span className="hud-corner hud-corner--br" />

        <textarea
          ref={textareaRef}
          value={situation}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="State your situation. Be specific. Vague input gets vague doors."
          rows={4}
          style={{
            width: '100%',
            fontFamily: 'var(--font-hud)',
            fontSize: 13,
            lineHeight: 1.7,
            padding: '14px 16px',
            background: 'var(--color-panel)',
            border: `1px solid ${error ? '#FF2D55' : 'var(--color-border-dim)'}`,
            borderTop: 'none',
            borderRadius: '0 0 2px 2px',
            color: 'var(--color-text-primary)',
            outline: 'none',
            resize: 'none',
            minHeight: 110,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            setIsFocused(true)
            e.currentTarget.style.borderColor = 'var(--color-border-hot)'
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,245,255,0.1), inset 0 0 30px rgba(0,245,255,0.02)'
          }}
          onBlur={(e) => {
            setIsFocused(false)
            if (!error) e.currentTarget.style.borderColor = 'var(--color-border-dim)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          autoFocus
          spellCheck
          aria-label="Describe your situation"
        />
      </div>

      {/* Min length bar */}
      <AnimatePresence>
        {!canSubmit && situation.length > 0 && (
          <MinLengthBar current={situation.trim().length} min={MIN_CHARS} />
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: '#FF2D55', letterSpacing: '0.1em', marginBottom: 8 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── INTELLIGENCE ENGINE SELECTOR ── */}
      <div style={{
        border: '1px solid var(--color-border-dim)',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 12,
        marginBottom: 14,
        background: 'var(--color-panel)',
      }}>
        <div className="hud-panel__header">
          <span>INTELLIGENCE ENGINE · SELECT BEFORE LAUNCH</span>
          <span className="readout-blink">●</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border-dim)' }}>
          {/* MANA */}
          <button
            type="button"
            onClick={() => setVersion('mana')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              padding: '12px 14px',
              background: version === 'mana' ? 'rgba(0,245,255,0.04)' : 'transparent',
              borderRight: '1px solid var(--color-border-dim)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', color: version === 'mana' ? '#ffffff' : 'var(--color-text-secondary)' }}>
                MANA
              </span>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: 8, color: version === 'mana' ? '#00F5FF' : 'var(--color-text-dim)' }}>
                {version === 'mana' ? '● ACTIVE' : '○ STANDBY'}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-hud)', fontSize: 8, lineHeight: 1.5, color: '#888', marginBottom: 8 }}>
              Verified external signal injected as ground truth before door generation.
            </p>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 7, color: 'var(--color-text-dim)', letterSpacing: '0.1em' }}>
              POST /api/v1/mana/doors
            </span>
          </button>

          {/* YUGA */}
          <button
            type="button"
            onClick={() => setVersion('yuga')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              padding: '12px 14px',
              background: version === 'yuga' ? 'rgba(191,90,242,0.04)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', color: version === 'yuga' ? '#ffffff' : 'var(--color-text-secondary)' }}>
                YUGA
              </span>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: 8, color: version === 'yuga' ? '#BF5AF2' : 'var(--color-text-dim)' }}>
                {version === 'yuga' ? '● ACTIVE' : '○ STANDBY'}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-hud)', fontSize: 8, lineHeight: 1.5, color: '#888', marginBottom: 8 }}>
              Extracts unstated assumption. Searches for counter-evidence. Rebuilds all doors against the breach.
            </p>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 7, color: 'var(--color-text-dim)', letterSpacing: '0.1em' }}>
              POST /api/v1/yuga/doors
            </span>
          </button>
        </div>
        <div style={{
          padding: '7px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-panel-raised)',
        }}>
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: 7, letterSpacing: '0.1em', color: '#ffffff' }}>
            API ACCESS · EARLY PARTNER PROGRAM
          </span>
          <a
            href="mailto:zyvv.contact@gmail.com?subject=ZYVV%20API%20Access%20Request&body=Name%3A%0ACompany%3A%0AUse%20case%3A%0AEngine%20needed%20(MANA%2FYUGA%2FBoth)%3A"
            className="font-mono text-[8px] font-bold tracking-[0.1em] hover:opacity-70 transition-opacity"
            style={{ textDecoration: 'none', color: '#00F5FF' }}
          >
            API REQUEST ACCESS →
          </a>
        </div>
      </div>

      {/* ── LAUNCH BUTTON ── */}
      <button
        ref={submitBtnRef}
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: '100%',
          fontFamily: 'var(--font-hud)',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          padding: '16px 0',
          borderRadius: 2,
          background: canSubmit
            ? 'linear-gradient(90deg, rgba(0,245,255,0.12) 0%, rgba(0,245,255,0.06) 100%)'
            : 'transparent',
          color: canSubmit ? '#00F5FF' : 'var(--color-text-dim)',
          border: `1px solid ${canSubmit ? 'rgba(0,245,255,0.4)' : 'var(--color-border-dim)'}`,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: canSubmit ? '0 0 20px rgba(0,245,255,0.08), inset 0 0 20px rgba(0,245,255,0.03)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!canSubmit) return
          e.currentTarget.style.background = 'rgba(0,245,255,0.14)'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,245,255,0.2), inset 0 0 30px rgba(0,245,255,0.06)'
          e.currentTarget.style.borderColor = 'rgba(0,245,255,0.7)'
        }}
        onMouseLeave={(e) => {
          if (!canSubmit) return
          e.currentTarget.style.background = 'linear-gradient(90deg, rgba(0,245,255,0.12) 0%, rgba(0,245,255,0.06) 100%)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.08), inset 0 0 20px rgba(0,245,255,0.03)'
          e.currentTarget.style.borderColor = 'rgba(0,245,255,0.4)'
        }}
        aria-label="Open the portal"
        className={canSubmit ? 'btn-launch' : ''}
      >
        {canSubmit ? '[ OPEN THE PORTAL ]' : '[ OPEN THE PORTAL ]'}
      </button>

      {canSubmit && (
        <p style={{ fontFamily: 'var(--font-hud)', fontSize: 8, color: 'var(--color-text-dim)', textAlign: 'center', marginTop: 8, letterSpacing: '0.1em' }}>
          ⌘ + ENTER
        </p>
      )}
    </div>
  </motion.section>
)}

            {/* LOADING */}
            {phase === 'loading' && (
  <motion.section
    key="loading-phase"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 80 }}
    aria-live="polite"
  >
    {/* MGS codec loading panel */}
    <div style={{
      width: '100%',
      background: 'var(--color-panel)',
      border: '1px solid var(--color-border-dim)',
      borderRadius: 2,
      padding: 20,
      marginBottom: 16,
    }}>
      <div className="hud-panel__header" style={{ marginBottom: 12 }}>
        <span>PROCESSING SITUATION INPUT</span>
        <span className="readout-blink" style={{ color: '#00FF41' }}>● RUNNING</span>
      </div>
      <div className="transmission-sweep" style={{ marginBottom: 14 }} />
      <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        ADVERSARIAL LOGIC PROTOCOL · DIVERGENCE ENGINE ACTIVE
      </div>
      <div style={{ fontFamily: 'var(--font-hud)', fontSize: 11, letterSpacing: '0.05em', color: 'var(--color-text-primary)', marginBottom: 16, textAlign: 'center' }}>
        {LOADING_LINES[Math.floor(Date.now() / 10000) % LOADING_LINES.length]}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <span className="dot-pulse" />
        <span className="dot-pulse" />
        <span className="dot-pulse" />
      </div>
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
               <div style={{
  fontFamily: 'var(--font-hud)',
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: '0.28em',
  color: '#BF5AF2',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}}>
  <span className="readout-blink" style={{ color: '#00FF41' }}>●</span>
  THE MIRROR · DIAGNOSTIC OUTPUT
</div>

                {/* ── EXPECTATION FRAMING — prevents confrontational output feeling like an error ── */}
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="font-mono text-[10px] leading-[1.6] tracking-[0.04em] mb-5"
                  style={{ color: '#333' }}
                >
                  ZYVV will challenge your thinking, not validate it.
                </motion.p>

                <MirrorReveal
                  text={mirror}
                  onComplete={() => {
                    setShowPostMirror(true)
                    setTimeout(() => setPhase('doors'), (breach || contextSignal) ? 2400 : 1600)
                  }}
                />

                {breach && showPostMirror && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ marginTop: '2rem' }}
                  >
                    <p
                      className="font-mono text-[11px] leading-[1.7] tracking-[0.03em]"
                      style={{ color: '#555' }}
                    >
                      ─ assumption: {breach.assumption}
                    </p>
                    <p
                      className="font-mono text-[11px] leading-[1.7] tracking-[0.03em] mt-1"
                      style={{ color: '#444' }}
                    >
                      ─ signal: {breach.signal}
                    </p>
                  </motion.div>
                )}

                {contextSignal && showPostMirror && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    style={{ marginTop: '2rem' }}
                  >
                    <p style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      color: '#777',
                      margin: 0,
                      letterSpacing: '0.02em',
                      lineHeight: 1.5,
                    }}>
                      ─ signal: {contextSignal.signal}
                    </p>
                  </motion.div>
                )}
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
                  <p className="font-mono text-[11px] leading-[1.6]" style={{ color: '#333' }}>
                    {situation.trim().slice(0, 100)}
                    {situation.trim().length > 100 ? '…' : ''}
                  </p>
                </div>

                <div className="border-l-2 pl-4 mb-8" style={{ borderColor: '#BF5AF2' }}>
                  <p className="font-mono text-[11px] leading-[1.7]" style={{ color: '#666' }}>
                    {mirror}
                  </p>
                </div>

                {/* ── DOORS HEADER ── */}
                <div className="mb-4">
                  <p
                    className="font-mono text-[10px] tracking-[0.14em] uppercase"
                    style={{ color: '#333' }}
                  >
                    Three paths. Pick one.
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
                      className="font-mono text-[10px] tracking-[0.18em] uppercase text-center mb-8"
                      style={{ color: '#2a2a2a' }}
                    >
                      YOUR DOOR
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    const text = `ZYVV just read me: "${mirror}" — zyvv.vercel.app`
                    navigator.clipboard.writeText(text)
                  }}
                  className="w-full font-mono text-[10px] tracking-[0.18em] uppercase py-3 rounded-sm mt-2"
                  style={{ color: '#333', border: '1px solid #1a1a1a', background: 'transparent', cursor: 'pointer' }}
                >
                  COPY THE MIRROR →
                </motion.button>
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
                  className="font-mono text-[9px] font-black tracking-[0.22em] uppercase mb-5"
                  style={{
                    color: DOOR_CONFIGS[chosenDoor.door_type].glowColor,
                    textShadow: `0 0 20px ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}66`,
                  }}
                >
                  INTERROGATION
                </div>

                {/* Panel */}
                <div
                  style={{
                    background: '#080808',
                    border: `1px solid ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}33`,
                    borderRadius: 6,
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px 7px',
                      borderBottom: `1px solid ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}18`,
                      background: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}06`,
                    }}
                  >
                    <span
                      className="font-mono text-[8px] font-black tracking-[0.16em] uppercase"
                      style={{ color: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}88` }}
                    >
                      DOOR CHOSEN
                    </span>
                    <span
                      className="font-mono text-[8px] tracking-[0.1em]"
                      style={{ color: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}55` }}
                    >
                      ● ACTIVE
                    </span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p className="font-mono text-[12px] leading-[1.65]" style={{ color: '#555' }}>
                      You chose{' '}
                      <span style={{ color: DOOR_CONFIGS[chosenDoor.door_type].glowColor }}>
                        {chosenDoor.title}
                      </span>
                      . What&apos;s your doubt?
                    </p>
                  </div>
                </div>

                <textarea
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  placeholder="But I don't have enough time for that..."
                  rows={3}
                  className="w-full font-mono text-[14px] leading-[1.65] px-4 py-4 mb-4"
                  style={{
                    background: 'rgba(6,6,8,0.88)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #1e1e1e',
                    borderRadius: 6,
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s',
                    display: 'block',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = DOOR_CONFIGS[chosenDoor.door_type].glowColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      if (objection.trim().length >= 4) handleInterrogate()
                    }}
                    onClick={() => {
                      if (objection.trim().length >= 4) handleInterrogate()
                    }}
                    disabled={objection.trim().length < 4}
                    className="flex-1 font-mono text-[11px] font-black tracking-[0.22em] uppercase py-4 rounded-[5px]"
                    style={{
                      background: objection.trim().length >= 4 ? DOOR_CONFIGS[chosenDoor.door_type].glowColor : '#0a0a0a',
                      color: objection.trim().length >= 4 ? '#000' : '#2a2a2a',
                      border: objection.trim().length >= 4 ? 'none' : '1px solid #1a1a1a',
                      cursor: objection.trim().length >= 4 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.25s',
                    }}
                  >
                    INTERROGATE
                  </button>
                  <button
                    onTouchEnd={(e) => { e.preventDefault(); setPhase('share') }}
                    onClick={() => setPhase('share')}
                    className="font-mono text-[10px] tracking-[0.14em] uppercase px-5 py-4 rounded-[5px]"
                    style={{ color: '#333', border: '1px solid #1a1a1a', background: 'transparent', cursor: 'pointer' }}
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
                {/* Section label */}
                <div
                  className="font-mono text-[9px] font-black tracking-[0.22em] uppercase mb-5"
                  style={{ color: '#BF5AF2', textShadow: '0 0 20px rgba(191,90,242,0.4)' }}
                >
                  REFINED PATH
                </div>

                {/* DIAGNOSIS panel */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  style={{
                    background: '#080808',
                    border: '1px solid rgba(255,45,85,0.3)',
                    borderRadius: 6,
                    boxShadow: '0 0 0 1px rgba(255,45,85,0.08), inset 0 0 20px rgba(255,45,85,0.02)',
                    marginBottom: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px 7px',
                      borderBottom: '1px solid rgba(255,45,85,0.15)',
                      background: 'rgba(255,45,85,0.04)',
                    }}
                  >
                    <span className="font-mono text-[8px] font-black tracking-[0.18em] uppercase" style={{ color: 'rgba(255,45,85,0.7)' }}>
                      DIAGNOSIS
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.1em]" style={{ color: 'rgba(255,45,85,0.3)' }}>
                      ● OBJECTION PROCESSED
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p className="font-mono text-[12px] leading-[1.7]" style={{ color: '#888' }}>
                      {refinement.critique}
                    </p>
                  </div>
                </motion.div>

                {/* REFINED PATH panel */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  style={{
                    background: '#080808',
                    border: `1px solid ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}44`,
                    borderRadius: 6,
                    boxShadow: `0 0 0 1px ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}10, inset 0 0 24px ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}04`,
                    marginBottom: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px 7px',
                      borderBottom: `1px solid ${DOOR_CONFIGS[chosenDoor.door_type].glowColor}18`,
                      background: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}06`,
                    }}
                  >
                    <span
                      className="font-mono text-[8px] font-black tracking-[0.18em] uppercase"
                      style={{ color: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}cc` }}
                    >
                      REFINED PATH
                    </span>
                    <span
                      className="font-mono text-[8px] tracking-[0.1em]"
                      style={{ color: `${DOOR_CONFIGS[chosenDoor.door_type].glowColor}44` }}
                    >
                      ● UPGRADED
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p className="font-mono text-[12px] leading-[1.7]" style={{ color: '#ccc' }}>
                      {refinement.refined_path}
                    </p>
                  </div>
                </motion.div>

                {/* NEXT QUESTION panel */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  style={{
                    background: '#080808',
                    border: '1px solid #1e1e1e',
                    borderRadius: 6,
                    marginBottom: 20,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px 7px',
                      borderBottom: '1px solid #111',
                    }}
                  >
                    <span className="font-mono text-[8px] font-black tracking-[0.18em] uppercase" style={{ color: '#333' }}>
                      NEXT QUESTION
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.1em]" style={{ color: '#222' }}>
                      ● INTERROGATION VECTOR
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p className="font-mono text-[12px] leading-[1.7]" style={{ color: '#555' }}>
                      {refinement.next_interrogation_vector}
                    </p>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setPhase('share')}
                  className="w-full font-mono text-[11px] font-black tracking-[0.22em] uppercase py-4 rounded-[5px]"
                  style={{
                    background: 'linear-gradient(135deg, #BF5AF2 0%, #7a22cc 100%)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(191,90,242,0.25)',
                  }}
                >
                  CONTINUE →
                </motion.button>
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
                  choiceId={choiceId ?? undefined}
                  onDone={handleReset}
                />
              </motion.section>
            )}

          </AnimatePresence>

        </div>
      </main>
    </>
  )
}
