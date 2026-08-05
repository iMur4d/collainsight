# Project Understanding

<objective>

This is the primary onboarding document for any AI agent (or engineer) joining CollaInsight. It summarizes and links the rest of `docs/`, rather than repeating it — when a detail matters, follow the link. If anything here conflicts with `docs/00_MVP_SCOPE.md`, the MVP doc wins.

</objective>

---

<purpose>

## 1. Project purpose

CollaInsight turns unstructured Telegram group discussion from a training program into structured, reviewable knowledge — Ideas, Suggestions, Decisions, Action Items, Questions, Observations — so managers can see what's happening without reading every message. Success is measured by *reduction in management review effort*, not feature count. See `docs/00_MVP_SCOPE.md` (`<problem>`, `<primary_goal>`).

**Capture principle:** knowledge only enters the platform through an explicit action by the person submitting it — users, not the AI, decide what becomes organizational knowledge. The MVP implements this through Telegram slash commands (`/idea`, `/question`, `/suggestion`, `/decision`, etc.): the command fixes the category, and the AI only extracts/structures content within it — it never infers category or relevance from arbitrary free text. See `docs/00_MVP_SCOPE.md`'s `<capture_principle>`. This is a recent (2026-08-02) decision — §4, §5, §6, and §8 below flag where the current running implementation still predates it.

Several architecture docs (`05_WORKFLOWS.md`, `07_DATABASE_SCHEMA.md`, `08_BACKEND_SPEC.md`, `16_ROADMAP.md`) still describe a broader long-term "knowledge collaboration platform" — registration, account linking, collaboration matching, knowledge graph. That's real future direction, not the current build target. Each of those docs now has an `<mvp_scope_note>` marking which parts apply today.

</purpose>

---

<mvp_scope>

## 2. Current MVP scope

Authoritative source: `docs/00_MVP_SCOPE.md`.

**In scope:** Telegram Integration, User Authentication (managers only — see §5), AI Discussion Structuring, Structured Item Storage, Dashboard, Search, Filters, Basic Project Assignment, Idea Status, Executive Review Dashboard (deterministic insights only — see §7).

**Out of scope:** Knowledge Graph, Collaboration Matching/Hub, Recommendation Engine, WhatsApp, Telegram Mini Apps, Multi-Organization Support, Advanced Analytics, Multi-Agent AI, Automatic Idea Linking, and the Executive Dashboard's AI-generated widgets (Team Pulse, Trending Ideas, Suggested Collaborations, Recurring Problems, Emerging Topics, Weekly Brief). Duplicate marking is a manual manager action, not automatic AI detection.

</mvp_scope>

---

<architecture_overview>

## 3. Architecture overview

Full detail: `docs/engineering/04_SYSTEM_ARCHITECTURE.md`, `14_TECHNOLOGY_STACK.md`.

- **Frontend:** React + Vite + TypeScript + TailwindCSS + shadcn/ui.
- **Workflow orchestration:** n8n — currently the only running compute layer (see §9). Long-term, n8n stays an orchestration layer only (trigger Telegram, call the backend); it should not own business/validation logic.
- **Backend:** Python — approved language, not yet built as a running service. Owns business logic, validation, AI orchestration, persistence coordination, auth once it exists.
- **AI:** Gemini today; the stack is provider-agnostic by design (Claude/OpenAI swappable).
- **Database:** Supabase (PostgreSQL) — not yet integrated.
- **Deployment:** Docker Compose, local-first for now.

</architecture_overview>

---

<data_flow>

## 4. End-to-end data flow

**Target design (per `00_MVP_SCOPE.md`'s `<capture_principle>`/`<core_workflow>`), not yet built:** a participant sends a Telegram slash command (`/idea`, `/question`, `/suggestion`, `/decision`, etc.) with content. n8n receives the command+content, Gemini extracts/structures within the category the command already specified (no classification), a deterministic validator checks for validation failure (empty content, unsupported attachment, speech-to-text failure, invalid submission) before storage, and the result is persisted and shown on the dashboard.

**Built and running today (Phase 1 — predates the slash-command decision, not yet reworked):**
1. Participant posts a message in the Telegram group.
2. n8n **Telegram Trigger** receives it passively — no per-user action, no registration.
3. **Filter** node (deterministic): drops empty messages and `/commands`. (Under the target design this inverts — a command is the trigger, not something to drop.)
4. **Gemini** node: receives only the raw message text (no username/metadata), returns `SKIP` or a JSON object (`category`, `title`, `summary`, `key_points`, `tags`, `open_questions`). `SKIP` was an AI judgment call needed only because the AI had to infer relevance from free text — retired under the target design in favor of deterministic validation failure.
5. **Code in JavaScript** node (deterministic): parses/validates the model's output — required fields, allowed category enum — and attaches `telegram_message_id`/`chat_id`/`from` itself.
6. **Send Debug Reply**: echoes the result back into the Telegram chat. This is a Phase 1 debugging aid, not a production feature.
7. **Pipeline stops here.** Nothing is persisted to Supabase; no dashboard reads real data yet.

Reworking this workflow around explicit slash-command triggers (dropping the Filter/SKIP design above) is a pending task — see §9 and §10 — not yet started.

**Planned, not built** (`PROJECT_STATUS.md` milestones): Phase 2 persists validated items to Supabase; Phase 3 the dashboard reads and displays them; Phase 4 adds manager auth/RBAC; Phase 5 is polish/release.

**Open question:** whether Phase 2's Supabase write happens directly from an n8n node or is handed to the Python backend once it exists. Not yet decided — see `06_AI_PIPELINE.md`'s `<current_implementation_note>`.

</data_flow>

---

<component_responsibilities>

## 5. Component responsibilities

| Component | Responsibility today (pre-slash-command build — see §4) | Target design |
|---|---|---|
| Telegram Bot | Passively delivers raw group messages into n8n. No business logic. | Delivers slash-command messages into n8n. Still no business logic — Communication Layer stays thin (`04_SYSTEM_ARCHITECTURE.md`). |
| n8n | Hosts the whole Phase 1 pipeline, including a temporary JS validator. | Orchestration only, long-term — trigger + call backend. Near-term: reworked to trigger on slash commands instead of filtering them out. |
| Gemini | Classifies (6 categories or SKIP) and generates title/summary/key_points/tags/open_questions in one call. Never computes statistics. | Extracts/structures content within the category the command already specified — no classification, no SKIP judgment (`00_MVP_SCOPE.md`'s `<capture_principle>`). Swappable provider. Never computes statistics. |
| Validator | JS Code node in n8n; deterministic field/enum checks. **Temporary Phase 1 implementation.** | Same deterministic checks, plus absorbs the input-side validation-failure cases (empty content, unsupported attachment, speech-to-text failure) that SKIP used to cover. Moves into the Python backend long-term (`06_AI_PIPELINE.md` Stage 7). |
| Python backend | Does not exist yet as a running service. | Business logic, validation, persistence coordination, auth (`08_BACKEND_SPEC.md`, `14_TECHNOLOGY_STACK.md`). |
| Supabase | Not integrated. | Stores `KnowledgeItem` and related entities; manager auth (`07_DATABASE_SCHEMA.md`). |
| Dashboard | UI shell exists, not wired to real data. | Manager review view + deterministic Executive Dashboard (`09_FRONTEND_SPEC.md`). |

</component_responsibilities>

---

<categories>

## 6. Discussion categories

Authoritative definitions live in the Gemini prompt inside `automation/workflows/telegram-discussion-extraction.json` (more precise than the one-line list in `06_AI_PIPELINE.md`):

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

- **Deterministic** (app/validator logic — JS in n8n today, Python backend long-term): command routing, validation-failure checks (empty content, unsupported attachment, speech-to-text failure, invalid submission), output-shape/field/enum validation, all statistics/counts/timelines/participation/tag-frequency, storage, status transitions (always a manual manager action).
- **LLM** (Gemini): extraction and structuring only — generating title/summary/key_points/tags/open_questions for the category the slash command already specified. Does not classify, does not decide relevance, must never invent or estimate a number.

*Current build note:* the running Phase 1 pipeline (see §4) predates this — it still has Gemini make a `SKIP`-or-category judgment call, because the slash-command rework hasn't landed yet.

</deterministic_vs_llm>

---

<current_status>

## 9. Current implementation status

- **Working:** the extraction pipeline logic (filter → Gemini → validator) has been built and tested end-to-end with real Telegram messages in n8n.
- **Not working right now:** public Telegram webhook delivery is blocked — the local n8n instance's public tunnel (currently Tailscale Funnel) is hitting an upstream DNS-publication bug (Tailscale control-plane side, not a config issue on our end). A Cloudflare Quick Tunnel fallback with a URL auto-sync script was the agreed next step, not yet implemented.
- **Not started:** Supabase schema/storage, real dashboard data wiring, manager authentication, RBAC.
- **Pending rework:** the n8n workflow still implements the pre-slash-command design (passive message capture, Filter node drops `/commands`, Gemini does SKIP-or-category classification). Rebuilding it around explicit slash-command triggers, per `00_MVP_SCOPE.md`'s `<capture_principle>`, has not started — see §4.
- Frontend UI shell (landing page, app shell) exists per `PROJECT_STATUS.md` Milestone 3 but isn't connected to real data.
- `PROJECT_STATUS.md`'s milestone checklist is stale (Phase 1 still shown unchecked despite being functionally built) — treat this document as more current for pipeline status.

</current_status>

---

<priorities>

## 10. Immediate implementation priorities

No fixed deadline is documented anywhere for a specific date — confirm with the user before treating any timeframe as fixed. Absent that, the confirmed dependency order (`PROJECT_STATUS.md`) is:

1. Restore Telegram webhook delivery (tunnel fallback — see §9).
2. Supabase schema + write step for validated `KnowledgeItem`s (Phase 2).
3. Wire the dashboard to real Supabase data (Phase 3).
4. Manager authentication/RBAC (Phase 4).
5. Polish/error handling (Phase 5).

</priorities>
