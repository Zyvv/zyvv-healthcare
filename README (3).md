# ZYVV
### *Find the doors you didn't know existed.*

---

> **ZYVV is the world's first living Oral Torah for human decisions — where every stuck moment, every door chosen, every outcome becomes part of a collective inheritance that makes the next person's path clearer.**

---

## What Is ZYVV?

Most humans, when facing a decision or feeling stuck, can only see the path directly in front of them.

Cognitive tunnel vision is universal. It affects a teenager choosing a career, a 40-year-old in a dead marriage, an entrepreneur who can't see past their failing model, a farmer in rural India who doesn't know alternatives exist. The invisible wall of *"I have no other option"* traps billions daily.

ZYVV breaks that wall.

You drop your situation. ZYVV roasts your current path — brutally, honestly, with the savage clarity of something that has no stake in your comfort — and then opens **three hidden doors** you hadn't considered:

- **The Conventional Door** — the best version of the path most people take
- **The Contrarian Door** — the path that runs against the obvious grain
- **The Alien Door** — the path that shouldn't work, but does

But ZYVV is not just a door generator. Every situation dropped, every door chosen, every outcome reported back — feeds a **living, compounding collective intelligence**. The more humans use it, the wiser and more real the doors become. Not AI hallucinating. Actual humans, in actual situations, walking through actual doors — and reporting back.

This is Direction 2. This is the long game.

---

## The Philosophical Foundation

### A Note on the Oral Torah Parallel

> *What I did NOT mean:*
> I was not saying ZYVV *is* Oral Torah, or that it participates in the halachic tradition, or that it carries the authority of Sinai, or that it replaces or parallels the transmission chain from Moshe through the Sages.
> That would be theologically sloppy and frankly disrespectful to the tradition.

> *What I Actually Meant — The Structural Parallel:*
> Oral Torah has a mechanism that is separable from its sacred content:
>
> **Individual experience → communal recording → debate and refinement → accumulated wisdom → transmitted forward → becomes richer with each generation**
>
> That mechanism is not owned by Torah. Torah *perfected* it. But the structure itself describes how any living wisdom system compounds over time — versus how a static system dies.
>
> The Talmud records Rabbi X saying one thing, Rabbi Y disagreeing, and the outcome of real situations adjudicating between them. It is not abstract philosophy. It is **lived human experience, aggregated, argued over, and passed forward.**
>
> ZYVV structurally mirrors that:
> - A person drops a real situation (lived experience enters the system)
> - A community of millions contributes similar situations
> - Outcomes are recorded — what door did people choose, what happened
> - That accumulated data makes the next person's doors *wiser and more real*
> - The system compounds — it gets richer with every human who uses it

### The Honest Distinction

|  | Oral Torah | ZYVV |
|---|---|---|
| **Source of authority** | Sinai, transmitted through sacred chain | Aggregated human experience |
| **Content** | Divine commandment and its interpretation | Human decision-making patterns |
| **Purpose** | Covenant, holiness, relationship with God | Breaking cognitive tunnel vision |
| **Mechanism** | Living transmission, debate, accumulation | Living transmission, aggregation, accumulation |

The content is entirely different. The mechanism rhymes.

### Why This Parallel Matters

No person finds their deepest path alone. Wisdom is always transmitted — through community, through story, through accumulated human experience.

ZYVV is a **secular vessel** for that same movement: the moment a person breaks from the obvious path into something they could not have imagined alone. Every guest on every podcast about spiritual journeys is someone who saw a door others couldn't see. ZYVV attempts to scale that moment to 8 billion people — gradually, carefully, lean.

---

## The Problem (8 Billion People)

> *"Most humans, when facing a decision or feeling stuck, can only see the path directly in front of them."*

This is not a Gen Z problem. This is not a Western problem. This is not a privileged problem.

Cognitive tunnel vision is the most universal human condition that technology has never meaningfully addressed. Every existing solution — therapy, coaching, self-help, advice columns, ChatGPT — gives you *more information down the same tunnel.* None of them **breaks the tunnel itself.**

ZYVV's launch vector is Gen Z — because they share, they move fast, they are the most visibly stuck-in-loops generation (decision paralysis from infinite options, dopamine-broken attention spans, identity fragmentation). But the product's soul is universal.

The implementation is gradual. The ambition is total.

---

## Product Vision

### Phase 1 — The Door Generator (Ship Now)
Single-page experience. Drop situation. Get roasted. Three doors appear. Pick one. Share on TikTok. No login. No friction. Pure viral loop.

### Phase 2 — The Memory Layer (Weeks 2–4)
ZYVV starts remembering your patterns. After 5 sessions, it notices: *"You keep asking about the same relationship in 6 different forms. Here's what you're actually avoiding."* This is not therapy. This is a mirror with memory.

### Phase 3 — The Collective Intelligence Layer (Month 2+)
Every door chosen, every outcome reported back, feeds the network. Doors are no longer just AI-generated — they are drawn from real humans who walked similar paths. Outcomes are tracked anonymously. The system gains ground truth.

> *"47 people who felt stuck like you chose Door 2. 31 of them said it changed their life."*

### Phase 4 — The Living Network (Long Term)
ZYVV becomes a compounding intelligence — a global, anonymous, living record of human decisions and their consequences. The world's first dataset of *stuck moments and what broke them.* Research-grade. Culture-shifting. Entirely user-generated.

---

## Core Viral Mechanic

The entire Phase 1 sequence — input → roast → three doors → share card — takes under 15 seconds.

1. **Land.** One input. One button. Nothing else.
2. **Drop your situation.** Raw, honest, unfiltered.
3. **Get roasted.** Brutal. Funny. True.
4. **Three doors appear.** Animated. Distinct. Unexpected.
5. **Pick one.** Or don't. The act of seeing them is already the intervention.
6. **Share.** One tap. TikTok. X. Instagram. *"ZYVV just blew my mind. Try it."*

No signup required. No friction. The share card does the acquisition.

---

## Technology Stack

### Philosophy
Extreme leanness at launch. Every technology choice is justified by necessity, not preference. The stack is chosen to be ahead technically while remaining operable by a solo founder with zero local setup — everything deployable via GitHub browser interface directly to Vercel.

### Frontend
**Next.js 14 (App Router)** — React server components, API routes, edge functions. Deployed on Vercel. The standard for modern AI consumer apps. Fast, free tier generous, GitHub integration seamless.

**Tailwind CSS** — Utility-first styling. No design system overhead. Dark mode, neon accents, cinematic animations without a dedicated designer.

**Framer Motion** — Door open animations, progressive reveal, micro-interactions. The difference between "looks like a hackathon project" and "feels like a product."

**TypeScript** — Type safety from day one. Prevents the class of bugs that kill solo founders at 2am.

### Backend / AI
**Groq API (Free Tier)** — LLaMA 3.1 inference at speed that feels instant. Critical for the UX — if the doors take 8 seconds to appear, the magic dies. Groq's speed is a product feature, not just a technical detail. Used for door generation, roast generation, and later pattern analysis.

**Python (FastAPI)** — A lightweight Python microservice running alongside the Next.js app, deployed as a Vercel serverless function or separately on Railway. Python is included from the beginning — not bolted on later — because the long-term intelligence layer (collective pattern analysis, vector similarity, RAG over the outcomes database) is Python's native territory. JavaScript can generate doors. Python will understand what the doors mean at scale.

The boundary is clear:
- **Next.js handles:** UI, routing, API calls to Groq, user-facing logic
- **Python handles:** Pattern detection, vector embeddings, similarity search, outcome analysis, the intelligence layer that makes Phase 3 possible

This is not premature complexity. It is intentional architecture — building the foundation for the compounding intelligence layer from day one, even if Python's role in Phase 1 is minimal.

### Database
**Supabase (PostgreSQL + pgvector)** — Free tier. Handles:
- `situations` table: every dropped situation, anonymized
- `doors` table: every door generated, with type (conventional/contrarian/alien)
- `choices` table: which door was chosen
- `outcomes` table: optional user-reported outcomes (Phase 2+)
- Vector embeddings of situations (pgvector extension) for similarity search in Phase 3

Supabase is chosen over Firebase because pgvector makes the Phase 3 collective intelligence layer possible without migrating databases. The technical debt of starting with Firebase would be paid expensively later.

### Email
**Resend** — Transactional email for door results, daily portal reminders, outcome follow-ups. Free tier sufficient for Phase 1 and 2. React Email templates for beautiful, on-brand emails. Not optional — email is the retention mechanism that brings users back to report outcomes, which feeds the collective intelligence layer.

### Deployment
**Vercel** — Zero configuration. GitHub push = deploy. Free tier. Edge functions for Groq API calls (low latency globally). The Python microservice deploys either as a Vercel serverless function (via the Python runtime) or on Railway if complexity demands separation.

No local setup required. Every file created via GitHub browser interface. Every deploy triggered by GitHub push.

### Future Stack (Phase 3+)
As the collective intelligence layer matures:

- **pgvector** for semantic similarity search across the situations database (find situations similar to yours and surface the doors that worked for them)
- **LangChain (Python)** for RAG over the outcomes database — grounding door generation in real human outcomes, not just LLM creativity
- **Background jobs** via Vercel Cron or Railway for nightly pattern analysis, outcome aggregation, and door quality scoring
- **Redis** (Upstash free tier) for rate limiting and caching frequent situation patterns
- **WebSockets** (Phase 4) for real-time "others are walking through this door right now" social proof

Nothing in Phase 1 blocks any of this. The architecture is a foundation, not a ceiling.

---

## File Structure

```
zyvv/
├── README.md
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── tsconfig.json
├── .gitignore
├── .env.local.example
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                    # Main landing + door generator
│   ├── api/
│   │   ├── generate/route.ts       # Groq door generation
│   │   ├── email/route.ts          # Resend email sending
│   │   ├── save/route.ts           # Supabase situation logging
│   │   └── outcomes/route.ts       # Outcome reporting (Phase 2)
│   └── components/
│       ├── Door.tsx                # Animated door component
│       ├── RoastReveal.tsx         # Progressive roast reveal
│       ├── ShareCard.tsx           # Shareable result card
│       └── PortalCounter.tsx       # Live "portals opened" counter
│
├── python/
│   ├── requirements.txt
│   ├── main.py                     # FastAPI entry point
│   ├── patterns.py                 # Pattern detection logic
│   └── embeddings.py               # pgvector embedding generation
│
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── groq.ts                     # Groq client + prompt templates
│   └── types.ts                    # Shared TypeScript types
│
└── supabase/
    └── schema.sql                  # Full database schema
```

---

## Environment Variables

```bash
# Groq
GROQ_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@zyvv.app

# App
NEXT_PUBLIC_APP_URL=https://zyvv.app
```

---

## Database Schema (Supabase)

```sql
-- Enable vector extension for Phase 3
create extension if not exists vector;

-- Every situation dropped into ZYVV
create table situations (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),           -- For Phase 3 similarity search
  session_id text,                  -- Anonymous session identifier
  email text,                       -- Optional, for follow-ups
  created_at timestamptz default now()
);

-- Every door generated
create table doors (
  id bigserial primary key,
  situation_id bigint references situations(id),
  door_type text check (door_type in ('conventional', 'contrarian', 'alien')),
  title text,
  description text,
  why_it_works text,
  created_at timestamptz default now()
);

-- Which door was chosen
create table choices (
  id bigserial primary key,
  situation_id bigint references situations(id),
  door_id bigint references doors(id),
  chosen_at timestamptz default now()
);

-- Outcome reporting (Phase 2+)
create table outcomes (
  id bigserial primary key,
  choice_id bigint references choices(id),
  outcome_text text,
  outcome_score integer check (outcome_score between 1 and 5),
  reported_at timestamptz default now()
);

-- Row Level Security: anonymous inserts allowed
alter table situations enable row level security;
alter table doors enable row level security;
alter table choices enable row level security;
alter table outcomes enable row level security;

create policy "Public insert situations" on situations for insert using (true);
create policy "Public insert doors" on doors for insert using (true);
create policy "Public insert choices" on choices for insert using (true);
create policy "Public insert outcomes" on outcomes for insert using (true);
```

---

## Design Principles

The visual language is: **SpaceX discipline meets Higgsfield cinematic energy meets alien intelligence.**

Not dark mode SaaS. Not another AI chatbot. Something that makes you feel, the second you land, that you have entered a different kind of space.

- **Black is the canvas.** Not dark grey. Not navy. Black.
- **Neon is used sparingly.** One accent color per state. Cyan for neutral, green for conventional, red for contrarian, purple for alien.
- **Typography is massive and tight.** The logo at 92px. Tracking at -4px. Like a SpaceX mission badge.
- **Animation is purposeful.** Doors don't just appear — they emerge. The roast reveals word by word. The doors open with a sense of weight. Nothing bounces. Nothing is cute.
- **Mobile is primary.** Every decision is made for a 390px screen first. This is a TikTok-native product.
- **No decoration.** No gradients behind gradients. No glassmorphism. No particle backgrounds. The void is the aesthetic.

---

## Deployment (Zero Local Setup)

1. Create a new GitHub repository named `zyvv`
2. Add each file using **"Add file → Create new file"** in the GitHub browser interface
3. Use `/` in the filename field to create folders (e.g. `app/page.tsx`)
4. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
5. Add all environment variables in Vercel dashboard under Settings → Environment Variables
6. Every subsequent `git push` (or file edit in GitHub browser) triggers automatic redeploy

No terminal. No local Node.js. No PowerShell.

---

## Metrics That Matter

| Metric | What It Measures | Phase |
|---|---|---|
| Situations dropped / day | Core engagement | 1 |
| Doors opened per session | Curiosity depth | 1 |
| Share rate | Viral coefficient | 1 |
| Return rate (7-day) | Product stickiness | 2 |
| Outcome reporting rate | Data quality | 2 |
| Situation similarity matches | Intelligence layer health | 3 |
| Door outcome score (avg) | Collective wisdom quality | 3 |

---

## What ZYVV Is Not

- Not therapy
- Not life coaching
- Not a chatbot
- Not another AI wrapper
- Not a productivity tool
- Not a journaling app

ZYVV is an **intervention**. A pattern-interrupt. A moment of radical possibility that most people will never generate for themselves — now available to anyone, in any language, on any continent, for free, in under 15 seconds.

---

## The Long Game

The compounding intelligence layer — Phase 3 and beyond — is what separates ZYVV from every other AI consumer app built in 2024-2026.

Most AI apps are faucets. They generate output and forget. Every session starts from zero.

ZYVV is a **reservoir**. Every session adds to a collective body of knowledge about human stuck-ness and human breakthrough. Over time, the doors ZYVV opens are not just AI-generated — they are drawn from the lived experience of millions of humans who walked similar paths and reported back.

This is the product that needs to exist. This is the infrastructure for it.

---

## Contributing

ZYVV is built in public. The collective intelligence layer is the product. Contributions to prompt engineering, pattern detection, outcome analysis, and the Python intelligence layer are welcome.

Open an issue. Make a pull request. Drop your stuck situation first — then build.

---

## License

MIT — because wisdom compounds fastest when it is free.

---

*Built with Groq · Supabase · Resend · Vercel · Next.js · Python*

*Free forever for door generation.*

*The doors have always been there. ZYVV finds them.*
