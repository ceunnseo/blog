// notion API 호출
import { queryNotionDB } from "@/lib/notion";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";
import { isFullPage } from "@notionhq/client";
import { getTitle, getDateISO, toDisplayDate } from "@/lib/notion-utils";
import Link from "next/link";
import ThreeHero from "@/components/ThreeHero";

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
    <>
      {/* Three.js Hero Section */}
      <ThreeHero />

      {/* Content Section - appears after scrolling */}
      <main
        className="relative z-20 mt-[200vh] min-h-screen flex flex-col justify-center items-center"
        style={{
          opacity: 0,
          transform: "translateY(40px)",
          transition: "opacity 0.8s, transform 0.8s",
        }}
      >
        <div className="mx-auto max-w-2xl px-12 py-20 text-center text-white">
          {/* 소개 섹션 */}
          <section className="mb-16">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Creative Developer & Designer
            </h1>
            <p className="text-lg opacity-80 leading-relaxed">
              안녕하세요. 저는{" "}
              <span className="inline-block px-2 py-1 bg-white/10 rounded font-medium">
                CEUNNSEO
              </span>
              입니다. 인터랙티브 웹 경험과 창의적인 디지털 솔루션을 만듭니다.
            </p>
            <p className="text-lg opacity-80 leading-relaxed mt-6">
              Three.js, WebGL, 그리고 최신 웹 기술을 활용하여 사용자에게 기억에
              남는 경험을 제공합니다.
            </p>
            <p className="text-lg opacity-80 leading-relaxed mt-6">
              스크롤을 통해 여정을 함께해주셔서 감사합니다.
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
              <p className="text-sm opacity-70">
                아직 게시된 아티클이 없습니다.
              </p>
            ) : (
              <div className="divide-y divide-white/20">
                {rows.map((page) => {
                  const title = getTitle(page.properties);
                  const iso = getDateISO(page.properties);
                  const display = toDisplayDate(iso);
                  return (
                    <Link
                      key={page.id}
                      href={`/articles/${page.id}`}
                      className="block py-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-base font-normal hover:text-blue-400 transition-colors">
                          {title}
                        </h3>
                        <time
                          className="text-sm opacity-50 whitespace-nowrap"
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
        </div>
      </main>
    </>
  );
}
