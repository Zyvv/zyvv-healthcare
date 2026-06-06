// ============================================================
// ZYVV — Shared TypeScript Types
// File: lib/types.ts
// ============================================================

// ── Door Types ───────────────────────────────────────────────
// Mirrors the door_type CHECK constraint in schema.sql

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

// ── API Payloads ─────────────────────────────────────────────

// POST /api/generate
export interface GenerateRequest {
  situation: string
  session_id: string
}

export interface GenerateResponse {
  roast: string
  doors: Door[]
  situation_id: number
}

// POST /api/save
export interface SaveChoiceRequest {
  situation_id: number
  door_id: number
}

export interface SaveChoiceResponse {
  choice_id: number
}

// POST /api/email
export interface EmailRequest {
  email: string
  situation: string
  roast: string
  doors: Door[]
  chosen_door: Door
}

// ── UI State ─────────────────────────────────────────────────

export type AppPhase =
  | 'input'       // Landing: user types situation
  | 'loading'     // Groq is generating
  | 'roast'       // Roast is being revealed
  | 'doors'       // Three doors are shown
  | 'chosen'      // User picked a door
  | 'share'       // Share card visible

// ── Door Config (UI metadata) ────────────────────────────────
// Maps door_type to its display color and label

export interface DoorConfig {
  type: DoorType
  label: string
  color: string        // Tailwind text color class
  borderColor: string  // Tailwind border color class
  shadowColor: string  // Tailwind shadow class
  glowColor: string    // Raw hex for Framer Motion animations
}

export const DOOR_CONFIGS: Record<DoorType, DoorConfig> = {
  conventional: {
    type: 'conventional',
    label: 'The Conventional Door',
    color: 'text-zyvv-green',
    borderColor: 'border-zyvv-green',
    shadowColor: 'shadow-green',
    glowColor: '#00FF94',
  },
  contrarian: {
    type: 'contrarian',
    label: 'The Contrarian Door',
    color: 'text-zyvv-red',
    borderColor: 'border-zyvv-red',
    shadowColor: 'shadow-red',
    glowColor: '#FF2D55',
  },
  alien: {
    type: 'alien',
    label: 'The Alien Door',
    color: 'text-zyvv-purple',
    borderColor: 'border-zyvv-purple',
    shadowColor: 'shadow-purple',
    glowColor: '#BF5AF2',
  },
}
