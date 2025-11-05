// components/notion/blocks/ToggleBlock.tsx
"use client";

import React from "react";
import type { ToggleBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";
import { Toggle } from "@/components/Toggle";

type Props = {
  block: ToggleBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function ToggleBlock({ block, childrenNodes }: Props) {
  const v = block.toggle;
  return (
    <Toggle id={block.id} summary={renderRichText(v.rich_text)}>
      {childrenNodes}
    </Toggle>
  );
}
