"use client";
// 노션의 체크박스 (할 일)
import React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import type { ToDoBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";

type Props = {
  block: ToDoBlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function TodoBlock({ block, childrenNodes }: Props) {
  const v = block.to_do;
  const checked = Boolean(v.checked);
  const hasChildren = Array.isArray(childrenNodes) && childrenNodes.length > 0;

  return (
    <div className="mb-2" role="group" aria-labelledby={block.id}>
      <label
        htmlFor={block.id}
        className="group mb-2 flex cursor-default select-none items-start gap-3"
      >
        <Checkbox.Root
          id={block.id}
          checked={checked}
          disabled // 노션 뷰어: 상호작용 비활성
          tabIndex={-1}
          className={[
            "mt-1 inline-flex h-4 w-4 items-center justify-center rounded",
            "border border-lavender-300",
            "data-[state=checked]:bg-lavender-500 data-[state=checked]:border-lavender-500",
            "pointer-events-none", // 마우스/터치 무시
            "outline-none",
          ].join(" ")}
        >
          <Checkbox.Indicator
            className="leading-none text-white text-xs"
            aria-hidden
          >
            ✓
          </Checkbox.Indicator>
        </Checkbox.Root>

        <span
          className={
            checked
              ? "line-through text-gray-500"
              : "text-gray-700 dark:text-gray-200"
          }
        >
          {renderRichText(v.rich_text ?? [])}
        </span>
      </label>

      {hasChildren && (
        <div className="ml-6 mt-1 space-y-1">{childrenNodes}</div>
      )}
    </div>
  );
}
