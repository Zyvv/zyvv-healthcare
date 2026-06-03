// ============================================================
// ZYVV — ShareCard Component
// File: app/components/ShareCard.tsx
// ============================================================
// Shown after a user picks a door (phase: 'chosen' → 'share').
// Two actions:
//   1. Email opt-in — sends full reading via /api/email
//   2. Copy shareable text — plain-text summary for pasting anywhere
//
// Design: minimal card, chosen door accent color bleeds through.
// No social SDK dependencies — just the Web Share API + clipboard.
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DOOR_CONFIGS } from '@/lib/types'
import type { Door, EmailRequest } from '@/lib/types'

// ── Props ─────────────────────────────────────────────────────

interface ShareCardProps {
  situation: string
  roast: string
  doors: Door[]
  chosenDoor: Door
  onDone: () => void   // resets app back to input phase
}

// ── Animation variants ────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

const feedbackVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit:   { opacity: 0,        transition: { duration: 0.2  } },
}

// ── Helpers ───────────────────────────────────────────────────

function buildShareText(
  situation: string,
  roast: string,
  chosenDoor: Door
): string {
  return [
    'ZYVV gave me three doors.',
    '',
    `My situation: ${situation}`,
    '',
    `The roast: "${roast}"`,
    '',
    `I chose: ${chosenDoor.title}`,
    `${chosenDoor.description}`,
    '',
    'Try yours → zyvv.app',
  ].join('\n')
}

// ── Component ─────────────────────────────────────────────────

export default function ShareCard({
  situation,
  roast,
  doors,
  chosenDoor,
  onDone,
}: ShareCardProps) {
  const config = DOOR_CONFIGS[chosenDoor.door_type]

  // Email form state
  const [email, setEmail]           = useState('')
  const [emailSent, setEmailSent]   = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Copy state
  const [copied, setCopied] = useState(false)

  // ── Send email ─────────────────────────────────────────────

  async function handleEmailSubmit() {
    const trimmed = email.trim()
    if (!trimmed) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmailLoading(true)
    setEmailError('')

    const payload: EmailRequest = {
      email: trimmed,
      situation,
      roast,
      doors,
      chosen_door: chosenDoor,
    }

    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Email failed.')
      }

      setEmailSent(true)
    } catch (err: unknown) {
      setEmailError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
    } finally {
      setEmailLoading(false)
    }
  }

  // ── Copy to clipboard ──────────────────────────────────────

  async function handleCopy() {
    const text = buildShareText(situation, roast, chosenDoor)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback: select a hidden textarea
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* ── Chosen door recap ──────────────────────────────── */}
      <div
        className="border rounded-sm px-6 py-5 mb-6"
        style={{
          background: '#080808',
          borderColor: `${config.glowColor}40`,
          boxShadow: `0 0 32px ${config.glowColor}12`,
        }}
      >
        <div
          className="font-mono text-[9px] font-bold tracking-[0.16em] uppercase mb-2"
          style={{ color: `${config.glowColor}99` }}
        >
          YOUR DOOR
        </div>
        <div
          className="font-serif text-[18px] font-bold leading-[1.15] text-white mb-1"
          style={{ letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }}
        >
          {chosenDoor.title}
        </div>
        <div
          className="font-mono text-[10px] tracking-[0.1em] uppercase"
          style={{ color: config.glowColor }}
        >
          {config.label}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="h-px mb-6" style={{ background: '#1a1a1a' }} />

      {/* ── Email section ──────────────────────────────────── */}
      <div className="mb-6">
        <div
          className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
          style={{ color: '#555' }}
        >
          SEND TO YOUR INBOX
        </div>

        <AnimatePresence mode="wait">
          {emailSent ? (
            <motion.div
              key="sent"
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="font-mono text-[12px] tracking-[0.06em]"
              style={{ color: config.glowColor }}
            >
              ✓ Reading sent. Check your inbox.
            </motion.div>
          ) : (
            <motion.div key="form" initial={false}>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEmailSubmit()
                  }}
                  placeholder="your@email.com"
                  className="flex-1 font-mono text-[13px] px-4 py-3 rounded-sm"
                  style={{
                    background: '#0d0d0d',
                    border: `1px solid ${emailError ? '#FF2D55' : '#2a2a2a'}`,
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = config.glowColor
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = emailError ? '#FF2D55' : '#2a2a2a'
                  }}
                  disabled={emailLoading}
                  autoComplete="email"
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={emailLoading || !email.trim()}
                  className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase px-5 py-3 rounded-sm transition-all duration-200"
                  style={{
                    background: emailLoading || !email.trim()
                      ? '#1a1a1a'
                      : config.glowColor,
                    color: emailLoading || !email.trim() ? '#444' : '#000',
                    border: 'none',
                    cursor: emailLoading || !email.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {emailLoading ? '...' : 'SEND'}
                </button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    variants={feedbackVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="font-mono text-[10px] mt-2 tracking-[0.06em]"
                    style={{ color: '#FF2D55' }}
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Copy section ───────────────────────────────────── */}
      <div className="mb-8">
        <div
          className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
          style={{ color: '#555' }}
        >
          SHARE YOUR READING
        </div>
        <button
          onClick={handleCopy}
          className="w-full font-mono text-[11px] font-bold tracking-[0.14em] uppercase py-3 rounded-sm transition-all duration-200"
          style={{
            background: 'transparent',
            border: '1px solid #2a2a2a',
            color: copied ? config.glowColor : '#555',
            borderColor: copied ? `${config.glowColor}60` : '#2a2a2a',
          }}
        >
          {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY READING'}
        </button>
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="h-px mb-6" style={{ background: '#1a1a1a' }} />

      {/* ── Start over ─────────────────────────────────────── */}
      <div className="flex justify-center">
        <button
          onClick={onDone}
          className="font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-200"
          style={{ color: '#333' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#666' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#333' }}
        >
          OPEN ANOTHER DOOR →
        </button>
      </div>
    </motion.div>
  )
}
