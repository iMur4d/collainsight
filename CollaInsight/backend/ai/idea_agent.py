"""Idea Agent - LangGraph agent invoked by POST /api/idea.

Proof-of-concept: proves the Telegram -> n8n -> backend -> LangGraph ->
Supabase -> n8n -> Telegram loop works end-to-end for the presentation.

Evolves the Week 5 Day 3 training pattern (StateGraph + MessagesState +
ToolNode + tools_condition) but rebuilt around the real domain:
  - Structured knowledge comes out through tool-call arguments
    (save_knowledge's parameters), not by parsing the model's final
    free-text message as JSON - the tool schema forces the shape.
  - Two terminal tools (save_knowledge / flag_as_duplicate) represent the
    two possible outcomes, so the graph can stop the moment one of them
    runs instead of spending an extra LLM call on a wrap-up message the
    caller doesn't need.
  - No checkpointer: each /idea submission is a one-shot request, not a
    multi-turn conversation (see mvp_slash_command_architecture - the bot is
    event-driven, not conversational).
"""
import os
import re
from pathlib import Path
from typing import TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from .tools import build_terminal_tools, search_similar_ideas

_PROMPT_PATH = Path(__file__).parent / "idea_agent_prompt.md"


def _load_system_message() -> str:
    match = re.search(r"```\n(.*?)\n```", _PROMPT_PATH.read_text(encoding="utf-8"), re.DOTALL)
    if not match:
        raise RuntimeError(f"Could not find the fenced system prompt block in {_PROMPT_PATH}")
    return match.group(1)


SYSTEM_MESSAGE = _load_system_message()


class IdeaAgentResult(TypedDict):
    status: str  # "saved" | "duplicate"
    title: str
    summary: str
    similar_found: bool


def run_idea_agent(idea_text: str, telegram_display_name, chat_id, chat_title, message_id) -> IdeaAgentResult:
    terminal_tools, outcome = build_terminal_tools(idea_text, telegram_display_name, chat_id, chat_title, message_id)
    tools = [search_similar_ideas, *terminal_tools]

    llm = ChatGoogleGenerativeAI(
        model=os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview"),
        api_key=os.environ["GEMINI_API_KEY"],
    ).bind_tools(tools)

    def call_model(state: MessagesState):
        messages = state["messages"]
        if not any(isinstance(m, SystemMessage) for m in messages):
            messages = [SystemMessage(content=SYSTEM_MESSAGE)] + messages
        return {"messages": [llm.invoke(messages)]}

    def route_after_agent(state: MessagesState):
        last = state["messages"][-1]
        return "tools" if getattr(last, "tool_calls", None) else END

    def route_after_tools(state: MessagesState):
        # Stop as soon as a terminal tool has run; loop back to the agent
        # otherwise (e.g. after search_similar_ideas, which isn't terminal).
        return END if outcome else "agent"

    builder = StateGraph(MessagesState)
    builder.add_node("agent", call_model)
    builder.add_node("tools", ToolNode(tools))
    builder.add_edge(START, "agent")
    builder.add_conditional_edges("agent", route_after_agent)
    builder.add_conditional_edges("tools", route_after_tools)
    graph = builder.compile()

    graph.invoke(
        {"messages": [HumanMessage(content=idea_text)]},
        config={"recursion_limit": 12},
    )

    if not outcome:
        # Model never called a terminal tool (e.g. hit the recursion limit) -
        # fail loudly rather than silently reporting success to Telegram.
        raise RuntimeError("Idea Agent finished without calling save_knowledge or flag_as_duplicate.")

    return outcome  # type: ignore[return-value]
