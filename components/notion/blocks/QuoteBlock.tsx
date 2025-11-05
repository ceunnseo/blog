// components/notion/blocks/QuoteBlock.tsx
"use client";

import React from "react";
import type { QuoteBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";

type Props = {
  block: QuoteBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function QuoteBlock({ block, childrenNodes }: Props) {
  const v = block.quote;
  return (
    <div>
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-100 my-4">
        {renderRichText(v.rich_text)}
      </blockquote>
      {childrenNodes?.length ? (
        <div className="ml-6">{childrenNodes}</div>
      ) : null}
    </div>
  );
}
