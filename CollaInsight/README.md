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
Architecture Complete

Current Milestone:
Backend Foundation

Next Milestone:
Workflow Integration (n8n)

Development Style:
Documentation First
AI Assisted
Modular Architecture

### What Has Been Completed:
1. **Architectural Blueprints:** All core architectural specifications (Frontend, Backend, DB Schema, API Contracts, and Business Rules) have been drafted and refined. The system is intentionally designed to be modular, provider-agnostic, and AI-ready.
2. **Frontend UI Shell:** Built a highly responsive React/Vite frontend featuring:
   - A beautiful, premium **Landing Page** with custom human-like typing animations and accurate product marketing copy.
   - An **App Shell (Dashboard, Graph View, Knowledge Hub)** that flawlessly adapts to mobile devices via an overlay drawer system.
   - A custom **Favicon** integration reflecting the official brand.
3. **Development Environment:** Fixed and configured the local TypeScript environment by adding `tsconfig.json` and `vite-env.d.ts`, completely eliminating IDE parsing errors and resolving strict type imports.

### Next Steps (Ready to be built):
- **Backend & Database Initialization:** Setting up the actual database (e.g., Supabase/PostgreSQL) based on `07_DATABASE_SCHEMA.md`.
- **Workflow Automation Integration:** Connecting the frontend/backend to the orchestration layer (e.g., n8n) to handle the event-driven architecture.
- **Telegram Bot Webhook:** Building the entry point for capturing raw messages from Telegram.
- **AI Pipeline Implementation:** Writing the actual LLM prompts and routing logic as defined in `06_AI_PIPELINE.md`. For the MVP this means slash-command-triggered extraction and structuring within the category the command already specifies (see `docs/00_MVP_SCOPE.md`'s `<capture_principle>`) — not AI-driven Intent Classification, which is post-MVP (`06_AI_PIPELINE.md` Stage 3).

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
