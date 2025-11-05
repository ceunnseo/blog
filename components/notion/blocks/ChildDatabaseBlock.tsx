// components/notion/blocks/ChildDatabaseBlock.tsx
"use client";

import React from "react";
import type { ChildDatabaseBlockObjectResponse } from "@/components/notion/types";

type Props = {
  block: ChildDatabaseBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function ChildDatabaseBlock({ block, childrenNodes }: Props) {
  const title = block.child_database.title;

  return (
    <div className="my-2">
      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <span>📚</span>
        <span className="font-medium">{title}</span>
      </span>
      {childrenNodes?.length ? (
        <div className="ml-6 mt-2">{childrenNodes}</div>
      ) : null}
    </div>
  );
}
