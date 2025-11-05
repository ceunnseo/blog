// components/notion/blocks/CalloutBlock.tsx
"use client";

import React from "react";
import type { CalloutBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";
import { Callout } from "@/components/Callout";

type Props = {
  block: CalloutBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function CalloutBlock({ block, childrenNodes }: Props) {
  const v = block.callout;
  const icon = v.icon?.type === "emoji" ? v.icon.emoji : "💡";

  return (
    <Callout id={block.id} icon={icon ?? "💡"}>
      <div className="space-y-2">
        {v.rich_text?.length ? <div>{renderRichText(v.rich_text)}</div> : null}
        {childrenNodes}
      </div>
    </Callout>
  );
}
