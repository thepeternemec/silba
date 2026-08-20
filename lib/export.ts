import type { FlatItem, EnrichmentDef } from "./types";
import * as XLSX from "xlsx";

function getEntityCols(items: FlatItem[]) {
  const entityType = items[0]?.entityType ?? "company";
  return entityType === "company" ? ["name", "industry", "location"] :
    entityType === "person" ? ["name", "position", "company"] :
    entityType === "article" ? ["title", "author"] :
    entityType === "research_paper" ? ["title", "author"] :
    ["title"];
}

function buildRows(items: FlatItem[], enrichmentDefs: EnrichmentDef[]) {
  const entityCols = getEntityCols(items);
  return items.map((item) => {
    const row: Record<string, string> = {
      URL: item.url,
      Description: item.description,
    };
    for (const col of entityCols) {
      const label = col.charAt(0).toUpperCase() + col.slice(1);
      row[label] = String(item.entityFields[col] ?? "");
    }
    for (const def of enrichmentDefs) {
      const result = item.enrichments.find((e) => e.enrichmentId === def.id);
      row[def.description] = result?.result?.join(", ") ?? "";
    }
    return row;
  });
}

export function exportCSV(items: FlatItem[], enrichmentDefs: EnrichmentDef[]) {
  const rows = buildRows(items, enrichmentDefs);
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      headers.map((h) => `"${(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  download(csv, "silba-results.csv", "text/csv");
}

export function exportJSON(items: FlatItem[], enrichmentDefs: EnrichmentDef[]) {
  const rows = buildRows(items, enrichmentDefs);
  download(JSON.stringify(rows, null, 2), "silba-results.json", "application/json");
}

export function exportExcel(items: FlatItem[], enrichmentDefs: EnrichmentDef[]) {
  const rows = buildRows(items, enrichmentDefs);
  if (rows.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, "silba-results.xlsx");
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
