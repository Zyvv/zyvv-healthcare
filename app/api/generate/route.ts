// ============================================================
// ZYVV — Generate API Route
// File: app/api/generate/route.ts
//
// POST /api/generate
//
// MODE A (INITIALIZATION — default):
//   Body: { situation, session_id }
//   → Validates → Groq generateDoors → saves to Supabase → returns roast + doors
//
// MODE B (INTERROGATION):
//   Body: { mode: 'INTERROGATION', previous_situation, selected_door, user_objection }
//   → Groq interrogateDoor → returns refinement_block
//   (No Supabase write on MODE B — objection stored in client state for now)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { generateDoors, interrogateDoor } from '@/lib/groq'
import { saveSituation, saveDoors } from '@/lib/supabase'
import type {
  GenerateRequest,
  GenerateResponse,
  InterrogateRequest,
  InterrogateResponse,
} from '@/lib/types'

// Run on Vercel Edge for lowest latency Groq calls globally
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── MODE B: INTERROGATION ────────────────────────────────
    if (body.mode === 'INTERROGATION') {
      const { previous_situation, selected_door, user_objection } =
        body as InterrogateRequest

      if (!previous_situation || !selected_door || !user_objection) {
        return NextResponse.json(
          {
            error:
              'previous_situation, selected_door, and user_objection are required.',
          },
          { status: 400 }
        )
      }

      if (user_objection.trim().length < 4) {
        return NextResponse.json(
          { error: 'Give us more to work with.' },
          { status: 400 }
        )
      }

      const result = await interrogateDoor(
        previous_situation,
        selected_door,
        user_objection
      )

      const response: InterrogateResponse = {
        refinement_block: result.refinement_block,
      }

      return NextResponse.json(response, { status: 200 })
    }

    // ── MODE A: INITIALIZATION (default) ─────────────────────
    const { situation, session_id } = body as GenerateRequest

    const trimmed = situation?.trim()

    if (!trimmed) {
      return NextResponse.json(
        { error: 'situation is required' },
        { status: 400 }
      )
    }

    if (trimmed.length < 10) {
      return NextResponse.json(
        { error: 'Tell us a bit more about your situation.' },
        { status: 400 }
      )
    }

    if (trimmed.length > 2000) {
      return NextResponse.json(
        { error: 'Situation too long. Keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    // Generate via Groq
    const { roast, doors } = await generateDoors(trimmed)

    // Save situation to Supabase
    const situation_id = await saveSituation({
      content: trimmed,
      session_id: session_id ?? null,
      email: undefined,
    })

    // Save doors to Supabase
    const savedDoors = await saveDoors(
      doors.map((door) => ({ ...door, situation_id }))
    )

    const response: GenerateResponse = {
      roast,
      doors: savedDoors,
      situation_id,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    console.error('[/api/generate] Error:', err)

    return NextResponse.json(
      { error: 'Something went wrong. The void is temporarily unavailable.' },
      { status: 500 }
    )
  }
}
