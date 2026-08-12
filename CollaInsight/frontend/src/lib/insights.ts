import { KnowledgeFeedItem } from "./api";

const DAY_MS = 86400000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Daily capture counts, zero-filled, covering at least the last 7 days. */
export function capturesByDay(items: KnowledgeFeedItem[]): { date: string; label: string; count: number }[] {
  const today = new Date();
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = dayKey(new Date(item.created_at));
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const earliestMs = items.length
    ? Math.min(...items.map(i => new Date(i.created_at).getTime()))
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

export function topContributors(items: KnowledgeFeedItem[], limit = 6): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    // Skip items with no real Telegram identity rather than bucketing them
    // under a fabricated "unknown" contributor.
    if (!item.telegram_display_name) continue;
    counts.set(item.telegram_display_name, (counts.get(item.telegram_display_name) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

/** Extracts the open_questions array where it exists - today that's Idea
 * items only (Question/Suggestion/Decision/Action/Observation don't have
 * this attribute at all), but this checks `attributes` generically rather
 * than assuming a type, so it stays correct if that ever changes. */
export function openQuestionsOf(item: KnowledgeFeedItem): string[] {
  const value = item.attributes?.open_questions;
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Items whose structured extraction left open questions - real signal for what needs a manager's attention. */
export function needsFollowUp(items: KnowledgeFeedItem[]): KnowledgeFeedItem[] {
  return items
    .filter(i => openQuestionsOf(i).length > 0)
    .sort((a, b) => openQuestionsOf(b).length - openQuestionsOf(a).length);
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
export function weeklyGrowth(items: KnowledgeFeedItem[], now = new Date()): GrowthMetrics {
  const thisWeek = items.filter(i => isWithinLastDays(i.created_at, 7, now)).length;
  const lastWeek = items.filter(i => {
    const t = new Date(i.created_at).getTime();
    return t >= now.getTime() - 14 * DAY_MS && t < now.getTime() - 7 * DAY_MS;
  }).length;
  const deltaPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
  return { thisWeek, lastWeek, deltaPct };
}

/** Average items captured per day since the first-ever capture (min 1 day, so a single day of activity doesn't divide by zero). */
export function knowledgeVelocity(items: KnowledgeFeedItem[], now = new Date()): number {
  if (items.length === 0) return 0;
  const earliestMs = Math.min(...items.map(i => new Date(i.created_at).getTime()));
  const daysActive = Math.max(1, Math.ceil((now.getTime() - earliestMs) / DAY_MS));
  return Math.round((items.length / daysActive) * 10) / 10;
}
