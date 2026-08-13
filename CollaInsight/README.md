# CollaInsight

**CollaInsight** is an AI-powered Knowledge Collaboration Platform designed to solve the problem of knowledge loss in modern communication channels. 

Instead of forcing users to manually document their ideas in wikis or Notion, CollaInsight connects directly to your team's communication streams (like Telegram), captures explicitly-submitted conversations, and uses an AI pipeline to transform them into structured, reviewable knowledge — ideas, suggestions, decisions, action items, questions, and observations — on a manager-facing dashboard. (A searchable knowledge graph is on the roadmap, not part of the current MVP — see `docs/00_MVP_SCOPE.md`.)

## Project Documentation

The entire platform architecture and product vision have been strictly defined.

**Start here:**
- `docs/00_MVP_SCOPE.md` — the authoritative definition of what's actually in the MVP (and what isn't).
- `docs/PROJECT_UNDERSTANDING.md` — a single onboarding doc tying architecture, data flow, and current implementation status together.

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
- `docs/engineering/13_SECURITY.md`

---

## Current Status

Project Phase:
MVP implemented and validated end-to-end; final documentation and repository polish in progress

Current Milestone:
All six knowledge types capturing via Telegram — five via private Telegram DM confirmation (Save/Cancel), `/idea` saved or flagged-as-duplicate directly by the backend agent

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
4. **Private confirmation before storage (five commands):** `/question`, `/suggestion`, `/decision`, `/action`, and `/observation` extractions are each held as a temporary pending record and previewed to the submitter via Telegram DM with Save/Cancel, before anything reaches permanent storage — see `docs/engineering/05_WORKFLOWS.md`. `/idea` is not part of this flow — it's saved or flagged-as-duplicate directly by the backend agent (see #3 above).
5. **Insights AI:** `POST /api/insights/chat`, read-only grounded Q&A over confirmed knowledge through a restricted, Telegram-metadata-free view and a dedicated least-privilege database role — the access boundary is verified, not assumed. See `docs/engineering/13_SECURITY.md`.

### Next Steps:
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
| **Deployment** | n8n Cloud (workflow) + locally-run backend, tunneled via ngrok for live demos; Docker Compose available for running n8n locally instead |

## Running the Frontend Locally

To start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Running the Backend Locally

The backend (FastAPI + LangGraph Idea Agent, `POST /api/idea`, `GET /api/knowledge`, `POST /api/insights/chat`) runs on your machine, not in a container. See `backend/README.md` for full setup (Python deps, the PoC Supabase table, environment variables, and the `ai_readonly` role Insights AI needs). Quick version:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY, INSIGHTS_DB_URL
uvicorn api.main:app --reload --port 8000
```

## Running the Full Live Demo (Telegram → n8n Cloud → Backend → Supabase)

The current workflow runs on **n8n Cloud**, not locally — the backend runs on your machine and is reached via an ngrok tunnel, since n8n Cloud can't call `localhost`. The current, sanitized workflow export is `automation/workflows/collainsight-mvp-discussion-extraction.json`. Full step-by-step runbook, including one-time ngrok setup and troubleshooting: see **`RUNNING_NGROK_AND_N8N.md`**.

### Optional: running n8n locally instead of n8n Cloud

If you want to run n8n itself locally (e.g. to experiment without touching the live Cloud workflow) rather than follow the Cloud-based runbook above, `docker-compose.yml` starts a local n8n instance:

```bash
cp .env.example .env
# edit .env: set N8N_ENCRYPTION_KEY (openssl rand -hex 32) and GENERIC_TIMEZONE/TZ
docker compose up -d
```

n8n will be available at `http://localhost:5678`. Data persists in the `collainsight_n8n_data` Docker volume across restarts. Note that with local n8n, `localhost` inside the n8n container refers to the container itself, not your machine — use `http://host.docker.internal:8000` to reach the locally-running backend, or a tunnel as described above.
