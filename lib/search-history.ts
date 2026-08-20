import type { FlatItem, EnrichmentDef } from "./types";

export interface SearchEntry {
  id: string;
  title: string | null;
  query: string;
  websetId: string;
  itemCount: number;
  items: FlatItem[];
  enrichmentDefs: EnrichmentDef[];
  createdAt: string;
}

const STORAGE_KEY = "silba_search_history";
const MAX_ENTRIES = 20;

export function getHistory(): SearchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSearch(entry: SearchEntry): void {
  const history = getHistory();
  // Replace if same websetId exists, otherwise prepend
  const filtered = history.filter((h) => h.websetId !== entry.websetId);
  const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteSearch(id: string): SearchEntry[] {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
