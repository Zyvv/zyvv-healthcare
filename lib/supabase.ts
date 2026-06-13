// ============================================================
// ZYVV — Supabase Client
// File: lib/supabase.ts
// Enhanced for Data Moat (potential_objections + future structured data)
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Situation, Door, Choice, Outcome, StructuredData } from '@/lib/types'

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

export async function saveSituation(
  situation: Omit<Situation, 'id'> & {
    assumption_detected?: string | null
    context_signal?: string | null
    context_query?: string | null
  }
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('situations')
    .insert(situation)
    .select('id')
    .single()

  if (error) throw new Error(`saveSituation: ${error.message}`)
  return data.id
}

/**
 * Enhanced saveDoors — now supports potential_objections for moat
 */
export async function saveDoors(
  doors: Array<Omit<Door, 'id'> & { potential_objections?: string[] }>
): Promise<Door[]> {
  const { data, error } = await supabaseAdmin
    .from('doors')
    .insert(doors)
    .select()

  if (error) throw new Error(`saveDoors: ${error.message}`)
  return data as Door[]
}

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

// ── Outcome — closes the Talmudic loop ───────────────────────
export async function saveOutcome(
  outcome: Omit<Outcome, 'id'>
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('outcomes')
    .insert(outcome)
    .select('id')
    .single()

  if (error) throw new Error(`saveOutcome: ${error.message}`)
  return data.id
}

/**
 * Optional: Save structured data separately (useful for future pgvector work)
 */
export async function saveStructuredData(
  situation_id: number,
  structuredData: StructuredData
): Promise<void> {
  // You can store this in a separate table or as JSONB in situations table
  const { error } = await supabaseAdmin
    .from('situations')
    .update({ 
      metadata: structuredData  // assumes you add a jsonb column called metadata
    })
    .eq('id', situation_id)

  if (error) console.warn('Failed to save structured data:', error.message)
}

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
