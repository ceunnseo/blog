// lib/notion.ts
import "server-only";

const NOTION_BASE = "https://api.notion.com/v1";

type QueryBody = {
  filter?: unknown;
  sorts?: Array<{ property?: string; direction?: "ascending" | "descending" }>;
  page_size?: number;
  start_cursor?: string | null;
};

export async function queryNotionDB<T = any>(
  databaseId: string,
  body: QueryBody = {}
): Promise<T[]> {
  const headers = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN!}`,
    "Notion-Version": process.env.NOTION_VERSION ?? "2025-09-03",
    "Content-Type": "application/json",
  };

  const results: T[] = [];
  let start_cursor: string | null | undefined = undefined;

  do {
    const res = await fetch(
      `${NOTION_BASE}/data_sources/2288e75d-9896-8070-a45e-000b183441b9/query`,
      {
        method: "POST",
        headers,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion query failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    console.log("data", data);
    results.push(...(data.results ?? []));
    start_cursor = data.has_more ? data.next_cursor : null;
  } while (start_cursor);

  return results;
}
