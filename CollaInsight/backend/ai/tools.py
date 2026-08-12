"""Tools for the Idea Agent PoC.

Backed by a single minimal Supabase table (`poc_ideas`) - intentionally NOT
the full production KnowledgeItem schema from docs/engineering/07_DATABASE_SCHEMA.md.
This is the smallest persistence layer that can prove the agent architecture
end-to-end for the presentation; see backend/README.md for the table DDL and
how this evolves into the real schema after the PoC.

search_similar_ideas is the one tool whose results are handed back to the
LLM (and can resurface, paraphrased, in what it writes to
flag_as_duplicate's explanation) - so unlike save_knowledge below, it
deliberately does NOT read poc_ideas through the service-role client.
It reads ai_knowledge_feed instead, over the ai_readonly role's own
connection (INSIGHTS_DB_URL - the same one ai/insights.py uses), which has
no grant on poc_ideas or any other raw table. That makes it structurally
incapable of ever handing the model Telegram metadata or raw message text,
not just coincidentally not-selecting it today.
"""
import os
import re

import httpx
import psycopg2
from langchain_core.tools import tool
from supabase import Client, ClientOptions, create_client

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        # ClientOptions has no `verify` kwarg in this supabase-py version -
        # SSL verification is controlled by handing it a pre-built httpx
        # client instead. verify=False works around SSL interception on
        # networks like KAU's campus proxy (self-signed root, untrusted by
        # curl/Windows too - confirmed not a Python-only issue) for local
        # demo/dev. Never do this against an untrusted network in production.
        _supabase = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_KEY"],
            options=ClientOptions(httpx_client=httpx.Client(verify=False)),
        )
    return _supabase


@tool
def search_similar_ideas(query: str) -> str:
    """Search previously saved ideas for ones similar to the given query.
    Call this before deciding whether an idea is new - never skip it.
    Pass a short query (1-3 core keywords, e.g. "peer mentorship") rather
    than a full sentence - this is a keyword search, not a semantic one, so
    an overly long or specific query can fail to match ideas that are
    actually similar."""
    # Matches on ANY of the query's words rather than the query as one
    # literal substring - a plain ILIKE on the whole phrase almost never
    # matches reworded duplicates even when the model is given a short
    # query, since it still rarely matches a stored idea verbatim.

    # Support both Arabic and English keywords.
    # The previous regex matched only Latin characters, causing Arabic ideas
    # to bypass keyword extraction and similarity search.
    words = [w for w in re.findall(r"[\u0600-\u06FFA-Za-z0-9]+", query) if len(w) > 2][:6]
    if not words:
        return f"No similar ideas found for '{query}'."

    # ai_knowledge_feed has no idea_text column (raw message text is
    # excluded from the view by design) - title/summary are the model's own
    # prior extractions, which is what duplicate-detection should be
    # matching against anyway, not the submitter's raw wording.
    or_clauses = " or ".join(["title ilike %s or summary ilike %s"] * len(words))
    params = [p for w in words for p in (f"%{w}%", f"%{w}%")]

    conn = psycopg2.connect(os.environ["INSIGHTS_DB_URL"])
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                select title, summary
                from ai_knowledge_feed
                where knowledge_type = 'idea' and ({or_clauses})
                """,
                params,
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        return f"No similar ideas found for '{query}'."
    lines = [f"- {title}: {summary}" for title, summary in rows]
    return f"Found {len(rows)} similar idea(s):\n" + "\n".join(lines)


def build_terminal_tools(idea_text: str, telegram_display_name, chat_id, chat_title, message_id):
    """Builds the two request-scoped tools that end the agent's turn.

    idea_text/telegram_display_name/chat_id/message_id are closed over here
    rather than taken as model-supplied arguments, so the original Telegram
    message is always stored verbatim - the model can interpret it, but it
    never gets to rewrite the source of truth.

    telegram_display_name (username or first_name) is display-only
    attribution, not a persistent Telegram user ID - matches
    07_DATABASE_SCHEMA.md's MVP scope note that participants aren't linked
    to an account. Don't reintroduce the numeric from.id here.

    Returns (tools, outcome) where `outcome` is a dict the caller can inspect
    after the graph finishes - whichever terminal tool ran fills it in,
    avoiding having to parse the model's final free-text message.
    """
    outcome: dict = {}

    @tool
    def save_knowledge(
        title: str,
        summary: str,
        tags: list[str],
        keywords: list[str],
        concepts: list[str],
        assumptions: list[str],
        open_questions: list[str],
    ) -> str:
        """Persist a genuinely new idea as structured knowledge. Call this
        only AFTER search_similar_ideas confirms nothing similar already
        exists."""
        row = {
            "idea_text": idea_text,
            "title": title,
            "summary": summary,
            "tags": tags,
            "keywords": keywords,
            "concepts": concepts,
            "assumptions": assumptions,
            "open_questions": open_questions,
            "telegram_display_name": telegram_display_name,
            "telegram_chat_id": str(chat_id),
            "telegram_chat_title": chat_title,
            "telegram_message_id": str(message_id) if message_id is not None else None,
        }
        get_supabase().table("poc_ideas").insert(row).execute()
        outcome.update(status="saved", title=title, summary=summary, similar_found=False)
        return f"Saved: {title}"

    @tool
    def flag_as_duplicate(similar_title: str, explanation: str) -> str:
        """Call this INSTEAD of save_knowledge when search_similar_ideas
        already found an existing idea covering the same concept. Do not
        save - explain why, referencing the similar idea's title."""
        outcome.update(status="duplicate", title=similar_title, summary=explanation, similar_found=True)
        return f"Not saved - too similar to existing idea: {similar_title}"

    return [save_knowledge, flag_as_duplicate], outcome
