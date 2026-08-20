export interface CreateWebsetRequest {
  query: string;
  count: number;
  criteria?: { description: string }[];
  entity?: { type: string; description?: string };
  enrichments?: {
    description: string;
    format: string;
  }[];
}

export interface EnrichmentDef {
  id: string;
  description: string;
  format: string;
}

export interface FlatItem {
  id: string;
  url: string;
  description: string;
  entityType: string;
  entityFields: Record<string, string | number | null>;
  evaluations: {
    criterion: string;
    satisfied: string;
    reasoning: string;
    references: { title: string | null; url: string; snippet: string | null }[];
  }[];
  enrichments: {
    enrichmentId: string;
    status: string;
    result: string[] | null;
  }[];
}

export interface WebsetStatusResponse {
  id: string;
  status: string;
  title: string | null;
  progress: {
    completion: number;
    found: number;
    analyzed: number;
  };
  items: FlatItem[];
  enrichmentDefs: EnrichmentDef[];
}
