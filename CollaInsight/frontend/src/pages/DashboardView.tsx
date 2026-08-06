import React, { useMemo, useState } from "react";
import { BookOpen, Users, MessageSquare, Clock3, CalendarDays, HelpCircle, Hash } from "lucide-react";

import { Badge, useThemeCtx } from "@/shared";
import { KnowledgeItem } from "@/lib/api";
import { useIdeas, relativeTime, topTags } from "@/lib/useIdeas";
import { isSameCalendarDay, weeklyGrowth, needsFollowUp } from "@/lib/insights";
import { KnowledgeDetailPanel } from "@/components/KnowledgeDetail";
import { GrowthChip } from "@/components/GrowthChip";

export function DashboardView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, hoverBg, divider } = useThemeCtx();
  const { ideas, loading, error } = useIdeas();
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);

  const stats = useMemo(() => {
    const contributors = new Set(ideas.map(i => i.telegram_display_name).filter(Boolean));
    const groups = new Set(ideas.map(i => i.telegram_chat_title).filter(Boolean));
    const capturedToday = ideas.filter(i => isSameCalendarDay(i.created_at)).length;
    const growth = weeklyGrowth(ideas);
    const followUp = needsFollowUp(ideas);
    return {
      total: ideas.length,
      capturedToday,
      contributors: contributors.size,
      groups: groups.size,
      growth,
      followUpCount: followUp.length,
    };
  }, [ideas]);

  const recent = ideas.slice(0, 6);
  const tags = useMemo(() => topTags(ideas, 8), [ideas]);
  const followUpPreview = useMemo(() => needsFollowUp(ideas).slice(0, 3), [ideas]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
      {/* Overview strip - computed live from what's actually stored, not an AI-generated narrative */}
      <div className="rounded-2xl p-px overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(6,182,212,0.2), transparent)" }}>
        <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden" style={{ background: isLight ? "#eef4ff" : "#0a0f1e" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(37,99,235,0.08) 0%, transparent 60%)" }} />
          <div className="flex items-start gap-3 sm:gap-4 relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(6,182,212,0.15))" }}>
              <BookOpen className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: fg }}>Knowledge Base Overview</span>
                <Badge color="cyan">Live from Supabase</Badge>
              </div>
              {loading ? (
                <p className="text-sm" style={{ color: mutedFg }}>Loading…</p>
              ) : ideas.length === 0 ? (
                <p className="text-sm leading-relaxed" style={{ color: mutedFg }}>
                  No ideas captured yet. Send <strong style={{ color: fg }}>/idea &lt;your idea&gt;</strong> to the Telegram bot to see it appear here.
                </p>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: mutedFg }}>
                  <strong style={{ color: fg }}>{stats.total} idea{stats.total === 1 ? "" : "s"}</strong> captured
                  {stats.contributors > 0 && <> from <strong style={{ color: fg }}>{stats.contributors} contributor{stats.contributors === 1 ? "" : "s"}</strong></>}
                  {stats.groups > 0 && <> across <strong style={{ color: fg }}>{stats.groups} Telegram group{stats.groups === 1 ? "" : "s"}</strong></>}.
                  {" "}Most recent: <strong style={{ color: fg }}>{recent[0]?.title}</strong> ({relativeTime(recent[0]?.created_at)}).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid - every value here is a real count/derivation over fetched data, no invented metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Total items", value: stats.total, icon: BookOpen, color: "blue" as const },
          { label: "This week", value: stats.growth.thisWeek, icon: CalendarDays, color: "cyan" as const, extra: <GrowthChip deltaPct={stats.growth.deltaPct} /> },
          { label: "Today", value: stats.capturedToday, icon: Clock3, color: "blue" as const },
          { label: "Contributors", value: stats.contributors, icon: Users, color: "purple" as const },
          { label: "Telegram groups", value: stats.groups, icon: MessageSquare, color: "green" as const },
          { label: "Need follow-up", value: stats.followUpCount, icon: HelpCircle, color: "amber" as const },
        ].map(stat => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            blue: "text-blue-500 bg-blue-500/10",
            cyan: "text-cyan-500 bg-cyan-500/10",
            purple: "text-violet-500 bg-violet-500/10",
            green: "text-emerald-500 bg-emerald-500/10",
            amber: "text-amber-500 bg-amber-500/10",
          };
          return (
            <div key={stat.label} className="p-3.5 sm:p-4 rounded-2xl transition-all hover:-translate-y-0.5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {stat.extra}
              </div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: fg }}>{loading ? "—" : stat.value}</div>
              <div className="text-xs" style={{ color: mutedFg }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Knowledge Items */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${divider}` }}>
            <h2 className="text-sm font-semibold" style={{ color: fg }}>Recent Knowledge Items</h2>
          </div>
          {loading && (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: hoverBg }} />)}
            </div>
          )}
          {!loading && recent.length === 0 && (
            <div className="px-5 py-10 flex flex-col items-center text-center gap-2" style={{ color: mutedFg }}>
              <BookOpen className="w-6 h-6 opacity-40" />
              <p className="text-sm">Nothing captured yet.</p>
              <p className="text-xs opacity-70">Send <code className="px-1 rounded" style={{ background: hoverBg }}>/idea</code> in Telegram to get started.</p>
            </div>
          )}
          {!loading && recent.map((item, idx, arr) => (
            <div key={item.id} onClick={() => setSelected(item)}
              className="px-4 sm:px-5 py-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
              style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${divider}` : "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate transition-colors" style={{ color: fg }}>{item.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.tags.slice(0, 3).map(t => <Badge key={t} color="cyan">{t}</Badge>)}
                    {item.telegram_chat_title && <span className="text-xs" style={{ color: mutedFg }}>· {item.telegram_chat_title}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:block sm:text-right flex-shrink-0 ml-4 sm:ml-0 mt-1 sm:mt-0">
                <div className="text-xs" style={{ color: mutedFg }}>{relativeTime(item.created_at)}</div>
                <div className="text-xs sm:mt-0.5" style={{ color: subFg }}>{item.telegram_display_name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="px-4 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
              <Hash className="w-3.5 h-3.5 text-cyan-500" />
              <h2 className="text-sm font-semibold" style={{ color: fg }}>Top Tags</h2>
            </div>
            <div className="p-4">
              {loading && <div className="h-24 rounded-xl animate-pulse" style={{ background: hoverBg }} />}
              {!loading && tags.length === 0 && (
                <p className="text-xs" style={{ color: mutedFg }}>No tags yet.</p>
              )}
              {!loading && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(({ tag, count }) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: hoverBg, color: mutedFg }}>
                      {tag} <span style={{ color: subFg }}>({count})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="px-4 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-sm font-semibold" style={{ color: fg }}>Needs Follow-Up</h2>
            </div>
            {!loading && followUpPreview.length === 0 && (
              <div className="p-4 text-xs" style={{ color: mutedFg }}>Nothing outstanding right now.</div>
            )}
            {!loading && followUpPreview.length > 0 && (
              <div>
                {followUpPreview.map(item => (
                  <div key={item.id} onClick={() => setSelected(item)}
                    className="px-4 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-all"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <span className="text-xs truncate" style={{ color: fg }}>{item.title}</span>
                    <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                      {item.open_questions.length}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!loading && error && (
        <div className="p-4 rounded-2xl text-sm" style={{ background: cardBg, border: `1px solid ${border}`, color: mutedFg }}>
          Couldn't reach the backend ({error}). Make sure it's running at the configured API URL.
        </div>
      )}

      <KnowledgeDetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
