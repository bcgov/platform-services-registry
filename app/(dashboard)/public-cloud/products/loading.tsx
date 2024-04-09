import TableRowSkeleton from '@/components/table/TableRowSkeleton';
import Table from '@/components/table/Table';

export default function ProductsTableSkeleton() {
  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={[...new Array(14)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
      total={10}
      currentPage={1}
      pageSize={10}
    />
  );
}
