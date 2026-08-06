# Project Status & Changelog

<objective>

Track the high-level status, current version, and major updates for the CollaInsight platform.
This document provides a quick overview of where the project is at any given time and aligns with the core README.

</objective>

---

<current_status>

## Status Overview
**Phase:** Proof of Concept validated end-to-end — preparing for internal rehearsal presentation
**Overall Health:** 🟢 On Track

**Read this alongside [`docs/ai-agent-code-work/claude/2026-08-06-session-log.md`](docs/ai-agent-code-work/claude/2026-08-06-session-log.md) for the full detail behind every line below.**

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
- [x] **Milestone 7 (PoC only):** Dashboard, Knowledge, and AI Insights pages all read live data from a new `GET /api/ideas` backend endpoint — no fake metrics, no fake charts. No auth, no manager status/review workflow, no pagination.
- [ ] **Milestone 8:** Phase 4 - Authentication & RBAC
- [ ] **Milestone 9:** Phase 5 - Polish, Error Handling & MVP Release

**Only the Idea Agent is implemented** of the six planned extraction agents (Idea/Suggestion/Decision/Action/Question/Observation). The other five exist as routed-but-empty placeholders in the n8n workflow — intentional, deferred to the week before the final presentation, not a gap in current work.

</milestones>

---

<changelog>

## Version History & Updates

### Recent Updates (2026-08-06)
- **n8n workflow rebuilt around explicit slash commands.** New workflow `automation/workflows/collainsight-mvp-idea-agent.json` replaces the old free-text-classifying pipeline: a Switch node routes `/idea` to a real backend call and the other five commands to placeholder nodes, keeping the six-agent architecture visible without implementing agents that aren't ready.
- **First real backend code in the project.** `backend/` went from empty stubs to a working FastAPI + LangGraph Idea Agent (search → compare → save-or-explain-duplicate, structured knowledge output via tool-call arguments rather than parsed free text). Explicitly scoped as a Proof of Concept, not the production backend — see `backend/README.md`'s "Evolving this into production" section for the intended migration path.
- **Full pipeline proven live**, not just in local tests: real Telegram `/idea` message → n8n Cloud → a Python backend (tunneled via ngrok) → the LangGraph agent → Gemini tool calls → Supabase → a structured reply back in Telegram. See `RUNNING_NGROK_AND_N8N.md` for how to bring this up locally.
- **Privacy pass:** dropped Telegram's numeric `user_id` in favor of display-only `username`/`first_name` attribution, matching the documented MVP scope (no account linking, no persistent participant identifiers).
- **Dashboard, Knowledge, and AI Insights pages rebuilt on live data.** Previously 100% hardcoded fake content (fake stats, fake projects, fake AI suggestions, fake trending topics) — now every number, chart, and card traces to a real Supabase row via `GET /api/ideas`. Unbuilt sections (Projects, Collaboration, Knowledge Graph) now show an honest "Coming Soon" state instead of fake content.
- **Knowledge detail view redesigned** from a modal to a side panel, following a product-design review: tags/keywords as chips, open questions promoted to a callout, source message collapsed by default.

---

### Upcoming (Next Steps)
- Reconcile the presentation deck's "Automatic AI Duplicate Detection → post-MVP" slide against the fact that duplicate detection is already built and demoed (flagged in the 2026-08-06 session log, not yet resolved).
- Implement the remaining five agents (Question, Suggestion, Decision, Action, Observation) in the days before the final presentation.
- Move `poc_ideas` to the real `KnowledgeItem` schema and add the manager status/review workflow (Pending/Approved/Rejected/etc.) — currently only a disabled "Coming Soon" button exists in the UI.
- Add authentication to the backend before it's exposed beyond a rehearsal demo window.

</changelog>
