import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type NotionRichText = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
};

type NotionTableProps = {
  id: string;
  block: any;
  renderRichText: (
    richTextArray: NotionRichText[] | undefined
  ) => React.ReactNode[];
};

export function NotionTable({ id, block, renderRichText }: NotionTableProps) {
  const value = block.table;
  const tableRows = block.children || [];
  const hasColumnHeader = value?.has_column_header || false;
  const hasRowHeader = value?.has_row_header || false;

  if (tableRows.length === 0) return null;

  return (
    <div className="my-6">
      <Table>
        {hasColumnHeader && tableRows.length > 0 && (
          <TableHeader>
            <TableRow>
              {tableRows[0].table_row?.cells?.map(
                (cell: any[], cellIdx: number) => (
                  <TableHead key={cellIdx}>{renderRichText(cell)}</TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {tableRows
            .slice(hasColumnHeader ? 1 : 0)
            .map((row: any, rowIdx: number) => {
              const cells = row.table_row?.cells || [];
              return (
                <TableRow key={row.id || rowIdx}>
                  {cells.map((cell: any[], cellIdx: number) => {
                    // 첫 번째 열이 행 헤더인 경우
                    if (hasRowHeader && cellIdx === 0) {
                      return (
                        <TableHead key={cellIdx}>
                          {renderRichText(cell)}
                        </TableHead>
                      );
                    }
                    return (
                      <TableCell key={cellIdx}>
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
