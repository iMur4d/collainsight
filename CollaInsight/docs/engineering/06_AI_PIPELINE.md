# AI Pipeline

<objective>

Define how Artificial Intelligence processes user input throughout the platform.

This document specifies the AI decision-making pipeline, model responsibilities, routing strategy, and optimization principles.

The objective is to minimize cost while maximizing output quality.

The AI pipeline must remain modular and model-agnostic.

</objective>

---

<context>

The platform does not rely on a single Large Language Model.

Instead, AI responsibilities are distributed across specialized stages.

Each stage has one clear purpose.

Simple tasks should be handled by lightweight models whenever possible.

Complex reasoning should only be delegated to larger models when necessary.

</context>

---

<mvp_scope_note>

`docs/00_MVP_SCOPE.md` is authoritative. The 8-stage pipeline below describes the full long-term platform, including AI-driven intent classification (Stage 3) and context retrieval (Stages 4–5) — capabilities that assume the AI is working from arbitrary, unclassified input.

The MVP does not work from arbitrary input. Per `00_MVP_SCOPE.md`'s `<capture_principle>`, the user's Telegram slash command (`/idea`, `/question`, etc.) performs category selection — the job Stage 3 describes — before the AI ever sees the content. **Stage 3 does not apply to the MVP.** Stages 4 and 5 (context decision/retrieval) are also not implemented in the MVP. Stage 1 applies in a narrowed form — see its note below.

</mvp_scope_note>

---

<design_principles>

## AI as a Pipeline

The platform treats AI as a sequence of specialized steps rather than a single prompt.

---

## Right Model for the Right Task

Large Language Models should only solve problems that actually require reasoning.

Simple classification or validation should be delegated to lightweight models or deterministic logic.

---

## Cost Efficiency

Reduce token consumption whenever possible.

Avoid sending unnecessary context.

Reuse previously generated knowledge whenever appropriate.

---

## Human Verification

AI generates suggestions.

Humans remain responsible for final approval whenever business decisions are involved.

---

## Facts Are Computed, Not Generated

AI is responsible for language: organizing, summarizing, and explaining discussion content within the category the user has already chosen (see `<mvp_scope_note>` above). Classifying arbitrary input into a category is not an MVP responsibility of the AI — it becomes one only if a future release reintroduces AI-driven intent classification (Stage 3 below).

The application is responsible for facts: statistics, counts, timelines, participation, tag frequency, and other deterministic calculations derived from stored knowledge items.

AI must never invent or estimate a statistic. It may only explain figures the application has already computed.

</design_principles>

---

<pipeline>

## Stage 1 — Input Validation

Purpose:

Determine whether the submission is processable.

Examples:

- Empty message
- Greeting
- Random conversation
- Unsupported input

Possible Outputs:

- Reject
- Continue

**MVP note:** "Greeting" and "Random conversation" are semantic judgments that only matter when the AI is inferring relevance from arbitrary free text — not applicable to the MVP, where the slash command already establishes relevance and category. For the MVP, Stage 1 narrows to deterministic validation-failure checks: empty content, unsupported attachment, speech-to-text failure, or another invalid submission (see `00_MVP_SCOPE.md`'s `<capture_principle>`/`<core_workflow>`). This replaces the pre-slash-command build's `SKIP` outcome, which was an AI judgment call needed only when relevance had to be inferred.

---

## Stage 2 — Text Normalization

Purpose:

Clean and normalize user input.

Examples:

- Remove duplicated words
- Correct formatting
- Normalize whitespace
- Convert speech-to-text output into readable text

Output:

Normalized text.

---

## Stage 3 — Intent Classification

**Post-MVP.** See `<mvp_scope_note>` above — the MVP does not use AI-driven classification. The user's slash command performs this job instead. This stage only becomes active if a future release reintroduces natural-language submission with automatic intent detection.

Purpose:

Understand what the user submitted.

Possible categories:

- Idea
- Suggestion
- Decision
- Action Item
- Question
- Observation

This stage should be lightweight.

---

## Stage 4 — Context Decision

Purpose:

Determine whether additional context is required.

Questions:

- Is previous knowledge needed?
- Is this related to an existing project?
- Should user history be retrieved?
- Can the AI answer without context?

Possible Outputs:

- No Context Required
- Retrieve Context

---

## Stage 5 — Context Retrieval

Purpose:

Collect only the minimum relevant context.

Possible sources:

- User Knowledge
- Project Knowledge
- Previous Conversations
- Future RAG Sources

This stage should avoid retrieving unnecessary information.

---

## Stage 6 — Knowledge Generation

Purpose:

Transform normalized input into structured knowledge.

Expected outputs include:

- Title
- Summary
- Tags
- Category
- Metadata
- Suggested Relationships

The generated knowledge should be concise, reusable, and searchable.

---

## Stage 7 — Validation

Purpose:

Verify AI output before storage.

Checks include:

- Required fields
- Invalid formatting
- Missing title
- Empty summary
- Invalid category

Outputs that fail validation should be regenerated or rejected.

---

## Stage 8 — Storage

Purpose:

Persist validated knowledge.

The AI is no longer responsible after this stage.

</pipeline>

---

<current_implementation_note>

The 8 stages above describe the full long-term pipeline (see `<mvp_scope_note>` for which stages apply to the MVP at all). This note describes the current, running implementation of the applicable stages.

**`/idea`:** n8n triggers on the command and calls the Python backend (`POST /api/idea`), which runs Stage 6 via a LangGraph agent — search existing ideas, compare by underlying concept, and either save the new idea or flag it as a duplicate. Stage 7 here is the agent's own structural tool-call contract.

**`/question`, `/suggestion`, `/decision`, `/action`, `/observation`:** n8n itself performs Stage 6 — a type-specific prompt calling Gemini directly for structured JSON matching that type's own schema. Stage 7 is a deterministic n8n Code node: structural checks (required fields/types) plus a semantic-completeness gate — the model also returns a `needs_clarification` flag and, when true, one `clarifying_question`. n8n evaluates that flag deterministically; an item failing either check is routed back to the submitter as a clarification request instead of reaching Stage 8.

**Human Confirmation, shared by all six commands, sits between Stage 7 and Stage 8** and isn't named in the 8-stage list above: a valid, sufficiently clear result is held as a temporary pending record and previewed to the submitter privately via Telegram DM with Save/Cancel buttons before storage actually happens. See `05_WORKFLOWS.md`'s Submit Knowledge workflow for the full sequence, including the same-user check and the fallback when the submitter has never DMed the bot.

Stages 2, 4, and 5 (normalization, context decision, context retrieval) are not implemented for any command. Stage 7's retry/escalate loop (`<loop_engineering>` below) is not implemented — a structurally invalid or semantically incomplete result is rejected/clarified, not regenerated.

**Where deterministic validation logic lives, and why it's not "temporary":** for the five n8n-native commands, Stage 7 is a JavaScript Code node inside n8n, and stays there by design — not as scaffolding awaiting a move to the backend. Since those five commands' AI step is single-shot structured generation rather than multi-step reasoning, keeping their validation next to their extraction in n8n was a deliberate architectural decision (see `04_SYSTEM_ARCHITECTURE.md`'s `<mvp_scope_note>`), superseding an earlier assumption in this document that all validation logic would eventually move to Python. `/idea`'s validation lives in the Python backend, consistent with `14_TECHNOLOGY_STACK.md`'s approved stack.

**Earlier architecture, superseded, not currently running:** the original Phase 1 build (`automation/workflows/telegram-discussion-extraction.json`) predates the 2026-08-02 slash-command decision. It ran a 3-step pipeline that dropped `/commands` instead of triggering on them, had Gemini free-text-classify each message into a category or `SKIP`, and validated with a Code node — structurally similar to today's five n8n-native branches, but classifying arbitrary messages instead of extracting within an already-chosen category. That file remains in the repo as historical reference only, not a description of the current system.

</current_implementation_note>

---

<insights_ai_note>

**Insights AI is a separate capability, outside the 8-stage capture pipeline above.** It does not extract or generate knowledge — it answers a manager's question, read-only, grounded in already-confirmed knowledge. `POST /api/insights/chat` retrieves a bounded recent window from `ai_knowledge_feed` (a restricted Supabase view with no Telegram metadata and no raw message text) via a dedicated least-privilege `ai_readonly` Postgres role, then makes one single-shot Gemini call instructed to answer only from what it was given and say so plainly when the data doesn't support an answer. No LangGraph, no tool-calling, no multi-turn state. See `08_BACKEND_SPEC.md` and `13_SECURITY.md` for the access-boundary detail, and `07_DATABASE_SCHEMA.md` for `ai_knowledge_feed`'s shape.

This is distinct from — and must stay distinct from — the deterministic KPIs/charts on the Dashboard and AI Insights pages, which remain entirely application-computed per this document's "Facts Are Computed, Not Generated" principle. Insights AI explains and synthesizes; it never replaces a computed figure.

</insights_ai_note>

---

<routing_strategy>

**Full-platform capability, not MVP.** The examples below assume AI-driven classification (Stage 3), which per `<mvp_scope_note>` does not apply to the MVP — during the MVP, the slash command itself determines the path, so there is no dynamic routing decision to make.

The platform should dynamically choose the appropriate processing path.

Examples:

Simple Question

↓

Classification

↓

Knowledge Generation

↓

Save

---

Complex Research Idea

↓

Classification

↓

Retrieve Context

↓

Large Language Model

↓

Validation

↓

Save

The routing strategy should remain configurable.

</routing_strategy>

---

<loop_engineering>

The pipeline supports iterative refinement.

When AI confidence is insufficient:

1. Detect uncertainty.

2. Request additional context.

OR

3. Retry using an improved prompt.

OR

4. Escalate to a more capable reasoning model.

Loops should terminate after a configurable limit.

Infinite loops are not permitted.

</loop_engineering>

---

<future_capabilities>

Future AI capabilities may include:

- Retrieval-Augmented Generation (RAG)
- Vector Search
- Knowledge Graph Reasoning
- Multi-Agent Collaboration
- AI Planning
- AI Memory
- Semantic Recommendation
- Automatic Topic Clustering
- Duplicate Detection

These capabilities should extend the pipeline without replacing its architecture.

</future_capabilities>

---

<constraints>

The pipeline must remain:

- Model agnostic
- Cost efficient
- Deterministic where possible
- Explainable
- Modular
- Replaceable

Business logic should never depend on a specific LLM provider.

</constraints>