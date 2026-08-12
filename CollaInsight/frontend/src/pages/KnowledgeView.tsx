import React, { useMemo, useState } from "react";
import { Search, Send, MessageSquare, BookOpen, HelpCircle, Filter as FilterIcon } from "lucide-react";

import { Badge, useThemeCtx } from "@/shared";
import { KnowledgeFeedItem, KnowledgeCategory } from "@/lib/api";
import { useKnowledge, relativeTime } from "@/lib/useKnowledge";
import { openQuestionsOf, isWithinLastDays, isSameCalendarDay } from "@/lib/insights";
import { KnowledgeDetailPanel } from "@/components/KnowledgeDetail";

const ALL_TYPES: KnowledgeCategory[] = ["idea", "question", "suggestion", "decision", "action", "observation"];

type DateFilter = "all" | "today" | "7d" | "30d";
const DATE_PRESETS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

function matchesDateFilter(item: KnowledgeFeedItem, filter: DateFilter): boolean {
  if (filter === "all") return true;
  if (filter === "today") return isSameCalendarDay(item.created_at);
  if (filter === "7d") return isWithinLastDays(item.created_at, 7);
  return isWithinLastDays(item.created_at, 30);
}

// Compact filter popover - Knowledge Type / Date / Tags are the only filters
// with real, currently-supported data behind them. No Status filter: the
// current KnowledgeFeedItem shape (and all six PoC tables behind it) has no
// status field at all - that's a documented production-schema concept, not
// something built yet, so it's deliberately not offered here.
function FilterPopover({
  selectedTypes, onToggleType,
  dateFilter, onSetDateFilter,
  availableTags, activeTag, onSetTag,
  onClear,
}: {
  selectedTypes: KnowledgeCategory[];
  onToggleType: (t: KnowledgeCategory) => void;
  dateFilter: DateFilter;
  onSetDateFilter: (f: DateFilter) => void;
  availableTags: string[];
  activeTag: string;
  onSetTag: (t: string) => void;
  onClear: () => void;
}) {
  const { isLight, fg, mutedFg, border, hoverBg, inputBg } = useThemeCtx();
  const [open, setOpen] = useState(false);
  const activeCount = selectedTypes.length + (dateFilter !== "all" ? 1 : 0) + (activeTag !== "All" ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: inputBg,
          border: `1px solid ${activeCount > 0 ? "rgba(37,99,235,0.4)" : border}`,
          color: activeCount > 0 ? "#2563EB" : mutedFg,
        }}
      >
        <FilterIcon className="w-4 h-4" />
        Filter
        {activeCount > 0 && (
          <span className="w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center text-white" style={{ background: "#2563EB" }}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-12 z-50 w-72 rounded-xl border shadow-2xl overflow-hidden"
            style={{ background: isLight ? "#ffffff" : "#0d1018", borderColor: border }}
          >
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: mutedFg }}>Knowledge Type</div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TYPES.map(t => {
                    const active = selectedTypes.includes(t);
                    return (
                      <button key={t} onClick={() => onToggleType(t)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                        style={{
                          background: active ? "rgba(37,99,235,0.12)" : hoverBg,
                          color: active ? "#2563EB" : mutedFg,
                          border: active ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: mutedFg }}>Date</div>
                <div className="flex flex-col gap-0.5">
                  {DATE_PRESETS.map(preset => (
                    <button key={preset.value} onClick={() => onSetDateFilter(preset.value)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-left transition-all"
                      style={{
                        background: dateFilter === preset.value ? "rgba(37,99,235,0.12)" : "transparent",
                        color: dateFilter === preset.value ? "#2563EB" : mutedFg,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: mutedFg }}>Tags / Keywords</div>
                <select
                  value={activeTag}
                  onChange={e => onSetTag(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: hoverBg, color: fg, border: `1px solid ${border}` }}
                >
                  {availableTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {activeCount > 0 && (
                <button onClick={onClear} className="w-full text-xs py-1.5 rounded-lg transition-all" style={{ color: mutedFg, border: `1px solid ${border}` }}>
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function KnowledgeView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, divider, inputBg } = useThemeCtx();
  const { items, loading, error } = useKnowledge();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selectedTypes, setSelectedTypes] = useState<KnowledgeCategory[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selected, setSelected] = useState<KnowledgeFeedItem | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => i.tags.forEach(t => set.add(t)));
    return ["All", ...[...set].sort()];
  }, [items]);

  const toggleType = (t: KnowledgeCategory) =>
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const clearFilters = () => {
    setSelectedTypes([]);
    setDateFilter("all");
    setActiveTag("All");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.knowledge_type);
      const matchesDate = matchesDateFilter(item, dateFilter);
      const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.raw_text.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.keywords.some(k => k.toLowerCase().includes(q));
      return matchesType && matchesDate && matchesTag && matchesQuery;
    });
  }, [items, query, activeTag, selectedTypes, dateFilter]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: fg }}>Knowledge Base</h2>
          <p className="text-sm mt-0.5" style={{ color: mutedFg }}>
            {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"} captured from Telegram`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs" style={{ background: inputBg, border: `1px solid ${border}`, color: mutedFg }}>
          <Send className="w-3.5 h-3.5" />
          Captured via Telegram commands — not from this dashboard
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
        <FilterPopover
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          dateFilter={dateFilter}
          onSetDateFilter={setDateFilter}
          availableTags={tags}
          activeTag={activeTag}
          onSetTag={setActiveTag}
          onClear={clearFilters}
        />
      </div>

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
            {items.length === 0
              ? <>No knowledge captured yet. Send <code className="px-1 rounded" style={{ background: inputBg }}>/idea</code>, <code className="px-1 rounded" style={{ background: inputBg }}>/question</code>, <code className="px-1 rounded" style={{ background: inputBg }}>/suggestion</code>, <code className="px-1 rounded" style={{ background: inputBg }}>/decision</code>, <code className="px-1 rounded" style={{ background: inputBg }}>/action</code>, or <code className="px-1 rounded" style={{ background: inputBg }}>/observation</code> to the Telegram bot to get started.</>
              : "No items match your filters."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => {
            const openQuestions = openQuestionsOf(item);
            return (
              <div key={`${item.knowledge_type}-${item.source_id}`} onClick={() => setSelected(item)}
                className="group p-5 rounded-2xl transition-all cursor-pointer flex flex-col gap-3 hover:-translate-y-0.5"
                style={{ background: cardBg, border: `1px solid ${border}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = border}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Badge color="blue">{item.knowledge_type}</Badge>
                    <h3 className="text-sm font-semibold leading-snug mt-1.5" style={{ color: fg }}>{item.title}</h3>
                  </div>
                  {openQuestions.length > 0 && (
                    <span title={`${openQuestions.length} open question(s)`} className="flex-shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                      <HelpCircle className="w-2.5 h-2.5" />{openQuestions.length}
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
            );
          })}
        </div>
      )}

      <KnowledgeDetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
