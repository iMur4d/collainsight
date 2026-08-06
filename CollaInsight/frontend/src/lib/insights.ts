import { KnowledgeItem } from "./api";

const DAY_MS = 86400000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Daily capture counts, zero-filled, covering at least the last 7 days. */
export function capturesByDay(ideas: KnowledgeItem[]): { date: string; label: string; count: number }[] {
  const today = new Date();
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    const key = dayKey(new Date(idea.created_at));
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const earliestMs = ideas.length
    ? Math.min(...ideas.map(i => new Date(i.created_at).getTime()))
    : today.getTime();
  const spanStart = new Date(Math.min(earliestMs, today.getTime() - 6 * DAY_MS));
  spanStart.setHours(0, 0, 0, 0);

  const days: { date: string; label: string; count: number }[] = [];
  for (let t = spanStart.getTime(); t <= today.getTime(); t += DAY_MS) {
    const d = new Date(t);
    const key = dayKey(d);
    days.push({ date: key, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: counts.get(key) || 0 });
  }
  return days;
}

export function topContributors(ideas: KnowledgeItem[], limit = 6): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    // Skip ideas with no real Telegram identity rather than bucketing them
    // under a fabricated "unknown" contributor.
    if (!idea.telegram_display_name) continue;
    counts.set(idea.telegram_display_name, (counts.get(idea.telegram_display_name) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

/** Ideas whose structured extraction left open questions - real signal for what needs a manager's attention. */
export function needsFollowUp(ideas: KnowledgeItem[]): KnowledgeItem[] {
  return ideas
    .filter(i => i.open_questions.length > 0)
    .sort((a, b) => b.open_questions.length - a.open_questions.length);
}

export function isWithinLastDays(iso: string, days: number, from = new Date()): boolean {
  const cutoff = from.getTime() - days * DAY_MS;
  return new Date(iso).getTime() >= cutoff;
}

export function isSameCalendarDay(iso: string, ref = new Date()): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

export interface GrowthMetrics {
  thisWeek: number;
  lastWeek: number;
  /** null when there's no prior-week baseline to compare against - showing 0% or +Infinity% would be misleading, not just ugly. */
  deltaPct: number | null;
}

/** Rolling 7-day count vs. the preceding 7-day window. */
export function weeklyGrowth(ideas: KnowledgeItem[], now = new Date()): GrowthMetrics {
  const thisWeek = ideas.filter(i => isWithinLastDays(i.created_at, 7, now)).length;
  const lastWeek = ideas.filter(i => {
    const t = new Date(i.created_at).getTime();
    return t >= now.getTime() - 14 * DAY_MS && t < now.getTime() - 7 * DAY_MS;
  }).length;
  const deltaPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
  return { thisWeek, lastWeek, deltaPct };
}

/** Average ideas captured per day since the first-ever capture (min 1 day, so a single day of activity doesn't divide by zero). */
export function knowledgeVelocity(ideas: KnowledgeItem[], now = new Date()): number {
  if (ideas.length === 0) return 0;
  const earliestMs = Math.min(...ideas.map(i => new Date(i.created_at).getTime()));
  const daysActive = Math.max(1, Math.ceil((now.getTime() - earliestMs) / DAY_MS));
  return Math.round((ideas.length / daysActive) * 10) / 10;
}
