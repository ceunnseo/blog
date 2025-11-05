// components/notion/blocks/ColumnListBlock.tsx
"use client";

import React from "react";
import type { ColumnListBlockObjectResponse } from "@/components/notion/types";

type Props = {
  block: ColumnListBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function ColumnListBlock({ childrenNodes }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {childrenNodes}
    </div>
  );
}
