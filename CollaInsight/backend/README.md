# Backend (Idea Agent PoC)

**This is a proof-of-concept, not the production backend.** Its only job is
to prove the full architecture works end-to-end for the presentation:

```
Telegram (/idea) -> n8n -> this backend -> LangGraph Idea Agent -> Supabase -> n8n -> Telegram reply
```

It intentionally does not implement the full `KnowledgeItem` schema from
`docs/engineering/07_DATABASE_SCHEMA.md`, authentication, or the other five
agents. Those come later, once this PoC has proven the shape works - see
`docs/PROJECT_UNDERSTANDING.md` for the real phase plan.

## What's here

- `ai/idea_agent.py` - the LangGraph agent (StateGraph + MessagesState + tool calling).
- `ai/tools.py` - `search_similar_ideas` and the two terminal tools (`save_knowledge`, `flag_as_duplicate`), backed by Supabase.
- `ai/idea_agent_prompt.md` - the agent's system prompt (source of truth; `idea_agent.py` reads it directly).
- `api/main.py` - FastAPI app exposing `POST /api/idea`, matching the contract the n8n workflow expects.

## Setup

1. **Python deps** (from `backend/`):
   ```bash
   pip install -r requirements.txt
   ```

2. **Supabase table.** This PoC uses one minimal table, not the production schema. Create any Supabase project (a throwaway one is fine) and run:
   ```sql
   create table poc_ideas (
     id bigint generated always as identity primary key,
     idea_text text not null,
     title text not null,
     summary text not null,
     tags jsonb not null default '[]',
     keywords jsonb not null default '[]',
     concepts jsonb not null default '[]',
     assumptions jsonb not null default '[]',
     open_questions jsonb not null default '[]',
     telegram_display_name text,
     telegram_chat_id text,
     telegram_chat_title text,
     telegram_message_id text,
     created_at timestamptz not null default now()
   );
   ```
   This is deliberately not saved under `supabase/migrations/` - that folder is reserved for the real production schema, which starts once Phase 1 workflow validation passes (see `supabase/migrations/README.md`).

   `telegram_display_name` is username-or-first_name, not Telegram's numeric `from.id`. The numeric ID is a persistent personal identifier and nothing in the MVP links it to an account (`07_DATABASE_SCHEMA.md`'s scope note: participants are identified by raw username/first name only) - so it's intentionally never captured or stored here.

3. **Environment.** Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`.

4. **Run it:**
   ```bash
   uvicorn api.main:app --reload --port 8000
   ```
   Check `http://localhost:8000/health` returns `{"status": "ok"}`.

## Wiring it to the n8n workflow

The n8n workflow (`automation/workflows/collainsight-mvp-idea-agent.json`) has a placeholder URL on its **Call Idea Agent** node: `http://YOUR_BACKEND_URL:8000/api/idea`.

- If n8n and this backend both run directly on your machine: use `http://localhost:8000/api/idea`.
- If n8n runs in Docker (it does, per the project's `docker-compose.yml`) and this backend runs on the host, `localhost` inside the container means the container itself, not your machine. Use `http://host.docker.internal:8000/api/idea` instead.

The `X-API-Key` header on that node is a placeholder too - this PoC's `/api/idea` doesn't check it yet (no auth layer for the PoC), so any value works for now.

## Insights AI (`POST /api/insights/chat`)

Read-only Q&A/synthesis over captured knowledge, for the frontend's Insights page - deliberately separate from `/api/idea`'s LangGraph agent and from the deterministic KPIs/charts the frontend computes itself from `GET /api/ideas`. See `ai/insights.py` for the full design rationale.

**Setup (one-time, before this endpoint returns real answers):**

1. `ai_knowledge_feed` (the column-redacted `UNION ALL` view over `poc_ideas`/`poc_questions`/`poc_suggestions`/`poc_decisions`/`poc_actions`/`poc_observations`, excluding all Telegram metadata and raw message text) already exists in Supabase.
2. **Still needed:** create the `ai_readonly` Postgres role and grant it `SELECT` on `ai_knowledge_feed` only - no grants on the six raw tables. (`create role ai_readonly login password '...'; grant usage on schema public to ai_readonly; grant select on ai_knowledge_feed to ai_readonly;`)
3. Set `INSIGHTS_DB_URL` in `.env` to `ai_readonly`'s own direct Postgres connection string (Project Settings → Database → Connection string, using that role's credentials) - **not** the `SUPABASE_KEY` service-role key used elsewhere in this backend. That key bypasses RLS and can write; this path must never be able to.

**Request/response:**

```
POST /api/insights/chat
{ "question": "What are the recurring themes this week?" }

→ { "answer": "...", "items_considered": 42 }
```

Each call is stateless (no server-side conversation history) and retrieves a bounded recent window (most recent 200 items from `ai_knowledge_feed`, not a semantic search) - simple and deterministic at current data volume; revisit if that stops being representative.

---

## Evolving this into production

When Phase 2 actually starts: replace `poc_ideas` with the real `KnowledgeItem` table (`07_DATABASE_SCHEMA.md`), move persistence behind the `Knowledge` backend module described in `08_BACKEND_SPEC.md`, and add the auth/validation layers that module lists. The agent logic in `ai/idea_agent.py` and the prompt in `ai/idea_agent_prompt.md` should mostly carry over unchanged - only the tools' persistence layer needs to change.
