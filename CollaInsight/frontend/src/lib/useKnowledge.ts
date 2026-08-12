import { useSyncExternalStore } from "react";
import { fetchKnowledge, KnowledgeFeedItem } from "./api";

// Shared module-level cache: Dashboard/Knowledge/Insights each mount and
// unmount their own useKnowledge() call as the user navigates (App.tsx only
// renders the active view), so per-component state would refetch from
// scratch every time. This store lives once at module scope instead, so
// every consumer reads the same cached data and only the first-ever caller
// (app-wide) triggers a network request. Same mechanics as the earlier
// useIdeas() this replaced - just pointed at the general, all-six-types
// GET /api/knowledge endpoint instead of the idea-only GET /api/ideas.

interface KnowledgeState {
  items: KnowledgeFeedItem[];
  loading: boolean; // true only while there's no cached data to show yet
  error: string | null;
}

const STALE_MS = 30_000; // cached data is treated as fresh for 30s before a background revalidation

let state: KnowledgeState = { items: [], loading: true, error: null };
let lastFetchedAt = 0;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<KnowledgeState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

function load(): Promise<void> {
  if (inFlight) return inFlight;
  // Only show the loading state if there's nothing on screen yet - a
  // background revalidation of already-cached data shouldn't blank the UI.
  if (state.items.length === 0) setState({ loading: true, error: null });
  inFlight = fetchKnowledge()
    .then(data => {
      lastFetchedAt = Date.now();
      setState({ items: data, loading: false, error: null });
    })
    .catch(err => {
      setState({ loading: false, error: err instanceof Error ? err.message : String(err) });
    })
    .finally(() => { inFlight = null; });
  return inFlight;
}

/** Explicit invalidation - call after you know new data exists to force a refetch and update every mounted page. */
export function refreshKnowledge(): Promise<void> {
  return load();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!inFlight && Date.now() - lastFetchedAt > STALE_MS) load();
  return () => { listeners.delete(listener); };
}

function getSnapshot(): KnowledgeState {
  return state;
}

export function useKnowledge(): KnowledgeState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Frequency-ranked tags across all fetched items, most-used first. */
export function topTags(items: KnowledgeFeedItem[], limit = 6): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}
