//전체 아티클 리스트
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
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}.${month}.${day}`;
}

export default async function ArticlesPage() {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const rows = await queryNotionDB<PostPage>(databaseId, {
    sorts: [{ property: "날짜", direction: "descending" }],
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">전체 아티클</h1>
      <ul className="space-y-4">
        {rows.map((page) => {
          const title = getTitle(page.properties);
          const date = getDate(page.properties);
          return (
            <li key={page.id}>
              <Link
                href={`/articles/${page.id}`}
                className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-medium mb-1">{title}</h2>
                <p className="text-sm opacity-70">{date}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
