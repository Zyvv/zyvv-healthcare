// ============================================================
// ZYVV — Shared TypeScript Types
// File: lib/types.ts
// ============================================================

// ── Door Types ───────────────────────────────────────────────

export type DoorType = 'conventional' | 'contrarian' | 'alien'

export interface Door {
  id?: number
  situation_id?: number
  door_type: DoorType
  title: string
  description: string
  why_it_works: string
}

// ── Situation ────────────────────────────────────────────────

export interface Situation {
  id?: number
  content: string
  session_id?: string
  email?: string
}

// ── Choice ───────────────────────────────────────────────────

export interface Choice {
  id?: number
  situation_id: number
  door_id: number
}

// ── Outcome (Phase 2+) ───────────────────────────────────────

export interface Outcome {
  id?: number
  choice_id: number
  outcome_text?: string
  outcome_score?: number // 1–5
}

// ── API Payloads — MODE A ────────────────────────────────────

export interface GenerateRequest {
  mode?: 'INITIALIZATION'
  situation: string
  session_id: string
}

export interface GenerateResponse {
  roast: string
  doors: Door[]
  situation_id: number
}

// ── API Payloads — MODE B ────────────────────────────────────

export interface InterrogateRequest {
  mode: 'INTERROGATION'
  previous_situation: string
  selected_door: DoorType
  user_objection: string
  session_id?: string
}

export interface RefinementBlock {
  critique: string
  refined_path: string
  next_interrogation_vector: string
  outcome_tracking_hint: string
}

export interface InterrogateResponse {
  refinement_block: RefinementBlock
}

// ── Save ─────────────────────────────────────────────────────

export interface SaveChoiceRequest {
  situation_id: number
  door_id: number
}

export interface SaveChoiceResponse {
  choice_id: number
}

// ── Email ────────────────────────────────────────────────────

export interface EmailRequest {
  email: string
  situation: string
  roast: string
  doors: Door[]
  chosen_door: Door
}

// ── UI State ─────────────────────────────────────────────────

export type AppPhase =
  | 'input'          // Landing: user types situation
  | 'loading'        // Groq MODE A generating
  | 'roast'          // Mirror truth typewriter reveal
  | 'doors'          // Three doors shown
  | 'chosen'         // User picked a door (brief transition)
  | 'interrogation'  // User raises a doubt
  | 'refining'       // Groq MODE B generating
  | 'refined'        // Refinement block revealed
  | 'share'          // Share card visible

// ── Door Config (UI metadata) ─────────────────────────────────

export interface DoorConfig {
  type: DoorType
  label: string
  color: string
  borderColor: string
  shadowColor: string
  glowColor: string
}

export const DOOR_CONFIGS: Record<DoorType, DoorConfig> = {
  conventional: {
    type: 'conventional',
    label: 'The Surface Door',
    color: 'text-zyvv-cyan',
    borderColor: 'border-zyvv-cyan',
    shadowColor: 'shadow-cyan',
    glowColor: '#00F5FF',
  },
  contrarian: {
    type: 'contrarian',
    label: 'The Friction Door',
    color: 'text-zyvv-amber',
    borderColor: 'border-zyvv-amber',
    shadowColor: 'shadow-amber',
    glowColor: '#FFB830',
  },
  alien: {
    type: 'alien',
    label: 'The Depth Door',
    color: 'text-zyvv-purple',
    borderColor: 'border-zyvv-purple',
    shadowColor: 'shadow-purple',
    glowColor: '#BF5AF2',
  },
}
