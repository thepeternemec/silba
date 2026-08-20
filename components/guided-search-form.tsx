"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SearchFormProps {
  onSubmit: (params: {
    query: string;
    count: number;
    criteria?: { description: string }[];
    entity?: { type: string };
    enrichments?: { description: string; format: string }[];
  }) => void;
  isLoading: boolean;
  compact?: boolean;
  initialQuery?: string;
  resetKey?: number;
}

interface FormData {
  idealCustomer: string;
  count: number;
  country: string;
  city: string;
  companySize: string;
  position: string;
  wantEmail: boolean;
  wantPhone: boolean;
}

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const STEPS = [
  { id: "customer", title: "Who are you looking for?" },
  { id: "location", title: "Where are they based?" },
  { id: "company", title: "What kind of company?" },
  { id: "contact", title: "What contact info do you need?" },
];

function buildQuery(data: FormData): string {
  let query = data.idealCustomer;

  const parts: string[] = [];
  if (data.position) parts.push(`in a ${data.position} role`);
  if (data.companySize) parts.push(`at a company with ${data.companySize}`);
  if (data.city && data.country) parts.push(`based in ${data.city}, ${data.country}`);
  else if (data.country) parts.push(`based in ${data.country}`);
  else if (data.city) parts.push(`based in ${data.city}`);

  if (parts.length > 0) {
    query += `, ${parts.join(", ")}`;
  }
  return query;
}

function buildCriteria(data: FormData) {
  const criteria: { description: string }[] = [];
  if (data.country) criteria.push({ description: `Located in ${data.country}${data.city ? `, ${data.city}` : ""}` });
  else if (data.city) criteria.push({ description: `Located in ${data.city}` });
  if (data.companySize) criteria.push({ description: `Company has ${data.companySize}` });
  if (data.position) criteria.push({ description: `Person holds a ${data.position} or similar role` });
  return criteria;
}

function buildEnrichments(data: FormData) {
  const enrichments: { description: string; format: string }[] = [];
  if (data.position) {
    enrichments.push({ description: `Find the ${data.position}'s full name`, format: "text" });
  }
  if (data.wantEmail) {
    enrichments.push({ description: "Find the person's email address", format: "email" });
  }
  if (data.wantPhone) {
    enrichments.push({ description: "Find the person's phone number", format: "phone" });
  }
  return enrichments;
}

export default function GuidedSearchForm({ onSubmit, isLoading, compact, initialQuery, resetKey }: SearchFormProps) {
  const [step, setStep] = useState(0);
  const [showMaxNote, setShowMaxNote] = useState(false);
  const [data, setData] = useState<FormData>({
    idealCustomer: initialQuery ?? "",
    count: 5,
    country: "",
    city: "",
    companySize: "",
    position: "",
    wantEmail: false,
    wantPhone: false,
  });

  useEffect(() => {
    if (initialQuery !== undefined) {
      setData((prev) => ({ ...prev, idealCustomer: initialQuery }));
    }
  }, [initialQuery]);

  useEffect(() => {
    setStep(0);
    setShowMaxNote(false);
    setData({
      idealCustomer: "",
      count: 5,
      country: "",
      city: "",
      companySize: "",
      position: "",
      wantEmail: false,
      wantPhone: false,
    });
  }, [resetKey]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep(step + 1);
  }, [step]);

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function handleSubmit() {
    if (!data.idealCustomer.trim()) return;
    const criteria = buildCriteria(data);
    const enrichments = buildEnrichments(data);
    onSubmit({
      query: buildQuery(data),
      count: data.count,
      criteria: criteria.length > 0 ? criteria : undefined,
      entity: data.position ? { type: "person" } : { type: "company" },
      enrichments: enrichments.length > 0 ? enrichments : undefined,
    });
  }

  // Auto-focus first input on step change
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const el = contentRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[data-step="${step}"] input:not([type=number]):not([type=checkbox]), [data-step="${step}"] textarea`
      );
      if (el && !compact) el.focus();
    }, 320);
    return () => clearTimeout(t);
  }, [step, compact]);

  const canAdvance = step === 0 ? data.idealCustomer.trim().length > 0 : true;
  const isLastStep = step === STEPS.length - 1;

  const sz = compact ? "text-sm" : "text-[15px]";
  const inputClass = `w-full border border-white/10 bg-white/5 text-white/75 placeholder-white/30 rounded-lg px-3 py-2 ${sz} focus:outline-none focus:border-white/25 transition-colors`;

  return (
    <div className={compact ? "w-full" : "w-full max-w-xl"}>
      {/* Step indicators */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { if (i < step) setStep(i); }}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-white/60" : "bg-white/10"
            } ${i < step ? "cursor-pointer" : "cursor-default"}`}
          />
        ))}
      </div>

      {/* Step content — CSS grid stack, each panel in same cell */}
      <div ref={contentRef} className="grid overflow-hidden" style={{ gridTemplate: "1fr / 1fr" }}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            data-step={i}
            className="col-start-1 row-start-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: `translateX(${(i - step) * 100}%)`,
              opacity: i === step ? 1 : 0,
              pointerEvents: i === step ? "auto" : "none",
            }}
            aria-hidden={i !== step}
          >
            <p className={`text-white/50 mb-3 ${compact ? "text-xs" : "text-sm"}`}>
              {s.title}
            </p>

            {i === 0 && (
              <div className="space-y-2.5">
                <textarea
                  value={data.idealCustomer}
                  onChange={(e) => update("idealCustomer", e.target.value)}
                  placeholder="e.g., SaaS founders who just raised Series A"
                  className={`${inputClass} min-h-[80px] resize-none`}
                  disabled={isLoading}
                  tabIndex={step === 0 ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && canAdvance) {
                      e.preventDefault();
                      next();
                    }
                  }}
                />
                <div className="flex items-center justify-between border border-white/10 bg-white/5 rounded-lg px-3 py-2.5">
                  <span className={`text-white/70 ${sz}`}>How many customers to find</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={data.count}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value) || 1;
                      if (raw > 20) setShowMaxNote(true);
                      else setShowMaxNote(false);
                      update("count", Math.min(20, Math.max(1, raw)));
                    }}
                    className={`w-16 border border-white/10 bg-white/5 text-white/75 rounded-md px-2 py-1 text-center ${sz} focus:outline-none focus:border-white/25`}
                    disabled={isLoading}
                    tabIndex={step === 0 ? 0 : -1}
                  />
                </div>
                {showMaxNote && (
                  <p className="text-amber-400/70 text-xs text-right">20 is the maximum for this demo.</p>
                )}
              </div>
            )}

            {i === 1 && (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={data.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="Country (e.g., United States)"
                  className={inputClass}
                  disabled={isLoading}
                  tabIndex={step === 1 ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); next(); } }}
                />
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="City (e.g., San Francisco)"
                  className={inputClass}
                  disabled={isLoading}
                  tabIndex={step === 1 ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); next(); } }}
                />
              </div>
            )}

            {i === 2 && (
              <div className="space-y-2.5">
                <select
                  value={data.companySize}
                  onChange={(e) => update("companySize", e.target.value)}
                  className={`${inputClass} pr-10 appearance-none bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat ${!data.companySize ? "text-white/30" : ""}`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
                  disabled={isLoading}
                  tabIndex={step === 2 ? 0 : -1}
                >
                  <option value="" className="bg-neutral-900 text-white/50">Any size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={data.position}
                  onChange={(e) => update("position", e.target.value)}
                  placeholder="Position (e.g., CEO, CTO, Head of Sales)"
                  className={inputClass}
                  disabled={isLoading}
                  tabIndex={step === 2 ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); next(); } }}
                />
              </div>
            )}

            {i === 3 && (
              <div className="space-y-3">
                <label className={`flex items-center justify-between border border-white/10 bg-white/5 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-colors ${sz}`}>
                  <span className="text-white/80">Find their email address</span>
                  <input
                    type="checkbox"
                    checked={data.wantEmail}
                    onChange={(e) => update("wantEmail", e.target.checked)}
                    className="w-4 h-4 accent-white"
                    disabled={isLoading}
                    tabIndex={step === 3 ? 0 : -1}
                  />
                </label>
                <label className={`flex items-center justify-between border border-white/10 bg-white/5 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-colors ${sz}`}>
                  <span className="text-white/80">Find their phone number</span>
                  <input
                    type="checkbox"
                    checked={data.wantPhone}
                    onChange={(e) => update("wantPhone", e.target.checked)}
                    className="w-4 h-4 accent-white"
                    disabled={isLoading}
                    tabIndex={step === 3 ? 0 : -1}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={back}
          className={`text-white/40 hover:text-white transition-colors cursor-pointer ${compact ? "text-xs" : "text-sm"} ${
            step === 0 ? "invisible" : ""
          }`}
          disabled={isLoading}
        >
          Back
        </button>

        <div className="flex items-center gap-2">
          {!isLastStep && step > 0 && (
            <button
              type="button"
              onClick={() => setStep(STEPS.length - 1)}
              className={`text-white/40 hover:text-white transition-colors underline underline-offset-2 cursor-pointer ${compact ? "text-xs" : "text-sm"}`}
              disabled={isLoading}
            >
              Skip
            </button>
          )}
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !data.idealCustomer.trim()}
              className={`bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
                compact ? "px-3.5 py-2 text-sm" : "px-5 py-2.5 text-[15px]"
              }`}
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
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance || isLoading}
              className={`bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                compact ? "px-3.5 py-2 text-sm" : "px-5 py-2.5 text-[15px]"
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
