'use client';

import PagninationButtons from '@/components/buttons/PaginationButtons';
import UserAWSRolesTableTop from '@/components/table/TableTopUserAWSRoles';
export default function TableAWSRoles({
  currentPage,
  pageSize,
  total,
  tableBody,
  groupId,
}: {
  currentPage: number;
  pageSize: number;
  total: number;
  tableBody: React.ReactNode;
  groupId: string;
}) {
  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <UserAWSRolesTableTop
        title="BC Gov’s Landing Zone in AWS - Manage Users"
        subtitle="User Access"
        description="Assign roles to grant users access below"
        groupId={groupId}
      />
      <div className="h-max overflow-y-auto scroll-smooth">{tableBody}</div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          {total == 0 ? (
            <p className="text-sm text-gray-700">Showing 0 to 0 of 0 results</p>
          ) : (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (currentPage - 1) + 1}</span> to{' '}
              <span>{total < pageSize * currentPage ? total : pageSize * currentPage}</span> of <span>{total}</span>{' '}
              results
            </p>
          )}
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <div>
            <PagninationButtons pageCount={total / pageSize} page={currentPage} pageSize={pageSize} />
          </div>
        </div>
      </nav>
    </div>
  );
}
