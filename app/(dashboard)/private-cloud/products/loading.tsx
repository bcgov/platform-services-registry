import TableRow from "@/components/table/TableRowSkeleton";
import Table from "@/components/table/Table";

export default async function Page() {
  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={[...new Array(10)].map((_) => (
        <TableRow />
      ))}
      total={10}
      currentPage={1}
      pageSize={10}
    />
  );
}
