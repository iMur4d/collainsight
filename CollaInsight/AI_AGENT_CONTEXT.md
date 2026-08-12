# AI Agent Context & Developer Guide

<objective>

**ATTENTION AI ASSISTANTS & CODING AGENTS:** 
Read this file before generating code, answering architecture questions, or starting a new session. This file provides the "current state of the world" so you don't hallucinate features, suggest the wrong tech stack, or lose the project's scope.

</objective>

---

## 1. Project Overview
**Name:** CollaInsight
**Goal:** An AI-powered Knowledge Collaboration Platform.
**The MVP Problem:** Managers waste too much time reading long Telegram group conversations just to understand what happened — which ideas, decisions, action items, and questions actually need their attention.
**The MVP Solution:** A pipeline that takes Telegram messages -> uses AI to extract and structure the important information (ideas, suggestions, decisions, action items, questions, observations) -> saves it to a database -> displays it on a React dashboard for fast management review. Ideas are one category of extracted information, not the entire purpose of the pipeline.

**CRITICAL RULE:** Do NOT build features outside the MVP scope. No Knowledge Graphs, no Multi-Agent orchestrations, no WhatsApp integrations yet. If a feature doesn't help a manager understand and review a discussion faster, DO NOT build it. (See `docs/00_MVP_SCOPE.md`).

---

## 2. Current Development Phase
**Current Status:** MVP capture pipeline live end-to-end; polishing before final presentation.
**What is already done:**
- All architecture and scope documentation (`/docs`).
- Frontend App Shell + Dashboard/Knowledge/AI Insights pages, reading live data (no mock data anywhere).
- All six slash commands live in n8n: `/idea` via the Python backend's LangGraph agent (search/compare/save-or-flag-duplicate); `/question`/`/suggestion`/`/decision`/`/action`/`/observation` via n8n-native Gemini extraction + deterministic validation.
- Private DM confirmation (Save/Cancel) before any of the six commands' output reaches permanent storage.
- Insights AI (`POST /api/insights/chat`) — read-only, grounded Q&A over a restricted Supabase view (`ai_knowledge_feed`) via a dedicated least-privilege `ai_readonly` role, verified to have no access to the raw tables.
**What is next (see `PROJECT_STATUS.md` for the current list):**
- Manager authentication/RBAC.
- Moving the six flat PoC tables toward the production `KnowledgeItem` schema.
- A known bug in five of the n8n Insert nodes (malformed expression syntax) needs fixing before Save is trusted for those commands — see `docs/PROJECT_UNDERSTANDING.md` §9.

---

## 3. Technology Stack (Strict)
Do **NOT** use technologies outside of this list without explicit user approval.
- **Frontend:** React, Vite, TypeScript, TailwindCSS (No Next.js, No Vue).
- **Backend:** Python (For custom APIs, if n8n is insufficient).
- **Database/Auth:** Supabase (PostgreSQL).
- **Workflow / Automation:** n8n.
- **AI Models:** Gemini, Claude, or OpenAI (Provider agnostic, accessed via APIs/n8n).

---

## 4. Coding & Design Guidelines

### Frontend & UI/UX
- Read `docs/product/12_UI_UX_SPECIFICATION.md` before touching the UI.
- We use a **Dark-Mode First, Premium Glassmorphism** aesthetic. 
- Never use default HTML styling or generic Tailwind grays. Use the defined CSS variables (`var(--background)`, `var(--card)`).
- We use `Montserrat Alternates` for headings and `Plus Jakarta Sans` for body text.
- Do NOT use placeholder text, gray boxes, or mock/fake data — this was true early on but has since hardened into an actively-enforced project rule: every fake dashboard metric, fake user identity, and fake search result found during later sessions was deliberately removed. Use real data fetched from the backend; for a genuinely unbuilt feature, use an honest "Coming Soon" state (see `ComingSoonPage.tsx`) instead of inventing content. Still use the correct UI gradients (e.g., cyan and blue accents).

### Backend & Database
- Read `docs/engineering/07_DATABASE_SCHEMA.md` before creating tables.
- All backend entities must be decoupled from the communication provider (e.g., users are independent of their Telegram ID).
- Favor modular, readable code. Write tests where applicable.

---

## 5. Helpful References
If you need more detail on a specific area, read these files:
- Scope: `docs/00_MVP_SCOPE.md`
- Architecture: `docs/engineering/04_SYSTEM_ARCHITECTURE.md`
- AI Logic: `docs/engineering/06_AI_PIPELINE.md`
- Status: `PROJECT_STATUS.md` and `CHANGELOG.md`
- **Prior AI agent session history: `docs/ai-agent-code-work/`** — read the latest log in `docs/ai-agent-code-work/claude/` before starting work. It records decisions and reasoning from past sessions (e.g. why non-MVP frontend pages were hidden instead of deleted) that aren't necessarily repeated elsewhere.

---

## 6. Mentorship & Interaction Rules (CRITICAL)
For every major step during development, you MUST follow these interaction rules:
1. **Explain the purpose** before implementation.
2. **Explain why** a specific tool or approach was selected.
3. **Explain common beginner mistakes** to avoid.
4. **Explain how this scales** in the future.
5. **Wait for confirmation** before continuing.
6. **Never implement multiple major systems** in one step.
7. **Always assume the user is learning** the architecture, not just building it.
