// ============================================================
// ZYVV API v1 — Interrogate
// File: app/api/v1/interrogate/route.ts
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { interrogateDoor } from '@/lib/groq'
import { authenticateRequest, logRequest } from '@/lib/apiAuth'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const body = await req.json()
    const { previous_situation, selected_door, user_objection } = body
    if (!previous_situation || !selected_door || !user_objection) {
      await logRequest(auth.apiKeyId!, '/api/v1/interrogate', 400)
      return NextResponse.json(
        { error: 'previous_situation, selected_door, and user_objection are required' },
        { status: 400 }
      )
    }
    if (user_objection.trim().length < 4) {
      await logRequest(auth.apiKeyId!, '/api/v1/interrogate', 400)
      return NextResponse.json({ error: 'user_objection too short' }, { status: 400 })
    }
    const result = await interrogateDoor(previous_situation, selected_door, user_objection)
    await logRequest(auth.apiKeyId!, '/api/v1/interrogate', 200)
    return NextResponse.json({ refinement_block: result.refinement_block }, { status: 200 })
  } catch (err: any) {
    console.error('[/api/v1/interrogate] Error:', err)
    await logRequest(auth.apiKeyId!, '/api/v1/interrogate', 500)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}