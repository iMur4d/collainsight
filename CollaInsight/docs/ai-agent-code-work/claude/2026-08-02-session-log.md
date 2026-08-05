# Session Log — 2026-08-02 — Claude

<summary>

Five pieces of work, in order:

1. A new architecture decision, relayed by the user: the MVP Telegram bot will not use AI to classify arbitrary free-text messages. Instead it exposes explicit slash commands (`/idea`, `/question`, `/suggestion`, `/decision`, etc.) that select the category up front; the bot is event-driven, invoked only on a command, not by passively monitoring every group message. A follow-up decision retired the `SKIP` concept entirely, replacing it with deterministic validation failure.
2. A full audit of every MVP-related doc in `/docs` against these two decisions, without making changes — classifying each as fully aligned, partially drifted, contradicting, or in need of terminology cleanup.
3. Documentation updated across seven files to resolve every doc the audit flagged as an actual contradiction.
4. Three additional docs flagged by the audit as "terminology drift" were re-examined under a stricter bar ("only fix actual contradictions") and left unchanged — none of them specifically asserted the MVP does AI-driven classification.
5. Confirmed, on the user's question, that the existing `docs/ai-agent-code-work/claude/` session logs (2026-07-27 through 2026-07-29) should be preserved as-is, per this folder's own README policy — which surfaced the fact that today's session had no log entry yet, producing this file.

No code was changed this session — this was a documentation-only pass. The actual n8n workflow (`automation/workflows/telegram-discussion-extraction.json`) still implements the pre-slash-command design and has not been reworked; that remains open (see `<open_items>`).

</summary>

---

<session_update>

**Start:** 13:41 AST, 2026-08-02
**End:** 20:26 AST, 2026-08-02

<part_1>

## Part 1 — Architecture decision: explicit slash-command capture principle; SKIP retired

The user relayed a design decision made after reviewing the implementation plan: the MVP bot will not ask the AI to classify arbitrary Telegram messages. Instead, Telegram slash commands (`/idea`, `/question`, `/suggestion`, `/decision`, and other supported types) select the category before the user writes content — the command performs the classification, not the AI. This also makes the bot event-driven rather than conversation-driven: the AI is only invoked when a user explicitly calls a supported command, not by continuously reading every group message.

**Why (per the user):** reduces implementation complexity, eliminates an unnecessary AI classification step, produces more predictable outputs, reduces prompt-engineering complexity, makes testing easier, lets the MVP finish faster, lowers LLM cost (no per-message inference), and gives users explicit control over what enters the organizational knowledge base. The long-term product vision still wants natural-language input with automatic intent detection eventually — that remains a deliberately deferred future enhancement, not part of MVP scope.

**Follow-up decision:** the `SKIP` concept is obsolete for the MVP. `SKIP` was an AI judgment call needed only because the AI had to infer relevance from arbitrary free text — with the command already fixing the category, there's no inference step left for `SKIP` to represent. Replaced by deterministic **validation failure** (empty content, unsupported attachment, speech-to-text failure, invalid submission), checked by app/validator logic, not inferred by the LLM.

**Notable side effect:** this makes the unresolved "Gemini keeps returning `SKIP`" bug documented in the 2026-07-29 log (Part 9) moot — that bug was a symptom of free-text classification, which no longer exists in the target design. The currently running n8n workflow has not been reworked to match this decision yet (see `<open_items>`), so the bug technically still exists in the live pipeline until that rework happens.

No files were changed in this part — decision only.

</part_1>

---

<part_2>

## Part 2 — Full MVP documentation audit against the new decisions

At the user's request, reviewed every MVP-related doc in `/docs` (all of `docs/product/`, `docs/engineering/`, plus `README.md`, `AI_AGENT_CONTEXT.md`, `PROJECT_STATUS.md`, `docs/PROJECT_UNDERSTANDING.md`) against the capture-principle and SKIP-retirement decisions from Part 1, without modifying anything — producing a review report only.

**Findings:**
- **Fully aligned** (mechanism-agnostic, no changes needed): `02_PROBLEM_STATEMENT.md`, `03_TARGET_USERS.md`, `07_DATABASE_SCHEMA.md`, `08_BACKEND_SPEC.md`, `10_API_SPEC.md`, `12_UI_UX_SPECIFICATION.md`, `14_TECHNOLOGY_STACK.md`, `AI_AGENT_CONTEXT.md`, `PROJECT_STATUS.md`.
- **Partially drifted:** `01_PRODUCT_VISION.md`, `09_FRONTEND_SPEC.md` (SKIP-rate metric), `13_SECURITY.md`, `15_ENGINEERING_DECISIONS.md`, `16_ROADMAP.md`.
- **Contradicts:** `00_MVP_SCOPE.md` (highest priority — the authoritative doc), `PROJECT_UNDERSTANDING.md` (the primary onboarding doc), `04_SYSTEM_ARCHITECTURE.md`, `05_WORKFLOWS.md`, `06_AI_PIPELINE.md`, `11_BUSINESS_RULES.md`, `README.md`.
- **Cross-cutting terminology issue:** "classify/classification" used throughout to describe an AI responsibility that no longer exists in the MVP; "passive"/"no deliberate action" language describing message capture, which needed to become "explicit command invocation."

Priority order set for the follow-up edits: `00_MVP_SCOPE.md` → `PROJECT_UNDERSTANDING.md` → engineering trio (`06_AI_PIPELINE.md`, `05_WORKFLOWS.md`, `04_SYSTEM_ARCHITECTURE.md`) → `11_BUSINESS_RULES.md` + `README.md` → terminology-only pass on the remaining three.

No files were changed in this part — audit/report only.

</part_2>

---

<part_3>

## Part 3 — Documentation updated to resolve every flagged contradiction

Worked through the Part 2 priority list, pausing for user review after each file/group. User gave one standing instruction followed throughout: don't remove future-platform concepts (e.g. Stage 3 Intent Classification, AI-driven "Knowledge Classification") — mark them clearly as post-MVP instead, keeping the full-platform architecture documented and consistent.

- **`docs/00_MVP_SCOPE.md`** — added a new `<capture_principle>` section (knowledge only enters via explicit user action; users, not the AI, decide what becomes organizational knowledge; slash commands are the MVP's implementation of that principle, not the principle itself). Rewrote `<core_workflow>` from 6 to 7 steps: the command now selects the category up front, and a new step 4 makes validation failure explicit (replacing the old implicit free-text framing). Annotated the "AI Discussion Structuring" feature bullet. Added "Natural-language submission with automatic intent detection" to `<future_direction>` as the explicit, deliberate path back to AI-inferred classification.
- **`docs/PROJECT_UNDERSTANDING.md`** — added a capture-principle summary to §1. Rewrote §4 (data flow) to separate a new "target design" paragraph from the existing "Built and running today" steps, now explicitly labeled as predating the decision and not yet reworked. §5's component table gained a "target design" column (Gemini: extracts within the given category, no classification/SKIP; Validator: absorbs the input-side validation-failure checks SKIP used to cover). §6 (categories): category is chosen by command, not inferred; SKIP replaced by validation failure. §7: "SKIP rate" renamed "validation-failure rate." §8 (deterministic vs. LLM) rewritten to target design with a "current build note" caveat. §9 gained a "Pending rework" bullet stating the n8n workflow itself hasn't been rebuilt.
- **`docs/engineering/06_AI_PIPELINE.md`** — added a new `<mvp_scope_note>` (this doc had none, unlike its sibling docs) stating Stage 3 (Intent Classification) doesn't apply to the MVP and Stages 4–5 aren't implemented. Updated the "Facts Are Computed, Not Generated" principle to remove "classifying" from the AI's MVP responsibilities. Stage 1 annotated with an MVP note narrowing it to deterministic validation-failure checks. Stage 3 marked **Post-MVP** (content preserved, not deleted). `<current_implementation_note>` rewritten to flag that the running Phase 1 build predates the decision, including the literal inversion that its Filter node currently drops `/commands` rather than triggering on them. `<routing_strategy>` annotated as full-platform-only.
- **`docs/engineering/05_WORKFLOWS.md`** — `<mvp_scope_note>` flipped "passive Telegram capture" to "explicit slash-command capture." Submit Knowledge workflow's MVP note rewritten from "no deliberate submit action" to the opposite (the command *is* the deliberate action), plus a new "Current build note" flagging the live workflow hasn't been reworked. AI Processing workflow gained an MVP note explaining "Classify Thought" doesn't apply, with that step inline-tagged `(post-MVP)`.
- **`docs/engineering/04_SYSTEM_ARCHITECTURE.md`** — `<mvp_scope_note>` Communication Layer bullet flipped from "consumed passively" to explicit slash-command triggering (with the same current-build caveat). Added a bullet noting the AI Layer's "Knowledge Classification" doesn't apply to the MVP; annotated that line inline in `<system_modules>` as post-MVP.
- **`docs/product/11_BUSINESS_RULES.md`** — `<mvp_scope_note>` gained a sentence on "Classify knowledge" being full-platform-only; the `<ai_rules>` "Classify knowledge" bullet inline-tagged post-MVP.
- **`README.md`** — rewrote the "Next Steps" bullet that literally instructed building "Intent Classification -> Context Retrieval -> Knowledge Generation" next, replacing it with the actual MVP mechanism and naming Intent Classification as post-MVP.

</part_3>

---

<part_4>

## Part 4 — Remaining terminology-drift docs reviewed under a stricter bar; left unchanged

User narrowed the editing criterion: only fix actual contradictions with the capture principle, not stylistic/terminology-only language. Re-examined the three docs Part 2 flagged as "partially drifted":

- **`docs/engineering/13_SECURITY.md`** — "AI may classify..." sits in a security-boundary capability list (permitted vs. forbidden AI actions), not a claim about MVP mechanism. No contradiction.
- **`docs/engineering/15_ENGINEERING_DECISIONS.md`** — "classification before reasoning" is one line in the rationale for choosing a staged pipeline over a single prompt; the rationale holds regardless of what fills each stage. No contradiction.
- **`docs/engineering/16_ROADMAP.md`** — Milestone 2 ("The AI can classify...") is generic outcome language, and the doc's own `<context>` already states `00_MVP_SCOPE.md` wins wherever the roadmap runs ahead of it. No contradiction. (Noted separately, not fixed: this doc's "Immediate Features" list still includes "Telegram account linking," which contradicts every other doc's explicit MVP exclusion of account linking — a pre-existing inconsistency unrelated to today's decision.)

No files changed in this part.

</part_4>

---

<part_5>

## Part 5 — Confirmed the ai-agent-code-work log history should be preserved

User asked whether the prior days' session logs in this folder still need to be kept, since some of their detail now exceeds what's in `/docs`. Answer given: yes, keep all of them — `docs/ai-agent-code-work/README.md` (written 2026-07-27) already states the policy explicitly: logs are an append-only history, not a living spec, and past entries should never be edited to reflect new decisions. The logs also contain real, non-duplicated content the living spec shouldn't carry: rejected alternatives and why (speculative restructuring plan, Python-in-n8n), a standing product decision not recorded anywhere else ("hide, don't delete" for non-MVP frontend pages), and operational gotchas (campus Wi-Fi blocking Cloudflare Tunnel's port, `MSYS_NO_PATHCONV=1`, n8n's Docker Hardened Image having no package manager).

This surfaced that today's own work had no log entry yet, which this file resolves.

</part_5>

</session_update>

---

<open_items>

## Open items / not yet done

- **The n8n workflow itself has not been reworked.** `automation/workflows/telegram-discussion-extraction.json` still implements the pre-slash-command design: Filter node drops `/commands` instead of triggering on them, and the Gemini prompt still free-text-classifies with an explicit `SKIP` output mode. Rebuilding it around explicit slash-command triggers — and removing the `SKIP` output mode from the prompt in favor of the Code node validator absorbing validation-failure checks — is documented as pending in multiple docs now, but not started.
- **`docs/engineering/16_ROADMAP.md`'s "Immediate Features" list still contradicts the MVP scope** by including "Telegram account linking," which every other doc explicitly excludes from MVP. Flagged in Part 4, not fixed — unrelated to today's capture-principle work.
- **`README.md`'s "Product Context" doc list doesn't link `docs/00_MVP_SCOPE.md` or `docs/PROJECT_UNDERSTANDING.md`** — the two most authoritative docs in the set aren't in the README's own "source of truth" list. Flagged, not fixed.
- **Once the n8n workflow is actually reworked**, `docs/PROJECT_UNDERSTANDING.md` §4/§5/§8 and `06_AI_PIPELINE.md`'s `<current_implementation_note>` will need a follow-up pass to collapse the "target design vs. current build" split back into a single, current description.

</open_items>

---

<files_touched_this_session>

Documentation (Part 3):
- `docs/00_MVP_SCOPE.md`
- `docs/PROJECT_UNDERSTANDING.md`
- `docs/engineering/06_AI_PIPELINE.md`
- `docs/engineering/05_WORKFLOWS.md`
- `docs/engineering/04_SYSTEM_ARCHITECTURE.md`
- `docs/product/11_BUSINESS_RULES.md`
- `README.md`

No code, workflow, or other files were touched this session.

New (this entry):
- `docs/ai-agent-code-work/claude/2026-08-02-session-log.md` (this file)

Nothing has been committed to git as of the end of this session — all doc changes are sitting in the working tree, unstaged. (This session opened without git available in the working directory per the environment context; commit status should be confirmed independently before assuming this.)

</files_touched_this_session>
