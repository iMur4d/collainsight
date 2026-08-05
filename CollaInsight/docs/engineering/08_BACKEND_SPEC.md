# Backend Specification

<objective>

Define the responsibilities, architecture, and boundaries of the backend system.

The backend is responsible for orchestrating business logic, AI processing, authentication, persistence, and integrations while remaining modular and scalable.

Implementation details are intentionally excluded from this document.

</objective>

---

<context>

The backend serves as the central coordination layer of the platform.

It connects:

- Frontend
- AI Pipeline
- Database
- External Integrations
- Workflow Automation

Business logic must remain independent from communication providers and AI vendors.

</context>

---

<mvp_scope_note>

`docs/00_MVP_SCOPE.md` is authoritative. This document describes the full backend's modules; for the MVP, the **Authentication** module below is scoped to manager/reviewer dashboard login only (via Supabase Auth — see `14_TECHNOLOGY_STACK.md`). Its "Account linking" and self-service "User registration" responsibilities are post-MVP: Telegram participants do not authenticate or link an account during the MVP.

The backend module itself does not exist yet as a running service — see `docs/PROJECT_UNDERSTANDING.md` for current implementation status.

</mvp_scope_note>

---

<architecture>

The backend follows a modular architecture.

Each module owns a single responsibility.

Modules communicate through clearly defined interfaces.

No module should directly manipulate another module's internal logic.

</architecture>

---

<modules>

## Authentication

Responsibilities

- User registration (post-MVP — see `mvp_scope_note` above)
- Login (MVP: manager/reviewer dashboard login)
- Session validation
- Account linking (post-MVP)
- Identity verification (post-MVP for Telegram; not required for the MVP's passive message capture)

Authentication should remain provider agnostic.

---

## User Management

Responsibilities

- User profiles
- Preferences
- Account settings
- External account linking

---

## Knowledge

Responsibilities

- Knowledge creation
- Knowledge updates
- Knowledge retrieval
- Search preparation
- Metadata management

The backend never generates knowledge.

AI generates knowledge.

The backend validates and stores it.

---

## Projects

Responsibilities

- Project lifecycle
- Membership
- Permissions
- Knowledge organization

---

## Collaboration

Responsibilities

- AI recommendations
- Team matching
- Suggested collaborators

This module consumes AI output.

It does not perform AI reasoning.

---

## Notification

Responsibilities

- In-app notifications
- Future external notifications
- Delivery tracking

Notifications remain channel independent.

---

## AI Integration

Responsibilities

- Execute AI Pipeline
- Route requests
- Select models
- Handle retries
- Validate responses

The backend must never depend on a specific AI provider.

---

## External Integrations

Responsibilities

- Telegram
- WhatsApp
- Mini Apps
- Future providers

External integrations translate external events into platform actions.

</modules>

---

<service_boundaries>

The backend owns:

- Business logic
- Validation
- Authorization
- Persistence
- AI orchestration

The backend does not own:

- UI rendering
- Workflow automation
- Database implementation
- AI model internals

</service_boundaries>

---

<validation>

Every incoming request must pass validation before business logic executes.

Validation includes:

- Authentication
- Authorization
- Required fields
- Business rules
- Input integrity

Invalid requests should never reach the AI pipeline.

</validation>

---

<error_handling>

Errors should be categorized.

Examples

- Validation Error
- Authentication Error
- Authorization Error
- AI Processing Error
- Storage Error
- External Integration Error

Errors should expose user-friendly messages while preserving internal diagnostic information.

</error_handling>

---

<logging>

The backend should log:

- Authentication events
- AI executions
- Critical failures
- External integration events
- Business events

Sensitive information must never be logged.

</logging>

---

<configuration>

Configuration should remain environment-based.

Examples

- API Keys
- Database URLs
- AI Providers
- Feature Flags
- Rate Limits

Configuration must never be hardcoded.

</configuration>

---

<constraints>

The backend must remain:

- Modular
- Testable
- Provider agnostic
- Extensible
- Observable
- Secure

Business logic should never depend on Telegram, Supabase, or any specific AI model.

</constraints>