// components/notion/blocks/ParagraphBlock.tsx
"use client";

import React from "react";
import type {
  ParagraphBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
} from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";

type Paragraphish =
  | ParagraphBlockObjectResponse
  | BulletedListItemBlockObjectResponse
  | NumberedListItemBlockObjectResponse;

type Props = {
  block: Paragraphish;
  childrenNodes?: React.ReactNode[];
  /** 라우터에서 강제 지정 (옵션) */
  asListItem?: "ul" | "ol";
};

export function ParagraphBlock({ block, childrenNodes, asListItem }: Props) {
  // 타입 안전하게 rich_text 뽑기
  const richText =
    block.type === "paragraph"
      ? block.paragraph.rich_text
      : block.type === "bulleted_list_item"
      ? block.bulleted_list_item.rich_text
      : block.numbered_list_item.rich_text;
  console.log("block", block);

  // 리스트로 렌더해야 하는가?
  const isList =
    asListItem !== undefined ||
    block.type === "bulleted_list_item" ||
    block.type === "numbered_list_item";

  if (isList) {
    // 라우터에서 asListItem을 넘기면 그대로 사용하고, 아니면 타입으로 판정
    const isUl = asListItem
      ? asListItem === "ul"
      : block.type === "bulleted_list_item";
    const Wrapper = isUl ? "ul" : "ol";
    return (
      <li className={isUl ? "ml-6 mb-2 list-disc" : "ml-6 mb-2 list-decimal"}>
        {renderRichText(richText)}
        {childrenNodes?.length ? (
          <Wrapper className="mt-2">{childrenNodes}</Wrapper>
        ) : null}
      </li>
    );
  }

  // 일반 문단
  return (
    <div>
      <p className="mb-4 leading-7">{renderRichText(richText)}</p>
      {childrenNodes?.length ? (
        <div className="ml-6">{childrenNodes}</div>
      ) : null}
    </div>
  );
}
