"use client";

import { useState } from "react";
import { PanelRight, Trash2 } from "lucide-react";
import type { SearchEntry } from "@/lib/search-history";
import { deleteSearch } from "@/lib/search-history";

interface SearchSidebarProps {
  entries: SearchEntry[];
  onSelect: (entry: SearchEntry) => void;
  onChange: (entries: SearchEntry[]) => void;
}

export default function SearchSidebar({ entries, onSelect, onChange }: SearchSidebarProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768;
  });

  if (entries.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-5 left-[4.25rem] z-30 text-white/30 hover:text-white/60 transition-colors cursor-pointer flex items-center"
        title="Search history"
      >
        <PanelRight className="w-5 h-5 flex-shrink-0" />
      </button>

      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 w-72 md:w-56 bg-black/90 backdrop-blur-md border-r border-white/10 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <span className="text-sm font-medium text-white/70">Past searches</span>
          <button
            onClick={() => setOpen(false)}
            className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-start gap-2 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => {
                onSelect(entry);
                setOpen(false);
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate">
                  {entry.title || entry.query}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5">
                  {entry.itemCount} result{entry.itemCount !== 1 ? "s" : ""} · {formatDate(entry.createdAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = deleteSearch(entry.id);
                  onChange(updated);
                }}
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all cursor-pointer p-0.5 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
