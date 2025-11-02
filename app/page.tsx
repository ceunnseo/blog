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
    page_size: 5,
    sorts: [{ property: "날짜", direction: "descending" }],
  });
  console.log("rows", rows);

  return (
    <main className="mx-auto max-w-2xl py-10">
      {/* 소개 섹션 */}
      <section className="mb-16">
        <p className="text-lg opacity-80 leading-relaxed">
          개발과 기술에 대한 생각과 배움을 꾸준히 기록하고 있습니다. 나를 위해
          기록하고, 남을 위해 공유합니다. 더 많은 지식이 순환되고, 함께 성장할
          수 있는 선한 영향력을 만들어가고자 합니다.
        </p>
        <p className="text-lg opacity-80 leading-relaxed mt-6">
          생각을 깊게 하는 습관을 기르고 있습니다. 영화를 볼 때에도 '재미있다',
          '재미없다'의 단편적인 생각을 넘어 왜 이러한 감정을 느꼈는지, 어떤
          부분에서 그렇게 생각했는지를 생각해봅니다. 개발 역시 단순히 받아들이지
          않고 철학을 이해하며 더 깊게 바라보려 노력합니다.
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
      <section>
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg font-semibold">최신 아티클</p>
          <Link
            href="/articles"
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            전체보기 →
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {rows.map((page) => {
            const title = getTitle(page.properties);
            const date = getDate(page.properties);
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
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {date}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
