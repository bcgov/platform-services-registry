'use client';

import TableAWSRoles from '@/components/table/TableAWSRoles';

export default function ProductAWSRoles() {
  return (
    <div className="w-full">
      <TableAWSRoles currentPage={5} pageSize={5} total={5} />
    </div>
  );
}
