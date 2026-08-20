import getExa from "@/lib/exa";
import type { CreateWebsetRequest } from "@/lib/types";
import type { CreateEnrichmentParameters } from "exa-js";

export async function POST(request: Request) {
  try {
    const body: CreateWebsetRequest = await request.json();

    if (!body.query?.trim()) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    const enrichments: CreateEnrichmentParameters[] | undefined =
      body.enrichments
        ?.filter((e) => e.description.trim())
        .map((e) => ({
          description: e.description,
          format: e.format as CreateEnrichmentParameters["format"],
        }));

    const webset = await getExa().websets.create({
      search: {
        query: body.query,
        count: body.count || 20,
        criteria: body.criteria,
        entity: body.entity as { type: "company" } | { type: "person" } | undefined,
      },
      enrichments: enrichments?.length ? enrichments : undefined,
    });

    return Response.json({ id: webset.id, status: webset.status }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create webset";
    return Response.json({ error: message }, { status: 500 });
  }
}
