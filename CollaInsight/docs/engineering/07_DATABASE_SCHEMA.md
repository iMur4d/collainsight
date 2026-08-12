# Database Schema

<objective>

Define the logical data model of the platform.

This document describes the entities, their responsibilities, relationships, and ownership.

The purpose is to provide a stable domain model independent of implementation details.

This document intentionally avoids SQL syntax.

</objective>

---

<context>

The platform is designed around Platform Users rather than communication channels.

Knowledge belongs to users.

Communication providers such as Telegram, WhatsApp, and the Web are external integrations linked to platform accounts.

The database should remain provider-agnostic.

</context>

---

<design_principles>

## Platform First

The platform owns the identity.

External providers only authenticate or deliver messages.

---

## Domain Driven

Every entity represents a real business concept.

Tables should never exist only because a framework requires them.

---

## Provider Agnostic

The schema must support future communication channels without structural changes.

---

## AI Ready

The schema should support future AI capabilities including:

- RAG
- Embeddings
- Knowledge Graph
- Multi-Agent Systems
- Recommendation Engine

without redesigning the core model.

</design_principles>

---

<mvp_scope_note>

`docs/00_MVP_SCOPE.md` is authoritative. This document models the full future platform; the MVP uses only a subset of it, implemented as a deliberately minimal PoC-level schema, not the production model below:

- **KnowledgeItem** is currently six separate flat tables (`poc_ideas`, `poc_questions`, `poc_suggestions`, `poc_decisions`, `poc_actions`, `poc_observations`), not the single unified entity described below. Each has its own type-specific fields (e.g. Question's `is_blocking`/`addressed_to`, Action's `owner`/`due`) alongside common fields (title, summary, tags, keywords, Telegram attribution, timestamp). See `backend/README.md` and the current n8n workflow's DDL sticky notes for the exact column-level shape. Status transitions beyond a disabled "Mark as Reviewed" UI stub are not implemented.
- **Pending confirmation** (PoC plumbing, not a long-term entity): before a KnowledgeItem is permanently stored, a temporary `pending_knowledge` record — knowledge type, the extracted payload as JSON, and a numeric Telegram user ID used only to authorize the confirmation (see the ExternalAccount note below) — holds it while the submitter confirms via private Telegram DM (Save/Cancel). The record is deleted after either action; nothing pending survives past that point. Implements the Human Confirmation step in `05_WORKFLOWS.md`.
- **AI-safe read view** (PoC plumbing, not a long-term entity): `ai_knowledge_feed` is a restricted, read-only Postgres view unioning the six knowledge tables, exposing only `knowledge_type`, `source_id`, `title`, `summary`, `tags`, `keywords`, a type-specific `attributes` object, and `created_at` — no Telegram identity metadata, no raw source message text. It is the only thing the Insights AI reads, via a dedicated least-privilege `ai_readonly` role, verified to have no `SELECT`/`INSERT` access to the six raw tables. See `13_SECURITY.md`.
- **PlatformUser** in the MVP means managers/reviewers who authenticate into the dashboard — not Telegram participants.
- **ExternalAccount** (and the Account Linking it implies) is not used in the MVP. Telegram participants are identified by the raw username/first name captured at extraction time; they are not linked to a PlatformUser record. The one exception is the numeric Telegram user ID captured transiently for pending-confirmation authorization above — it is never written to any of the six permanent knowledge tables.
- **CollaborationSuggestion** and **KnowledgeRelationship** are post-MVP entities (Collaboration Hub and Knowledge Graph are both explicitly excluded from the MVP — see `docs/00_MVP_SCOPE.md`). They're documented here for architectural completeness, not as current build targets.

</mvp_scope_note>

---

<entity>

## PlatformUser

Purpose

Represents a registered platform user.

Responsibilities

- Owns projects
- Owns knowledge
- Owns preferences
- Owns AI history
- Links external accounts

Relationships

One PlatformUser

↓

Many External Accounts

↓

Many Projects

↓

Many Knowledge Items

↓

Many Notifications

</entity>

---

<entity>

## ExternalAccount

**Not used in the MVP** — see `mvp_scope_note` above.

Purpose

Represents an external communication provider linked to a platform account.

Examples

- Telegram
- WhatsApp
- Web
- Discord
- Slack

Responsibilities

- Store provider identity
- Link provider with PlatformUser

Relationships

Many External Accounts

↓

Belong to

↓

One PlatformUser

</entity>

---

<entity>

## Project

Purpose

Represents a collaborative workspace.

Responsibilities

- Organize knowledge
- Group members
- Store project context

Relationships

One Project

↓

Many Knowledge Items

↓

Many Members

</entity>

---

<entity>

## KnowledgeItem

Purpose

Represents structured knowledge generated by AI.

Examples

- Idea
- Suggestion
- Decision
- Action Item
- Question
- Observation

Responsibilities

- Store refined knowledge
- Store AI metadata
- Support search
- Support future graph relationships

Status (MVP)

- Pending
- Under Review
- Approved
- Rejected
- Archived
- Duplicate

Status is set manually by a manager. Marking an item as Duplicate is a manual status change in the MVP, not an automated relationship (see KnowledgeRelationship below, which remains a future capability).

Relationships

Belongs To

PlatformUser

Optional

Project

May Connect To

Other Knowledge Items

</entity>

---

<entity>

## KnowledgeRelationship

**Post-MVP** — see `mvp_scope_note` above.

Purpose

Represents semantic relationships between knowledge.

Examples

- Related
- Duplicate
- Supports
- Contradicts
- Expands
- References

This entity becomes the foundation for the future Knowledge Graph.

</entity>

---

<entity>

## CollaborationSuggestion

**Post-MVP** — see `mvp_scope_note` above.

Purpose

Represents AI-generated collaboration recommendations.

Examples

- Similar interests
- Shared projects
- Common expertise
- Complementary skills

Generated by the AI layer.

</entity>

---

<entity>

## Notification

Purpose

Represents platform notifications.

Examples

- New collaboration
- AI recommendation
- Project invitation
- Knowledge reviewed

Notifications remain channel-independent.

</entity>

---

<entity>

## ActivityLog

Purpose

Store important user activities.

Examples

- Login
- Knowledge submission
- Project creation
- AI execution
- Account linking

Activity logs support analytics and auditing.

</entity>

---

<entity>

## AIProcessingLog

Purpose

Stores AI execution metadata.

Examples

- Selected Model
- Processing Time
- Token Usage
- Confidence
- Pipeline Stage

Business data should remain separate from AI operational data.

</entity>

---

<relationships>

PlatformUser

↓

ExternalAccounts

↓

KnowledgeItems

↓

Projects

↓

Collaboration

↓

Notifications

KnowledgeItems

↓

KnowledgeRelationships

↓

Knowledge Graph

</relationships>

---

<future_entities>

Future versions may introduce:

- Team
- Organization
- Workspace
- Embeddings
- Vector Index
- AI Memory
- Meeting
- Document
- File Attachment
- Workflow
- AI Agent

These entities should extend the schema without changing existing ownership rules.

</future_entities>

---

<constraints>

The schema must remain:

- Provider agnostic
- AI ready
- Modular
- Extensible
- Independent from specific frameworks
- Independent from Supabase implementation

Business entities should never contain provider-specific logic.

</constraints>