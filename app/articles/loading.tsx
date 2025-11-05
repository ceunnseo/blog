//전체 글 리스트 로딩
export default function LoadingArticles() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* 헤더 스켈레톤 */}
      <header className="mb-12">
        <div className="h-8 w-40 rounded bg-gray-200 animate-pulse mb-3" />
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      </header>

      {/* 리스트 스켈레톤 */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="py-6 -mx-6 px-6 transition-colors"
            aria-hidden="true"
          >
            <div className="flex items-baseline justify-between gap-6">
              {/* 제목 자리 */}
              <div className="flex-1">
                <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse mb-2" />
                <div className="h-5 w-1/2 rounded bg-gray-200 animate-pulse" />
              </div>
              {/* 날짜 자리 */}
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
