//제목
import React from "react";
import type {
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
} from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";

type Props = {
  block:
    | Heading1BlockObjectResponse
    | Heading2BlockObjectResponse
    | Heading3BlockObjectResponse;
  childrenNodes?: React.ReactNode[];
};

export function HeadingBlock({ block, childrenNodes }: Props) {
  switch (block.type) {
    case "heading_1": {
      const v = block.heading_1;
      return (
        <div>
          <h1 className="text-3xl font-bold mb-4 mt-8">
            {renderRichText(v.rich_text)}
          </h1>
          {childrenNodes && childrenNodes.length > 0 && (
            <div className="ml-6">{childrenNodes}</div>
          )}
        </div>
      );
    }
    case "heading_2": {
      const v = block.heading_2;
      return (
        <div>
          <h2 className="text-2xl font-bold mb-3 mt-6">
            {renderRichText(v.rich_text)}
          </h2>
          {childrenNodes && childrenNodes.length > 0 && (
            <div className="ml-6">{childrenNodes}</div>
          )}
        </div>
      );
    }
    case "heading_3": {
      const v = block.heading_3;
      return (
        <div>
          <h3 className="text-xl font-semibold mb-2 mt-4">
            {renderRichText(v.rich_text)}
          </h3>
          {childrenNodes && childrenNodes.length > 0 && (
            <div className="ml-6">{childrenNodes}</div>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}
