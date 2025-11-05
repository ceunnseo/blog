// components/notion/blocks/CodeBlock.tsx
"use client";

import React from "react";
import type { CodeBlockObjectResponse } from "@/components/notion/types";
import { getPlainText } from "@/components/notion/utils/rich-text";
import { CodeBlock as UIBlock } from "@/components/CodeBlock";

export function CodeBlockRenderer({
  block,
}: {
  block: CodeBlockObjectResponse;
}) {
  const v = block.code;
  const code = getPlainText(v.rich_text);
  const language = v.language ?? "plaintext";

  return <UIBlock id={block.id} code={code} language={language} />;
}
