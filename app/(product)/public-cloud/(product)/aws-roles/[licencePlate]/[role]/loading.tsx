import TableRowSkeleton from '@/components/table/TableRowSkeleton';
import TableAWSRoles from '@/components/table/TableAWSRoles';

export default async function ProductsTableSkeleton() {
  return (
    <TableAWSRoles
      tableBody={[...new Array(14)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
      total={10}
      groupId={''}
      currentPage={1}
      pageSize={10}
    />
  );
}
