// components/notion/blocks/TableOfContentsBlock.tsx
"use client";

import React from "react";
import type { TableOfContentsBlockObjectResponse } from "@/components/notion/types";

export function TableOfContentsBlock({
  block,
}: {
  block: TableOfContentsBlockObjectResponse;
}) {
  // 현재는 실제 앵커 목록을 구성하지 않고, 프레임만 제공.
  // 추후 heading 수집 로직을 추가해 목차 링크 생성 가능.
  return (
    <nav className="my-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
      <span className="text-sm font-medium text-gray-700">
        Table of contents
      </span>
    </nav>
  );
}
