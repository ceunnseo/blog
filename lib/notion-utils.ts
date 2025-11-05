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

//페이지 내의 날짜를 추출하는 함수
export const getDateISO = (p: Properties): string => {
  const dateProperty = p["날짜"];
  if (!dateProperty || dateProperty.type !== "date") return "(undefined)";
  return dateProperty.date?.start ?? "(undefined)";
};

//페이지 내에 날짜를 YYYY.MM.DD 포맷으로 보여주는 함수
export const toDisplayDate = (iso?: string): string => {
  if (!iso) return "알 수 없음";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "알 수 없음";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};
