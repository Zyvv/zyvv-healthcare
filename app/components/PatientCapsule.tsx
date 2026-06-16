'use client'

import { useState } from 'react'
import { CHRONOS_GATE_MS, LOADING_LINES } from '@/core/chronosGate'
import type { DiagnosticView, VitalReading } from '@/app/types/health'

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function PatientCapsule() {
  const [phase, setPhase] = useState<'input' | 'gate' | 'view' | 'error'>('input')
  const [rawIdentity, setRawIdentity] = useState('')
  const [vitals, setVitals] = useState<VitalReading[]>([])
  const [view, setView] = useState<DiagnosticView | null>(null)
  const [loadingLine, setLoadingLine] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(10)

  async function handleSubmit() {
    if (!rawIdentity.trim()) return
    setPhase('gate')
    setError('')

    const sessionId = generateSessionId()
    let t = 10
    setCountdown(t)
    setLoadingLine(LOADING_LINES[0])

    const interval = setInterval(() => {
      t -= 1
      setCountdown(t)
      setLoadingLine(LOADING_LINES[Math.floor((10 - t) % LOADING_LINES.length)])
      if (t <= 0) clearInterval(interval)
    }, 1000)

    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawIdentity, vitals, sessionId }),
      })
      const data = await res.json()
      clearInterval(interval)

      if (!data.ok) {
        setError(data.error ?? 'Protocol failure')
        setPhase('error')
        return
      }

      setView(data.data)
      setPhase('view')
    } catch {
      clearInterval(interval)
      setError('Connection failure')
      setPhase('error')
    }
  }

  function handleReset() {
    setPhase('input')
    setRawIdentity('')
    setVitals([])
    setView(null)
    setError('')
    setCountdown(10)
  }

  return (
    <div style={{ fontFamily: 'monospace', color: '#fff', maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>

      {phase === 'input' && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#333', marginBottom: 32 }}>
            SOVEREIGN HEALTH CAPSULE · PROTOCOL ACTIVE
          </div>
          <div style={{ fontSize: 'clamp(40px,12vw,72px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24 }}>
            ZYVV<br />HEALTH
          </div>
          <p style={{ fontSize: 11, color: '#444', lineHeight: 1.7, marginBottom: 24 }}>
            Your biological signal. Never pooled. Never averaged.<br />
            Processed locally. Evaporated on close.
          </p>
          <input
            type="password"
            placeholder="Enter patient identifier"
            value={rawIdentity}
            onChange={e => setRawIdentity(e.target.value)}
            style={{
              width: '100%', background: 'rgba(6,6,8,0.92)', border: '1px solid #1e1e1e',
              color: '#fff', fontFamily: 'monospace', fontSize: 13, padding: '14px 16px',
              boxSizing: 'border-box', outline: 'none', marginBottom: 12,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!rawIdentity.trim()}
            style={{
              width: '100%', background: rawIdentity.trim() ? 'linear-gradient(135deg,#00F5FF,#0088aa)' : '#0a0a0a',
              color: rawIdentity.trim() ? '#000' : '#333', fontFamily: 'monospace',
              fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', padding: '20px 0',
              border: 'none', cursor: rawIdentity.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            OPEN CAPSULE
          </button>
        </div>
      )}

      {phase === 'gate' && (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#00F5FF', marginBottom: 16 }}>
            {countdown}
          </div>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.1em', lineHeight: 1.8 }}>
            {loadingLine}
          </div>
        </div>
      )}

      {phase === 'view' && view && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#00F5FF', marginBottom: 24 }}>
            CAPSULE ACTIVE · EVAPORATES ON CLOSE
          </div>
          <div style={{ fontSize: 11, color: '#333', marginBottom: 8 }}>SIGNAL COUNT</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>{view.signalCount}</div>
          <div style={{ fontSize: 11, color: '#333', marginBottom: 8 }}>TREND</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#00F5FF', marginBottom: 32 }}>
            {view.trend.toUpperCase().replace('_', ' ')}
          </div>
          <button onClick={handleReset} style={{
            background: 'transparent', border: '1px solid #1e1e1e', color: '#333',
            fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.14em',
            padding: '14px 0', width: '100%', cursor: 'pointer',
          }}>
            CLOSE CAPSULE
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ color: '#FF2D55', fontSize: 11, marginBottom: 16 }}>{error}</div>
          <button onClick={handleReset} style={{
            background: 'transparent', border: '1px solid #333', color: '#333',
            fontFamily: 'monospace', fontSize: 11, padding: '12px 24px', cursor: 'pointer',
          }}>RETRY</button>
        </div>
      )}

    </div>
  )
}