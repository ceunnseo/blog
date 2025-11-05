// 상세 페이지 로딩
export default function LoadingPost() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* 제목 스켈레톤 */}
      <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 space-y-3">
        {/* 본문 스켈레톤 */}
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-9/12 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
