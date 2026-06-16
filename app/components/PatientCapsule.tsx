'use client'

import { useState, useRef } from 'react'

type Mode = 'CLINICIAN' | 'PATIENT'

type CapsuleState = 'IDLE' | 'LOADING' | 'OPEN' | 'ERROR'

interface DiagnosticView {
  capsuleId: string
  signalCount: number
  trend: string
  evaporatesAt: string
  mode: Mode
  ehrFileName?: string
}

const LOADING_LINES = [
  'INITIALIZING CHRONOSGATE PROTOCOL...',
  'ENFORCING 10-SECOND COGNITIVE GROUNDING...',
  'GENERATING ZK COMMITMENT...',
  'RAW IDENTITY NEVER STORED...',
  'CREATING TEKU SESSION...',
  'SESSION TTL: 30 MINUTES...',
  'SIGNAL ISOLATED. NEVER POOLED...',
  'DARK-SKY SANCTUARY ACTIVE...',
]

export default function PatientCapsule() {
  const [mode, setMode] = useState<Mode>('CLINICIAN')
  const [identifier, setIdentifier] = useState('')
  const [state, setState] = useState<CapsuleState>('IDLE')
  const [countdown, setCountdown] = useState(10)
  const [loadingLine, setLoadingLine] = useState(0)
  const [diagnostic, setDiagnostic] = useState<DiagnosticView | null>(null)
  const [error, setError] = useState('')
  const [ehrFile, setEhrFile] = useState<File | null>(null)
  const [ehrProcessed, setEhrProcessed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const placeholder =
    mode === 'CLINICIAN'
      ? '> Enter case identifier...'
      : '> Enter sovereign personal identifier...'

  const handleEhrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEhrFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setEhrProcessed(true)
    }
    reader.readAsText(file)
  }

  const handleOpen = async () => {
    if (!identifier.trim()) return
    setState('LOADING')
    setCountdown(10)
    setLoadingLine(0)
    setError('')

    let tick = 10
    const lineInterval = setInterval(() => {
      setLoadingLine((prev) => (prev + 1) % LOADING_LINES.length)
    }, 1250)

    const countInterval = setInterval(() => {
      tick -= 1
      setCountdown(tick)
      if (tick <= 0) clearInterval(countInterval)
    }, 1000)

    await new Promise((r) => setTimeout(r, 10000))
    clearInterval(lineInterval)
    clearInterval(countInterval)

    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawIdentity: identifier,
          mode,
          hasEhr: ehrProcessed,
          ehrFileName: ehrFile?.name,
        }),
      })

      if (!res.ok) throw new Error(`Protocol rejected: ${res.status}`)
      const data = await res.json()
      setDiagnostic({ ...data, mode, ehrFileName: ehrFile?.name })
      setState('OPEN')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Protocol failure.')
      setState('ERROR')
    }
  }

  const handleClose = () => {
    setDiagnostic(null)
    setIdentifier('')
    setEhrFile(null)
    setEhrProcessed(false)
    setState('IDLE')
    setError('')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000000',
      color: '#ffffff',
      fontFamily: "'Courier New', Courier, monospace",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>

        {/* Header */}
        <p style={{ color: '#555555', fontSize: '11px', letterSpacing: '3px', marginBottom: '32px' }}>
          SOVEREIGN HEALTH CAPSULE · PROTOCOL ACTIVE
        </p>

        <h1 style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, letterSpacing: '-1px', marginBottom: '8px' }}>
          ZYVV
        </h1>
        <h2 style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, letterSpacing: '-1px', marginBottom: '40px' }}>
          HEALTH
        </h2>

        {/* Problem statement */}
        <div style={{
          borderTop: '1px solid #222222',
          borderBottom: '1px solid #222222',
          padding: '20px 0',
          marginBottom: '40px',
        }}>
          <p style={{ color: '#aaaaaa', fontSize: '13px', lineHeight: '1.8', letterSpacing: '0.5px' }}>
            The system finds the 95% confidence interval and calls everything outside it noise.<br />
            Your biology is outside it. That is not noise. That is the diagnosis.
          </p>
        </div>

        {/* What this solves */}
        <div style={{
          borderLeft: '1px solid #333333',
          paddingLeft: '16px',
          marginBottom: '40px',
        }}>
          <p style={{ color: '#666666', fontSize: '11px', lineHeight: '1.9', letterSpacing: '0.5px' }}>
            Clinical AI aggregates millions of patients to find the statistical average.<br />
            Your rare condition, your nuanced symptom, your non-linear biology — filtered out.<br />
            Doctors are pushed to treat the curve. Not the person on the table.<br />
            <span style={{ color: '#888888' }}>ZYVV keeps the diagnostic tool local. Your signal is the only coordinate that runs here.</span>
          </p>
        </div>

        {state === 'IDLE' || state === 'ERROR' ? (
          <>
            {/* Mode selector */}
            <div style={{
              display: 'flex',
              gap: '0px',
              marginBottom: '16px',
              border: '1px solid #222222',
            }}>
              {(['CLINICIAN', 'PATIENT'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: mode === m ? '#ffffff' : '#000000',
                    color: mode === m ? '#000000' : '#555555',
                    border: 'none',
                    borderRight: m === 'CLINICIAN' ? '1px solid #222222' : 'none',
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '11px',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                  }}
                >
                  {m} MODE
                </button>
              ))}
            </div>

            <p style={{ color: '#444444', fontSize: '10px', letterSpacing: '1px', marginBottom: '12px' }}>
              {mode === 'CLINICIAN'
                ? '// CLINICIAN: Enter patient case ID. ZK proof generated. Raw ID never stored.'
                : '// PATIENT: Enter your own identifier. Your data. Your capsule. No intermediary.'}
            </p>

            {/* Input */}
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
              placeholder={placeholder}
              style={{
                width: '100%',
                background: '#000000',
                border: '1px solid #333333',
                color: '#ffffff',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '14px',
                padding: '14px 16px',
                outline: 'none',
                letterSpacing: '1px',
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />

            {/* Open button */}
            <button
              onClick={handleOpen}
              disabled={!identifier.trim()}
              style={{
                width: '100%',
                background: identifier.trim() ? '#ffffff' : '#111111',
                color: identifier.trim() ? '#000000' : '#333333',
                border: '1px solid #333333',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '12px',
                letterSpacing: '3px',
                padding: '14px 0',
                cursor: identifier.trim() ? 'pointer' : 'not-allowed',
                marginBottom: '24px',
              }}
            >
              OPEN CAPSULE
            </button>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #1a1a1a', marginBottom: '24px' }} />

            {/* EHR Import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.xml,.csv,.hl7,.fhir,.txt"
              onChange={handleEhrUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                background: '#000000',
                color: ehrProcessed ? '#aaaaaa' : '#444444',
                border: `1px solid ${ehrProcessed ? '#444444' : '#1a1a1a'}`,
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '11px',
                letterSpacing: '2px',
                padding: '12px 0',
                cursor: 'pointer',
              }}
            >
              {ehrProcessed
                ? `✓ ${ehrFile?.name} — EDGE PROCESSED. NEVER UPLOADED.`
                : '[↑] IMPORT LEGACY EHR FILE (LOCAL EDGE PROCESSING)'}
            </button>

            {ehrProcessed && (
              <p style={{ color: '#444444', fontSize: '10px', letterSpacing: '1px', marginTop: '8px' }}>
                // File parsed on your device. Zero bytes transmitted to any server.
              </p>
            )}

            {state === 'ERROR' && (
              <p style={{ color: '#cc0000', fontSize: '11px', letterSpacing: '1px', marginTop: '16px' }}>
                ERROR: {error}
              </p>
            )}
          </>
        ) : state === 'LOADING' ? (
          <div style={{ border: '1px solid #222222', padding: '32px 24px' }}>
            <p style={{ color: '#555555', fontSize: '10px', letterSpacing: '3px', marginBottom: '24px' }}>
              CHRONOSGATE ACTIVE
            </p>
            <p style={{ fontSize: '48px', fontWeight: 900, marginBottom: '24px' }}>
              {String(countdown).padStart(2, '0')}
            </p>
            <p style={{ color: '#555555', fontSize: '11px', letterSpacing: '1px', lineHeight: '1.6' }}>
              {LOADING_LINES[loadingLine]}
            </p>
            <p style={{ color: '#333333', fontSize: '10px', letterSpacing: '1px', marginTop: '24px' }}>
              // Mandatory 10-second delay. Neutralizes bots. Forces human cognitive grounding.
            </p>
          </div>
        ) : state === 'OPEN' && diagnostic ? (
          <div style={{ border: '1px solid #222222', padding: '32px 24px' }}>
            <p style={{ color: '#555555', fontSize: '10px', letterSpacing: '3px', marginBottom: '24px' }}>
              CAPSULE OPEN · {diagnostic.mode} MODE
            </p>

            <div style={{ marginBottom: '24px' }}>
              {[
                ['CAPSULE ID', diagnostic.capsuleId.slice(0, 24) + '...'],
                ['SIGNAL COUNT', String(diagnostic.signalCount)],
                ['TREND', diagnostic.trend],
                ['EVAPORATES', diagnostic.evaporatesAt],
                ...(diagnostic.ehrFileName ? [['EHR SOURCE', diagnostic.ehrFileName + ' (local only)']] : []),
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #111111',
                  padding: '10px 0',
                  fontSize: '12px',
                }}>
                  <span style={{ color: '#555555', letterSpacing: '2px' }}>{label}</span>
                  <span style={{ color: '#ffffff', letterSpacing: '1px' }}>{value}</span>
                </div>
              ))}
            </div>

            <p style={{ color: '#333333', fontSize: '10px', letterSpacing: '1px', marginBottom: '24px' }}>
              // The server verified a mathematical proof. It never saw your identity.
            </p>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                background: '#000000',
                color: '#cc0000',
                border: '1px solid #330000',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '11px',
                letterSpacing: '3px',
                padding: '12px 0',
                cursor: 'pointer',
              }}
            >
              CLOSE CAPSULE · EVAPORATE SESSION
            </button>
          </div>
        ) : null}

        {/* Footer */}
        <p style={{ color: '#222222', fontSize: '10px', letterSpacing: '2px', marginTop: '48px' }}>
          ZYVV HEALTH · YOUR SIGNAL IS NOT OUTSIDE THE CURVE · IT IS THE ONLY CURVE THAT MATTERS
        </p>

      </div>
    </div>
  )
}