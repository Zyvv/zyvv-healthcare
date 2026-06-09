// ============================================================
// ZYVV — Outcome API Route
// File: app/api/outcome/route.ts
//
// POST /api/outcome
// Called when a user reports back what happened after choosing a door.
// This is the 30-day ping — the ground truth that builds the data moat.
//
// Body: { choice_id, outcome_text, outcome_score }
// Returns: { outcome_id }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { saveOutcome } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { choice_id, outcome_text, outcome_score } = body

    // ── Validate ─────────────────────────────────────────────
    if (!choice_id || typeof choice_id !== 'number') {
      return NextResponse.json(
        { error: 'choice_id is required and must be a number.' },
        { status: 400 }
      )
    }

    if (outcome_score !== undefined) {
      if (
        typeof outcome_score !== 'number' ||
        outcome_score < 1 ||
        outcome_score > 5
      ) {
        return NextResponse.json(
          { error: 'outcome_score must be a number between 1 and 5.' },
          { status: 400 }
        )
      }
    }

    if (outcome_text && typeof outcome_text !== 'string') {
      return NextResponse.json(
        { error: 'outcome_text must be a string.' },
        { status: 400 }
      )
    }

    // ── Save to Supabase ──────────────────────────────────────
    const outcome_id = await saveOutcome({
      choice_id,
      outcome_text: outcome_text?.trim() ?? undefined,
      outcome_score: outcome_score ?? undefined,
    })

    return NextResponse.json({ outcome_id }, { status: 200 })
  } catch (err) {
    console.error('[/api/outcome] Error:', err)
    return NextResponse.json(
      { error: 'Something went wrong storing your outcome.' },
      { status: 500 }
    )
  }
}
