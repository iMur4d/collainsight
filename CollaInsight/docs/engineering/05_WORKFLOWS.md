# Workflows

<objective>

Define every business workflow inside the platform.

This document describes how information flows through the system.

The focus is business behavior rather than implementation details.

Each workflow should represent a complete user journey.

Workflow engines such as n8n may use this document as the source of truth.

</objective>

---

<context>

The platform is event-driven.

Every workflow begins with an event and ends with a completed business outcome.

Workflows should remain modular, reusable, and independent.

Business logic should not be duplicated across workflows.

</context>

---

<mvp_scope_note>

`docs/00_MVP_SCOPE.md` is the authoritative definition of what ships first; this document describes the full platform's workflows, some of which are not yet in scope.

MVP-active workflows: **Submit Knowledge** (explicit slash-command capture, not a registered-user submission action — see note below), **AI Processing**, **Knowledge Item Status Update**, **Knowledge Search**.

Submit Knowledge's MVP trigger is an explicit Telegram slash command (see `00_MVP_SCOPE.md`'s `<capture_principle>`) — there's no platform registration, but there is a deliberate, user-driven act of submission. This is not passive or ambient capture of arbitrary group messages.

Not in MVP scope: **User Registration** and **Account Linking** (Telegram participants are not required to register or link an account during the MVP; only managers authenticate, directly into the dashboard), and **Collaboration Discovery** (the Collaboration Hub / Recommendation Engine is explicitly excluded from the MVP). Treat these three workflows as future-facing documentation, not current build targets.

</mvp_scope_note>

---

<workflow>

## User Registration

**Post-MVP.** See `mvp_scope_note` above — the MVP does not implement platform-account registration.

### Trigger

User opens the platform for the first time.

### Flow

User Registration

↓

Validate Information

↓

Create Platform Account

↓

Generate Internal User ID

↓

Store User

↓

Registration Complete

### Result

The user now owns a platform account that can be linked to external communication channels.

</workflow>

---

<workflow>

## Account Linking

**Post-MVP.** See `mvp_scope_note` above — the MVP does not link Telegram identities to platform accounts.

### Trigger

User connects Telegram.

### Flow

Authenticated User

↓

Telegram Authorization

↓

Verify Telegram Identity

↓

Create Channel Mapping

↓

Save Connection

↓

Ready to Use

### Result

Telegram becomes one communication channel associated with the platform account.

The platform identity always remains the primary identity.

</workflow>

---

<workflow>

## Submit Knowledge

### Trigger

A registered user submits an idea, suggestion, decision, action item, question, or observation.

**MVP note:** the trigger is a participant sending a Telegram slash command (`/idea`, `/question`, `/suggestion`, `/decision`, etc.) with content, in the connected Telegram group — this *is* the deliberate "submit to CollaInsight" action. There is no separate registration step, but there is an explicit, user-driven act of submission (see `00_MVP_SCOPE.md`'s `<capture_principle>`). Identity Verification below is a no-op for the MVP: the sender's raw Telegram username/first name is captured for display, not verified against a platform account.

**Current build note:** the running Phase 1 n8n workflow predates this — it still passively captures any message posted in the group rather than triggering on a command. Rebuilding it around explicit slash-command triggers is a pending task, not yet started (see `docs/PROJECT_UNDERSTANDING.md` §4/§9).

### Flow

Receive Submission

↓

Identity Verification

↓

Input Validation

↓

AI Processing

↓

Knowledge Generation

↓

Store Knowledge

↓

Refresh Dashboard

↓

Notify User

### Result

A structured knowledge item is created.

</workflow>

---

<workflow>

## AI Processing

### Trigger

Validated knowledge submission.

**MVP note:** the category is already fixed by the slash command that triggered Submit Knowledge (see `00_MVP_SCOPE.md`'s `<capture_principle>`) — "Classify Thought" below does not apply to the MVP. It remains in this workflow because the document describes the full long-term pipeline; it only becomes active again if a future release reintroduces natural-language submission with automatic intent detection (`06_AI_PIPELINE.md` Stage 3).

### Flow

Clean Text

↓

Classify Thought *(post-MVP — see note above)*

↓

Retrieve Context (Optional)

↓

Generate Metadata

↓

Validate Output

↓

Return Structured Knowledge

### Result

The AI produces structured knowledge rather than raw text.

</workflow>

---

<workflow>

## Knowledge Item Status Update

### Trigger

A manager changes the status of a knowledge item.

### Flow

Manager Reviews Item

↓

Select New Status (Pending, Under Review, Approved, Rejected, Archived, Duplicate)

↓

Validate Permission

↓

Update Status

↓

Refresh Dashboard

### Result

The item reflects its current review state. Marking an item as Duplicate is a manual manager action; the MVP does not perform automatic duplicate detection.

</workflow>

---

<workflow>

## Knowledge Search

### Trigger

User searches for knowledge.

### Flow

Receive Query

↓

Search Knowledge Base

↓

Rank Results

↓

Display Results

### Result

Relevant knowledge items are presented.

</workflow>

---

<workflow>

## Collaboration Discovery

**Post-MVP.** See `mvp_scope_note` above — the Collaboration Hub / Recommendation Engine is explicitly excluded from the MVP.

### Trigger

New knowledge is created.

### Flow

Analyze Topics

↓

Compare Existing Knowledge

↓

Find Similar Interests

↓

Generate Collaboration Suggestions

↓

Notify Dashboard

### Result

Potential collaboration opportunities become visible.

</workflow>

---

<workflow>

## Admin Review

### Trigger

Administrator opens dashboard.

### Flow

Load Organization Knowledge

↓

Generate AI Summary

↓

Highlight Important Items

↓

Display Analytics

↓

Support Decision Making

### Result

Management receives insights instead of raw conversations.

</workflow>

---

<workflow>

## Notification

### Trigger

Platform Event

### Flow

Determine Recipient

↓

Determine Channel

↓

Generate Message

↓

Deliver Notification

↓

Log Delivery

### Result

Relevant users receive notifications.

</workflow>

---

<constraints>

Every workflow must:

- Have one clear trigger.
- Produce one clear business outcome.
- Remain independent.
- Be reusable.
- Avoid direct dependencies on specific AI providers.

</constraints>

---

<future_workflows>

Future workflows may include:

- AI Coaching
- Team Matching
- Knowledge Approval
- Auto Project Assignment
- Meeting Summaries
- Voice Processing
- Multi-Agent Review
- Knowledge Synchronization
- Semantic Linking

Future workflows should extend this document without modifying existing workflows.

</future_workflows>