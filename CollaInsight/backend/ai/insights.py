"""Insights AI - read-only Q&A/synthesis over the AI-safe knowledge view.

Strictly separate from the deterministic KPIs/charts the frontend computes
itself from GET /api/ideas - this module never computes a statistic, it only
explains/summarizes/compares/identifies patterns in what's already stored,
grounded in a knowledge feed that has already had Telegram metadata and raw
message text stripped out (see docs/engineering/13_SECURITY.md's "AI Input
Filtering" / "AI Safety Boundaries").

Connects to Postgres directly with the ai_readonly role's own credentials -
deliberately NOT ai/tools.py's get_supabase() (SUPABASE_KEY is the
service-role key: bypasses RLS, full write access - the wrong credential for
an AI-facing read path). ai_readonly has SELECT granted on ai_knowledge_feed
only, nothing on the six raw poc_* tables, so this module is structurally
incapable of reading Telegram metadata or raw message text even if it tried.
"""
import os
from typing import TypedDict

import psycopg2
import psycopg2.extras
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Bounded recent-window retrieval, not semantic search: fine at current PoC
# data volume, and Insights questions tend to be pattern/theme questions
# across the dataset rather than single-item lookups, which a keyword search
# (like ai/tools.py's search_similar_ideas) would serve worse. Revisit once
# volume grows enough that "most recent N" stops being representative.
CONTEXT_LIMIT = 200

SYSTEM_PROMPT = """You are the Insights Assistant for CollaInsight, a training program's manager dashboard. You help a manager understand organizational knowledge captured from Telegram - ideas, suggestions, decisions, action items, questions, and observations.

You will be given a bounded set of knowledge items (title, summary, tags, keywords, type-specific attributes, and when each was captured) and a manager's question. Your job is to explain, summarize, compare, and identify patterns using ONLY the knowledge items provided.

Hard rules:
- Never invent a fact, number, name, or detail that is not in the provided items. Do not estimate counts or trends beyond what is directly observable in what you were given.
- If the provided knowledge does not contain enough information to answer the question, say so plainly instead of guessing.
- You are explaining and synthesizing existing knowledge, not making a business decision or recommendation on the manager's behalf.
- Reference specific items by title when relevant, so the manager can look them up.
- Be concise and write for a manager scanning quickly - no filler, no restating the question."""


class InsightsAnswer(TypedDict):
    answer: str
    items_considered: int


def _row_to_context_line(row: dict) -> str:
    attrs = row.get("attributes") or {}
    attr_str = ", ".join(f"{k}={v}" for k, v in attrs.items() if v not in (None, [], ""))
    parts = [f"[{row['knowledge_type']}] {row['title']}", row["summary"]]
    if row.get("tags"):
        parts.append(f"tags: {', '.join(row['tags'])}")
    if attr_str:
        parts.append(attr_str)
    parts.append(f"captured: {row['created_at']}")
    return " | ".join(parts)


def fetch_knowledge_context(limit: int = CONTEXT_LIMIT) -> list[dict]:
    """Bounded, deterministic retrieval: the most recent `limit` items from
    the AI-safe view, regardless of the question - see CONTEXT_LIMIT note."""
    conn = psycopg2.connect(os.environ["INSIGHTS_DB_URL"])
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                select knowledge_type, source_id, title, summary, tags, keywords, attributes, created_at
                from ai_knowledge_feed
                order by created_at desc
                limit %s
                """,
                (limit,),
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def answer_insights_question(question: str) -> InsightsAnswer:
    rows = fetch_knowledge_context()

    if not rows:
        return {
            "answer": "There's no knowledge captured yet, so I don't have anything to base an answer on.",
            "items_considered": 0,
        }

    context_block = "\n".join(_row_to_context_line(r) for r in rows)

    llm = ChatGoogleGenerativeAI(
        model=os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview"),
        api_key=os.environ["GEMINI_API_KEY"],
    )
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=f"Knowledge items ({len(rows)} most recent):\n{context_block}\n\nQuestion: {question}"
        ),
    ]
    response = llm.invoke(messages)
    answer = _extract_text(response.content)
    return {"answer": answer, "items_considered": len(rows)}


def _extract_text(content) -> str:
    """response.content isn't always a plain string - some Gemini responses
    come back as a list of content blocks (e.g. [{"type": "text", "text":
    "...", ...}, ...], possibly alongside non-text blocks like thought
    signatures). Pull out just the text, in order, rather than stringifying
    the raw structure."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and isinstance(block.get("text"), str):
                parts.append(block["text"])
        if parts:
            return "".join(parts)
    return str(content)
