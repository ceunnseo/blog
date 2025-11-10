// 노션에 작성한 코드 블록
import React from "react";
import {
  codeToHtml,
  type BundledLanguage,
} from "shiki";
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import type { CodeBlockObjectResponse } from "@/components/notion/types";
import { getPlainText } from "@/components/notion/utils/rich-text";
import { CodeBlockCopyButton } from "@/components/ui/shadcn-io/code-block/copy-button";
import { cn } from "@/lib/utils";

const codeBlockClassName = cn(
  "mt-0 bg-background text-sm rounded-md border overflow-hidden",
  "[&_pre]:py-4",
  "[&_.shiki]:!bg-[var(--shiki-bg)]",
  "[&_code]:w-full",
  "[&_code]:grid",
  "[&_code]:overflow-x-auto",
  "[&_code]:bg-transparent",
  "[&_.line]:px-4",
  "[&_.line]:w-full",
  "[&_.line]:relative",
  // Line numbers
  "[&_code]:[counter-reset:line]",
  "[&_code]:[counter-increment:line_0]",
  "[&_.line]:before:content-[counter(line)]",
  "[&_.line]:before:inline-block",
  "[&_.line]:before:[counter-increment:line]",
  "[&_.line]:before:w-4",
  "[&_.line]:before:mr-4",
  "[&_.line]:before:text-[13px]",
  "[&_.line]:before:text-right",
  "[&_.line]:before:text-muted-foreground/50",
  "[&_.line]:before:font-mono",
  "[&_.line]:before:select-none",
  // Dark mode
  "dark:[&_.shiki]:!text-[var(--shiki-dark)]",
  "dark:[&_.shiki]:!bg-[var(--shiki-dark-bg)]",
  "dark:[&_.shiki_span]:!text-[var(--shiki-dark)]",
  // Line highlight
  "[&_.line.highlighted]:bg-blue-50",
  "[&_.line.highlighted]:after:bg-blue-500",
  "[&_.line.highlighted]:after:absolute",
  "[&_.line.highlighted]:after:left-0",
  "[&_.line.highlighted]:after:top-0",
  "[&_.line.highlighted]:after:bottom-0",
  "[&_.line.highlighted]:after:w-0.5",
  "dark:[&_.line.highlighted]:!bg-blue-500/10",
  // Diff
  "[&_.line.diff]:after:absolute",
  "[&_.line.diff]:after:left-0",
  "[&_.line.diff]:after:top-0",
  "[&_.line.diff]:after:bottom-0",
  "[&_.line.diff]:after:w-0.5",
  "[&_.line.diff.add]:bg-emerald-50",
  "[&_.line.diff.add]:after:bg-emerald-500",
  "[&_.line.diff.remove]:bg-rose-50",
  "[&_.line.diff.remove]:after:bg-rose-500",
  "dark:[&_.line.diff.add]:!bg-emerald-500/10",
  "dark:[&_.line.diff.remove]:!bg-rose-500/10",
  // Focus
  "[&_code:has(.focused)_.line]:blur-[2px]",
  "[&_code:has(.focused)_.line.focused]:blur-none",
  // Word highlight
  "[&_.highlighted-word]:bg-blue-50",
  "dark:[&_.highlighted-word]:!bg-blue-500/10"
);

export async function CodeBlockRenderer({
  block,
}: {
  block: CodeBlockObjectResponse;
}) {
  const v = block.code;
  const code = getPlainText(v.rich_text);
  const languageRaw = v.language ?? "plaintext";

  // 노션 언어를 Shiki BundledLanguage로 정규화
  const normalizedLanguage = (() => {
    const lang = (languageRaw || "plaintext").toLowerCase();
    if (lang === "plain text" || lang === "text") return "plaintext";
    return lang as BundledLanguage;
  })();

  // 서버에서 코드 하이라이팅
  const html = await codeToHtml(code, {
    lang: normalizedLanguage,
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
    transformers: [
      transformerNotationDiff({ matchAlgorithm: "v3" }),
      transformerNotationHighlight({ matchAlgorithm: "v3" }),
      transformerNotationWordHighlight({ matchAlgorithm: "v3" }),
      transformerNotationFocus({ matchAlgorithm: "v3" }),
      transformerNotationErrorLevel({ matchAlgorithm: "v3" }),
    ],
  });

  return (
    <div className="my-6">
      <div className="rounded-md border overflow-hidden">
        {/* Header */}
        <div className="flex flex-row items-center border-b bg-secondary p-1">
          <div className="flex-1 text-sm font-mono text-muted-foreground px-3">
            {languageRaw || "plaintext"}
          </div>
          <CodeBlockCopyButton code={code} />
        </div>

        {/* Code content */}
        <div
          className={codeBlockClassName}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
