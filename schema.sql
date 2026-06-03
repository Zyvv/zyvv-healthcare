-- ============================================================
-- ZYVV — Supabase Schema
-- File: supabase/schema.sql
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable pgvector extension (required for Phase 3 similarity search)
create extension if not exists vector;

-- ============================================================
-- SITUATIONS
-- Every situation dropped into ZYVV, anonymized by default.
-- ============================================================
create table situations (
  id          bigserial primary key,
  content     text not null,
  embedding   vector(1536),           -- Phase 3: semantic similarity search
  session_id  text,                   -- Anonymous session identifier (no login required)
  email       text,                   -- Optional: user provides for follow-up emails
  created_at  timestamptz default now()
);

-- ============================================================
-- DOORS
-- Every door generated for a situation.
-- door_type is enforced: conventional | contrarian | alien
-- ============================================================
create table doors (
  id            bigserial primary key,
  situation_id  bigint references situations(id) on delete cascade,
  door_type     text check (door_type in ('conventional', 'contrarian', 'alien')),
  title         text,
  description   text,
  why_it_works  text,
  created_at    timestamptz default now()
);

-- ============================================================
-- CHOICES
-- Which door a user picked. The core behavioral signal.
-- ============================================================
create table choices (
  id            bigserial primary key,
  situation_id  bigint references situations(id) on delete cascade,
  door_id       bigint references doors(id) on delete cascade,
  chosen_at     timestamptz default now()
);

-- ============================================================
-- OUTCOMES
-- Phase 2+: users report back what happened after choosing a door.
-- outcome_score 1–5. This is the ground truth that makes Phase 3 possible.
-- ============================================================
create table outcomes (
  id            bigserial primary key,
  choice_id     bigint references choices(id) on delete cascade,
  outcome_text  text,
  outcome_score integer check (outcome_score between 1 and 5),
  reported_at   timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Anonymous inserts are allowed (no auth required for Phase 1).
-- Reads are locked down — only service key can read data.
-- This protects user situations from being exposed publicly.
-- ============================================================

alter table situations  enable row level security;
alter table doors       enable row level security;
alter table choices     enable row level security;
alter table outcomes    enable row level security;

-- Public INSERT policies (anon key can write, cannot read)
create policy "Public insert situations"  on situations  for insert with check (true);
create policy "Public insert doors"       on doors       for insert with check (true);
create policy "Public insert choices"     on choices     for insert with check (true);
create policy "Public insert outcomes"    on outcomes    for insert with check (true);

-- ============================================================
-- INDEXES
-- Phase 1: created_at index for basic ordering.
-- Phase 3: ivfflat index on embedding for ANN similarity search.
--          (Uncomment when you have >1000 rows in situations.)
-- ============================================================

create index situations_created_at_idx on situations (created_at desc);
create index doors_situation_id_idx    on doors (situation_id);
create index choices_situation_id_idx  on choices (situation_id);

-- Phase 3 vector index (uncomment when ready):
-- create index situations_embedding_idx on situations
--   using ivfflat (embedding vector_cosine_ops)
--   with (lists = 100);

-- ============================================================
-- PORTAL COUNTER VIEW
-- Powers the live "X portals opened" counter on the homepage.
-- ============================================================
create view portal_count as
  select count(*) as total from situations;

-- Grant anon read on the counter view only
grant select on portal_count to anon;
