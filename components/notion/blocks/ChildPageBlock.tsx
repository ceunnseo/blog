// components/notion/blocks/ChildPageBlock.tsx
"use client";

import React from "react";
import type { ChildPageBlockObjectResponse } from "@/components/notion/types";

type Props = {
  block: ChildPageBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function ChildPageBlock({ block, childrenNodes }: Props) {
  const title = block.child_page.title;

  return (
    <div className="my-2">
      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <span>📄</span>
        <span className="font-medium">{title}</span>
      </span>
      {childrenNodes?.length ? (
        <div className="ml-6 mt-2">{childrenNodes}</div>
      ) : null}
    </div>
  );
}
