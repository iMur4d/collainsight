# MVP Scope

<objective>

Define the exact scope of the first functional release (MVP).

This document intentionally limits development to the smallest product that delivers measurable value.

Everything outside this document belongs to future releases.

If another document conflicts with this MVP, this document takes priority during implementation.

</objective>

---

<problem>

Training programs generate a large volume of discussion through Telegram conversations — ideas, suggestions, decisions, action items, and questions.

Managers cannot realistically read every message.

As a result:

- Valuable ideas and decisions are missed.
- Duplicate ideas appear repeatedly.
- Action items and questions requiring attention go unnoticed.
- Students receive little feedback.
- Reviewing discussions consumes significant management time.

The MVP exists to solve this problem only.

</problem>

---

<primary_goal>

Transform unstructured Telegram discussions into structured, actionable summaries — ideas, suggestions, decisions, action items, questions requiring attention, and important observations — that managers can review efficiently.

The system should reduce review time while increasing visibility into what is actually happening in student discussions.

Success is measured by making discussion review faster, not by implementing every long-term platform feature.

</primary_goal>

---

<target_users>

Primary User

- Training Manager
- CTO
- CEO
- Program Supervisor

Secondary User

- Student
- Intern
- Team Member

During the MVP, the platform is optimized primarily for managers reviewing discussions.

Student-facing capabilities remain intentionally minimal.

</target_users>

---

<capture_principle>

Knowledge only enters the platform through an explicit action by the person submitting it. Users, not the AI, decide what becomes organizational knowledge — the AI does not decide, on its own, whether an arbitrary message contains something worth capturing.

For the MVP, this principle is implemented through Telegram slash commands (`/idea`, `/question`, `/suggestion`, `/decision`, and the other supported types). The student chooses the command, which fixes the category, before writing the content. This narrows the AI's job to extracting and structuring the content within the category already chosen — not inferring what the category is, and not judging whether the message matters.

Slash commands are the MVP's implementation of this principle, not the principle itself. A future release may relax this toward natural-language submission with automatic intent detection (see `<future_direction>`), but that reintroduces AI inference over arbitrary messages and must be treated as a deliberate scope decision, not an incidental extension of the MVP architecture.

</capture_principle>

---

<core_workflow>

1.

Student explicitly submits knowledge by sending a Telegram slash command (e.g. `/idea`, `/question`, `/suggestion`, `/decision`) followed by the content. The command selects the category.

↓

2.

The command and its content are received by the workflow.

↓

3.

The AI extracts and structures the content within the category already specified by the command, into a standardized format.

↓

4.

The result is validated. A validation failure — empty content, an unsupported attachment, a speech-to-text failure, or another invalid submission — stops the item here; it is not stored. A result that parses correctly but is too ambiguous to stand alone (semantically incomplete) also stops here — the student receives one focused clarification question instead of a stored item.

↓

5.

A valid, sufficiently clear result is not stored immediately. It is held as a temporary pending record and previewed privately (direct message) to the student who submitted it, with an explicit Save/Cancel confirmation — see `docs/engineering/05_WORKFLOWS.md` for the implementation detail. Cancel discards the pending record; only Save proceeds to storage.

↓

6.

The confirmed result is stored in the database.

↓

7.

The web dashboard displays the extracted items.

↓

8.

Managers review the discussion efficiently.

</core_workflow>

---

<mvp_features>

Included

✓ Telegram Integration

✓ User Authentication (managers/reviewers authenticate into the dashboard; Telegram participants are not required to register or link accounts during the MVP — see `docs/engineering/08_BACKEND_SPEC.md`)

✓ AI Discussion Structuring (Ideas, Suggestions, Decisions, Action Items, Questions, Observations) — captured via explicit Telegram slash commands, not automatic classification of arbitrary messages (see `<capture_principle>` above)

✓ Private Confirmation Before Storage — the student previews the extracted result via Telegram DM and explicitly saves or cancels it; nothing reaches the permanent knowledge store unconfirmed (see `<core_workflow>` step 5 and `docs/engineering/05_WORKFLOWS.md`)

✓ Structured Item Storage

✓ Dashboard

✓ Search

✓ Filters

✓ Basic Project Assignment

✓ Idea Status

✓ Executive Review Dashboard

Not Included

✗ Knowledge Graph

✗ Collaboration Matching

✗ Recommendation Engine

✗ WhatsApp Integration

✗ Telegram Mini Apps

✗ Multi-Organization Support

✗ Advanced Analytics

✗ Multi-Agent AI

✗ Automatic Idea Linking

</mvp_features>

---

<success_metrics>

The MVP is successful if managers can:

- Review discussions significantly faster than reading Telegram directly.
- Search extracted items by keywords.
- Track which student submitted each item.
- Organize items by project.
- Change item status.
- Reduce duplicate submissions by manually marking an item as Duplicate (the MVP does not perform automatic AI duplicate detection; see `docs/engineering/06_AI_PIPELINE.md`).

The MVP is not evaluated by the number of AI features.

It is evaluated by the reduction of management effort.

</success_metrics>

---

<future_direction>

Future releases will gradually introduce:

- Knowledge Graph
- AI Collaboration Suggestions
- Telegram Mini Apps
- WhatsApp Integration
- Semantic Search
- Executive Intelligence
- Organization Analytics
- AI Agents
- Cross-project knowledge linking
- Natural-language submission with automatic intent detection (removes the explicit slash-command requirement described in `<capture_principle>`)

These capabilities are intentionally excluded from the MVP to reduce complexity.

</future_direction>

---

<constraints>

Do not build future features before the MVP is complete.

Every implementation must answer one question:

"Does this help managers review student discussions more efficiently?"

If the answer is no, postpone the feature.

The MVP favors simplicity, speed, and reliability over completeness.

</constraints>