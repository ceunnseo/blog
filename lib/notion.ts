// lib/notion.ts
import "server-only";

const NOTION_BASE = "https://api.notion.com/v1";

// Notion 타입만 import (REST fetch 그대로 써도 OK)
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  ListBlockChildrenResponse,
  GetPageResponse,
} from "@notionhq/client/build/src/api-endpoints";

// 재귀를 위해 children 필드를 추가한 확장 타입
export type BlockWithChildren = BlockObjectResponse & {
  children?: BlockWithChildren[];
};

type QueryBody = {
  filter?: unknown;
  sorts?: Array<{ property?: string; direction?: "ascending" | "descending" }>;
  page_size?: number;
  start_cursor?: string | null;
};

// any 대신 unknown을 기본으로
export async function queryNotionDB<T = unknown>(
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
    { method: "POST", headers, body: JSON.stringify(body) }
  );

  if (!res.ok) {
    throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  }

  // 결과 스키마가 유동적이므로 먼저 unknown으로 받고 안전하게 꺼냄
  const data: unknown = await res.json();
  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: T[] }).results;
  }
  return [];
}

// 페이지(객체) 가져오기: SDK의 GetPageResponse 사용
export async function getNotionPage(pageId: string): Promise<GetPageResponse> {
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

  const data: GetPageResponse = await res.json();
  return data;
}

// --- 블록 children 목록 타입 가드 & 헬퍼 ---

// PartialBlockObjectResponse(unsupported) 제외하고 BlockObjectResponse로 좁히기
function isBlockObjectResponse(
  b: BlockObjectResponse | PartialBlockObjectResponse
): b is BlockObjectResponse {
  return b.type !== "unsupported";
}

type ListChildrenPayload = {
  results: Array<BlockObjectResponse | PartialBlockObjectResponse>;
  has_more: boolean;
  next_cursor: string | null;
};

// REST 응답을 안전하게 해석
function toListChildrenPayload(data: unknown): ListChildrenPayload {
  const fallback: ListChildrenPayload = {
    results: [],
    has_more: false,
    next_cursor: null,
  };

  if (typeof data !== "object" || data === null) return fallback;

  const anyObj = data as Record<string, unknown>;
  const results = Array.isArray(anyObj.results)
    ? (anyObj.results as Array<unknown>)
    : [];
  const has_more =
    typeof anyObj.has_more === "boolean" ? anyObj.has_more : false;
  const next_cursor =
    typeof anyObj.next_cursor === "string" ? anyObj.next_cursor : null;

  // 각 요소가 최소한 block-like인지 체크 (SDK 타입을 완벽히 런타임 보장하기는 어렵지만,
  // object === 'block' 구조만 필터링)
  const typed = results.filter(
    (r): r is BlockObjectResponse | PartialBlockObjectResponse =>
      typeof r === "object" &&
      r !== null &&
      (r as { object?: string }).object === "block"
  );

  return { results: typed, has_more, next_cursor };
}

// 페이지 블록(내용) 가져오기 — 재귀 + 엄격 타입
export async function getNotionBlocks(
  blockId: string
): Promise<BlockWithChildren[]> {
  const headers = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN!}`,
    "Notion-Version": process.env.NOTION_VERSION ?? "2025-09-03",
  };

  const results: BlockObjectResponse[] = [];
  let start_cursor: string | null = null;

  do {
    const url = new URL(`${NOTION_BASE}/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (start_cursor) url.searchParams.set("start_cursor", start_cursor);

    const res = await fetch(url.toString(), { method: "GET", headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch blocks: ${res.status} ${text}`);
    }

    const raw: unknown = await res.json();

    // Notion SDK의 ListBlockChildrenResponse에 맞춰 안전 변환
    const {
      results: pageResults,
      has_more,
      next_cursor,
    } = toListChildrenPayload(raw);
    // unsupported 제외
    const fullBlocks = pageResults.filter(isBlockObjectResponse);

    results.push(...fullBlocks);
    start_cursor = has_more ? next_cursor : null;
  } while (start_cursor);

  // children 재귀 수집
  const withChildren: BlockWithChildren[] = await Promise.all(
    results.map(async (block): Promise<BlockWithChildren> => {
      if (block.has_children) {
        const children = await getNotionBlocks(block.id);
        return { ...block, children };
      }
      return block;
    })
  );

  return withChildren;
}
