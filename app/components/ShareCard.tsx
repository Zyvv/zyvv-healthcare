// ============================================================
// ZYVV — ShareCard Component
// File: app/components/ShareCard.tsx
// ============================================================
// Shown after a user picks a door (phase: share).
// Three sections:
//   1. Chosen door recap
//   2. Email opt-in — sends full reading via /api/email
//   3. Copy shareable text
//   4. 30-DAY OUTCOME PING — closes the Talmudic loop
//      Posts to /api/outcome → saved to Supabase outcomes table
//      This is the data moat: what actually happened after the door.
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
  choiceId?: number | null   // passed from page.tsx after /api/save returns it
  onDone: () => void
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

// ── Outcome score labels ──────────────────────────────────────

const SCORE_LABELS: Record<number, string> = {
  1: 'Didn\'t work',
  2: 'Barely moved',
  3: 'Some progress',
  4: 'Worked well',
  5: 'Changed everything',
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
    `The mirror: "${roast}"`,
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
  choiceId,
  onDone,
}: ShareCardProps) {
  const config = DOOR_CONFIGS[chosenDoor.door_type]

  // Email
  const [email, setEmail]               = useState('')
  const [emailSent, setEmailSent]       = useState(false)
  const [emailError, setEmailError]     = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Copy
  const [copied, setCopied] = useState(false)

  // Outcome ping
  const [outcomeScore, setOutcomeScore]   = useState<number | null>(null)
  const [outcomeText, setOutcomeText]     = useState('')
  const [outcomeSent, setOutcomeSent]     = useState(false)
  const [outcomeLoading, setOutcomeLoading] = useState(false)
  const [outcomeError, setOutcomeError]   = useState('')
  const [showOutcomeText, setShowOutcomeText] = useState(false)

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

  // ── Copy ───────────────────────────────────────────────────

  async function handleCopy() {
    const text = buildShareText(situation, roast, chosenDoor)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
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

  // ── Submit outcome ─────────────────────────────────────────

  async function handleOutcomeSubmit() {
    if (!outcomeScore || !choiceId) return
    setOutcomeLoading(true)
    setOutcomeError('')

    try {
      const res = await fetch('/api/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choice_id: choiceId,
          outcome_score: outcomeScore,
          outcome_text: outcomeText.trim() || undefined,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'Failed to save outcome.')

      setOutcomeSent(true)
    } catch (err: unknown) {
      setOutcomeError(
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setOutcomeLoading(false)
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

      {/* ── Email ──────────────────────────────────────────── */}
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
                  onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSubmit() }}
                  placeholder="your@email.com"
                  className="flex-1 font-mono text-[13px] px-4 py-3 rounded-sm"
                  style={{
                    background: '#0d0d0d',
                    border: `1px solid ${emailError ? '#FF2D55' : '#2a2a2a'}`,
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = config.glowColor }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = emailError ? '#FF2D55' : '#2a2a2a' }}
                  disabled={emailLoading}
                  autoComplete="email"
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={emailLoading || !email.trim()}
                  className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase px-5 py-3 rounded-sm"
                  style={{
                    background: emailLoading || !email.trim() ? '#1a1a1a' : config.glowColor,
                    color: emailLoading || !email.trim() ? '#444' : '#000',
                    border: 'none',
                    cursor: emailLoading || !email.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {emailLoading ? '...' : 'SEND'}
                </button>
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    variants={feedbackVariants}
                    initial="hidden" animate="visible" exit="exit"
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

      {/* ── Copy ───────────────────────────────────────────── */}
      <div className="mb-8">
        <div
          className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
          style={{ color: '#555' }}
        >
          SHARE YOUR READING
        </div>
        <button
          onClick={handleCopy}
          className="w-full font-mono text-[11px] font-bold tracking-[0.14em] uppercase py-3 rounded-sm"
          style={{
            background: 'transparent',
            border: `1px solid ${copied ? `${config.glowColor}60` : '#2a2a2a'}`,
            color: copied ? config.glowColor : '#555',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY READING'}
        </button>
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="h-px mb-6" style={{ background: '#1a1a1a' }} />

      {/* ── 30-DAY OUTCOME PING ────────────────────────────── */}
      {choiceId && (
        <div className="mb-8">
          <div
            className="font-mono text-[9px] font-black tracking-[0.22em] uppercase mb-1"
            style={{ color: '#BF5AF2' }}
          >
            30-DAY PING
          </div>
          <p
            className="font-mono text-[10px] leading-[1.6] mb-4"
            style={{ color: '#444' }}
          >
            Did it work? One answer closes the loop.
          </p>

          <AnimatePresence mode="wait">
            {outcomeSent ? (
              <motion.div
                key="outcome-sent"
                variants={feedbackVariants}
                initial="hidden" animate="visible" exit="exit"
                className="font-mono text-[11px] tracking-[0.06em]"
                style={{ color: '#BF5AF2' }}
              >
                ✓ Logged. The void remembers.
              </motion.div>
            ) : (
              <motion.div key="outcome-form" initial={false}>

                {/* Score buttons 1–5 */}
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => {
                        setOutcomeScore(score)
                        setShowOutcomeText(true)
                      }}
                      className="flex-1 font-mono text-[11px] font-bold py-3 rounded-sm"
                      style={{
                        background: outcomeScore === score
                          ? config.glowColor
                          : '#0d0d0d',
                        color: outcomeScore === score ? '#000' : '#444',
                        border: `1px solid ${outcomeScore === score ? config.glowColor : '#1e1e1e'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>

                {/* Score label */}
                <AnimatePresence>
                  {outcomeScore && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-[10px] tracking-[0.1em] uppercase mb-3"
                      style={{ color: config.glowColor }}
                    >
                      {SCORE_LABELS[outcomeScore]}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Optional text */}
                <AnimatePresence>
                  {showOutcomeText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <textarea
                        value={outcomeText}
                        onChange={(e) => setOutcomeText(e.target.value)}
                        placeholder="What actually happened? (optional)"
                        rows={2}
                        className="w-full font-mono text-[12px] leading-[1.6] px-4 py-3 rounded-sm mb-3"
                        style={{
                          background: '#0d0d0d',
                          border: '1px solid #1e1e1e',
                          color: '#fff',
                          outline: 'none',
                          resize: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#BF5AF2' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e1e' }}
                      />

                      <button
                        onClick={handleOutcomeSubmit}
                        disabled={outcomeLoading || !outcomeScore}
                        className="w-full font-mono text-[10px] font-black tracking-[0.18em] uppercase py-3 rounded-sm"
                        style={{
                          background: outcomeLoading
                            ? '#1a1a1a'
                            : 'linear-gradient(135deg, #BF5AF2 0%, #7a22cc 100%)',
                          color: outcomeLoading ? '#444' : '#000',
                          border: 'none',
                          cursor: outcomeLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: outcomeLoading ? 'none' : '0 0 20px rgba(191,90,242,0.2)',
                        }}
                      >
                        {outcomeLoading ? '...' : 'LOG OUTCOME'}
                      </button>

                      <AnimatePresence>
                        {outcomeError && (
                          <motion.p
                            variants={feedbackVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="font-mono text-[10px] mt-2 tracking-[0.06em]"
                            style={{ color: '#FF2D55' }}
                          >
                            {outcomeError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="h-px mb-6" style={{ background: '#1a1a1a' }} />

      {/* ── Start over ─────────────────────────────────────── */}
      <div className="flex justify-center">
        <button
          onClick={onDone}
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: '#333', transition: 'color 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#666' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#333' }}
        >
          OPEN ANOTHER DOOR →
        </button>
      </div>

    </motion.div>
  )
}
