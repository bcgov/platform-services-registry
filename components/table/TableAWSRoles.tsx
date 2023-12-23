'use client';

import PagninationButtons from '@/components/buttons/PaginationButtons';
import UserAWSRolesTableTop from '@/components/table/TableTopUserAWSRoles';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
import { getGroups } from '@/app/api/public-cloud/aws-roles/routes';
import { usePathname } from 'next/navigation';
//server actions next.js
export default function TableAWSRoles({
  currentPage,
  pageSize,
  total,
  tableBody,
}: {
  currentPage: number;
  pageSize: number;
  total: number;
  tableBody: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <UserAWSRolesTableTop
        title="BC Gov’s Landing Zone in AWS - Manage Users"
        subtitle="User Access"
        description="Assign roles to grant users access below"
      />
      <div className="h-[60vh] overflow-y-auto scroll-smooth">{tableBody}</div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          {total == 0 ? (
            <p className="text-sm text-gray-700">Showing 0 to 0 of 0 results</p>
          ) : total < pageSize * currentPage ? (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (currentPage - 1) + 1}</span> to <span>{total}</span> of <span>{total}</span>{' '}
              results
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (currentPage - 1) + 1}</span> to <span>{pageSize * currentPage}</span> of{' '}
              <span>{total}</span> results
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
