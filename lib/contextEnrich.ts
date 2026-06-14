// ============================================================
// ZYVV MANA — Context Enrichment Engine
// File: lib/contextEnrich.ts
// Purpose: Two-pass pre-processing before generateDoors()
//   Pass 1: Extract a precise search query from the situation (Groq fast)
//   Pass 2: Fetch one verified external signal via Tavily
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

    // ── PASS 2: Fetch verified external signal via Tavily ────
    const tavilyRes = await fetch('https://api.tavily.com/search', {
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

    const tavilyData = await tavilyRes.json()
    const raw = tavilyData.answer || tavilyData.results?.[0]?.content || null

    if (!raw || raw.trim().length < 10) {
      return null
    }

    // ── Compress into one clean signal line ──────────────────
    const compressRes = await fetch(GROQ_URL, {
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
            content: `Compress this search result into ONE sentence. Maximum 20 words.
Must include a specific number, percentage, or named data point if present.
No hedging. No "according to". No source attribution. Just the fact.
Output ONLY the sentence.`,
          },
          { role: 'user', content: `Query: ${query}\nResult: ${raw}` },
        ],
      }),
    })

    const compressData = await compressRes.json()
    const signal = compressData.choices?.[0]?.message?.content?.trim()

    if (!signal || signal.trim().length < 10) {
      return null
    }

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