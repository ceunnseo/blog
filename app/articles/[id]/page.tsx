//개별 아티클 페이지
import { notFound } from "next/navigation";
import { getNotionPage, getNotionBlocks } from "@/lib/notion";

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
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}.${month}.${day}`;
}

// 블록 렌더링 함수 (간단한 예시)
function renderBlock(block: any) {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p key={id} className="mb-4">
          {value.rich_text.map((text: any) => text.plain_text).join("")}
        </p>
      );
    case "heading_1":
      return (
        <h1 key={id} className="text-3xl font-bold mb-4 mt-8">
          {value.rich_text.map((text: any) => text.plain_text).join("")}
        </h1>
      );
    case "heading_2":
      return (
        <h2 key={id} className="text-2xl font-bold mb-3 mt-6">
          {value.rich_text.map((text: any) => text.plain_text).join("")}
        </h2>
      );
    case "heading_3":
      return (
        <h3 key={id} className="text-xl font-bold mb-2 mt-4">
          {value.rich_text.map((text: any) => text.plain_text).join("")}
        </h3>
      );
    case "bulleted_list_item":
      return (
        <li key={id} className="ml-6 mb-2">
          {value.rich_text.map((text: any) => text.plain_text).join("")}
        </li>
      );
    case "code":
      return (
        <pre
          key={id}
          className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto"
        >
          <code>
            {value.rich_text.map((text: any) => text.plain_text).join("")}
          </code>
        </pre>
      );
    default:
      return null;
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    // 페이지 정보 가져오기
    const page = await getNotionPage(id);

    // 페이지 내용(블록) 가져오기
    const blocks = await getNotionBlocks(id);

    const title = getTitle(page.properties);
    const date = getDate(page.properties);

    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <article>
          <header className="mb-8 pb-8 border-b">
            <h1 className="text-4xl font-bold mb-3">{title}</h1>
            <p className="text-sm opacity-70">{date}</p>
          </header>

          <div className="prose prose-lg max-w-none">
            {blocks.map((block: any) => renderBlock(block))}
          </div>
        </article>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
