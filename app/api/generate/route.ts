// ============================================================
// ZYVV — Generate API Route
// File: app/api/generate/route.ts
// ============================================================
// POST /api/generate
// 1. Validates the situation input
// 2. Calls Groq to generate roast + three doors
// 3. Saves situation + doors to Supabase
// 4. Returns roast, doors, and situation_id to the client
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { generateDoors } from '@/lib/groq'
import { saveSituation, saveDoors } from '@/lib/supabase'
import type { GenerateRequest, GenerateResponse } from '@/lib/types'

// Run on Vercel Edge for lowest latency Groq calls globally
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // ── Parse + validate request ───────────────────────────────
    const body = (await req.json()) as GenerateRequest

    const situation = body.situation?.trim()
    const session_id = body.session_id?.trim()

    if (!situation) {
      return NextResponse.json(
        { error: 'situation is required' },
        { status: 400 }
      )
    }

    if (situation.length < 10) {
      return NextResponse.json(
        { error: 'Tell us a bit more about your situation.' },
        { status: 400 }
      )
    }

    if (situation.length > 2000) {
      return NextResponse.json(
        { error: 'Situation too long. Keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    // ── Generate via Groq ──────────────────────────────────────
    const { roast, doors } = await generateDoors(situation)

    // ── Save situation to Supabase ─────────────────────────────
    const situation_id = await saveSituation({
      content: situation,
      session_id: session_id ?? null,
      email: null,
    })

    // ── Save doors to Supabase ─────────────────────────────────
    const savedDoors = await saveDoors(
      doors.map((door) => ({
        ...door,
        situation_id,
      }))
    )

    // ── Return to client ───────────────────────────────────────
    const response: GenerateResponse = {
      roast,
      doors: savedDoors,
      situation_id,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    console.error('[/api/generate] Error:', err)

    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'Something went wrong. The void is temporarily unavailable.' },
      { status: 500 }
    )
  }
}
