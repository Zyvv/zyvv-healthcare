// ============================================================
// ZYVV — Groq AI Engine
// File: lib/groq.ts
// ============================================================

import Groq from 'groq-sdk'
import type { Door, DoorType } from '@/lib/types'

// ── MODE A: INITIALIZATION ────────────────────────────────────

const SYSTEM_PROMPT = `You are ZYVV — the world's first living decision mirror.

Your job when a human drops their situation:

1. MIRROR (Roast) — one sentence only. Sharp, specific, psychologically accurate.

2. THREE DOORS:
   - THE SURFACE DOOR (conventional)
   - THE FRICTION DOOR (contrarian)
   - THE DEPTH DOOR (alien)

Rules for doors:
- Extremely specific to the user's situation.
- No generic advice.
- Title: 4-7 sharp words.
- Description: 2-3 concrete sentences.
- why_it_works: 1-2 sentences explaining the mechanism.

=== DATA MOAT REQUIREMENT ===
At the end of your response, you MUST also output a structured JSON block inside \`\`\`json ... \`\`\`

Full response format:
[Human readable roast + three doors in normal text]

\`\`\`json
{
  "situation_summary": "One-sentence summary of the core stuck point",
  "roast_key_insights": ["insight 1", "insight 2"],
  "doors": [
    {
      "type": "conventional",
      "title": "...",
      "description": "...",
      "why_it_works": "...",
      "potential_objections": ["likely objection 1", "likely objection 2"]
    },
    {
      "type": "contrarian",
      "title": "...",
      "description": "...",
      "why_it_works": "...",
      "potential_objections": ["likely objection 1", "likely objection 2"]
    },
    {
      "type": "alien",
      "title": "...",
      "description": "...",
      "why_it_works": "...",
      "potential_objections": ["likely objection 1", "likely objection 2"]
    }
  ],
  "suggested_tracking_questions": "One or two questions for future outcome tracking"
}
\`\`\`

Return the nice human-readable text first, then the JSON block.`

export interface GroqGenerateResult {
  roast: string
  doors: Omit<Door, 'id' | 'situation_id'>[]
  structuredData?: {
    situation_summary: string
    roast_key_insights: string[]
    doors: Array<{
      type: string
      title: string
      description: string
      why_it_works: string
      potential_objections: string[]
    }>
    suggested_tracking_questions: string
  }
}

export async function generateDoors(
  situation: string
): Promise<GroqGenerateResult> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.85,
    max_tokens: 2800,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Here is my situation:\n\n${situation.trim()}` },
    ],
  })

  const fullText = completion.choices[0]?.message?.content || ''
  if (!fullText) throw new Error('Groq returned empty response')

  // Extract structured JSON block for moat
  const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
  let structuredData = null

  if (jsonMatch) {
    try {
      structuredData = JSON.parse(jsonMatch[1])
    } catch (e) {
      console.warn('Failed to parse structured JSON from Groq')
    }
  }

  // Strip JSON block from human-readable text
  const roast = fullText.replace(/```json[\s\S]*?```/gi, '').split('\n\n')[0].trim()

  // Parse doors from structuredData (moat JSON is source of truth)
  const doors: Omit<Door, 'id' | 'situation_id'>[] = structuredData?.doors?.map(
    (d: { type: DoorType; title: string; description: string; why_it_works: string; potential_objections?: string[] }) => ({
      door_type: d.type as DoorType,
      title: d.title,
      description: d.description,
      why_it_works: d.why_it_works,
      potential_objections: d.potential_objections ?? [],
    })
  ) ?? []

  return {
    roast,
    doors,
    structuredData,
  }
}

// ── MODE B: INTERROGATION ─────────────────────────────────────

const INTERROGATION_PROMPT = `You are ZYVV Engine in INTERROGATION MODE.

A user selected a door and raised an objection. Do not validate their doubt.
Treat the objection as a data point — a cognitive reveal.
Diagnose why this objection emerged from this specific door choice.
Output a refined path that uses the constraint the objection reveals as a mechanism, not an obstacle.

Rules:
- The refined_path must be stronger because of the objection.
- Return valid JSON only.

Return ONLY this JSON:
{
  "refinement_block": {
    "critique": "string",
    "refined_path": "string",
    "next_interrogation_vector": "string",
    "outcome_tracking_hint": "string"
  }
}`

export interface RefinementBlock {
  critique: string
  refined_path: string
  next_interrogation_vector: string
  outcome_tracking_hint: string
}

export interface GroqInterrogateResult {
  refinement_block: RefinementBlock
}

export async function interrogateDoor(
  previous_situation: string,
  selected_door: DoorType,
  user_objection: string
): Promise<GroqInterrogateResult> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.85,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: INTERROGATION_PROMPT },
      {
        role: 'user',
        content: `Previous situation: ${previous_situation.trim()}\n\nSelected door: ${selected_door}\n\nUser objection: ${user_objection.trim()}`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('Groq returned empty response')

  let parsed: GroqInterrogateResult
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Groq response was not valid JSON')
  }

  return parsed
}