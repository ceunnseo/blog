// notion API 호출
import { queryNotionDB } from "@/lib/notion";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";
import { isFullPage } from "@notionhq/client";
import { getTitle, getDateISO, toDisplayDate } from "@/lib/notion-utils";
import Link from "next/link";

// ISR: 1분
export const revalidate = 60;

const PROP_TITLE = "이름";
const PROP_DATE = "날짜";
const PROP_OPEN_STATE = "공개여부";

export default async function Home() {
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
    page_size: 5,
    sorts: [{ property: PROP_DATE, direction: "descending" }],
  });

  // properties 없는 partial 페이지 제거
  const rows = result.filter(isFullPage); // PageObjectResponse[]

  return (
    <main className="mx-auto max-w-2xl py-10">
      {/* 소개 섹션 */}
      <section className="mb-16">
        <h2 className="sr-only">소개</h2>
        <p className="text-lg opacity-80 leading-relaxed">
          개발과 기술에 대한 생각과 배움을 꾸준히 기록하고 있습니다. 나를 위해
          기록하고, 남을 위해 공유합니다. 더 많은 지식이 순환되고, 함께 성장할
          수 있는 선한 영향력을 만들어가고자 합니다.
        </p>
        <p className="text-lg opacity-80 leading-relaxed mt-6">
          생각을 깊게 하는 습관을 기르고 있습니다. 영화를 볼 때에도
          &#39;재미있다&#39;, &#39;재미없다&#39;의 감상을 넘어 왜 이러한 감각을
          느꼈는지, 어떤 부분에서 그렇게 생각했는지를 생각해봅니다. 개발 역시
          단순히 받아들이지 않고 철학을 이해하며 더 깊게 바라보려 노력합니다.
        </p>
        <p className="text-lg opacity-80 leading-relaxed mt-6">
          기술은 문제를 해결하기 위한 수단이지 목적이 되어서는 안 된다는
          가치관을 가지고 있습니다. 문제 해결을 위해 필요한 기술이라면 거부감
          없이 배우고 더 나은 해결책을 찾기 위해 노력합니다.
        </p>
        <p className="text-lg opacity-80 leading-relaxed mt-6">
          함께의 성장을 중요하게 생각합니다. 다양한 멘토링 활동을 통해 경험을
          나누고 열정을 공유하며 함께 성장할 수 있는 환경을 만들어 갑니다.
          서로의 배움을 통해 더 큰 성장을 이끌어내는 것이 제가 추구하는 개발
          문화입니다.
        </p>
      </section>

      {/* 최신 글 섹션 */}
      <section aria-labelledby="latest-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="latest-heading" className="text-lg font-semibold">
            최신 아티클
          </h2>
          <Link
            href="/articles"
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            전체보기 →
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm opacity-70">아직 게시된 아티클이 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {rows.map((page) => {
              const title = getTitle(page.properties);
              const iso = getDateISO(page.properties);
              const display = toDisplayDate(iso);
              return (
                <Link
                  key={page.id}
                  href={`/articles/${page.id}`}
                  className="block py-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-normal text-gray-900 hover:text-blue-600 transition-colors">
                      {title}
                    </h3>
                    <time
                      className="text-sm text-gray-500 whitespace-nowrap"
                      dateTime={iso}
                    >
                      {display}
                    </time>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
