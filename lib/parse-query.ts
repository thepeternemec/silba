/**
 * Parse a natural language query to extract enrichment requests.
 * The search query itself + criteria + entity type are handled by the API automatically.
 * We just need to detect when the user is asking for specific data points (email, phone, name, etc.)
 */

interface ParsedQuery {
  query: string;
  count: number;
  enrichments: { description: string; format: string }[];
}

const ENRICHMENT_PATTERNS: { pattern: RegExp; description: string; format: string }[] = [
  { pattern: /\b(?:find|get|include|with)\b.*\bemail\b/i, description: "Find the person's email address", format: "email" },
  { pattern: /\bemail\b.*\b(?:address|contact)\b/i, description: "Find the person's email address", format: "email" },
  { pattern: /\btheir email\b/i, description: "Find the person's email address", format: "email" },
  { pattern: /\bhis email\b/i, description: "Find the person's email address", format: "email" },
  { pattern: /\bher email\b/i, description: "Find the person's email address", format: "email" },

  { pattern: /\b(?:find|get|include|with)\b.*\bphone\b/i, description: "Find the person's phone number", format: "phone" },
  { pattern: /\bphone\b.*\bnumber\b/i, description: "Find the person's phone number", format: "phone" },
  { pattern: /\btheir phone\b/i, description: "Find the person's phone number", format: "phone" },

  { pattern: /\b(?:find|get)\b.*\b(?:CEO|CTO|CFO|CMO|COO|founder|director|VP|head of)\b/i, description: "Find the person's full name and title", format: "text" },
  { pattern: /\bwho is\b.*\b(?:CEO|CTO|CFO|CMO|COO|founder)\b/i, description: "Find the person's full name and title", format: "text" },

  { pattern: /\b(?:find|get|include)\b.*\blinkedin\b/i, description: "Find the LinkedIn profile URL", format: "url" },

  { pattern: /\b(?:find|get|include)\b.*\bwebsite\b/i, description: "Find the company website URL", format: "url" },

  { pattern: /\b(?:find|get)\b.*\bfound(?:ed|ing)\b.*\b(?:year|date)\b/i, description: "Find the founding year", format: "number" },
  { pattern: /\bwhen\b.*\bfound(?:ed|ing)\b/i, description: "Find the founding year", format: "number" },

  { pattern: /\b(?:find|get)\b.*\b(?:employee|team size|company size|how (?:many|big))\b/i, description: "Find the estimated employee count", format: "number" },

  { pattern: /\b(?:find|get)\b.*\brevenue\b/i, description: "Find the estimated annual revenue", format: "text" },

  { pattern: /\b(?:find|get)\b.*\bfunding\b/i, description: "Find the total funding raised", format: "text" },
];

const COUNT_PATTERN = /\b(?:find|get|top)\s+(\d+)\b/i;

export function parseQuery(input: string): ParsedQuery {
  // Extract count if mentioned
  const countMatch = input.match(COUNT_PATTERN);
  const count = countMatch ? Math.min(20, Math.max(1, parseInt(countMatch[1]))) : 10;

  // Detect enrichments from the text
  const seen = new Set<string>();
  const enrichments: { description: string; format: string }[] = [];

  for (const { pattern, description, format } of ENRICHMENT_PATTERNS) {
    if (pattern.test(input) && !seen.has(description)) {
      seen.add(description);
      enrichments.push({ description, format });
    }
  }

  return {
    query: input.trim(),
    count,
    enrichments,
  };
}
