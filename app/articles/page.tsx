import Link from "next/link";
import { queryNotionDB } from "@/lib/notion";

type PostPage = {
  id: string;
  properties: Record<string, any>;
};

function getTitle(p: any) {
  return p?.["이름"]?.title?.[0]?.plain_text ?? "(untitled)";
}

function getDate(p: any) {
  const d = p?.["날짜"]?.date?.start;
  if (!d) return "알 수 없음";

  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export default async function ArticlesPage() {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const rows = await queryNotionDB<PostPage>(databaseId, {
    sorts: [{ property: "날짜", direction: "descending" }],
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 아티클</h1>
        <p className="text-gray-600">총 {rows.length}개의 글</p>
      </header>

      <div className="divide-y divide-gray-200">
        {rows.map((page) => {
          const title = getTitle(page.properties);
          const date = getDate(page.properties);
          return (
            <Link
              key={page.id}
              href={`/articles/${page.id}`}
              className="block py-6 hover:bg-gray-50 -mx-6 px-6 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors flex-1">
                  {title}
                </h2>
                <time className="text-sm text-gray-500 whitespace-nowrap font-mono">
                  {date}
                </time>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
