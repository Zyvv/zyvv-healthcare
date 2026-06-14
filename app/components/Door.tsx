// ============================================================
// ZYVV — Door Component (TACTICAL TERMINAL v2)
// File: app/components/Door.tsx
//
// Design: Military / Metal Gear terminal aesthetic
// - Rounded-corner rectangular panels (border-radius: 6px)
// - Colored border glow per door type
// - Typewriter reveal on description and why_it_works
// - TRANSMISSION INCOMING → indicator before content appears
// - Tap gate: button requires deliberate press, not scroll trigger
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { DOOR_CONFIGS } from '@/lib/types'
import type { Door, DoorType } from '@/lib/types'

interface DoorProps {
  door: Door
  index: number
  isRevealed: boolean
  isChosen: boolean
  isAnyChosen: boolean
  onChoose: (door: Door) => void
}

// ── Typewriter hook ───────────────────────────────────────────

function useTypewriter(text: string, speed = 14, startDelay = 0, enabled = true) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const iRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text)
      setDone(true)
      return
    }
    setDisplayed('')
    setDone(false)
    iRef.current = 0

    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        iRef.current += 1
        setDisplayed(text.slice(0, iRef.current))
        if (iRef.current >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(delay)
  }, [text, speed, startDelay, enabled])

  return { displayed, done }
}

// ── Transmission indicator ────────────────────────────────────

function TransmissionIndicator({ color }: { color: string }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 380)
    return () => clearInterval(t)
  }, [])
  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: 9,
        letterSpacing: '0.18em',
        color,
        opacity: 0.7,
      }}
    >
      RECEIVING DATA{dots}
    </span>
  )
}

// ── Glyphs ────────────────────────────────────────────────────

const CLOSED_GLYPHS: Record<DoorType, string> = {
  conventional: '◈',
  contrarian:   '◉',
  alien:        '⬡',
}

const DOOR_LABELS: Record<DoorType, string> = {
  conventional: 'The expected path',
  contrarian:   'The opposite path',
  alien:        'The reframe',
}

// ── Component ─────────────────────────────────────────────────

export default function Door({
  door,
  index,
  isRevealed,
  isChosen,
  isAnyChosen,
  onChoose,
}: DoorProps) {
  const config = DOOR_CONFIGS[door.door_type]
  const [transmitting, setTransmitting] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const choosingRef = useRef(false)

  // Transmission → content sequence on reveal
  useEffect(() => {
    if (!isRevealed) return
    setTransmitting(true)
    setContentReady(false)
    const t = setTimeout(() => {
      setTransmitting(false)
      setContentReady(true)
    }, 900)
    return () => clearTimeout(t)
  }, [isRevealed])

  const { displayed: descText, done: descDone } = useTypewriter(
    door.description,
    11,
    0,
    contentReady
  )

  const { displayed: whyText } = useTypewriter(
    door.why_it_works,
    10,
    descDone ? 200 : 99999,
    contentReady && descDone
  )

  const canChoose = isRevealed && !isAnyChosen

  // Touch / click handler with debounce guard
  const handleChoose = () => {
    if (!canChoose || choosingRef.current) return
    choosingRef.current = true
    onChoose(door)
  }

  const borderColor = isChosen
    ? config.glowColor
    : isRevealed
    ? `${config.glowColor}55`
    : '#1e1e1e'

  const boxShadow = isChosen
    ? `0 0 0 1px ${config.glowColor}, 0 0 32px ${config.glowColor}40, inset 0 0 40px ${config.glowColor}08`
    : isPressed && canChoose
    ? `0 0 0 1px ${config.glowColor}cc, 0 0 24px ${config.glowColor}50`
    : isRevealed && !isAnyChosen
    ? `0 0 0 1px ${config.glowColor}33, 0 0 12px ${config.glowColor}18`
    : `0 0 0 1px ${borderColor}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isAnyChosen && !isChosen ? 0.25 : 1, y: 0 }}
      transition={{
        opacity: { duration: 0.5 },
        y: { delay: index * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      <div
        onMouseDown={() => { if (canChoose) setIsPressed(true) }}
        onMouseUp={() => { setIsPressed(false); handleChoose() }}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={(e) => {
          e.preventDefault()
          if (canChoose) setIsPressed(true)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          setIsPressed(false)
          handleChoose()
        }}
        style={{
          position: 'relative',
          background: '#080808',
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          boxShadow,
          transition: 'box-shadow 0.3s ease, border-color 0.25s ease, transform 0.1s ease',
          transform: isPressed && canChoose ? 'scale(0.987)' : 'scale(1)',
          cursor: canChoose ? 'pointer' : 'default',
          overflow: 'hidden',
        }}
      >
        {/* ── Top status bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px 8px',
            borderBottom: `1px solid ${isRevealed ? `${config.glowColor}22` : '#111'}`,
            background: isRevealed ? `${config.glowColor}08` : 'transparent',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.18em',
              color: config.glowColor,
              opacity: 0.6,
            }}
          >
            {config.label.toUpperCase()} · DOOR {index + 1}
          </span>

          {!isRevealed && (
            <span style={{ fontSize: 18, color: config.glowColor, opacity: 0.5 }}>
              {CLOSED_GLYPHS[door.door_type]}
            </span>
          )}

          {isRevealed && transmitting && (
            <TransmissionIndicator color={config.glowColor} />
          )}

          {isRevealed && !transmitting && (
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: '0.12em',
                color: config.glowColor,
                opacity: 0.4,
              }}
            >
              ● LIVE
            </span>
          )}
        </div>

        {/* ── Closed state body ── */}
        {!isRevealed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 16px',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: '0.08em',
                color: '#2a2a2a',
              }}
            >
              {DOOR_LABELS[door.door_type]}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.18em',
                color: config.glowColor,
                opacity: 0.3,
              }}
            >
              LOCKED
            </span>
          </div>
        )}

        {/* ── Transmitting state ── */}
        <AnimatePresence>
          {isRevealed && transmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '20px 16px', minHeight: 80 }}
            >
              <div
                style={{
                  height: 2,
                  background: `linear-gradient(90deg, ${config.glowColor}00, ${config.glowColor}, ${config.glowColor}00)`,
                  borderRadius: 1,
                  animation: 'scanline 0.9s ease-in-out infinite',
                  marginBottom: 12,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[80, 60, 40].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 2,
                      width: `${w}%`,
                      background: '#1a1a1a',
                      borderRadius: 1,
                      animation: `shimmer 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Revealed content ── */}
        <AnimatePresence>
          {isRevealed && contentReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ padding: '16px 16px 0' }}
            >
              {/* Title */}
              <h3
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginBottom: 10,
                }}
              >
                {door.title}
              </h3>

              {/* Description — typewriter */}
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: '#777',
                  marginBottom: 12,
                  minHeight: '3.4em',
                }}
              >
                {descText}
                {!descDone && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 2,
                      height: '1em',
                      background: config.glowColor,
                      marginLeft: 2,
                      verticalAlign: 'middle',
                      animation: 'cursorBlink 0.6s step-end infinite',
                    }}
                  />
                )}
              </p>

              {/* Why it works — appears after description types out */}
              <AnimatePresence>
                {descDone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      borderLeft: `2px solid ${config.glowColor}55`,
                      paddingLeft: 12,
                      paddingTop: 2,
                      paddingBottom: 2,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 8,
                        letterSpacing: '0.16em',
                        color: `${config.glowColor}88`,
                        marginBottom: 5,
                      }}
                    >
                      WHY IT WORKS
                    </div>
                    <p
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        lineHeight: 1.6,
                        color: config.glowColor,
                        minHeight: '2em',
                      }}
                    >
                      {whyText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA button */}
              <AnimatePresence>
                {!isAnyChosen && descDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    style={{ paddingBottom: 16 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase' as const,
                        padding: '12px 0',
                        borderRadius: 4,
                        textAlign: 'center' as const,
                        background: isPressed ? config.glowColor : `${config.glowColor}14`,
                        color: isPressed ? '#000' : config.glowColor,
                        border: `1px solid ${config.glowColor}44`,
                        transition: 'background 0.15s ease, color 0.15s ease',
                        userSelect: 'none' as const,
                      }}
                    >
                      ENTER THIS DOOR →
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chosen badge */}
              <AnimatePresence>
                {isChosen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ paddingBottom: 16 }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase' as const,
                        padding: '5px 10px',
                        borderRadius: 3,
                        background: config.glowColor,
                        color: '#000',
                      }}
                    >
                      YOUR CHOICE
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
