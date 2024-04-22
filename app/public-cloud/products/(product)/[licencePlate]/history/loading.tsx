import TableRowSkeleton from '@/components/table/TableRowSkeleton';
import Table from '@/components/table/Table';

export default async function RequestsTableSkeleton() {
  return (
    <Table
      title="Request history for"
      description="These are the submitted requests for the Public Cloud OpenShift platform"
      tableBody={[...new Array(14)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
      total={10}
      currentPage={1}
      pageSize={10}
    />
  );
}
