# Technology Stack

<objective>

Define the approved technology stack for the CollaInsight platform.

This document serves as the source of truth for implementation technologies.

It exists to prevent architecture drift, reduce tooling ambiguity, and keep AI coding agents aligned with the project’s approved technical direction.

</objective>

---

<context>

CollaInsight is being built as an AI-powered knowledge collaboration platform.

The system is modular, workflow-driven, and designed for rapid iteration during development.

The technology stack must support:

- fast frontend development
- scalable backend services
- AI workflow orchestration
- structured data storage
- future extensibility
- strong developer experience
- AI-assisted coding

The stack should remain practical, modern, and maintainable.

</context>

---

<approved_stack>

## Frontend

Approved technologies:

- React
- Vite
- TypeScript
- TailwindCSS
- React Router
- shadcn/ui
- Framer Motion
- React Bits

Frontend responsibilities include:

- rendering the user interface
- managing interactive layouts
- displaying knowledge, collaboration, and insights
- consuming backend APIs
- supporting responsive design across devices

---

## Backend

Approved technologies:

- Python

Backend responsibilities include:

- business logic
- authentication support
- AI orchestration
- knowledge validation
- data coordination
- integration handling

Python is the main backend language for services and workflow-facing logic.

---

## Workflow Orchestration

Approved technologies:

- n8n

n8n is used for:

- event-driven workflows
- Telegram processing
- AI routing
- automation steps
- integration coordination

Workflow logic should remain separate from core business logic wherever possible.

---

## Database

Approved technologies:

- Supabase
- PostgreSQL

Supabase is used for:

- authentication support
- database hosting
- relational data storage
- role-aware data access patterns
- future extensibility

The database layer should remain provider-agnostic at the domain level, even though Supabase is the current implementation choice.

---

## AI Services

Approved technologies:

- Gemini
- Claude
- OpenAI

The AI layer should support multiple providers.

No single AI vendor should be hardcoded as the permanent dependency of the system.

The platform should be able to route work across models depending on task type and cost constraints.

---

## Deployment and Runtime

Approved technologies:

- Docker
- Docker Compose

These tools are used for:

- reproducible development environments
- local orchestration
- service isolation
- deployment consistency

---

## Supporting Tooling

Approved technologies:

- Markdown documentation
- XML-tagged context files
- Git
- AI coding agents
- IDE-assisted development

These tools support the documentation-first development workflow used throughout the project.

</approved_stack>

---

<technology_principles>

## Use the Simplest Tool That Works

Technology should be selected for clarity and maintainability, not novelty.

---

## Keep the Stack Coherent

Each approved tool should serve a clear role in the overall architecture.

Avoid redundant tools that solve the same problem without strong justification.

---

## Separate Concerns

Frontend, backend, workflows, database, and AI services must remain logically separated.

---

## Favor AI-Friendly Tooling

The stack should be easy for AI coding agents to understand, extend, and maintain.

---

## Support Iteration

The stack must allow fast prototyping and incremental improvement without large rewrites.

</technology_principles>

---

<frontend_rationale>

React was selected because the platform is a rich interactive workspace rather than a traditional marketing website.

Vite was selected because the project benefits from a simple and fast development experience.

TypeScript was selected to improve type safety, maintainability, and AI-assisted code generation quality.

TailwindCSS and shadcn/ui were selected to accelerate consistent UI development.

Framer Motion was selected for polished interactions and premium motion design.

React Bits may be used for high-quality UI motion and visual enhancements where appropriate.

</frontend_rationale>

---

<backend_rationale>

Python was selected because it is well suited for orchestration, AI services, data processing, and integration logic.

The backend must remain modular so that different services can evolve independently.

Python services should not contain frontend concerns.

</backend_rationale>

---

<workflow_rationale>

n8n was selected because the platform is workflow-driven and event-oriented.

It allows visual orchestration of steps such as:

- Telegram input handling
- AI processing
- data routing
- notifications
- conditional logic

n8n should remain focused on orchestration rather than owning the core domain model.

**Current state:** n8n hosts a deterministic JavaScript validation step (the output-shape check described in `06_AI_PIPELINE.md` Stage 7) for the five non-Idea commands (`/question`, `/suggestion`, `/decision`, `/action`, `/observation`). This is a deliberate architectural decision, not temporary scaffolding awaiting a move to the backend: those five commands' AI step is single-shot structured generation rather than multi-step reasoning, so keeping their validation next to their extraction in n8n avoids an unnecessary round-trip to the backend for logic that doesn't need Python's agentic capabilities. `/idea`'s validation lives in the Python backend, consistent with the approved stack below — see `docs/PROJECT_UNDERSTANDING.md` §8 for the full deterministic-vs-LLM breakdown.

</workflow_rationale>

---

<database_rationale>

Supabase was selected because it provides a practical development path for the current project stage.

Its advantages include:

- PostgreSQL foundation
- built-in authentication support
- structured relational data
- easier integration with frontend and workflow tools
- good fit for rapid iteration

Supabase is the current implementation choice, but the domain model should remain portable.

</database_rationale>

---

<ai_rationale>

The platform should support multiple AI providers so that the system remains flexible and cost-aware.

AI tasks may be routed based on:

- task complexity
- token cost
- context size
- reasoning need
- confidence level

The technology stack should never force the project into a single-model dependency.

</ai_rationale>

---

<implementation_boundaries>

The approved stack defines what should be used in this project.

Other technologies should not be introduced casually without explicit architectural justification.

Examples of technologies that are not currently part of the approved stack include:

- Next.js
- Firebase
- Prisma
- MongoDB
- Express.js
- Django
- GraphQL

If a future requirement makes one of these technologies useful, it should be evaluated through an engineering decision document before adoption.

</implementation_boundaries>

---

<future_stack>

Future technologies may be introduced if the platform evolves, including:

- vector databases
- knowledge graph engines
- agent frameworks
- realtime event layers
- PWA support
- advanced observability tools
- more specialized AI orchestration systems

Any future addition must be documented before adoption.

</future_stack>

---

<references>

Related documents:

- PRODUCT_VISION.md
- PROBLEM_STATEMENT.md
- TARGET_USERS.md
- SYSTEM_ARCHITECTURE.md
- AI_PIPELINE.md
- DATABASE_SCHEMA.md
- BACKEND_SPEC.md
- FRONTEND_SPEC.md
- API_SPEC.md
- BUSINESS_RULES.md
- SECURITY.md

</references>

---

<constraints>

The technology stack must remain:

- modern
- maintainable
- AI-friendly
- modular
- practical
- extensible

The stack must not contradict the architecture or business rules.

</constraints>
