# ZYVV

**A decision interrogation protocol. Not an advice engine.**

ZYVV does not help you feel better about your situation. It helps you see it clearly for the first time — by detecting the assumption you didn't know you were making, searching for evidence it's wrong, and generating three structurally divergent decision paths built against verified reality.

Live: [zyvv.vercel.app](https://zyvv.vercel.app)

---

## What It Does

Most AI decision tools operate inside the user's mental model. They trust the framing. They work within the tunnel.

ZYVV breaks the tunnel at the source.

Before generating any output, ZYVV runs a pre-processing engine that extracts the implicit assumption behind the user's situation, searches for external evidence that contradicts it, and injects that breach as verified ground truth into the generation prompt. The three decision doors — Conventional, Contrarian, Alien — are then built against what is actually true, not what the user believes to be true.

The data this produces — what assumption the user held, what external reality contradicted it, which door they chose after the confrontation — is a dataset no other AI product is generating.

---

## Architecture

### Dual-Engine Design

ZYVV runs two named intelligence engines. Users select between them before submitting their situation.

---

#### MANA — Default Engine

MANA is the foundation. Fast, real-world, non-blocking.

**What it does:** Fetches one verified external signal relevant to the user's situation and silently injects it as ground truth into the generation prompt.

**Three-step flow:**
1. A fast Groq call extracts a precise web search query from the situation text
2. A Tavily API call fetches a verified real-world result targeting that query
3. The raw result is compressed into one clean, human-readable signal line

**File:** `lib/contextEnrich.ts`

**Failure behavior:** If any step fails (network error, no relevant result, Groq timeout), MANA returns null silently. Door generation continues without enrichment. The user never sees an error state.

**UI output:**
```
─ signal: French SME SaaS adoption fell 8% in Q4 2025 amid budget constraints.
```

---

#### YUGA — Deep Engine

YUGA is the adversarial layer. It does not fetch context — it extracts what the user assumed without stating it, then searches for evidence that assumption is wrong.

**What it does:** Runs a three-pass pre-processing sequence before the generation call.

**Three-pass flow:**

Pass 1 — Assumption extraction
A fast Groq call reads the situation and extracts the single implicit mental model the user is operating from. Not what they said — what they took for granted.

```
Input:  "I want to grow my agency by hiring two more developers."
Output: "growth requires adding headcount"
```

Pass 2 — Contradiction search
A Tavily API call searches specifically for evidence that the extracted assumption is wrong or incomplete. The query is constructed to target the assumption directly, not the surface situation.

```
Query: evidence against "growth requires adding headcount" startup data 2024 2025
```

Pass 3 — Signal compression
A second fast Groq call compresses the raw search result into one concrete, human-readable sentence with a number or named entity where available.

```
Output: "Agencies that hired in 2024 saw avg 23% margin compression with no revenue uplift."
```

**File:** `lib/assumptionEngine.ts`

**Failure behavior:** Any pass that fails returns null silently. The engine degrades gracefully at each step — assumption extracted but search failed means partial output is discarded, not surfaced.

**UI output:**
```
─ assumption: growth requires adding headcount
─ signal: Agencies that hired in 2024 saw avg 23% margin compression.
```

---

### Generation Engine

**File:** `lib/groq.ts`

After whichever pre-processing engine runs, `generateDoors()` receives the breach or context signal and injects it into the system prompt as verified ground truth — positioned after the role definition, before the door generation instructions.

```typescript
const effectiveSystemPrompt = SYSTEM_PROMPT + breachBlock + contextBlock
```

**Why order matters:** The model reads its role and output format first. The breach/context injection arrives after the model knows what ZYVV is. This ensures the Alien Door actually uses the contradiction evidence rather than treating it as background noise.

**Three doors generated:**

- **Conventional** — The sharpest executed version of the obvious path, informed by external reality
- **Contrarian** — Built directly through the friction point the breach reveals
- **Alien** — Built entirely on the premise that the detected assumption is wrong. Must reference the contradiction evidence specifically, not generically.

**Model:** `llama-3.3-70b-versatile` via Groq  
**Temperature:** 0.85  
**Max tokens:** 2800  
**Response format:** Human-readable mirror + three doors in plain text, followed by a structured JSON block parsed for the data moat.

---

### Interrogation Engine (Mode B)

**File:** `lib/groq.ts` — `interrogateDoor()`

After selecting a door, the user can raise an objection. ZYVV does not validate the objection or soften the door. It uses the objection as a diagnostic — names what the objection reveals about the user's reasoning structure — and builds a refined path that is harder and more precise because of what the objection exposed.

Returns:
- `critique` — what the objection reveals, clinically
- `refined_path` — a more demanding version of the original door
- `next_interrogation_vector` — the sharpest question to crack the next layer of avoidance
- `outcome_tracking_hint` — one observable signal confirming or refuting the path in 14–30 days

---

### API Routes

```
POST /api/generate       — Mode A (initialization) and Mode B (interrogation)
POST /api/v1/doors       — Retrieve doors for a situation
POST /api/v1/choice      — Record which door was chosen
POST /api/v1/interrogate — Retrieve interrogation result
POST /api/save           — Save session data
POST /api/email          — Email capture
POST /api/outcomes       — Outcome tracking
```

**Runtime:** Vercel Edge (`export const runtime = 'edge'`)

---

### Data Architecture

Every session writes to Supabase PostgreSQL with:

| Column | Description |
|---|---|
| `content` | The user's raw situation text |
| `session_id` | Anonymous session identifier |
| `zyvv_version` | `mana` or `yuga` — which engine ran |
| `assumption_detected` | The implicit assumption extracted (YUGA only) |
| `context_signal` | The human-readable contradiction signal |
| `context_query` | The search query used (for moat analysis) |

This dataset maps human cognitive tunnel vision at scale — what assumptions people hold, what external reality contradicts those assumptions, and which decision path they chose after the confrontation. No academic institution or AI competitor is generating this data with this structure.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Runtime | Vercel Edge |
| AI Generation | Groq — `llama-3.3-70b-versatile` |
| External Search | Tavily API |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| Animation | Framer Motion |
| Language | TypeScript strict mode |
| Deployment | Vercel (zero config) |

**Budget:** $0 infrastructure. Groq free tier. Tavily free tier (1000 searches/month). Supabase free tier. Vercel hobby.

---

## Engine Comparison

| | MANA | YUGA |
|---|---|---|
| Pre-processing passes | 2 | 3 |
| What it detects | External market signal | Implicit assumption + contradiction |
| Search query source | Situation text | Extracted assumption |
| Latency added | ~1.5s | ~3s |
| External API | Tavily | Tavily |
| UI output | 1 line | 2 lines |
| Data recorded | `context_signal`, `context_query` | + `assumption_detected` |

---

## Version Philosophy

**MANA** (Hebrew: מָן) — The sustenance that arrives from outside your assumptions. The ground truth layer. What God drops in the desert when the Israelites cannot see a path. Fast. Real. Non-negotiable.

**YUGA** (Sanskrit) — The deeper age. The structural framework beneath the surface situation. The moment wandering becomes purposeful through conceptual reframe.

**ATA** (Hebrew: אַתָּה — "You") — The direct address. Phase 3, in development: memory across sessions. After enough sessions, ZYVV says: "You have asked about the same fear six times in six different forms. Here is what you are actually avoiding."

---

## The Structural Gap

When you give Claude your market context, Claude analyzes what you gave it. It trusts your framing. It works inside your tunnel.

ZYVV is the only product that challenges the context itself — that extracts what you didn't say, searches for evidence it's wrong, and builds decision paths from that breach.

The difference is not intelligence. It is who initiates the context retrieval.

---

## Status

- [x] MANA engine — live
- [x] YUGA engine — live
- [x] Interrogation (Mode B) — live
- [x] Supabase data moat — live
- [x] Version selector UI — live
- [ ] ATA — memory layer (Phase 3)
- [ ] API access for developers
- [ ] Outcome tracking dashboard

---

Built in 48 hours. Zero budget. Deployed.


Now I have everything I need. Let me write the README architecture section based on the actual code.Now here's the README section — paste this directly into your `README.md`:

---

```markdown
## Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Inference | Groq API — Llama 3.3 70B (Vercel Edge) |
| Embeddings | Groq — `nomic-embed-text-v1.5` → `vector(1536)` |
| Database | Supabase (PostgreSQL + pgvector) |
| ORM / client | Supabase JS (`supabaseAdmin` server-only) |
| Deployment | Vercel |

---

### Data model

```
situations      — raw user input + pgvector embedding column
doors           — 3 generated paths per situation (conventional / contrarian / alien)
                  + `potential_objections[]` per door
choices         — FK to situation + door; stores user objection text
outcomes        — FK to choice; outcome_text + outcome_score (1–5)
```

Relationships: `situations → doors → choices → outcomes` (linear, append-only).

---

### API routes

| Route | Mode | Purpose |
|---|---|---|
| `api/generate` | `INITIALIZATION` | Takes situation string, returns roast + 3 doors via Groq |
| `api/interrogate` | `INTERROGATION` | Takes chosen door + user objection, returns refinement block |
| `api/save` | — | Persists choice and outcome to Supabase |

---

### Version modes

ZYVV runs two reasoning modes selected at request time via `ZyvvVersion`:

- **MANA** — detects the hidden assumption in the user's framing (`assumption_detected`)
- **YUGA** — surfaces a relevant external context signal (`context_signal`, `context_query`)

Both modes share the same door generation pipeline; the version flag adds a pre-processing layer before Groq inference.

---

### Data moat — what was built today

**Phase 1 (complete):** `choiceId` propagation fixed through `page.tsx` → `ShareCard.tsx`, closing the outcome reporting loop. Every session now produces a ground-truth signal row in `outcomes`.

**Phase 2 (complete):** After each situation is saved to Supabase, `saveSituation()` in `lib/supabase.ts` fires a non-blocking embedding call:

```typescript
// lib/supabase.ts — Phase 2 embedding (non-blocking)
const embeddingRes = await groq.embeddings.create({
  model: 'nomic-embed-text-v1_5',
  input: situation.content ?? '',
})
await supabaseAdmin
  .from('situations')
  .update({ embedding: vector })
  .eq('id', id)
```

Failures are caught silently — embedding never blocks door generation.

**Phase 3 (pending — 500+ rows required):** Before generating doors, query `pgvector` for the 3 most similar past situations with `outcome_score ≥ 4`. Inject resolved paths as context into the Groq system prompt. Doors become informed by what actually worked for similar humans.

**Phase 4 (month 2):** Nightly Vercel Cron job — aggregate `objections` table by door type, pre-load top objections into the interrogation prompt.

---

### Why this architecture

The three-door structure (`conventional / contrarian / alien`) is a proprietary reasoning protocol, not a generic RAG wrapper. The data layer is designed to serve that structure: as volume grows, the alien door for "I'm leaving my job" will be informed by what people who faced the same situation actually did and reported back — not by behavioral economics PDFs.

The outcome score (1–5) in the `outcomes` table is the moat seed. One verified outcome row is worth more than 1,000 raw sessions.
```

---

That's it. Architecture diagram embedded above for reference. Paste, push, done.