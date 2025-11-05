// components/notion/blocks/index.tsx
import React from "react";
import type {
  BlockWithChildren,
  BlockObjectResponse,
  ParagraphBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  QuoteBlockObjectResponse,
  CalloutBlockObjectResponse,
  CodeBlockObjectResponse,
  ImageBlockObjectResponse,
  VideoBlockObjectResponse,
  AudioBlockObjectResponse,
  PdfBlockObjectResponse,
  FileBlockObjectResponse,
  EmbedBlockObjectResponse,
  LinkPreviewBlockObjectResponse,
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
  ToggleBlockObjectResponse,
  ToDoBlockObjectResponse,
  ChildPageBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  ColumnListBlockObjectResponse,
  ColumnBlockObjectResponse,
  TableOfContentsBlockObjectResponse,
} from "@/components/notion/types";
import { isFullBlock, assertNever } from "@/components/notion/types";
import { ParagraphBlock } from "./ParagraphBlock";
import { HeadingBlock } from "./HeadingBlock";
import { ToggleBlock } from "./ToggleBlock";
import { TodoBlock } from "./TodoBlock";
import { QuoteBlock } from "./QuoteBlock";
import { CalloutBlock } from "./CalloutBlock";
import { CodeBlockRenderer } from "./CodeBlock";
import { ImageBlock } from "./ImageBlock";
import { VideoBlock } from "./VideoBlock";
import { AudioBlock } from "./AudioBlock";
import { PdfBlock } from "./PdfBlock";
import { FileBlock as FileBlockComp } from "./FileBlock";
import { EmbedBlock } from "./EmbedBlock";
import { LinkPreviewBlock } from "./LinkPreviewBlock";
import { TableBlock } from "./TableBlock";
import { ChildPageBlock } from "./ChildPageBlock";
import { ChildDatabaseBlock } from "./ChildDatabaseBlock";
import { ColumnListBlock } from "./ColumnListBlock";
import { ColumnBlock } from "./ColumnBlock";
import { TableOfContentsBlock } from "./TableOfContentsBlock";

// 자식 블록들을 재귀 렌더링하여 넘겨주기 위한 헬퍼
function renderChildren(block: BlockWithChildren): React.ReactNode[] {
  if (!("children" in block) || !block.children || block.children.length === 0)
    return [];
  return block.children.map((child, idx) => renderBlock(child, idx));
}

export function renderBlock(
  block: BlockWithChildren,
  index?: number
): React.ReactNode {
  if (!isFullBlock(block)) return null; // partial block은 스킵
  const childrenNodes = renderChildren(block);

  switch (block.type) {
    case "paragraph":
      return (
        <ParagraphBlock
          key={block.id}
          block={block as ParagraphBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "heading_1":
    case "heading_2":
    case "heading_3":
      return (
        <HeadingBlock
          key={block.id}
          block={
            block as
              | Heading1BlockObjectResponse
              | Heading2BlockObjectResponse
              | Heading3BlockObjectResponse
          }
          childrenNodes={childrenNodes}
        />
      );

    case "bulleted_list_item":
    case "numbered_list_item":
      // 리스트 그룹화는 utils/listGrouping에서 처리하고,
      // 여기서는 각각의 <li>만 렌더하는 컴포넌트를 둬도 됨.
      // 우선 단순화: ParagraphBlock처럼 렌더하거나, 전용 ListItemBlock을 분리해도 OK.
      // 필요 시 별도 ListItemBlock.tsx로 분리하세요.
      return (
        <ParagraphBlock
          key={block.id}
          block={block as ParagraphBlockObjectResponse}
          asListItem={block.type === "bulleted_list_item" ? "ul" : "ol"}
          childrenNodes={childrenNodes}
        />
      );

    case "toggle":
      return (
        <ToggleBlock
          key={block.id}
          block={block as ToggleBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "to_do":
      return (
        <TodoBlock key={block.id} block={block as ToDoBlockObjectResponse} />
      );

    case "quote":
      return (
        <QuoteBlock
          key={block.id}
          block={block as QuoteBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "callout":
      return (
        <CalloutBlock
          key={block.id}
          block={block as CalloutBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "code":
      return (
        <CodeBlockRenderer
          key={block.id}
          block={block as CodeBlockObjectResponse}
        />
      );

    case "image":
      return (
        <ImageBlock key={block.id} block={block as ImageBlockObjectResponse} />
      );

    case "video":
      return (
        <VideoBlock key={block.id} block={block as VideoBlockObjectResponse} />
      );

    case "audio":
      return (
        <AudioBlock key={block.id} block={block as AudioBlockObjectResponse} />
      );

    case "pdf":
      return (
        <PdfBlock key={block.id} block={block as PdfBlockObjectResponse} />
      );

    case "file":
      return (
        <FileBlockComp
          key={block.id}
          block={block as FileBlockObjectResponse}
        />
      );

    case "embed":
      return (
        <EmbedBlock key={block.id} block={block as EmbedBlockObjectResponse} />
      );

    case "link_preview":
      return (
        <LinkPreviewBlock
          key={block.id}
          block={block as LinkPreviewBlockObjectResponse}
        />
      );

    case "table":
      return (
        <TableBlock
          key={block.id}
          block={block as TableBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "table_row":
      // table_row는 TableBlock 내부에서 처리
      return null;

    case "child_page":
      return (
        <ChildPageBlock
          key={block.id}
          block={block as ChildPageBlockObjectResponse}
        />
      );

    case "child_database":
      return (
        <ChildDatabaseBlock
          key={block.id}
          block={block as ChildDatabaseBlockObjectResponse}
        />
      );

    case "column_list":
      return (
        <ColumnListBlock
          key={block.id}
          block={block as ColumnListBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "column":
      return (
        <ColumnBlock
          key={block.id}
          block={block as ColumnBlockObjectResponse}
          childrenNodes={childrenNodes}
        />
      );

    case "table_of_contents":
      return (
        <TableOfContentsBlock
          key={block.id}
          block={block as TableOfContentsBlockObjectResponse}
        />
      );
    case "divider":
      // DividerBlockObjectResponse 타입을 원하면 import해서 명시해도 됩니다.
      return <hr key={block.id} className="my-6 border-t border-gray-200" />;

    default:
      assertNever(block.type as never);
      return null;
  }
}
