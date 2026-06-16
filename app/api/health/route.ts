import { NextRequest, NextResponse } from 'next/server'
import { chronosGate } from '@/core/chronosGate'
import { generateCommitment, createProof } from '@/core/zkVerify'
import { createSession, createEvaporatingStore } from '@/core/teku'
import type { CapsuleResult, DiagnosticView } from '@/app/types/health'

const sessionStore = createEvaporatingStore()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rawIdentity, vitals, sessionId } = body

    if (!rawIdentity || !sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Missing identity or session', code: 'INVALID_PROOF' },
        { status: 400 }
      )
    }

    // Pillar 1 — Chronos Gate
    await chronosGate()

    // Pillar 3 — ZK commitment (never store raw identity)
    const { commitment } = generateCommitment(rawIdentity)
    const proof = createProof(commitment, sessionId)

    // Pillar 2 — Teku session
    const session = createSession(sessionId)
    session.data.commitment = commitment
    sessionStore.set(sessionId, session)

    const view: DiagnosticView = {
      capsuleId: proof.nullifier,
      signalCount: vitals?.length ?? 0,
      latestVitals: vitals ?? [],
      trend: 'insufficient_data',
      generatedAt: Date.now(),
      evaporatesAt: session.expiresAt,
    }

    const result: CapsuleResult<DiagnosticView> = {
      ok: true,
      data: view,
      localOnly: true,
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Protocol failure', code: 'UNKNOWN' },
      { status: 500 }
    )
  }
}