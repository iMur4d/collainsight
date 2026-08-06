"""FastAPI entrypoint for the CollaInsight backend PoC.

Proves the n8n -> backend -> LangGraph -> Supabase -> n8n loop works
end-to-end for the presentation. Only /api/idea is implemented; the other
five agents (question, suggestion, decision, action, observation) stay as
placeholder nodes in the n8n workflow itself, not here - see
automation/workflows/collainsight-mvp-idea-agent.json.
"""
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()  # loads backend/.env before ai.idea_agent / ai.tools read any env vars

from ai.idea_agent import run_idea_agent
from ai.tools import get_supabase

app = FastAPI(title="CollaInsight Backend (PoC)")

# PoC-only: wide open so the local Vite dev server can call this without
# fiddling with origins. No auth exists yet either (see backend/README.md) -
# tighten this alongside adding real auth, not before.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class IdeaRequest(BaseModel):
    telegram_display_name: str = "unknown"
    chat_id: str | int
    chat_title: str | None = None
    message_id: str | int | None = None
    idea_text: str


class IdeaResponse(BaseModel):
    status: str
    title: str
    summary: str
    similar_found: bool


@app.post("/api/idea", response_model=IdeaResponse)
def submit_idea(payload: IdeaRequest) -> IdeaResponse:
    if not payload.idea_text.strip():
        raise HTTPException(status_code=422, detail="idea_text cannot be empty")

    result = run_idea_agent(
        idea_text=payload.idea_text.strip(),
        telegram_display_name=payload.telegram_display_name,
        chat_id=payload.chat_id,
        chat_title=payload.chat_title,
        message_id=payload.message_id,
    )
    return IdeaResponse(**result)


class KnowledgeItem(BaseModel):
    id: int
    idea_text: str
    title: str
    summary: str
    tags: list[str]
    keywords: list[str]
    concepts: list[str]
    assumptions: list[str]
    open_questions: list[str]
    telegram_display_name: str | None = None
    telegram_chat_title: str | None = None
    telegram_chat_id: str | None = None
    telegram_message_id: str | None = None
    created_at: str


@app.get("/api/ideas", response_model=list[KnowledgeItem])
def list_ideas() -> list[dict]:
    """Everything saved by the Idea Agent so far. Powers the dashboard - no
    pagination/caching, this is a PoC reading a small table directly."""
    response = (
        get_supabase()
        .table("poc_ideas")
        .select("*")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    return response.data


@app.get("/health")
def health():
    return {"status": "ok"}
