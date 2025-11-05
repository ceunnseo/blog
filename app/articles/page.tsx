import Link from "next/link";
import { queryNotionDB } from "@/lib/notion";
import { getTitle, getDateISO, toDisplayDate } from "@/lib/notion-utils";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";
import { isFullPage } from "@notionhq/client";
export const revalidate = 60;

type TitleRichText = { plain_text: string };
type TitleProperty = {
  id: string;
  type: "title";
  title: TitleRichText[];
};

type DateValue = {
  start: string | null;
  end?: string | null;
  time_zone?: string | null;
};
type DateProperty = {
  id: string;
  type: "date";
  date: DateValue | null;
};

const PROP_DATE = "날짜";
const PROP_OPEN_STATE = "공개여부";

export default async function ArticlesPage() {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const result = await queryNotionDB<
    PageObjectResponse | PartialPageObjectResponse
  >(databaseId, {
    filter: {
      property: PROP_OPEN_STATE,
      select: {
        equals: "공개", // '공개' 옵션으로 설정된 페이지만
      },
    },
    sorts: [{ property: PROP_DATE, direction: "descending" }],
  });
  const rows = result.filter(isFullPage);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 아티클</h1>
        <p className="text-gray-600">총 {rows.length}개의 글</p>
      </header>

      <div className="divide-y divide-gray-200">
        {rows.map((page) => {
          const title = getTitle(page.properties);
          const iso = getDateISO(page.properties);
          const display = toDisplayDate(iso);
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
                  {display}
                </time>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
