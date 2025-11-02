"use client";
//노션 데이터를 받아 shadcn의 Code Block 컴포넌트로 반환하는 CodeBlock 컴포넌트
import type { BundledLanguage } from "@/components/ui/shadcn-io/code-block";
import {
  CodeBlock as ShadcnCodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/shadcn-io/code-block";

interface CodeBlockProps {
  code: string;
  language: string;
  id?: string;
}

export function CodeBlock({ code, language, id }: CodeBlockProps) {
  // 노션의 language를 shadcn CodeBlock의 BundledLanguage 형식으로 변환
  const normalizedLanguage = (
    language || "plaintext"
  ).toLowerCase() as BundledLanguage;

  // shadcn CodeBlock의 data 형식에 맞게 변환
  const codeData = [
    {
      filename: "예시",
      language: normalizedLanguage,
      code: code,
    },
  ];

  return (
    <div className="my-6">
      <ShadcnCodeBlock data={codeData} defaultValue={normalizedLanguage}>
        <CodeBlockHeader>
          <div className="flex-1 text-sm font-mono text-gray-300">
            {language || "plaintext"}
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
