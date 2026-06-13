// ============================================================
// ZYVV MANA — Assumption Breach Engine
// File: lib/assumptionEngine.ts
// Purpose: Three-pass pre-processing before generateDoors()
//   Pass 1: Extract implicit assumption from situation (Groq fast)
//   Pass 2: Search for contradiction evidence (Tavily)
//   Pass 3: Compress raw result into one clean signal line (Groq fast)
// Returns: AssumptionBreach | null — null always fails silently
// ============================================================

export interface AssumptionBreach {
  assumption: string    // "growth requires adding headcount"
  signal: string        // "Agencies that hired in 2024 saw 23% margin compression"
  searchQuery: string   // stored for data moat
  raw: string           // full Tavily result, injected into Groq prompt
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function groqFast(
  systemPrompt: string,
  userContent: string,
  maxTokens = 80
): Promise<string | null> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: maxTokens,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}

async function tavilySearch(query: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 3,
        include_answer: true,
      }),
    })
    const data = await res.json()
    return data.answer || data.results?.[0]?.content || null
  } catch {
    return null
  }
}

export async function extractAssumptionBreach(
  situation: string
): Promise<AssumptionBreach | null> {
  try {
    // ── PASS 1: Extract implicit assumption ──────────────────
    const assumption = await groqFast(
      `You extract the single implicit assumption behind a situation.
Output ONLY the assumption as a short phrase (5-10 words max).
No quotes. No "the user assumes". No explanation.
The assumption is what the person takes for granted without stating.
If the situation is purely personal or emotional with no strategic assumption, output: SKIP

Examples:
"I want to grow my agency by hiring two developers" → growth requires adding headcount
"Should I launch in France or Germany first" → geographic sequencing determines success
"I need more marketing budget" → the problem is visibility not conversion
"My co-founder and I fight about everything" → SKIP
"I want to pivot my SaaS to enterprise" → enterprise is more profitable than SMB
"I should quit my job" → SKIP`,
      situation,
      60
    )

    if (!assumption || assumption === 'SKIP' || assumption.trim().length < 8) {
      return null
    }

    // ── PASS 2: Search for contradiction evidence ────────────
    const searchQuery = `evidence against "${assumption}" business data 2024 2025`

    const raw = await tavilySearch(searchQuery)

    if (!raw || raw.trim().length < 20) {
      return null
    }

    // ── PASS 3: Format into one clean signal line ────────────
    const signal = await groqFast(
      `Compress this search result into ONE sentence. Maximum 20 words.
Must include a specific number, percentage, or named data point if present in the result.
Must contradict or complicate the assumption provided.
No hedging. No "according to". No source attribution. Just the fact.
Output ONLY the sentence. Nothing else.`,
      `Assumption: ${assumption}\nSearch result: ${raw}`,
      60
    )

    if (!signal || signal.trim().length < 10) {
      return null
    }

    return {
      assumption: assumption.trim(),
      signal: signal.trim(),
      searchQuery,
      raw,
    }
  } catch (err) {
    // Always fail silently — never block door generation
    console.error('[assumptionEngine] Silent failure:', err)
    return null
  }
}
