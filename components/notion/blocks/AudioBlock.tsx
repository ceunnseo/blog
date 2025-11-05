// components/notion/blocks/AudioBlock.tsx
"use client";

import React from "react";
import type { AudioBlockObjectResponse } from "@/components/notion/types";
import { extractFileUrl } from "@/components/notion/utils/file-url";

export function AudioBlock({ block }: { block: AudioBlockObjectResponse }) {
  const v = block.audio;
  const src = extractFileUrl(v);
  if (!src) return null;

  return (
    <div className="my-4">
      <audio controls src={src} className="w-full" />
    </div>
  );
}
