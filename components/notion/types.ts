//컴포넌트 타입 정의

import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  ImageBlockObjectResponse,
  VideoBlockObjectResponse,
  AudioBlockObjectResponse,
  PdfBlockObjectResponse,
  FileBlockObjectResponse,
} from "@notionhq/client";

export type {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
  ParagraphBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
  QuoteBlockObjectResponse,
  CalloutBlockObjectResponse,
  CodeBlockObjectResponse,
  DividerBlockObjectResponse,
  ImageBlockObjectResponse,
  VideoBlockObjectResponse,
  AudioBlockObjectResponse,
  PdfBlockObjectResponse,
  FileBlockObjectResponse,
  EmbedBlockObjectResponse,
  LinkPreviewBlockObjectResponse,
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
  SyncedBlockBlockObjectResponse,
  ChildPageBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  ColumnListBlockObjectResponse,
  ColumnBlockObjectResponse,
  TableOfContentsBlockObjectResponse,
} from "@notionhq/client";

//페이지 컴포넌트에 전달되는 props (Promise 또는 객체)
export type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

//블록 트리 렌더링을 위한 재귀 타입
export type BlockWithChildren =
  | (BlockObjectResponse & { children?: BlockWithChildren[] })
  | (PartialBlockObjectResponse & { children?: BlockWithChildren[] });

//노션 페이지에서 파일/미디어 계열 블록의 값 부분만 모은 타입
export type NotionFileLike =
  | ImageBlockObjectResponse["image"]
  | VideoBlockObjectResponse["video"]
  | AudioBlockObjectResponse["audio"]
  | PdfBlockObjectResponse["pdf"]
  | FileBlockObjectResponse["file"]
  | undefined;

//블록 타입을 partial/full로 구분하여 타입 가드
export const isFullBlock = (
  b: BlockWithChildren
): b is BlockObjectResponse & { children?: BlockWithChildren[] } => {
  return (
    (b as BlockObjectResponse).object === "block" &&
    "id" in b &&
    "type" in b &&
    "has_children" in (b as BlockObjectResponse) &&
    "archived" in (b as BlockObjectResponse)
  );
};

//블록 타입 분기 누락 시 에러 감지
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
