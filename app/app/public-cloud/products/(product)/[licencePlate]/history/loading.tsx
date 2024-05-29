import Table from '@/components/generic/table/Table';
import TableRowSkeleton from '@/components/table/TableRowSkeleton';

export default async function RequestsTableSkeleton() {
  return (
    <Table
      title="Request history for"
      description="These are the submitted requests for the Public Cloud OpenShift platform"
      totalCount={10}
      page={1}
      pageSize={10}
    >
      {[...new Array(14)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </Table>
  );
}
