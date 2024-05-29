import TableAWSRoles from '@/components/table/TableAWSRoles';
import TableRowSkeleton from '@/components/table/TableRowSkeleton';

export default async function ProductsTableSkeleton() {
  return (
    <TableAWSRoles
      tableBody={[...new Array(14)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
      total={10}
      tableTop={<></>}
      currentPage={1}
      pageSize={10}
    />
  );
}
