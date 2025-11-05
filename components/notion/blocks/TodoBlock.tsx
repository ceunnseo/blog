// components/notion/blocks/TodoBlock.tsx
"use client";

import React from "react";
import type { ToDoBlockObjectResponse } from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";
import { Todo } from "@/components/Todo";

export function TodoBlock({ block }: { block: ToDoBlockObjectResponse }) {
  const v = block.to_do;
  return (
    <Todo id={block.id} checked={Boolean(v.checked)}>
      {renderRichText(v.rich_text)}
    </Todo>
  );
}
