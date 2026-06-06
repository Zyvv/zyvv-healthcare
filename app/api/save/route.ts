// ============================================================
// ZYVV — Save Choice API Route
// File: app/api/save/route.ts
// ============================================================
// POST /api/save
// Called when a user picks a door.
// Records the choice in Supabase — this is the core behavioral
// signal that powers the Phase 3 collective intelligence layer.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { saveChoice } from '@/lib/supabase'
import type { SaveChoiceRequest, SaveChoiceResponse } from '@/lib/types'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // ── Parse + validate ───────────────────────────────────────
    const body = (await req.json()) as SaveChoiceRequest

    const { situation_id, door_id } = body

    if (!situation_id || !door_id) {
      return NextResponse.json(
        { error: 'situation_id and door_id are required' },
        { status: 400 }
      )
    }

    if (typeof situation_id !== 'number' || typeof door_id !== 'number') {
      return NextResponse.json(
        { error: 'situation_id and door_id must be numbers' },
        { status: 400 }
      )
    }

    // ── Save choice ────────────────────────────────────────────
    const choice_id = await saveChoice({ situation_id, door_id })

    const response: SaveChoiceResponse = { choice_id }

    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    console.error('[/api/save] Error:', err)

    // Choice saving failing should not block the UI.
    // Log it, but return 200 so the user experience continues.
    // The door reveal is the product — the logging is infrastructure.
    return NextResponse.json(
      { error: 'Choice could not be saved.', choice_id: null },
      { status: 200 }
    )
  }
}
