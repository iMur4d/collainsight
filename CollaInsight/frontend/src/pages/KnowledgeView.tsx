import React, { useMemo, useState } from "react";
import { Search, Send, MessageSquare, BookOpen, HelpCircle } from "lucide-react";

import { Badge, useThemeCtx } from "@/shared";
import { KnowledgeItem } from "@/lib/api";
import { useIdeas, relativeTime } from "@/lib/useIdeas";
import { KnowledgeDetailPanel } from "@/components/KnowledgeDetail";

export function KnowledgeView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, divider, inputBg } = useThemeCtx();
  const { ideas, loading, error } = useIdeas();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach(i => i.tags.forEach(t => set.add(t)));
    return ["All", ...[...set].sort()];
  }, [ideas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ideas.filter(item => {
      const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.idea_text.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.keywords.some(k => k.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  }, [ideas, query, activeTag]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: fg }}>Knowledge Base</h2>
          <p className="text-sm mt-0.5" style={{ color: mutedFg }}>
            {loading ? "Loading…" : `${ideas.length} idea${ideas.length === 1 ? "" : "s"} captured from Telegram`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs" style={{ background: inputBg, border: `1px solid ${border}`, color: mutedFg }}>
          <Send className="w-3.5 h-3.5" />
          Captured via Telegram <code className="px-1 rounded" style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)" }}>/idea</code> — not from this dashboard
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: mutedFg }} />
          <input
            placeholder="Search title, summary, tags, keywords…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: fg }}
          />
        </div>
      </div>

      {tags.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map(t => (
            <button key={t} onClick={() => setActiveTag(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTag === t ? "rgba(37,99,235,0.12)" : (isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"),
                color: activeTag === t ? "#2563EB" : mutedFg,
                border: activeTag === t ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent",
              }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: cardBg, border: `1px solid ${border}` }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-5 rounded-2xl text-sm" style={{ background: cardBg, border: `1px solid ${border}`, color: mutedFg }}>
          Couldn't reach the backend ({error}). Make sure it's running at the configured API URL.
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="p-10 rounded-2xl flex flex-col items-center text-center gap-2" style={{ background: cardBg, border: `1px solid ${border}`, color: mutedFg }}>
          <BookOpen className="w-6 h-6 opacity-40" />
          <p className="text-sm">
            {ideas.length === 0
              ? <>No ideas captured yet. Send <code className="px-1 rounded" style={{ background: inputBg }}>/idea &lt;your idea&gt;</code> to the Telegram bot to get started.</>
              : "No ideas match your search."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} onClick={() => setSelected(item)}
              className="group p-5 rounded-2xl transition-all cursor-pointer flex flex-col gap-3 hover:-translate-y-0.5"
              style={{ background: cardBg, border: `1px solid ${border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = border}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug" style={{ color: fg }}>{item.title}</h3>
                {item.open_questions.length > 0 && (
                  <span title={`${item.open_questions.length} open question(s)`} className="flex-shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                    <HelpCircle className="w-2.5 h-2.5" />{item.open_questions.length}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: mutedFg }}>{item.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 3).map(t => <Badge key={t} color="cyan">{t}</Badge>)}
                {item.tags.length > 3 && <span className="text-xs" style={{ color: subFg }}>+{item.tags.length - 3}</span>}
              </div>
              <div className="flex items-center justify-between pt-2 text-xs" style={{ borderTop: `1px solid ${divider}`, color: mutedFg }}>
                <span className="flex items-center gap-1.5 min-w-0 truncate">
                  {item.telegram_chat_title && <MessageSquare className="w-3 h-3 flex-shrink-0" />}
                  <span className="truncate">{item.telegram_chat_title || item.telegram_display_name || "Telegram"}</span>
                </span>
                <span className="flex-shrink-0">{relativeTime(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <KnowledgeDetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
