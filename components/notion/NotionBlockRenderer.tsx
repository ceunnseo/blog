// components/notion/NotionBlockRenderer.tsx
import React from "react";
import type { BlockWithChildren } from "@/components/notion/types";
import { renderBlocks } from "./blocks";

export function NotionBlockRenderer({
  blocks,
}: {
  blocks: BlockWithChildren[];
}) {
  return (
    <div className="prose text-white prose-invert max-w-none">
      {renderBlocks(blocks)}
    </div>
  );
}
