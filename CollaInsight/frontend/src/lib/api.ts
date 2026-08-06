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
