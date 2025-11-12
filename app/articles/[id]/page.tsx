import { notFound } from "next/navigation";
import { getNotionPage, getNotionBlocks } from "@/lib/notion";
import { getTitle, getDateISO } from "@/lib/notion-utils";
import { NotionBlockRenderer } from "@/components/notion/NotionBlockRenderer";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { PageProps, BlockWithChildren } from "@/components/notion/types";
import React from "react";

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
        <header className="mb-12 pb-8 border-b border-gray-700">
          <h1 className="text-4xl font-bold mb-3 text-white">{title}</h1>
          <time className="text-sm text-gray-400 font-mono">{date}</time>
        </header>

        <NotionBlockRenderer blocks={blocks} />
      </article>
    </main>
  );
}
