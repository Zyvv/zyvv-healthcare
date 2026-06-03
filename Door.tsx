// ============================================================
// ZYVV — Door Component
// File: app/components/Door.tsx
// ============================================================
// Renders a single door in two states:
//   - closed:   door number + type label, locked glyph, muted border
//   - revealed: full content with animated entrance
//   - chosen:   neon glow accent, "YOUR CHOICE" badge, why_it_works visible
//
// All three door types use this one component via DOOR_CONFIGS.
// Framer Motion drives the reveal and the chosen glow.
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { DOOR_CONFIGS } from '@/lib/types'
import type { Door, DoorType } from '@/lib/types'

// ── Props ─────────────────────────────────────────────────────

interface DoorProps {
  door: Door
  index: number           // 0 | 1 | 2 — controls stagger delay
  isRevealed: boolean     // true after roast phase completes
  isChosen: boolean       // true after user picks this door
  isAnyChosen: boolean    // true after user picks *any* door
  onChoose: (door: Door) => void
}

// ── Animation variants ────────────────────────────────────────

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

// ── Glyph map ─────────────────────────────────────────────────
// Closed door shows a unique symbol per type.

const CLOSED_GLYPHS: Record<DoorType, string> = {
  conventional: '◈',
  contrarian:   '◉',
  alien:        '⬡',
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
  const [isHovered, setIsHovered] = useState(false)

  // Tailwind class names derived from config
  // We use inline style for the dynamic glow since Tailwind purges dynamic classes

  const glowStyle = isChosen
    ? { boxShadow: `0 0 40px ${config.glowColor}40, 0 0 80px ${config.glowColor}18, inset 0 0 40px ${config.glowColor}08` }
    : isHovered && isRevealed && !isAnyChosen
    ? { boxShadow: `0 0 20px ${config.glowColor}28` }
    : {}

  const borderStyle = isChosen
    ? { borderColor: config.glowColor }
    : isRevealed && !isAnyChosen
    ? { borderColor: isHovered ? `${config.glowColor}80` : '#222222' }
    : { borderColor: '#1a1a1a' }

  // Dimmed when another door is chosen
  const opacity = isAnyChosen && !isChosen ? 0.35 : 1

  return (
    <motion.div
      custom={index}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ opacity }}
      className="transition-opacity duration-500"
    >
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => {
          if (isRevealed && !isAnyChosen) onChoose(door)
        }}
        style={{
          ...glowStyle,
          ...borderStyle,
          transition: 'box-shadow 0.4s ease, border-color 0.3s ease',
        }}
        className={[
          'relative border rounded-sm',
          'bg-[#080808]',
          'transition-all duration-300',
          isRevealed && !isAnyChosen ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        {/* ── Closed state ─────────────────────────────────── */}
        {!isRevealed && (
          <div className="px-6 py-6 flex items-center justify-between">
            {/* Left: door number */}
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase"
              style={{ color: '#333' }}
            >
              DOOR {index + 1}
            </span>

            {/* Center: type label */}
            <span
              className="font-mono text-[10px] tracking-[0.12em] uppercase"
              style={{ color: '#2a2a2a' }}
            >
              {door.door_type}
            </span>

            {/* Right: locked glyph */}
            <span style={{ color: '#2a2a2a', fontSize: 16 }}>
              {CLOSED_GLYPHS[door.door_type]}
            </span>
          </div>
        )}

        {/* ── Revealed state ────────────────────────────────── */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="px-6 pt-5 pb-6 overflow-hidden"
            >
              {/* Type label */}
              <div
                className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
                style={{ color: config.glowColor }}
              >
                {config.label.toUpperCase()}
              </div>

              {/* Title */}
              <h3
                className="font-serif text-[22px] font-bold leading-[1.1] tracking-tight text-white mb-3"
                style={{ letterSpacing: '-0.02em' }}
              >
                {door.title}
              </h3>

              {/* Description */}
              <p
                className="text-[15px] leading-[1.65] mb-4"
                style={{ color: '#888', fontFamily: 'Georgia, serif' }}
              >
                {door.description}
              </p>

              {/* Why it works — only on chosen door */}
              <AnimatePresence>
                {isChosen && (
                  <motion.div
                    variants={whyVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div
                      className="border-l-2 pl-4 py-0.5"
                      style={{ borderColor: config.glowColor }}
                    >
                      <div
                        className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2"
                        style={{ color: `${config.glowColor}aa` }}
                      >
                        WHY IT WORKS
                      </div>
                      <p
                        className="font-mono text-[12px] leading-[1.65]"
                        style={{ color: config.glowColor }}
                      >
                        {door.why_it_works}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Choose CTA — visible only before any choice is made */}
              <AnimatePresence>
                {!isAnyChosen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 font-mono text-[10px] tracking-[0.14em] uppercase"
                    style={{ color: config.glowColor }}
                  >
                    ENTER THIS DOOR →
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
                    className="mt-5"
                  >
                    <span
                      className="inline-block font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-[2px]"
                      style={{
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
      </motion.div>
    </motion.div>
  )
}
