import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Hash, Users, HelpCircle, BookOpen } from "lucide-react";

import { useThemeCtx } from "@/shared";
import { KnowledgeItem } from "@/lib/api";
import { useIdeas, relativeTime, topTags } from "@/lib/useIdeas";
import { capturesByDay, topContributors, needsFollowUp, weeklyGrowth, knowledgeVelocity } from "@/lib/insights";
import { KnowledgeDetailPanel } from "@/components/KnowledgeDetail";
import { GrowthChip } from "@/components/GrowthChip";

// Chart mark colors - validated for CVD-safety, chroma, and dark/light
// contrast via the dataviz skill's validate_palette.js (adjacent-pair floor
// ok only with secondary encoding, which these get via titles/axis labels).
// Each chart here is a single series, so no legend is needed - see
// references/marks-and-anatomy.md.
const CHART_BLUE = "#2563EB";
const CHART_CYAN = "#0891B2";
const CHART_VIOLET = "#8B5CF6";

function ChartTooltip({ active, payload, label, cardBg, border, fg }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: cardBg, border: `1px solid ${border}`, color: fg }}>
      <div className="font-medium mb-0.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey}>{p.value}</div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass, loading }: { icon: React.ElementType; label: string; value: number; colorClass: string; loading: boolean }) {
  const { fg, mutedFg, cardBg, border } = useThemeCtx();
  return (
    <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: fg }}>{loading ? "—" : value}</div>
      <div className="text-xs" style={{ color: mutedFg }}>{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const { fg, mutedFg, cardBg, border, divider } = useThemeCtx();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${divider}` }}>
        <h3 className="text-sm font-semibold" style={{ color: fg }}>{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: mutedFg }}>{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function InsightsView() {
  const { isLight, fg, mutedFg, subFg, cardBg, border, divider, hoverBg } = useThemeCtx();
  const { ideas, loading, error } = useIdeas();
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);

  const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const tickStyle = { fill: mutedFg, fontSize: 11 };

  const daily = useMemo(() => capturesByDay(ideas), [ideas]);
  const tags = useMemo(() => topTags(ideas, 6), [ideas]);
  const contributors = useMemo(() => topContributors(ideas, 6), [ideas]);
  const followUp = useMemo(() => needsFollowUp(ideas), [ideas]);
  const growth = useMemo(() => weeklyGrowth(ideas), [ideas]);
  const velocity = useMemo(() => knowledgeVelocity(ideas), [ideas]);

  const contributorCount = new Set(ideas.map(i => i.telegram_display_name).filter(Boolean)).size;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: fg }}>AI Insights</h2>
        <p className="text-sm mt-0.5" style={{ color: mutedFg }}>
          Metrics computed directly from captured knowledge — not AI-generated commentary.
        </p>
      </div>

      {!loading && error && (
        <div className="p-4 rounded-2xl text-sm" style={{ background: cardBg, border: `1px solid ${border}`, color: mutedFg }}>
          Couldn't reach the backend ({error}).
        </div>
      )}

      {!loading && !error && ideas.length === 0 && (
        <div className="p-8 rounded-2xl text-center text-sm" style={{ background: cardBg, border: `1px solid ${border}`, color: mutedFg }}>
          No data yet — insights appear once ideas are captured via Telegram.
        </div>
      )}

      {(loading || ideas.length > 0) && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} label="Ideas captured" value={ideas.length} colorClass="text-blue-500 bg-blue-500/10" loading={loading} />
            <StatCard icon={Hash} label="Unique tags" value={tags.length ? new Set(ideas.flatMap(i => i.tags)).size : 0} colorClass="text-cyan-500 bg-cyan-500/10" loading={loading} />
            <StatCard icon={Users} label="Contributors" value={contributorCount} colorClass="text-violet-500 bg-violet-500/10" loading={loading} />
            <StatCard icon={HelpCircle} label="Need follow-up" value={followUp.length} colorClass="text-amber-500 bg-amber-500/10" loading={loading} />
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${divider}` }}>
              <h3 className="text-sm font-semibold" style={{ color: fg }}>Knowledge Growth</h3>
              <p className="text-xs mt-0.5" style={{ color: mutedFg }}>Rolling 7-day window vs. the 7 days before it</p>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: fg }}>{growth.thisWeek}</span>
                  <GrowthChip deltaPct={growth.deltaPct} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: mutedFg }}>Captured this week{growth.deltaPct === null && growth.lastWeek === 0 ? " (no prior week to compare yet)" : ""}</div>
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: fg }}>{growth.lastWeek}</span>
                <div className="text-xs mt-0.5" style={{ color: mutedFg }}>Captured previous week</div>
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: fg }}>{velocity}</span>
                <div className="text-xs mt-0.5" style={{ color: mutedFg }}>Ideas / day (avg since first capture)</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <ChartCard title="Captures Over Time" subtitle={`${daily[0]?.label} – ${daily[daily.length - 1]?.label}`}>
                {loading ? (
                  <div className="h-48 rounded-xl animate-pulse" style={{ background: hoverBg }} />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={gridColor} />
                      <XAxis dataKey="label" tick={tickStyle} axisLine={{ stroke: gridColor }} tickLine={false} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                      <Tooltip content={<ChartTooltip cardBg={cardBg} border={border} fg={fg} />} cursor={{ fill: hoverBg }} />
                      <Bar dataKey="count" name="Ideas captured" fill={CHART_BLUE} radius={[4, 4, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <ChartCard title="Top Tags">
              {loading ? (
                <div className="h-48 rounded-xl animate-pulse" style={{ background: hoverBg }} />
              ) : tags.length === 0 ? (
                <p className="text-xs py-8 text-center" style={{ color: mutedFg }}>No tags yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(160, tags.length * 34)}>
                  <BarChart data={tags} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke={gridColor} />
                    <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="tag" tick={tickStyle} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<ChartTooltip cardBg={cardBg} border={border} fg={fg} />} cursor={{ fill: hoverBg }} />
                    <Bar dataKey="count" name="Uses" fill={CHART_CYAN} radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Top Contributors">
              {loading ? (
                <div className="h-48 rounded-xl animate-pulse" style={{ background: hoverBg }} />
              ) : contributors.length === 0 ? (
                <p className="text-xs py-8 text-center" style={{ color: mutedFg }}>No contributors yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(160, contributors.length * 34)}>
                  <BarChart data={contributors} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke={gridColor} />
                    <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<ChartTooltip cardBg={cardBg} border={border} fg={fg} />} cursor={{ fill: hoverBg }} />
                    <Bar dataKey="count" name="Ideas" fill={CHART_VIOLET} radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${divider}` }}>
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold" style={{ color: fg }}>Needs Follow-Up</h3>
              <span className="text-xs ml-1" style={{ color: mutedFg }}>Ideas with open questions the AI couldn't resolve from the original message</span>
            </div>
            {followUp.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs" style={{ color: mutedFg }}>Nothing outstanding — every captured idea is fully specified.</div>
            ) : (
              followUp.slice(0, 8).map((item, idx, arr) => (
                <div key={item.id} onClick={() => setSelected(item)}
                  className="px-5 py-3 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${divider}` : "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: fg }}>{item.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: subFg }}>{relativeTime(item.created_at)}</div>
                  </div>
                  <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                    {item.open_questions.length} question{item.open_questions.length === 1 ? "" : "s"}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <KnowledgeDetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
