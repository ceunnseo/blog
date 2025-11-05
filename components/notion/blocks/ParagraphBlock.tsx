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
  asListItem?: "ul" | "ol";
};

export function ParagraphBlock({ block, childrenNodes, asListItem }: Props) {
  // 블록 타입별로 rich_text를 안전하게 꺼내기
  const richText =
    block.type === "paragraph"
      ? block.paragraph.rich_text
      : block.type === "bulleted_list_item"
      ? block.bulleted_list_item.rich_text
      : block.numbered_list_item.rich_text; // numbered_list_item

  // 리스트 아이템으로 렌더링
  if (
    asListItem ||
    block.type === "bulleted_list_item" ||
    block.type === "numbered_list_item"
  ) {
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

  // 일반 문단 렌더링
  return (
    <div>
      <p className="mb-4 leading-7">{renderRichText(richText)}</p>
      {childrenNodes?.length ? (
        <div className="ml-6">{childrenNodes}</div>
      ) : null}
    </div>
  );
}
