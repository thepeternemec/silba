import getExa from "@/lib/exa";
import type { FlatItem, WebsetStatusResponse } from "@/lib/types";
import type { WebsetItem } from "exa-js";

function flattenItem(item: WebsetItem): FlatItem {
  const props = item.properties;
  const entityFields: Record<string, string | number | null> = {};

  if (props.type === "company") {
    entityFields.name = props.company.name;
    entityFields.industry = props.company.industry;
    entityFields.location = props.company.location;
    entityFields.employees = props.company.employees;
  } else if (props.type === "person") {
    entityFields.name = props.person.name;
    entityFields.position = props.person.position;
    entityFields.location = props.person.location;
    entityFields.company = props.person.company?.name ?? null;
  } else if (props.type === "article") {
    entityFields.title = props.article.title;
    entityFields.author = props.article.author;
    entityFields.publishedAt = props.article.publishedAt;
  } else if (props.type === "research_paper") {
    entityFields.title = props.researchPaper.title;
    entityFields.author = props.researchPaper.author;
    entityFields.publishedAt = props.researchPaper.publishedAt;
  } else if (props.type === "custom") {
    entityFields.title = props.custom.title;
    entityFields.author = props.custom.author;
  }

  return {
    id: item.id,
    url: props.url,
    description: props.description,
    entityType: props.type,
    entityFields,
    evaluations: item.evaluations.map((ev) => ({
      criterion: ev.criterion,
      satisfied: ev.satisfied,
      reasoning: ev.reasoning,
      references: ev.references,
    })),
    enrichments: (item.enrichments ?? []).map((en) => ({
      enrichmentId: en.enrichmentId,
      status: en.status,
      result: en.result,
    })),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exa = getExa();

    const webset = await exa.websets.get(id);

    // Paginate through all items (API returns max 100 per page)
    const allItems: WebsetItem[] = [];
    let cursor: string | undefined;
    do {
      const page = await exa.websets.items.list(id, { limit: 100, cursor });
      allItems.push(...page.data);
      cursor = page.hasMore ? (page.nextCursor ?? undefined) : undefined;
    } while (cursor);

    const search = webset.searches[0];
    const progress = search?.progress ?? { completion: 0, found: 0, analyzed: 0 };

    const response: WebsetStatusResponse = {
      id: webset.id,
      status: webset.status,
      title: webset.title,
      progress: {
        completion: progress.completion,
        found: progress.found,
        analyzed: progress.analyzed,
      },
      items: allItems.map(flattenItem),
      enrichmentDefs: webset.enrichments.map((e) => ({
        id: e.id,
        description: e.description,
        format: e.format,
      })),
    };

    return Response.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get webset";
    return Response.json({ error: message }, { status: 500 });
  }
}
