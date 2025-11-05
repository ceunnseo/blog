// components/notion/blocks/FileBlock.tsx
"use client";

import React from "react";
import type { FileBlockObjectResponse } from "@/components/notion/types";
import { extractFileUrl } from "@/components/notion/utils/file-url";
import { getPlainText } from "@/components/notion/utils/rich-text";

function deriveDisplayName(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(last) || "파일";
  } catch {
    return "파일";
  }
}

export function FileBlock({ block }: { block: FileBlockObjectResponse }) {
  const v = block.file;
  const url = extractFileUrl(v);
  const caption = getPlainText(v.caption);
  if (!url) return null;

  const displayName = deriveDisplayName(url);

  return (
    <div className="my-4">
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-blue-600">{displayName}</span>
      </a>
      {caption && <div className="text-sm text-gray-500 mt-2">{caption}</div>}
    </div>
  );
}
