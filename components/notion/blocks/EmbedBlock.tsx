// components/notion/blocks/EmbedBlock.tsx
"use client";

import React from "react";
import type { EmbedBlockObjectResponse } from "@/components/notion/types";

export function EmbedBlock({ block }: { block: EmbedBlockObjectResponse }) {
  const url = block.embed.url;
  if (!url) return null;

  return (
    <div className="my-6">
      <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
        <iframe src={url} className="h-full w-full" />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 block text-sm text-blue-600 hover:underline"
      >
        열기
      </a>
    </div>
  );
}
