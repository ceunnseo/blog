import { notFound } from "next/navigation";
import { getNotionPage, getNotionBlocks, queryNotionDB } from "@/lib/notion";
import { getTitle, getDateISO } from "@/lib/notion-utils";
import { NotionBlockRenderer } from "@/components/notion/NotionBlockRenderer";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { PageProps, BlockWithChildren } from "@/components/notion/types";
import React from "react";
import { isFullPage } from "@notionhq/client";

// ISR 설정: 60초마다 재검증
export const revalidate = 60;

// 새로운 페이지도 런타임에 생성 가능하도록 설정
export const dynamicParams = true;

// 빌드 타임에 공개된 모든 아티클 페이지를 정적으로 생성
export async function generateStaticParams() {
  const databaseId = process.env.NOTION_DATABASE_ID!;

  try {
    const result = await queryNotionDB(databaseId, {
      filter: {
        property: "공개여부",
        select: {
          equals: "공개",
        },
      },
    });

    const pages = result.filter(isFullPage);

    return pages.map((page) => ({
      id: page.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;

  let page: PageObjectResponse | undefined;
  let blocks: BlockWithChildren[] = [];

  try {
    page = (await getNotionPage(id)) as PageObjectResponse;
    blocks = (await getNotionBlocks(id)) as BlockWithChildren[];
  } catch (error: unknown) {
    notFound();
  }

  if (!page) notFound();

  const title = getTitle(page.properties);
  const date = getDateISO(page.properties);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <article>
        <header className="mb-12 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">{title}</h1>
          <time className="text-sm text-gray-500 font-mono">{date}</time>
        </header>

        <NotionBlockRenderer blocks={blocks} />
      </article>
    </main>
  );
}
