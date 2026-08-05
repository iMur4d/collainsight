# Business Rules

<objective>

Define the business behavior of the CollaInsight platform.

This document describes how the platform should behave from a product perspective.

It does not describe implementation details.

Business Rules represent the source of truth for platform behavior.

</objective>

---

<context>

CollaInsight transforms unstructured conversations into actionable organizational knowledge.

The platform is designed to reduce information overload, improve collaboration, and help organizations make better decisions.

Every workflow should support these goals.

</context>

---

<mvp_scope_note>

`docs/00_MVP_SCOPE.md` is authoritative. This document describes the full platform's business rules; for the MVP, only Managers/Executives authenticate into the platform (dashboard login). Telegram participants (Students/Team Members generating the discussion) are not required to register or link accounts during the MVP — see `docs/engineering/08_BACKEND_SPEC.md`. Roles and rules involving collaboration matching or knowledge relationships below describe future capability, not current MVP behavior.

The `<ai_rules>` list below includes "Classify knowledge" as a full-platform AI capability. For the MVP, category selection is a user action via Telegram slash command, not an AI capability — see `00_MVP_SCOPE.md`'s `<capture_principle>`.

</mvp_scope_note>

---

<core_principles>

## Human First

AI assists users.

AI never replaces human decisions.

Users always retain ownership of their knowledge.

---

## Knowledge Before Documents

The platform stores structured knowledge rather than raw conversations.

Messages are temporary.

Knowledge is permanent.

---

## Review Before Storage

AI-generated knowledge should be reviewed before becoming part of the organization's knowledge base whenever the workflow requires human confirmation.

---

## Collaboration Over Collection

The platform exists to connect people through knowledge.

Collecting information alone does not create value.

</core_principles>

---

<knowledge_submission>

When a user submits information:

1. Validate the sender.
2. Validate the request.
3. Process the content through the AI Pipeline.
4. Generate structured knowledge.
5. Present the result for review when applicable.
6. Store only approved knowledge.

Invalid or meaningless messages should never become knowledge.

</knowledge_submission>

---

<knowledge_rules>

Knowledge must:

- Have a clear owner.
- Have a creation timestamp.
- Belong to a knowledge type.
- Be searchable.
- Be editable.
- Remain traceable.

Knowledge should never exist without ownership.

</knowledge_rules>

---

<collaboration_rules>

The platform should continuously identify opportunities for collaboration.

Examples include:

- Similar ideas
- Shared research interests
- Related projects
- Complementary expertise

Collaboration suggestions are recommendations, not automatic actions.

</collaboration_rules>

---

<project_rules>

Projects organize knowledge.

Projects do not own users.

Users may participate in multiple projects.

Knowledge may belong to a project or remain personal.

</project_rules>

---

<ai_rules>

AI may:

- Classify knowledge (post-MVP — see `<mvp_scope_note>` above; the MVP's slash command selects the category instead).
- Summarize information.
- Detect relationships.
- Suggest collaborators.
- Recommend improvements.

AI must never:

- Modify stored knowledge without authorization.
- Delete user knowledge.
- Change ownership.
- Make irreversible business decisions.
- Generate or invent statistics, counts, or numeric metrics. Deterministic facts are calculated by the application from stored knowledge, not by the AI.

</ai_rules>

---

<roles>

Platform Member

- Submit knowledge
- View personal knowledge
- Participate in projects

---

Project Lead

- Review project knowledge
- Organize collaboration
- View project insights

---

Administrator

- Manage projects
- Manage users
- Configure platform settings

---

Executive

- View organizational insights (MVP: the deterministic Executive Dashboard insights — see `docs/engineering/09_FRONTEND_SPEC.md`)
- Review trends
- Review AI summaries
- Discover collaboration opportunities (post-MVP — Collaboration Hub is excluded from the MVP)

</roles>

---

<privacy_rules>

Users own their personal knowledge.

Organizations own shared project knowledge.

Private knowledge must never become public without authorization.

External communication providers must never determine ownership.

</privacy_rules>

---

<notification_rules>

Notifications should be meaningful.

The platform should avoid unnecessary interruptions.

Users should only receive notifications relevant to their work.

</notification_rules>

---

<future_rules>

Future platform versions may introduce:

- AI memory
- Knowledge Graph reasoning
- Semantic search
- RAG
- Vector search
- Organization workspaces
- AI agents

These additions must respect the existing business rules.

</future_rules>

---

<references>

Related Documents

- PRODUCT_VISION.md
- SYSTEM_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- BACKEND_SPEC.md
- API_SPEC.md

</references>

---

<constraints>

Business Rules define platform behavior.

Implementation details belong to engineering documentation.

Business Rules should remain independent from:

- Programming languages
- Frameworks
- Databases
- AI vendors
- Workflow engines

</constraints>