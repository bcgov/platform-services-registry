import TableRowSkeleton from "@/components/table/TableRowSkeleton";
import Table from "@/components/table/Table";

export default async function RequestsTableSkeleton() {
  return (
    <Table
      title="Requests for Private Cloud OpenShift Platform"
      description="These are the submitted requests for the Private Cloud OpenShift platform"
      tableBody={[...new Array(10)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
      total={10}
      currentPage={1}
      pageSize={10}
    />
  );
}
