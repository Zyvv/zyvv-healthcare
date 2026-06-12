// ============================================================
// ZYVV API v1 — Save Choice
// File: app/api/v1/choice/route.ts
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { saveChoice } from '@/lib/supabase'
import { authenticateRequest, logRequest } from '@/lib/apiAuth'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const body = await req.json()
    const { situation_id, door_id } = body
    if (typeof situation_id !== 'number' || typeof door_id !== 'number') {
      await logRequest(auth.apiKeyId!, '/api/v1/choice', 400)
      return NextResponse.json({ error: 'situation_id and door_id must be numbers' }, { status: 400 })
    }
    const choice_id = await saveChoice({ situation_id, door_id })
    await logRequest(auth.apiKeyId!, '/api/v1/choice', 200)
    return NextResponse.json({ choice_id }, { status: 200 })
  } catch (err: any) {
    console.error('[/api/v1/choice] Error:', err)
    await logRequest(auth.apiKeyId!, '/api/v1/choice', 200)
    return NextResponse.json({ error: 'Choice could not be saved.', choice_id: null }, { status: 200 })
  }
}