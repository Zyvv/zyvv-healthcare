// ============================================================
// ZYVV YUGA — Context Enrichment Engine
// File: lib/contextEnrich.ts
// Purpose: Two-pass pre-processing before generateDoors()
//   Pass 1: Extract a precise search query from the situation (Groq fast)
//   Pass 2: Fetch one verified external signal via Groq
// Returns: ContextSignal | null — null always fails silently
// ============================================================

export interface ContextSignal {
  signal: string    // One-line human-readable fact shown to user
  query: string     // Search query used — stored for data moat
  raw: string       // Raw result injected into Groq system prompt
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function enrichContext(
  situation: string
): Promise<ContextSignal | null> {
  try {
    // ── PASS 1: Extract precise search query ─────────────────
    const extractRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 60,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You extract a single web search query from a user situation.
Output ONLY the search query. No quotes. No explanation. No punctuation at end.
The query must target a verifiable external fact: market data, competitor move, cultural dynamic, industry stat, regulatory signal.
If the situation is purely personal (relationship, emotion, lifestyle) output: SKIP

Examples:
Situation: "I want to launch a B2B SaaS for French SMEs" → french SME SaaS adoption rate 2025
Situation: "Should I quit my job" → SKIP
Situation: "Expanding my agency to Southeast Asia" → Southeast Asia freelance market growth 2025
Situation: "My co-founder and I disagree on pricing" → SKIP
Situation: "I want to raise a seed round in Europe" → European seed funding trends 2025`,
          },
          { role: 'user', content: situation },
        ],
      }),
    })

    const extractData = await extractRes.json()
    const query = extractData.choices?.[0]?.message?.content?.trim()

    if (!query || query === 'SKIP' || query.trim().length < 5) {
      return null
    }

    // ── PASS 2: Fetch one verified external signal ───────────
    const searchRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 200,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are a research assistant. For the given query, return ONE concrete, verifiable fact as a single sentence.
Include a number, percentage, or named entity where possible.
Maximum 25 words. No hedging. No "according to". No source attribution. Just the fact.
Output ONLY the sentence.`,
          },
          { role: 'user', content: `Research this: ${query}` },
        ],
      }),
    })

    const searchData = await searchRes.json()
    const raw = searchData.choices?.[0]?.message?.content?.trim()

    if (!raw || raw.trim().length < 10) {
      return null
    }

    const signal = raw.length > 120 ? raw.slice(0, 117) + '...' : raw

    return {
      signal: signal.trim(),
      query: query.trim(),
      raw: raw.trim(),
    }
  } catch (err) {
    // Always fail silently — never block door generation
    console.error('[contextEnrich] Silent failure:', err)
    return null
  }
}
