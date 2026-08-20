"use client";

interface ProgressBarProps {
  completion: number;
  found: number;
  analyzed: number;
  enriching?: boolean;
}

export default function ProgressBar({ completion, found, analyzed, enriching }: ProgressBarProps) {
  const searchDone = completion >= 100;

  return (
    <div className="w-full">
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            searchDone && enriching ? "bg-white/40 animate-pulse" : "bg-white/70"
          }`}
          style={{ width: `${Math.max(completion, 2)}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-white/40">
        <span>{found} customer{found !== 1 ? "s" : ""} found</span>
        <span>
          {searchDone && enriching
            ? "Enriching results..."
            : `${analyzed} analyzed · ${Math.round(completion)}%`
          }
        </span>
      </div>
    </div>
  );
}
