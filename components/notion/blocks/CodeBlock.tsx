// 노션에 작성한 코드 블록
"use client";

import React from "react";
import type { CodeBlockObjectResponse } from "@/components/notion/types";
import { getPlainText } from "@/components/notion/utils/rich-text";

import type { BundledLanguage } from "@/components/ui/shadcn-io/code-block";
import {
  CodeBlock as ShadcnCodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/shadcn-io/code-block";

export function CodeBlockRenderer({
  block,
}: {
  block: CodeBlockObjectResponse;
}) {
  const v = block.code;
  const code = getPlainText(v.rich_text);
  const languageRaw = v.language ?? "plaintext";

  // 노션 언어를 shadcn BundledLanguage로 정규화
  const normalizedLanguage = (
    languageRaw || "plaintext"
  ).toLowerCase() as BundledLanguage;

  // 캡션을 파일명으로 지정
  const caption = getPlainText(v.caption);
  const filename = caption || "snippet";

  const codeData = [
    {
      filename,
      language: normalizedLanguage,
      code,
    },
  ];

  return (
    <div className="my-6">
      <ShadcnCodeBlock data={codeData} defaultValue={normalizedLanguage}>
        <CodeBlockHeader>
          <div className="flex-1 text-sm font-mono text-gray-300">
            {languageRaw || "plaintext"}
          </div>
          <CodeBlockCopyButton />
        </CodeBlockHeader>
        <CodeBlockBody>
          {(item) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent language={item.language}>
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </ShadcnCodeBlock>
    </div>
  );
}
