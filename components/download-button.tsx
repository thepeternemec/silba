"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import type { FlatItem, EnrichmentDef } from "@/lib/types";
import { exportExcel, exportCSV, exportJSON } from "@/lib/export";

interface DownloadButtonProps {
  items: FlatItem[];
  enrichmentDefs: EnrichmentDef[];
}

const FORMATS = [
  { label: "Excel", action: exportExcel },
  { label: "CSV", action: exportCSV },
  { label: "JSON", action: exportJSON },
] as const;

export default function DownloadButton({ items, enrichmentDefs }: DownloadButtonProps) {
  const [selected, setSelected] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = FORMATS[selected];

  return (
    <div ref={ref} className="relative inline-flex">
      {/* Main button */}
      <button
        onClick={() => current.action(items, enrichmentDefs)}
        className="flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-l-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        {current.label}
      </button>

      {/* Dropdown toggle */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center border border-white/10 border-l-0 bg-white/5 rounded-r-lg px-1.5 py-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-1 border border-white/10 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden z-50">
          {FORMATS.map((fmt, i) => (
            <button
              key={fmt.label}
              onClick={() => {
                setSelected(i);
                setDropdownOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-xs cursor-pointer transition-colors ${
                i === selected
                  ? "text-white/80 bg-white/10"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
