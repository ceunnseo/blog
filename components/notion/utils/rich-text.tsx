import type { RichTextItemResponse } from "@notionhq/client";

//순수 문자열만 추출하는 getPlainText 함수
export const getPlainText = (
  richTextArray?: RichTextItemResponse[]
): string => {
  if (!richTextArray) return "";
  return richTextArray.map((rt) => rt.plain_text ?? "").join("");
};

//UI로 변환하는 renderRichText 함수
export const renderRichText = (
  richTextArray?: RichTextItemResponse[]
): React.ReactNode => {
  if (!richTextArray || richTextArray.length === 0) return null;

  return (
    <>
      {richTextArray.map((rt, idx) => {
        const text = rt.plain_text ?? "";
        const { annotations, href } = rt;

        let element: React.ReactNode = text;

        // 링크
        if (href) {
          element = (
            <a key={`a-${idx}`} href={href} target="_blank" rel="noreferrer">
              {element}
            </a>
          );
        }

        // 코드 (인라인)
        if (annotations?.code) {
          element = (
            <code
              key={`code-${idx}`}
              className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono"
            >
              {element}
            </code>
          );
        }
        //강조
        if (annotations?.bold) {
          element = (
            <strong key={`b-${idx}`} className="font-bold">
              {element}
            </strong>
          );
        }
        //인텔릭
        if (annotations?.italic) {
          element = (
            <em key={`i-${idx}`} className="italic">
              {element}
            </em>
          );
        }
        //취소선
        if (annotations?.strikethrough) {
          element = (
            <s key={`s-${idx}`} className="line-through">
              {element}
            </s>
          );
        }
        //밑줄
        if (annotations?.underline) {
          element = (
            <u key={`u-${idx}`} className="underline">
              {element}
            </u>
          );
        }
        //글자
        return <span key={rt.plain_text + idx}>{element}</span>;
      })}
    </>
  );
};
