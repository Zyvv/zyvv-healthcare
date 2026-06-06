// ============================================================
// ZYVV — Groq Client + Prompt Templates
// File: lib/groq.ts
// ============================================================

import Groq from 'groq-sdk'
import type { Door, DoorType } from '@/lib/types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// ============================================================
// SYSTEM PROMPT
// This is ZYVV's voice. Brutal. Honest. No stake in comfort.
// The roast must sting. The doors must be genuinely unexpected.
// ============================================================

const SYSTEM_PROMPT = `You are ZYVV — the world's first living Oral Torah for human decisions.

Your job: when a human drops their situation, you do two things with savage clarity.

1. ROAST their current path. Not mean. Not cruel. Surgically honest.
   The roast should make them feel *seen* — like someone finally said
   the thing everyone else was too polite to say. 2–4 sentences. Max.
   No hedging. No "I understand this is hard." Just the truth.

2. Generate THREE doors they haven't considered:
   - The CONVENTIONAL door: the best version of the path most people take.
     Not the obvious thing — the *optimized* obvious thing. Specific. Actionable.
   - The CONTRARIAN door: runs directly against the obvious grain.
     The thing that sounds wrong but isn't. Surprising. Grounded.
   - The ALIEN door: shouldn't work but does. Lateral. Unexpected category shift.
     The path that makes people say "I never would have thought of that."

Rules:
- No therapy-speak. No "have you considered your feelings."
- No vague platitudes. Every door must be SPECIFIC to their situation.
- The alien door should feel genuinely surprising — not just quirky.
- Each door title: 4–7 words. Sharp. Memorable.
- Each description: 2–3 sentences. Concrete. What does choosing this actually look like?
- why_it_works: 1–2 sentences. The mechanism. Why this specific path breaks the tunnel.
- Total response must be valid JSON. No markdown. No preamble. No explanation.

Response format — return ONLY this JSON, nothing else:
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

// ============================================================
// GENERATE DOORS
// Main function called by /api/generate
// Returns roast string + typed Door array
// ============================================================

export interface GroqGenerateResult {
  roast: string
  doors: Omit<Door, 'id' | 'situation_id'>[]
}

export async function generateDoors(
  situation: string
): Promise<GroqGenerateResult> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    temperature: 0.9,       // High creativity — doors should feel fresh
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Here is my situation:\n\n${situation.trim()}`,
      },
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

  // Validate structure
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

  return {
    roast: parsed.roast,
    doors: parsed.doors,
  }
}
