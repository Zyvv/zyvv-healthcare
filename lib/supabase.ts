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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// ── Anon client (public-safe) ────────────────────────────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

// ── Admin client (server-only) ───────────────────────────────
// Only import/use this in API routes (app/api/**), never in components.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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
  const { data, error } = await supabase
    .from('portal_count')
    .select('total')
    .single()

  if (error) return 0 // fail silently — counter is cosmetic
  return Number(data?.total ?? 0)
}
