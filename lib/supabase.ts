// ============================================================
// ZYVV — Supabase Client
// File: lib/supabase.ts
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Situation, Door, Choice } from '@/lib/types'

// ── Anon client (public-safe) ────────────────────────────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)

// ── Admin client (server-only) ───────────────────────────────
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY ?? 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function saveSituation(situation: Omit<Situation, 'id'>): Promise<number> {
  const { data, error } = await supabaseAdmin.from('situations').insert(situation).select('id').single()
  if (error) throw new Error(`saveSituation: ${error.message}`)
  return data.id
}

export async function saveDoors(doors: Omit<Door, 'id'>[]): Promise<Door[]> {
  const { data, error } = await supabaseAdmin.from('doors').insert(doors).select()
  if (error) throw new Error(`saveDoors: ${error.message}`)
  return data as Door[]
}

export async function saveChoice(choice: Omit<Choice, 'id'>): Promise<number> {
  const { data, error } = await supabaseAdmin.from('choices').insert(choice).select('id').single()
  if (error) throw new Error(`saveChoice: ${error.message}`)
  return data.id
}

export async function getPortalCount(): Promise<number> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return 0
    const client = createClient(url, key)
    const { data, error } = await client.from('portal_count').select('total').single()
    if (error) return 0
    return Number(data?.total ?? 0)
  } catch {
    return 0
  }
}