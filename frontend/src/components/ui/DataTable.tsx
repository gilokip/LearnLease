import { cn } from "@utils/cn";

export interface Column<T> {
  key:        string;
  header:     string;
  render?:    (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  isLoading?: boolean;
  emptyText?: string;
  rowKey:     (row: T) => string | number;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyText = "No data found.",
  rowKey,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-bodydark2">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
