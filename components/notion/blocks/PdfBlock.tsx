// components/notion/blocks/PdfBlock.tsx
"use client";

import React from "react";
import type { PdfBlockObjectResponse } from "@/components/notion/types";
import { extractFileUrl } from "@/components/notion/utils/file-url";
import { getPlainText } from "@/components/notion/utils/rich-text";

export function PdfBlock({ block }: { block: PdfBlockObjectResponse }) {
  const v = block.pdf;
  const url = extractFileUrl(v);
  const caption = getPlainText(v.caption);
  if (!url) return null;

  return (
    <figure className="my-6">
      <iframe
        src={url}
        className="w-full h-[70vh] rounded-xl border border-gray-200"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
