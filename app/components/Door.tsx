// ============================================================
// ZYVV — Door Component
// File: app/components/Door.tsx
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
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

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.18,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

const contentVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const whyVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const ctaVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.35,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

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

export default function Door({
  door,
  index,
  isRevealed,
  isChosen,
  isAnyChosen,
  onChoose,
}: DoorProps) {
  const config = DOOR_CONFIGS[door.door_type]
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const canChoose = isRevealed && !isAnyChosen

  const glowStyle = isChosen
    ? { boxShadow: `0 0 40px ${config.glowColor}40, 0 0 80px ${config.glowColor}18, inset 0 0 40px ${config.glowColor}08` }
    : isPressed && canChoose
    ? { boxShadow: `0 0 50px ${config.glowColor}60` }
    : isHovered && canChoose
    ? { boxShadow: `0 0 28px ${config.glowColor}35` }
    : {}

  const borderStyle = isChosen
    ? { borderColor: config.glowColor }
    : isRevealed && canChoose
    ? { borderColor: isHovered || isPressed ? `${config.glowColor}90` : `${config.glowColor}35` }
    : isRevealed
    ? { borderColor: `${config.glowColor}35` }
    : { borderColor: '#1a1a1a' }

  const opacity = isAnyChosen && !isChosen ? 0.3 : 1
  const scale = isPressed && canChoose ? 0.985 : 1

  return (
    <motion.div
      custom={index}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ opacity, transition: 'opacity 0.5s ease' }}
      data-door-index={index}
    >
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => { setIsHovered(false); setIsPressed(false) }}
        onMouseDown={() => { if (canChoose) setIsPressed(true) }}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => { if (canChoose) setIsPressed(true) }}
        onTouchEnd={() => {
          setIsPressed(false)
          if (canChoose) onChoose(door)
        }}
        onClick={() => {
          if (canChoose) onChoose(door)
        }}
        style={{
          ...glowStyle,
          ...borderStyle,
          transform: `scale(${scale})`,
          transition: 'box-shadow 0.3s ease, border-color 0.25s ease, transform 0.12s ease',
        }}
        className={[
          'relative border rounded-sm',
          'bg-[#080808]',
          canChoose ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >

        {/* ── CLOSED STATE ── */}
        {!isRevealed && (
          <div className="px-5 py-5 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span
                className="font-mono text-[9px] font-black tracking-[0.18em] uppercase"
                style={{ color: config.glowColor, opacity: 0.5 }}
              >
                DOOR {index + 1}
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.08em]"
                style={{ color: '#2a2a2a' }}
              >
                {DOOR_LABELS[door.door_type]}
              </span>
            </div>

            <span style={{ fontSize: 24, color: config.glowColor, opacity: 0.6 }}>
              {CLOSED_GLYPHS[door.door_type]}
            </span>

            <span
              className="font-mono text-[9px] font-black tracking-[0.18em] uppercase"
              style={{ color: config.glowColor, opacity: 0.3 }}
            >
              LOCKED
            </span>
          </div>
        )}

        {/* ── REVEALED STATE ── */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="px-5 pt-5 pb-5 overflow-hidden"
            >
              {/* Door number + type label row */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase"
                  style={{ color: config.glowColor }}
                >
                  {config.label.toUpperCase()}
                </div>
                <span
                  className="font-mono text-[9px] tracking-[0.12em] uppercase"
                  style={{ color: config.glowColor, opacity: 0.4 }}
                >
                  DOOR {index + 1}
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-serif text-[20px] font-bold leading-[1.1] tracking-tight text-white mb-3"
                style={{ letterSpacing: '-0.02em' }}
              >
                {door.title}
              </h3>

              {/* Description */}
              <p
                className="text-[14px] leading-[1.65] mb-4"
                style={{ color: '#888', fontFamily: 'Georgia, serif' }}
              >
                {door.description}
              </p>

              {/* Why it works */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.div variants={whyVariants} initial="hidden" animate="visible">
                    <div
                      className="border-l-2 pl-4 py-0.5 mb-4"
                      style={{ borderColor: config.glowColor }}
                    >
                      <div
                        className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2"
                        style={{ color: `${config.glowColor}aa` }}
                      >
                        WHY IT WORKS
                      </div>
                      <p
                        className="font-mono text-[11px] leading-[1.65]"
                        style={{ color: config.glowColor }}
                      >
                        {door.why_it_works}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── PRIMARY TAP CTA — always visible on reveal, not hover-gated ── */}
              <AnimatePresence>
                {!isAnyChosen && (
                  <motion.div
                    variants={ctaVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    <div
                      className="w-full font-mono text-[11px] font-black tracking-[0.18em] uppercase py-3 rounded-[2px] text-center"
                      style={{
                        background: isPressed
                          ? config.glowColor
                          : isHovered
                          ? `${config.glowColor}22`
                          : `${config.glowColor}12`,
                        color: isPressed ? '#000' : config.glowColor,
                        border: `1px solid ${config.glowColor}50`,
                        transition: 'background 0.2s ease, color 0.2s ease',
                        userSelect: 'none',
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
                    className="mt-4"
                  >
                    <span
                      className="inline-block font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-[2px]"
                      style={{ background: config.glowColor, color: '#000' }}
                    >
                      YOUR CHOICE
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
