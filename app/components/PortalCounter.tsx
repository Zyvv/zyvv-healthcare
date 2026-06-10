// ============================================================
// ZYVV — PortalCounter Component
// File: app/components/PortalCounter.tsx
// ============================================================
// Displays the live count of situations submitted to ZYVV.
// Reads from the portal_count view in Supabase (anon-readable).
//
// Behavior:
//   - Fetches count on mount via getPortalCount()
//   - Animates the number up from 0 using requestAnimationFrame
//   - Refreshes every 60s passively in the background
//   - Silent fail — if Supabase is down, component just hides
//
// Used in: app/page.tsx (footer of input phase)
// ============================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { getPortalCount } from '@/lib/supabase'

// ── Animation config ──────────────────────────────────────────
const COUNT_DURATION_MS = 1800   // total time for number to count up
const REFRESH_INTERVAL_MS = 60_000  // re-fetch every 60s
const MOUNT_DELAY_MS = 600       // wait for page entrance before counting

// ── Easing ────────────────────────────────────────────────────
// Ease-out cubic — fast start, slows to final number
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// ── Format ────────────────────────────────────────────────────
// Adds commas: 12345 → "12,345"
function formatCount(n: number): string {
  return Math.floor(n).toLocaleString('en-US')
}

// ── Animation variants ────────────────────────────────────────
const wrapperVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

// ── Component ─────────────────────────────────────────────────

export default function PortalCounter() {
  const [targetCount, setTargetCount] = useState<number | null>(null)
  const [displayCount, setDisplayCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  // ── Fetch count ────────────────────────────────────────────

  async function fetchCount() {
    try {
      const total = await getPortalCount()
      if (total > 0) setTargetCount(total)
    } catch {
      // Silent fail — counter is cosmetic
    }
  }

  // Mount fetch + periodic refresh
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // ── Animate number up when targetCount changes ─────────────

  useEffect(() => {
    if (targetCount === null) return

    const delay = setTimeout(() => {
      startValueRef.current = displayCount
      startTimeRef.current = null

      function tick(timestamp: number) {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / COUNT_DURATION_MS, 1)
        const eased = easeOutCubic(progress)
        const current = startValueRef.current + (targetCount - startValueRef.current) * eased

        setDisplayCount(current)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDisplayCount(targetCount)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, MOUNT_DELAY_MS)

    return () => {
      clearTimeout(delay)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCount])

  // ── Nothing to show ────────────────────────────────────────
  if (targetCount === null || targetCount === 0) return null

  // ── Render ─────────────────────────────────────────────────

  return (
    <motion.div
      variants={wrapperVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-2"
      aria-label={`${formatCount(targetCount)} portals opened`}
    >
      {/* Pulse dot */}
      <span
        className="relative flex h-[6px] w-[6px]"
        aria-hidden="true"
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{
            background: '#00F5FF',
            animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
        <span
          className="relative inline-flex rounded-full h-[6px] w-[6px]"
          style={{ background: '#00F5FF' }}
        />
      </span>

      {/* Count + label */}
      <span
        className="font-mono text-[11px] tracking-[0.12em]"
        style={{ color: '#444' }}
      >
        <span style={{ color: '#00F5FF', fontWeight: 700 }}>
          {formatCount(displayCount)}
        </span>
        {' '}PORTALS OPENED
              BE THE NEXT ONE.
      </span>

      {/* Keyframe for ping — inlined since we can't guarantee globals.css ping exists */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  )
}
