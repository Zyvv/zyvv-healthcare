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
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ situation_id: situationId, door_id: door.id }),
        })
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
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
              >
                {/* THREE LOCKED DOORS */}
                <motion.div
                  animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                  className="mb-4"
                >
                  {([
                    { label: 'DOOR 1', glyph: '◈', color: '#00F5FF', dir: 'top'   as const, delay: 0,    animName: 'doorHeartbeat0', animDelay: '0s'   },
                    { label: 'DOOR 2', glyph: '◉', color: '#FFB830', dir: 'left'  as const, delay: 0.15, animName: 'doorHeartbeat1', animDelay: '0.4s' },
                    { label: 'DOOR 3', glyph: '⬡', color: '#BF5AF2', dir: 'right' as const, delay: 0.3,  animName: 'doorHeartbeat2', animDelay: '0.8s' },
                  ] as const).map((d) => (
                    <motion.div
                      key={d.label}
                      variants={doorSlam}
                      custom={d.dir}
                      initial={isReturning ? 'visible' : 'hidden'}
                      animate="visible"
                      transition={{ delay: isReturning ? 0 : d.delay }}
                      className="flex items-center justify-between px-4 mb-2 rounded-sm"
                      style={{
                        height: 80,
                        background: 'rgba(8,8,8,0.85)',
                        border: `1px solid ${d.color}4D`,
                        animation: `${d.animName} 2s ease-in-out ${d.animDelay} infinite`,
                        marginRight: d.label === 'DOOR 2' ? 0 : 32,
                        marginLeft: d.label === 'DOOR 2' ? 32 : 0,
                      }}
                    >
                      <span
                        className="font-mono text-[10px] font-black tracking-[0.18em] uppercase"
                        style={{ color: d.color, opacity: 0.5 }}
                      >
                        {d.label}
                      </span>
                      <span style={{ fontSize: 28, color: d.color, opacity: 0.8 }}>
                        {d.glyph}
                      </span>
                      <span
                        className="font-mono text-[10px] font-black tracking-[0.18em] uppercase"
                        style={{ color: d.color, opacity: 0.4 }}
                      >
                        LOCKED
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* ── THREE DOORS EXPLAINER — appears below locked doors, disappears on focus ── */}
                <motion.div
                  animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                  className="mb-4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: isReturning ? 0 : 0.9 }}
                  >
                    <p className="font-mono text-[9px] leading-[1.8] tracking-[0.04em]" style={{ color: '#2a2a2a' }}>
                      ─ door 1: the best version of the obvious path, built against verified reality
                    </p>
                    <p className="font-mono text-[9px] leading-[1.8] tracking-[0.04em]" style={{ color: '#2a2a2a' }}>
                      ─ door 2: the path that goes directly through the friction you&apos;ve been avoiding
                    </p>
                    <p className="font-mono text-[9px] leading-[1.8] tracking-[0.04em]" style={{ color: '#2a2a2a' }}>
                      ─ door 3: built on the premise that the problem itself is the wrong problem
                    </p>
                  </motion.div>
                </motion.div>

                {/* ZYVV wordmark */}
                <motion.div
                  animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                  className="mb-2"
                >
                  <motion.div
                    variants={slamIn}
                    initial={isReturning ? 'visible' : 'hidden'}
                    animate="visible"
                    custom={isReturning ? 0 : 0.4}
                    className="font-mono font-black tracking-[-0.04em] text-white"
                    style={{
                      fontSize: 'clamp(72px, 22vw, 120px)',
                      lineHeight: 0.85,
                      letterSpacing: '-0.05em',
                      textShadow: '0 0 80px rgba(0,245,255,0.18), 0 0 160px rgba(191,90,242,0.08)',
                    }}
                  >
                    ZYVV
                  </motion.div>
                </motion.div>

                {/* ── SUBHEADLINE — value proposition ── */}
                <motion.div
                  animate={{ height: isFocused ? 0 : 'auto', opacity: isFocused ? 0 : 1 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                  className="mb-6"
                >
                  <motion.p
                    variants={fadeUp}
                    initial={isReturning ? 'visible' : 'hidden'}
                    animate="visible"
                    custom={isReturning ? 0 : 0.55}
                    className="font-mono text-[11px] leading-[1.7] tracking-[0.04em]"
                    style={{ color: '#444' }}
                  >
                    Not advice. Not prediction. A decision protocol.
                    <br />
                    ZYVV detects the assumption you didn&apos;t know you were making,
                    <br />
                    searches for evidence it&apos;s wrong,
                    <br />
                    and returns three structurally different paths built against verified reality.
                  </motion.p>
                </motion.div>

                {/* TEXTAREA + BUTTON */}
                <motion.div
                  variants={shockwaveRise}
                  initial={isReturning ? 'visible' : 'hidden'}
                  animate="visible"
                >
                  {/* ── EXPLAINER above input ── */}
                  <div className="mb-3">
                    <p
                      className="font-mono text-[11px] leading-[1.6] tracking-[0.03em]"
                      style={{ color: '#00F5FF', opacity: 0.6 }}
                    >
                      Be specific. Vague input gets a vague breach.
                    </p>
                    <p
                      className="font-mono text-[10px] mt-1 tracking-[0.02em]"
                      style={{ color: '#2a2a2a' }}
                    >
                      e.g. "I'm considering leaving my job to go solo but I have a mortgage and I'm not sure the market timing is right."
                    </p>
                  </div>

                  <div className="relative mb-2">
                    <textarea
                      ref={textareaRef}
                      value={situation}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe a decision or situation you're stuck on. The more context the better."
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
                        if (situation.length === 0) return
                        setIsFocused(true)
                        if (!error) e.currentTarget.style.borderColor = '#00F5FF'
                        e.currentTarget.style.boxShadow = '0 0 22px rgba(0,245,255,0.13)'
                      }}
                      onBlur={(e) => {
                        setIsFocused(false)
                        if (!error) e.currentTarget.style.borderColor = '#1e1e1e'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      autoFocus
                      spellCheck
                      aria-label="Describe your situation"
                    />
                    {isNearLimit && (
                      <div
                        className="absolute bottom-3 right-3 font-mono text-[10px]"
                        style={{ color: situation.length >= MAX_CHARS - 50 ? '#FF2D55' : '#444' }}
                      >
                        {charsLeft}
                      </div>
                    )}
                  </div>

                  {/* ── MIN LENGTH PROGRESS BAR ── */}
                  <AnimatePresence>
                    {!canSubmit && situation.length > 0 && (
                      <MinLengthBar current={situation.trim().length} min={MIN_CHARS} />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        key="error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-[10px] mb-3 tracking-[0.06em]"
                        style={{ color: '#FF2D55' }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* ── VERSION SELECTOR ── */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', marginTop: '4px' }}>
                    {(['mana', 'yuga'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setVersion(v)}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.65rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 0',
                          minWidth: '44px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: version === v ? '#ffffff' : '#333333',
                          borderBottom: version === v ? '1px solid #ffffff' : '1px solid transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  {/* Engine description — always visible, switches on selection */}
                  <div style={{ marginBottom: '20px', marginTop: '-4px', minHeight: '42px' }}>
                    {version === 'mana' && (
                      <motion.div
                        key="mana-desc"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p style={{ fontSize: '0.62rem', color: '#555', fontFamily: 'monospace', letterSpacing: '0.02em', lineHeight: 1.7, margin: 0 }}>
                          ─ fetches one verified real-world signal before generating your doors
                        </p>
                        <p style={{ fontSize: '0.60rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.02em', lineHeight: 1.7, margin: 0 }}>
                          ─ faster · signal injected silently · doors built against external reality
                        </p>
                      </motion.div>
                    )}
                    {version === 'yuga' && (
                      <motion.div
                        key="yuga-desc"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p style={{ fontSize: '0.62rem', color: '#555', fontFamily: 'monospace', letterSpacing: '0.02em', lineHeight: 1.7, margin: 0 }}>
                          ─ detects the assumption you didn&apos;t state
                        </p>
                        <p style={{ fontSize: '0.60rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.02em', lineHeight: 1.7, margin: 0 }}>
                          ─ searches for evidence it&apos;s wrong · builds all three doors against the breach · +3s
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* ── PRIMARY CTA ── */}
                  <button
                    ref={submitBtnRef}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`w-full font-mono text-[13px] font-black tracking-[0.22em] uppercase py-5 rounded-sm${canSubmit ? ' btn-launch' : ''}`}
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #00F5FF 0%, #0088aa 100%)'
                        : '#0a0a0a',
                      color: canSubmit ? '#000' : '#2a2a2a',
                      border: canSubmit ? 'none' : '1px solid #1a1a1a',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      transition: 'all 0.25s',
                      boxShadow: canSubmit ? '0 0 30px rgba(0,245,255,0.2)' : 'none',
                      letterSpacing: '0.22em',
                    }}
                    onMouseEnter={(e) => {
                      if (canSubmit) {
                        e.currentTarget.style.boxShadow = '0 0 60px rgba(0,245,255,0.45), 0 0 120px rgba(191,90,242,0.2)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = canSubmit ? '0 0 30px rgba(0,245,255,0.2)' : 'none'
                      e.currentTarget.style.transform = 'none'
                    }}
                    aria-label="Open the portal"
                  >
                    {canSubmit ? 'OPEN THE PORTAL' : 'OPEN THE PORTAL'}
                  </button>

                  {/* ── KEYBOARD HINT ── */}
                  {canSubmit && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="font-mono text-[9px] text-center mt-2 tracking-[0.08em]"
                      style={{ color: '#222' }}
                    >
                      or press ⌘ + Enter
                    </motion.p>
                  )}

                  {/* ── API HINT — visible only when not focused, for dev/founder audience ── */}
                  <AnimatePresence>
                    {!isFocused && phase === 'input' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 1.2 }}
                        style={{ marginTop: '32px', textAlign: 'center' }}
                      >
                        <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 mb-2 flex items-center justify-center gap-2 uppercase">
  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 animate-pulse" />
  SECURE ENDPOINTS · PROTOCOL ACCESS
</div>
<div className="inline-block font-mono text-[10px] text-zinc-400 bg-zinc-950/80 border border-zinc-800/60 px-4 py-2 rounded-sm max-w-full break-all">
  <span className="text-cyan-400/70 font-bold">POST</span> /v1/doors
  <span className="mx-2 text-zinc-700">|</span>
  <span className="text-cyan-400/70 font-bold">POST</span> /v1/choice
  <span className="mx-2 text-zinc-700">|</span>
  <span className="text-cyan-400/70 font-bold">POST</span> /v1/interrogate
</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                  style={{ color: '#BF5AF2', textShadow: '0 0 20px rgba(191,90,242,0.4)' }}
                >
                  THE MIRROR
                </motion.div>

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
                      style={{ color: '#333' }}
                    >
                      {breach.assumption}
                    </p>
                    <p
                      className="font-mono text-[11px] leading-[1.7] tracking-[0.03em] mt-1"
                      style={{ color: '#2a2a2a' }}
                    >
                      {breach.signal}
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
