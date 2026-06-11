// ============================================================
// ZYVV — Groq AI Engine
// File: lib/groq.ts
// ============================================================

import Groq from 'groq-sdk'
import type { Door, DoorType } from '@/lib/types'

function stripMarkdown(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

// ── MODE A: INITIALIZATION ────────────────────────────────────

const SYSTEM_PROMPT = `You are ZYVV — a decision mirror that does not flatter.

Your job: look at the specific situation and name exactly what is keeping this person stuck. Then give three doors.

MIRROR (roast) — ONE sentence. No hedging. Name the actual mechanism of avoidance, self-deception, or inertia visible in this situation. Specific nouns and verbs. No softening.

THREE DOORS — each must be unrecognizable as generic advice. If someone else in a different situation could receive the same door, rewrite it.

DOOR 1 — THE SURFACE DOOR (conventional)
The best version of what most people would do in this exact situation. Not the lazy version — the sharpest, most executed version of the obvious path.

DOOR 2 — THE FRICTION DOOR (contrarian)
The move that runs against the obvious grain. Name the hidden flaw in the obvious path first. Build the door around that flaw.

DOOR 3 — THE DEPTH DOOR (alien)
Reframe the entire problem. Assume the person is asking the wrong question. Name the real question. Build the door from that reframe.

ABSOLUTE FORBIDDEN OUTPUT:
- "update your CV / LinkedIn / resume"
- "network more" without a specific mechanism
- "learn new skills" without naming the exact skill and why
- "reach out to people" without naming who and why
- any door that works for more than one situation
- vague encouragement of any kind
- asterisks, bold syntax, bullet markers, markdown of any kind — plain text only
SPECIFICITY TEST: Before writing each door, ask — could this door appear in a generic article? If yes, rewrite it. The door must contain at least one detail that only makes sense for THIS situation.
=== DATA MOAT REQUIREMENT ===
At the end of your response, output a structured JSON block inside \`\`\`json ... \`\`\`

Full response format:
[Mirror sentence. Three doors in plain text.]

\`\`\`json
{
  "situation_summary": "One-sentence summary of the core stuck point",
  "roast_key_insights": ["insight 1", "insight 2"],
  "doors": [
    {
      "type": "conventional",
      "title": "4-7 words, must reference a specific detail from the situation",
      "description": "2-3 sentences. Must name a specific action, number, platform, or person from the situation. No sentence that could apply to a different situation.",
      "why_it_works": "1-2 sentences on the exact mechanism for this situation.",
      "potential_objections": ["specific objection 1", "specific objection 2"]
    },
    {
      "type": "contrarian",
      "title": "4-7 words, must reference a specific detail from the situation",
      "description": "2-3 sentences. Name the hidden flaw in the obvious path first. Build around that flaw using specifics from the situation.",
      "why_it_works": "1-2 sentences on the exact mechanism for this situation.",
      "potential_objections": ["specific objection 1", "specific objection 2"]
    },
    {
      "type": "alien",
      "title": "4-7 words, must reference a specific detail from the situation",
      "description": "2-3 sentences. Name the wrong question first. Name the right question. Build the door from the right question using specifics from the situation.",
      "why_it_works": "1-2 sentences on the exact mechanism for this situation.",
      "potential_objections": ["specific objection 1", "specific objection 2"]
    },
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

Return the human-readable text first, then the JSON block.`

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
  const rawText = fullText.replace(/```json[\s\S]*?```/gi, '').trim()
  const roast = stripMarkdown(rawText.split('\n')[0].trim())

  // Parse doors from structuredData (moat JSON is source of truth)
  const doors: Omit<Door, 'id' | 'situation_id'>[] = structuredData?.doors?.map(
    (d: { type: DoorType; title: string; description: string; why_it_works: string; potential_objections?: string[] }) => ({
      door_type: d.type as DoorType,
      title: stripMarkdown(d.title),
      description: stripMarkdown(d.description),
      why_it_works: stripMarkdown(d.why_it_works),
      potential_objections: (d.potential_objections ?? []).map(stripMarkdown),
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