# Frontend Specification

<objective>

Define the responsibilities, architecture, and boundaries of the frontend application.

The frontend is responsible for rendering the user interface, handling user interactions, communicating with backend APIs, and providing a seamless, highly responsive experience for knowledge discovery and collaboration.

Implementation details (like specific frameworks or state management libraries) are intentionally excluded from this document.

</objective>

---

<context>

The frontend serves as the primary visual interface for CollaInsight.

It connects users with their organizational knowledge, AI-generated insights, and collaboration opportunities.

Business logic and AI processing happen on the backend; the frontend strictly consumes and presents this data.

</context>

---

<mvp_scope_note>

This document describes the long-term frontend vision for CollaInsight. It is not a description of the MVP build list.

The MVP (see `docs/00_MVP_SCOPE.md`) implements only a subset of the modules below: Dashboard (as a manager discussion-review view covering ideas, suggestions, decisions, action items, questions, and observations), Executive Dashboard (limited to the deterministic insights listed in its module section below — Executive Summary, Topic Distribution, Participation Overview, Discussion Health, Pending Questions, Action Items — without AI-generated widgets), Knowledge & Projects Explorer, and Settings & Identity.

The following modules are documented here for architectural completeness but are explicitly out of MVP scope until a future release:

- Knowledge Graph
- Collaboration Hub (Recommendation Engine / team matching)
- Executive Dashboard's AI-generated widgets (Team Pulse, Trending Ideas, Suggested Collaborations, Recurring Problems, Emerging Topics, Weekly Brief) and Advanced Analytics generally

Do not implement these modules as part of MVP work. Where they already exist in the current UI shell, treat them as future-facing scaffolding, not MVP surface area.

</mvp_scope_note>

---

<architecture>

The frontend follows a modular, component-based architecture.

Every view is constructed from reusable, independent UI components.

The application separates presentation (how things look) from data fetching and state management (how things work).

</architecture>

---

<modules>

## Dashboard

Responsibilities

- Display a high-level overview of recent knowledge.
- Present the AI Daily Briefing.
- Show organizational metrics and fast-access shortcuts.
- Adapt content based on the user's role (RBAC).

---

## Executive Dashboard

**MVP scope:** deterministic insights only. The application computes every figure below from stored knowledge items; where the LLM is involved (Executive Summary), it may only narrate figures the application already computed — it must never introduce a number, count, or trend on its own (see `06_AI_PIPELINE.md`'s "Facts Are Computed, Not Generated" principle). The AI-Generated Widgets further below are post-MVP.

Responsibilities (MVP)

- Present the deterministic executive insights listed below.
- Track organizational intelligence using only computed, explainable figures.

MVP Executive Insights

- **Executive Summary** — a short LLM-written narrative explaining the figures below in plain language; computed facts only, no invented figures.
- **Topic Distribution** — counts of knowledge items by category (Idea, Suggestion, Decision, Action Item, Question, Observation).
- **Participation Overview** — counts of activity by participant and/or project over a time range.
- **Discussion Health** — signals such as message volume trend and SKIP rate (share of messages that didn't classify into a category).
- **Pending Questions** — Question-category items with no resolving status change yet.
- **Action Items** — Action-Item-category items, filterable by status.

---

## Executive Dashboard — AI-Generated Widgets

**Post-MVP.** These widgets require the AI to generate an insight (pattern detection, recommendation) rather than narrate a figure the application already computed, which is why they're excluded from the MVP.

Executive Widgets (Post-MVP)

- Team Pulse
- Trending Ideas
- Suggested Collaborations
- Recurring Problems
- Emerging Topics
- Weekly Brief

---

## Knowledge Graph

Responsibilities

- Visually render semantic relationships between ideas, users, and projects.
- Support interactive exploration (zoom, pan, click).
- Handle large datasets smoothly without performance degradation.

---

## Collaboration Hub

Responsibilities

- Present AI-generated team matching and collaboration suggestions.
- Display overlapping expertise and shared knowledge areas.
- Facilitate introductions between team members.

---

## Knowledge & Projects Explorer

Responsibilities

- List, filter, and search structured knowledge items.
- Provide detailed views for specific ideas, tasks, or research notes.
- Manage project memberships and project-specific knowledge.

---

## Settings & Identity

Responsibilities

- Manage user profile preferences.
- Handle external account linking (e.g., Telegram integration status).
- Manage organization settings (for Administrators).

</modules>

---

<routing>

Public Routes

- Landing
- Login
- Register

Authenticated Routes

- Dashboard
- Knowledge
- Projects
- Collaboration
- Graph
- Settings

Admin Routes

- Executive Dashboard
- Organization Insights
- User Management

</routing>

---

<components>

Layout

↓

Page

↓

Section

↓

Widget

↓

Card

↓

Primitive Component

</components>

---

<layout>

Application Layout

- Top Navigation
- Left Sidebar
- Main Content
- Right Context Panel (Future)
- Footer (Optional)

</layout>

---

<state_strategy>

## Server State vs Local State

The frontend must clearly separate UI state (e.g., active tabs, modal visibility) from Server state (e.g., knowledge items, projects).

API responses should be cached effectively to enable optimistic UI updates, ensuring the application feels instantaneous even on slow networks.

</state_strategy>

---

<design_system>

## Centralized Tokens

All styling must be driven by centralized design tokens (e.g., CSS variables or a utility configuration).

Hardcoded colors, fonts, or arbitrary spacing values in individual components are strictly prohibited to ensure that "Premium Aesthetics" scale consistently across the application.

</design_system>

---

<design_principles>

## Responsive First

The interface must adapt flawlessly to mobile, tablet, and desktop screens. 

No core functionality should be restricted to desktop users.

---

## Adaptive Interface

The UI should adapt based on the current user's role.

Team members see personal knowledge; Team Leads see project knowledge; Executives see high-level insights.

---

## Premium Aesthetics

The application must feel modern, utilizing fluid animations, glassmorphism, depth, and curated typography.

Visual excellence encourages user interaction and platform adoption.

---

## Optimistic UI & Fast Feedback

Interactions should feel instantaneous.

When users perform actions, the UI should provide immediate visual feedback while confirming the action with the backend asynchronously.

</design_principles>

---

<loading>

Supported patterns:

- Skeleton Loading
- Lazy Loading
- Infinite Scroll
- Background Refresh
- Progress Indicators

</loading>

---

<empty_states>

Empty states are treated as critical user onboarding paths.

When a user has no projects, no knowledge, or no collaborations, the frontend must render guided, actionable empty states rather than blank screens or unhelpful "No data" messages.

</empty_states>

---

<service_boundaries>

The frontend owns:

- UI rendering and styling
- Client-side routing
- User interactions and input validation
- Visual animations and feedback
- Caching of API responses for performance

The frontend does not own:

- Data persistence
- Business rules and logic
- AI processing and metadata generation
- Authentication security (only manages tokens/sessions)

</service_boundaries>

---

<error_handling>

Errors should never break the user experience.

If an API fails, the frontend must degrade gracefully, providing clear, human-readable error messages.

Background failures (like a failed telemetry ping) should remain silent to the user.

</error_handling>

---

<constraints>

The frontend must remain:

- Accessible
- Performant
- Modular
- Independent from backend implementation details

The frontend must never contain hardcoded API URLs or secrets.

</constraints>