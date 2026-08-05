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

The 8 stages above describe the full long-term pipeline (see `<mvp_scope_note>` for which stages apply to the MVP at all).

**The currently running Phase 1 build predates the slash-command capture principle and has not been reworked to match it yet** (see `docs/PROJECT_UNDERSTANDING.md` §4/§9 for status). It runs a simplified 3-step version inside n8n: a deterministic filter (drops empty messages *and* `/commands` — the opposite of the target design, where a command is the trigger), one combined Gemini call that free-text-classifies the message and outputs `SKIP` or a category (folding Stage 1's semantic gate together with Stage 3 and Stage 6), and a deterministic validator (Stage 7). Rebuilding this workflow around explicit slash-command triggers — removing the classification step and the `SKIP` outcome in favor of deterministic validation failure — is a pending task, not yet started. Stages 2, 4, and 5 (normalization, context decision, context retrieval) are not implemented, and Stage 7's retry/escalate loop (`loop_engineering` below) is not implemented — failed validation currently just marks the item invalid rather than regenerating it.

**Stage 7's validator is temporarily a JavaScript Code node inside n8n.** This was a scoped Phase 1 decision only: n8n's hardened Docker image cannot run Python without a disproportionate task-runner setup for what Phase 1 needed. It is not a change to the approved stack — `14_TECHNOLOGY_STACK.md` still specifies Python as the long-term backend language, and Stage 7's deterministic validation logic belongs there once that backend exists. n8n's role at that point returns to orchestration only (triggering the pipeline, calling the backend), not owning the validation logic itself.

</current_implementation_note>

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