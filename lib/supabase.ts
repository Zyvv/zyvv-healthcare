// ============================================================
// ZYVV — Supabase Client
// File: lib/supabase.ts
// ============================================================
// Two clients:
//   1. supabase        — anon key, safe to use in browser + API routes
//                        for anonymous inserts (situations, doors, choices)
//   2. supabaseAdmin   — service key, server-only, never exposed to client
//                        used for reads and any privileged operations
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Situation, Door, Choice } from '@/lib/types'


// ── Anon client (public-safe) ────────────────────────────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)

// ── Admin client (server-only) ───────────────────────────────
// Only import/use this in API routes (app/api/**), never in components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// ============================================================
// DB HELPERS
// Thin wrappers used by API routes. All throw on error so
// callers don't need to check .error every time.
// ============================================================

// ── Save a situation ─────────────────────────────────────────
export async function saveSituation(
  situation: Omit<Situation, 'id'>
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('situations')
    .insert(situation)
    .select('id')
    .single()

  if (error) throw new Error(`saveSituation: ${error.message}`)
  return data.id
}

// ── Save doors (bulk insert) ─────────────────────────────────
export async function saveDoors(
  doors: Omit<Door, 'id'>[]
): Promise<Door[]> {
  const { data, error } = await supabaseAdmin
    .from('doors')
    .insert(doors)
    .select()

  if (error) throw new Error(`saveDoors: ${error.message}`)
  return data as Door[]
}

// ── Save a choice ────────────────────────────────────────────
export async function saveChoice(
  choice: Omit<Choice, 'id'>
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('choices')
    .insert(choice)
    .select('id')
    .single()

  if (error) throw new Error(`saveChoice: ${error.message}`)
  return data.id
}

// ── Get portal count ─────────────────────────────────────────
// Reads from the portal_count view (anon-readable per schema).
export async function getPortalCount(): Promise<number> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return 0
    
    const client = createClient(url, key)
    const { data, error } = await client
      .from('portal_count')
      .select('total')
      .single()

    if (error) return 0
    return Number(data?.total ?? 0)
  } catch {
    return 0
  }
}
