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

  const res = await fetch(
    `${NOTION_BASE}/data_sources/${process.env.NOTION_DATASOURCE_ID}/query`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.results ?? [];
}

// 개별 페이지 정보 가져오기
export async function getNotionPage(pageId: string) {
  const headers = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN!}`,
    "Notion-Version": process.env.NOTION_VERSION ?? "2025-09-03",
  };

  const res = await fetch(`${NOTION_BASE}/pages/${pageId}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch page: ${res.status} ${text}`);
  }
  console.log("getNotionPage", res);

  return res.json();
}

// 페이지 블록(내용) 가져오기
export async function getNotionBlocks(blockId: string) {
  const headers = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN!}`,
    "Notion-Version": process.env.NOTION_VERSION ?? "2025-09-03",
  };

  const results: any[] = [];
  let start_cursor: string | undefined = undefined;

  do {
    const url = new URL(`${NOTION_BASE}/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (start_cursor) {
      url.searchParams.set("start_cursor", start_cursor);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch blocks: ${res.status} ${text}`);
    }

    const data = await res.json();
    results.push(...(data.results ?? []));
    start_cursor = data.has_more ? data.next_cursor : undefined;
  } while (start_cursor);

  // children이 있는 블록들의 하위 블록도 재귀적으로 가져오기
  const blocksWithChildren = await Promise.all(
    results.map(async (block: any) => {
      if (block.has_children) {
        const children = await getNotionBlocks(block.id);
        return { ...block, children };
      }
      return block;
    })
  );

  return blocksWithChildren;
}
