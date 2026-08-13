# Project Status & Changelog

<objective>

Track the high-level status, current version, and major updates for the CollaInsight platform.
This document provides a quick overview of where the project is at any given time and aligns with the core README.

</objective>

---

<current_status>

## Status Overview
**Phase:** MVP implemented and validated end-to-end; final documentation and repository polish in progress
**Overall Health:** 🟢 On Track

**Read this alongside [`docs/PROJECT_UNDERSTANDING.md`](docs/PROJECT_UNDERSTANDING.md) for the full detail behind every line below.**

</current_status>

---

<milestones>

## Project Milestones

- [x] **Milestone 1:** Core Documentation & Architecture Completed
- [x] **Milestone 2:** Development Environment Setup (`tsconfig.json`, `vite-env.d.ts`)
- [x] **Milestone 3:** Frontend UI Shell Implementation (Landing Page, App Shell, Dashboard, Knowledge, AI Insights, Graph View)
- [x] **Milestone 4:** MVP Scope Finalized
- [x] **Milestone 5:** Phase 1 - Workflow Validation (Telegram → n8n → AI → JSON) — **validated live end-to-end on 2026-08-06**, real Telegram message through n8n Cloud, the backend, and back
- [x] **Milestone 6 (PoC only):** Backend + Idea Agent — FastAPI + LangGraph Idea Agent live, writing to a minimal `poc_ideas` Supabase table. **Not** the production `KnowledgeItem` schema in `docs/engineering/07_DATABASE_SCHEMA.md` — that's still Milestone 6's real remaining work.
- [x] **Milestone 7 (PoC only):** Dashboard, Knowledge, and AI Insights pages all read live data from `GET /api/knowledge` (all six knowledge types; the original `GET /api/ideas` endpoint is retained for compatibility) — no fake metrics, no fake charts. No auth, no manager status/review workflow, no pagination.
- [x] **Milestone 10:** All six slash commands live (2026-08-12) — `/question`, `/suggestion`, `/decision`, `/action`, `/observation` implemented as n8n-native Gemini extraction + deterministic validation, each with its own type-specific schema (not a shared generic one). `/idea` unchanged, still backend-owned.
- [x] **Milestone 11:** Human confirmation before storage (2026-08-12) — for the five n8n-native commands (`/question`/`/suggestion`/`/decision`/`/action`/`/observation`), each extracted result is held in a temporary `pending_knowledge` record and previewed privately to the submitter via Telegram DM with Save/Cancel, before anything reaches permanent storage. A private-DM-unavailable fallback safely instructs the submitter in the group without exposing the extracted content there. `/idea` is not part of this flow — it's saved or flagged-as-duplicate directly by the backend LangGraph agent (Milestone 6).
- [x] **Milestone 12 (PoC only):** Insights AI (2026-08-12) — `POST /api/insights/chat`, read-only grounded Q&A over confirmed knowledge via a restricted `ai_knowledge_feed` view and a dedicated least-privilege `ai_readonly` Postgres role. The access boundary (can read the view, cannot read or write the six raw tables) has been verified live, not assumed.
- [ ] **Milestone 8:** Phase 4 - Authentication & RBAC
- [ ] **Milestone 9:** Phase 5 - Polish, Error Handling & MVP Release

**All six extraction agents are now implemented** (Idea/Question/Suggestion/Decision/Action/Observation) — this supersedes the earlier note that only the Idea Agent was live.

</milestones>

---

<changelog>

## Version History & Updates

### Recent Updates (2026-08-12)
- **All five remaining slash commands implemented in n8n**, each with its own prompt and JSON schema (not a shared generic one) — `/question`, `/suggestion`, `/decision`, `/action`, `/observation` now perform real Gemini extraction and deterministic validation, including a semantic-completeness gate (`needs_clarification`) that returns a clarification question instead of storing an ambiguous item.
- **Private confirmation before storage, for the five n8n-native commands** (`/question`/`/suggestion`/`/decision`/`/action`/`/observation`). Extracted results are held as temporary `pending_knowledge` records and previewed to the submitter privately via Telegram DM with Save/Cancel — never posted in the group. A same-user check defends the callback; a DM-unavailable fallback safely instructs first-time submitters in the group without exposing extracted content there. `/idea` is handled separately by the backend agent, which saves or flags-as-duplicate directly.
- **Insights AI added** (`POST /api/insights/chat`) — read-only, grounded Q&A over confirmed knowledge, reading through a restricted `ai_knowledge_feed` view via a dedicated least-privilege `ai_readonly` role. The access boundary was verified live: the role can read the view but cannot read or write any of the six raw knowledge tables.
- **Frontend:** shared client-side cache for `useIdeas()` (fixes repeated refetch/loading-flash when navigating Dashboard/Knowledge/Insights); AI Insights page gained a grounded chat panel with markdown rendering and auto-scroll; removed remaining fake placeholder content (a hardcoded fake user identity and hardcoded fake search results in the app shell, a stale copyright year).
- **Known issue found this day, fixed later the same day:** the five `Insert <Type> to Supabase` n8n nodes used malformed expression syntax and would not have written real data to the permanent tables — see `docs/PROJECT_UNDERSTANDING.md` §9 for the original finding. Corrected; all five nodes now use valid `={{ ... }}` expressions throughout.
- **Known discrepancy found, not resolved:** `00_MVP_SCOPE.md` and `10_API_SPEC.md` both state the MVP does not perform automatic AI duplicate detection, but the live `/idea` agent's core, demoed behavior is exactly that. Flagged for a scoping decision, not silently resolved by this pass.

---

### Recent Updates (2026-08-06)
- **n8n workflow rebuilt around explicit slash commands.** New workflow `automation/workflows/collainsight-mvp-idea-agent.json` replaces the old free-text-classifying pipeline: a Switch node routes `/idea` to a real backend call and the other five commands to placeholder nodes, keeping the six-agent architecture visible without implementing agents that aren't ready.
- **First real backend code in the project.** `backend/` went from empty stubs to a working FastAPI + LangGraph Idea Agent (search → compare → save-or-explain-duplicate, structured knowledge output via tool-call arguments rather than parsed free text). Explicitly scoped as a Proof of Concept, not the production backend — see `backend/README.md`'s "Evolving this into production" section for the intended migration path.
- **Full pipeline proven live**, not just in local tests: real Telegram `/idea` message → n8n Cloud → a Python backend (tunneled via ngrok) → the LangGraph agent → Gemini tool calls → Supabase → a structured reply back in Telegram. See `RUNNING_NGROK_AND_N8N.md` for how to bring this up locally.
- **Privacy pass:** dropped Telegram's numeric `user_id` in favor of display-only `username`/`first_name` attribution, matching the documented MVP scope (no account linking, no persistent participant identifiers).
- **Dashboard, Knowledge, and AI Insights pages rebuilt on live data.** Previously 100% hardcoded fake content (fake stats, fake projects, fake AI suggestions, fake trending topics) — now every number, chart, and card traces to a real Supabase row via `GET /api/ideas`. Unbuilt sections (Projects, Collaboration, Knowledge Graph) now show an honest "Coming Soon" state instead of fake content.
- **Knowledge detail view redesigned** from a modal to a side panel, following a product-design review: tags/keywords as chips, open questions promoted to a callout, source message collapsed by default.

---

### Upcoming (Next Steps)
- Reconcile the "Automatic AI Duplicate Detection" scope claim in `00_MVP_SCOPE.md`/`10_API_SPEC.md` against the fact that duplicate detection is already built and demoed by the `/idea` agent (flagged repeatedly, not yet resolved).
- Move the six flat PoC tables to the real `KnowledgeItem` schema and add the manager status/review workflow (Pending/Approved/Rejected/etc.) — currently only a disabled "Coming Soon" button exists in the UI.
- Add authentication to the backend before it's exposed beyond a rehearsal demo window.

</changelog>
