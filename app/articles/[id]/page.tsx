import { notFound } from "next/navigation";
import { getNotionPage, getNotionBlocks } from "@/lib/notion";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Toggle } from "@/components/Toggle";
import { Todo } from "@/components/Todo";
import { getTitle, getDateISO } from "@/lib/notion-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPlainText,
  renderRichText,
} from "@/components/notion/utils/rich-text";

import type {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
  ParagraphBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
  QuoteBlockObjectResponse,
  CalloutBlockObjectResponse,
  CodeBlockObjectResponse,
  DividerBlockObjectResponse,
  ImageBlockObjectResponse,
  VideoBlockObjectResponse,
  AudioBlockObjectResponse,
  PdfBlockObjectResponse,
  FileBlockObjectResponse,
  EmbedBlockObjectResponse,
  LinkPreviewBlockObjectResponse,
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
  SyncedBlockBlockObjectResponse,
  ChildPageBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  ColumnListBlockObjectResponse,
  ColumnBlockObjectResponse,
  TableOfContentsBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import {
  PageProps,
  BlockWithChildren,
  isFullBlock,
  assertNever,
  NotionFileLike,
} from "@/components/notion/types";
import React from "react";

// --- Types -----------------------------------------------------------------

/**
 * Our blocks come pre-expanded with optional children from getNotionBlocks().
 */
/*export type BlockWithChildren =
  | (BlockObjectResponse & { children?: BlockWithChildren[] })
  | (PartialBlockObjectResponse & { children?: BlockWithChildren[] });*/

/*export type PageProps = {
  params: { id: string };
};*/

// --- Rich text helpers ------------------------------------------------------

/*function renderRichText(
  richTextArray?: RichTextItemResponse[]
): React.ReactNode {
  if (!richTextArray || richTextArray.length === 0) return null;

  return (
    <>
      {richTextArray.map((rt, idx) => {
        const text = rt.plain_text ?? "";
        const { annotations, href } = rt;

        let element: React.ReactNode = text;

        // 링크
        if (href) {
          element = (
            <a key={`a-${idx}`} href={href} target="_blank" rel="noreferrer">
              {element}
            </a>
          );
        }

        // 코드 (인라인)
        if (annotations?.code) {
          element = (
            <code
              key={`code-${idx}`}
              className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono"
            >
              {element}
            </code>
          );
        }

        if (annotations?.bold) {
          element = (
            <strong key={`b-${idx}`} className="font-bold">
              {element}
            </strong>
          );
        }

        if (annotations?.italic) {
          element = (
            <em key={`i-${idx}`} className="italic">
              {element}
            </em>
          );
        }

        if (annotations?.strikethrough) {
          element = (
            <s key={`s-${idx}`} className="line-through">
              {element}
            </s>
          );
        }

        if (annotations?.underline) {
          element = (
            <u key={`u-${idx}`} className="underline">
              {element}
            </u>
          );
        }

        return <span key={rt.plain_text + idx}>{element}</span>;
      })}
    </>
  );
}*/

/*function getPlainText(richTextArray?: RichTextItemResponse[]): string {
  if (!richTextArray) return "";
  return richTextArray.map((rt) => rt.plain_text ?? "").join("");
}*/

// --- URL helpers for Notion file-like objects ------------------------------

function extractFileUrl(file: NotionFileLike): string {
  if (!file) return "";
  if (file.type === "external") return file.external?.url ?? "";
  if (file.type === "file") return file.file?.url ?? ""; // may be temporary
  return "";
}

// --- Children helper --------------------------------------------------------

function renderChildren(block: BlockWithChildren): React.ReactNode[] {
  if (!("children" in block) || !block.children || block.children.length === 0)
    return [];
  return block.children.map((child, idx) => renderBlock(child, idx));
}

// A best-effort heuristic: consider a table row "colored" when any cell has a background color.
function isColoredRow(row: TableRowBlockObjectResponse): boolean {
  return row.table_row.cells.some((cell) =>
    cell.some((rt) =>
      (rt.annotations?.color ?? "default").endsWith("_background")
    )
  );
}

// --- Block renderer ---------------------------------------------------------

function renderBlock(block: BlockWithChildren, index: number): React.ReactNode {
  if (!isFullBlock(block)) return null; // skip partials safely

  const { id, type } = block;

  switch (type) {
    case "paragraph": {
      const value = (block as ParagraphBlockObjectResponse).paragraph;
      const children = renderChildren(block);
      return (
        <div key={id}>
          <p className="mb-4 leading-7">{renderRichText(value.rich_text)}</p>
          {children.length > 0 && <div className="ml-6">{children}</div>}
        </div>
      );
    }

    case "heading_1": {
      const value = (block as Heading1BlockObjectResponse).heading_1;
      const children = renderChildren(block);
      return (
        <div key={id}>
          <h1 className="text-3xl font-bold mb-4 mt-8">
            {renderRichText(value.rich_text)}
          </h1>
          {children.length > 0 && <div className="ml-6">{children}</div>}
        </div>
      );
    }

    case "heading_2": {
      const value = (block as Heading2BlockObjectResponse).heading_2;
      const children = renderChildren(block);
      return (
        <div key={id}>
          <h2 className="text-2xl font-bold mb-3 mt-6">
            {renderRichText(value.rich_text)}
          </h2>
          {children.length > 0 && <div className="ml-6">{children}</div>}
        </div>
      );
    }

    case "heading_3": {
      const value = (block as Heading3BlockObjectResponse).heading_3;
      const children = renderChildren(block);
      return (
        <div key={id}>
          <h3 className="text-xl font-semibold mb-2 mt-4">
            {renderRichText(value.rich_text)}
          </h3>
          {children.length > 0 && <div className="ml-6">{children}</div>}
        </div>
      );
    }

    case "bulleted_list_item": {
      const value = (block as BulletedListItemBlockObjectResponse)
        .bulleted_list_item;
      const children = renderChildren(block);
      return (
        <li key={id} className="ml-6 mb-2 list-disc">
          {renderRichText(value.rich_text)}
          {children.length > 0 && <ul className="mt-2">{children}</ul>}
        </li>
      );
    }

    case "numbered_list_item": {
      const value = (block as NumberedListItemBlockObjectResponse)
        .numbered_list_item;
      const children = renderChildren(block);
      return (
        <li key={id} className="ml-6 mb-2 list-decimal">
          {renderRichText(value.rich_text)}
          {children.length > 0 && <ol className="mt-2">{children}</ol>}
        </li>
      );
    }

    case "to_do": {
      const value = (block as ToDoBlockObjectResponse).to_do;
      const checked = Boolean(value.checked);
      return (
        <Todo key={id} id={id} checked={checked}>
          {renderRichText(value.rich_text)}
        </Todo>
      );
    }

    case "toggle": {
      const value = (block as ToggleBlockObjectResponse).toggle;
      return (
        <Toggle key={id} id={id} summary={renderRichText(value.rich_text)}>
          {renderChildren(block)}
        </Toggle>
      );
    }

    case "quote": {
      const value = (block as QuoteBlockObjectResponse).quote;
      const children = renderChildren(block);
      return (
        <div key={id}>
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-100 my-4">
            {renderRichText(value.rich_text)}
          </blockquote>
          {children.length > 0 && <div className="ml-6">{children}</div>}
        </div>
      );
    }

    case "callout": {
      const value = (block as CalloutBlockObjectResponse).callout;
      const icon = value.icon?.type === "emoji" ? value.icon.emoji : "💡";
      const children = renderChildren(block);
      return (
        <Callout key={id} id={id} icon={icon ?? "💡"}>
          <div className="space-y-2">
            {value.rich_text && value.rich_text.length > 0 && (
              <div>{renderRichText(value.rich_text)}</div>
            )}
            {children}
          </div>
        </Callout>
      );
    }

    case "code": {
      const value = (block as CodeBlockObjectResponse).code;
      const code = getPlainText(value.rich_text);
      const language = value.language ?? "plaintext";
      return <CodeBlock key={id} id={id} code={code} language={language} />;
    }

    case "divider": {
      (block as DividerBlockObjectResponse).divider; // type narrow for parity
      return <hr key={id} className="my-6 border-t border-gray-200" />;
    }

    case "image": {
      const value = (block as ImageBlockObjectResponse).image;
      const src = extractFileUrl(value);
      const caption = getPlainText(value.caption);
      if (!src) return null;
      return (
        <figure key={id} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption || "image"}
            className="rounded-xl border border-gray-200 w-full"
          />
          {caption && (
            <figcaption className="mt-2 text-sm text-gray-500 text-center">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "video": {
      const value = (block as VideoBlockObjectResponse).video;
      const src = extractFileUrl(value);
      const externalUrl =
        value.type === "external" ? value.external?.url : undefined;
      const url = src || externalUrl || "";

      if (!url) return null;

      const isYouTube = /youtube\.com|youtu\.be|\/embed\//.test(url);
      let embedSrc = url;
      if (isYouTube) {
        try {
          const u = new URL(url);
          const v = u.searchParams.get("v");
          embedSrc = url.includes("embed")
            ? url
            : `https://www.youtube.com/embed/${v ?? ""}`;
        } catch {
          // fallback: keep original url
        }
      }

      return (
        <div key={id} className="my-6">
          {isYouTube ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src={embedSrc}
                title="YouTube video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              controls
              src={url}
              className="w-full rounded-xl border border-gray-200"
            />
          )}
        </div>
      );
    }

    case "audio": {
      const value = (block as AudioBlockObjectResponse).audio;
      const src = extractFileUrl(value);
      if (!src) return null;
      return (
        <div key={id} className="my-4">
          <audio controls src={src} className="w-full" />
        </div>
      );
    }

    case "pdf": {
      const value = (block as PdfBlockObjectResponse).pdf;
      const url = extractFileUrl(value);
      const caption = getPlainText(value.caption);
      if (!url) return null;
      return (
        <figure key={id} className="my-6">
          <iframe
            src={url}
            className="w-full h-[70vh] rounded-xl border border-gray-200"
          />
          {caption && (
            <figcaption className="mt-2 text-sm text-gray-500 text-center">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "embed": {
      const value = (block as EmbedBlockObjectResponse).embed;
      const url = value.url;
      if (!url) return null;
      return (
        <div key={id} className="my-6">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
            <iframe src={url} className="h-full w-full" />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            열기
          </a>
        </div>
      );
    }

    case "link_preview": {
      const value = (block as LinkPreviewBlockObjectResponse).link_preview;
      const url = value.url;
      if (!url) return null;
      return (
        <a
          key={id}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block my-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="text-blue-600">{url}</span>
        </a>
      );
    }

    case "file": {
      const value = (block as FileBlockObjectResponse).file;
      const url = extractFileUrl(value);
      const name =
        value.type === "file"
          ? value.file?.expiry_time
            ? "파일"
            : "파일"
          : "파일"; // name is not exposed; keep label generic
      const caption = getPlainText(value.caption);
      if (!url) return null;
      return (
        <div key={id} className="my-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-blue-600">{name}</span>
          </a>
          {caption && (
            <div className="text-sm text-gray-500 mt-2">{caption}</div>
          )}
        </div>
      );
    }

    case "table": {
      const value = (block as TableBlockObjectResponse).table;
      const hasColumnHeader = value.has_column_header;
      const hasRowHeader = value.has_row_header;

      // Children include table_row blocks
      const rows = (block.children ?? []).filter(
        (b): b is BlockObjectResponse & TableRowBlockObjectResponse =>
          isFullBlock(b) && b.type === "table_row"
      );

      if (rows.length === 0) return null;

      // Heuristic: treat the first consecutive colored rows at the top as header rows if table.has_column_header is false.
      let headerRowCount = 0;
      if (!hasColumnHeader) {
        for (let i = 0; i < rows.length; i++) {
          if (isColoredRow(rows[i])) headerRowCount++;
          else break;
        }
      }

      const finalHeaderCount = hasColumnHeader ? 1 : headerRowCount;

      return (
        <div key={id} className="my-6">
          <Table>
            {finalHeaderCount > 0 && (
              <TableHeader>
                {rows.slice(0, finalHeaderCount).map((row) => (
                  <TableRow key={row.id}>
                    {row.table_row.cells.map((cell, cellIdx) => (
                      <TableHead key={`${row.id}-${cellIdx}`}>
                        {renderRichText(cell)}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody>
              {rows.slice(finalHeaderCount).map((row) => {
                const cells = row.table_row.cells;
                const rowIsColored = isColoredRow(row);

                return (
                  <TableRow key={row.id}>
                    {cells.map((cell, cellIdx) => {
                      const asHeader =
                        (hasRowHeader && cellIdx === 0) || rowIsColored;
                      return asHeader ? (
                        <TableHead key={`${row.id}-${cellIdx}`}>
                          {renderRichText(cell)}
                        </TableHead>
                      ) : (
                        <TableCell key={`${row.id}-${cellIdx}`}>
                          {renderRichText(cell)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    case "table_row": {
      // handled within table
      (block as TableRowBlockObjectResponse).table_row;
      return null;
    }

    case "table_of_contents": {
      (block as TableOfContentsBlockObjectResponse).table_of_contents;
      return (
        <nav
          key={id}
          className="my-6 p-4 rounded-xl border border-gray-200 bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">
            Table of contents
          </span>
        </nav>
      );
    }

    case "synced_block": {
      (block as SyncedBlockBlockObjectResponse).synced_block;
      return (
        <div key={id} className="my-4">
          {renderChildren(block)}
        </div>
      );
    }

    case "child_page": {
      const value = (block as ChildPageBlockObjectResponse).child_page;
      return (
        <div key={id} className="my-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <span>📄</span>
            <span className="font-medium">{value.title}</span>
          </span>
          {renderChildren(block).length > 0 && (
            <div className="ml-6 mt-2">{renderChildren(block)}</div>
          )}
        </div>
      );
    }

    case "child_database": {
      const value = (block as ChildDatabaseBlockObjectResponse).child_database;
      return (
        <div key={id} className="my-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <span>📚</span>
            <span className="font-medium">{value.title}</span>
          </span>
          {renderChildren(block).length > 0 && (
            <div className="ml-6 mt-2">{renderChildren(block)}</div>
          )}
        </div>
      );
    }

    case "column_list": {
      (block as ColumnListBlockObjectResponse).column_list;
      return (
        <div key={id} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {renderChildren(block)}
        </div>
      );
    }

    case "column": {
      (block as ColumnBlockObjectResponse).column;
      return (
        <div key={id} className="space-y-2">
          {renderChildren(block)}
        </div>
      );
    }

    default: {
      // If a new Notion block type appears, surface it during development
      assertNever(type as never);
      return null;
    }
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;

  let page: PageObjectResponse;
  let blocks: BlockWithChildren[] = [];

  try {
    page = (await getNotionPage(id)) as PageObjectResponse;
    blocks = (await getNotionBlocks(id)) as BlockWithChildren[];
  } catch (error) {
    // If fetching fails or page is not found
    notFound();
  }

  // Type guards ensure we only proceed when page exists
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

        <div className="prose prose-lg max-w-none">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </article>
    </main>
  );
}
