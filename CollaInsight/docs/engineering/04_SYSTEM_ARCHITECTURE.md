# System Architecture

<objective>

Define the high-level architecture of the platform.

This document describes how every system component interacts, the responsibilities of each module, and the architectural principles that govern future development.

This document intentionally avoids implementation details and programming languages.

</objective>

---

<context>

The platform follows a modular, AI-first architecture.

Every major capability is implemented as an independent module.

Communication between modules should occur through clearly defined interfaces, making each component replaceable without affecting the overall system.

The system is designed to support future expansion while keeping the MVP simple.

</context>

---

<mvp_scope_note>

`docs/00_MVP_SCOPE.md` is authoritative. This document describes the full platform's modules; for the MVP:

- The **Identity Service** is scoped to manager/reviewer login only. Telegram participants are not registered or linked to a platform account — they remain identified only by the raw sender info captured during extraction. One narrow, deliberate exception: a Telegram numeric user ID is captured transiently to authorize the private Save/Cancel confirmation (see `07_DATABASE_SCHEMA.md`'s `pending_knowledge` note) — it is never written to permanent knowledge storage.
- The **Communication Layer** has one active channel (Telegram), implemented and running. Per `00_MVP_SCOPE.md`'s `<capture_principle>`, the bot is triggered by explicit slash commands (`/idea`, `/question`, `/suggestion`, `/decision`, `/action`, `/observation`), not passive/ambient reading of every group message — there is still no per-user "connect Telegram" account-linking action in the MVP. It also delivers Save/Cancel callback button presses for the confirmation step (see `05_WORKFLOWS.md`).
- The **AI Layer**'s "Knowledge Classification" component (see `<system_modules>` below) does not apply to the MVP — the slash command performs category selection instead. See `06_AI_PIPELINE.md`'s `<mvp_scope_note>` (Stage 3).
- The **Workflow Engine** (n8n) is the deterministic orchestration layer for all six commands, and for five of them also performs the AI extraction itself (a direct Gemini call) since that work is single-shot structured generation, not multi-step reasoning — this is a settled architectural split, not temporary scaffolding. Only `/idea`'s AI logic and the read-only Insights AI live in the Python backend. See `08_BACKEND_SPEC.md`'s `<mvp_scope_note>`.

</mvp_scope_note>

---

<architecture_principles>

## Modular Design

Every subsystem must have a single responsibility.

Modules should communicate through APIs, events, or workflows rather than direct dependencies.

---

## AI as a Service

Artificial Intelligence is treated as an independent service.

Business logic should never depend on a specific AI provider.

The platform must be able to replace Gemini with Claude, OpenAI, or local models without redesigning the application.

---

## Workflow Driven

Business processes are orchestrated through workflows rather than large monolithic application code.

Workflow orchestration may be implemented using platforms such as n8n.

---

## Scalable by Design

The architecture should allow additional communication channels, AI services, and databases without major restructuring.

</architecture_principles>

---

<system_modules>

## Identity Service

Responsible for:

- User registration
- Authentication
- Authorization
- Account linking
- Session management

This service owns the platform identity.

External platforms (Telegram, WhatsApp, Web) are linked to platform accounts rather than becoming the identity source.

---

## Communication Layer

Responsible for receiving information from external channels.

Examples:

- Telegram Bot
- Telegram Mini App
- Web Application
- WhatsApp (Future)
- Discord (Future)

This layer should never contain business logic.

Its responsibility ends after delivering validated user input into the workflow engine.

---

## Workflow Engine

Responsible for orchestrating business processes.

Typical responsibilities include:

- Triggering workflows
- Routing requests
- Calling AI services
- Saving knowledge
- Sending notifications

The workflow engine coordinates the system but does not implement business logic.

---

## AI Layer

Responsible for transforming raw conversations into structured knowledge.

Possible components include:

- Text Cleaning
- Small Language Model Router
- Context Retrieval
- Large Language Model
- Metadata Generation
- Knowledge Classification (post-MVP — see `<mvp_scope_note>` above; the MVP's slash command selects the category instead)

Future AI capabilities may include:

- RAG
- Multi-Agent Systems
- Knowledge Graph Reasoning

---

## Knowledge Service

Responsible for storing structured organizational knowledge.

This module owns:

- Knowledge Items
- Projects
- Tags
- Relationships
- Metadata

It should remain independent from the AI provider.

---

## Database Layer

Responsible for persistence.

Stores:

- Users
- Projects
- Knowledge
- AI Metadata
- Audit Logs
- Relationships

Database technology is implementation specific.

---

## Frontend

Provides the user interface.

Includes:

- Team Dashboard
- Personal Workspace
- Project Pages
- Knowledge Explorer
- Analytics
- Collaboration

The frontend consumes platform APIs only.

Business logic must remain on the backend.

</system_modules>

---

<system_flow>

High-level flow:

User

↓

Communication Layer

↓

Workflow Engine

↓

Identity Verification

↓

AI Processing

↓

Knowledge Service

↓

Database

↓

Frontend Dashboard

</system_flow>

---

<design_constraints>

The architecture must avoid tightly coupled components.

Every module should be independently replaceable.

The workflow engine must orchestrate rather than own business logic.

Communication channels must remain independent from knowledge storage.

AI providers must remain interchangeable.

</design_constraints>

---

<future_architecture>

Future versions may introduce:

- Event Bus
- Vector Database
- AI Memory Layer
- Knowledge Graph Engine
- Recommendation Engine
- Agent Framework
- Real-time Collaboration
- Microservice Deployment

The current architecture should not prevent these additions.

</future_architecture>