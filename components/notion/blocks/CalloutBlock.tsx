"use client";
//노션에서 콜아웃 블록
import React from "react";
import type { CalloutBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";
import { Card } from "@/components/ui/card";

type Props = {
  block: CalloutBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function CalloutBlock({ block, childrenNodes }: Props) {
  const v = block.callout;
  const icon = v.icon?.type === "emoji" ? v.icon.emoji : "💡";
  const hasChildren = Array.isArray(childrenNodes) && childrenNodes.length > 0;

  return (
    <Card className="p-4 my-6" role="note" aria-labelledby={block.id}>
      <div className="flex gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden>
          {icon}
        </span>
        <div className="flex-1 space-y-2" id={block.id}>
          {v.rich_text?.length ? (
            <div>{renderRichText(v.rich_text)}</div>
          ) : null}
          {hasChildren ? childrenNodes : null}
        </div>
      </div>
    </Card>
  );
}
