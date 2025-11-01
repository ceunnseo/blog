// app/posts/page.tsx
import { queryNotionDB } from "@/lib/notion";

type PostPage = {
  id: string;
  properties: Record<string, any>;
};

function getTitle(p: any) {
  // Notion 'Title' 속성 예시
  const t = p?.["이름"]?.title?.[0]?.plain_text ?? "(untitled!)";
  return t;
}

function getDate(p: any) {
  return p?.Date?.date?.start ?? null;
}

export default async function Home() {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const rows = await queryNotionDB<PostPage>(databaseId, {
    filter: {
      property: "Published",
      checkbox: { equals: true },
      created_time: {
        on_or_after: new Date("2025-10-01"),
      },
    },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return (
    <main className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-semibold mb-6">My Posts</h1>
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
      </ul>
    </main>
  );
}
