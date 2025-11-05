// components/notion/blocks/VideoBlock.tsx
"use client";

import React from "react";
import type { VideoBlockObjectResponse } from "@/components/notion/types";
import { extractFileUrl } from "@/components/notion/utils/file-url";

export function VideoBlock({ block }: { block: VideoBlockObjectResponse }) {
  const v = block.video;
  const src = extractFileUrl(v);
  const externalUrl = v.type === "external" ? v.external?.url : undefined;
  const url = src || externalUrl || "";
  if (!url) return null;

  const isYouTube = /youtube\.com|youtu\.be|\/embed\//.test(url);
  let embedSrc = url;
  if (isYouTube) {
    try {
      const u = new URL(url);
      const vid = u.searchParams.get("v");
      embedSrc = url.includes("embed")
        ? url
        : `https://www.youtube.com/embed/${vid ?? ""}`;
    } catch {
      // noop
    }
  }

  return (
    <div className="my-6">
      {isYouTube ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
          <iframe
            src={embedSrc}
            title="YouTube video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          controls
          src={url}
          className="w-full rounded-xl border border-gray-200"
        />
      )}
    </div>
  );
}
