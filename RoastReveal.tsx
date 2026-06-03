// ============================================================
// ZYVV — RoastReveal Component
// File: app/components/RoastReveal.tsx
// ============================================================
// Reveals the AI roast with a typewriter effect.
// When complete, triggers the door reveal phase.
//
// States:
//   - typing:   character-by-character reveal with blinking cursor
//   - complete: cursor disappears, "OPEN THE DOORS" CTA fades in
//
// Framer Motion handles the container entrance.
// The typewriter effect is a vanilla setInterval — lightweight.
// ============================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Props ─────────────────────────────────────────────────────

interface RoastRevealProps {
  roast: string
  onComplete: () => void   // called once typing is done + user clicks CTA
}

// ── Timing ────────────────────────────────────────────────────
// Chars per interval tick. Lower = slower, more dramatic.
const TYPING_SPEED_MS = 22   // ~45 chars/sec — fast but readable
const REVEAL_DELAY_MS = 400  // pause before typing starts

// ── Animation variants ────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const labelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

const ctaVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// ── Component ─────────────────────────────────────────────────

export default function RoastReveal({ roast, onComplete }: RoastRevealProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const blinkRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Typewriter effect ──────────────────────────────────────

  useEffect(() => {
    // Short delay before typing begins — lets the container animate in first
    const startDelay = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        indexRef.current += 1
        setDisplayedText(roast.slice(0, indexRef.current))

        if (indexRef.current >= roast.length) {
          clearInterval(intervalRef.current!)
          setIsTypingDone(true)
          setShowCursor(false) // stop blinking, hide cursor
        }
      }, TYPING_SPEED_MS)
    }, REVEAL_DELAY_MS)

    return () => {
      clearTimeout(startDelay)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (blinkRef.current) clearInterval(blinkRef.current)
    }
  }, [roast])

  // ── Cursor blink while typing ──────────────────────────────

  useEffect(() => {
    if (isTypingDone) return
    blinkRef.current = setInterval(() => {
      setShowCursor((v) => !v)
    }, 530)
    return () => {
      if (blinkRef.current) clearInterval(blinkRef.current)
    }
  }, [isTypingDone])

  // ── Render ─────────────────────────────────────────────────

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Section label */}
      <motion.div
        variants={labelVariants}
        initial="hidden"
        animate="visible"
        className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-4"
        style={{ color: '#00F5FF' }}
      >
        THE ROAST
      </motion.div>

      {/* Roast text container */}
      <div
        className="relative border rounded-sm px-6 py-5"
        style={{
          background: '#080808',
          borderColor: '#1e1e1e',
          borderLeft: '2px solid #00F5FF',
        }}
      >
        {/* The roast copy */}
        <p
          className="text-white leading-[1.7]"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '17px',
            minHeight: '1.7em', // prevent layout shift before text appears
          }}
        >
          {displayedText}

          {/* Blinking cursor — only shown while typing */}
          {!isTypingDone && (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                background: '#00F5FF',
                marginLeft: '3px',
                verticalAlign: 'text-bottom',
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
              }}
            />
          )}
        </p>
      </div>

      {/* CTA — appears after typing completes */}
      <AnimatePresence>
        {isTypingDone && (
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 flex justify-center"
          >
            <button
              onClick={onComplete}
              className="group relative font-mono text-[11px] font-bold tracking-[0.18em] uppercase px-8 py-4 rounded-sm transition-all duration-300"
              style={{
                background: 'transparent',
                border: '1px solid #00F5FF',
                color: '#00F5FF',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = '#00F5FF'
                el.style.color = '#000000'
                el.style.boxShadow = '0 0 32px rgba(0, 245, 255, 0.30)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'transparent'
                el.style.color = '#00F5FF'
                el.style.boxShadow = 'none'
              }}
            >
              OPEN THE DOORS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
