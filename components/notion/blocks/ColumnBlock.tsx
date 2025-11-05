// components/notion/blocks/ColumnBlock.tsx
"use client";

import React from "react";
import type { ColumnBlockObjectResponse } from "@/components/notion/types";

type Props = {
  block: ColumnBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function ColumnBlock({ childrenNodes }: Props) {
  return <div className="space-y-2">{childrenNodes}</div>;
}
