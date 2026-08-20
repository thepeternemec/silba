"use client";

import { useState, useEffect } from "react";
import { parseQuery } from "@/lib/parse-query";

interface QuickSearchFormProps {
  onSubmit: (params: {
    query: string;
    count: number;
    enrichments?: { description: string; format: string }[];
  }) => void;
  isLoading: boolean;
  resetKey?: number;
}

export default function QuickSearchForm({ onSubmit, isLoading, resetKey }: QuickSearchFormProps) {
  const [input, setInput] = useState("");
  const [count, setCount] = useState(5);
  const [showMaxNote, setShowMaxNote] = useState(false);

  useEffect(() => {
    setInput("");
    setCount(5);
    setShowMaxNote(false);
  }, [resetKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const parsed = parseQuery(input);
    onSubmit({
      query: parsed.query,
      count,
      enrichments: parsed.enrichments.length > 0 ? parsed.enrichments : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g., Find agriculture companies in Slovenia, find their CEO and find his email"
        className="w-full border border-white/10 bg-white/5 text-white/75 placeholder-white/30 rounded-lg px-3 py-2.5 text-[15px] focus:outline-none focus:border-white/25 transition-colors min-h-[100px] resize-none"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && input.trim()) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <div className="flex items-center justify-between border border-white/10 bg-white/5 rounded-lg px-3 py-2.5 mt-2.5">
        <span className="text-[15px] text-white/70">How many customers to find</span>
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => {
            const raw = parseInt(e.target.value) || 1;
            if (raw > 20) setShowMaxNote(true);
            else setShowMaxNote(false);
            setCount(Math.min(20, Math.max(1, raw)));
          }}
          className="w-16 border border-white/10 bg-white/5 text-white/75 rounded-md px-2 py-1 text-center text-[15px] focus:outline-none focus:border-white/25"
          disabled={isLoading}
        />
      </div>
      {showMaxNote && (
        <p className="text-amber-400/70 text-xs text-right mt-1">20 is the maximum for this demo.</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <p className="text-[11px] text-white/25">
          Tip: mention &quot;email&quot;, &quot;phone&quot;, &quot;CEO&quot;, &quot;LinkedIn&quot; to enrich results
        </p>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 px-5 py-2 text-[15px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching
            </>
          ) : (
            "Search"
          )}
        </button>
      </div>
    </form>
  );
}
