"use client";

import type { FlatItem, EnrichmentDef } from "@/lib/types";
import ItemRow from "./item-row";
import TableSkeleton from "./table-skeleton";

interface ResultsTableProps {
  items: FlatItem[];
  enrichmentDefs: EnrichmentDef[];
  isLoading: boolean;
  expectedCount: number;
}

const ENTITY_COLUMNS: Record<string, { key: string; label: string }[]> = {
  company: [
    { key: "name", label: "Name" },
    { key: "industry", label: "Industry" },
    { key: "location", label: "Location" },
  ],
  person: [
    { key: "name", label: "Name" },
    { key: "position", label: "Position" },
    { key: "company", label: "Company" },
  ],
  article: [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
  ],
  research_paper: [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
  ],
  custom: [
    { key: "title", label: "Title" },
  ],
};

export default function ResultsTable({
  items,
  enrichmentDefs,
  isLoading,
  expectedCount,
}: ResultsTableProps) {
  const entityType = items[0]?.entityType ?? "company";
  const entityCols = ENTITY_COLUMNS[entityType] ?? ENTITY_COLUMNS.custom;
  const entityColumnKeys = entityCols.map((c) => c.key);

  const totalCols = 3 + entityCols.length + enrichmentDefs.length + 1;
  const skeletonRows = isLoading
    ? Math.min(Math.max(0, expectedCount - items.length), 20)
    : 0;

  return (
    <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-xs font-medium text-white/40 w-10">
                #
              </th>
              <th className="px-3 py-2 text-xs font-medium text-white/40">
                URL
              </th>
              <th className="px-3 py-2 text-xs font-medium text-white/40">
                Description
              </th>
              {entityCols.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-xs font-medium text-white/40"
                >
                  {col.label}
                </th>
              ))}
              {enrichmentDefs.map((def) => (
                <th
                  key={def.id}
                  className="px-3 py-2 text-xs font-medium text-white/40"
                >
                  {def.description}
                </th>
              ))}
              <th className="px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <ItemRow
                key={item.id}
                item={item}
                index={i}
                enrichmentDefs={enrichmentDefs}
                entityColumns={entityColumnKeys}
              />
            ))}
            {skeletonRows > 0 && (
              <TableSkeleton rows={skeletonRows} columns={totalCols} />
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && items.length === 0 && (
        <div className="px-3 py-10 text-center text-sm text-white/30">
          No customers found. Try a different description.
        </div>
      )}
    </div>
  );
}
