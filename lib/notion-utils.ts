//타입 가드, 유틸리티 함수
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";

//데이터베이스에 저장된 페이지의 속성 타입만 따로 빼서 새로운 타입으로 지정
export type Properties = PageObjectResponse["properties"];

//페이지 내의 제목을 추출하는 함수
export const getTitle = (p: Properties): string => {
  const titleProperty = p["이름"];
  if (!titleProperty || titleProperty.type !== "title") return "(untitled)";

  return titleProperty.title[0]?.plain_text ?? "(untitled)";
};
