// components/notion/blocks/LinkPreviewBlock.tsx
"use client";

import React from "react";
import type { LinkPreviewBlockObjectResponse } from "@/components/notion/types";

export function LinkPreviewBlock({
  block,
}: {
  block: LinkPreviewBlockObjectResponse;
}) {
  const url = block.link_preview.url;
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block my-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <span className="text-blue-600">{url}</span>
    </a>
  );
}
