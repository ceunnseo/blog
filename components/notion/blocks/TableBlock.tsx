// components/notion/blocks/TableBlock.tsx
"use client";

import React from "react";
import type {
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
  BlockObjectResponse,
  BlockWithChildren,
} from "@/components/notion/types";
import { renderRichText } from "@/components/notion/utils/rich-text";
import { isFullBlock } from "@/components/notion/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  block: TableBlockObjectResponse & { children?: BlockWithChildren[] };
  childrenNodes?: React.ReactNode[]; // table_row가 children으로 들어온 상태
};

// 배경색 들어간 셀을 포함하면 colored로 판단 (휴리스틱)
function isColoredRow(row: TableRowBlockObjectResponse): boolean {
  return row.table_row.cells.some((cell) =>
    cell.some((rt) =>
      (rt.annotations?.color ?? "default").endsWith("_background")
    )
  );
}

export function TableBlock({ block }: Props) {
  const v = block.table;

  const rows = (block.children ?? []).filter(
    (b): b is BlockObjectResponse & TableRowBlockObjectResponse =>
      isFullBlock(b) && b.type === "table_row"
  );

  if (rows.length === 0) return null;

  const hasColumnHeader = v.has_column_header;
  const hasRowHeader = v.has_row_header;

  // 연속된 컬러 행을 헤더로 간주(옵션). 공식 플래그가 있으면 그걸 우선.
  let headerRowCount = 0;
  if (!hasColumnHeader) {
    for (let i = 0; i < rows.length; i++) {
      if (isColoredRow(rows[i])) headerRowCount++;
      else break;
    }
  }
  const finalHeaderCount = hasColumnHeader ? 1 : headerRowCount;

  return (
    <div className="my-6">
      <Table>
        {finalHeaderCount > 0 && (
          <TableHeader>
            {rows.slice(0, finalHeaderCount).map((row) => (
              <TableRow key={row.id}>
                {row.table_row.cells.map((cell, idx) => (
                  <TableHead key={`${row.id}-${idx}`}>
                    {renderRichText(cell)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {rows.slice(finalHeaderCount).map((row) => {
            const cells = row.table_row.cells;
            const rowIsColored = isColoredRow(row);

            return (
              <TableRow key={row.id}>
                {cells.map((cell, cellIdx) => {
                  const asHeader =
                    (hasRowHeader && cellIdx === 0) || rowIsColored;
                  return asHeader ? (
                    <TableHead key={`${row.id}-${cellIdx}`}>
                      {renderRichText(cell)}
                    </TableHead>
                  ) : (
                    <TableCell key={`${row.id}-${cellIdx}`}>
                      {renderRichText(cell)}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
