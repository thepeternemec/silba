"use client";

import { useState } from "react";
import type { FlatItem, EnrichmentDef } from "@/lib/types";
import Skeleton from "./skeleton";

interface ItemRowProps {
  item: FlatItem;
  index: number;
  enrichmentDefs: EnrichmentDef[];
  entityColumns: string[];
}

const SATISFIED_BADGE: Record<string, { style: string; label: string }> = {
  yes: { style: "bg-emerald-500/20 text-emerald-300", label: "Yes" },
  no: { style: "bg-red-500/20 text-red-300", label: "No" },
  unclear: { style: "bg-white/10 text-white/50", label: "Unclear" },
};

export default function ItemRow({ item, index, enrichmentDefs, entityColumns }: ItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  const totalCols = 3 + entityColumns.length + enrichmentDefs.length + 1;

  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-2.5 text-sm text-white/30 w-10">{index + 1}</td>
        <td className="px-3 py-2.5 text-sm max-w-xs">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 underline underline-offset-2 decoration-white/20 hover:decoration-white/60 truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {item.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
        </td>
        <td className="px-3 py-2.5 text-sm text-white/50 max-w-sm">
          <span className="line-clamp-2">{item.description}</span>
        </td>
        {entityColumns.map((col) => (
          <td key={col} className="px-3 py-2.5 text-sm text-white/70">
            {item.entityFields[col] ?? <span className="text-white/20">—</span>}
          </td>
        ))}
        {enrichmentDefs.map((def) => {
          const enrichment = item.enrichments.find((e) => e.enrichmentId === def.id);
          const pending = !enrichment || enrichment.status === "pending";
          return (
            <td key={def.id} className="px-3 py-2.5 text-sm text-white/70">
              {pending ? (
                <Skeleton width="70%" height="14px" />
              ) : enrichment.result ? (
                enrichment.result.join(", ")
              ) : (
                <span className="text-white/20">—</span>
              )}
            </td>
          );
        })}
        <td className="px-3 py-2.5 text-sm text-white/30 w-8">
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-white/5 bg-white/[0.03]">
          <td colSpan={totalCols} className="px-3 py-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-white/40">
                Evaluations
              </h4>
              {item.evaluations.length === 0 && (
                <p className="text-sm text-white/30">No evaluations available.</p>
              )}
              {item.evaluations.map((ev, i) => {
                const badge = SATISFIED_BADGE[ev.satisfied] ?? SATISFIED_BADGE.unclear;
                return (
                  <div key={i} className="border border-white/10 bg-white/5 rounded-md p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-1.5 py-px text-[11px] font-medium rounded ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-sm text-white/70">
                        {ev.criterion}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 mt-1">{ev.reasoning}</p>
                    {ev.references.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                        {ev.references.map((ref, j) => (
                          <a
                            key={j}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/30 hover:text-white/60 underline underline-offset-2"
                          >
                            {ref.title || "Source"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
