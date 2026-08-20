"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GuidedSearchForm from "@/components/guided-search-form";
import QuickSearchForm from "@/components/quick-search-form";
import PasswordModal from "@/components/password-modal";
import ProgressBar from "@/components/progress-bar";
import ResultsTable from "@/components/results-table";
import DarkVeil from "@/components/dark-veil";
import * as Switch from "@radix-ui/react-switch";
import SearchSidebar from "@/components/search-sidebar";
import { getHistory, saveSearch, type SearchEntry } from "@/lib/search-history";
import DownloadButton from "@/components/download-button";
import type {
  FlatItem,
  EnrichmentDef,
  WebsetStatusResponse,
} from "@/lib/types";

type AppState = "idle" | "searching" | "done";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [websetId, setWebsetId] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    completion: 0,
    found: 0,
    analyzed: 0,
  });
  const [items, setItems] = useState<FlatItem[]>([]);
  const [enrichmentDefs, setEnrichmentDefs] = useState<EnrichmentDef[]>([]);
  const [expectedCount, setExpectedCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [searchMode, setSearchMode] = useState<"guided" | "quick">("guided");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const pendingSearchRef = useRef<{
    query: string;
    count: number;
    criteria?: { description: string }[];
    entity?: { type: string };
    enrichments?: { description: string; format: string }[];
  } | null>(null);
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/websets/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch webset");
        }
        const data: WebsetStatusResponse = await res.json();

        setProgress(data.progress);
        setItems(data.items);
        setEnrichmentDefs(data.enrichmentDefs);

        if (data.status === "idle" || data.status === "paused") {
          stopPolling();
          setAppState("done");
          if (data.status === "paused") {
            setError("Search was paused. Showing partial results.");
          }
          // Save to history
          const entry: SearchEntry = {
            id: data.id,
            title: data.title,
            query: currentQuery,
            websetId: data.id,
            itemCount: data.items.length,
            items: data.items,
            enrichmentDefs: data.enrichmentDefs,
            createdAt: new Date().toISOString(),
          };
          saveSearch(entry);
          setHistory(getHistory());
        }
      } catch (err) {
        stopPolling();
        setError(err instanceof Error ? err.message : "Polling failed");
        setAppState("done");
      }
    },
    [stopPolling],
  );

  useEffect(() => {
    if (appState === "searching" && websetId) {
      poll(websetId);
      intervalRef.current = setInterval(() => poll(websetId), 3000);
    }
    return stopPolling;
  }, [appState, websetId, poll, stopPolling]);

  function handleSearch(params: {
    query: string;
    count: number;
    criteria?: { description: string }[];
    entity?: { type: string };
    enrichments?: { description: string; format: string }[];
  }) {
    if (!authenticated) {
      pendingSearchRef.current = params;
      setShowPasswordModal(true);
      return;
    }
    executeSearch(params);
  }

  function handlePasswordSuccess() {
    setAuthenticated(true);
    setShowPasswordModal(false);
    if (pendingSearchRef.current) {
      executeSearch(pendingSearchRef.current);
      pendingSearchRef.current = null;
    }
  }

  async function executeSearch(params: {
    query: string;
    count: number;
    criteria?: { description: string }[];
    entity?: { type: string };
    enrichments?: { description: string; format: string }[];
  }) {
    setError(null);
    setItems([]);
    setEnrichmentDefs([]);
    setProgress({ completion: 0, found: 0, analyzed: 0 });
    setExpectedCount(params.count);

    try {
      const res = await fetch("/api/websets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create webset");
      }

      const data = await res.json();
      setWebsetId(data.id);
      setCurrentQuery(params.query);
      setAppState("searching");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start search");
    }
  }

  function handleReset() {
    stopPolling();
    setAppState("idle");
    setWebsetId(null);
    setItems([]);
    setEnrichmentDefs([]);
    setProgress({ completion: 0, found: 0, analyzed: 0 });
    setError(null);
    setFormResetKey((k) => k + 1);
  }

  function handleRestoreSearch(entry: SearchEntry) {
    stopPolling();
    setItems(entry.items);
    setEnrichmentDefs(entry.enrichmentDefs);
    setExpectedCount(entry.itemCount);
    setCurrentQuery(entry.query);
    setWebsetId(entry.websetId);
    setError(null);
    setAppState("done");
  }

  const showForm = appState === "idle";
  const showResults = appState === "searching" || appState === "done";

  return (
    <section className="relative flex flex-col min-h-screen">
      {/* Sidebar */}
      <SearchSidebar
        entries={history}
        onSelect={handleRestoreSearch}
        onChange={setHistory}
      />

      {/* Top bar */}
      <div className="absolute top-5 left-5 z-10 text-base font-semibold text-white/40">
        Silba
      </div>
      <div className="absolute top-5 right-5 z-10">
        <a
          href="mailto:hello@silba.xyz"
          className="text-base text-white/40 hover:text-white/60 transition-colors"
        >
          hello@silba.xyz
        </a>
      </div>

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          speed={1}
          hueShift={24}
          noiseIntensity={0.08}
          scanlineFrequency={0.5}
          scanlineIntensity={0}
          warpAmount={4.7}
          resolutionScale={0.5}
        />
      </div>

      {/* Header — stays in place */}
      <div className="relative z-10 flex flex-col items-center pt-40 pb-6 px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Silba
          </h1>
          <p className="mt-1.5 text-white/50">
            Your next customer is one search away
          </p>
        </div>

        {/* Mode switch */}
        <div className="flex items-center gap-3">
          <span className={`text-xs transition-colors ${searchMode === "guided" ? "text-white/70" : "text-white/30"}`}>
            Guided
          </span>
          <Switch.Root
            checked={searchMode === "quick"}
            onCheckedChange={(checked) => setSearchMode(checked ? "quick" : "guided")}
            className="w-9 h-5 rounded-full bg-white/10 relative data-[state=checked]:bg-white/20 transition-colors cursor-pointer"
          >
            <Switch.Thumb className="block w-4 h-4 rounded-full bg-white/70 transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
          <span className={`text-xs transition-colors ${searchMode === "quick" ? "text-white/70" : "text-white/30"}`}>
            Quick
          </span>
        </div>
      </div>

      {/* Content area — scrolls naturally below the header */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-16">
        <div className="w-full max-w-3xl">
        {/* Search form */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: showForm ? 1 : 0,
            transform: showForm ? "translateY(0)" : "translateY(-20px)",
            pointerEvents: showForm ? "auto" : "none",
            position: showForm ? "relative" : "absolute",
            top: showForm ? undefined : 0,
            left: showForm ? undefined : 0,
            right: showForm ? undefined : 0,
          }}
        >
          <div className="flex justify-center">
            {searchMode === "guided" ? (
              <GuidedSearchForm onSubmit={handleSearch} isLoading={false} resetKey={formResetKey} />
            ) : (
              <QuickSearchForm onSubmit={handleSearch} isLoading={false} resetKey={formResetKey} />
            )}
          </div>
          {error && appState === "idle" && (
            <div className="mt-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: showResults ? 1 : 0,
            transform: showResults ? "translateY(0)" : "translateY(20px)",
            pointerEvents: showResults ? "auto" : "none",
            position: showResults ? "relative" : "absolute",
            top: showResults ? undefined : 0,
            left: showResults ? undefined : 0,
            right: showResults ? undefined : 0,
          }}
        >
          {/* New search link */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 mb-4 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            New search
          </button>

          {/* Error */}
          {error && showResults && (
            <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Progress */}
          {appState === "searching" && (
            <div className="mb-4">
              <ProgressBar
                completion={progress.completion}
                found={progress.found}
                analyzed={progress.analyzed}
                enriching={progress.completion >= 100}
              />
            </div>
          )}

          {/* Count + Export */}
          {appState === "done" && items.length > 0 && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-white/50">
                {items.length} customer{items.length !== 1 ? "s" : ""} found
              </span>
              <DownloadButton items={items} enrichmentDefs={enrichmentDefs} />
            </div>
          )}

          {/* Table */}
          <ResultsTable
            items={items}
            enrichmentDefs={enrichmentDefs}
            isLoading={appState === "searching"}
            expectedCount={expectedCount}
          />
        </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="absolute bottom-6 left-0 right-0 z-10 text-center text-sm text-white/40">
        &copy; {new Date().getFullYear()} Silba. All rights reserved.
      </div>

      {/* Password modal */}
      <PasswordModal
        open={showPasswordModal}
        onSuccess={handlePasswordSuccess}
        onCancel={() => setShowPasswordModal(false)}
      />
    </section>
  );
}
