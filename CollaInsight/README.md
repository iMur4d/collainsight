# CollaInsight

**CollaInsight** is an AI-powered Knowledge Collaboration Platform designed to solve the problem of knowledge loss in modern communication channels. 

Instead of forcing users to manually document their ideas in wikis or Notion, CollaInsight connects directly to your team's communication streams (like Telegram), captures unstructured conversations, and uses a multi-stage AI pipeline to transform them into a searchable, semantic organizational memory (Knowledge Graph).

## Project Documentation

The entire platform architecture and product vision have been strictly defined. Please refer to the `/docs` directory for the source of truth:

**Product Context:**
- `docs/product/01_PRODUCT_VISION.md`
- `docs/product/02_PROBLEM_STATEMENT.md`
- `docs/product/03_TARGET_USERS.md`
- `docs/product/11_BUSINESS_RULES.md`

**Engineering & Architecture:**
- `docs/engineering/04_SYSTEM_ARCHITECTURE.md`
- `docs/engineering/05_WORKFLOWS.md`
- `docs/engineering/06_AI_PIPELINE.md`
- `docs/engineering/07_DATABASE_SCHEMA.md`
- `docs/engineering/08_BACKEND_SPEC.md`
- `docs/engineering/09_FRONTEND_SPEC.md`
- `docs/engineering/10_API_SPEC.md`

---

## Current Status

Project Phase:
MVP capture pipeline live end-to-end; polishing before final presentation

Current Milestone:
All six knowledge types capturing via Telegram, with private confirmation before storage

Next Milestone:
Manager authentication/RBAC; production `KnowledgeItem` schema

Development Style:
Documentation First
AI Assisted
Modular Architecture

### What Has Been Completed:
1. **Architectural Blueprints:** All core architectural specifications (Frontend, Backend, DB Schema, API Contracts, and Business Rules) drafted and refined. Modular, provider-agnostic, AI-ready by design.
2. **Frontend:** React/Vite app with a Landing Page, App Shell, and live Dashboard/Knowledge/AI Insights pages reading real data from the backend — no mock content.
3. **Telegram capture, all six commands live:** `/idea` via a Python (FastAPI + LangGraph) backend agent that searches, compares, and saves-or-flags-duplicate; `/question`, `/suggestion`, `/decision`, `/action`, `/observation` via n8n-native Gemini extraction with deterministic validation, each with its own type-specific schema.
4. **Private confirmation before storage:** every extraction is held as a temporary pending record and previewed to the submitter via Telegram DM with Save/Cancel, before anything reaches permanent storage — see `docs/engineering/05_WORKFLOWS.md`.
5. **Insights AI:** `POST /api/insights/chat`, read-only grounded Q&A over confirmed knowledge through a restricted, Telegram-metadata-free view and a dedicated least-privilege database role — the access boundary is verified, not assumed. See `docs/engineering/13_SECURITY.md`.

### Next Steps:
- Fix a known bug in five of the n8n Supabase-insert nodes (malformed expression syntax) before trusting Save for those commands.
- Wire the dashboard to read the five new knowledge tables, not just `poc_ideas`.
- Manager authentication/RBAC.
- Move the six flat PoC tables toward the production `KnowledgeItem` schema in `07_DATABASE_SCHEMA.md`.

See `PROJECT_STATUS.md` for the full milestone list and changelog.

---

## 🛠️ Technology Stack

| Component | Technology / Framework |
| :--- | :--- |
| **Frontend** | React • TypeScript • Vite • TailwindCSS |
| **Backend** | Python |
| **Database** | Supabase (PostgreSQL) |
| **Workflow Automation** | n8n |
| **AI Architecture** | Multi-stage LLM Pipeline |
| **Deployment** | Docker |

## Running the Frontend Locally

To start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Running n8n Locally (Phase 1)

Phase 1 validates Telegram -> n8n -> LLM -> Structured JSON. This starts n8n only; Telegram, the LLM provider, and Supabase are configured in later steps, not here.

```bash
cp .env.example .env
# edit .env: set N8N_ENCRYPTION_KEY (openssl rand -hex 32) and GENERIC_TIMEZONE/TZ
docker compose up -d
```

n8n will be available at `http://localhost:5678`. Data (including the encryption key, if you don't set one) persists in the `collainsight_n8n_data` Docker volume across restarts.
