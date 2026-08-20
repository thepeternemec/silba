"use client";

import Skeleton from "./skeleton";

interface TableSkeletonProps {
  rows: number;
  columns: number;
}

// Deterministic widths so skeleton doesn't flicker on re-render
const ROW_WIDTHS = [
  [35, 80, 90, 55, 70, 45, 60],
  [50, 65, 75, 85, 40, 55, 70],
  [45, 90, 60, 70, 55, 80, 50],
  [60, 70, 85, 45, 65, 50, 75],
  [40, 85, 70, 60, 80, 65, 55],
  [55, 75, 50, 80, 45, 70, 60],
  [70, 60, 80, 50, 75, 55, 45],
  [50, 80, 65, 75, 60, 40, 70],
  [65, 55, 90, 40, 70, 80, 50],
  [45, 70, 55, 85, 50, 65, 75],
];

export default function TableSkeleton({ rows, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-white/5">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-3 py-2.5">
              <Skeleton
                width={`${ROW_WIDTHS[rowIdx % ROW_WIDTHS.length][colIdx % ROW_WIDTHS[0].length]}%`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
