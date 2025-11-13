//노션의 토글 컴포넌트
"use client";

import React, { useState } from "react";
import type { ToggleBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
  block: ToggleBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
  defaultOpen?: boolean;
};

export function ToggleBlock({
  block,
  childrenNodes,
  defaultOpen = false,
}: Props) {
  const v = block.toggle;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      key={block.id}
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger
        className="w-full flex items-center gap-2 p-3 font-medium hover:bg-lavender-800 dark:hover:bg-lavender-950/20 transition-colors group"
        aria-controls={`${block.id}-content`}
        aria-expanded={isOpen}
      >
        <svg
          className={`w-4 h-4 text-lavender-600 dark:text-lavender-400 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="flex-1 text-left">
          {renderRichText(v.rich_text ?? [])}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent
        id={`${block.id}-content`}
        className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800"
      >
        {childrenNodes}
      </CollapsibleContent>
    </Collapsible>
  );
}
