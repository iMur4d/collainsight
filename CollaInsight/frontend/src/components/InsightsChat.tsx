import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";

import { useThemeCtx } from "@/shared";
import { askInsights } from "@/lib/api";
import { MarkdownBody } from "@/components/KnowledgeDetail";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// Additive to the Insights page, not a replacement for its deterministic
// KPIs/charts - this panel only ever answers via backend/ai/insights.py's
// read-only Q&A over ai_knowledge_feed. It never computes a statistic
// itself and never touches raw Telegram metadata.
export function InsightsChat() {
  const { fg, mutedFg, cardBg, border, divider, inputBg, hoverBg } = useThemeCtx();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view instead of leaving the scroll position
  // wherever it was while the box's height/scrollbar changes underneath it -
  // that mismatch is what reads as "laggy" when a long answer lands.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, asking]);

  async function handleAsk() {
    const q = question.trim();
    if (!q || asking) return;
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);
    setError(null);
    try {
      const res = await askInsights(q);
      setMessages(prev => [...prev, { role: "assistant", text: res.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
      <div className="px-5 py-4 flex items-center gap-2 flex-wrap" style={{ borderBottom: `1px solid ${divider}` }}>
        <Sparkles className="w-4 h-4 text-cyan-500" />
        <h3 className="text-sm font-semibold" style={{ color: fg }}>Ask Insights AI</h3>
        <span className="text-xs" style={{ color: mutedFg }}>Grounded in captured knowledge only — never invents figures</span>
      </div>

      <div className="p-5 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs" style={{ color: mutedFg }}>
            Ask about patterns, themes, or comparisons across captured knowledge — e.g. "What are the recurring themes this week?" or "Summarize the open questions."
          </p>
        )}

        {messages.length > 0 && (
          <div ref={scrollRef} className="space-y-3 max-h-80 overflow-y-auto pr-1 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className="flex" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: m.role === "user" ? "rgba(37,99,235,0.12)" : hoverBg,
                    color: fg,
                    border: m.role === "user" ? "1px solid rgba(37,99,235,0.3)" : `1px solid ${border}`,
                  }}
                >
                  {m.role === "assistant" ? <MarkdownBody markdown={m.text} /> : <span className="whitespace-pre-wrap">{m.text}</span>}
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex items-center gap-2 text-xs" style={{ color: mutedFg }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-xs" style={{ color: "#F59E0B" }}>Couldn't reach Insights AI ({error}).</div>
        )}

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
          <input
            placeholder="Ask a question about captured knowledge…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAsk(); }}
            disabled={asking}
            className="flex-1 bg-transparent text-sm outline-none disabled:opacity-60"
            style={{ color: fg }}
          />
          <button
            onClick={handleAsk}
            disabled={asking || !question.trim()}
            className="flex-shrink-0 disabled:opacity-40"
            style={{ color: "#2563EB" }}
            aria-label="Ask"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
