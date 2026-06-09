// ============================================================
// ZYVV — Main Page
// File: app/page.tsx
// ============================================================
// The full phase orchestrator. Controls the entire user journey:
//
//   input   → user types situation
//   loading → Groq is generating
//   roast   → RoastReveal typewriter plays
//   doors   → three Door components shown
//   chosen  → user picked a door (Door highlights, save fires)
//   share   → ShareCard appears
//
// All state lives here. Child components are pure-display.
// API calls: /api/generate (on submit), /api/save (on door pick).
// ============================================================

'use client'

import { useCallback, useRef, useState } from 'react'
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
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const MAX_CHARS = 2000
const WARN_CHARS = 1800

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [situation, setSituation] = useState('')
  const [tried, setTried] = useState('')
  const [error, setError] = useState('')
  const [roast, setRoast] = useState('')
  const [doors, setDoors] = useState<DoorType[]>([])
  const [situationId, setSituationId] = useState<number | null>(null)
  const [chosenDoor, setChosenDoor] = useState<DoorType | null>(null)

  const sessionIdRef = useRef<string>(generateSessionId())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(async () => {
    const trimmed = situation.trim()
    if (!trimmed) return
    if (trimmed.length < 10) {
      setError('Tell us a bit more — a few more words.')
      return
    }

    setError('')
    setPhase('loading')

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

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Generation failed.')
      }

      setRoast(data.roast)
      setDoors(data.doors)
      setSituationId(data.situation_id)
      setPhase('roast')
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
      setPhase('input')
    }
  }, [situation, tried])

  const handleDoorChosen = useCallback(
    async (door: DoorType) => {
      setChosenDoor(door)
      setPhase('chosen')

      if (situationId && door.id) {
        try {
          await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              situation_id: situationId,
              door_id: door.id,
            }),
          })
        } catch {
          // Silent
        }
      }

      setTimeout(() => setPhase('share'), 800)
    },
    [situationId]
  )

  const handleReset = useCallback(() => {
    setSituation('')
    setTried('')
    setRoast('')
    setDoors([])
    setSituationId(null)
    setChosenDoor(null)
    setError('')
    setPhase('input')
    sessionIdRef.current = generateSessionId()
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

  const charsLeft = MAX_CHARS - situation.length
  const isNearLimit = situation.length >= WARN_CHARS

  return (
    <main
      className="min-h-dvh min-h-screen bg-black flex flex-col items-center px-5 py-12"
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="I know what I need to do. I've known for months. I still haven't done it."
                  rows={4}
                  className="w-full font-mono text-[14px] leading-[1.65] px-4 py-4 rounded-sm"
                  style={{
                    background: '#0a0a0a',
                    border: `1px solid ${error ? '#FF2D55' : '#1e1e1e'}`,
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                    minHeight: 120,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    if (!error) e.currentTarget.style.borderColor = '#00F5FF'
                  }}
                  onBlur={(e) => {
                    if (!error) e.currentTarget.style.borderColor = '#1e1e1e'
                  }}
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
                    background: '#0a0a0a',
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
                  onClick={handleSubmit}
                  disabled={situation.trim().length < 10}
                  className="w-full font-mono text-[11px] font-bold tracking-[0.18em] uppercase py-4 rounded-sm transition-all duration-300"
                  style={{
                    background: situation.trim().length < 10 ? '#111' : '#00F5FF',
                    color: situation.trim().length < 10 ? '#333' : '#000',
                    border: 'none',
                    cursor: situation.trim().length < 10 ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (situation.trim().length >= 10) {
                      e.currentTarget.style.boxShadow = '0 0 32px rgba(0, 245, 255, 0.30)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
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

              <motion.div
                variants={fadeUp}
                custom={0.36}
                className="mt-10 flex justify-center"
              >
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
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: '#00F5FF',
                      animation: `pulse-glow 1.4s ease-in-out ${i * 0.22}s infinite`,
                    }}
                  />
                ))}
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
              <p
                className="font-mono text-[12px] leading-[1.6] mb-8"
                style={{ color: '#444' }}
              >
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
                <p
                  className="font-mono text-[11px] leading-[1.6]"
                  style={{ color: '#3a3a3a' }}
                >
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
                    isRevealed={true}
                    isChosen={chosenDoor?.id === door.id}
                    isAnyChosen={chosenDoor !== null}
                    onChoose={handleDoorChosen}
                  />
                ))}
              </div>

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

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(0.7); }
        }
      `}</style>
    </main>
  )
}