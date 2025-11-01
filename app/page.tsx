// app/posts/page.tsx
import { queryNotionDB } from "@/lib/notion";
import Link from "next/link";

type PostPage = {
  id: string;
  properties: Record<string, any>;
};

//Notion post의 title 추출하기
function getTitle(p: any) {
  const t = p?.["이름"]?.title?.[0]?.plain_text ?? "(untitled)";
  return t;
}

//Notion post의 date 추출하기
function getDate(p) {
  const d = p?.["날짜"]?.date?.start;
  if (!d) return "알 수 없음";

  const date = new Date(d);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS는 0부터 시작
  const day = date.getDate();

  return `${year}.${month}.${day}`;
}

export default async function Home() {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const rows = await queryNotionDB<PostPage>(databaseId, {
    filter: {
      property: "Published",
      checkbox: { equals: true },
    },
    sorts: [{ property: "날짜", direction: "descending" }],
    page_size: 5,
  });

  return (
    <main className="mx-auto max-w-2xl py-10">
      {/* 소개 섹션 */}
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-4">안녕하세요 👋</h1>
        <p className="text-lg opacity-80 leading-relaxed">
          개발과 기술에 대한 생각을 기록하는 공간입니다.
          <br />
          배운 것들을 정리하고 공유합니다.
        </p>
      </section>
      {/*<h1 className="text-2xl font-semibold mb-6">My Posts</h1>
      <ul className="space-y-4">
        {rows.map((page) => {
          const title = getTitle(page.properties);
          const date = getDate(page.properties);
          return (
            <li key={page.id} className="border rounded-lg p-4">
              <h2 className="text-lg font-medium">{title}</h2>
              {date && <p className="text-sm opacity-70">{date}</p>}
            </li>
          );
        })}
      </ul>*/}
      {/* 최신 글 섹션 */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">최신 글</h2>
          <Link
            href="/articles"
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            전체보기 →
          </Link>
        </div>
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
                  <h3 className="text-lg font-medium mb-1">{title}</h3>
                  <p className="text-sm opacity-70">{date}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
