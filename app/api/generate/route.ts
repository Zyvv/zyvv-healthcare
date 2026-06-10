// ============================================================
// ZYVV — Generate API Route
// File: app/api/generate/route.ts
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

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MODE B: INTERROGATION
    if (body.mode === 'INTERROGATION') {
      const { previous_situation, selected_door, user_objection } = body as InterrogateRequest

      if (!previous_situation || !selected_door || !user_objection) {
        return NextResponse.json(
          { error: 'previous_situation, selected_door, and user_objection are required.' },
          { status: 400 }
        )
      }

      if (user_objection.trim().length < 4) {
        return NextResponse.json({ error: 'Give us more to work with.' }, { status: 400 })
      }

      const result = await interrogateDoor(previous_situation, selected_door, user_objection)

      return NextResponse.json({
        refinement_block: result.refinement_block,
      }, { status: 200 })
    }

    // MODE A: INITIALIZATION
    const { situation, session_id } = body as GenerateRequest
    const trimmed = situation?.trim()

    if (!trimmed) {
      return NextResponse.json({ error: 'situation is required' }, { status: 400 })
    }
    if (trimmed.length < 10) {
      return NextResponse.json({ error: 'Tell us a bit more about your situation.' }, { status: 400 })
    }
    if (trimmed.length > 2000) {
      return NextResponse.json({ error: 'Situation too long. Keep it under 2000 characters.' }, { status: 400 })
    }

    const groqResult = await generateDoors(trimmed)
    const { roast, doors, structuredData } = groqResult

    const situation_id = await saveSituation({
      content: trimmed,
      session_id: session_id ?? null,
      email: undefined,
    })

    const doorsWithMoat = doors.map((door, index) => ({
      ...door,
      situation_id,
      potential_objections: structuredData?.doors?.[index]?.potential_objections || [],
    }))

    const savedDoors = await saveDoors(doorsWithMoat)

    const response: GenerateResponse = {
      roast,
      doors: savedDoors,
      situation_id,
      structuredData,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    console.error('[/api/generate] Error:', err)
    return NextResponse.json(
      { error: err?.message || 'Unknown error', stack: err?.stack },
      { status: 500 }
    )
  }
}