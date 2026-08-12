"""FastAPI entrypoint for the CollaInsight backend PoC.

Only /api/idea's AI logic (LangGraph agent) lives here - the other five
knowledge types (question, suggestion, decision, action, observation) are
extracted and validated entirely in n8n, not here. This module still serves
as the single read model for all six types (GET /api/knowledge) and the
read-only Insights AI (POST /api/insights/chat) - see automation/workflows/
for the current n8n build.
"""
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()  # loads backend/.env before ai.idea_agent / ai.tools read any env vars

from ai.idea_agent import run_idea_agent
from ai.insights import answer_insights_question
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
    """Everything saved by the Idea Agent so far. Kept for backward
    compatibility - GET /api/knowledge below is the general, all-six-types
    read model the frontend now uses. No pagination/caching, PoC reading a
    small table directly."""
    response = (
        get_supabase()
        .table("poc_ideas")
        .select("*")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    return response.data


# knowledge_type -> (table, raw-text column, type-specific attribute columns).
# Deliberately mirrors ai_knowledge_feed's {knowledge_type, source_id, title,
# summary, tags, keywords, attributes, created_at} shape (see
# docs/engineering/07_DATABASE_SCHEMA.md) - but this endpoint is NOT that
# view. It reads the six raw tables directly via the backend's own Supabase
# credential (the same access /api/idea and /api/ideas already have - not a
# new or weaker boundary) because the frontend genuinely needs Telegram
# attribution and raw text that the AI-safe view intentionally excludes.
# ai/insights.py's ai_readonly-backed path is untouched by this endpoint.
KNOWLEDGE_TYPE_CONFIG: dict[str, tuple[str, str, list[str]]] = {
    "idea": ("poc_ideas", "idea_text", ["concepts", "assumptions", "open_questions"]),
    "question": ("poc_questions", "question_text", ["is_blocking", "addressed_to"]),
    "suggestion": ("poc_suggestions", "suggestion_text", ["target"]),
    "decision": ("poc_decisions", "decision_text", ["rationale"]),
    "action": ("poc_actions", "action_text", ["owner", "due"]),
    "observation": ("poc_observations", "observation_text", []),
}


class KnowledgeFeedItem(BaseModel):
    knowledge_type: str
    source_id: int
    title: str
    summary: str
    tags: list[str]
    keywords: list[str]
    attributes: dict
    raw_text: str
    telegram_display_name: str | None = None
    telegram_chat_id: str | None = None
    telegram_chat_title: str | None = None
    telegram_message_id: str | None = None
    created_at: str


def _fetch_knowledge_type(knowledge_type: str, table: str, text_field: str, attribute_fields: list[str]) -> list[dict]:
    response = (
        get_supabase()
        .table(table)
        .select("*")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    return [
        {
            "knowledge_type": knowledge_type,
            "source_id": row["id"],
            "title": row["title"],
            "summary": row["summary"],
            "tags": row.get("tags") or [],
            "keywords": row.get("keywords") or [],
            "attributes": {field: row.get(field) for field in attribute_fields},
            "raw_text": row.get(text_field, ""),
            "telegram_display_name": row.get("telegram_display_name"),
            "telegram_chat_id": row.get("telegram_chat_id"),
            "telegram_chat_title": row.get("telegram_chat_title"),
            "telegram_message_id": row.get("telegram_message_id"),
            "created_at": row["created_at"],
        }
        for row in response.data
    ]


@app.get("/api/knowledge", response_model=list[KnowledgeFeedItem])
def list_knowledge() -> list[dict]:
    """All six knowledge types, normalized to one shape - the general read
    model for Dashboard/Knowledge/AI Insights. See KNOWLEDGE_TYPE_CONFIG's
    comment for why this reads the raw tables rather than ai_knowledge_feed."""
    items: list[dict] = []
    for knowledge_type, (table, text_field, attribute_fields) in KNOWLEDGE_TYPE_CONFIG.items():
        items.extend(_fetch_knowledge_type(knowledge_type, table, text_field, attribute_fields))
    items.sort(key=lambda item: item["created_at"], reverse=True)
    return items


class InsightsChatRequest(BaseModel):
    question: str


class InsightsChatResponse(BaseModel):
    answer: str
    items_considered: int


@app.post("/api/insights/chat", response_model=InsightsChatResponse)
def insights_chat(payload: InsightsChatRequest) -> InsightsChatResponse:
    """Read-only Q&A/synthesis over ai_knowledge_feed - see ai/insights.py.
    Never touches the six raw poc_* tables or the Supabase service-role key."""
    if not payload.question.strip():
        raise HTTPException(status_code=422, detail="question cannot be empty")

    result = answer_insights_question(payload.question.strip())
    return InsightsChatResponse(**result)


@app.get("/health")
def health():
    return {"status": "ok"}
