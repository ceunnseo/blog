//개별 아티클 페이지

import { notFound } from "next/navigation";
import { getNotionPage, getNotionBlocks } from "@/lib/notion";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Toggle } from "@/components/Toggle";
import { Todo } from "@/components/Todo";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getTitle(properties: any) {
  return properties?.["이름"]?.title?.[0]?.plain_text ?? "(untitled)";
}

function getDate(properties: any) {
  const d = properties?.["날짜"]?.date?.start;
  if (!d) return "알 수 없음";

  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

// Rich Text를 파싱해서 강조/코드/링크 등을 처리
function renderRichText(richTextArray: any[]) {
  if (!richTextArray || richTextArray.length === 0) return "";

  return richTextArray.map((rt, idx) => {
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
  });
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

// 블록 렌더링 함수
function renderBlock(block: any) {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p key={id} className="mb-4 leading-7">
          {renderRichText(value.rich_text)}
        </p>
      );

    case "heading_1":
      return (
        <h1 key={id} className="text-3xl font-bold mb-4 mt-8">
          {renderRichText(value.rich_text)}
        </h1>
      );

    case "heading_2":
      return (
        <h2 key={id} className="text-2xl font-bold mb-3 mt-6">
          {renderRichText(value.rich_text)}
        </h2>
      );

    case "heading_3":
      return (
        <h3 key={id} className="text-xl font-semibold mb-2 mt-4">
          {renderRichText(value.rich_text)}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li key={id} className="ml-6 mb-2 list-disc">
          {renderRichText(value.rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li key={id} className="ml-6 mb-2 list-decimal">
          {renderRichText(value.rich_text)}
        </li>
      );

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
          {block.children?.map((child: any) => renderBlock(child))}
        </Toggle>
      );

    case "quote":
      return (
        <blockquote
          key={id}
          className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-100 my-4"
        >
          {renderRichText(value.rich_text)}
        </blockquote>
      );

    case "callout": {
      const icon = value.icon?.emoji || "💡";
      return (
        <Callout key={id} id={id} icon={icon}>
          {renderRichText(value.rich_text)}
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

    case "table":
      return (
        <div key={id} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-xl">
            <tbody />
          </table>
        </div>
      );

    case "table_row": {
      const cells: any[][] = value?.cells || [];
      return (
        <tr key={id} className="border-b border-gray-200 last:border-b-0">
          {cells.map((cell, i) => (
            <td
              key={i}
              className="p-3 border-r border-gray-200 last:border-r-0"
            >
              {getPlainText(cell)}
            </td>
          ))}
        </tr>
      );
    }

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

    case "synced_block":
      return <div key={id} className="my-4" />;

    case "child_page":
      return (
        <div key={id} className="my-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <span>📄</span>
            <span className="font-medium">{value.title}</span>
          </span>
        </div>
      );

    case "child_database":
      return (
        <div key={id} className="my-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <span>📚</span>
            <span className="font-medium">{value.title}</span>
          </span>
        </div>
      );

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
  const date = getDate(page.properties);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <article>
        <header className="mb-12 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">{title}</h1>
          <time className="text-sm text-gray-500 font-mono">{date}</time>
        </header>

        <div className="prose prose-lg max-w-none">
          {blocks.map((block: any) => renderBlock(block))}
        </div>
      </article>
    </main>
  );
}
