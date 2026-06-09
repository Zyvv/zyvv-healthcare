// ============================================================
// ZYVV — Groq AI Engine
// File: lib/groq.ts
// ============================================================

import Groq from 'groq-sdk'
import type { Door, DoorType } from '@/lib/types'

// ── MODE A: INITIALIZATION ────────────────────────────────────

const SYSTEM_PROMPT = `You are ZYVV — the world's first living decision mirror.

Your job when a human drops their situation:

1. MIRROR — one sentence only.

   This is not an insult. It is the thing they already know but have not said out loud.
   It names the exact avoidance, the specific loop, the precise lie they are telling themselves.
   It must use details from what they wrote — never generic, never transferable to another person.
   It should feel like: "how did it know that."
   It should land like: the most honest person in their life finally said it.

   Never use: metaphor, journey, path, navigate, growth, crossroads, chapter.
   Never summarize their situation back to them.
   One sentence. No exceptions.

   Good: "You've been calling it a bad year for three years."
   Good: "You already know which door — you're here because you want someone to blame if it goes wrong."
   Good: "You built the plan, the timeline, and the excuse — in that order."
   Bad: "You're at a crossroads in your career journey."

2. THREE DOORS — paths they have not considered.

   THE SURFACE DOOR (conventional)
   The optimized version of what most people do. Specific. Actionable. What does day one actually look like?

   THE FRICTION DOOR (contrarian)
   Runs against their instinct. Sounds wrong at first. Grounded in a real mechanism.

   THE DEPTH DOOR (alien)
   A lateral move into a different category entirely.
   Should feel: "I never would have thought of that."
   This is the door that changes the frame, not just the plan.

Rules:
- Every door must assume the person has no connections, no budget, and no permission from the system blocking them.
- The door must work BECAUSE of the constraint, not despite it.
- A door that requires money, network, or institutional approval is a bad door.
- No therapy-speak.
- Every door must be specific to their exact situation. Zero generic advice.
- Door title: 4-7 words. Sharp. Memorable.
- Description: 2-3 sentences. Concrete. Real.
- why_it_works: 1-2 sentences. The mechanism. Why this breaks the specific tunnel they are in.
- Return valid JSON only. No markdown. No preamble. No explanation.

Response format — return ONLY this JSON:
{
  "roast": "string",
  "doors": [
    {
      "door_type": "conventional",
      "title": "string",
      "description": "string",
      "why_it_works": "string"
    },
    {
      "door_type": "contrarian",
      "title": "string",
      "description": "string",
      "why_it_works": "string"
    },
    {
      "door_type": "alien",
      "title": "string",
      "description": "string",
      "why_it_works": "string"
    }
  ]
}`

export interface GroqGenerateResult {
  roast: string
  doors: Omit<Door, 'id' | 'situation_id'>[]
}

export async function generateDoors(
  situation: string
): Promise<GroqGenerateResult> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.9,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Here is my situation:\n\n${situation.trim()}` },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('Groq returned empty response')

  let parsed: { roast: string; doors: Omit<Door, 'id' | 'situation_id'>[] }

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Groq response was not valid JSON: ${raw.slice(0, 200)}`)
  }

  if (!parsed.roast || !Array.isArray(parsed.doors) || parsed.doors.length !== 3) {
    throw new Error('Groq response missing roast or doors array')
  }

  const validTypes: DoorType[] = ['conventional', 'contrarian', 'alien']
  for (const door of parsed.doors) {
    if (!validTypes.includes(door.door_type as DoorType)) {
      throw new Error(`Invalid door_type: ${door.door_type}`)
    }
    if (!door.title || !door.description || !door.why_it_works) {
      throw new Error(`Door missing required fields: ${JSON.stringify(door)}`)
    }
  }

  return { roast: parsed.roast, doors: parsed.doors }
}

// ── MODE B: INTERROGATION ─────────────────────────────────────

const INTERROGATION_PROMPT = `You are ZYVV Engine in INTERROGATION MODE.

A user selected a door and raised an objection. Do not validate their doubt.
Treat the objection as a data point — a cognitive reveal.
Diagnose why this objection emerged from this specific door choice.
Output a refined path that uses the constraint the objection reveals as a mechanism, not an obstacle.

Rules:
- The refined_path must be stronger because of the objection, not despite it.
- next_interrogation_vector pushes one level deeper — not wider.
- No therapy-speak. No encouragement. Cold, surgical, precise.
- Return valid JSON only. No markdown. No preamble.

Return ONLY this JSON:
{
  "refinement_block": {
    "critique": "Why this objection reveals a deeper constraint or cognitive pattern.",
    "refined_path": "Updated strategy that incorporates the objection as a feature.",
    "next_interrogation_vector": "One specific question that pushes the user one level deeper.",
    "outcome_tracking_hint": "A short specific question to ping the user in 30 days."
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
    throw new Error(`Groq response was not valid JSON: ${raw.slice(0, 200)}`)
  }

  const rb = parsed.refinement_block
  if (
    !rb?.critique ||
    !rb?.refined_path ||
    !rb?.next_interrogation_vector ||
    !rb?.outcome_tracking_hint
  ) {
    throw new Error(`Refinement block missing required fields: ${JSON.stringify(parsed)}`)
  }

  return parsed
}
