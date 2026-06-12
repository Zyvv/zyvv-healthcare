# ZYVV

**Three doors ChatGPT won't open.**

ZYVV is a decision protocol, not a chatbot. It diverges. It interrogates. It compounds. Every stuck moment, every door chosen, every doubt raised becomes infrastructure — a living dataset of human decision-making that no competitor can buy.

---

## The One-Paragraph Manifesto

AI converges to an answer. ZYVV diverges to the truth.

We use the Talmudic protocol of divergence and interrogation to break cognitive tunnel vision. When you are stuck, we generate three competing paths — not a single answer. When you doubt, we force you to stress-test your logic. We are not an AI that gives advice. We are the protocol that builds conviction.

**Diverge. Interrogate. Decide.**

---

## The Problem (8 Billion People)

Cognitive tunnel vision is the most universal human condition that technology has never meaningfully addressed.

It is not a Gen Z problem. Not a Western problem. Not a privileged problem. A teenager choosing a career, a 40-year-old in a dead marriage, an entrepreneur who can't see past a failing model, a farmer in rural India who doesn't know alternatives exist — all trapped by the same invisible wall: *"I have no other option."*

Every existing solution — therapy, coaching, self-help, ChatGPT — gives you more information down the same tunnel. None of them break the tunnel itself.

**ZYVV breaks the tunnel.**

---

## What ZYVV Does

You drop your situation. ZYVV roasts your current path — brutally, honestly, with the clarity of something that has no stake in your comfort — then opens three hidden doors:

- **The Conventional Door** — the best version of the path most people take
- **The Contrarian Door** — the path that runs against the obvious grain
- **The Alien Door** — the path that assumes the problem is the wrong problem

Then it goes further.

You pick a door. You raise a doubt. ZYVV interrogates your doubt — not to dismiss it, but to stress-test your logic and return a refined path. The objection is recorded. The refined path is stored. The loop closes.

This is not a chatbot. This is a decision-making protocol that gets smarter with every human who uses it.

---

## The Talmudic Protocol (The Technical Differentiator)

The engine runs two modes:

**MODE A — INITIALIZATION**
User drops a stuck moment. Engine outputs three divergent paths with brutal diagnostic logic.

**MODE B — INTERROGATION**
User selects a door and raises a doubt. Engine stress-tests the doubt, outputs a refined path and a next interrogation vector.

The structural parallel: The Talmud records Rabbi X saying one thing, Rabbi Y disagreeing, and real situations adjudicating between them. Not abstract philosophy — lived human experience, aggregated, argued over, passed forward. ZYVV mirrors that mechanism exactly:

| | Oral Torah | ZYVV |
|---|---|---|
| **Source of authority** | Sinai, transmitted through sacred chain | Aggregated human experience |
| **Content** | Divine commandment and interpretation | Human decision-making patterns |
| **Purpose** | Covenant, holiness, relationship with God | Breaking cognitive tunnel vision |
| **Mechanism** | Living transmission, debate, accumulation | Living transmission, interrogation, accumulation |

The content is entirely different. The mechanism rhymes.

> ZYVV does not claim participation in the halachic tradition or the authority of Sinai. The parallel is structural — the compounding intelligence mechanism, not the sacred content.

---

## The Data Moat

ChatGPT never knows why a user rejected its advice.

ZYVV records:

```json
{
  "selected_door": "alien",
  "user_objection": "insufficient funds",
  "refined_path": "...",
  "outcome_score": 4
}
```

Every session writes: the situation, the AI output, the human decision, the doubt raised, the refined path taken, and — in Phase 2 — the outcome reported back.

This is a **Decision Failure Database**. In 6 months, ZYVV will know exactly why people reject certain strategies. The Alien door logic will proactively address the "insufficient funds" objection before the user raises it. The doors get smarter. The moat widens.

**This data cannot be bought. It can only be grown.**

Most AI apps are faucets — they generate output and forget. Every session starts from zero.

ZYVV is a reservoir. Every session adds to a collective body of knowledge about human stuck-ness and human breakthrough. Over time, the doors are not just AI-generated — they are drawn from the lived experience of millions of humans who walked similar paths and reported back.

This is what makes ZYVV an acquisition target, not just a product:

- **Predictive analytics:** which strategy succeeds for which situation type
- **Proprietary signal:** the only dataset linking human doubt to strategic intervention
- **RLHF ground truth:** structured human decision-making data that makes any LLM trained on it objectively better at life and business decisions
- **System of record:** users cannot leave — their entire decision history lives here

---

## API v1 — The Moat Compounds Regardless of Surface

The data moat thesis depends on volume. Volume requires the protocol to reach users wherever they already are — not just zyvv.app.

**ZYVV API v1 is live.**

A developer with an AI agent connected to 30+ services asked a direct question: *what would make this useful inside my workflow?* The answer shipped in the same week.

Every API call writes to the same `situations`, `doors`, and `choices` tables as the consumer app. The dataset compounds whether the user is on the web app, embedded in an agent, or piped through a third-party workflow. The surface is irrelevant. The data lands.

### What the API exposes

Three endpoints. The full protocol, auth-gated and rate-limited:

| Endpoint | What it does |
|---|---|
| `POST /api/v1/doors` | Drop a situation. Get roast + three structured paths + `situation_id` |
| `POST /api/v1/choice` | Record which door was chosen. Returns `choice_id` for the data chain |
| `POST /api/v1/interrogate` | Raise an objection on the chosen door. Get refined path + next interrogation vector |

Authentication: `Authorization: Bearer <api_key>`. Rate limit: 100 requests/hour per key.

### Why this matters to investors

ZYVV is not competing with Claude's API or OpenAI's. It is complementary — it gives developers the Talmudic interrogation protocol and the accumulating choice/objection dataset that general-purpose LLM APIs structurally cannot provide. Every integration that calls `/api/v1/doors` is another data source feeding the moat, not a distribution cost.

See [`API.md`](./API.md) for full endpoint reference.

---

## Product Phases

**Phase 1 — The Protocol (Shipped)**
Input → roast → three doors → interrogation → refined path → share card. Under 15 seconds. No login. No friction. Pure viral loop. The `choiceId` tracking is live. Every door pick writes a `choice_id` to Supabase and carries it through to the share card. The loop is closed.

**Phase 1.5 — The API Surface (Shipped)**
External developers and agents can call the full protocol via authenticated API. Every API call writes to the same dataset as the app. The moat compounds from multiple surfaces simultaneously.

**Phase 2 — The Memory Layer (Weeks 2–4)**
ZYVV remembers your patterns. After 5 sessions: *"You keep asking about the same relationship in 6 different forms. Here's what you're actually avoiding."* Not therapy. A mirror with memory.

**Phase 3 — The Collective Intelligence Layer (Month 2+)**
Doors are no longer just AI-generated — drawn from real humans who walked similar paths. Outcomes tracked anonymously. The system gains ground truth.

*"47 people who felt stuck like you chose Door 2. 31 of them said it changed their life."*

**Phase 4 — The Living Network (Long Term)**
A global, anonymous, living record of human decisions and their consequences. The world's first dataset of stuck moments and what broke them. Research-grade. Culture-shifting. Entirely user-generated.

---

## Core Viral Mechanic

1. **Land.** One input. One button. Nothing else.
2. **Drop your situation.** Raw, honest, unfiltered.
3. **Get roasted.** Brutal. True.
4. **Three doors appear.** Animated. Distinct. Unexpected.
5. **Pick one. Raise a doubt. Get a refined path.**
6. **Share.** One tap. TikTok. X. Instagram.

No signup. No friction. The share card does the acquisition.

---

## Technology Stack

### Philosophy
Extreme leanness at launch. Every choice justified by necessity, not preference. Fully deployable via GitHub browser interface — no local setup, no terminal.

### Frontend
- **Next.js 14 App Router** — React server components, API routes, edge runtime
- **Tailwind CSS** — utility-first, zero design system overhead
- **Framer Motion** — purposeful animation. Nothing bounces. Nothing is cute.
- **TypeScript strict mode** — prevents the bugs that kill solo founders at 2am

### Backend / AI
- **Groq (llama-3.3-70b-versatile)** — inference speed is a product feature. If doors take 8 seconds, the magic dies.
- **Python (FastAPI)** — microservice for the intelligence layer. JS generates doors. Python will understand what the doors mean at scale.

### Database
- **Supabase (PostgreSQL + pgvector)** — chosen over Firebase specifically because pgvector makes Phase 3 possible without a migration
  - `situations` — every stuck moment, anonymized
  - `doors` — every path generated, typed
  - `choices` — which door was chosen, with `choice_id` carried to ShareCard
  - `outcomes` — Phase 2+ outcome reporting
  - `api_keys` — external integrator auth (Phase 1.5)
  - `api_requests_log` — rate limiting + usage analytics
  - Vector embeddings for Phase 3 similarity search

### Infrastructure
- **Resend + React Email** — retention mechanism. Email brings users back to report outcomes. Outcomes feed the intelligence layer.
- **Vercel** — zero config. GitHub push = deploy.

### Future Stack (Phase 3+)
- **pgvector** — semantic similarity across the situations database
- **LangChain (Python)** — RAG over the outcomes database
- **Vercel Cron** — nightly pattern analysis and door quality scoring
- **Upstash Redis** — rate limiting, frequent pattern caching
- **WebSockets** — real-time "others are walking through this door right now"

Nothing in Phase 1 blocks any of this. The architecture is a foundation, not a ceiling.

---

## File Structure

```
zyvv/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                         # Main page — all 8 phases
│   ├── api/
│   │   ├── generate/route.ts            # MODE A + MODE B (Talmudic Protocol)
│   │   ├── save/route.ts                # Writes choice, returns choice_id
│   │   ├── email/route.ts               # Resend transactional email
│   │   ├── outcomes/route.ts            # Outcome reporting (Phase 2)
│   │   └── v1/                          # External API surface (Phase 1.5)
│   │       ├── doors/route.ts           # POST /api/v1/doors
│   │       ├── choice/route.ts          # POST /api/v1/choice
│   │       └── interrogate/route.ts     # POST /api/v1/interrogate
│   └── components/
│       ├── Door.tsx                     # Animated door, data-door-index attr
│       ├── ShareCard.tsx                # Share card, receives choiceId
│       └── PortalCounter.tsx            # Live portal counter
│
├── python/
│   ├── main.py                          # FastAPI entry point
│   ├── patterns.py                      # Pattern detection
│   └── embeddings.py                    # pgvector embedding generation
│
├── lib/
│   ├── supabase.ts                      # Supabase client (singleton)
│   ├── groq.ts                          # Groq client + Talmudic system prompt
│   ├── apiAuth.ts                       # API key auth + rate limiting
│   └── types.ts                         # Shared TypeScript types
│
├── supabase/
│   ├── schema.sql                       # Core schema
│   └── migrations/
│       └── 001_api_v1.sql               # api_keys + api_requests_log
│
└── API.md                               # External API reference
```

---

## Environment Variables

```
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@zyvv.app
NEXT_PUBLIC_APP_URL=https://zyvv.app
```

---

## Database Schema

```sql
create extension if not exists vector;

create table situations (
  id         bigserial primary key,
  content    text not null,
  embedding  vector(1536),
  session_id text,
  email      text,
  created_at timestamptz default now()
);

create table doors (
  id           bigserial primary key,
  situation_id bigint references situations(id),
  door_type    text check (door_type in ('conventional', 'contrarian', 'alien')),
  title        text,
  description  text,
  why_it_works text,
  created_at   timestamptz default now()
);

create table choices (
  id           bigserial primary key,
  situation_id bigint references situations(id),
  door_id      bigint references doors(id),
  chosen_at    timestamptz default now()
);

create table outcomes (
  id            bigserial primary key,
  choice_id     bigint references choices(id),
  outcome_text  text,
  outcome_score integer check (outcome_score between 1 and 5),
  reported_at   timestamptz default now()
);

-- Phase 1.5: API surface
create table api_keys (
  id          bigserial primary key,
  key_hash    text not null unique,
  owner_email text,
  label       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create table api_requests_log (
  id         bigserial primary key,
  api_key_id bigint references api_keys(id) on delete cascade,
  endpoint   text not null,
  status_code int,
  created_at timestamptz default now()
);
```

---

## Metrics That Matter

| Metric | What It Measures | Phase |
|---|---|---|
| Situations dropped / day | Core engagement | 1 |
| Share rate | Viral coefficient | 1 |
| Interrogation rate | Protocol depth | 1 |
| Objection types recorded | Moat quality | 1 |
| API calls / day | External surface adoption | 1.5 |
| Unique API integrators | Protocol distribution breadth | 1.5 |
| Return rate (7-day) | Product stickiness | 2 |
| Outcome reporting rate | Ground truth quality | 2 |
| Situation similarity matches | Intelligence layer health | 3 |
| Door outcome score (avg) | Collective wisdom quality | 3 |

---

## Design Principles

SpaceX discipline meets Higgsfield cinematic energy meets alien intelligence.

- **Black is the canvas.** Not dark grey. Not navy. Black.
- **Neon is used sparingly.** One accent per state.
- **Typography is massive and tight.** Logo at 92px. Tracking at -4px.
- **Animation is purposeful.** Doors emerge. Nothing bounces. Nothing is cute.
- **Mobile is primary.** Every decision made for 390px first.
- **No decoration.** The void is the aesthetic.

---

## What ZYVV Is Not

Not therapy. Not coaching. Not a chatbot. Not an AI wrapper. Not a productivity tool.

ZYVV is an intervention. A pattern-interrupt. A moment of radical possibility — available to anyone, in any language, on any continent, free, in under 15 seconds.

---

## Contributing

Built in public. The collective intelligence layer is the product.

Contributions to prompt engineering, pattern detection, outcome analysis, and the Python intelligence layer are welcome.

Open an issue. Make a pull request. Drop your stuck situation first — then build.

---

## License

MIT — because wisdom compounds fastest when it is free.

---

*Built with Groq · Supabase · Resend · Vercel · Next.js · Python*

**The doors have always been there. ZYVV finds them.**
