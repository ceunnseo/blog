// components/notion/blocks/ImageBlock.tsx
import React from "react";
import type { ImageBlockObjectResponse } from "@/components/notion/types";
import { extractFileUrl } from "@/components/notion/utils/file-url";
import { getPlainText } from "@/components/notion/utils/rich-text";

export function ImageBlock({ block }: { block: ImageBlockObjectResponse }) {
  const v = block.image;
  const src = extractFileUrl(v);
  const caption = getPlainText(v.caption);
  if (!src) return null;

  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption || "image"}
        className="rounded-xl border border-gray-200 w-full"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
