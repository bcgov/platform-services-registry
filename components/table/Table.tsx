import SearchFilterSort from "@/components/table/SearchFilterSort";
import TableTop from "@/components/table/TableTop";
import PagninationButtons from "@/components/buttons/PaginationButtons";

export default function Table({
  title,
  description,
  currentPage,
  pageSize,
  total,
  tableBody
}: {
  title: string;
  description: string;
  currentPage: number;
  pageSize: number;
  total: number;
  tableBody: React.ReactNode;
}) {
  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <div>
        <TableTop title={title} description={description} />
        <div className="border-b-2 px-4 py-2 w-full">
          <SearchFilterSort />
        </div>
        {tableBody}
      </div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span>{pageSize * (currentPage - 1)}</span> to{" "}
            <span>{pageSize * currentPage}</span> of <span>{total}</span>{" "}
            results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <div>
            <PagninationButtons
              pageCount={total / pageSize}
              page={currentPage}
              pageSize={pageSize}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}
