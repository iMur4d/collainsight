// Talks to the CollaInsight backend PoC only - never to Supabase directly.
// See backend/api/main.py for the actual endpoints this calls.

export interface KnowledgeItem {
  id: number;
  idea_text: string;
  title: string;
  summary: string;
  tags: string[];
  keywords: string[];
  concepts: string[];
  assumptions: string[];
  open_questions: string[];
  telegram_display_name: string | null;
  telegram_chat_title: string | null;
  telegram_chat_id: string | null;
  telegram_message_id: string | null;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchIdeas(): Promise<KnowledgeItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/ideas`);
  if (!res.ok) {
    throw new Error(`Failed to load knowledge items (${res.status})`);
  }
  return res.json();
}

// General read model for all six knowledge types - see backend/api/main.py's
// KNOWLEDGE_TYPE_CONFIG comment for why this is a dedicated endpoint reading
// the raw tables, not the AI-safe ai_knowledge_feed view.
export type KnowledgeCategory = "idea" | "question" | "suggestion" | "decision" | "action" | "observation";

export interface KnowledgeFeedItem {
  knowledge_type: KnowledgeCategory;
  source_id: number;
  title: string;
  summary: string;
  tags: string[];
  keywords: string[];
  attributes: Record<string, unknown>;
  raw_text: string;
  telegram_display_name: string | null;
  telegram_chat_id: string | null;
  telegram_chat_title: string | null;
  telegram_message_id: string | null;
  created_at: string;
}

export async function fetchKnowledge(): Promise<KnowledgeFeedItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/knowledge`);
  if (!res.ok) {
    throw new Error(`Failed to load knowledge items (${res.status})`);
  }
  return res.json();
}

export interface InsightsChatResponse {
  answer: string;
  items_considered: number;
}

/** Read-only Q&A/synthesis over the AI-safe knowledge view - see backend/ai/insights.py. Stateless: each call is independent, no server-side history. */
export async function askInsights(question: string): Promise<InsightsChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/insights/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    throw new Error(`Insights AI request failed (${res.status})`);
  }
  return res.json();
}
