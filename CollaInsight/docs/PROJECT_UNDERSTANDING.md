# Project Understanding

<objective>

This is the primary onboarding document for any AI agent (or engineer) joining CollaInsight. It summarizes and links the rest of `docs/`, rather than repeating it — when a detail matters, follow the link. If anything here conflicts with `docs/00_MVP_SCOPE.md`, the MVP doc wins.

</objective>

---

<purpose>

## 1. Project purpose

CollaInsight turns unstructured Telegram group discussion from a training program into structured, reviewable knowledge — Ideas, Suggestions, Decisions, Action Items, Questions, Observations — so managers can see what's happening without reading every message. Success is measured by *reduction in management review effort*, not feature count. See `docs/00_MVP_SCOPE.md` (`<problem>`, `<primary_goal>`).

**Capture principle:** knowledge only enters the platform through an explicit action by the person submitting it — users, not the AI, decide what becomes organizational knowledge. The MVP implements this through Telegram slash commands (`/idea`, `/question`, `/suggestion`, `/decision`, `/action`, `/observation`): the command fixes the category, and the AI only extracts/structures content within it — it never infers category or relevance from arbitrary free text. A further confirmation step (private DM, Save/Cancel) sits between extraction and permanent storage — see `docs/00_MVP_SCOPE.md`'s `<capture_principle>`/`<core_workflow>` and §4 below. This decision (2026-08-02) and its confirmation-step extension (this session) are both fully implemented in the current system — this is not aspirational.

Several architecture docs (`05_WORKFLOWS.md`, `07_DATABASE_SCHEMA.md`, `08_BACKEND_SPEC.md`, `16_ROADMAP.md`) still describe a broader long-term "knowledge collaboration platform" — registration, account linking, collaboration matching, knowledge graph. That's real future direction, not the current build target. Each of those docs now has an `<mvp_scope_note>` marking which parts apply today.

</purpose>

---

<mvp_scope>

## 2. Current MVP scope

Authoritative source: `docs/00_MVP_SCOPE.md`.

**In scope:** Telegram Integration, User Authentication (managers only — see §5), AI Discussion Structuring, Private Confirmation Before Storage (see §4), Structured Item Storage, Dashboard, AI Insights (deterministic metrics plus a grounded Q&A chat — see §7), Search, Filters, Basic Project Assignment, Idea Status.

**Out of scope:** Knowledge Graph, Collaboration Matching/Hub, Recommendation Engine, WhatsApp, Telegram Mini Apps, Multi-Organization Support, Advanced Analytics, Multi-Agent AI, Automatic Idea Linking, and the Executive Dashboard's AI-generated widgets (Team Pulse, Trending Ideas, Suggested Collaborations, Recurring Problems, Emerging Topics, Weekly Brief). Duplicate marking is documented elsewhere as a manual manager action, not automatic AI detection — **this conflicts with the `/idea` agent's actual, demoed behavior; see §9's open discrepancy note, not resolved by this pass.**

</mvp_scope>

---

<architecture_overview>

## 3. Architecture overview

Full detail: `docs/engineering/04_SYSTEM_ARCHITECTURE.md`, `14_TECHNOLOGY_STACK.md`.

- **Frontend:** React + Vite + TypeScript + TailwindCSS + shadcn/ui — running, reads live data from the backend.
- **Workflow orchestration:** n8n — the primary compute layer for capture. It deterministically routes and validates all six slash commands; for five of them (`/question`, `/suggestion`, `/decision`, `/action`, `/observation`) it also performs the AI extraction itself via a direct Gemini call, since that extraction is single-shot structured generation, not multi-step reasoning (see §5, §8). `/idea` alone is orchestrated by n8n but delegates its AI logic to the Python backend.
- **Backend:** Python (FastAPI) — running. Owns the `/idea` LangGraph agent (search/compare/save-or-flag-duplicate) and the read-only Insights AI (`POST /api/insights/chat`). Reserved for AI work that genuinely needs agentic/multi-step logic, not the five commands' single-shot extraction.
- **AI:** Gemini — called directly by n8n for the five structured-extraction commands, and by the backend for the Idea agent and Insights AI. Provider-agnostic by design.
- **Database:** Supabase (PostgreSQL) — integrated. Six separate per-type PoC tables, a temporary `pending_knowledge` table for the confirmation step, and a restricted read-only `ai_knowledge_feed` view for the Insights AI (see §7 of `07_DATABASE_SCHEMA.md`'s MVP note).
- **Deployment:** n8n Cloud (workflow) + a locally-run backend (tunneled for live demos) + Supabase (managed). Not yet containerized/production-deployed.

</architecture_overview>

---

<data_flow>

## 4. End-to-end data flow

**Current, running implementation** (per `00_MVP_SCOPE.md`'s `<capture_principle>`/`<core_workflow>`):

A participant sends a Telegram slash command (`/idea`, `/question`, `/suggestion`, `/decision`, `/action`, or `/observation`) with content. n8n's Telegram Trigger receives it, a deterministic filter/parser identifies the command and content, and a Switch node routes by command.

- **`/idea`:** n8n calls the Python backend's `POST /api/idea`, which runs a LangGraph agent — search existing ideas, compare by underlying concept, save the new idea or flag it as a duplicate. See `06_AI_PIPELINE.md`.
- **The other five commands:** n8n itself builds a type-specific prompt and calls Gemini directly for structured JSON output matching that type's own schema (see `06_AI_PIPELINE.md`), then deterministically validates the response. If the model flags the result `needs_clarification` (too ambiguous to stand alone), the student gets one focused clarification question back and nothing is stored.
- **Confirmation (all six commands' output, before permanent storage):** a valid, sufficiently clear result is written to a temporary `pending_knowledge` record and previewed to the student **privately** via Telegram DM with Save/Cancel buttons — never posted in the group. Save routes the record to its permanent table and deletes the pending record; Cancel deletes it without saving. A `Same User?` check defends against someone other than the original submitter actioning the confirmation (defense-in-depth; the private DM already limits who can even see the buttons). If the student has never started a private chat with the bot, Telegram itself blocks the DM (`403: bot can't initiate conversation with a user` — a platform restriction, not a bug), and the workflow replies in the group instructing them to start the bot privately and resubmit — the extracted content and buttons are never exposed in the group either way.
- **Dashboard:** reads confirmed items via `GET /api/ideas` and displays them; deterministic metrics/charts are computed client-side from that same data.
- **Insights AI:** `POST /api/insights/chat` answers grounded questions over `ai_knowledge_feed`, a restricted view with no Telegram metadata and no raw message text — see `13_SECURITY.md`.

**Earlier architecture, superseded, not currently running:** before the 2026-08-02 slash-command decision, an earlier PoC pipeline (`automation/workflows/telegram-discussion-extraction.json`) passively captured every group message, had Gemini infer both relevance (`SKIP`) and category from free text in a single call, and stopped after a debug reply with nothing persisted. That file remains in the repo as historical reference — it does not describe the current system, and should not be read as such.

</data_flow>

---

<component_responsibilities>

## 5. Component responsibilities

| Component | Current implementation |
|---|---|
| Telegram Bot | Delivers slash-command messages and Save/Cancel callback button presses into n8n. No business logic — Communication Layer stays thin (`04_SYSTEM_ARCHITECTURE.md`). |
| n8n | Orchestrates all six commands (parse, route, deterministic validation). For five of them, also calls Gemini directly for structured extraction and owns the entire pending-confirmation flow (create/read/delete `pending_knowledge`, private DM preview, Save/Cancel + Same-User handling). For `/idea`, delegates AI logic to the backend via HTTP. |
| Gemini | For the five n8n-native commands: single-shot structured extraction within the command's already-fixed category, called directly by n8n — no classification, no SKIP judgment (`00_MVP_SCOPE.md`'s `<capture_principle>`). For `/idea` and Insights AI: called by the backend. Never computes a statistic. Swappable provider by design. |
| Validator | Deterministic, in n8n: structural checks (required fields/types on the model's JSON) plus a semantic gate (the model's own `needs_clarification` flag, evaluated deterministically before storage is even attempted — see `06_AI_PIPELINE.md`). |
| Python backend | Running (FastAPI). Owns the `/idea` LangGraph agent and the read-only Insights AI endpoint (`08_BACKEND_SPEC.md`). Does not touch the other five commands. |
| Supabase | Integrated. Six separate per-type tables for confirmed knowledge, a temporary `pending_knowledge` table for unconfirmed items, and a restricted `ai_knowledge_feed` view (no Telegram metadata, no raw message text) that only the Insights AI reads, via a dedicated least-privilege `ai_readonly` role — verified unable to read or write the six raw tables (`07_DATABASE_SCHEMA.md`). |
| Dashboard | Reads confirmed items via `GET /api/ideas`; deterministic KPIs/charts computed client-side. AI Insights page adds a grounded Q&A chat panel, kept separate from the deterministic metrics (`09_FRONTEND_SPEC.md`). |

</component_responsibilities>

---

<categories>

## 6. Discussion categories

Authoritative definitions live in each command's own Gemini prompt inside the current n8n workflow (see `automation/workflows/` for the latest export) — not `telegram-discussion-extraction.json`, which predates the slash-command redesign and is kept only as historical reference (see §4):

- **Idea** — a new possibility or proposal that doesn't yet exist.
- **Suggestion** — a proposed change/improvement to something that already exists.
- **Decision** — a choice already made or agreed on, even stated briefly.
- **Action Item** — a task someone needs to do, self- or other-assigned.
- **Question** — needs an answer from someone else, especially if blocking.
- **Observation** — a factual note about what's happening that isn't one of the other five.

The category is chosen by the student's slash command (`/idea`, `/question`, etc.), not inferred by the AI — see `00_MVP_SCOPE.md`'s `<capture_principle>`. A submission that fails validation (empty content, unsupported attachment, speech-to-text failure, invalid submission) is not stored. This replaces the pre-slash-command build's `SKIP` outcome (see §4), which no longer applies under the target design: `SKIP` was an AI judgment call needed only when the AI had to infer relevance from arbitrary free text.

</categories>

---

<executive_dashboard>

## 7. Executive dashboard philosophy

Full spec: `09_FRONTEND_SPEC.md` → Executive Dashboard.

The MVP Executive Dashboard is **deterministic-first**: the application computes every fact from stored knowledge items; the LLM is only ever allowed to *narrate* figures that already exist, never invent or estimate one (`06_AI_PIPELINE.md`'s "Facts Are Computed, Not Generated").

Agreed MVP insights: **Executive Summary** (LLM narration of computed figures), **Topic Distribution** (counts by category), **Participation Overview** (counts by participant/project), **Discussion Health** (submission volume trend, validation-failure rate), **Pending Questions**, **Action Items**.

Anything that requires the AI to *generate* an insight rather than narrate a computed one — Team Pulse, Trending Ideas, Suggested Collaborations, Recurring Problems, Emerging Topics, Weekly Brief — is post-MVP.

</executive_dashboard>

---

<deterministic_vs_llm>

## 8. Deterministic vs. LLM responsibilities

Source of truth: `06_AI_PIPELINE.md`'s design principles, `11_BUSINESS_RULES.md`'s `ai_rules`.

- **Deterministic** (n8n for the five structured-extraction commands; Python backend for `/idea` and Insights AI): command routing, validation-failure checks (empty content, unsupported attachment, speech-to-text failure, invalid submission), the semantic-completeness gate (evaluating the model's own `needs_clarification` flag before allowing storage), output-shape/field validation, the entire pending-confirmation/Save-Cancel flow, all statistics/counts/timelines/participation/tag-frequency, storage, status transitions (always a manual manager action).
- **LLM** (Gemini): extraction and structuring only — generating title/summary/tags/keywords and each type's own fields for the category the slash command already specified, plus judging (not deciding) whether the result is too ambiguous to stand alone. Does not classify, does not decide relevance, must never invent or estimate a number.

</deterministic_vs_llm>

---

<current_status>

## 9. Current implementation status

- **Working, live, end-to-end:** all six slash commands. `/idea` via the backend LangGraph agent (search/compare/save-or-flag-duplicate). The other five via n8n-native Gemini extraction, deterministic validation, a semantic-completeness gate, a private-DM Save/Cancel confirmation step, and storage in their own permanent tables on confirmation. `/start` and `/help` are static n8n replies. The dashboard reads and displays confirmed items live; deterministic KPIs/charts are computed client-side; a grounded Insights AI chat (`POST /api/insights/chat`) answers questions over a restricted, Telegram-metadata-free view (`ai_knowledge_feed`), verified to have no read/write access to the six raw tables.
- **Known, unfixed issue:** the five `Insert <Type> to Supabase` n8n nodes' field expressions use a malformed single-brace syntax (`={ ... }` instead of `={{ ... }}`), which n8n will not evaluate — every confirmed Save currently risks writing literal placeholder text instead of the real extracted data for these five commands. Flagged during a workflow review; not yet fixed as of this writing.
- **Not started:** manager authentication/RBAC, the production `KnowledgeItem` schema (the six PoC tables are intentionally minimal, not the long-term model), status transitions beyond the disabled "Mark as Reviewed" UI stub.
- **Open, unresolved discrepancy (flagged, not resolved here):** `00_MVP_SCOPE.md`'s success metric and `10_API_SPEC.md`'s Knowledge domain both state the MVP "does not perform automatic AI duplicate detection" and that duplicate-marking is a manual manager action. In the running system, the `/idea` backend agent performs automatic duplicate detection and flagging as its core, demoed behavior, and no manual "mark as Duplicate" UI exists anywhere in the frontend. This tension has been flagged in prior session logs and is not resolved by this documentation pass — see `docs/ai-agent-code-work/claude/` for history.
- **Earlier architecture, superseded:** the pre-slash-command pipeline described in older revisions of this document (passive capture, Filter node drops `/commands`, Gemini SKIP-or-classify) is not the current system — see §4.

</current_status>

---

<priorities>

## 10. Immediate implementation priorities

No fixed deadline is documented anywhere for a specific date — confirm with the user before treating any timeframe as fixed. As of this writing, open items include:

1. Fix the single-brace expression bug in the five `Insert <Type> to Supabase` n8n nodes (see §9) before relying on Save for those commands.
2. Resolve the duplicate-detection scope discrepancy (§9) — either reword the "no automatic duplicate detection" claim or clarify it means something narrower than the `/idea` agent's actual behavior.
3. Manager authentication/RBAC.
4. Move the six PoC tables toward the production `KnowledgeItem` schema (`07_DATABASE_SCHEMA.md`) and implement real status transitions.
5. Polish/error handling.

</priorities>
