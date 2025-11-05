//개별 아티클 페이지
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

type PageProps = {
  params: { id: string };
};

type NotionRichText = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
};

// Rich Text를 파싱해서 강조/코드/링크 등을 처리
function renderRichText(
  richTextArray: NotionRichText[] | undefined
): React.ReactNode {
  if (!richTextArray || richTextArray.length === 0) return null;

  return (
    <>
      {richTextArray.map((rt, idx) => {
        const text = rt.plain_text || "";
        const annotations = rt.annotations || {};
        const href = rt.href;

        let element: any = text;

        // 링크
        if (href) {
          element = (
            <a key={idx} href={href} target="_blank" rel="noreferrer">
              {element}
            </a>
          );
        }

        // 코드 (인라인)
        if (annotations.code) {
          element = (
            <code
              key={idx}
              className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono"
            >
              {element}
            </code>
          );
        }

        // 볼드
        if (annotations.bold) {
          element = (
            <strong key={idx} className="font-bold">
              {element}
            </strong>
          );
        }

        // 이탤릭
        if (annotations.italic) {
          element = (
            <em key={idx} className="italic">
              {element}
            </em>
          );
        }

        // 취소선
        if (annotations.strikethrough) {
          element = (
            <s key={idx} className="line-through">
              {element}
            </s>
          );
        }

        // 밑줄
        if (annotations.underline) {
          element = (
            <u key={idx} className="underline">
              {element}
            </u>
          );
        }

        return <span key={idx}>{element}</span>;
      })}
    </>
  );
}

// 일반 텍스트만 추출 (fallback용)
function getPlainText(richTextArray: any[]): string {
  if (!richTextArray) return "";
  return richTextArray.map((rt) => rt.plain_text || "").join("");
}

// 파일 URL 추출
function getFileUrl(value: any): string {
  if (!value) return "";
  if (value.type === "external") return value.external?.url || "";
  if (value.type === "file") return value.file?.url || "";
  if (value.file?.url) return value.file.url;
  if (value.external?.url) return value.external.url;
  return "";
}

// 중첩된 자식 블록을 렌더링하는 헬퍼 함수
function renderChildren(block: any): React.ReactNode[] {
  if (!block.children || block.children.length === 0) return [];
  return block.children.map((child: any, idx: number) =>
    renderBlock(child, idx, block.children)
  );
}

// 블록 렌더링 함수
function renderBlock(block: any, index: number, allBlocks: any[]) {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph": {
      const children = renderChildren(block);
      return (
        <div key={id}>
          <p className="mb-4 leading-7">{renderRichText(value.rich_text)}</p>
          {children.length > 0 && <div className="ml-6">{children}</div>}
        </div>
      );
    }

    case "heading_1": {
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
      const children = renderChildren(block);
      return (
        <li key={id} className="ml-6 mb-2 list-disc">
          {renderRichText(value.rich_text)}
          {children.length > 0 && <ul className="mt-2">{children}</ul>}
        </li>
      );
    }

    case "numbered_list_item": {
      const children = renderChildren(block);
      return (
        <li key={id} className="ml-6 mb-2 list-decimal">
          {renderRichText(value.rich_text)}
          {children.length > 0 && <ol className="mt-2">{children}</ol>}
        </li>
      );
    }

    case "to_do": {
      const checked = Boolean(value.checked);
      return (
        <Todo key={id} id={id} checked={checked}>
          {renderRichText(value.rich_text)}
        </Todo>
      );
    }

    case "toggle":
      return (
        <Toggle key={id} id={id} summary={renderRichText(value.rich_text)}>
          {renderChildren(block)}
        </Toggle>
      );

    case "quote": {
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
      const icon = value.icon?.emoji || "💡";
      const children = renderChildren(block);
      return (
        <Callout key={id} id={id} icon={icon}>
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
      const code = getPlainText(value.rich_text);
      const language = value.language || "plaintext";
      return <CodeBlock key={id} id={id} code={code} language={language} />;
    }

    case "divider":
      return <hr key={id} className="my-6 border-t border-gray-200" />;

    case "image": {
      const src = getFileUrl(value);
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
      const src = getFileUrl(value);
      const externalUrl = value?.external?.url;
      const url = src || externalUrl || "";
      const isYouTube =
        /youtube\.com|youtu\.be/.test(url) || /\/embed\//.test(url);

      if (!url) return null;

      return (
        <div key={id} className="my-6">
          {isYouTube ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src={
                  url.includes("embed")
                    ? url
                    : `https://www.youtube.com/embed/${
                        new URL(url).searchParams.get("v") || ""
                      }`
                }
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
      const src = getFileUrl(value);
      if (!src) return null;
      return (
        <div key={id} className="my-4">
          <audio controls src={src} className="w-full" />
        </div>
      );
    }

    case "pdf": {
      const url = getFileUrl(value);
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
      const url = value?.url;
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
      const url = value?.url;
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
      const url = getFileUrl(value);
      const name = value?.name || "파일";
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
      // 테이블의 자식 블록들(table_row)을 수집
      const tableRows = block.children || [];
      const hasColumnHeader = value?.has_column_header || false;
      const hasRowHeader = value?.has_row_header || false;

      if (tableRows.length === 0) return null;

      // 색칠된 행을 감지하는 함수
      const isColoredRow = (row: any): boolean => {
        const color = row.table_row?.color;
        return (
          color &&
          color !== "default" &&
          (color.includes("_background") || color !== "default")
        );
      };

      // 각 열이 모두 색칠되어 있는지 확인 (열 헤더 감지)
      const columnCount = tableRows[0]?.table_row?.cells?.length || 0;
      const coloredColumns = new Set<number>();

      // 모든 행이 색칠되어 있는 열 찾기
      if (tableRows.length > 0 && !hasRowHeader) {
        for (let colIdx = 0; colIdx < columnCount; colIdx++) {
          const allRowsColored = tableRows.every((row: any) =>
            isColoredRow(row)
          );

          // 첫 번째 열이 모든 행에서 색칠되어 있으면 열 헤더로 간주
          if (colIdx === 0 && allRowsColored) {
            coloredColumns.add(colIdx);
          }
        }
      }

      // 헤더 행들을 수집 (처음부터 연속된 색칠된 행들)
      let headerRowCount = 0;
      if (!hasColumnHeader) {
        for (let i = 0; i < tableRows.length; i++) {
          if (isColoredRow(tableRows[i])) {
            headerRowCount++;
          } else {
            break;
          }
        }
      }

      const useColorAsHeader = headerRowCount > 0;
      const finalHeaderCount = hasColumnHeader
        ? 1
        : useColorAsHeader
        ? headerRowCount
        : 0;

      return (
        <div key={id} className="my-6">
          <Table>
            {finalHeaderCount > 0 && (
              <TableHeader>
                {tableRows.slice(0, finalHeaderCount).map((row: any) => (
                  <TableRow key={row.id}>
                    {row.table_row?.cells?.map(
                      (cell: any[], cellIdx: number) => (
                        <TableHead key={cellIdx}>
                          {renderRichText(cell)}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody>
              {tableRows
                .slice(finalHeaderCount)
                .map((row: any, rowIdx: number) => {
                  const cells = row.table_row?.cells || [];
                  const isRowColored = isColoredRow(row);

                  return (
                    <TableRow key={row.id || rowIdx}>
                      {cells.map((cell: any[], cellIdx: number) => {
                        // 열 헤더, 행 헤더, 또는 색칠된 행인 경우
                        if (
                          coloredColumns.has(cellIdx) ||
                          (hasRowHeader && cellIdx === 0) ||
                          isRowColored
                        ) {
                          return (
                            <TableHead key={cellIdx}>
                              {renderRichText(cell)}
                            </TableHead>
                          );
                        }
                        return (
                          <TableCell key={cellIdx}>
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

    case "table_row":
      // table_row는 table 블록 내에서 처리되므로 여기서는 null 반환
      return null;

    case "table_of_contents":
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

    case "synced_block": {
      const children = renderChildren(block);
      return (
        <div key={id} className="my-4">
          {children}
        </div>
      );
    }

    case "child_page": {
      const children = renderChildren(block);
      return (
        <div key={id} className="my-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <span>📄</span>
            <span className="font-medium">{value.title}</span>
          </span>
          {children.length > 0 && <div className="ml-6 mt-2">{children}</div>}
        </div>
      );
    }

    case "child_database": {
      const children = renderChildren(block);
      return (
        <div key={id} className="my-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <span>📚</span>
            <span className="font-medium">{value.title}</span>
          </span>
          {children.length > 0 && <div className="ml-6 mt-2">{children}</div>}
        </div>
      );
    }

    case "column_list": {
      const children = renderChildren(block);
      return (
        <div key={id} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {children}
        </div>
      );
    }

    case "column": {
      const children = renderChildren(block);
      return (
        <div key={id} className="space-y-2">
          {children}
        </div>
      );
    }

    default:
      return null;
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  let page: any;
  let blocks: any[];

  try {
    page = await getNotionPage(id);
    blocks = await getNotionBlocks(id);
  } catch (error) {
    notFound();
  }
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
          {blocks.map((block: any, index: number) =>
            renderBlock(block, index, blocks)
          )}
        </div>
      </article>
    </main>
  );
}
